'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const test = require('node:test');

const {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  LEGACY_BACKUP_VERSION,
  LEGACY_SUPPORTED_TEXT_SCALES,
  MAX_BACKUP_BYTES,
  SUPPORTED_TEXT_SCALES,
  applyKeyValueTransaction,
  canonicalize,
  createBackupEnvelope,
  utf8ByteLength,
  validateBackupSettings,
  validateBackupText,
} = require('./LocalBackupCore.js');

const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');
const createdAt = '2026-07-25T12:34:56.000Z';
const settings = {
  language: 'zh',
  theme: 'dark',
  setupComplete: true,
  textScale: 1.25,
};

const createLegacyEnvelope = (legacySettings) => {
  const content = {
    format: BACKUP_FORMAT,
    version: LEGACY_BACKUP_VERSION,
    createdAt,
    data: legacySettings,
  };
  return {
    ...content,
    integrity: {
      algorithm: 'SHA-256',
      digest: sha256(canonicalize(content)),
    },
  };
};

const createStorage = (entries, failWrite) => {
  const values = new Map(entries);
  return {
    values,
    adapter: {
      async getItem(key) {
        return values.has(key) ? values.get(key) : null;
      },
      async setItem(key, value) {
        if (failWrite?.(key, value)) throw new Error('simulated quota failure');
        values.set(key, value);
      },
      async removeItem(key) {
        values.delete(key);
      },
    },
  };
};

test('canonicalizes checksum input and counts UTF-8 bytes', () => {
  assert.equal(
    canonicalize({ z: [3, 2, 1], a: { text: '安息日', enabled: true } }),
    '{"a":{"enabled":true,"text":"安息日"},"z":[3,2,1]}',
  );
  assert.equal(utf8ByteLength('安息日'), 9);

  assert.throws(() => canonicalize(undefined), /type undefined/);
  assert.throws(() => canonicalize(Number.NaN), /non-finite/);
  assert.throws(() => canonicalize(new Date()), /plain objects/);
  const circular = {};
  circular.self = circular;
  assert.throws(() => canonicalize(circular), /circular/);
});

test('creates and validates an exact SHA-256 v2 envelope', async () => {
  const envelope = await createBackupEnvelope(settings, createdAt, sha256);
  assert.equal(envelope.format, BACKUP_FORMAT);
  assert.equal(envelope.version, BACKUP_VERSION);
  assert.match(envelope.integrity.digest, /^[a-f0-9]{64}$/);

  const reordered = JSON.stringify({
    integrity: envelope.integrity,
    data: { textScale: 1.25, setupComplete: true, theme: 'dark', language: 'zh' },
    createdAt: envelope.createdAt,
    version: envelope.version,
    format: envelope.format,
  });
  assert.deepEqual(await validateBackupText(reordered, sha256), envelope);
});

test('rejects extra fields, unsupported values, and malformed integrity', async () => {
  const envelope = await createBackupEnvelope(settings, createdAt, sha256);
  await assert.rejects(
    validateBackupText(JSON.stringify({ ...envelope, extra: true }), sha256),
    /missing or unsupported fields/,
  );
  await assert.rejects(
    validateBackupText(JSON.stringify({ ...envelope, version: 3 }), sha256),
    /version 3 is unsupported/,
  );
  await assert.rejects(
    validateBackupText(
      JSON.stringify({ ...envelope, data: { ...envelope.data, language: 'fr' } }),
      sha256,
    ),
    /language is unsupported/,
  );
  assert.throws(
    () => validateBackupSettings({ ...settings, savedVerses: [] }),
    /missing or unsupported fields/,
  );
});

test('accepts all v2 text-scale steps and only exact setting fields', () => {
  assert.equal(SUPPORTED_TEXT_SCALES.length, 21);
  for (const textScale of SUPPORTED_TEXT_SCALES) {
    assert.deepEqual(validateBackupSettings({ ...settings, textScale }), {
      ...settings,
      textScale,
    });
  }
  assert.throws(
    () => validateBackupSettings({ ...settings, textScale: 1.11 }),
    /text scale is unsupported/,
  );
  assert.throws(
    () => validateBackupSettings({ ...settings, setupComplete: 'true' }),
    /must be true or false/,
  );
});

