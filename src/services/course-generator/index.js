import store from '../store/index.js';

// Re-use the exact same template prompt from the lesson builder
const MYAICADEMY_TEMPLATE_PROMPT = `You are a curriculum designer for MyAIcademy creating comprehensive, hands-on workshop presentations. Your output must EXACTLY match our visual design system and template specifications.

## DESIGN SYSTEM - TEAL TRUST THEME

### Color Palette (USE EXACTLY):
- **Primary Teal**: #028090 - Main accent, step numbers, titles, buttons
- **Secondary Teal**: #00A896 - Hover states, secondary elements
- **Accent Green**: #02C39A - Highlights, success states, progress indicators
- **Dark Navy**: #1E2761 - Code boxes, dark backgrounds, headers

### Typography:
- Titles: Bold, 28-36pt, Primary Teal (#028090)
- Subtitles: Regular, 16-18pt, Gray (#6B7280)
- Body: Regular, 12-14pt, Dark Gray (#374151)
- Code/Prompts: Monospace, 11pt, White on Dark Navy

### Visual Elements:
- **Emoji Icons**: Use relevant emojis as visual icons
- **Colored Badges/Pills**: Rounded rectangles with light teal background (#E8F6F5) and teal border
- **Card-Style Layouts**: White cards with subtle shadows on light gray backgrounds
- **Step Number Circles**: Teal circles (#028090) with white numbers

### Interactivity Markers (REQUIRED - use these exact formats):
- 🎯 **HANDS-ON**: Green background (#D4EDDA) - Action items for students to perform
- 💡 **PRO TIP**: Yellow background (#FEF3CD) - Expert insights and shortcuts
- ⭐ **BEST PRACTICE**: Orange background (#FFF3E0) - Industry standards to follow
- 📋 **COPY THIS**: Dark navy box (#1E2761) - Code, prompts, or text to copy
- ⚠️ **WARNING**: Red background (#F8D7DA) - Common mistakes to avoid

## TEMPLATE STRUCTURE (EXACTLY 29 SLIDES):

### SLIDE 1 - Title Slide
{ "type": "title", "header": "[Tool Name]", "content": "[One-line description]", "tags": ["[Category]", "[Skill Level]", "[Duration]"], "visualNote": "Include placeholder for AI robot/mascot image on right side" }

### SLIDE 2 - Workshop Overview
{ "type": "overview", "header": "HANDS-ON WORKSHOP", "projectName": "[What students will build]", "subtitle": "[Brief project description]", "features": [{"icon": "emoji", "title": "...", "desc": "..."}], "specialBoxes": [{"type": "action", "content": "..."}] }

### SLIDES 3-22 - Step-by-Step Instructions (10 main steps, 2 slides each)
Step Instruction Slide:
{ "type": "step", "stepNumber": [1-10], "header": "[Action Title]", "content": "[Instructions]", "features": [{"label": "...", "desc": "..."}], "specialBoxes": [{"type": "prompt|tip|action|warning|bestpractice", "content": "..."}] }

Step Screenshot Slide:
{ "type": "screenshot", "header": "[What screenshot shows]", "screenshotPlaceholder": "[Detailed description]", "callout": "[Key elements explanation]" }

### SLIDE 23 - Advanced Features
{ "type": "advanced", "header": "Level Up Your Skills", "features": [{"title": "...", "desc": "..."}], "specialBoxes": [{"type": "tip", "content": "..."}] }

### SLIDE 24 - Prompting Playbook
{ "type": "tips", "header": "Prompting Playbook", "tips": [{"title": "...", "desc": "..."}] }

### SLIDE 25 - Common Mistakes
{ "type": "mistakes", "header": "Common Mistakes", "mistakes": [{"wrong": "...", "right": "..."}] }

### SLIDE 26 - Inspiration Gallery
{ "type": "inspiration", "header": "What Can You Build?", "ideas": [{"icon": "emoji", "title": "...", "desc": "..."}], "info": "...", "specialBoxes": [{"type": "action", "content": "..."}] }

### SLIDE 27 - Challenge
{ "type": "challenge", "header": "Extend Your Project", "challenges": "bullet list string", "steps": [{"num": "1", "title": "...", "desc": "..."}] }

### SLIDE 28 - Summary
{ "type": "summary", "header": "What You Built Today", "features": [{"title": "...", "desc": "..."}] }

### SLIDE 29 - Closing
{ "type": "closing", "header": "Turn Ideas Into Reality", "cta": "What will you build next?" }

## OUTPUT FORMAT:
Return a JSON object with this EXACT structure:
{ "title": "Lesson title", "slides": [...all 29 slides...], "companionDoc": "Full markdown documentation" }

IMPORTANT:
- Return ONLY valid JSON - no markdown code blocks, no explanation text
- Include ALL 29 slides
- Use the EXACT color scheme and visual markers specified
- Make screenshot placeholders highly detailed for the curriculum team`;

