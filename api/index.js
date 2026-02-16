import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import PptxGenJS from 'pptxgenjs';

// Initialize Anthropic client
const anthropic = new Anthropic();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
- **Emoji Icons**: Use relevant emojis as visual icons (e.g., rocket for launch, lightbulb for tips, gear for settings)
- **Colored Badges/Pills**: Rounded rectangles with light teal background (#E8F6F5) and teal border
- **Card-Style Layouts**: White cards with subtle shadows on light gray backgrounds
- **Step Number Circles**: Teal circles (#028090) with white numbers

### Interactivity Markers (REQUIRED - use these exact formats):
- **HANDS-ON**: Green background (#D4EDDA) - Action items for students to perform
- **PRO TIP**: Yellow background (#FEF3CD) - Expert insights and shortcuts
- **BEST PRACTICE**: Orange background (#FFF3E0) - Industry standards to follow
- **COPY THIS**: Dark navy box (#1E2761) - Code, prompts, or text to copy
- **WARNING**: Red background (#F8D7DA) - Common mistakes to avoid

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
    {"icon": "lock", "title": "[Feature 1]", "desc": "[Brief description]"},
    {"icon": "database", "title": "[Feature 2]", "desc": "[Brief description]"},
    {"icon": "edit", "title": "[Feature 3]", "desc": "[Brief description]"},
    {"icon": "mobile", "title": "[Feature 4]", "desc": "[Brief description]"}
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
    {"icon": "memo", "title": "[App Idea 1]", "desc": "[Brief description]"},
    {"icon": "briefcase", "title": "[App Idea 2]", "desc": "[Brief description]"},
    {"icon": "fitness", "title": "[App Idea 3]", "desc": "[Brief description]"},
    {"icon": "books", "title": "[App Idea 4]", "desc": "[Brief description]"},
    {"icon": "art", "title": "[App Idea 5]", "desc": "[Brief description]"},
    {"icon": "chart", "title": "[App Idea 6]", "desc": "[Brief description]"},
    {"icon": "cart", "title": "[App Idea 7]", "desc": "[Brief description]"},
    {"icon": "game", "title": "[App Idea 8]", "desc": "[Brief description]"}
  ],
  "info": "Real users have built amazing apps with these tools!",
  "specialBoxes": [{"type": "action", "content": "Pick ONE idea and try building it after class!"}]
}

### SLIDE 27 - Challenge
{
  "type": "challenge",
  "header": "Extend Your Project",
  "challenges": "* [Challenge 1: Specific feature to add]\\n* [Challenge 2: Specific feature to add]\\n* [Challenge 3: Specific feature to add]",
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
          message: 'ANTHROPIC_API_KEY environment variable is not set.'
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
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        lessonData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError.message);
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

// ============================================
// PowerPoint Generation
// ============================================

// MyAIcademy Brand Colors - Teal Trust Theme
const COLORS = {
  primary: '028090',
  secondary: '00A896',
  accent: '02C39A',
  darkNavy: '1E2761',
  teal: '028090',
  navy: '1E2761',
  yellow: 'FEF3CD',
  yellowBorder: 'FFC107',
  mintGreen: 'D4EDDA',
  greenBorder: '28A745',
  purple: '8B5CF6',
  lightPurple: 'EDE9FE',
  red: 'F8D7DA',
  redText: 'DC3545',
  orange: 'FFF3E0',
  orangeBorder: 'FF9800',
  white: 'FFFFFF',
  lightGray: 'F5F7FA',
  mediumGray: 'E5E7EB',
  darkGray: '374151',
  textGray: '6B7280',
  gradientTeal: 'E0F7F6',
  lightTeal: 'E8F6F5',
};

const FONTS = {
  title: 'Arial',
  body: 'Arial',
};

function generatePowerPoint(lessonData) {
  const pptx = new PptxGenJS();

  pptx.author = 'MyAIcademy';
  pptx.title = lessonData.title;
  pptx.subject = 'AI Learning Workshop';
  pptx.company = 'MyAIcademy';

  pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
  pptx.layout = 'LAYOUT_16x9';

  const meta = lessonData.metadata || {};

  if (lessonData.slides) {
    lessonData.slides.forEach((slideData, index) => {
      createSlide(pptx, slideData, index, lessonData, meta);
    });
  }

  return pptx;
}

function createSlide(pptx, slideData, index, lessonData, meta) {
  switch (slideData.type) {
    case 'title':
      createTitleSlide(pptx, slideData, lessonData, meta);
      break;
    case 'overview':
      createOverviewSlide(pptx, slideData, lessonData, meta);
      break;
    case 'step':
      createStepSlide(pptx, slideData, index);
      break;
    case 'screenshot':
      createScreenshotSlide(pptx, slideData);
      break;
    case 'advanced':
      createAdvancedSlide(pptx, slideData);
      break;
    case 'tips':
      createTipsSlide(pptx, slideData);
      break;
    case 'mistakes':
      createMistakesSlide(pptx, slideData);
      break;
    case 'inspiration':
      createInspirationSlide(pptx, slideData);
      break;
    case 'challenge':
      createChallengeSlide(pptx, slideData);
      break;
    case 'summary':
      createSummarySlide(pptx, slideData, lessonData);
      break;
    case 'closing':
      createClosingSlide(pptx, slideData);
      break;
    default:
      createStepSlide(pptx, slideData, index);
  }
}

function addBottomBar(slide) {
  slide.addShape('rect', {
    x: 0, y: 5.4, w: 10, h: 0.225,
    fill: { color: COLORS.teal }
  });
}

function addTopGradient(slide) {
  slide.addShape('rect', {
    x: 0, y: 0, w: 10, h: 0.08,
    fill: { type: 'solid', color: COLORS.teal }
  });
}

function createTitleSlide(pptx, data, lessonData, meta) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText(data.header || lessonData.title, {
    x: 0.5, y: 1.8, w: 5, h: 1,
    fontSize: 36, fontFace: FONTS.title, color: COLORS.teal,
    bold: true, valign: 'middle'
  });

  const subtitle = data.content?.split('\n')[0] || 'From idea to deployed app in minutes';
  slide.addText(subtitle, {
    x: 0.5, y: 2.8, w: 5, h: 0.4,
    fontSize: 16, fontFace: FONTS.body, color: COLORS.textGray
  });

  const tags = [meta.provider || 'AI Tool', meta.level || 'No-Code'];
  tags.forEach((tag, i) => {
    slide.addShape('roundRect', {
      x: 0.5 + (i * 1.8), y: 3.5, w: 1.6, h: 0.4,
      fill: { color: COLORS.gradientTeal },
      line: { color: COLORS.teal, width: 1 }
    });
    slide.addText(tag, {
      x: 0.5 + (i * 1.8), y: 3.5, w: 1.6, h: 0.4,
      fontSize: 12, fontFace: FONTS.body, color: COLORS.teal,
      align: 'center', valign: 'middle'
    });
  });

  slide.addShape('rect', {
    x: 5.5, y: 0.5, w: 4, h: 4.5,
    fill: { color: COLORS.lightGray },
    line: { color: COLORS.mediumGray, dashType: 'dash' }
  });
  slide.addText('[AI Robot Image]', {
    x: 5.5, y: 2.5, w: 4, h: 0.5,
    fontSize: 14, color: COLORS.textGray, align: 'center'
  });

  addBottomBar(slide);
}

function createOverviewSlide(pptx, data, lessonData, meta) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  addTopGradient(slide);

  slide.addShape('roundRect', {
    x: 3.2, y: 0.3, w: 3.6, h: 0.5,
    fill: { color: COLORS.white },
    line: { color: COLORS.mediumGray, width: 1 }
  });
  slide.addText('HANDS-ON WORKSHOP', {
    x: 3.2, y: 0.3, w: 3.6, h: 0.5,
    fontSize: 14, fontFace: FONTS.title, color: COLORS.teal,
    bold: true, align: 'center', valign: 'middle'
  });

  const projectName = data.projectName || lessonData.title;
  slide.addText(`Today's Project: ${projectName}`, {
    x: 0.5, y: 1, w: 9, h: 0.6,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.darkNavy,
    bold: true, align: 'center'
  });

  const subtitle = data.subtitle || 'A full-stack app with user authentication, database, and beautiful UI';
  slide.addText(subtitle, {
    x: 0.5, y: 1.6, w: 9, h: 0.4,
    fontSize: 14, fontFace: FONTS.body, color: COLORS.textGray,
    align: 'center'
  });

  const features = data.features || [
    { icon: '1', title: 'Feature 1', desc: 'Description here' },
    { icon: '2', title: 'Feature 2', desc: 'Description here' },
    { icon: '3', title: 'Feature 3', desc: 'Description here' },
    { icon: '4', title: 'Feature 4', desc: 'Description here' }
  ];

  features.slice(0, 4).forEach((feature, i) => {
    const cardX = 0.5 + (i * 2.35);
    slide.addShape('roundRect', {
      x: cardX, y: 2.2, w: 2.2, h: 1.4,
      fill: { color: COLORS.white },
      line: { color: COLORS.mediumGray, width: 1 },
      shadow: { type: 'outer', blur: 3, offset: 2, angle: 45, opacity: 0.1 }
    });
    slide.addText(feature.icon || '?', {
      x: cardX, y: 2.35, w: 2.2, h: 0.4,
      fontSize: 24, align: 'center'
    });
    slide.addText(feature.title, {
      x: cardX + 0.1, y: 2.8, w: 2, h: 0.35,
      fontSize: 12, fontFace: FONTS.title, color: COLORS.darkNavy,
      bold: true, align: 'center'
    });
    slide.addText(feature.desc, {
      x: cardX + 0.1, y: 3.15, w: 2, h: 0.35,
      fontSize: 10, fontFace: FONTS.body, color: COLORS.textGray,
      align: 'center'
    });
  });

  slide.addShape('roundRect', {
    x: 0.5, y: 3.9, w: 9, h: 0.6,
    fill: { color: COLORS.mintGreen }
  });
  slide.addText("You'll learn ALL features by building this real project step-by-step", {
    x: 0.7, y: 3.9, w: 8.6, h: 0.6,
    fontSize: 13, fontFace: FONTS.body, color: COLORS.greenBorder,
    valign: 'middle'
  });

  addBottomBar(slide);
}

function createStepSlide(pptx, data, index) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  const stepNum = data.stepNumber || (index + 1);

  slide.addShape('ellipse', {
    x: 0.3, y: 0.25, w: 0.55, h: 0.55,
    fill: { color: COLORS.teal }
  });
  slide.addText(String(stepNum), {
    x: 0.3, y: 0.25, w: 0.55, h: 0.55,
    fontSize: 20, fontFace: FONTS.title, color: COLORS.white,
    bold: true, align: 'center', valign: 'middle'
  });

  slide.addText(data.header || `Step ${stepNum}`, {
    x: 1, y: 0.25, w: 7, h: 0.55,
    fontSize: 24, fontFace: FONTS.title, color: COLORS.darkNavy,
    bold: true, valign: 'middle'
  });

  let yPos = 1;

  const promptBox = data.specialBoxes?.find(b => b.type === 'prompt');
  if (promptBox) {
    slide.addShape('roundRect', {
      x: 0.4, y: yPos, w: 9.2, h: 1.4,
      fill: { color: COLORS.darkNavy }
    });
    slide.addText('COPY THIS PROMPT:', {
      x: 0.6, y: yPos + 0.1, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: FONTS.title, color: COLORS.teal,
      bold: true
    });
    slide.addText(promptBox.content, {
      x: 0.6, y: yPos + 0.4, w: 8.8, h: 0.9,
      fontSize: 11, fontFace: 'Courier New', color: COLORS.white,
      valign: 'top'
    });
    yPos += 1.55;
  }

  if (data.content && !promptBox) {
    slide.addText(data.content, {
      x: 0.4, y: yPos, w: 9.2, h: 1,
      fontSize: 13, fontFace: FONTS.body, color: COLORS.darkGray,
      valign: 'top'
    });
    yPos += 1.1;
  }

  if (data.features) {
    data.features.forEach((feature) => {
      if (yPos < 4.2) {
        slide.addShape('roundRect', {
          x: 0.4, y: yPos, w: 9.2, h: 0.5,
          fill: { color: COLORS.lightGray }
        });
        slide.addText(feature.label, {
          x: 0.6, y: yPos, w: 2.5, h: 0.5,
          fontSize: 12, fontFace: FONTS.title, color: COLORS.teal,
          bold: true, valign: 'middle'
        });
        slide.addText(feature.desc, {
          x: 3.2, y: yPos, w: 6.2, h: 0.5,
          fontSize: 11, fontFace: FONTS.body, color: COLORS.darkGray,
          valign: 'middle'
        });
        yPos += 0.55;
      }
    });
  }

  const tipBox = data.specialBoxes?.find(b => b.type === 'tip');
  if (tipBox && yPos < 4.5) {
    slide.addShape('roundRect', {
      x: 0.4, y: yPos, w: 9.2, h: 0.65,
      fill: { color: COLORS.yellow },
      line: { color: COLORS.yellowBorder, width: 1 }
    });
    slide.addText('PRO TIP', {
      x: 0.6, y: yPos + 0.08, w: 1.2, h: 0.25,
      fontSize: 11, fontFace: FONTS.title, color: COLORS.redText,
      bold: true
    });
    slide.addText(tipBox.content, {
      x: 0.6, y: yPos + 0.32, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: FONTS.body, color: COLORS.darkGray
    });
    yPos += 0.75;
  }

  const actionBox = data.specialBoxes?.find(b => b.type === 'action');
  if (actionBox) {
    slide.addShape('roundRect', {
      x: 0.4, y: 4.7, w: 9.2, h: 0.55,
      fill: { color: COLORS.mintGreen }
    });
    slide.addText('HANDS-ON: ' + actionBox.content, {
      x: 0.6, y: 4.7, w: 8.8, h: 0.55,
      fontSize: 12, fontFace: FONTS.body, color: COLORS.greenBorder,
      bold: false, valign: 'middle'
    });
  }
}

function createScreenshotSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText(data.header || 'Screenshot', {
    x: 0.4, y: 0.2, w: 8, h: 0.5,
    fontSize: 24, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });

  slide.addShape('rect', {
    x: 0.4, y: 0.9, w: 6, h: 3.8,
    fill: { color: COLORS.lightGray },
    line: { color: COLORS.mediumGray, dashType: 'dash', width: 2 }
  });
  slide.addText('[SCREENSHOT]\n' + (data.screenshotPlaceholder || 'Add screenshot here'), {
    x: 0.4, y: 2.2, w: 6, h: 1,
    fontSize: 14, fontFace: FONTS.body, color: COLORS.textGray,
    align: 'center', valign: 'middle'
  });

  if (data.callout || data.content) {
    slide.addShape('roundRect', {
      x: 6.6, y: 1.2, w: 3, h: 2.5,
      fill: { color: COLORS.purple }
    });
    slide.addText(data.callout || data.content, {
      x: 6.8, y: 1.4, w: 2.6, h: 2.1,
      fontSize: 12, fontFace: FONTS.body, color: COLORS.white,
      valign: 'top'
    });
  }
}

function createAdvancedSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('ADVANCED FEATURES', {
    x: 0.4, y: 0.2, w: 3, h: 0.3,
    fontSize: 11, fontFace: FONTS.title, color: COLORS.textGray,
    bold: true
  });

  slide.addText(data.header || 'Advanced Features', {
    x: 0.4, y: 0.5, w: 8, h: 0.6,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });

  const features = data.features || data.content?.split('\n').filter(l => l.trim()) || [];
  let yPos = 1.3;

  features.slice(0, 5).forEach((feature) => {
    const featureText = typeof feature === 'string' ? feature : feature.title;
    const featureDesc = typeof feature === 'string' ? '' : feature.desc;

    slide.addShape('roundRect', {
      x: 0.4, y: yPos, w: 9.2, h: 0.6,
      fill: { color: COLORS.lightGray }
    });
    slide.addText(featureText.replace(/^[-•]\s*/, ''), {
      x: 0.8, y: yPos, w: 2.5, h: 0.6,
      fontSize: 13, fontFace: FONTS.title, color: COLORS.teal,
      bold: true, valign: 'middle'
    });
    if (featureDesc) {
      slide.addText(featureDesc, {
        x: 3.5, y: yPos, w: 5.9, h: 0.6,
        fontSize: 12, fontFace: FONTS.body, color: COLORS.darkGray,
        valign: 'middle'
      });
    }
    yPos += 0.7;
  });

  const tipBox = data.specialBoxes?.find(b => b.type === 'tip');
  if (tipBox) {
    slide.addShape('roundRect', {
      x: 0.4, y: 4.7, w: 9.2, h: 0.55,
      fill: { color: COLORS.yellow }
    });
    slide.addText(tipBox.content, {
      x: 0.6, y: 4.7, w: 8.8, h: 0.55,
      fontSize: 12, fontFace: FONTS.body, color: COLORS.darkGray,
      valign: 'middle'
    });
  }
}

function createTipsSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('PROMPTING MASTERY', {
    x: 0.4, y: 0.2, w: 3, h: 0.3,
    fontSize: 11, fontFace: FONTS.title, color: COLORS.textGray,
    bold: true
  });

  slide.addText(data.header || 'Pro Tips', {
    x: 0.4, y: 0.5, w: 8, h: 0.6,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });

  const tips = data.tips || data.content?.split('\n').filter(l => l.trim()) || [];
  let yPos = 1.3;

  tips.slice(0, 6).forEach((tip, i) => {
    const tipText = typeof tip === 'string' ? tip : tip.title;
    const tipDesc = typeof tip === 'string' ? '' : tip.desc;

    slide.addShape('roundRect', {
      x: 0.4, y: yPos, w: 9.2, h: 0.55,
      fill: { color: COLORS.lightGray }
    });
    slide.addText(`${i + 1}. ${tipText.replace(/^[-•\d.]\s*/, '')}`, {
      x: 0.6, y: yPos, w: 3, h: 0.55,
      fontSize: 12, fontFace: FONTS.title, color: COLORS.teal,
      bold: true, valign: 'middle'
    });
    if (tipDesc) {
      slide.addText(tipDesc, {
        x: 3.8, y: yPos, w: 5.6, h: 0.55,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.darkGray,
        valign: 'middle'
      });
    }
    yPos += 0.6;
  });
}

function createMistakesSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('AVOID THESE', {
    x: 0.4, y: 0.2, w: 2, h: 0.3,
    fontSize: 11, fontFace: FONTS.title, color: COLORS.redText,
    bold: true
  });

  slide.addText(data.header || 'Common Mistakes', {
    x: 0.4, y: 0.5, w: 8, h: 0.6,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });

  const mistakes = data.mistakes || data.content?.split('\n').filter(l => l.trim()) || [];
  let yPos = 1.3;

  mistakes.slice(0, 5).forEach((mistake) => {
    const mistakeText = typeof mistake === 'string' ? mistake : mistake.wrong;
    const fixText = typeof mistake === 'string' ? '' : mistake.right;

    slide.addShape('roundRect', {
      x: 0.4, y: yPos, w: 9.2, h: 0.6,
      fill: { color: COLORS.red }
    });
    slide.addText('X ' + mistakeText.replace(/^[-•]\s*/, ''), {
      x: 0.6, y: yPos, w: 4.5, h: 0.6,
      fontSize: 11, fontFace: FONTS.body, color: COLORS.redText,
      valign: 'middle'
    });
    if (fixText) {
      slide.addText(fixText, {
        x: 5.3, y: yPos, w: 4.1, h: 0.6,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.greenBorder,
        bold: true, valign: 'middle'
      });
    }
    yPos += 0.7;
  });
}

function createInspirationSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('INSPIRATION', {
    x: 0.4, y: 0.2, w: 2, h: 0.3,
    fontSize: 11, fontFace: FONTS.title, color: COLORS.textGray,
    bold: true
  });

  slide.addText(data.header || 'What Can You Build?', {
    x: 0.4, y: 0.5, w: 8, h: 0.5,
    fontSize: 26, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });

  const ideas = data.ideas || [
    { icon: 'A', title: 'App 1', desc: 'Description' },
    { icon: 'B', title: 'App 2', desc: 'Description' },
    { icon: 'C', title: 'App 3', desc: 'Description' },
    { icon: 'D', title: 'App 4', desc: 'Description' },
    { icon: 'E', title: 'App 5', desc: 'Description' },
    { icon: 'F', title: 'App 6', desc: 'Description' },
    { icon: 'G', title: 'App 7', desc: 'Description' },
    { icon: 'H', title: 'App 8', desc: 'Description' }
  ];

  ideas.slice(0, 8).forEach((idea, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const cardX = 0.4 + (col * 2.35);
    const cardY = 1.1 + (row * 1.3);

    slide.addShape('roundRect', {
      x: cardX, y: cardY, w: 2.2, h: 1.1,
      fill: { color: COLORS.lightGray }
    });
    slide.addText(idea.icon || '?', {
      x: cardX, y: cardY + 0.1, w: 2.2, h: 0.3,
      fontSize: 18, align: 'center'
    });
    slide.addText(idea.title, {
      x: cardX + 0.1, y: cardY + 0.4, w: 2, h: 0.35,
      fontSize: 11, fontFace: FONTS.title, color: COLORS.darkNavy,
      bold: true, align: 'center'
    });
    slide.addText(idea.desc, {
      x: cardX + 0.1, y: cardY + 0.75, w: 2, h: 0.3,
      fontSize: 9, fontFace: FONTS.body, color: COLORS.textGray,
      align: 'center'
    });
  });

  slide.addShape('roundRect', {
    x: 0.4, y: 3.8, w: 9.2, h: 0.5,
    fill: { color: COLORS.yellow }
  });
  slide.addText(data.info || 'Real users have built amazing apps with these tools!', {
    x: 0.6, y: 3.8, w: 8.8, h: 0.5,
    fontSize: 11, fontFace: FONTS.body, color: COLORS.darkGray,
    valign: 'middle'
  });

  const action = data.specialBoxes?.find(b => b.type === 'action');
  if (action) {
    slide.addShape('roundRect', {
      x: 0.4, y: 4.45, w: 9.2, h: 0.5,
      fill: { color: COLORS.mintGreen }
    });
    slide.addText('HANDS-ON: ' + action.content, {
      x: 0.6, y: 4.45, w: 8.8, h: 0.5,
      fontSize: 11, fontFace: FONTS.body, color: COLORS.greenBorder,
      valign: 'middle'
    });
  }
}

function createChallengeSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('YOUR CHALLENGE', {
    x: 0.4, y: 0.2, w: 2.5, h: 0.3,
    fontSize: 11, fontFace: FONTS.title, color: COLORS.redText,
    bold: true
  });

  slide.addText(data.header || 'Extend Your Project', {
    x: 0.4, y: 0.5, w: 8, h: 0.5,
    fontSize: 26, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });

  slide.addShape('roundRect', {
    x: 0.4, y: 1.1, w: 9.2, h: 1.8,
    fill: { color: COLORS.darkNavy }
  });
  slide.addText('ADD ONE OF THESE FEATURES:', {
    x: 0.6, y: 1.2, w: 8.8, h: 0.3,
    fontSize: 12, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });
  slide.addText(data.challenges || data.content || '• Feature 1\n• Feature 2\n• Feature 3', {
    x: 0.6, y: 1.55, w: 8.8, h: 1.25,
    fontSize: 12, fontFace: FONTS.body, color: COLORS.white,
    valign: 'top'
  });

  slide.addText('Steps to complete:', {
    x: 0.4, y: 3.05, w: 3, h: 0.3,
    fontSize: 12, fontFace: FONTS.title, color: COLORS.darkNavy,
    bold: true
  });

  const steps = data.steps || [
    { num: '1', title: 'Plan', desc: 'Plan first' },
    { num: '2', title: 'Build', desc: 'Write code' },
    { num: '3', title: 'Test', desc: 'Test it' },
    { num: '4', title: 'Deploy', desc: 'Go live' }
  ];

  steps.slice(0, 4).forEach((step, i) => {
    const cardX = 0.4 + (i * 2.35);
    slide.addShape('roundRect', {
      x: cardX, y: 3.4, w: 2.2, h: 0.85,
      fill: { color: COLORS.lightGray }
    });
    slide.addText(`${step.num}. ${step.title}`, {
      x: cardX + 0.1, y: 3.45, w: 2, h: 0.35,
      fontSize: 11, fontFace: FONTS.title, color: COLORS.teal,
      bold: true
    });
    slide.addText(step.desc, {
      x: cardX + 0.1, y: 3.8, w: 2, h: 0.35,
      fontSize: 10, fontFace: FONTS.body, color: COLORS.textGray
    });
  });

  slide.addShape('roundRect', {
    x: 0.4, y: 4.45, w: 9.2, h: 0.5,
    fill: { color: COLORS.mintGreen }
  });
  slide.addText('HANDS-ON: Pick ONE feature and add it to your project!', {
    x: 0.6, y: 4.45, w: 8.8, h: 0.5,
    fontSize: 11, fontFace: FONTS.body, color: COLORS.greenBorder,
    valign: 'middle'
  });
}

