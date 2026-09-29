// Uploads the signed AAB to Google Play's internal testing track, where the
// church's testers get it automatically. Nothing reaches the public until a
// maintainer promotes the release in Play Console.
//
// It uses only Node's built-ins, so the job that holds the Play credential runs
// no npm packages. The credential is a service account key; setup is in
// docs/operations/native-builds.md#automatic-store-uploads.
//
//   GOOGLE_PLAY_SERVICE_ACCOUNT_JSON='{…}' node scripts/upload-google-play.cjs app.aab

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const API = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications';
const UPLOAD_API =
  'https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications';
const SCOPE = 'https://www.googleapis.com/auth/androidpublisher';
const DEFAULT_TOKEN_URI = 'https://oauth2.googleapis.com/token';
const TRACK = 'internal';

// Play refuses a versionCode it has seen before, for example on a rerun.
const ALREADY_UPLOADED = /already been used/i;
// Until the app's first release is rolled out in Play Console, Play accepts
// only draft releases.
const DRAFT_APP = /only releases with status draft may be created on draft app/i;
// Some apps need changes sent for review by hand in Play Console.
const REVIEW_BY_HAND = /changesNotSentForReview/;
// Play's limit for one language's release notes.
const MAX_RELEASE_NOTES = 500;

class PlayApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const parseServiceAccount = (json) => {
  let account;
  try {
    account = JSON.parse(json);
  } catch {
    throw new Error(
      'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is not valid JSON. Paste the whole key file.',
    );
  }
  if (account?.type !== 'service_account' || !account.client_email || !account.private_key) {
    throw new Error(
      'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON must be a service account key file with client_email and private_key.',
    );
  }
  return { ...account, token_uri: account.token_uri || DEFAULT_TOKEN_URI };
};