// ============================================
// PHASE 1: Course Architecture Prompt
// ============================================

function buildArchitecturePrompt(reportsByProvider) {
  const providerSections = Object.entries(reportsByProvider).map(([provider, { reports, updates }]) => {
    const reportDetails = reports.map(r => {
      const citationUrls = (r.citations || []).map(c => c.url).join('\n    - ');
      return `  - Severity: ${r.severity} | Action: ${r.recommended_action}
    Rationale: ${r.rationale}
    Affected lessons: ${(r.affected_lessons || []).map(l => l.lesson_title).join(', ') || 'None'}
    Citations: ${citationUrls || 'None'}`;
    }).join('\n');

    const updateDetails = updates.map(u => {
      const docUrls = (u.doc_urls || []).map(d => `${d.label}: ${d.url}`).join('\n    - ');
      return `  - "${u.title}" (${u.published_at || 'recent'})
    Summary: ${u.summary || u.raw_text?.slice(0, 200) || 'N/A'}
    Source: ${u.source_url}
    Docs: ${docUrls || 'None'}`;
    }).join('\n');

    return `### ${provider}
**Impact Reports:**
${reportDetails}

**Underlying Updates:**
${updateDetails}`;
  }).join('\n\n');

  return `You are a senior curriculum architect for MyAIcademy, a professional AI training platform.

Based on the following approved impact reports and their underlying provider updates, design a cohesive course plan.

## Source Material

${providerSections}

## Requirements

Design a course with **3 to 6 lessons** that covers the most important updates across these providers.

For each lesson, provide:
1. **title** - Specific, action-oriented (e.g., "Master Claude's New iOS Workflow Automation" not "Learn About Updates")
2. **provider** - Which AI provider this lesson focuses on
3. **level** - beginner, intermediate, or advanced (bias toward intermediate/advanced — no "what is AI" fluff)
4. **scenario** - A realistic professional scenario the entire lesson is built around (e.g., "A marketing manager needs to create a multi-channel campaign using the new Operator agent")
5. **objectives** - 3-5 specific, measurable learning objectives
6. **keyTopics** - 5-8 specific features/capabilities to cover
7. **difficulty_notes** - What makes this lesson challenging; focus on advanced configs, edge cases, and real-world gotchas

## Course Design Principles
- Every lesson must be built around a **realistic professional scenario** — not abstract theory
- Focus on **platform-specific strengths, limitations, and hidden gotchas**
- Include **competitor comparison context** where relevant (e.g., "Unlike ChatGPT, Claude handles X differently")
- Prioritize **advanced configurations and edge cases** over basic walkthroughs
- Ensure lessons progress in difficulty and build on each other where possible

## Output Format
Return ONLY valid JSON (no markdown blocks, no explanation):
{
  "courseName": "Descriptive course name",
  "courseDescription": "1-2 sentence course summary",
  "track": "everyone",
  "level": "intermediate",
  "lessons": [
    {
      "title": "...",
      "provider": "...",
      "level": "...",
      "scenario": "...",
      "objectives": ["..."],
      "keyTopics": ["..."],
      "difficulty_notes": "..."
    }
  ]
}`;
}

// ============================================
// PHASE 2: Individual Lesson Prompt Overlay
// ============================================

