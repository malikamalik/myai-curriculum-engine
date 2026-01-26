import store from '../store/index.js';
import watcher from '../watcher/index.js';

/**
 * Keywords that indicate different types of updates
 */
const UPDATE_INDICATORS = {
  breaking: ['deprecated', 'removed', 'breaking', 'discontinued', 'end of life', 'shutdown'],
  major_feature: ['new feature', 'introducing', 'announcing', 'launch', 'release', 'now available'],
  enhancement: ['improved', 'enhanced', 'better', 'faster', 'updated', 'upgrade'],
  minor: ['fix', 'patch', 'minor', 'bug fix', 'documentation']
};

/**
 * Provider name mappings for fuzzy matching
 */
const PROVIDER_ALIASES = {
  'ChatGPT': ['chatgpt', 'gpt-4', 'gpt-4o', 'gpt-5', 'openai chat'],
  'Claude': ['claude', 'anthropic', 'claude 3', 'sonnet', 'opus', 'haiku'],
  'Gemini': ['gemini', 'google ai', 'bard', 'gemini pro', 'gemini flash'],
  'Veo': ['veo', 'google veo', 'veo 2', 'veo 3'],
  'MidJourney': ['midjourney', 'mid journey', 'mj'],
  'ElevenLabs': ['elevenlabs', 'eleven labs', '11labs'],
  'n8n': ['n8n', 'nodemation'],
  'Replit': ['replit', 'repl.it'],
  'Sora': ['sora', 'openai sora'],
  'NotebookLM': ['notebooklm', 'notebook lm', 'google notebooklm'],
  'Perplexity': ['perplexity', 'perplexity ai'],
  'Canva': ['canva', 'magic studio'],
  'Lovable': ['lovable', 'lovable.dev'],
  'Julius AI': ['julius', 'julius ai'],
  'Gamma': ['gamma', 'gamma.app'],
  'Google Whisk': ['whisk', 'google whisk']
};

/**
 * Calculate severity based on update content
 */
function calculateSeverity(update) {
  const text = `${update.title} ${update.summary || ''} ${update.raw_text || ''}`.toLowerCase();

  // Check for breaking changes
  if (UPDATE_INDICATORS.breaking.some(kw => text.includes(kw))) {
    return 'critical';
  }

  // Check for major features
  if (UPDATE_INDICATORS.major_feature.some(kw => text.includes(kw))) {
    return 'high';
  }

  // Check for enhancements
  if (UPDATE_INDICATORS.enhancement.some(kw => text.includes(kw))) {
    return 'medium';
  }

  // Check for minor changes
  if (UPDATE_INDICATORS.minor.some(kw => text.includes(kw))) {
    return 'low';
  }

  return 'info';
}

/**
 * Determine recommended action based on severity and content
 */
function determineAction(severity, affectedLessons) {
  if (severity === 'critical') {
    return affectedLessons.length > 0 ? 'update_lesson' : 'update_mapping';
  }

  if (severity === 'high') {
    return affectedLessons.length > 0 ? 'update_lesson' : 'create_lesson';
  }

  if (severity === 'medium' && affectedLessons.length > 0) {
    return 'update_lesson';
  }

  return 'no_action';
}

/**
 * Find lessons affected by an update
 */
function findAffectedLessons(update) {
  const text = `${update.title} ${update.summary || ''} ${update.raw_text || ''}`.toLowerCase();

  // Find which providers are mentioned
  const mentionedProviders = [];
  for (const [provider, aliases] of Object.entries(PROVIDER_ALIASES)) {
    if (aliases.some(alias => text.includes(alias.toLowerCase()))) {
      mentionedProviders.push(provider);
    }
  }

  // Also check direct provider name
  if (update.provider && !mentionedProviders.includes(update.provider)) {
    mentionedProviders.push(update.provider);
  }

  // Find lessons for mentioned providers
  const affectedLessons = [];

  for (const providerName of mentionedProviders) {
    const lessons = store.lessons.findAll({ provider_name: providerName });

    for (const lesson of lessons) {
      // Calculate relevance score based on keyword overlap
      const lessonText = `${lesson.title} ${lesson.objective || ''} ${(lesson.key_topics || []).join(' ')}`.toLowerCase();
      const updateWords = text.split(/\s+/).filter(w => w.length > 3);
      const matchingWords = updateWords.filter(w => lessonText.includes(w));
      const relevanceScore = matchingWords.length / Math.max(updateWords.length, 1);

      if (relevanceScore > 0.1) {
        affectedLessons.push({
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          relevance_score: Math.min(relevanceScore, 1),
          suggested_changes: generateSuggestedChanges(update, lesson)
        });
      }
    }
  }

  // Also do keyword search across all lessons
  const keywordMatches = store.lessons.search(update.provider);
  for (const lesson of keywordMatches) {
    if (!affectedLessons.find(l => l.lesson_id === lesson.id)) {
      affectedLessons.push({
        lesson_id: lesson.id,
        lesson_title: lesson.title,
        relevance_score: 0.3,
        suggested_changes: `Review lesson content for updates related to: ${update.title}`
      });
    }
  }

  // Sort by relevance and limit
  return affectedLessons
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 10);
}

/**
 * Generate suggested changes for a lesson
 */
function generateSuggestedChanges(update, lesson) {
  const severity = calculateSeverity(update);

  if (severity === 'critical') {
    return `URGENT: Review and update "${lesson.title}" - ${update.title} may affect core functionality taught in this lesson.`;
  }

  if (severity === 'high') {
    return `Consider adding new content about "${update.title}" to "${lesson.title}" - this feature should be covered.`;
  }

  if (severity === 'medium') {
    return `Review "${lesson.title}" and consider mentioning: ${update.title}`;
  }

  return `Optional: Check if "${lesson.title}" needs minor updates for: ${update.title}`;
}

