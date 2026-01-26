# Data Contracts

## Core Entities

### Provider
```json
{
  "id": "string (UUID)",
  "name": "string",
  "category": "string (llm|research|image|video|audio|data|automation|nocode)",
  "website_url": "string (URL)",
  "changelog_url": "string (URL, nullable)",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### Lesson
```json
{
  "id": "string (UUID)",
  "title": "string",
  "provider_id": "string (UUID, nullable)",
  "provider_name": "string",
  "level": "string (beginner|intermediate|advanced)",
  "video_url": "string (URL)",
  "caption_url": "string (URL, nullable)",
  "objective": "string",
  "key_topics": ["string"],
  "slides_url": "string (URL, nullable)",
  "practice_assessment": "object (nullable)",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### Course
```json
{
  "id": "string (UUID)",
  "name": "string",
  "track": "string (high_school|college|early_career|creative|entrepreneur|everyone)",
  "level": "string (beginner|intermediate|advanced)",
  "lesson_ids": ["string (UUID)"],
  "lesson_count": "integer",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### MappingRule
```json
{
  "id": "string (UUID)",
  "version": "integer",
  "question_id": "string (Q2|Q3|...Q13)",
  "question_text": "string",
  "answer_value": "string",
  "recommended_course": "string (course name)",
  "recommended_track": "string (nullable)",
  "priority": "integer (1-10)",
  "is_active": "boolean",
  "created_at": "string (ISO 8601)",
  "created_by": "string (nullable)"
}
```

---

## Watcher Entities

### Update
```json
{
  "id": "string (UUID)",
  "provider_id": "string (UUID)",
  "provider": "string (provider name)",
  "title": "string",
  "summary": "string (nullable)",
  "published_at": "string (ISO 8601)",
  "source_url": "string (URL)",
  "raw_text": "string",
  "fetched_at": "string (ISO 8601)",
  "processed": "boolean"
}
```

**Constraints:**
- `source_url` must be unique (idempotent ingestion)

---

## Analyzer Entities

### ImpactReport
```json
{
  "id": "string (UUID)",
  "update_id": "string (UUID)",
  "provider": "string",
  "severity": "string (critical|high|medium|low|info)",
  "recommended_action": "string (update_lesson|create_lesson|update_mapping|no_action)",
  "affected_lessons": [
    {
      "lesson_id": "string (UUID)",
      "lesson_title": "string",
      "relevance_score": "number (0-1)",
      "suggested_changes": "string"
    }
  ],
  "mapping_suggestions": [
    {
      "rule_id": "string (UUID, nullable)",
      "question_id": "string",
      "current_value": "string (nullable)",
      "suggested_value": "string",
      "rationale": "string"
    }
  ],
  "rationale": "string",
  "citations": [
    {
      "text": "string",
      "url": "string (URL)"
    }
  ],
  "status": "string (new|approved|rejected|assigned|done)",
  "assignee": "string (nullable)",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)",
  "reviewed_by": "string (nullable)",
  "reviewed_at": "string (ISO 8601, nullable)"
}
```

**Status Transitions:**
- `new` → `approved` | `rejected` | `assigned`
- `assigned` → `approved` | `rejected` | `done`
- `approved` → `done`
- `rejected` (terminal)
- `done` (terminal)

---

## Audit Entities

### AuditLog
```json
{
  "id": "string (UUID)",
  "entity_type": "string (mapping_rule|impact_report|lesson|course)",
  "entity_id": "string (UUID)",
  "action": "string (create|update|delete|approve|reject|assign)",
  "previous_value": "string (JSON, nullable)",
  "new_value": "string (JSON)",
  "actor": "string (nullable)",
  "timestamp": "string (ISO 8601)"
}
```

---

## API Response Formats

### List Response
```json
{
  "data": [],
  "total": "integer",
  "page": "integer",
  "per_page": "integer"
}
```

### Single Item Response
```json
{
  "data": {}
}
```

### Error Response
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (nullable)"
  }
}
```

---

## Parsed Output Formats (context/parsed/)

### providers.parsed.json
```json
{
  "generated_at": "string (ISO 8601)",
  "source_file": "string",
  "providers": [Provider]
}
```

### lessons.parsed.json
```json
{
  "generated_at": "string (ISO 8601)",
  "source_file": "string",
  "lessons": [Lesson]
}
```

### courses.parsed.json
```json
{
  "generated_at": "string (ISO 8601)",
  "source_file": "string",
  "courses": [Course]
}
```

### mapping.parsed.json
```json
{
  "generated_at": "string (ISO 8601)",
  "source_file": "string",
  "mapping_rules": [MappingRule]
}
```