function buildLessonPrompt(lessonPlan, reportsByProvider) {
  // Gather source URLs for this lesson's provider
  const providerData = reportsByProvider[lessonPlan.provider] || {};
  const sourceUrls = [];

  (providerData.updates || []).forEach(u => {
    if (u.source_url) sourceUrls.push(u.source_url);
    (u.doc_urls || []).forEach(d => { if (d.url) sourceUrls.push(d.url); });
  });

  (providerData.reports || []).forEach(r => {
    (r.citations || []).forEach(c => { if (c.url) sourceUrls.push(c.url); });
  });

  const uniqueUrls = [...new Set(sourceUrls)];

  return `Create a complete hands-on workshop lesson for MyAIcademy with the following specifications:

**Lesson Title:** ${lessonPlan.title}
**AI Tool/Provider:** ${lessonPlan.provider}
**Skill Level:** ${lessonPlan.level}
**Target Audience:** Professional learners and AI practitioners
**Learning Objectives:** ${lessonPlan.objectives.join('; ')}
**Professional Scenario:** ${lessonPlan.scenario}
**Key Topics to Cover:** ${lessonPlan.keyTopics.join(', ')}

## STRATEGIC REQUIREMENTS (MANDATORY — these override generic guidelines):

### 1. Scenario-Based Design
The ENTIRE lesson must be built around this scenario: "${lessonPlan.scenario}"
- Slide 2 (overview) must describe the scenario as the project
- Every step (slides 3-22) must advance the scenario — no generic "click here to explore"
- The challenge (slide 27) must extend the scenario with a realistic twist

### 2. Platform Analysis (REQUIRED in at least 2 specialBoxes)
Include boxes analyzing:
- What ${lessonPlan.provider} does BETTER than competitors for this use case
- Known LIMITATIONS or gotchas specific to ${lessonPlan.provider}
- Settings or configurations most users miss

### 3. Best Practices & Warnings (MINIMUM COUNTS)
You MUST include at least:
- 3 specialBoxes with type "bestpractice" across the lesson
- 3 specialBoxes with type "warning" across the lesson
These should cover real pitfalls, not obvious advice.

### 4. Screenshot Instructions (DETAILED)
Every screenshot slide must include ALL of:
- Exact URL or navigation path to reach the screen
- Specific menu/button/tab to click
- Expected UI state (what should be visible, selected, or highlighted)
- What element to circle or annotate
- Why this screenshot matters for verification

### 5. Difficulty Calibration
${lessonPlan.difficulty_notes}
- Skip obvious basics — assume the user has used ${lessonPlan.provider} before
- Focus on the NEW capabilities from recent updates
- Include at least one "edge case" or "advanced configuration" per major step

### 6. Source Material
Base your content on these real documentation URLs:
${uniqueUrls.map(u => `- ${u}`).join('\n')}
Reference specific features, settings, and capabilities from these sources.

IMPORTANT:
- Return ONLY valid JSON. No markdown code blocks, no explanation text — just the JSON object.
- Keep the "companionDoc" field to a BRIEF summary (under 500 words) — the slides contain the full detail.`;
}

// ============================================
// Core Generation Logic
// ============================================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractJSON(text) {
  // First try: direct extraction
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      // JSON was truncated — attempt repair
      return repairTruncatedJSON(match[0]);
    }
  }
  throw new Error('No JSON found in response');
}

function repairTruncatedJSON(jsonStr) {
  // Strategy: truncate to last complete slide object, close arrays/objects
  // Find the last complete slide (ends with }) before truncation
  const slidesMatch = jsonStr.match(/"slides"\s*:\s*\[/);
  if (!slidesMatch) {
    throw new Error('No slides array found in truncated JSON');
  }

  const slidesStart = slidesMatch.index + slidesMatch[0].length;

  // Find all complete slide objects by tracking brace depth
  let depth = 0;
  let lastCompleteSlideEnd = slidesStart;
  let inString = false;
  let escape = false;

  for (let i = slidesStart; i < jsonStr.length; i++) {
    const ch = jsonStr[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        lastCompleteSlideEnd = i + 1;
      }
    }
  }

  if (lastCompleteSlideEnd <= slidesStart) {
    throw new Error('Could not find any complete slide objects in truncated JSON');
  }

  // Rebuild: everything up to the slides array start + complete slides + close out
  const repaired = jsonStr.slice(0, lastCompleteSlideEnd) + '], "companionDoc": "See slides for full content." }';

  console.log(`[course-generator] Repaired truncated JSON (cut at position ${lastCompleteSlideEnd}, original length ${jsonStr.length})`);
  return JSON.parse(repaired);
}

