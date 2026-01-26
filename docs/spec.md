# MyAIcademy Curriculum Engine - Technical Specification

## Overview

This system is an agentic curriculum engine that:
1. Ingests curriculum data from PDFs and structured files
2. Monitors AI provider updates (new features, changes)
3. Analyzes impact on existing lessons and mapping rules
4. Provides a human-in-the-loop approval workflow

## Assumptions (v1)

### Data Structure Assumptions

1. **Providers**: List of approved AI tools organized by category
   - Categories: LLMs, Research, Image Generation, Video, Audio, Data/Presentations, Automation, No-Code Dev
   - 18 total providers identified from source PDF

2. **Lessons**: ~45+ unique lessons with metadata
   - Each lesson has: title, provider, video URL, caption URL, objective, key topics
   - Practice assessments include "improvePrompt" and "practicePrompting" types
   - Lessons are categorized as Beginner (1-25) or Intermediate/Advanced

3. **Courses**: 6 course tracks × 3 levels = 18 course variants
   - Tracks: High School Students, College Students, Early Career Professionals, Creative Professionals, Entrepreneurs & Business Owners, Everyone
   - Levels: Beginner (10 lessons), Intermediate (8 lessons), Advanced (8 lessons)

4. **Mapping Rules**: Quiz-based recommendation logic
   - Q2 (user role) is primary determinant of course track
   - Q3-Q13 provide secondary signals for customization
   - Progression path: Beginner → Intermediate → Advanced within same track

### Technical Assumptions

1. PDF parsing uses `pdf-parse` library; falls back to text extraction
2. Provider updates fetched via web scraping (RSS/changelog pages where available)
3. Keyword-based retrieval for lesson/course matching (v1 simplicity)
4. SQLite for local development; schema supports future PostgreSQL migration
5. All timestamps stored as ISO 8601 strings
6. Audit logs are append-only

### Workflow Assumptions

1. Updates are fetched on-demand or via scheduled watcher
2. Each update generates exactly one ImpactReport
3. Reports require explicit approval before any changes
4. Mapping rule edits create new versions (immutable history)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Dashboard UI                          │
│  (Updates Feed | Recommendations Inbox | Mapping Editor)     │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API
┌─────────────────────────┴───────────────────────────────────┐
│                        API Server                            │
│  /updates | /impact-reports | /mapping-rules                │
└───────┬─────────────────────────────────────────────────────┘
        │
┌───────┴─────────────────────────────────────────────────────┐
│                      Services Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Ingest  │  │  Watcher │  │ Analyzer │  │  Store   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                     SQLite Database                          │
│  providers | lessons | courses | mapping_rules | updates     │
│  impact_reports | audit_logs                                 │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **Ingest**: PDFs → Parsed JSON → SQLite tables
2. **Watch**: Provider sources → New Updates → SQLite
3. **Analyze**: Updates × (Lessons + Courses + Mapping) → ImpactReports
4. **Approve**: Human reviews → Status change → (Optional) Execute changes

## File Structure

```
myai-curriculum-engine/
├── src/
│   ├── services/
│   │   ├── ingest/          # PDF parsing, data normalization
│   │   ├── watcher/         # Provider update fetching
│   │   ├── analyzer/        # Impact analysis engine
│   │   └── store/           # Database operations
│   ├── api/                 # REST API server
│   ├── web/                 # Dashboard UI
│   └── scripts/             # CLI commands
├── data/
│   ├── dev.db               # SQLite database
│   ├── snapshots/           # Raw source file backups
│   └── samples/             # Test fixtures
├── context/
│   └── parsed/              # Human-auditable JSON exports
├── inputs/                  # Source files (PDFs, etc.)
├── docs/                    # Documentation
└── tests/                   # Test files
```

## Provider Update Sources (v1)

For v1, we implement watchers for:
1. **OpenAI/ChatGPT**: https://openai.com/blog (changelog)
2. **Anthropic/Claude**: https://www.anthropic.com/news
3. **Google/Gemini**: https://blog.google/technology/ai/

Future: Add RSS feeds, API-based changelog fetching.

## Severity Levels

- **critical**: Breaking change affecting core lesson functionality
- **high**: New major feature that should be taught
- **medium**: Feature update worth mentioning in lessons
- **low**: Minor change, documentation update only
- **info**: No action needed, for awareness only

## Recommended Actions

- `update_lesson`: Modify existing lesson content
- `create_lesson`: New lesson needed for new capability
- `update_mapping`: Change course recommendation logic
- `no_action`: Informational only, no changes needed