test('verifies a v1 checksum before migrating the legacy envelope to v2', async () => {
  assert.deepEqual(LEGACY_SUPPORTED_TEXT_SCALES, [1, 1.25, 1.5]);
  const legacySettings = { ...settings, textScale: 1.5 };
  const legacyEnvelope = createLegacyEnvelope(legacySettings);
  const migrated = await validateBackupText(JSON.stringify(legacyEnvelope), sha256);

  assert.equal(migrated.version, BACKUP_VERSION);
  assert.deepEqual(migrated.data, legacySettings);
  assert.notEqual(migrated.integrity.digest, legacyEnvelope.integrity.digest);

  const altered = {
    ...legacyEnvelope,
    data: { ...legacyEnvelope.data, textScale: 1.25 },
  };
  await assert.rejects(
    validateBackupText(JSON.stringify(altered), sha256),
    /checksum does not match/,
  );
  await assert.rejects(
    validateBackupText(
      JSON.stringify(createLegacyEnvelope({ ...settings, textScale: 1.1 })),
      sha256,
    ),
    /unsupported for version 1/,
  );
});

test('rejects malformed, oversized, and checksum-altered files', async () => {
  const envelope = await createBackupEnvelope(settings, createdAt, sha256);
  await assert.rejects(validateBackupText('{', sha256), /not valid JSON/);
  await assert.rejects(
    validateBackupText(' '.repeat(MAX_BACKUP_BYTES + 1), sha256),
    /exceeds the 65536-byte limit/,
  );
  await assert.rejects(
    validateBackupText(
      JSON.stringify({ ...envelope, data: { ...envelope.data, theme: 'light' } }),
      sha256,
    ),
    /checksum does not match/,
  );
});

test('rolls every setting back after a partial transactional write failure', async () => {
  let failOnce = true;
  const storage = createStorage(
    [
      ['user-language', 'en'],
      ['user-theme', 'light'],
      ['has-completed-setup', 'true'],
      ['user-text-scale', '1'],
      ['user-bible-translation', 'NIV'],
    ],
    (key, value) => {
      if (key === 'user-text-scale' && value === '1.5' && failOnce) {
        failOnce = false;
        return true;
      }
      return false;
    },
  );

  await assert.rejects(
    applyKeyValueTransaction(storage.adapter, [
      ['user-language', 'es'],
      ['user-theme', 'dark'],
      ['has-completed-setup', 'false'],
      ['user-text-scale', '1.5'],
    ]),
    /previous settings were restored/,
  );
  assert.deepEqual(Object.fromEntries(storage.values), {
    'user-language': 'en',
    'user-theme': 'light',
    'has-completed-setup': 'true',
    'user-text-scale': '1',
    'user-bible-translation': 'NIV',
  });
});

test('restore and delete transactions leave Bible state, saved verses, and caches untouched', async () => {
  const unrelated = {
    'user-bible-translation': 'CUV',
    'user-bible-book': 'JHN',
    'user-bible-chapter': '3',
    'saved-bible-verses-v1': '[{"bookId":"JHN","chapter":3,"verse":16}]',
    votd_cache_en: '{"date":"2026-07-27"}',
  };
  const storage = createStorage([
    ['user-language', 'en'],
    ['user-theme', 'light'],
    ['has-completed-setup', 'true'],
    ['user-text-scale', '1'],
    ...Object.entries(unrelated),
  ]);

  const settingKeys = [
    'user-language',
    'user-theme',
    'has-completed-setup',
    'user-text-scale',
  ];
  await applyKeyValueTransaction(storage.adapter, [
    ['user-language', 'zh-cn'],
    ['user-theme', 'dark'],
    ['has-completed-setup', 'false'],
    ['user-text-scale', '1.75'],
  ]);
  assert.deepEqual(
    Object.fromEntries(Object.keys(unrelated).map((key) => [key, storage.values.get(key)])),
    unrelated,
  );

  await applyKeyValueTransaction(
    storage.adapter,
    settingKeys.map((key) => [key, null]),
  );
  assert.deepEqual(Object.fromEntries(storage.values), unrelated);
});
