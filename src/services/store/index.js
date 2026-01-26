import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DB_PATH || join(__dirname, '../../../data/dev.db');

let db = null;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initDb() {
  const database = getDb();
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  database.exec(schema);
  console.log('Database initialized at:', DB_PATH);
  return database;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

// Generic helpers
export function generateId() {
  return uuidv4();
}

export function now() {
  return new Date().toISOString();
}

// Provider operations
export const providers = {
  create(provider) {
    const db = getDb();
    const id = provider.id || generateId();
    const stmt = db.prepare(`
      INSERT INTO providers (id, name, category, website_url, changelog_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const timestamp = now();
    stmt.run(id, provider.name, provider.category, provider.website_url, provider.changelog_url, timestamp, timestamp);
    return { ...provider, id, created_at: timestamp, updated_at: timestamp };
  },

  findAll() {
    const db = getDb();
    return db.prepare('SELECT * FROM providers ORDER BY name').all();
  },

  findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM providers WHERE id = ?').get(id);
  },

  findByName(name) {
    const db = getDb();
    return db.prepare('SELECT * FROM providers WHERE name = ?').get(name);
  },

  upsert(provider) {
    const existing = this.findByName(provider.name);
    if (existing) {
      return existing;
    }
    return this.create(provider);
  }
};

// Lesson operations
export const lessons = {
  create(lesson) {
    const db = getDb();
    const id = lesson.id || generateId();
    const stmt = db.prepare(`
      INSERT INTO lessons (id, title, provider_id, provider_name, level, video_url, caption_url, objective, key_topics, slides_url, practice_assessment, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const timestamp = now();
    stmt.run(
      id, lesson.title, lesson.provider_id, lesson.provider_name, lesson.level,
      lesson.video_url, lesson.caption_url, lesson.objective,
      JSON.stringify(lesson.key_topics || []),
      lesson.slides_url,
      JSON.stringify(lesson.practice_assessment || null),
      timestamp, timestamp
    );
    return { ...lesson, id, created_at: timestamp, updated_at: timestamp };
  },

  findAll(filters = {}) {
    const db = getDb();
    let query = 'SELECT * FROM lessons WHERE 1=1';
    const params = [];

    if (filters.level) {
      query += ' AND level = ?';
      params.push(filters.level);
    }
    if (filters.provider_name) {
      query += ' AND provider_name = ?';
      params.push(filters.provider_name);
    }

    query += ' ORDER BY title';
    const rows = db.prepare(query).all(...params);
    return rows.map(row => ({
      ...row,
      key_topics: JSON.parse(row.key_topics || '[]'),
      practice_assessment: JSON.parse(row.practice_assessment || 'null')
    }));
  },

  findById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
    if (!row) return null;
    return {
      ...row,
      key_topics: JSON.parse(row.key_topics || '[]'),
      practice_assessment: JSON.parse(row.practice_assessment || 'null')
    };
  },

  findByTitle(title) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM lessons WHERE title = ?').get(title);
    if (!row) return null;
    return {
      ...row,
      key_topics: JSON.parse(row.key_topics || '[]'),
      practice_assessment: JSON.parse(row.practice_assessment || 'null')
    };
  },

  search(keyword) {
    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM lessons
      WHERE title LIKE ? OR objective LIKE ? OR key_topics LIKE ? OR provider_name LIKE ?
    `).all(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    return rows.map(row => ({
      ...row,
      key_topics: JSON.parse(row.key_topics || '[]'),
      practice_assessment: JSON.parse(row.practice_assessment || 'null')
    }));
  }
};

// Course operations
export const courses = {
  create(course) {
    const db = getDb();
    const id = course.id || generateId();
    const stmt = db.prepare(`
      INSERT INTO courses (id, name, track, level, lesson_ids, lesson_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const timestamp = now();
    const lessonIds = course.lesson_ids || [];
    stmt.run(id, course.name, course.track, course.level, JSON.stringify(lessonIds), lessonIds.length, timestamp, timestamp);
    return { ...course, id, lesson_ids: lessonIds, lesson_count: lessonIds.length, created_at: timestamp, updated_at: timestamp };
  },

  findAll(filters = {}) {
    const db = getDb();
    let query = 'SELECT * FROM courses WHERE 1=1';
    const params = [];

    if (filters.track) {
      query += ' AND track = ?';
      params.push(filters.track);
    }
    if (filters.level) {
      query += ' AND level = ?';
      params.push(filters.level);
    }

    query += ' ORDER BY track, level';
    const rows = db.prepare(query).all(...params);
    return rows.map(row => ({
      ...row,
      lesson_ids: JSON.parse(row.lesson_ids || '[]')
    }));
  },

  findById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
    if (!row) return null;
    return {
      ...row,
      lesson_ids: JSON.parse(row.lesson_ids || '[]')
    };
  },

  // Get lessons for a course in correct order
  getLessonsInOrder(courseId) {
    const db = getDb();
    const rows = db.prepare(`
      SELECT l.*, cl.position
      FROM lessons l
      JOIN course_lessons cl ON l.id = cl.lesson_id
      WHERE cl.course_id = ?
      ORDER BY cl.position ASC
    `).all(courseId);

    return rows.map(row => ({
      ...row,
      key_topics: JSON.parse(row.key_topics || '[]'),
      practice_assessment: JSON.parse(row.practice_assessment || 'null'),
      position: row.position
    }));
  }
};

// Mapping rules operations
export const mappingRules = {
  create(rule) {
    const db = getDb();
    const id = rule.id || generateId();
    const stmt = db.prepare(`
      INSERT INTO mapping_rules (id, version, question_id, question_text, answer_value, recommended_course, recommended_track, priority, is_active, created_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const timestamp = now();
    stmt.run(
      id, rule.version || 1, rule.question_id, rule.question_text, rule.answer_value,
      rule.recommended_course, rule.recommended_track, rule.priority || 5, rule.is_active !== false ? 1 : 0,
      timestamp, rule.created_by
    );

    // Log creation
    auditLogs.create({
      entity_type: 'mapping_rule',
      entity_id: id,
      action: 'create',
      new_value: JSON.stringify(rule),
      actor: rule.created_by
    });

    return { ...rule, id, version: rule.version || 1, created_at: timestamp };
  },

  findAll(filters = {}) {
    const db = getDb();
    let query = 'SELECT * FROM mapping_rules WHERE 1=1';
    const params = [];

    if (filters.question_id) {
      query += ' AND question_id = ?';
      params.push(filters.question_id);
    }
    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active ? 1 : 0);
    }

    query += ' ORDER BY question_id, priority DESC';
    return db.prepare(query).all(...params);
  },

  findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM mapping_rules WHERE id = ?').get(id);
  },

  update(id, updates, actor) {
    const db = getDb();
    const existing = this.findById(id);
    if (!existing) throw new Error('Mapping rule not found');

    // Create new version instead of updating in place
    const newVersion = existing.version + 1;
    const timestamp = now();

    // Deactivate old version
    db.prepare('UPDATE mapping_rules SET is_active = 0 WHERE id = ?').run(id);

    // Create new version
    const newId = generateId();
    const newRule = { ...existing, ...updates, id: newId, version: newVersion, is_active: true, created_by: actor };
    delete newRule.created_at;

    const stmt = db.prepare(`
      INSERT INTO mapping_rules (id, version, question_id, question_text, answer_value, recommended_course, recommended_track, priority, is_active, created_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      newId, newVersion, newRule.question_id, newRule.question_text, newRule.answer_value,
      newRule.recommended_course, newRule.recommended_track, newRule.priority, 1, timestamp, actor
    );

    // Log update
    auditLogs.create({
      entity_type: 'mapping_rule',
      entity_id: newId,
      action: 'update',
      previous_value: JSON.stringify(existing),
      new_value: JSON.stringify(newRule),
      actor
    });

    return { ...newRule, created_at: timestamp };
  },

  getVersionHistory(questionId, answerValue) {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM mapping_rules
      WHERE question_id = ? AND answer_value = ?
      ORDER BY version DESC
    `).all(questionId, answerValue);
  }
};

// Updates operations
export const updates = {
  create(update) {
    const db = getDb();
    const id = update.id || generateId();
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO updates (id, provider_id, provider, title, summary, published_at, source_url, raw_text, doc_urls, fetched_at, processed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const timestamp = now();
    const result = stmt.run(
      id, update.provider_id, update.provider, update.title, update.summary,
      update.published_at, update.source_url, update.raw_text,
      JSON.stringify(update.doc_urls || []),
      timestamp, 0
    );

    if (result.changes === 0) {
      // Already exists (idempotent)
      return this.findBySourceUrl(update.source_url);
    }

    return { ...update, id, fetched_at: timestamp, processed: false };
  },

  findAll(filters = {}) {
    const db = getDb();
    let query = 'SELECT * FROM updates WHERE 1=1';
    const params = [];

    if (filters.provider) {
      query += ' AND provider = ?';
      params.push(filters.provider);
    }
    if (filters.processed !== undefined) {
      query += ' AND processed = ?';
      params.push(filters.processed ? 1 : 0);
    }

    query += ' ORDER BY published_at DESC, fetched_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const rows = db.prepare(query).all(...params);
    return rows.map(row => ({
      ...row,
      doc_urls: JSON.parse(row.doc_urls || '[]')
    }));
  },

  findById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM updates WHERE id = ?').get(id);
    if (!row) return null;
    return {
      ...row,
      doc_urls: JSON.parse(row.doc_urls || '[]')
    };
  },

  findBySourceUrl(url) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM updates WHERE source_url = ?').get(url);
    if (!row) return null;
    return {
      ...row,
      doc_urls: JSON.parse(row.doc_urls || '[]')
    };
  },

  markProcessed(id) {
    const db = getDb();
    db.prepare('UPDATE updates SET processed = 1 WHERE id = ?').run(id);
  }
};

// Impact reports operations
export const impactReports = {
  create(report) {
    const db = getDb();
    const id = report.id || generateId();
    const stmt = db.prepare(`
      INSERT INTO impact_reports (id, update_id, provider, severity, recommended_action, affected_lessons, mapping_suggestions, rationale, citations, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const timestamp = now();
    stmt.run(
      id, report.update_id, report.provider, report.severity, report.recommended_action,
      JSON.stringify(report.affected_lessons || []),
      JSON.stringify(report.mapping_suggestions || []),
      report.rationale,
      JSON.stringify(report.citations || []),
      'new', timestamp, timestamp
    );
    return { ...report, id, status: 'new', created_at: timestamp, updated_at: timestamp };
  },

  findAll(filters = {}) {
    const db = getDb();
    let query = 'SELECT * FROM impact_reports WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.provider) {
      query += ' AND provider = ?';
      params.push(filters.provider);
    }
    if (filters.recommended_action) {
      query += ' AND recommended_action = ?';
      params.push(filters.recommended_action);
    }

    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params);
    return rows.map(row => ({
      ...row,
      affected_lessons: JSON.parse(row.affected_lessons || '[]'),
      mapping_suggestions: JSON.parse(row.mapping_suggestions || '[]'),
      citations: JSON.parse(row.citations || '[]')
    }));
  },

  findById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM impact_reports WHERE id = ?').get(id);
    if (!row) return null;
    return {
      ...row,
      affected_lessons: JSON.parse(row.affected_lessons || '[]'),
      mapping_suggestions: JSON.parse(row.mapping_suggestions || '[]'),
      citations: JSON.parse(row.citations || '[]')
    };
  },

  updateStatus(id, status, actor) {
    const db = getDb();
    const existing = this.findById(id);
    if (!existing) throw new Error('Impact report not found');

    const timestamp = now();
    const updateFields = {
      status,
      updated_at: timestamp,
      reviewed_by: actor,
      reviewed_at: timestamp
    };

    db.prepare(`
      UPDATE impact_reports
      SET status = ?, updated_at = ?, reviewed_by = ?, reviewed_at = ?
      WHERE id = ?
    `).run(status, timestamp, actor, timestamp, id);

    // Log status change
    auditLogs.create({
      entity_type: 'impact_report',
      entity_id: id,
      action: status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : 'update',
      previous_value: JSON.stringify({ status: existing.status }),
      new_value: JSON.stringify({ status }),
      actor
    });

    return { ...existing, ...updateFields };
  },

  assign(id, assignee, actor) {
    const db = getDb();
    const existing = this.findById(id);
    if (!existing) throw new Error('Impact report not found');

    const timestamp = now();
    db.prepare(`
      UPDATE impact_reports
      SET status = 'assigned', assignee = ?, updated_at = ?
      WHERE id = ?
    `).run(assignee, timestamp, id);

    // Log assignment
    auditLogs.create({
      entity_type: 'impact_report',
      entity_id: id,
      action: 'assign',
      previous_value: JSON.stringify({ assignee: existing.assignee }),
      new_value: JSON.stringify({ assignee }),
      actor
    });

    return { ...existing, status: 'assigned', assignee, updated_at: timestamp };
  }
};

// Audit logs operations
export const auditLogs = {
  create(log) {
    const db = getDb();
    const id = log.id || generateId();
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, previous_value, new_value, actor, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const timestamp = now();
    stmt.run(id, log.entity_type, log.entity_id, log.action, log.previous_value, log.new_value, log.actor, timestamp);
    return { ...log, id, timestamp };
  },

  findByEntity(entityType, entityId) {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM audit_logs
      WHERE entity_type = ? AND entity_id = ?
      ORDER BY timestamp DESC
    `).all(entityType, entityId);
  },

  findAll(filters = {}) {
    const db = getDb();
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (filters.entity_type) {
      query += ' AND entity_type = ?';
      params.push(filters.entity_type);
    }
    if (filters.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }

    query += ' ORDER BY timestamp DESC LIMIT 100';
    return db.prepare(query).all(...params);
  }
};

export default {
  getDb,
  initDb,
  closeDb,
  generateId,
  now,
  providers,
  lessons,
  courses,
  mappingRules,
  updates,
  impactReports,
  auditLogs
};