/**
 * Find mapping rules that might need updates
 */
function findMappingSuggestions(update) {
  const suggestions = [];
  const text = `${update.title} ${update.summary || ''} ${update.raw_text || ''}`.toLowerCase();

  // Check if update mentions new capabilities that could affect course recommendations
  const newCapabilityKeywords = ['new', 'launch', 'introducing', 'now', 'feature', 'capability'];
  const hasNewCapability = newCapabilityKeywords.some(kw => text.includes(kw));

  if (!hasNewCapability) {
    return suggestions;
  }

  // Check if this affects specific user segments
  const segmentKeywords = {
    'high_school': ['student', 'teen', 'education', 'school', 'learning'],
    'college': ['university', 'college', 'academic', 'research', 'student'],
    'early_career': ['professional', 'workplace', 'enterprise', 'business', 'productivity'],
    'creative': ['creative', 'design', 'art', 'visual', 'content', 'media'],
    'entrepreneur': ['business', 'startup', 'entrepreneur', 'founder', 'company'],
    'everyone': ['everyone', 'consumer', 'personal', 'everyday']
  };

  for (const [track, keywords] of Object.entries(segmentKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      suggestions.push({
        rule_id: null,
        question_id: 'Q4',
        current_value: null,
        suggested_value: `Consider ${track} track for users interested in: ${update.title}`,
        rationale: `Update mentions capabilities relevant to ${track} track users`
      });
    }
  }

  return suggestions.slice(0, 3); // Limit suggestions
}

/**
 * Analyze a single update and generate an impact report
 */
export function analyzeUpdate(update) {
  console.log(`Analyzing update: ${update.title}`);

  // Find affected lessons
  const affectedLessons = findAffectedLessons(update);
  console.log(`  Found ${affectedLessons.length} potentially affected lessons`);

  // Calculate severity
  const severity = calculateSeverity(update);
  console.log(`  Severity: ${severity}`);

  // Determine recommended action
  const recommendedAction = determineAction(severity, affectedLessons);
  console.log(`  Recommended action: ${recommendedAction}`);

  // Find mapping suggestions
  const mappingSuggestions = findMappingSuggestions(update);

  // Generate rationale
  const rationale = generateRationale(update, severity, affectedLessons, mappingSuggestions);

  // Create citations
  const citations = [
    {
      text: update.title,
      url: update.source_url
    }
  ];

  // Create the impact report
  const report = store.impactReports.create({
    update_id: update.id,
    provider: update.provider,
    severity,
    recommended_action: recommendedAction,
    affected_lessons: affectedLessons,
    mapping_suggestions: mappingSuggestions,
    rationale,
    citations
  });

  // Mark update as processed
  store.updates.markProcessed(update.id);

  return report;
}

/**
 * Generate rationale text for the impact report
 */
function generateRationale(update, severity, affectedLessons, mappingSuggestions) {
  const parts = [];

  parts.push(`Update from ${update.provider}: "${update.title}"`);

  if (severity === 'critical') {
    parts.push('This update appears to contain breaking changes or deprecated features that may affect existing lessons.');
  } else if (severity === 'high') {
    parts.push('This update introduces significant new features that should be covered in the curriculum.');
  } else if (severity === 'medium') {
    parts.push('This update contains enhancements that may be worth mentioning in relevant lessons.');
  } else if (severity === 'low') {
    parts.push('This is a minor update that may not require curriculum changes.');
  } else {
    parts.push('This update is informational and likely does not require curriculum changes.');
  }

  if (affectedLessons.length > 0) {
    parts.push(`${affectedLessons.length} lesson(s) may be affected, with the most relevant being "${affectedLessons[0].lesson_title}".`);
  }

  if (mappingSuggestions.length > 0) {
    parts.push('Consider reviewing course mapping rules for potential updates.');
  }

  return parts.join(' ');
}

/**
 * Analyze all unprocessed updates
 */
export async function analyzeAllUnprocessed() {
  console.log('Analyzing unprocessed updates...\n');

  const unprocessed = watcher.getUnprocessedUpdates();
  console.log(`Found ${unprocessed.length} unprocessed updates\n`);

  const reports = [];
  for (const update of unprocessed) {
    const report = analyzeUpdate(update);
    reports.push(report);
  }

  console.log(`\n✓ Generated ${reports.length} impact reports`);
  return reports;
}

/**
 * Get impact report statistics
 */
export function getStats() {
  const reports = store.impactReports.findAll();

  return {
    total: reports.length,
    by_status: {
      new: reports.filter(r => r.status === 'new').length,
      approved: reports.filter(r => r.status === 'approved').length,
      rejected: reports.filter(r => r.status === 'rejected').length,
      assigned: reports.filter(r => r.status === 'assigned').length,
      done: reports.filter(r => r.status === 'done').length
    },
    by_severity: {
      critical: reports.filter(r => r.severity === 'critical').length,
      high: reports.filter(r => r.severity === 'high').length,
      medium: reports.filter(r => r.severity === 'medium').length,
      low: reports.filter(r => r.severity === 'low').length,
      info: reports.filter(r => r.severity === 'info').length
    },
    by_action: {
      update_lesson: reports.filter(r => r.recommended_action === 'update_lesson').length,
      create_lesson: reports.filter(r => r.recommended_action === 'create_lesson').length,
      update_mapping: reports.filter(r => r.recommended_action === 'update_mapping').length,
      no_action: reports.filter(r => r.recommended_action === 'no_action').length
    }
  };
}

export default {
  analyzeUpdate,
  analyzeAllUnprocessed,
  getStats,
  calculateSeverity,
  findAffectedLessons
};
