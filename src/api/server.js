import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import store from '../services/store/index.js';
import watcher from '../services/watcher/index.js';
import analyzer from '../services/analyzer/index.js';
import { generatePowerPoint } from '../services/pptx-generator.js';

// Initialize Anthropic client
const anthropic = new Anthropic();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
store.initDb();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// PROVIDERS
// ============================================

app.get('/api/providers', (req, res) => {
  try {
    const providers = store.providers.findAll();
    res.json({ data: providers, total: providers.length });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.get('/api/providers/:id', (req, res) => {
  try {
    const provider = store.providers.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Provider not found' } });
    }
    res.json({ data: provider });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// ============================================
// LESSONS
// ============================================

app.get('/api/lessons', (req, res) => {
  try {
    const { level, provider_name } = req.query;
    const lessons = store.lessons.findAll({ level, provider_name });
    res.json({ data: lessons, total: lessons.length });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.get('/api/lessons/:id', (req, res) => {
  try {
    const lesson = store.lessons.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Lesson not found' } });
    }
    res.json({ data: lesson });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.get('/api/lessons/search/:keyword', (req, res) => {
  try {
    const lessons = store.lessons.search(req.params.keyword);
    res.json({ data: lessons, total: lessons.length });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// ============================================
// COURSES
// ============================================

app.get('/api/courses', (req, res) => {
  try {
    const { track, level } = req.query;
    const courses = store.courses.findAll({ track, level });
    res.json({ data: courses, total: courses.length });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.get('/api/courses/:id', (req, res) => {
  try {
    const course = store.courses.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Course not found' } });
    }
    res.json({ data: course });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Get lessons for a course in correct order
app.get('/api/courses/:id/lessons', (req, res) => {
  try {
    const course = store.courses.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Course not found' } });
    }
    const lessons = store.courses.getLessonsInOrder(req.params.id);
    res.json({ data: lessons, total: lessons.length, course_name: course.name });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// ============================================
// UPDATES
// ============================================

app.get('/api/updates', (req, res) => {
  try {
    const { provider, processed, limit } = req.query;
    const updates = store.updates.findAll({
      provider,
      processed: processed !== undefined ? processed === 'true' : undefined,
      limit: limit ? parseInt(limit) : undefined
    });
    res.json({ data: updates, total: updates.length });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.get('/api/updates/:id', (req, res) => {
  try {
    const update = store.updates.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Update not found' } });
    }
    res.json({ data: update });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Fetch new updates from providers
app.post('/api/updates/fetch', async (req, res) => {
  try {
    const { simulated = true } = req.body;
    const updates = await watcher.fetchAllUpdates({ useSimulated: simulated });
    res.json({ data: updates, total: updates.length, message: `Fetched ${updates.length} new updates` });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// ============================================
// IMPACT REPORTS
// ============================================

app.get('/api/impact-reports', (req, res) => {
  try {
    const { status, provider, recommended_action } = req.query;
    const reports = store.impactReports.findAll({ status, provider, recommended_action });
    res.json({ data: reports, total: reports.length });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.get('/api/impact-reports/stats', (req, res) => {
  try {
    const stats = analyzer.getStats();
    res.json({ data: stats });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.get('/api/impact-reports/:id', (req, res) => {
  try {
    const report = store.impactReports.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Impact report not found' } });
    }
    res.json({ data: report });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.post('/api/impact-reports/:id/approve', (req, res) => {
  try {
    const { actor = 'anonymous' } = req.body;
    const report = store.impactReports.updateStatus(req.params.id, 'approved', actor);
    res.json({ data: report, message: 'Impact report approved' });
  } catch (error) {
    if (error.message === 'Impact report not found') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: error.message } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.post('/api/impact-reports/:id/reject', (req, res) => {
  try {
    const { actor = 'anonymous' } = req.body;
    const report = store.impactReports.updateStatus(req.params.id, 'rejected', actor);
    res.json({ data: report, message: 'Impact report rejected' });
  } catch (error) {
    if (error.message === 'Impact report not found') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: error.message } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.post('/api/impact-reports/:id/assign', (req, res) => {
  try {
    const { assignee, actor = 'anonymous' } = req.body;
    if (!assignee) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Assignee is required' } });
    }
    const report = store.impactReports.assign(req.params.id, assignee, actor);
    res.json({ data: report, message: `Impact report assigned to ${assignee}` });
  } catch (error) {
    if (error.message === 'Impact report not found') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: error.message } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.post('/api/impact-reports/:id/done', (req, res) => {
  try {
    const { actor = 'anonymous' } = req.body;
    const report = store.impactReports.updateStatus(req.params.id, 'done', actor);
    res.json({ data: report, message: 'Impact report marked as done' });
  } catch (error) {
    if (error.message === 'Impact report not found') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: error.message } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Analyze unprocessed updates
app.post('/api/impact-reports/analyze', async (req, res) => {
  try {
    const reports = await analyzer.analyzeAllUnprocessed();
    res.json({ data: reports, total: reports.length, message: `Generated ${reports.length} impact reports` });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// ============================================
// MAPPING RULES
// ============================================

app.get('/api/mapping-rules', (req, res) => {
  try {
    const { question_id, is_active } = req.query;
    const rules = store.mappingRules.findAll({
      question_id,
      is_active: is_active !== undefined ? is_active === 'true' : undefined
    });
    res.json({ data: rules, total: rules.length });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.get('/api/mapping-rules/:id', (req, res) => {
  try {
    const rule = store.mappingRules.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Mapping rule not found' } });
    }
    res.json({ data: rule });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.put('/api/mapping-rules/:id', (req, res) => {
  try {
    const { actor = 'anonymous', ...updates } = req.body;
    const rule = store.mappingRules.update(req.params.id, updates, actor);
    res.json({ data: rule, message: 'Mapping rule updated (new version created)' });
  } catch (error) {
    if (error.message === 'Mapping rule not found') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: error.message } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.post('/api/mapping-rules', (req, res) => {
  try {
    const rule = store.mappingRules.create(req.body);
    res.status(201).json({ data: rule, message: 'Mapping rule created' });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.get('/api/mapping-rules/history/:questionId/:answerValue', (req, res) => {
  try {
    const history = store.mappingRules.getVersionHistory(req.params.questionId, req.params.answerValue);
    res.json({ data: history, total: history.length });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// ============================================
// AUDIT LOGS
// ============================================

app.get('/api/audit-logs', (req, res) => {
  try {
    const { entity_type, action } = req.query;
    const logs = store.auditLogs.findAll({ entity_type, action });
    res.json({ data: logs, total: logs.length });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.get('/api/audit-logs/:entityType/:entityId', (req, res) => {
  try {
    const logs = store.auditLogs.findByEntity(req.params.entityType, req.params.entityId);
    res.json({ data: logs, total: logs.length });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// ============================================
// DASHBOARD STATS
// ============================================

app.get('/api/dashboard/stats', (req, res) => {
  try {
    const providers = store.providers.findAll();
    const lessons = store.lessons.findAll();
    const courses = store.courses.findAll();
    const mappingRules = store.mappingRules.findAll({ is_active: true });
    const updates = store.updates.findAll();
    const impactStats = analyzer.getStats();

    res.json({
      data: {
        providers: { count: providers.length },
        lessons: {
          count: lessons.length,
          by_level: {
            beginner: lessons.filter(l => l.level === 'beginner').length,
            intermediate: lessons.filter(l => l.level === 'intermediate').length,
            advanced: lessons.filter(l => l.level === 'advanced').length
          }
        },
        courses: { count: courses.length },
        mapping_rules: { count: mappingRules.length },
        updates: {
          count: updates.length,
          unprocessed: updates.filter(u => !u.processed).length
        },
        impact_reports: impactStats
      }
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// ============================================
// LESSON BUILDER - Claude Opus Generation
// ============================================

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
- **Emoji Icons**: Use relevant emojis as visual icons (e.g., 🚀 for launch, 💡 for tips, ⚙️ for settings)
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
{
  "type": "title",
  "header": "[Tool Name]",
  "content": "[One-line description of what the tool does]",
  "tags": ["[Category]", "[Skill Level]", "[Duration]"],
  "visualNote": "Include placeholder for AI robot/mascot image on right side"
}

### SLIDE 2 - Workshop Overview
{
  "type": "overview",
  "header": "HANDS-ON WORKSHOP",
  "projectName": "[What students will build]",
  "subtitle": "[Brief project description with key features]",
  "features": [
    {"icon": "🔐", "title": "[Feature 1]", "desc": "[Brief description]"},
    {"icon": "🗄️", "title": "[Feature 2]", "desc": "[Brief description]"},
    {"icon": "✏️", "title": "[Feature 3]", "desc": "[Brief description]"},
    {"icon": "📱", "title": "[Feature 4]", "desc": "[Brief description]"}
  ],
  "specialBoxes": [{"type": "action", "content": "You'll learn ALL features by building this real project step-by-step"}]
}

### SLIDES 3-22 - Step-by-Step Instructions (10 main steps, 2 slides each)
Each step consists of:

**Step Instruction Slide:**
{
  "type": "step",
  "stepNumber": [1-10],
  "header": "[Action-Oriented Step Title]",
  "content": "[2-4 sentences of clear instructions]",
  "features": [
    {"label": "[Sub-step 1]", "desc": "[Details]"},
    {"label": "[Sub-step 2]", "desc": "[Details]"},
    {"label": "[Sub-step 3]", "desc": "[Details]"}
  ],
  "specialBoxes": [
    {"type": "prompt", "content": "[Exact text/code to copy if applicable]"},
    {"type": "tip", "content": "[Pro tip for this step]"},
    {"type": "action", "content": "[Specific hands-on task]"}
  ]
}

**Step Screenshot Slide:**
{
  "type": "screenshot",
  "header": "[What the screenshot shows]",
  "screenshotPlaceholder": "[Detailed description: what settings to show, what UI elements to capture, what state the app should be in]",
  "callout": "[Purple callout box explaining key elements in the screenshot]"
}

### SLIDE 23 - Advanced Features
{
  "type": "advanced",
  "header": "Level Up Your Skills",
  "features": [
    {"title": "[Advanced Feature 1]", "desc": "[What it enables]"},
    {"title": "[Advanced Feature 2]", "desc": "[What it enables]"},
    {"title": "[Advanced Feature 3]", "desc": "[What it enables]"},
    {"title": "[Advanced Feature 4]", "desc": "[What it enables]"},
    {"title": "[Advanced Feature 5]", "desc": "[What it enables]"}
  ],
  "specialBoxes": [{"type": "tip", "content": "[When to use advanced features]"}]
}

### SLIDE 24 - Prompting Playbook / Pro Tips
{
  "type": "tips",
  "header": "Prompting Playbook",
  "tips": [
    {"title": "Be Specific", "desc": "[Explanation with example]"},
    {"title": "Provide Context", "desc": "[Explanation with example]"},
    {"title": "Iterate & Refine", "desc": "[Explanation with example]"},
    {"title": "Use Examples", "desc": "[Explanation with example]"},
    {"title": "Ask for Alternatives", "desc": "[Explanation with example]"},
    {"title": "Break Down Complex Tasks", "desc": "[Explanation with example]"}
  ]
}

### SLIDE 25 - Common Mistakes to Avoid
{
  "type": "mistakes",
  "header": "Common Mistakes",
  "mistakes": [
    {"wrong": "[What NOT to do]", "right": "[What to do instead]"},
    {"wrong": "[What NOT to do]", "right": "[What to do instead]"},
    {"wrong": "[What NOT to do]", "right": "[What to do instead]"},
    {"wrong": "[What NOT to do]", "right": "[What to do instead]"},
    {"wrong": "[What NOT to do]", "right": "[What to do instead]"}
  ]
}

### SLIDE 26 - Inspiration Gallery
{
  "type": "inspiration",
  "header": "What Can You Build?",
  "ideas": [
    {"icon": "📝", "title": "[App Idea 1]", "desc": "[Brief description]"},
    {"icon": "💼", "title": "[App Idea 2]", "desc": "[Brief description]"},
    {"icon": "🏋️", "title": "[App Idea 3]", "desc": "[Brief description]"},
    {"icon": "📚", "title": "[App Idea 4]", "desc": "[Brief description]"},
    {"icon": "🎨", "title": "[App Idea 5]", "desc": "[Brief description]"},
    {"icon": "📊", "title": "[App Idea 6]", "desc": "[Brief description]"},
    {"icon": "🛒", "title": "[App Idea 7]", "desc": "[Brief description]"},
    {"icon": "🎮", "title": "[App Idea 8]", "desc": "[Brief description]"}
  ],
  "info": "Real users have built amazing apps with these tools!",
  "specialBoxes": [{"type": "action", "content": "Pick ONE idea and try building it after class!"}]
}

### SLIDE 27 - Challenge
{
  "type": "challenge",
  "header": "Extend Your Project",
  "challenges": "• [Challenge 1: Specific feature to add]\\n• [Challenge 2: Specific feature to add]\\n• [Challenge 3: Specific feature to add]",
  "steps": [
    {"num": "1", "title": "Plan", "desc": "[Planning guidance]"},
    {"num": "2", "title": "Prompt", "desc": "[How to prompt for it]"},
    {"num": "3", "title": "Test", "desc": "[How to verify]"},
    {"num": "4", "title": "Deploy", "desc": "[How to ship]"}
  ]
}

### SLIDE 28 - Summary / What You Built
{
  "type": "summary",
  "header": "What You Built Today",
  "features": [
    {"title": "[Skill 1]", "desc": "[What they learned]"},
    {"title": "[Skill 2]", "desc": "[What they learned]"},
    {"title": "[Skill 3]", "desc": "[What they learned]"},
    {"title": "[Skill 4]", "desc": "[What they learned]"},
    {"title": "[Skill 5]", "desc": "[What they learned]"},
    {"title": "[Skill 6]", "desc": "[What they learned]"},
    {"title": "[Skill 7]", "desc": "[What they learned]"},
    {"title": "[Skill 8]", "desc": "[What they learned]"}
  ]
}

### SLIDE 29 - Closing
{
  "type": "closing",
  "header": "Turn Ideas Into Reality",
  "cta": "What will you build next?"
}

## CONTENT GUIDELINES:
1. **Action-Oriented**: Every step should start with a verb (Create, Configure, Add, Click, etc.)
2. **Specific & Concrete**: Include exact button names, menu paths, and field names
3. **Screenshot Descriptions**: Be detailed - "Screenshot showing the Supabase dashboard with the 'New Project' button highlighted and project settings panel open"
4. **Real Examples**: Use realistic data and scenarios relevant to the tool/topic
5. **Progressive Complexity**: Start simple, build to advanced features
6. **Inclusive Language**: Write for beginners while respecting intelligence

## OUTPUT FORMAT:
Return a JSON object with this EXACT structure:
{
  "title": "Lesson title",
  "slides": [
    {
      "slideNumber": 1,
      "type": "title|overview|step|screenshot|advanced|tips|mistakes|inspiration|challenge|summary|closing",
      "header": "Slide header",
      "stepNumber": 1,
      "content": "Main content",
      "projectName": "For overview slide",
      "subtitle": "For overview slide",
      "features": [{"icon": "emoji", "title": "...", "desc": "..."}],
      "tags": ["tag1", "tag2"],
      "screenshotPlaceholder": "Detailed screenshot description",
      "callout": "Purple callout box content",
      "tips": [{"title": "...", "desc": "..."}],
      "mistakes": [{"wrong": "...", "right": "..."}],
      "ideas": [{"icon": "emoji", "title": "...", "desc": "..."}],
      "challenges": "Bullet list as string",
      "steps": [{"num": "1", "title": "...", "desc": "..."}],
      "info": "Info box text",
      "cta": "Call to action",
      "specialBoxes": [
        {"type": "prompt|tip|action|warning|bestpractice", "content": "Box content"}
      ]
    }
  ],
  "companionDoc": "Full markdown documentation with all steps, numbered figure placeholders for screenshots (Figure 1, Figure 2, etc.), copy-paste code blocks, and notes sections"
}

IMPORTANT:
- Return ONLY valid JSON - no markdown code blocks, no explanation text
- Include ALL 29 slides
- Use the EXACT color scheme and visual markers specified
- Make screenshot placeholders highly detailed for the curriculum team`;

app.post('/api/lessons/generate', async (req, res) => {
  try {
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: {
          code: 'CONFIG_ERROR',
          message: 'ANTHROPIC_API_KEY environment variable is not set. Please set it before restarting the API server.'
        }
      });
    }

    const { title, provider, level, audience, objectives, project, additionalDetails } = req.body;

    // Validate required fields
    if (!title || !provider || !level || !audience || !objectives) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Required fields: title, provider, level, audience, objectives'
        }
      });
    }

    const userPrompt = `Create a complete hands-on workshop lesson for MyAIcademy with the following specifications:

**Lesson Title:** ${title}
**AI Tool/Provider:** ${provider}
**Skill Level:** ${level}
**Target Audience:** ${audience}
**Learning Objectives:** ${objectives}
**Project/Build:** ${project || 'Not specified - create an appropriate hands-on project'}
**Additional Requirements:** ${additionalDetails || 'None'}

Generate a MINIMUM of 28 detailed slides following the MyAIcademy template. Each step must include:
1. Clear numbered instructions
2. Screenshot placeholders describing exactly what to capture
3. Copy-paste prompts in dark blue boxes where applicable
4. Pro tips in yellow boxes
5. Hands-on action items in green boxes

The companion documentation should be comprehensive enough for a student to follow along independently, with clear markers for where to paste their screenshots.

IMPORTANT: Return ONLY valid JSON. No markdown code blocks, no explanation text - just the JSON object.`;

    // Call Claude Opus with streaming for long requests
    let responseText = '';

    const stream = await anthropic.messages.stream({
      model: 'claude-opus-4-20250514',
      max_tokens: 16000,
      messages: [
        {
          role: 'user',
          content: MYAICADEMY_TEMPLATE_PROMPT + '\n\n' + userPrompt
        }
      ]
    });

    // Collect streamed response
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        responseText += event.delta.text;
      }
    }

    // Parse the JSON response
    let lessonData;
    try {
      // Try to extract JSON from the response (in case there's any wrapper text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        lessonData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError.message);
      console.error('Response was:', responseText.substring(0, 500));
      return res.status(500).json({
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to parse lesson content from AI response',
          rawResponse: responseText.substring(0, 1000)
        }
      });
    }

    // Add metadata
    lessonData.metadata = {
      generatedAt: new Date().toISOString(),
      provider,
      level,
      audience,
      slideCount: lessonData.slides?.length || 0
    };

    res.json({
      data: lessonData,
      message: `Generated lesson with ${lessonData.slides?.length || 0} slides`
    });

  } catch (error) {
    console.error('Lesson generation error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

// Generate and download PowerPoint file
app.post('/api/lessons/download-pptx', async (req, res) => {
  try {
    const { lessonData } = req.body;

    if (!lessonData || !lessonData.slides) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'lessonData with slides is required'
        }
      });
    }

    // Generate PowerPoint
    const pptx = generatePowerPoint(lessonData);

    // Generate as base64
    const pptxBase64 = await pptx.write({ outputType: 'base64' });

    res.json({
      data: {
        filename: `${lessonData.title.replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pptx`,
        content: pptxBase64,
        contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      }
    });

  } catch (error) {
    console.error('PowerPoint generation error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /api/providers');
  console.log('  GET  /api/lessons');
  console.log('  GET  /api/courses');
  console.log('  GET  /api/updates');
  console.log('  POST /api/updates/fetch');
  console.log('  GET  /api/impact-reports');
  console.log('  POST /api/impact-reports/:id/approve');
  console.log('  POST /api/impact-reports/:id/reject');
  console.log('  POST /api/impact-reports/:id/assign');
  console.log('  POST /api/impact-reports/analyze');
  console.log('  GET  /api/mapping-rules');
  console.log('  PUT  /api/mapping-rules/:id');
  console.log('  GET  /api/audit-logs');
  console.log('  GET  /api/dashboard/stats');
  console.log('  POST /api/lessons/generate');
  console.log('  POST /api/lessons/download-pptx');
});

export default app;
