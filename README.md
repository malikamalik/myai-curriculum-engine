# MyAIcademy Curriculum Engine

An agentic curriculum engine that monitors AI provider updates and helps manage curriculum impact analysis with human-in-the-loop approval workflows.

## Features

- **Data Ingestion**: Parse curriculum data from PDFs and structured files
- **Provider Watcher**: Fetch updates from AI provider blogs/changelogs
- **Impact Analyzer**: Analyze how updates affect existing lessons and mapping rules
- **REST API**: Full API for all operations
- **Dashboard UI**: Web interface for reviewing and approving changes
- **Audit Logging**: Track all changes with versioned mapping rules

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone and navigate to the project
cd myai-curriculum-engine

# Install dependencies
npm install

# Initialize database and ingest data
npm run init-db
npm run ingest

# Fetch sample updates and analyze
npm run watch -- --simulated
npm run analyze

# Start the servers
npm run dev
```

### Access the Dashboard

- **Dashboard**: http://localhost:3000
- **API**: http://localhost:3001

## Commands

| Command | Description |
|---------|-------------|
| `npm run ingest` | Parse input files and populate database |
| `npm run watch` | Fetch updates from provider sources |
| `npm run analyze` | Analyze unprocessed updates and generate impact reports |
| `npm run api` | Start API server (port 3001) |
| `npm run web` | Start dashboard server (port 3000) |
| `npm run dev` | Start both servers concurrently |
| `npm test` | Run tests |

Or use Make:

```bash
make setup    # Install, init DB, and ingest data
make demo     # Full demo with sample data
make dev      # Start servers
make test     # Run tests
make clean    # Reset database
```

## API Endpoints

### Updates
- `GET /api/updates` - List all updates
- `POST /api/updates/fetch` - Fetch new updates from providers

### Impact Reports
- `GET /api/impact-reports` - List reports (filter by status/provider/action)
- `GET /api/impact-reports/:id` - Get report details
- `POST /api/impact-reports/:id/approve` - Approve a report
- `POST /api/impact-reports/:id/reject` - Reject a report
- `POST /api/impact-reports/:id/assign` - Assign to someone
- `POST /api/impact-reports/analyze` - Analyze all unprocessed updates

### Mapping Rules
- `GET /api/mapping-rules` - List all rules
- `PUT /api/mapping-rules/:id` - Update a rule (creates new version)
- `GET /api/mapping-rules/history/:questionId/:answerValue` - Version history

### Other
- `GET /api/providers` - List providers
- `GET /api/lessons` - List lessons
- `GET /api/courses` - List courses
- `GET /api/audit-logs` - View audit trail
- `GET /api/dashboard/stats` - Dashboard statistics

## Project Structure

```
myai-curriculum-engine/
├── src/
│   ├── services/
│   │   ├── ingest/      # PDF parsing, data normalization
│   │   ├── watcher/     # Provider update fetching
│   │   ├── analyzer/    # Impact analysis engine
│   │   └── store/       # Database operations
│   ├── api/             # REST API server
│   ├── web/             # Dashboard UI
│   └── scripts/         # CLI commands
├── data/
│   ├── dev.db           # SQLite database
│   ├── snapshots/       # Source file backups
│   └── samples/         # Test fixtures
├── context/
│   └── parsed/          # Human-auditable JSON exports
├── inputs/              # Source files (PDFs)
│   ├── providers/
│   ├── lessons/
│   ├── curriculum/
│   └── mapping/
├── docs/                # Documentation
│   ├── spec.md          # Technical specification
│   └── data-contracts.md # Schema definitions
└── tests/               # Test files
```

## Data Contracts

### Update
```json
{
  "id": "uuid",
  "provider": "string",
  "title": "string",
  "source_url": "string (unique)",
  "raw_text": "string",
  "processed": "boolean"
}
```

### Impact Report
```json
{
  "id": "uuid",
  "update_id": "uuid",
  "provider": "string",
  "severity": "critical|high|medium|low|info",
  "recommended_action": "update_lesson|create_lesson|update_mapping|no_action",
  "affected_lessons": [...],
  "mapping_suggestions": [...],
  "rationale": "string",
  "citations": [...],
  "status": "new|approved|rejected|assigned|done"
}
```

See `docs/data-contracts.md` for full schema documentation.

## Human-in-the-Loop Workflow

1. **Fetch Updates**: Watcher fetches new updates from provider sources
2. **Generate Reports**: Analyzer creates impact reports with recommendations
3. **Review**: Human reviews reports in the dashboard
4. **Action**: Approve, reject, or assign reports
5. **Execute**: Approved changes can be implemented
6. **Audit**: All actions are logged for traceability

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PATH` | `data/dev.db` | SQLite database path |
| `API_PORT` | `3001` | API server port |
| `WEB_PORT` | `3000` | Dashboard server port |

## Development

```bash
# Run tests
npm test

# View parsed data
cat context/parsed/providers.parsed.json
cat context/parsed/lessons.parsed.json

# Check audit logs
curl http://localhost:3001/api/audit-logs | jq
```

## License

MIT