function createSummarySlide(pptx, data, lessonData) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('What You Built Today', {
    x: 0.4, y: 0.2, w: 8, h: 0.5,
    fontSize: 26, fontFace: FONTS.title, color: COLORS.darkNavy,
    bold: true
  });

  slide.addShape('roundRect', {
    x: 0.4, y: 0.8, w: 9.2, h: 0.8,
    fill: { color: COLORS.darkNavy }
  });
  slide.addText(lessonData.title + ' - A Real Production App', {
    x: 0.6, y: 0.85, w: 8.8, h: 0.35,
    fontSize: 14, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });
  slide.addText('Auth | Database | CRUD | Beautiful UI | Mobile | Deployed', {
    x: 0.6, y: 1.2, w: 8.8, h: 0.3,
    fontSize: 11, fontFace: FONTS.body, color: COLORS.white
  });

  slide.addText('Features you now know:', {
    x: 0.4, y: 1.75, w: 4, h: 0.3,
    fontSize: 12, fontFace: FONTS.body, color: COLORS.darkGray
  });

  const features = data.features || [
    { title: 'Feature 1', desc: 'Description' },
    { title: 'Feature 2', desc: 'Description' },
    { title: 'Feature 3', desc: 'Description' },
    { title: 'Feature 4', desc: 'Description' },
    { title: 'Feature 5', desc: 'Description' },
    { title: 'Feature 6', desc: 'Description' },
    { title: 'Feature 7', desc: 'Description' },
    { title: 'Feature 8', desc: 'Description' }
  ];

  features.slice(0, 8).forEach((feature, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const cardX = 0.4 + (col * 2.35);
    const cardY = 2.1 + (row * 0.9);

    slide.addShape('roundRect', {
      x: cardX, y: cardY, w: 2.2, h: 0.75,
      fill: { color: COLORS.mintGreen }
    });
    slide.addText('+ ' + feature.title, {
      x: cardX + 0.1, y: cardY + 0.05, w: 2, h: 0.35,
      fontSize: 11, fontFace: FONTS.title, color: COLORS.teal,
      bold: true
    });
    slide.addText(feature.desc, {
      x: cardX + 0.1, y: cardY + 0.4, w: 2, h: 0.3,
      fontSize: 9, fontFace: FONTS.body, color: COLORS.darkGray
    });
  });

  slide.addShape('roundRect', {
    x: 0.4, y: 4, w: 9.2, h: 0.5,
    fill: { color: COLORS.yellow }
  });
  slide.addText('You can now build full-stack apps in hours instead of months. That\'s a superpower.', {
    x: 0.6, y: 4, w: 8.8, h: 0.5,
    fontSize: 12, fontFace: FONTS.body, color: COLORS.darkGray,
    bold: true, valign: 'middle'
  });

  addBottomBar(slide);
}

function createClosingSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText(data.header || 'Turn Ideas Into Reality', {
    x: 0.5, y: 1.8, w: 9, h: 1,
    fontSize: 40, fontFace: FONTS.title, color: COLORS.darkNavy,
    bold: true, align: 'center', valign: 'middle'
  });

  slide.addText('You have the tools. You have the skills.', {
    x: 0.5, y: 2.8, w: 9, h: 0.5,
    fontSize: 18, fontFace: FONTS.body, color: COLORS.textGray,
    align: 'center'
  });

  slide.addText(data.cta || 'What will you build next?', {
    x: 0.5, y: 3.4, w: 9, h: 0.5,
    fontSize: 20, fontFace: FONTS.title, color: COLORS.teal,
    bold: true, align: 'center'
  });

  addBottomBar(slide);
}

// Download PPTX endpoint
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

    const pptx = generatePowerPoint(lessonData);
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

// ============================================
// Course Generation (Stateless - no DB)
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
    Summary: ${u.summary || ''}
    Source: ${u.source_url}
    Docs: ${docUrls || 'None'}`;
    }).join('\n');

    return `### ${provider}\n**Impact Reports:**\n${reportDetails}\n\n**Underlying Updates:**\n${updateDetails}`;
  }).join('\n\n');

  return `You are a senior curriculum architect for MyAIcademy, a professional AI training platform.

Based on the following approved impact reports and their underlying provider updates, design a cohesive course plan.

## Source Material

${providerSections}

## Requirements

Design a course with **3 to 6 lessons** that covers the most important updates across these providers.

For each lesson, provide:
1. **title** - Specific, action-oriented
2. **provider** - Which AI provider this lesson focuses on
3. **level** - beginner, intermediate, or advanced
4. **scenario** - A realistic professional scenario the entire lesson is built around
5. **objectives** - 3-5 specific, measurable learning objectives
6. **keyTopics** - 5-8 specific features/capabilities to cover
7. **difficulty_notes** - What makes this lesson challenging

## Course Design Principles
- Every lesson must be built around a **realistic professional scenario**
- Focus on **platform-specific strengths, limitations, and hidden gotchas**
- Include **competitor comparison context** where relevant
- Prioritize **advanced configurations and edge cases** over basic walkthroughs
- Ensure lessons progress in difficulty

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

function buildLessonGenerationPrompt(lessonPlan, reportsByProvider) {
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

## STRATEGIC REQUIREMENTS (MANDATORY):

### 1. Scenario-Based Design
The ENTIRE lesson must be built around this scenario: "${lessonPlan.scenario}"

### 2. Platform Analysis (REQUIRED in at least 2 specialBoxes)
Include boxes analyzing what ${lessonPlan.provider} does better than competitors and known limitations.

### 3. Best Practices & Warnings (MINIMUM COUNTS)
At least 3 specialBoxes with type "bestpractice" and 3 with type "warning".

### 4. Screenshot Instructions (DETAILED)
Every screenshot slide must include exact URL, navigation path, expected UI state, and what to annotate.

### 5. Difficulty Calibration
${lessonPlan.difficulty_notes}

### 6. Source Material
${uniqueUrls.map(u => `- ${u}`).join('\n')}

IMPORTANT:
- Return ONLY valid JSON. No markdown code blocks, no explanation text.
- Keep the "companionDoc" field to a BRIEF summary (under 500 words).`;
}

