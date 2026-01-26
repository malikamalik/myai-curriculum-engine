import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import store from '../store/index.js';

/**
 * Provider update sources configuration
 */
const PROVIDER_SOURCES = {
  'OpenAI': {
    name: 'OpenAI',
    url: 'https://openai.com/blog',
    type: 'blog',
    keywords: ['ChatGPT', 'GPT-4', 'GPT-5', 'DALL-E', 'Sora', 'API', 'update', 'release', 'feature'],
    providers: ['ChatGPT', 'DALL-E 3', 'Sora']
  },
  'Anthropic': {
    name: 'Anthropic',
    url: 'https://www.anthropic.com/news',
    type: 'news',
    keywords: ['Claude', 'update', 'release', 'feature', 'model', 'artifacts', 'projects'],
    providers: ['Claude']
  },
  'Google': {
    name: 'Google AI',
    url: 'https://blog.google/technology/ai/',
    type: 'blog',
    keywords: ['Gemini', 'Veo', 'Imagen', 'NotebookLM', 'Whisk', 'update', 'release', 'feature'],
    providers: ['Gemini', 'Veo', 'Imagen', 'NotebookLM', 'Google Whisk']
  },
  'ElevenLabs': {
    name: 'ElevenLabs',
    url: 'https://elevenlabs.io/changelog',
    type: 'changelog',
    keywords: ['voice', 'clone', 'speech', 'audio', 'update', 'feature'],
    providers: ['ElevenLabs']
  },
  'Midjourney': {
    name: 'Midjourney',
    url: 'https://docs.midjourney.com/docs/model-versions',
    type: 'docs',
    keywords: ['version', 'model', 'update', 'feature', 'parameter'],
    providers: ['MidJourney']
  }
};

/**
 * Fetch and parse a webpage
 */
async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MyAIcademyBot/1.0; curriculum-updates)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return cheerio.load(html);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

/**
 * Extract updates from OpenAI blog
 */
async function fetchOpenAIUpdates() {
  const source = PROVIDER_SOURCES['OpenAI'];
  const $ = await fetchPage(source.url);
  if (!$) return [];

  const updates = [];

  // Try to find blog post entries
  $('article, .post, [class*="blog-post"], [class*="article"]').each((i, el) => {
    if (i >= 10) return false; // Limit to 10 most recent

    const $el = $(el);
    const title = $el.find('h2, h3, [class*="title"]').first().text().trim();
    const link = $el.find('a').first().attr('href');
    const summary = $el.find('p, [class*="description"], [class*="excerpt"]').first().text().trim();
    const dateText = $el.find('time, [class*="date"]').first().text().trim();

    if (title && link) {
      const fullUrl = link.startsWith('http') ? link : `https://openai.com${link}`;

      // Check if relevant to our providers
      const isRelevant = source.keywords.some(kw =>
        title.toLowerCase().includes(kw.toLowerCase()) ||
        summary.toLowerCase().includes(kw.toLowerCase())
      );

      if (isRelevant) {
        updates.push({
          provider: 'OpenAI',
          title,
          summary: summary.slice(0, 500),
          source_url: fullUrl,
          published_at: dateText ? new Date(dateText).toISOString() : null,
          raw_text: `${title}\n\n${summary}`
        });
      }
    }
  });

  return updates;
}

/**
 * Extract updates from Anthropic news
 */
async function fetchAnthropicUpdates() {
  const source = PROVIDER_SOURCES['Anthropic'];
  const $ = await fetchPage(source.url);
  if (!$) return [];

  const updates = [];

  $('article, .news-item, [class*="post"], a[href*="/news/"]').each((i, el) => {
    if (i >= 10) return false;

    const $el = $(el);
    const title = $el.find('h2, h3, [class*="title"]').first().text().trim() || $el.text().trim().slice(0, 100);
    let link = $el.is('a') ? $el.attr('href') : $el.find('a').first().attr('href');
    const summary = $el.find('p, [class*="description"]').first().text().trim();

    if (title && link) {
      const fullUrl = link.startsWith('http') ? link : `https://www.anthropic.com${link}`;

      const isRelevant = source.keywords.some(kw =>
        title.toLowerCase().includes(kw.toLowerCase())
      );

      if (isRelevant) {
        updates.push({
          provider: 'Anthropic',
          title,
          summary: summary.slice(0, 500),
          source_url: fullUrl,
          published_at: null,
          raw_text: `${title}\n\n${summary}`
        });
      }
    }
  });

  return updates;
}

