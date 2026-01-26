import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Set up test database path
const testDir = mkdtempSync(join(tmpdir(), 'curriculum-test-'));
process.env.DB_PATH = join(testDir, 'test.db');

// Import store after setting env
const store = await import('./index.js');

describe('Store Service', () => {
  beforeEach(() => {
    store.initDb();
  });

  afterEach(() => {
    store.closeDb();
  });

  describe('providers', () => {
    test('should create and retrieve a provider', () => {
      const provider = store.providers.create({
        name: 'TestGPT',
        category: 'llm',
        website_url: 'https://test.com'
      });

      assert.ok(provider.id);
      assert.strictEqual(provider.name, 'TestGPT');
      assert.strictEqual(provider.category, 'llm');

      const found = store.providers.findById(provider.id);
      assert.strictEqual(found.name, 'TestGPT');
    });

    test('should upsert provider without duplicates', () => {
      const p1 = store.providers.upsert({ name: 'UniqueProvider', category: 'llm' });
      const p2 = store.providers.upsert({ name: 'UniqueProvider', category: 'llm' });

      assert.strictEqual(p1.id, p2.id);
    });
  });

  describe('lessons', () => {
    test('should create lesson with key topics', () => {
      const lesson = store.lessons.create({
        title: 'Test Lesson',
        provider_name: 'TestGPT',
        level: 'beginner',
        objective: 'Learn testing',
        key_topics: ['topic1', 'topic2', 'topic3']
      });

      assert.ok(lesson.id);
      assert.strictEqual(lesson.key_topics.length, 3);

      const found = store.lessons.findById(lesson.id);
      assert.deepStrictEqual(found.key_topics, ['topic1', 'topic2', 'topic3']);
    });

    test('should search lessons by keyword', () => {
      store.lessons.create({
        title: 'ChatGPT Basics',
        provider_name: 'ChatGPT',
        level: 'beginner',
        objective: 'Learn ChatGPT'
      });

      const results = store.lessons.search('ChatGPT');
      assert.ok(results.length > 0);
      assert.ok(results[0].title.includes('ChatGPT'));
    });
  });

  describe('mappingRules', () => {
    test('should create versioned mapping rule', () => {
      const rule = store.mappingRules.create({
        question_id: 'Q2',
        question_text: 'What are you?',
        answer_value: 'Student',
        recommended_course: 'AI 101',
        created_by: 'test'
      });

      assert.strictEqual(rule.version, 1);
      // is_active is passed to create but not returned in the object
      // Verify by fetching from DB
      const fetched = store.mappingRules.findById(rule.id);
      assert.strictEqual(fetched.is_active, 1);
    });

    test('should create new version on update', () => {
      const rule = store.mappingRules.create({
        question_id: 'Q2',
        question_text: 'What are you?',
        answer_value: 'Professional',
        recommended_course: 'AI 101',
        created_by: 'test'
      });

      const updated = store.mappingRules.update(rule.id, {
        recommended_course: 'AI 201'
      }, 'editor');

      assert.strictEqual(updated.version, 2);
      assert.strictEqual(updated.recommended_course, 'AI 201');

      // Original should be deactivated
      const original = store.mappingRules.findById(rule.id);
      assert.strictEqual(original.is_active, 0);
    });
  });

  describe('updates', () => {
    test('should be idempotent by source_url', () => {
      const u1 = store.updates.create({
        provider: 'OpenAI',
        title: 'Update 1',
        source_url: 'https://openai.com/blog/test'
      });

      const u2 = store.updates.create({
        provider: 'OpenAI',
        title: 'Update 1 duplicate',
        source_url: 'https://openai.com/blog/test'
      });

      assert.strictEqual(u1.id, u2.id);
    });
  });

  describe('impactReports', () => {
    test('should track status changes', () => {
      const update = store.updates.create({
        provider: 'TestProvider',
        title: 'Test Update',
        source_url: 'https://test.com/update-1'
      });

      const report = store.impactReports.create({
        update_id: update.id,
        provider: 'TestProvider',
        severity: 'medium',
        recommended_action: 'update_lesson',
        rationale: 'Test rationale',
        affected_lessons: [],
        citations: []
      });

      assert.strictEqual(report.status, 'new');

      const approved = store.impactReports.updateStatus(report.id, 'approved', 'reviewer');
      assert.strictEqual(approved.status, 'approved');
      assert.strictEqual(approved.reviewed_by, 'reviewer');
    });
  });

  describe('auditLogs', () => {
    test('should create audit log entries', () => {
      const log = store.auditLogs.create({
        entity_type: 'test',
        entity_id: '123',
        action: 'create',
        new_value: JSON.stringify({ test: true }),
        actor: 'tester'
      });

      assert.ok(log.id);
      assert.ok(log.timestamp);

      const logs = store.auditLogs.findByEntity('test', '123');
      assert.strictEqual(logs.length, 1);
    });
  });
});

// Cleanup
process.on('exit', () => {
  try {
    rmSync(testDir, { recursive: true });
  } catch (e) {
    // ignore cleanup errors
  }
});
