import { generateKeyPairSync, verify } from 'node:crypto';

const {
  releaseNotesFromCommitSubject,
  uploadToInternalTesting,
} = require('../scripts/upload-google-play.cjs');

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
const serviceAccountJson = JSON.stringify({
  type: 'service_account',
  client_email: 'uploader@example.iam.gserviceaccount.com',
  private_key: privateKeyPem,
  token_uri: 'https://oauth2.googleapis.com/token',
});

const APP = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/org.nyccsda.app';
const UPLOAD =
  'https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/org.nyccsda.app';

type Reply = { status?: number; body?: unknown };
type Call = { method: string; url: string; headers: Record<string, string>; body: unknown };

// A fake Google API: `replies` maps "METHOD url" to replies, used in order.
const fakeGoogle = (replies: Record<string, Reply[]>) => {
  const calls: Call[] = [];
  const fetchImpl = jest.fn(async (url: string, init: { method: string; headers: Record<string, string>; body: unknown }) => {
    const key = `${init.method} ${url}`;
    calls.push({ method: init.method, url, headers: init.headers, body: init.body });
    const reply = replies[key]?.shift() ?? { status: 200, body: {} };
    const status = reply.status ?? 200;
    return {
      ok: status < 400,
      status,
      statusText: 'status',
      text: async () => JSON.stringify(reply.body ?? {}),
    };
  });
  return { calls, fetchImpl };
};

const happyReplies = (): Record<string, Reply[]> => ({
  'POST https://oauth2.googleapis.com/token': [{ body: { access_token: 'access-token' } }],
  [`POST ${APP}/edits`]: [{ body: { id: 'edit-1' } }],
  [`POST ${UPLOAD}/edits/edit-1/bundles?uploadType=media`]: [{ body: { versionCode: 40000 } }],
});

const upload = (fetchImpl: unknown, log = jest.fn(), releaseNotes = '') =>
  uploadToInternalTesting({
    serviceAccountJson,
    packageName: 'org.nyccsda.app',
    versionName: '0.40.0',
    bundle: Buffer.from('aab bytes'),
    releaseNotes,
    fetchImpl,
    now: 1_700_000_000_000,
    log,
  });

const trackBody = (call: Call) => JSON.parse(call.body as string);