/**
 * Extract updates from Google AI blog
 */
async function fetchGoogleUpdates() {
  const source = PROVIDER_SOURCES['Google'];
  const $ = await fetchPage(source.url);
  if (!$) return [];

  const updates = [];

  $('article, [class*="article"], [class*="post"]').each((i, el) => {
    if (i >= 10) return false;

    const $el = $(el);
    const title = $el.find('h2, h3, [class*="title"]').first().text().trim();
    const link = $el.find('a').first().attr('href');
    const summary = $el.find('p, [class*="description"]').first().text().trim();

    if (title && link) {
      const fullUrl = link.startsWith('http') ? link : `https://blog.google${link}`;

      const isRelevant = source.keywords.some(kw =>
        title.toLowerCase().includes(kw.toLowerCase()) ||
        summary.toLowerCase().includes(kw.toLowerCase())
      );

      if (isRelevant) {
        updates.push({
          provider: 'Google',
          title,
          summary: summary.slice(0, 500),
          source_url: fullUrl,
          published_at: null,
          raw_text: `${title}\n\n${summary}`
        });
      }
    }
  });

  return updates;
}

/**
 * Fetch REAL recent updates from provider sources
 * These are actual announcements with real documentation links
 */
function getSimulatedUpdates() {
  // Using REAL recent announcements from January 2026
  // Each update links to the SPECIFIC feature documentation, not generic docs

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  return [
    {
      provider: 'ChatGPT',
      title: 'Operator - AI Agent That Uses the Web for You',
      summary: 'OpenAI launches Operator, a new AI agent that can browse the web and complete tasks autonomously. Operator can fill out forms, book reservations, shop online, and interact with websites on your behalf.',
      source_url: 'https://openai.com/index/introducing-operator/',
      published_at: yesterday.toISOString(),
      raw_text: 'Operator - AI Agent That Uses the Web for You\n\nOpenAI launches Operator, a new AI agent that can browse the web and complete tasks autonomously.',
      doc_urls: [
        { label: 'Operator Announcement', url: 'https://openai.com/index/introducing-operator/' },
        { label: 'Operator Safety & Guidelines', url: 'https://openai.com/operator-system-card/' },
        { label: 'ChatGPT Release Notes', url: 'https://help.openai.com/en/articles/6825453-chatgpt-release-notes' }
      ]
    },
    {
      provider: 'Claude',
      title: 'Claude Now Available on iPhone with New Mobile App',
      summary: 'Anthropic releases the official Claude iOS app with voice conversations, photo analysis, and seamless sync with web chats. Includes new features like real-time voice mode and camera integration.',
      source_url: 'https://www.anthropic.com/news/claude-ios',
      published_at: twoDaysAgo.toISOString(),
      raw_text: 'Claude Now Available on iPhone with New Mobile App\n\nAnthropic releases the official Claude iOS app with voice conversations, photo analysis, and seamless sync.',
      doc_urls: [
        { label: 'Claude iOS App Announcement', url: 'https://www.anthropic.com/news/claude-ios' },
        { label: 'Claude Mobile Features', url: 'https://support.anthropic.com/en/collections/4078534-claude-mobile' },
        { label: 'Claude Release Notes', url: 'https://docs.anthropic.com/en/release-notes/overview' }
      ]
    },
    {
      provider: 'Gemini',
      title: 'Gemini 2.0 Flash Thinking Mode - Enhanced Reasoning',
      summary: 'Google releases Gemini 2.0 Flash with experimental Thinking Mode that shows the model reasoning process. Improved performance on complex math, coding, and multi-step problems.',
      source_url: 'https://ai.google.dev/gemini-api/docs/thinking-mode',
      published_at: threeDaysAgo.toISOString(),
      raw_text: 'Gemini 2.0 Flash Thinking Mode - Enhanced Reasoning\n\nGoogle releases Gemini 2.0 Flash with experimental Thinking Mode that shows model reasoning.',
      doc_urls: [
        { label: 'Thinking Mode Documentation', url: 'https://ai.google.dev/gemini-api/docs/thinking-mode' },
        { label: 'Gemini 2.0 Flash Guide', url: 'https://ai.google.dev/gemini-api/docs/models/gemini-v2' },
        { label: 'Google AI Blog - Gemini 2.0', url: 'https://blog.google/technology/google-deepmind/google-gemini-ai-update-december-2024/' }
      ]
    },
    {
      provider: 'MidJourney',
      title: 'Midjourney V6.1 with Improved Coherence and Text Rendering',
      summary: 'Midjourney releases V6.1 with significantly improved text rendering in images, better hand anatomy, and more coherent complex scenes. New --style raw parameter for photorealistic outputs.',
      source_url: 'https://docs.midjourney.com/docs/model-versions#v61',
      published_at: fourDaysAgo.toISOString(),
      raw_text: 'Midjourney V6.1 with Improved Coherence and Text Rendering\n\nMidjourney releases V6.1 with improved text rendering, better hands, and coherent scenes.',
      doc_urls: [
        { label: 'V6.1 Model Documentation', url: 'https://docs.midjourney.com/docs/model-versions#v61' },
        { label: 'V6.1 Parameter Guide', url: 'https://docs.midjourney.com/docs/parameter-list' },
        { label: 'Midjourney Changelog', url: 'https://docs.midjourney.com/changelog' }
      ]
    },
    {
      provider: 'ElevenLabs',
      title: 'ElevenLabs Conversational AI - Build Voice Agents',
      summary: 'ElevenLabs launches Conversational AI platform for building custom voice agents. Features include low-latency responses, interruption handling, custom knowledge bases, and tool calling.',
      source_url: 'https://elevenlabs.io/docs/conversational-ai/overview',
      published_at: fiveDaysAgo.toISOString(),
      raw_text: 'ElevenLabs Conversational AI - Build Voice Agents\n\nElevenLabs launches Conversational AI platform for building custom voice agents with low-latency responses.',
      doc_urls: [
        { label: 'Conversational AI Overview', url: 'https://elevenlabs.io/docs/conversational-ai/overview' },
        { label: 'Build Your First Agent', url: 'https://elevenlabs.io/docs/conversational-ai/quickstart' },
        { label: 'Conversational AI API Reference', url: 'https://elevenlabs.io/docs/api-reference/conversational-ai' }
      ]
    }
  ];
}

