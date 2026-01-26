import PptxGenJS from 'pptxgenjs';

// MyAIcademy Brand Colors - Teal Trust Theme (exact from template)
const COLORS = {
  // Primary Teal Trust Theme
  primary: '028090',        // Primary Teal - main accent, step numbers, titles
  secondary: '00A896',      // Secondary Teal - hover states, secondary elements
  accent: '02C39A',         // Accent Green - highlights, success states
  darkNavy: '1E2761',       // Dark Navy - code boxes, headers, dark backgrounds

  // Alias for backward compatibility
  teal: '028090',           // Primary Teal
  navy: '1E2761',           // Dark Navy

  // UI Colors
  yellow: 'FEF3CD',         // PRO TIP background
  yellowBorder: 'FFC107',   // PRO TIP border
  mintGreen: 'D4EDDA',      // HANDS-ON background
  greenBorder: '28A745',    // HANDS-ON border
  purple: '8B5CF6',         // Callout boxes
  lightPurple: 'EDE9FE',    // Light purple background
  red: 'F8D7DA',            // Mistakes/WARNING background
  redText: 'DC3545',        // Mistakes text
  orange: 'FFF3E0',         // BEST PRACTICE background
  orangeBorder: 'FF9800',   // BEST PRACTICE border
  white: 'FFFFFF',
  lightGray: 'F5F7FA',      // Card backgrounds
  mediumGray: 'E5E7EB',     // Borders
  darkGray: '374151',       // Body text
  textGray: '6B7280',       // Subtitle text
  gradientTeal: 'E0F7F6',   // Light teal for gradients
  lightTeal: 'E8F6F5',      // Very light teal background
};

// Font settings
const FONTS = {
  title: 'Arial',
  body: 'Arial',
};

/**
 * Generate a MyAIcademy PowerPoint presentation from lesson data
 */