describe('Google Play upload', () => {
  it('signs in as the service account, uploads, releases to internal testing, and commits', async () => {
    const { calls, fetchImpl } = fakeGoogle(happyReplies());

    await expect(upload(fetchImpl)).resolves.toEqual({ status: 'completed', versionCode: 40000 });

    expect(calls.map((call) => `${call.method} ${call.url}`)).toEqual([
      'POST https://oauth2.googleapis.com/token',
      `POST ${APP}/edits`,
      `POST ${UPLOAD}/edits/edit-1/bundles?uploadType=media`,
      `PUT ${APP}/edits/edit-1/tracks/internal`,
      `POST ${APP}/edits/edit-1:commit`,
    ]);

    // The token request carries a JWT signed with the service account's key.
    const form = new URLSearchParams(calls[0].body as string);
    expect(form.get('grant_type')).toBe('urn:ietf:params:oauth:grant-type:jwt-bearer');
    const [header, claims, signature] = form.get('assertion')!.split('.');
    expect(
      verify('RSA-SHA256', Buffer.from(`${header}.${claims}`), publicKey, Buffer.from(signature, 'base64url')),
    ).toBe(true);
    expect(JSON.parse(Buffer.from(claims, 'base64url').toString())).toEqual({
      iss: 'uploader@example.iam.gserviceaccount.com',
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token',
      iat: 1_700_000_000,
      exp: 1_700_003_600,
    });

    // Every API call uses the access token; the bundle goes up as raw bytes.
    for (const call of calls.slice(1)) {
      expect(call.headers.authorization).toBe('Bearer access-token');
    }
    expect(calls[2].headers['content-type']).toBe('application/octet-stream');
    expect(calls[2].body).toEqual(Buffer.from('aab bytes'));
    expect(trackBody(calls[3])).toEqual({
      track: 'internal',
      releases: [{ name: '0.40.0 (40000)', versionCodes: ['40000'], status: 'completed' }],
    });
  });

  it("adds release notes in the store listing's default language", async () => {
    const replies = happyReplies();
    replies[`GET ${APP}/edits/edit-1/details`] = [{ body: { defaultLanguage: 'zh-TW' } }];
    replies[`POST ${APP}/edits/edit-1:commit`] = [
      { status: 400, body: { error: { message: 'Only releases with status draft may be created on draft app.' } } },
    ];
    const { calls, fetchImpl } = fakeGoogle(replies);

    await upload(fetchImpl, jest.fn(), 'Leaner CI and Dependabot updates');

    expect(calls.map((call) => `${call.method} ${call.url}`)).toContain(`GET ${APP}/edits/edit-1/details`);
    // Both the first try and the draft retry carry the notes.
    const trackUpdates = calls.filter((call) => call.method === 'PUT').map(trackBody);
    expect(trackUpdates).toHaveLength(2);
    for (const body of trackUpdates) {
      expect(body.releases[0].releaseNotes).toEqual([
        { language: 'zh-TW', text: 'Leaner CI and Dependabot updates' },
      ]);
    }
  });

  it("saves a draft release while Play still treats the app as a draft", async () => {
    const replies = happyReplies();
    replies[`POST ${APP}/edits/edit-1:commit`] = [
      { status: 400, body: { error: { message: 'Only releases with status draft may be created on draft app.' } } },
    ];
    const { calls, fetchImpl } = fakeGoogle(replies);

    await expect(upload(fetchImpl)).resolves.toEqual({ status: 'draft', versionCode: 40000 });

    const trackUpdates = calls.filter((call) => call.method === 'PUT');
    expect(trackUpdates.map((call) => trackBody(call).releases[0].status)).toEqual([
      'completed',
      'draft',
    ]);
    expect(calls.at(-1)!.url).toBe(`${APP}/edits/edit-1:commit`);
  });

  it('commits without sending for review when Play requires that by hand', async () => {
    const replies = happyReplies();
    replies[`POST ${APP}/edits/edit-1:commit`] = [
      { status: 400, body: { error: { message: 'Changes cannot be sent for review automatically. Please set the query parameter changesNotSentForReview to true.' } } },
    ];
    const { calls, fetchImpl } = fakeGoogle(replies);

    await expect(upload(fetchImpl)).resolves.toEqual({ status: 'not-sent-for-review', versionCode: 40000 });
    expect(calls.at(-1)!.url).toBe(`${APP}/edits/edit-1:commit?changesNotSentForReview=true`);
  });

  it('succeeds without changes when Play already has this versionCode', async () => {
    const replies = happyReplies();
    replies[`POST ${UPLOAD}/edits/edit-1/bundles?uploadType=media`] = [
      { status: 403, body: { error: { message: 'Version code 40000 has already been used.' } } },
    ];
    const { calls, fetchImpl } = fakeGoogle(replies);
    const log = jest.fn();

    await expect(upload(fetchImpl, log)).resolves.toEqual({ status: 'already-uploaded' });
    expect(calls.at(-1)).toMatchObject({ method: 'DELETE', url: `${APP}/edits/edit-1` });
    expect(calls.some((call) => call.method === 'PUT')).toBe(false);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('already has this versionCode'));
  });

  it("discards the edit and reports Google's message when a step fails", async () => {
    const replies = happyReplies();
    replies[`PUT ${APP}/edits/edit-1/tracks/internal`] = [
      { status: 403, body: { error: { message: 'The caller does not have permission' } } },
    ];
    const { calls, fetchImpl } = fakeGoogle(replies);

    const error = await upload(fetchImpl).catch((caught: Error) => caught);
    expect(error.message).toBe('The caller does not have permission');
    expect(error.message).not.toContain('access-token');
    expect(error.message).not.toContain('PRIVATE KEY');
    expect(calls.at(-1)).toMatchObject({ method: 'DELETE', url: `${APP}/edits/edit-1` });
  });

  it('explains a secret that is not a service account key', async () => {
    const { fetchImpl } = fakeGoogle({});
    await expect(
      uploadToInternalTesting({ serviceAccountJson: 'not json', fetchImpl }),
    ).rejects.toThrow('not valid JSON');
    await expect(
      uploadToInternalTesting({ serviceAccountJson: '{"type":"authorized_user"}', fetchImpl }),
    ).rejects.toThrow('service account key file');
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('release notes from the release commit', () => {
  it.each([
    ['Release/0.40.0: Leaner CI and Dependabot updates (#291)', 'Leaner CI and Dependabot updates'],
    ['Release/0.38.x: Isolate Communion and Brooklyn bulletin layouts (#246)', 'Isolate Communion and Brooklyn bulletin layouts'],
    // Older titles had no colon, a doubled PR number, or extra spaces.
    ['Release/0.36.0 Fix Bible audio continuation (#217)', 'Fix Bible audio continuation'],
    ['Release/0.37.0: Prepare for review  and add builds (#218) (#220)', 'Prepare for review and add builds'],
    ['A commit made without a release PR', 'A commit made without a release PR'],
  ])('turns %p into %p', (subject, notes) => {
    expect(releaseNotesFromCommitSubject(subject)).toBe(notes);
  });

  it('gives no notes when the title has nothing after the version', () => {
    expect(releaseNotesFromCommitSubject('Release/0.35.0 (#212)')).toBe('');
    expect(releaseNotesFromCommitSubject(undefined)).toBe('');
  });

  it("keeps within Play's 500-character limit", () => {
    const notes = releaseNotesFromCommitSubject(`Release/1.0.0: ${'a'.repeat(600)} (#1)`);
    expect(notes).toHaveLength(500);
    expect(notes.endsWith('…')).toBe(true);
  });
});