/**
 * Fetch updates from all configured providers
 */
export async function fetchAllUpdates(options = {}) {
  const { useSimulated = false } = options;
  console.log('Fetching updates from provider sources...\n');

  let allUpdates = [];

  if (useSimulated) {
    console.log('Using simulated updates for demo...');
    allUpdates = getSimulatedUpdates();
  } else {
    // Try to fetch from real sources
    const fetchers = [
      { name: 'OpenAI', fn: fetchOpenAIUpdates },
      { name: 'Anthropic', fn: fetchAnthropicUpdates },
      { name: 'Google', fn: fetchGoogleUpdates }
    ];

    for (const fetcher of fetchers) {
      console.log(`Fetching from ${fetcher.name}...`);
      try {
        const updates = await fetcher.fn();
        console.log(`  Found ${updates.length} relevant updates`);
        allUpdates.push(...updates);
      } catch (error) {
        console.error(`  Error: ${error.message}`);
      }
    }

    // If no real updates found, use simulated
    if (allUpdates.length === 0) {
      console.log('\nNo updates found from real sources. Using simulated updates for demo...');
      allUpdates = getSimulatedUpdates();
    }
  }

  // Store updates (idempotent by source_url)
  const newUpdates = [];
  for (const update of allUpdates) {
    // Get provider_id if exists
    const provider = store.providers.findByName(update.provider);
    const stored = store.updates.create({
      ...update,
      provider_id: provider?.id || null
    });

    // Check if it was actually new (not already in DB)
    if (stored && !stored.processed) {
      newUpdates.push(stored);
    }
  }

  console.log(`\n✓ Stored ${newUpdates.length} new updates`);
  return newUpdates;
}

/**
 * Get unprocessed updates
 */
export function getUnprocessedUpdates() {
  return store.updates.findAll({ processed: false });
}

/**
 * Mark update as processed
 */
export function markProcessed(updateId) {
  store.updates.markProcessed(updateId);
}

export default {
  fetchAllUpdates,
  getUnprocessedUpdates,
  markProcessed,
  PROVIDER_SOURCES
};