function extractJSONFromResponse(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in response');

  try {
    return JSON.parse(match[0]);
  } catch {
    // Attempt truncated JSON repair
    const jsonStr = match[0];
    const slidesMatch = jsonStr.match(/"slides"\s*:\s*\[/);
    if (!slidesMatch) throw new Error('No slides array found in truncated JSON');

    const slidesStart = slidesMatch.index + slidesMatch[0].length;
    let depth = 0, lastComplete = slidesStart, inStr = false, esc = false;

    for (let i = slidesStart; i < jsonStr.length; i++) {
      const ch = jsonStr[i];
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === '{') depth++;
      if (ch === '}') { depth--; if (depth === 0) lastComplete = i + 1; }
    }

    if (lastComplete <= slidesStart) throw new Error('Could not repair truncated JSON');
    return JSON.parse(jsonStr.slice(0, lastComplete) + '], "companionDoc": "See slides for full content." }');
  }
}

async function callClaudeForCourse(prompt, userContent, maxTokens = 16000) {
  let responseText = '';
  const stream = await anthropic.messages.stream({
    model: 'claude-opus-4-20250514',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt + (userContent ? '\n\n' + userContent : '') }]
  });
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      responseText += event.delta.text;
    }
  }
  return responseText;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

app.post('/api/courses/generate', async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: { code: 'CONFIG_ERROR', message: 'ANTHROPIC_API_KEY environment variable is not set.' }
      });
    }

    const { reports, updates } = req.body;

    if (!reports || !Array.isArray(reports) || reports.length === 0) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'reports array is required (array of approved report objects with provider, severity, rationale, citations, affected_lessons)' }
      });
    }

    // Group by provider
    const reportsByProvider = {};
    for (const report of reports) {
      const provider = report.provider;
      if (!reportsByProvider[provider]) {
        reportsByProvider[provider] = { reports: [], updates: [] };
      }
      reportsByProvider[provider].reports.push(report);
    }

    // Attach updates to their providers
    if (updates && Array.isArray(updates)) {
      for (const update of updates) {
        const provider = update.provider;
        if (reportsByProvider[provider]) {
          reportsByProvider[provider].updates.push(update);
        }
      }
    }

    // Phase 1: Course Architecture
    const archPrompt = buildArchitecturePrompt(reportsByProvider);
    let archText = await callClaudeForCourse(archPrompt, null, 4096);
    let coursePlan;
    try {
      coursePlan = extractJSONFromResponse(archText);
    } catch {
      archText = await callClaudeForCourse(archPrompt, null, 4096);
      coursePlan = extractJSONFromResponse(archText);
    }

    if (!coursePlan.lessons || coursePlan.lessons.length === 0) {
      throw new Error('Course architecture returned no lessons');
    }

    // Phase 2: Generate each lesson
    const generatedLessons = [];
    for (let i = 0; i < coursePlan.lessons.length; i++) {
      const lessonPlan = coursePlan.lessons[i];
      if (i > 0) await delay(2000);

      const lessonUserPrompt = buildLessonGenerationPrompt(lessonPlan, reportsByProvider);
      let lessonText = await callClaudeForCourse(MYAICADEMY_TEMPLATE_PROMPT, lessonUserPrompt, 16000);

      let lessonData;
      try {
        lessonData = extractJSONFromResponse(lessonText);
      } catch {
        await delay(2000);
        lessonText = await callClaudeForCourse(MYAICADEMY_TEMPLATE_PROMPT, lessonUserPrompt, 16000);
        lessonData = extractJSONFromResponse(lessonText);
      }

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
        title: lessonData.title || lessonPlan.title,
        provider: lessonPlan.provider,
        level: lessonPlan.level,
        slideCount: lessonData.slides?.length || 0,
        slides: lessonData.slides,
        companionDoc: lessonData.companionDoc,
        metadata: lessonData.metadata
      });
    }

    res.json({
      data: {
        course: {
          name: coursePlan.courseName,
          description: coursePlan.courseDescription,
          track: coursePlan.track || 'everyone',
          level: coursePlan.level || 'intermediate',
          lessonCount: generatedLessons.length
        },
        lessons: generatedLessons,
        reportsProcessed: reports.length,
        providersIncluded: Object.keys(reportsByProvider)
      },
      message: `Generated course "${coursePlan.courseName}" with ${generatedLessons.length} lessons from ${reports.length} reports`
    });
  } catch (error) {
    console.error('Course generation error:', error);

    if (error.message.includes('No JSON found')) {
      return res.status(500).json({
        error: { code: 'PARSE_ERROR', message: 'Failed to parse AI response. Please try again.' }
      });
    }

    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// Export for Vercel
export default app;