export function generatePowerPoint(lessonData) {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = 'MyAIcademy';
  pptx.title = lessonData.title;
  pptx.subject = 'AI Learning Workshop';
  pptx.company = 'MyAIcademy';

  // Set default slide size (16:9)
  pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
  pptx.layout = 'LAYOUT_16x9';

  const meta = lessonData.metadata || {};

  // Generate slides based on lesson data
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

// Logo removed as per requirements - function kept for compatibility
function addLogo(slide) {
  // No logo added
}

// Add bottom teal bar
function addBottomBar(slide) {
  slide.addShape('rect', {
    x: 0, y: 5.4, w: 10, h: 0.225,
    fill: { color: COLORS.teal }
  });
}

// Add gradient top edge
function addTopGradient(slide) {
  slide.addShape('rect', {
    x: 0, y: 0, w: 10, h: 0.08,
    fill: { type: 'solid', color: COLORS.teal }
  });
}

/**
 * SLIDE 1: Title Slide
 */
function createTitleSlide(pptx, data, lessonData, meta) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  addLogo(slide);

  // Main title
  slide.addText(data.header || lessonData.title, {
    x: 0.5, y: 1.8, w: 5, h: 1,
    fontSize: 36, fontFace: FONTS.title, color: COLORS.teal,
    bold: true, valign: 'middle'
  });

  // Subtitle
  const subtitle = data.content?.split('\n')[0] || 'From idea to deployed app in minutes';
  slide.addText(subtitle, {
    x: 0.5, y: 2.8, w: 5, h: 0.4,
    fontSize: 16, fontFace: FONTS.body, color: COLORS.textGray
  });

  // Tag pills
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

  // Placeholder for robot image (right side)
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

/**
 * SLIDE 2: HANDS-ON WORKSHOP Overview
 */
function createOverviewSlide(pptx, data, lessonData, meta) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  addTopGradient(slide);
  addLogo(slide);

  // "HANDS-ON WORKSHOP" pill at top center
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

  // Main title
  const projectName = data.projectName || lessonData.title;
  slide.addText(`Today's Project: ${projectName}`, {
    x: 0.5, y: 1, w: 9, h: 0.6,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.darkNavy,
    bold: true, align: 'center'
  });

  // Subtitle
  const subtitle = data.subtitle || 'A full-stack app with user authentication, database, and beautiful UI';
  slide.addText(subtitle, {
    x: 0.5, y: 1.6, w: 9, h: 0.4,
    fontSize: 14, fontFace: FONTS.body, color: COLORS.textGray,
    align: 'center'
  });

  // 4 feature cards
  const features = data.features || [
    { icon: '1', title: 'Feature 1', desc: 'Description here' },
    { icon: '2', title: 'Feature 2', desc: 'Description here' },
    { icon: '3', title: 'Feature 3', desc: 'Description here' },
    { icon: '4', title: 'Feature 4', desc: 'Description here' }
  ];

  features.slice(0, 4).forEach((feature, i) => {
    const cardX = 0.5 + (i * 2.35);
    // Card background
    slide.addShape('roundRect', {
      x: cardX, y: 2.2, w: 2.2, h: 1.4,
      fill: { color: COLORS.white },
      line: { color: COLORS.mediumGray, width: 1 },
      shadow: { type: 'outer', blur: 3, offset: 2, angle: 45, opacity: 0.1 }
    });
    // Icon
    slide.addText(feature.icon || '?', {
      x: cardX, y: 2.35, w: 2.2, h: 0.4,
      fontSize: 24, align: 'center'
    });
    // Title
    slide.addText(feature.title, {
      x: cardX + 0.1, y: 2.8, w: 2, h: 0.35,
      fontSize: 12, fontFace: FONTS.title, color: COLORS.darkNavy,
      bold: true, align: 'center'
    });
    // Description
    slide.addText(feature.desc, {
      x: cardX + 0.1, y: 3.15, w: 2, h: 0.35,
      fontSize: 10, fontFace: FONTS.body, color: COLORS.textGray,
      align: 'center'
    });
  });

  // Bottom info box (mint green)
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

/**
 * STEP SLIDES (main instructional slides)
 */
function createStepSlide(pptx, data, index) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  addLogo(slide);

  const stepNum = data.stepNumber || (index + 1);

  // Step number circle (teal)
  slide.addShape('ellipse', {
    x: 0.3, y: 0.25, w: 0.55, h: 0.55,
    fill: { color: COLORS.teal }
  });
  slide.addText(String(stepNum), {
    x: 0.3, y: 0.25, w: 0.55, h: 0.55,
    fontSize: 20, fontFace: FONTS.title, color: COLORS.white,
    bold: true, align: 'center', valign: 'middle'
  });

  // Step title
  slide.addText(data.header || `Step ${stepNum}`, {
    x: 1, y: 0.25, w: 7, h: 0.55,
    fontSize: 24, fontFace: FONTS.title, color: COLORS.darkNavy,
    bold: true, valign: 'middle'
  });

  let yPos = 1;

  // Check for prompt box (COPY THIS PROMPT)
  const promptBox = data.specialBoxes?.find(b => b.type === 'prompt');
  if (promptBox) {
    // Dark navy prompt box
    slide.addShape('roundRect', {
      x: 0.4, y: yPos, w: 9.2, h: 1.4,
      fill: { color: COLORS.darkNavy }
    });
    // Header
    slide.addText('COPY THIS PROMPT:', {
      x: 0.6, y: yPos + 0.1, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: FONTS.title, color: COLORS.teal,
      bold: true
    });
    // Prompt content
    slide.addText(promptBox.content, {
      x: 0.6, y: yPos + 0.4, w: 8.8, h: 0.9,
      fontSize: 11, fontFace: 'Courier New', color: COLORS.white,
      valign: 'top'
    });
    yPos += 1.55;
  }

  // Main content
  if (data.content && !promptBox) {
    slide.addText(data.content, {
      x: 0.4, y: yPos, w: 9.2, h: 1,
      fontSize: 13, fontFace: FONTS.body, color: COLORS.darkGray,
      valign: 'top'
    });
    yPos += 1.1;
  }

  // Feature breakdown rows (if present)
  if (data.features) {
    data.features.forEach((feature, i) => {
      if (yPos < 4.2) {
        slide.addShape('roundRect', {
          x: 0.4, y: yPos, w: 9.2, h: 0.5,
          fill: { color: COLORS.lightGray }
        });
        // Feature label (teal)
        slide.addText(feature.label, {
          x: 0.6, y: yPos, w: 2.5, h: 0.5,
          fontSize: 12, fontFace: FONTS.title, color: COLORS.teal,
          bold: true, valign: 'middle'
        });
        // Feature description
        slide.addText(feature.desc, {
          x: 3.2, y: yPos, w: 6.2, h: 0.5,
          fontSize: 11, fontFace: FONTS.body, color: COLORS.darkGray,
          valign: 'middle'
        });
        yPos += 0.55;
      }
    });
  }

  // PRO TIP box (yellow)
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

  // HANDS-ON box (mint green) - always at bottom
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

/**
 * Screenshot slide with callout
 */
function createScreenshotSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  addLogo(slide);

  // Title
  slide.addText(data.header || 'Screenshot', {
    x: 0.4, y: 0.2, w: 8, h: 0.5,
    fontSize: 24, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });

  // Screenshot placeholder
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

  // Purple callout box on right
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

/**
 * Advanced Features slide
 */
function createAdvancedSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  addLogo(slide);

  // Label
  slide.addText('ADVANCED FEATURES', {
    x: 0.4, y: 0.2, w: 3, h: 0.3,
    fontSize: 11, fontFace: FONTS.title, color: COLORS.textGray,
    bold: true
  });

  // Title
  slide.addText(data.header || 'Advanced Features', {
    x: 0.4, y: 0.5, w: 8, h: 0.6,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });

  // Feature rows
  const features = data.features || data.content?.split('\n').filter(l => l.trim()) || [];
  let yPos = 1.3;

  features.slice(0, 5).forEach((feature, i) => {
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

  // Yellow info box at bottom
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

/**
 * Pro Tips / Prompting Playbook slide
 */
function createTipsSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  addLogo(slide);

  // Label
  slide.addText('PROMPTING MASTERY', {
    x: 0.4, y: 0.2, w: 3, h: 0.3,
    fontSize: 11, fontFace: FONTS.title, color: COLORS.textGray,
    bold: true
  });

  // Title
  slide.addText(data.header || 'Pro Tips', {
    x: 0.4, y: 0.5, w: 8, h: 0.6,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });

  // Tips as numbered cards
  const tips = data.tips || data.content?.split('\n').filter(l => l.trim()) || [];
  let yPos = 1.3;

  tips.slice(0, 6).forEach((tip, i) => {
    const tipText = typeof tip === 'string' ? tip : tip.title;
    const tipDesc = typeof tip === 'string' ? '' : tip.desc;

    slide.addShape('roundRect', {
      x: 0.4, y: yPos, w: 9.2, h: 0.55,
      fill: { color: COLORS.lightGray }
    });
    // Number
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

/**
 * Common Mistakes slide
 */
function createMistakesSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  addLogo(slide);

  // Label
  slide.addText('AVOID THESE', {
    x: 0.4, y: 0.2, w: 2, h: 0.3,
    fontSize: 11, fontFace: FONTS.title, color: COLORS.redText,
    bold: true
  });

  // Title
  slide.addText(data.header || 'Common Mistakes', {
    x: 0.4, y: 0.5, w: 8, h: 0.6,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });

  // Mistakes as red/green pairs
  const mistakes = data.mistakes || data.content?.split('\n').filter(l => l.trim()) || [];
  let yPos = 1.3;

  mistakes.slice(0, 5).forEach((mistake, i) => {
    const mistakeText = typeof mistake === 'string' ? mistake : mistake.wrong;
    const fixText = typeof mistake === 'string' ? '' : mistake.right;

    // Red mistake box
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

/**
 * Inspiration / What Can You Build slide
 */
function createInspirationSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  addLogo(slide);

  // Label
  slide.addText('INSPIRATION', {
    x: 0.4, y: 0.2, w: 2, h: 0.3,
    fontSize: 11, fontFace: FONTS.title, color: COLORS.textGray,
    bold: true
  });

  // Title
  slide.addText(data.header || 'What Can You Build?', {
    x: 0.4, y: 0.5, w: 8, h: 0.5,
    fontSize: 26, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });

  // 8 idea cards in 2 rows of 4
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

  // Yellow info box
  slide.addShape('roundRect', {
    x: 0.4, y: 3.8, w: 9.2, h: 0.5,
    fill: { color: COLORS.yellow }
  });
  slide.addText(data.info || 'Real users have built amazing apps with these tools!', {
    x: 0.6, y: 3.8, w: 8.8, h: 0.5,
    fontSize: 11, fontFace: FONTS.body, color: COLORS.darkGray,
    valign: 'middle'
  });

  // HANDS-ON box
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

/**
 * Challenge slide
 */
function createChallengeSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  addLogo(slide);

  // Label
  slide.addText('YOUR CHALLENGE', {
    x: 0.4, y: 0.2, w: 2.5, h: 0.3,
    fontSize: 11, fontFace: FONTS.title, color: COLORS.redText,
    bold: true
  });

  // Title
  slide.addText(data.header || 'Extend Your Project', {
    x: 0.4, y: 0.5, w: 8, h: 0.5,
    fontSize: 26, fontFace: FONTS.title, color: COLORS.teal,
    bold: true
  });

  // Dark challenge box
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

  // Steps to complete (4 cards)
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

  // HANDS-ON box
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

/**
 * Summary / What You Built slide
 */
function createSummarySlide(pptx, data, lessonData) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  addLogo(slide);

  // Title
  slide.addText('What You Built Today', {
    x: 0.4, y: 0.2, w: 8, h: 0.5,
    fontSize: 26, fontFace: FONTS.title, color: COLORS.darkNavy,
    bold: true
  });

  // App name box
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

  // Features learned (8 green boxes in 2 rows)
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

  // Celebration box
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

/**
 * Closing slide
 */
function createClosingSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  addLogo(slide);

  // Large centered title
  slide.addText(data.header || 'Turn Ideas Into Reality', {
    x: 0.5, y: 1.8, w: 9, h: 1,
    fontSize: 40, fontFace: FONTS.title, color: COLORS.darkNavy,
    bold: true, align: 'center', valign: 'middle'
  });

  // Subtitle
  slide.addText('You have the tools. You have the skills.', {
    x: 0.5, y: 2.8, w: 9, h: 0.5,
    fontSize: 18, fontFace: FONTS.body, color: COLORS.textGray,
    align: 'center'
  });

  // Call to action
  slide.addText(data.cta || 'What will you build next?', {
    x: 0.5, y: 3.4, w: 9, h: 0.5,
    fontSize: 20, fontFace: FONTS.title, color: COLORS.teal,
    bold: true, align: 'center'
  });

  addBottomBar(slide);
}

export default { generatePowerPoint };