// A signed JWT that Google trades for an access token.
const createAssertion = (serviceAccount, now) => {
  const issuedAt = Math.floor(now / 1000);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: serviceAccount.client_email,
    scope: SCOPE,
    aud: serviceAccount.token_uri,
    iat: issuedAt,
    exp: issuedAt + 3600,
  })}`;
  const signature = crypto
    .sign('RSA-SHA256', Buffer.from(unsigned), serviceAccount.private_key)
    .toString('base64url');
  return `${unsigned}.${signature}`;
};

// The "What's new" text testers see: the release PR's title. On main, it's the
// subject of the squash-merge commit, such as
// "Release/0.40.0: Leaner CI and Dependabot updates (#291)", so drop the
// "Release/x.y.z:" prefix and the "(#291)" suffix.
const releaseNotesFromCommitSubject = (subject) => {
  const text = String(subject || '')
    .replace(/^\s*Release\/\d+\.\d+\.(?:\d+|x)\s*:?/i, '')
    .replace(/(?:\s*\(#\d+\))+\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > MAX_RELEASE_NOTES ? `${text.slice(0, MAX_RELEASE_NOTES - 1)}…` : text;
};

const request = async (fetchImpl, url, { method = 'GET', token, body, contentType } = {}) => {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (contentType) headers['content-type'] = contentType;
  const response = await fetchImpl(url, { method, headers, body });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!response.ok) {
    const message =
      data.error?.message || data.error_description || text.slice(0, 500) || response.statusText;
    throw new PlayApiError(response.status, message);
  }
  return data;
};

const json = (value) => ({ body: JSON.stringify(value), contentType: 'application/json' });

const uploadToInternalTesting = async ({
  serviceAccountJson,
  packageName,
  versionName,
  bundle,
  releaseNotes = '',
  fetchImpl = fetch,
  now = Date.now(),
  log = console.log,
}) => {
  const serviceAccount = parseServiceAccount(serviceAccountJson);
  const { access_token: token } = await request(fetchImpl, serviceAccount.token_uri, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: createAssertion(serviceAccount, now),
    }).toString(),
    contentType: 'application/x-www-form-urlencoded',
  });
  if (!token) throw new Error('Google returned no access token.');

  // Every change happens inside an "edit", which takes effect only on commit.
  const app = `${API}/${encodeURIComponent(packageName)}`;
  const edit = await request(fetchImpl, `${app}/edits`, { method: 'POST', token, ...json({}) });
  const editUrl = `${app}/edits/${encodeURIComponent(edit.id)}`;
  const deleteEdit = () =>
    request(fetchImpl, editUrl, { method: 'DELETE', token }).catch(() => {});

  try {
    let versionCode;
    try {
      ({ versionCode } = await request(
        fetchImpl,
        `${UPLOAD_API}/${encodeURIComponent(packageName)}/edits/${encodeURIComponent(edit.id)}/bundles?uploadType=media`,
        { method: 'POST', token, body: bundle, contentType: 'application/octet-stream' },
      ));
    } catch (error) {
      if (!ALREADY_UPLOADED.test(error.message)) throw error;
      log(`Google Play already has this versionCode: ${error.message}`);
      await deleteEdit();
      return { status: 'already-uploaded' };
    }

    // Release notes need a language; use the store listing's default one.
    let notes;
    if (releaseNotes) {
      const { defaultLanguage } = await request(fetchImpl, `${editUrl}/details`, { token });
      notes = [{ language: defaultLanguage, text: releaseNotes }];
    }

    const release = async (status, commitQuery = '') => {
      await request(fetchImpl, `${editUrl}/tracks/${TRACK}`, {
        method: 'PUT',
        token,
        ...json({
          track: TRACK,
          releases: [
            {
              name: `${versionName} (${versionCode})`,
              versionCodes: [String(versionCode)],
              status,
              ...(notes && { releaseNotes: notes }),
            },
          ],
        }),
      });
      await request(fetchImpl, `${editUrl}:commit${commitQuery}`, { method: 'POST', token });
    };

    let status = 'completed';
    try {
      await release(status);
    } catch (error) {
      if (DRAFT_APP.test(error.message)) {
        status = 'draft';
        await release(status);
      } else if (REVIEW_BY_HAND.test(error.message)) {
        status = 'not-sent-for-review';
        await release('completed', '?changesNotSentForReview=true');
      } else {
        throw error;
      }
    }
    return { status, versionCode };
  } catch (error) {
    await deleteEdit();
    throw error;
  }
};

const SUMMARIES = {
  completed: (name) =>
    `Uploaded ${name} to Google Play internal testing. Testers get it once Google finishes processing.`,
  draft: (name) =>
    `Uploaded ${name} to internal testing as a draft, because Play accepts only drafts until the app's first release is rolled out. Roll it out in Play Console → Test and release → Internal testing.`,
  'not-sent-for-review': (name) =>
    `Uploaded ${name} to internal testing. Play needs these changes sent for review by hand: Play Console → Publishing overview.`,
  'already-uploaded': (name) =>
    `Google Play already has ${name}, so there was nothing new to upload.`,
};

const main = async () => {
  const bundlePath = process.argv[2];
  if (!bundlePath) throw new Error('Usage: node scripts/upload-google-play.cjs <app.aab>');
  const appJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '..', 'app.json'), 'utf8'),
  );
  const versionName = appJson.expo.version;
  const releaseNotes = releaseNotesFromCommitSubject(process.env.RELEASE_COMMIT_SUBJECT);
  const result = await uploadToInternalTesting({
    serviceAccountJson: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON || '',
    packageName: appJson.expo.android.package,
    versionName,
    bundle: fs.readFileSync(bundlePath),
    releaseNotes,
  });
  const name = result.versionCode ? `${versionName} (${result.versionCode})` : versionName;
  let summary = SUMMARIES[result.status](name);
  if (releaseNotes && result.status !== 'already-uploaded') {
    summary += ` What's new: "${releaseNotes}"`;
  }
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
  }
  if (result.status === 'draft' || result.status === 'not-sent-for-review') {
    console.log(`::warning title=Finish in Play Console::${summary}`);
  }
};

module.exports = {
  createAssertion,
  parseServiceAccount,
  releaseNotesFromCommitSubject,
  uploadToInternalTesting,
};

if (require.main === module) {
  main().catch((error) => {
    console.error(`::error title=Google Play upload failed::${error.message}`);
    process.exit(1);
  });
}
