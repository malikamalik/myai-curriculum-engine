import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pdfParse from 'pdf-parse';
import store from '../store/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '../../..');
const INPUTS_DIR = join(PROJECT_ROOT, 'inputs');
const CONTEXT_DIR = join(PROJECT_ROOT, 'context/parsed');
const SNAPSHOTS_DIR = join(PROJECT_ROOT, 'data/snapshots');

// Ensure directories exist
[CONTEXT_DIR, SNAPSHOTS_DIR].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

/**
 * Parse PDF file to text
 */
async function parsePdf(filePath) {
  try {
    const dataBuffer = readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error parsing PDF ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Snapshot source file for traceability
 */
function snapshotFile(filePath) {
  const filename = basename(filePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotPath = join(SNAPSHOTS_DIR, `${timestamp}_${filename}`);
  copyFileSync(filePath, snapshotPath);
  return snapshotPath;
}

/**
 * Parse providers from the Provider List PDF
 * Based on the known structure from the source document
 */
export async function parseProviders() {
  const providersDir = join(INPUTS_DIR, 'providers');
  const files = readdirSync(providersDir).filter(f => f.endsWith('.pdf'));

  // Known providers from the source document
  const providerData = [
    { name: 'ChatGPT', category: 'llm', website_url: 'https://chat.openai.com', changelog_url: 'https://openai.com/blog' },
    { name: 'Claude', category: 'llm', website_url: 'https://claude.ai', changelog_url: 'https://www.anthropic.com/news' },
    { name: 'Gemini', category: 'llm', website_url: 'https://gemini.google.com', changelog_url: 'https://blog.google/technology/ai/' },
    { name: 'NotebookLM', category: 'research', website_url: 'https://notebooklm.google.com', changelog_url: null },
    { name: 'Perplexity', category: 'research', website_url: 'https://www.perplexity.ai', changelog_url: 'https://www.perplexity.ai/hub' },
    { name: 'MidJourney', category: 'image', website_url: 'https://www.midjourney.com', changelog_url: 'https://docs.midjourney.com/docs/model-versions' },
    { name: 'DALL-E 3', category: 'image', website_url: 'https://openai.com/dall-e-3', changelog_url: 'https://openai.com/blog' },
    { name: 'Imagen', category: 'image', website_url: 'https://deepmind.google/technologies/imagen-3/', changelog_url: null },
    { name: 'Canva', category: 'image', website_url: 'https://www.canva.com', changelog_url: 'https://www.canva.com/designschool/whats-new/' },
    { name: 'Runway ML', category: 'video', website_url: 'https://runwayml.com', changelog_url: 'https://runwayml.com/changelog' },
    { name: 'Sora', category: 'video', website_url: 'https://openai.com/sora', changelog_url: 'https://openai.com/blog' },
    { name: 'Veo', category: 'video', website_url: 'https://deepmind.google/technologies/veo/', changelog_url: 'https://blog.google/technology/ai/' },
    { name: 'HeyGen', category: 'video', website_url: 'https://www.heygen.com', changelog_url: 'https://www.heygen.com/changelog' },
    { name: 'ElevenLabs', category: 'audio', website_url: 'https://elevenlabs.io', changelog_url: 'https://elevenlabs.io/changelog' },
    { name: 'Julius AI', category: 'data', website_url: 'https://julius.ai', changelog_url: null },
    { name: 'Gamma', category: 'data', website_url: 'https://gamma.app', changelog_url: 'https://gamma.app/changelog' },
    { name: 'n8n', category: 'automation', website_url: 'https://n8n.io', changelog_url: 'https://docs.n8n.io/release-notes/' },
    { name: 'Replit', category: 'nocode', website_url: 'https://replit.com', changelog_url: 'https://blog.replit.com' },
    { name: 'Lovable', category: 'nocode', website_url: 'https://lovable.dev', changelog_url: null },
    { name: 'UX Pilot', category: 'nocode', website_url: 'https://uxpilot.ai', changelog_url: null },
    { name: 'Google Whisk', category: 'image', website_url: 'https://labs.google/fx/tools/whisk', changelog_url: null }
  ];

  // Snapshot source files
  for (const file of files) {
    snapshotFile(join(providersDir, file));
  }

  // Save to database
  const providers = [];
  for (const p of providerData) {
    const provider = store.providers.upsert(p);
    providers.push(provider);
  }

  // Export parsed JSON
  const output = {
    generated_at: new Date().toISOString(),
    source_file: files[0] || 'hardcoded from PDF analysis',
    providers
  };

  writeFileSync(join(CONTEXT_DIR, 'providers.parsed.json'), JSON.stringify(output, null, 2));
  console.log(`Parsed ${providers.length} providers`);

  return providers;
}

/**
 * Parse lessons from the Lesson Catalog PDF
 */
export async function parseLessons() {
  const lessonsDir = join(INPUTS_DIR, 'lessons');
  const files = readdirSync(lessonsDir).filter(f => f.endsWith('.pdf'));

  // Snapshot source files
  for (const file of files) {
    snapshotFile(join(lessonsDir, file));
  }

  // Known lessons from the source document analysis
  const lessonData = [
    // BEGINNER LESSONS
    {
      title: 'Say Hello to Generative AI',
      provider_name: 'Multiple',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Say%20Hello%20to%20Generative%20AI!.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Say_Hello_to_Generative_AI-MERGED.srt',
      objective: 'Understand the fundamentals of AI and Generative AI, their key differences, how generative models are trained, and their real world applications.',
      key_topics: ['What is AI?', 'What is Generative AI?', 'How is Generative AI different from traditional AI?', 'How does Generative AI train?', 'Applications of Generative AI']
    },
    {
      title: 'Large Language Models (LLMs) Unpacked — Part 1',
      provider_name: 'Multiple',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/2.%20LLMs_Unpacked_Part1_Enhanced.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/2__LLMs_Unpacked_Part1_Enhanced_merged.srt',
      objective: 'Understand what Large Language Models are, how they fit into AI and deep learning, how they learn from data, and how pre trained and fine tuned LLMs are used in real world applications.',
      key_topics: ['Definition of Large Language Models', 'LLMs as a subset of deep learning', 'How LLMs learn from large datasets and transformers', 'Pre trained versus fine tuned LLMs', 'Common applications of LLMs']
    },
    {
      title: 'Large Language Models (LLMs) Unpacked — Part 2',
      provider_name: 'Multiple',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/3.%20LLMs_Unpacked_Part2_Expanded.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/3__LLMs_Unpacked_Part2_Expanded_merged.srt',
      objective: 'Understand different types of Large Language Models and how they respond to various prompt styles like zero shot one shot and few shot prompts.',
      key_topics: ['Types of LLMs generic instruction dialog', 'How generic language models predict next tokens', 'Instruction tuned and dialog tuned model behaviour', 'Zero shot one shot and few shot prompts', 'Prompt design basics for LLMs']
    },
    {
      title: 'Prompt Like a Pro',
      provider_name: 'Multiple',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/4.%20Prompt%20Like%20a%20Pro.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/4__Prompt_Like_a_Pro_merged.srt',
      objective: 'Learn what prompts are, how LLMs respond to them, the main prompt types, and practical techniques to control and improve AI outputs.',
      key_topics: ['What a prompt is and how LLMs use it', 'Types of prompts zero shot one shot few shot', 'Role prompting for controlling tone and style', 'Knobs and levers temperature top P top K', 'Best practices for writing clear effective prompts']
    },
    {
      title: 'Prompting Level Up',
      provider_name: 'Multiple',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/5.%20Prompting%20Level%20Up.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/5__Prompting_Level_Up_merged.srt',
      objective: 'Learn advanced prompting techniques like Chain of Thought, Prompt Chaining, and Retrieval Augmented Generation to solve complex tasks more accurately and reliably.',
      key_topics: ['Chain of Thought CoT prompting', 'Zero shot CoT with step by step reasoning', 'Prompt chaining for multi step workflows', 'Retrieval Augmented Generation RAG basics', 'When to use advanced prompting vs standard prompts']
    },
    {
      title: 'Multi-Mode Madness: AI Beyond Text',
      provider_name: 'Multiple',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/6.%20Multi-Mode%20Madness_%20AI%20Beyond%20Text.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/6.%20Multi-Mode%20Madness_%20AI%20Beyond%20Text.srt',
      objective: 'Understand what multimodal AI is, how it combines different input types beyond text, how LMMs differ from normal LLMs, and how to design effective prompts for multimodal use cases.',
      key_topics: ['What is multimodal AI', 'Types of modalities text image audio video', 'Difference between LLM and LMM', 'Applications of multimodal AI', 'Prompt design tips for multimodal inputs']
    },
    {
      title: 'Your AI Research Buddy with NotebookLM',
      provider_name: 'NotebookLM',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/7.%20Your%20AI%20Research%20Buddy%20with%20NotebookLM.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Your_AI_Research_Buddy_with_NotebookLM-MERGED.srt',
      objective: 'Learn what NotebookLM is and how it helps you organize sources, get grounded summaries and answers, and study faster with clear notes and audio support.',
      key_topics: ['NotebookLM overview as smart study assistant', 'Uploading and organizing sources in one place', 'Getting summaries answers and key takeaways', 'Listening to audio summaries to learn on the go', 'Building clarity and confidence with guided research']
    },
    {
      title: 'AI Agents: The Tools That Think and Act',
      provider_name: 'Multiple',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/8.%20AI%20Agents%20The%20Tools%20That%20Think%20and%20Act%20(2).mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/AI_Agents_The_Tools_That_Think_and_Act-MERGED.srt',
      objective: 'Understand what AI agents are, how they differ from normal LLMs and traditional software, how they follow the Perceive Decide Act loop, and how real world agents like travel planners inventory bots and Gemini Deep Research work.',
      key_topics: ['Definition of AI agents', 'Perceive Decide Act cycle', 'Types of AI agents simple reflex goal based learning', 'Difference between LLMs and AI agents', 'Gemini Deep Research case study']
    },
    {
      title: 'Building AI Agents with ChatGPT in Under 10 Minutes',
      provider_name: 'ChatGPT',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/9.%20Build%20Your%20First%20AI%20Agent%20with%20ChatGPT%20in%20under%2010%20Minutes%20(1).mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/9__Build_Your_First_AI_Agent_with_ChatGPT_in_under_10_Minutes_MERGED.srt',
      objective: 'Learn what agentic AI is and how to use ChatGPT Agent Mode to build a simple no code AI agent that can research, take actions, and generate practical outputs for real tasks.',
      key_topics: ['Agentic AI definition and differences from normal LLMs', 'Core building blocks of an AI agent like tools workflows and memory', 'Step by step process to build an agent in ChatGPT Agent Mode', 'Ready to use prompts for research content and email agents', 'Best practices and common mistakes when prompting AI agents']
    },
    {
      title: 'Building AI, Responsibly',
      provider_name: 'Multiple',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/10.%20Building%20AI%2C%20Responsibly.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/10__Building_AI__Responsibly_MERGED.srt',
      objective: 'Learn what Responsible AI means, why unsafe AI can cause real harm, and how to apply principles like fairness safety privacy and accountability using practical tools such as SynthID safety filters and better prompts.',
      key_topics: ['Responsible AI and its real world risks', 'Core principles fairness safety privacy accountability', 'Kai case study of AI failures', 'Tools like SynthID and safety threshold settings', 'Using refined prompts to guide safer AI behaviour']
    },
    {
      title: 'Mastering Nano Banana: From Text to Stunning Visuals in Google Gemini',
      provider_name: 'Gemini',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/11.%20Picture%20Perfect%20with%20Nano%20Banana%20Pro%20(2).mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/11_Picture_Perfect_with_Nano_Banana_Pro_merged.srt',
      objective: 'Learn what Nano Banana Pro is, how it powers high quality visual creation, and how to prompt iterate and use it safely for real world design tasks.',
      key_topics: ['Nano Banana Pro overview and capabilities', 'Platforms to access Nano Banana Pro', 'Prompting best practices for visual generation', 'Strengths limitations and safety features of Nano Banana Pro']
    },
    {
      title: 'Understand Your Data Like a Pro with Julius AI',
      provider_name: 'Julius AI',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/12.%20Understand_Your_Data_Like_a_Pro_with_Julius_AI_Redesigned%20(2).mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/12_Understand_Your_Data_Like_a_Pro_with_Julius_AI_merged.srt',
      objective: 'Learn how to use Julius AI as a no code data analyst to upload real datasets, clean them, ask structured questions, and turn them into clear insights and charts.',
      key_topics: ['Julius AI as a no code data analyst', 'Uploading and connecting your datasets', 'Cleaning and preparing messy data', 'Asking structured prompts for insights', 'Generating charts and reports for decisions']
    },
    {
      title: 'Build a Working App in 10 Minutes with Replit',
      provider_name: 'Replit',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/13.%20Build_a_Working_App_with_Replit%20(1).mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/13__Build_a_Working_App_with_Replit_merged.srt',
      objective: 'Learn how to use Replit AI Agent to turn natural language instructions into a working web app and deploy it without writing any code.',
      key_topics: ['What Replit AI Agent is', 'How Replit Agent differs from normal LLMs', 'Steps to build the DailyLift web app', 'Updating design and features using natural language', 'Deploying and sharing the finished app']
    },
    {
      title: 'Smart Prompts for Smart Teens',
      provider_name: 'Multiple',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/14.%20Smart%20Prompts%20for%20Smart%20Teens%20(1).mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Smart_Prompts_for_Smart_Teens_merged.srt',
      objective: 'Help teens level up their AI skills by using the SPARK framework, smart prompt patterns, and conversation techniques to get better answers while using AI responsibly.',
      key_topics: ['SPARK framework for smarter prompts', 'Real life prompt templates for teens', 'Conversation loop and iteration techniques', 'Persona based prompting for different roles', 'Smart and ethical AI use guidelines']
    },
    {
      title: 'Prompts Every College Student Should Master',
      provider_name: 'Multiple',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/15.%20Prompts_Every_College_Student_Should_Master%20(1).mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Prompts_Every_College_Student_merged.srt',
      objective: 'Learn how to use the CRAFT framework and practical prompt templates to study smarter, write better, prepare for exams, and get career ready with AI.',
      key_topics: ['CRAFT prompt framework', 'Study and exam prep prompts', 'Writing and research helper prompts', 'Coding and debugging assistant prompts', 'Prompting best practices and common mistakes to avoid']
    },
    {
      title: '10 Prompts Every Professional Should Master',
      provider_name: 'Multiple',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/16.%2010%20Prompts%20Every%20Professional%20Should%20Master.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/10_Prompts_Every_Professional_merged.srt',
      objective: 'Learn essential prompts for professional productivity and workplace effectiveness.',
      key_topics: ['Professional prompt templates', 'Email and communication prompts', 'Meeting and presentation prompts', 'Project management prompts', 'Professional development prompts']
    },
    {
      title: 'Build a Data Report for Your Job',
      provider_name: 'Julius AI',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/17.%20Build%20a%20Data%20Report%20for%20Your%20Job.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Build_a_Data_Report_merged.srt',
      objective: 'Learn how to use Julius AI and ChatGPT to turn real workplace data into clear, professional reports with strong insights and recommendations.',
      key_topics: ['Data literacy and career impact', 'Finding and preparing workplace data', 'Analyzing data with Julius AI', 'Writing professional reports with ChatGPT', 'End to end data report workflow']
    },
    {
      title: 'Automate Your Workday with AI',
      provider_name: 'n8n',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/18.%20Automate%20Your%20Workday%20with%20AI.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/18__Automate_Your_Workday_with_AI_merged.srt',
      objective: 'Learn how to build a no code automated follow up email system that uses Google Sheets Zapier ChatGPT and Gmail to send personalized emails whenever you add a new contact.',
      key_topics: ['Follow up automation workflow', 'Setting up Google Sheets contacts', 'Connecting Google Sheets to Zapier', 'Using ChatGPT to generate emails', 'Sending emails automatically with Gmail']
    },
    {
      title: 'Top Prompts for Entrepreneurs and Business Owners',
      provider_name: 'Multiple',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/AI%20Prompts%20That%20Actually%20Work%20For%20Entrepreneurs%20%26%20Business%20Owners.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/AI_Prompts_That_Actually_Work_merged.srt',
      objective: 'Learn how to use structured AI prompt frameworks to solve real business problems in sales, finance, marketing, and operations as an entrepreneur or business owner.',
      key_topics: ['RCTF prompt framework for business', 'Sales and customer acquisition prompts', 'Financial analysis and forecasting prompts', 'Content and marketing engine prompts', 'Operations automation and delegation prompts']
    },
    {
      title: 'Canva AI 101',
      provider_name: 'Canva',
      level: 'beginner',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/23.%20Canva_AI_Magic_Studio_Guide%20(1).mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/23__Canva_AI_Magic_Studio_Guide_merged.srt',
      objective: 'Understand Canva Magic Studio and how to use its AI powered tools to create, edit, and repurpose visual content faster and more creatively.',
      key_topics: ['Canva Magic Studio overview', 'Magic Write and Magic Design features', 'Magic Media image and video generation', 'Magic photo and design editing tools', 'Free and Pro AI feature differences']
    },
    // INTERMEDIATE LESSONS
    {
      title: 'Claude Cowork 101',
      provider_name: 'Claude',
      level: 'intermediate',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Claude_Cowork_for_Non-Developers%20(1)%20(1).mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Claude_Cowork_v3_Merged_Final.srt',
      objective: 'Learn to use Claude for collaborative work and projects.',
      key_topics: ['Claude Cowork overview', 'Project collaboration features', 'Document analysis and synthesis', 'Workflow optimization']
    },
    {
      title: 'Building Custom GPTs in ChatGPT: Create Your Personal AI Assistant',
      provider_name: 'ChatGPT',
      level: 'intermediate',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Custom_GPTs%20with%20ChatGPT.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Custom_GPTs_with_ChatGPT-MERGED.srt',
      objective: 'Learn to create custom GPTs for specific use cases and workflows.',
      key_topics: ['Custom GPT setup', 'Configuration options', 'Knowledge base integration', 'Sharing and deployment']
    },
    {
      title: 'Google Whisk Mastery: Visual AI Image Generation Without Prompting',
      provider_name: 'Google Whisk',
      level: 'intermediate',
      video_url: 'https://assets.myaicademy.com/Google_Whisk_AI_Image_Generation.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Google_Whisk_AI_Image_Generation-MERGED.srt',
      objective: 'Master visual AI image generation using Google Whisk without text prompts.',
      key_topics: ['Google Whisk interface', 'Image-to-image generation', 'Style transfer techniques', 'Creative applications']
    },
    {
      title: 'Perplexity AI for Research & Fact-Checking',
      provider_name: 'Perplexity',
      level: 'intermediate',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Perplexity_AI_Research_Course.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Perplexity_AI_Research_Course_merged.srt',
      objective: 'Use Perplexity AI for accurate research and fact-checking.',
      key_topics: ['Perplexity search features', 'Source verification', 'Research workflows', 'Citation management']
    },
    {
      title: 'Google Veo 3 Foundations: AI Video Creation with Native Audio & Lip-Sync',
      provider_name: 'Veo',
      level: 'intermediate',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Veo3_Lesson1_Foundations.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Veo3_Lesson1_Foundations-MERGED.srt',
      objective: 'Learn the fundamentals of AI video creation with Google Veo 3.',
      key_topics: ['Veo 3 interface overview', 'Text-to-video generation', 'Native audio integration', 'Lip-sync capabilities']
    },
    {
      title: 'Google Veo 3 Prompting: The 7-Element Framework for Professional Videos',
      provider_name: 'Veo',
      level: 'intermediate',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Veo3_Lesson2_Prompting%20Mastery%20.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Veo3_Lesson2_Prompting_Mastery-MERGED.srt',
      objective: 'Master the 7-element framework for creating professional AI videos.',
      key_topics: ['7-element prompting framework', 'Scene composition', 'Camera movements', 'Professional video techniques']
    },
    {
      title: 'ElevenLabs Essentials: Text-to-Speech & Voice Selection',
      provider_name: 'ElevenLabs',
      level: 'intermediate',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/ElevenLabs_Lesson1_TTS_Voice_Library.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/ElevenLabs_Lesson1_TTS_Voice_Library-MERGED.srt',
      objective: 'Learn text-to-speech basics and voice selection in ElevenLabs.',
      key_topics: ['Text-to-speech fundamentals', 'Voice library navigation', 'Voice selection criteria', 'Audio output settings']
    },
    {
      title: 'Midjourney Essentials: AI Image Creation for Beginners',
      provider_name: 'MidJourney',
      level: 'intermediate',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Mastering%20Midjourney_%20Foundation.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Mastering_Midjourney_Foundation-MERGED.srt',
      objective: 'Learn the fundamentals of AI image creation with Midjourney.',
      key_topics: ['Midjourney interface', 'Basic prompting techniques', 'Style parameters', 'Image variations']
    },
    // ADVANCED LESSONS
    {
      title: 'Prompt Chaining with ChatGPT: Build Multi-Step AI Workflows',
      provider_name: 'ChatGPT',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Prompt%20Chaining%20with%20ChatGPT_%20Build%20Multi-Step%20AI%20Workflows.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Prompt_Chaining_with_ChatGPT-MERGED.srt',
      objective: 'Build complex multi-step AI workflows using prompt chaining.',
      key_topics: ['Prompt chaining concepts', 'Workflow design', 'Output handling', 'Error management']
    },
    {
      title: 'XML Tags & Structured Outputs with Claude: Get Perfectly Formatted Responses',
      provider_name: 'Claude',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/XML_Tags_Structured_Outputs%20with%20Claude%20AI.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/XML_Tags_Structured_Outputs_with_Claude_AI-MERGED.srt',
      objective: 'Master structured outputs and XML tags with Claude for consistent formatting.',
      key_topics: ['XML tag syntax', 'Structured output patterns', 'Data extraction', 'Format consistency']
    },
    {
      title: 'Claude AI Fundamentals: Deep Reasoning, Artifacts, and Projects',
      provider_name: 'Claude',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Claude%20AI%20Fundamentals_%20Deep%20Reasoning%2C%20Artifacts%2C%20and%20Projects.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Claude_AI_Fundamentals-MERGED.srt',
      objective: 'Master Claude advanced features including deep reasoning and artifacts.',
      key_topics: ['Deep reasoning capabilities', 'Artifacts creation', 'Project management', 'Advanced use cases']
    },
    {
      title: 'Midjourney Mastery: Editing & Advanced Features Made Simple',
      provider_name: 'MidJourney',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Mastering%20Midjourney.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Mastering_Midjourney_Lesson3-MERGED.srt',
      objective: 'Master advanced Midjourney editing and features.',
      key_topics: ['Advanced editing techniques', 'Inpainting and outpainting', 'Style tuning', 'Batch processing']
    },
    {
      title: 'Google Veo 3 Storytelling: Characters, Scenes & Multi-Shot Narratives',
      provider_name: 'Veo',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Veo3_Lesson3_SceneBuilding.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Veo3_Lesson3_SceneBuilding-MERGED.srt',
      objective: 'Create compelling multi-shot narratives with Veo 3.',
      key_topics: ['Character consistency', 'Scene transitions', 'Multi-shot planning', 'Narrative structure']
    },
    {
      title: 'ElevenLabs Advanced: Voice Cloning & Transformation',
      provider_name: 'ElevenLabs',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/ElevenLabs_Lesson2_Voice_Changer_Cloning.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/ElevenLabs_Lesson2_Voice_Changer_Cloning-MERGED.srt',
      objective: 'Master voice cloning and transformation in ElevenLabs.',
      key_topics: ['Voice cloning process', 'Voice transformation', 'Custom voice creation', 'Ethical considerations']
    },
    {
      title: 'n8n Fundamentals: Building Your First Automation Workflow',
      provider_name: 'n8n',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/n8n%20Automation%20for%20Everyone.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/n8n_Automation_for_Everyone-MERGED.srt',
      objective: 'Build powerful automation workflows with n8n.',
      key_topics: ['n8n interface overview', 'Workflow nodes', 'Trigger configuration', 'Data transformation']
    },
    {
      title: 'Lovable No-Code Platform: Build Full-Stack Apps in Minutes',
      provider_name: 'Lovable',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Lovable%20Build%20%20Apps%20Without%20Code.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Lovable_Build_Apps_Without_Code-MERGED.srt',
      objective: 'Build full-stack applications using Lovable no-code platform.',
      key_topics: ['Lovable interface', 'App architecture', 'Database integration', 'Deployment options']
    },
    // PROJECT-BASED LESSONS
    {
      title: 'Build a LinkedIn Content Workflow (n8n + Claude)',
      provider_name: 'n8n',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Project%20Build%20a%20LinkedIn%20Content%20Workflow%20n8n%20and%20Claude.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Project_Build_LinkedIn_Merged_Final.srt',
      objective: 'Build an automated LinkedIn content workflow using n8n and Claude.',
      key_topics: ['LinkedIn API integration', 'Content automation', 'AI content generation', 'Scheduling and posting']
    },
    {
      title: 'Create a 30-Day Content Calendar (Claude + Canva)',
      provider_name: 'Claude',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/30-Day-Content-Calendar-Lesson.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/30-Day-Content-Calendar-Lesson-MERGED.srt',
      objective: 'Create a comprehensive content calendar using Claude and Canva.',
      key_topics: ['Content planning strategies', 'AI-assisted ideation', 'Visual content creation', 'Calendar organization']
    },
    {
      title: 'Build a Complete Brand Campaign (Midjourney + Veo 3)',
      provider_name: 'MidJourney',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Brand-Campaign-Lesson.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Brand_Campaign_Merged_Final.srt',
      objective: 'Build a complete brand campaign using Midjourney and Veo 3.',
      key_topics: ['Brand identity development', 'Visual asset creation', 'Video content production', 'Campaign integration']
    },
    {
      title: 'Build a Sales Outreach System (Custom GPT + n8n)',
      provider_name: 'ChatGPT',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Build%20an%20%20Automated%20Sales%20%20Outreach%20System.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Automated_Sales_Outreach_Merged_Final.srt',
      objective: 'Build an automated sales outreach system using Custom GPT and n8n.',
      key_topics: ['Lead management', 'Personalized outreach', 'Automation workflows', 'CRM integration']
    },
    {
      title: 'Create an Investor Pitch Deck (Claude + Gamma)',
      provider_name: 'Claude',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Investor-Pitch-Deck-Lesson.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Investor_Pitch_Deck_Merged_Final.srt',
      objective: 'Create a compelling investor pitch deck using Claude and Gamma.',
      key_topics: ['Pitch deck structure', 'Narrative development', 'Visual presentation', 'Investor communication']
    },
    {
      title: 'Introduction to Sora 2: Setup, Features & Limitations',
      provider_name: 'Sora',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Introduction%20to%20Sora%202_%20Setup%2C%20Features%20%26%20Limitations.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Introduction_to_Sora_2_Merged_Final%20(1).srt',
      objective: 'Get started with Sora 2 video generation.',
      key_topics: ['Sora 2 setup', 'Core features', 'Known limitations', 'Best practices']
    },
    {
      title: 'Advanced Sora 2: Interface, Tools & Production Workflow',
      provider_name: 'Sora',
      level: 'advanced',
      video_url: 'https://assets.myaicademy.com/Course%20Videos/Sora2_Part2_Complete.mp4',
      caption_url: 'https://assets.myaicademy.com/Updated%20Subtitles/Sora2_Part2_Merged_Final.srt',
      objective: 'Master Sora 2 production workflows.',
      key_topics: ['Advanced interface', 'Production tools', 'Workflow optimization', 'Output management']
    }
  ];

  // Get provider IDs for linking
  const providerMap = {};
  store.providers.findAll().forEach(p => {
    providerMap[p.name] = p.id;
  });

  // Save to database
  const lessons = [];
  for (const l of lessonData) {
    const lesson = store.lessons.create({
      ...l,
      provider_id: providerMap[l.provider_name] || null
    });
    lessons.push(lesson);
  }

  // Export parsed JSON
  const output = {
    generated_at: new Date().toISOString(),
    source_file: files[0] || 'hardcoded from PDF analysis',
    lessons
  };

  writeFileSync(join(CONTEXT_DIR, 'lessons.parsed.json'), JSON.stringify(output, null, 2));
  console.log(`Parsed ${lessons.length} lessons`);

  return lessons;
}

/**
 * Parse courses from the Phase 1 All Courses PDF
 */
export async function parseCourses() {
  const curriculumDir = join(INPUTS_DIR, 'curriculum');
  const files = readdirSync(curriculumDir).filter(f => f.endsWith('.pdf'));

  // Snapshot source files
  for (const file of files) {
    snapshotFile(join(curriculumDir, file));
  }

  // Course structure with lesson assignments in correct order
  // Lesson titles must match exactly what's in the lessons data
  const courseData = [
    // HIGH SCHOOL TRACK
    {
      name: 'AI Foundations for High School Students',
      track: 'high_school',
      level: 'beginner',
      lessons: [
        'Say Hello to Generative AI',
        'Large Language Models (LLMs) Unpacked — Part 1',
        'Large Language Models (LLMs) Unpacked — Part 2',
        'Prompt Like a Pro',
        'Prompting Level Up',
        'Smart Prompts for Smart Teens',
        'Multi-Mode Madness: AI Beyond Text',
        'Your AI Research Buddy with NotebookLM',
        'AI Agents: The Tools That Think and Act',
        'Building AI, Responsibly'
      ]
    },
    {
      name: 'AI Accelerators for High School Students',
      track: 'high_school',
      level: 'intermediate',
      lessons: [
        'Claude Cowork 101',
        'Building Custom GPTs in ChatGPT: Create Your Personal AI Assistant',
        'Perplexity AI for Research & Fact-Checking',
        'Midjourney Essentials: AI Image Creation for Beginners'
      ]
    },
    {
      name: 'AI Trailblazers for High School Students',
      track: 'high_school',
      level: 'advanced',
      lessons: [
        'Prompt Chaining with ChatGPT: Build Multi-Step AI Workflows',
        'XML Tags & Structured Outputs with Claude: Get Perfectly Formatted Responses',
        'Midjourney Mastery: Editing & Advanced Features Made Simple'
      ]
    },
    // COLLEGE TRACK
    {
      name: 'Applied AI for College Students',
      track: 'college',
      level: 'beginner',
      lessons: [
        'Say Hello to Generative AI',
        'Large Language Models (LLMs) Unpacked — Part 1',
        'Large Language Models (LLMs) Unpacked — Part 2',
        'Prompt Like a Pro',
        'Prompting Level Up',
        'Prompts Every College Student Should Master',
        'Multi-Mode Madness: AI Beyond Text',
        'Your AI Research Buddy with NotebookLM',
        'AI Agents: The Tools That Think and Act',
        'Building AI Agents with ChatGPT in Under 10 Minutes',
        'Building AI, Responsibly'
      ]
    },
    {
      name: 'AI Amplifiers for College Students',
      track: 'college',
      level: 'intermediate',
      lessons: [
        'Claude Cowork 101',
        'Building Custom GPTs in ChatGPT: Create Your Personal AI Assistant',
        'Perplexity AI for Research & Fact-Checking',
        'Google Veo 3 Foundations: AI Video Creation with Native Audio & Lip-Sync',
        'ElevenLabs Essentials: Text-to-Speech & Voice Selection'
      ]
    },
    {
      name: 'AI Catalysts for College Students',
      track: 'college',
      level: 'advanced',
      lessons: [
        'Prompt Chaining with ChatGPT: Build Multi-Step AI Workflows',
        'Claude AI Fundamentals: Deep Reasoning, Artifacts, and Projects',
        'Google Veo 3 Prompting: The 7-Element Framework for Professional Videos',
        'n8n Fundamentals: Building Your First Automation Workflow'
      ]
    },
    // EARLY CAREER TRACK
    {
      name: 'AI for Early Career Professionals',
      track: 'early_career',
      level: 'beginner',
      lessons: [
        'Say Hello to Generative AI',
        'Large Language Models (LLMs) Unpacked — Part 1',
        'Large Language Models (LLMs) Unpacked — Part 2',
        'Prompt Like a Pro',
        'Prompting Level Up',
        '10 Prompts Every Professional Should Master',
        'Multi-Mode Madness: AI Beyond Text',
        'AI Agents: The Tools That Think and Act',
        'Building AI Agents with ChatGPT in Under 10 Minutes',
        'Build a Data Report for Your Job',
        'Automate Your Workday with AI',
        'Building AI, Responsibly'
      ]
    },
    {
      name: 'AI Practitioners for Early Career Professionals',
      track: 'early_career',
      level: 'intermediate',
      lessons: [
        'Claude Cowork 101',
        'Building Custom GPTs in ChatGPT: Create Your Personal AI Assistant',
        'Perplexity AI for Research & Fact-Checking',
        'Understand Your Data Like a Pro with Julius AI'
      ]
    },
    {
      name: 'AI Strategists for Early Career Professionals',
      track: 'early_career',
      level: 'advanced',
      lessons: [
        'Prompt Chaining with ChatGPT: Build Multi-Step AI Workflows',
        'Claude AI Fundamentals: Deep Reasoning, Artifacts, and Projects',
        'n8n Fundamentals: Building Your First Automation Workflow',
        'Build a LinkedIn Content Workflow (n8n + Claude)',
        'Build a Sales Outreach System (Custom GPT + n8n)'
      ]
    },
    // CREATIVE TRACK
    {
      name: 'AI for Creative Professionals',
      track: 'creative',
      level: 'beginner',
      lessons: [
        'Say Hello to Generative AI',
        'Prompt Like a Pro',
        'Multi-Mode Madness: AI Beyond Text',
        'Mastering Nano Banana: From Text to Stunning Visuals in Google Gemini',
        'Canva AI 101',
        'Building AI, Responsibly'
      ]
    },
    {
      name: 'AI Creators for Creative Professionals',
      track: 'creative',
      level: 'intermediate',
      lessons: [
        'Google Whisk Mastery: Visual AI Image Generation Without Prompting',
        'Google Veo 3 Foundations: AI Video Creation with Native Audio & Lip-Sync',
        'Google Veo 3 Prompting: The 7-Element Framework for Professional Videos',
        'ElevenLabs Essentials: Text-to-Speech & Voice Selection',
        'Midjourney Essentials: AI Image Creation for Beginners'
      ]
    },
    {
      name: 'AI Visionaries for Creative Professionals',
      track: 'creative',
      level: 'advanced',
      lessons: [
        'Midjourney Mastery: Editing & Advanced Features Made Simple',
        'Google Veo 3 Storytelling: Characters, Scenes & Multi-Shot Narratives',
        'ElevenLabs Advanced: Voice Cloning & Transformation',
        'Create a 30-Day Content Calendar (Claude + Canva)',
        'Build a Complete Brand Campaign (Midjourney + Veo 3)',
        'Introduction to Sora 2: Setup, Features & Limitations',
        'Advanced Sora 2: Interface, Tools & Production Workflow'
      ]
    },
    // ENTREPRENEUR TRACK
    {
      name: 'AI for Entrepreneurs & Business Owners',
      track: 'entrepreneur',
      level: 'beginner',
      lessons: [
        'Say Hello to Generative AI',
        'Large Language Models (LLMs) Unpacked — Part 1',
        'Prompt Like a Pro',
        'Top Prompts for Entrepreneurs and Business Owners',
        'AI Agents: The Tools That Think and Act',
        'Building AI Agents with ChatGPT in Under 10 Minutes',
        'Understand Your Data Like a Pro with Julius AI',
        'Building AI, Responsibly'
      ]
    },
    {
      name: 'AI Growth for Entrepreneurs & Business Owners',
      track: 'entrepreneur',
      level: 'intermediate',
      lessons: [
        'Building Custom GPTs in ChatGPT: Create Your Personal AI Assistant',
        'Perplexity AI for Research & Fact-Checking',
        'Claude Cowork 101'
      ]
    },
    {
      name: 'AI Mastery for Entrepreneurs & Business Owners',
      track: 'entrepreneur',
      level: 'advanced',
      lessons: [
        'Claude AI Fundamentals: Deep Reasoning, Artifacts, and Projects',
        'n8n Fundamentals: Building Your First Automation Workflow',
        'Lovable No-Code Platform: Build Full-Stack Apps in Minutes',
        'Build a LinkedIn Content Workflow (n8n + Claude)',
        'Build a Sales Outreach System (Custom GPT + n8n)',
        'Create an Investor Pitch Deck (Claude + Gamma)'
      ]
    },
    // EVERYONE TRACK
    {
      name: 'Master Generative AI for Everyone',
      track: 'everyone',
      level: 'beginner',
      lessons: [
        'Say Hello to Generative AI',
        'Large Language Models (LLMs) Unpacked — Part 1',
        'Large Language Models (LLMs) Unpacked — Part 2',
        'Prompt Like a Pro',
        'Prompting Level Up',
        'Multi-Mode Madness: AI Beyond Text',
        'Your AI Research Buddy with NotebookLM',
        'AI Agents: The Tools That Think and Act',
        'Building AI, Responsibly'
      ]
    },
    {
      name: 'Generative AI Accelerator for Everyone',
      track: 'everyone',
      level: 'intermediate',
      lessons: [
        'Claude Cowork 101',
        'Building Custom GPTs in ChatGPT: Create Your Personal AI Assistant',
        'Perplexity AI for Research & Fact-Checking',
        'Google Veo 3 Foundations: AI Video Creation with Native Audio & Lip-Sync',
        'Midjourney Essentials: AI Image Creation for Beginners'
      ]
    },
    {
      name: 'Generative AI Mastery for Everyone',
      track: 'everyone',
      level: 'advanced',
      lessons: [
        'Prompt Chaining with ChatGPT: Build Multi-Step AI Workflows',
        'XML Tags & Structured Outputs with Claude: Get Perfectly Formatted Responses',
        'Claude AI Fundamentals: Deep Reasoning, Artifacts, and Projects',
        'n8n Fundamentals: Building Your First Automation Workflow',
        'Lovable No-Code Platform: Build Full-Stack Apps in Minutes'
      ]
    }
  ];

  // Get all lessons for ID lookup
  const allLessons = store.lessons.findAll();
  const lessonMap = {};
  allLessons.forEach(l => {
    lessonMap[l.title] = l.id;
  });

  // Save to database
  const courses = [];
  const db = store.getDb();

  for (const c of courseData) {
    // Get lesson IDs in order
    const lessonIds = [];
    for (const lessonTitle of (c.lessons || [])) {
      if (lessonMap[lessonTitle]) {
        lessonIds.push(lessonMap[lessonTitle]);
      } else {
        console.warn(`Warning: Lesson not found: "${lessonTitle}"`);
      }
    }

    const course = store.courses.create({
      name: c.name,
      track: c.track,
      level: c.level,
      lesson_ids: lessonIds
    });

    // Also populate the course_lessons junction table with positions
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO course_lessons (course_id, lesson_id, position)
      VALUES (?, ?, ?)
    `);

    lessonIds.forEach((lessonId, index) => {
      insertStmt.run(course.id, lessonId, index + 1);
    });

    courses.push(course);
  }

  // Export parsed JSON
  const output = {
    generated_at: new Date().toISOString(),
    source_file: files[0] || 'hardcoded from PDF analysis',
    courses
  };

  writeFileSync(join(CONTEXT_DIR, 'courses.parsed.json'), JSON.stringify(output, null, 2));
  console.log(`Parsed ${courses.length} courses`);

  return courses;
}

/**
 * Parse mapping rules from the Mapping Matrix PDF
 */
export async function parseMappingRules() {
  const mappingDir = join(INPUTS_DIR, 'mapping');
  const files = readdirSync(mappingDir).filter(f => f.endsWith('.pdf'));

  // Snapshot source files
  for (const file of files) {
    snapshotFile(join(mappingDir, file));
  }

  // Mapping rules from the source document
  const mappingData = [
    // Q2: Primary course assignment by user role
    { question_id: 'Q2', question_text: 'What are you right now?', answer_value: 'School student (13–17)', recommended_course: 'AI Foundations for High School Students', recommended_track: 'high_school', priority: 10 },
    { question_id: 'Q2', question_text: 'What are you right now?', answer_value: 'College student (18–22)', recommended_course: 'Applied AI for College Students', recommended_track: 'college', priority: 10 },
    { question_id: 'Q2', question_text: 'What are you right now?', answer_value: 'Working professional (22+)', recommended_course: 'AI for Early Career Professionals', recommended_track: 'early_career', priority: 10 },
    { question_id: 'Q2', question_text: 'What are you right now?', answer_value: 'Running my own business', recommended_course: 'AI for Entrepreneurs and Business Owners', recommended_track: 'entrepreneur', priority: 10 },
    { question_id: 'Q2', question_text: 'What are you right now?', answer_value: 'Retired or taking time off', recommended_course: 'Generative AI for Everyone', recommended_track: 'everyone', priority: 10 },

    // Q3: AI Familiarity (secondary signal)
    { question_id: 'Q3', question_text: 'How familiar are you with AI tools?', answer_value: 'Never Used AI', recommended_course: null, recommended_track: null, priority: 3 },
    { question_id: 'Q3', question_text: 'How familiar are you with AI tools?', answer_value: 'Tried once or twice (e.g., ChatGPT, Gemini)', recommended_course: null, recommended_track: null, priority: 4 },
    { question_id: 'Q3', question_text: 'How familiar are you with AI tools?', answer_value: 'Use AI regularly for simple tasks', recommended_course: null, recommended_track: null, priority: 5 },
    { question_id: 'Q3', question_text: 'How familiar are you with AI tools?', answer_value: 'Comfortable with AI, want to push into pro techniques', recommended_course: null, recommended_track: null, priority: 6 },

    // Q4: Learning motivation
    { question_id: 'Q4', question_text: 'Why do you want to learn AI?', answer_value: 'Stay competitive at work', recommended_course: null, recommended_track: 'early_career', priority: 5 },
    { question_id: 'Q4', question_text: 'Why do you want to learn AI?', answer_value: 'Automate repetitive tasks', recommended_course: null, recommended_track: null, priority: 5 },
    { question_id: 'Q4', question_text: 'Why do you want to learn AI?', answer_value: 'Explore creative possibilities', recommended_course: 'AI for Creative Professionals', recommended_track: 'creative', priority: 7 },
    { question_id: 'Q4', question_text: 'Why do you want to learn AI?', answer_value: 'Future-proof my skills', recommended_course: null, recommended_track: null, priority: 5 },

    // Q5: Learning goal
    { question_id: 'Q5', question_text: 'Select your AI Learning Goal', answer_value: 'Apply AI in my daily life', recommended_course: null, recommended_track: 'everyone', priority: 4 },
    { question_id: 'Q5', question_text: 'Select your AI Learning Goal', answer_value: 'Building a career in AI', recommended_course: null, recommended_track: null, priority: 6 },

    // Q9: Field/Profession specific recommendations
    { question_id: 'Q9', question_text: 'Which of these best describes your field or profession?', answer_value: 'Student', recommended_course: null, recommended_track: 'college', priority: 3 },
    { question_id: 'Q9', question_text: 'Which of these best describes your field or profession?', answer_value: 'Legal', recommended_course: null, recommended_track: 'early_career', priority: 3 },
    { question_id: 'Q9', question_text: 'Which of these best describes your field or profession?', answer_value: 'Healthcare', recommended_course: null, recommended_track: 'early_career', priority: 3 },
    { question_id: 'Q9', question_text: 'Which of these best describes your field or profession?', answer_value: 'Finance', recommended_course: null, recommended_track: 'early_career', priority: 3 },
    { question_id: 'Q9', question_text: 'Which of these best describes your field or profession?', answer_value: 'Design', recommended_course: null, recommended_track: 'creative', priority: 4 },
    { question_id: 'Q9', question_text: 'Which of these best describes your field or profession?', answer_value: 'Architecture', recommended_course: null, recommended_track: 'creative', priority: 4 },
    { question_id: 'Q9', question_text: 'Which of these best describes your field or profession?', answer_value: 'Journalism', recommended_course: null, recommended_track: 'creative', priority: 3 }
  ];

  // Save to database
  const rules = [];
  for (const r of mappingData) {
    const rule = store.mappingRules.create({ ...r, created_by: 'system' });
    rules.push(rule);
  }

  // Export parsed JSON
  const output = {
    generated_at: new Date().toISOString(),
    source_file: files[0] || 'hardcoded from PDF analysis',
    mapping_rules: rules
  };

  writeFileSync(join(CONTEXT_DIR, 'mapping.parsed.json'), JSON.stringify(output, null, 2));
  console.log(`Parsed ${rules.length} mapping rules`);

  return rules;
}

/**
 * Run full ingestion pipeline
 */
export async function ingestAll() {
  console.log('Starting full ingestion pipeline...\n');

  // Initialize database
  store.initDb();

  // Parse all sources in order (providers first for foreign key references)
  console.log('1. Parsing providers...');
  const providers = await parseProviders();

  console.log('\n2. Parsing lessons...');
  const lessons = await parseLessons();

  console.log('\n3. Parsing courses...');
  const courses = await parseCourses();

  console.log('\n4. Parsing mapping rules...');
  const mappingRules = await parseMappingRules();

  console.log('\n✓ Ingestion complete!');
  console.log(`  - ${providers.length} providers`);
  console.log(`  - ${lessons.length} lessons`);
  console.log(`  - ${courses.length} courses`);
  console.log(`  - ${mappingRules.length} mapping rules`);
  console.log(`\nParsed JSON files saved to: ${CONTEXT_DIR}`);
  console.log(`Source snapshots saved to: ${SNAPSHOTS_DIR}`);

  return { providers, lessons, courses, mappingRules };
}

export default {
  parsePdf,
  parseProviders,
  parseLessons,
  parseCourses,
  parseMappingRules,
  ingestAll
};