async function callClaude(anthropic, systemOrUser, userContent, maxTokens = 16000) {
  let responseText = '';

  const stream = await anthropic.messages.stream({
    model: 'claude-opus-4-20250514',
    max_tokens: maxTokens,
    messages: [
      {
        role: 'user',
        content: systemOrUser + (userContent ? '\n\n' + userContent : '')
      }
    ]
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      responseText += event.delta.text;
    }
  }

  return responseText;
}

// ============================================
// Exported: generateCourseFromReports
// ============================================

export async function generateCourseFromReports(anthropic, reportIds) {
  // 1. Resolve reports
  let reports;
  if (reportIds === 'all_approved') {
    reports = store.impactReports.findAll({ status: 'approved' });
  } else {
    reports = reportIds.map(id => {
      const report = store.impactReports.findById(id);
      if (!report) throw new Error(`Report not found: ${id}`);
      if (report.status !== 'approved') throw new Error(`Report ${id} is not approved (status: ${report.status})`);
      return report;
    });
  }

  if (reports.length === 0) {
    throw new Error('No approved impact reports found. Approve at least one report before generating a course.');
  }

  // 2. Group reports by provider and fetch underlying updates
  const reportsByProvider = {};
  for (const report of reports) {
    const provider = report.provider;
    if (!reportsByProvider[provider]) {
      reportsByProvider[provider] = { reports: [], updates: [] };
    }
    reportsByProvider[provider].reports.push(report);

    // Fetch the underlying update for each report
    if (report.update_id) {
      const update = store.updates.findById(report.update_id);
      if (update) {
        // Parse doc_urls if stored as string
        if (typeof update.doc_urls === 'string') {
          try { update.doc_urls = JSON.parse(update.doc_urls); } catch { update.doc_urls = []; }
        }
        // Avoid duplicates
        const existingIds = reportsByProvider[provider].updates.map(u => u.id);
        if (!existingIds.includes(update.id)) {
          reportsByProvider[provider].updates.push(update);
        }
      }
    }
  }

  // 3. PHASE 1: Generate course architecture
  console.log('[course-generator] Phase 1: Designing course architecture...');
  const architecturePrompt = buildArchitecturePrompt(reportsByProvider);
  let architectureText = await callClaude(anthropic, architecturePrompt, null, 4096);

  let coursePlan;
  try {
    coursePlan = extractJSON(architectureText);
  } catch (parseError) {
    // Retry once
    console.log('[course-generator] Phase 1 parse failed, retrying...');
    architectureText = await callClaude(anthropic, architecturePrompt, null, 4096);
    coursePlan = extractJSON(architectureText);
  }

  if (!coursePlan.lessons || coursePlan.lessons.length === 0) {
    throw new Error('Course architecture returned no lessons');
  }

  console.log(`[course-generator] Phase 1 complete: "${coursePlan.courseName}" with ${coursePlan.lessons.length} lessons`);

  // 4. PHASE 2: Generate each lesson
  const generatedLessons = [];

  for (let i = 0; i < coursePlan.lessons.length; i++) {
    const lessonPlan = coursePlan.lessons[i];
    console.log(`[course-generator] Phase 2: Generating lesson ${i + 1}/${coursePlan.lessons.length} — "${lessonPlan.title}"`);

    // Rate limit: 2-second delay between calls (skip before first)
    if (i > 0) {
      await delay(2000);
    }

    const lessonUserPrompt = buildLessonPrompt(lessonPlan, reportsByProvider);
    let lessonText = await callClaude(anthropic, MYAICADEMY_TEMPLATE_PROMPT, lessonUserPrompt, 16000);

    let lessonData;
    try {
      lessonData = extractJSON(lessonText);
    } catch (parseError) {
      // Retry once on parse failure
      console.log(`[course-generator] Lesson ${i + 1} parse failed, retrying...`);
      await delay(2000);
      lessonText = await callClaude(anthropic, MYAICADEMY_TEMPLATE_PROMPT, lessonUserPrompt);
      lessonData = extractJSON(lessonText);
    }

    // Add metadata
    lessonData.metadata = {
      generatedAt: new Date().toISOString(),
      provider: lessonPlan.provider,
      level: lessonPlan.level,
      audience: 'Professional learners',
      slideCount: lessonData.slides?.length || 0,
      scenario: lessonPlan.scenario,
      generatedFromCourse: true
    };

    generatedLessons.push({
      plan: lessonPlan,
      data: lessonData
    });

    console.log(`[course-generator] Lesson ${i + 1} complete: ${lessonData.slides?.length || 0} slides`);
  }

  // 5. Store everything in the database
  console.log('[course-generator] Storing course and lessons in database...');

  const storedLessons = [];
  const lessonIds = [];

  for (const { plan, data } of generatedLessons) {
    // Find or use provider
    const providerRecord = store.providers.findByName(plan.provider);

    const lesson = store.lessons.create({
      title: data.title || plan.title,
      provider_id: providerRecord?.id || null,
      provider_name: plan.provider,
      level: plan.level,
      objective: plan.objectives?.join('; ') || data.companionDoc?.slice(0, 200) || '',
      key_topics: plan.keyTopics || [],
      practice_assessment: {
        scenario: plan.scenario,
        slideCount: data.slides?.length || 0,
        generatedFromCourse: true
      }
    });

    storedLessons.push({ lesson, slideData: data });
    lessonIds.push(lesson.id);
  }

  // Create the course
  const course = store.courses.create({
    name: coursePlan.courseName,
    track: coursePlan.track || 'everyone',
    level: coursePlan.level || 'intermediate',
    lesson_ids: lessonIds
  });

  // Populate course_lessons junction table for ordering
  const db = store.getDb();
  if (db) {
    const insertJunction = db.prepare(
      'INSERT OR IGNORE INTO course_lessons (course_id, lesson_id, position) VALUES (?, ?, ?)'
    );
    for (let i = 0; i < lessonIds.length; i++) {
      insertJunction.run(course.id, lessonIds[i], i + 1);
    }
  }

  // 6. Mark reports as done and create audit logs
  for (const report of reports) {
    try {
      store.impactReports.updateStatus(report.id, 'done', 'course-generator');
    } catch {
      // Report may already be in a terminal state
    }

    store.auditLogs.create({
      entity_type: 'impact_report',
      entity_id: report.id,
      action: 'course_generated',
      previous_value: JSON.stringify({ status: report.status }),
      new_value: JSON.stringify({ course_id: course.id, course_name: coursePlan.courseName }),
      actor: 'course-generator'
    });
  }

  // Audit log for the course itself
  store.auditLogs.create({
    entity_type: 'course',
    entity_id: course.id,
    action: 'auto_generated',
    previous_value: null,
    new_value: JSON.stringify({
      name: coursePlan.courseName,
      lessonCount: lessonIds.length,
      reportIds: reports.map(r => r.id)
    }),
    actor: 'course-generator'
  });

  console.log(`[course-generator] Done! Course "${coursePlan.courseName}" with ${lessonIds.length} lessons stored.`);

  // 7. Return full result
  return {
    course: {
      id: course.id,
      name: coursePlan.courseName,
      description: coursePlan.courseDescription,
      track: coursePlan.track || 'everyone',
      level: coursePlan.level || 'intermediate',
      lessonCount: lessonIds.length
    },
    lessons: storedLessons.map(({ lesson, slideData }) => ({
      id: lesson.id,
      title: slideData.title || lesson.title,
      provider: lesson.provider_name,
      level: lesson.level,
      slideCount: slideData.slides?.length || 0,
      slides: slideData.slides,
      companionDoc: slideData.companionDoc,
      metadata: slideData.metadata
    })),
    reportsProcessed: reports.length,
    providersIncluded: Object.keys(reportsByProvider)
  };
}

export default { generateCourseFromReports };
