# App Store and Google Play setup

How the church's store accounts, app records, and signing files are set up, and
what has to be renewed each year to keep the app published and updatable. For how
the build workflows use these files, see [Build Instructions](native-builds.md).
For who owns each account, see
[App stores in the architecture doc](../architecture.md#app-stores).

> [!WARNING]
> **Keep account-specific values out of this repository.** That means the Apple
> Team ID, personal or church email addresses, certificate (`.p12`) and
> provisioning profile (`.mobileprovision`) files, keystores, and every password.
> Use placeholders in documentation, and never commit signing files or secrets.
> Signing values live only in the protected `production` GitHub Environment.

## Contents

- [Apple App Store](#apple-app-store)
  - [App identifiers and App Store Connect](#app-identifiers-and-app-store-connect)
  - [Create an Apple Distribution certificate](#create-an-apple-distribution-certificate)
  - [Create the App Store provisioning profile](#create-the-app-store-provisioning-profile)
  - [Add the signing values to GitHub Actions](#add-the-signing-values-to-github-actions)
  - [Yearly Apple renewals](#yearly-apple-renewals)
- [Google Play](#google-play) (draft)

## Apple App Store

### App identifiers and App Store Connect

- Register the iOS app with the explicit Bundle ID `org.nyccsda.app`.
- The App ID description is an internal label in the Apple Developer portal. The
  App Store listing's name and description are set separately in App Store
  Connect.
- When creating the App Store Connect app record, use a unique internal **SKU**.
  Users never see it.
- Select **iOS/iPadOS**, unless the church also plans a separate Mac app.
- Enable capabilities and services on the App ID only when the app actually uses
  them. Turning on an option in the portal adds nothing by itself: Siri support,
  for example, also needs the app features that use it.
- App Store Connect **user access** controls what each team member can manage.
  Give **Full Access** only to someone who needs to manage everything; choose
  **Limited Access** otherwise.

### Create an Apple Distribution certificate

App Store and TestFlight uploads are signed with an **Apple Distribution**
certificate.

On the Mac that will hold the signing key:

1. Open **Keychain Access → Certificate Assistant → Request a Certificate from a
   Certificate Authority**.
2. Enter a church-managed email address that will stay available.
3. Enter a descriptive **Common Name**, such as `NYCCSDA App Store Distribution`.
   It only labels the key; it doesn't set the app's name.
4. Leave **CA Email Address** blank, choose **Saved to disk**, and keep the default
   key-pair settings.
5. Save the `.certSigningRequest` file.

The request contains the public key. The matching private key stays in that
Mac's Keychain, so keep access to that Mac until the issued certificate is
installed and exported.

In the Apple Developer portal, open **Certificates, Identifiers & Profiles →
Certificates → +**, choose **Apple Distribution**, and upload the request.
Download the resulting `.cer` file and open it **on the same Mac** that created
the request. In Keychain Access, under **My Certificates**, check that the
certificate appears with its private key beneath it.

Export that identity as a password-protected `.p12` file. The `.p12` contains the
private key that signs builds, so anyone with both the file and its password can
sign builds as the church. Keep the file in a restricted location, use a strong
export password, and store the password separately from the file, for example in
the church's password manager.

Apple references:

- [Create a certificate signing request](https://developer.apple.com/help/account/certificates/create-a-certificate-signing-request)
- [Export and protect signing identities](https://developer.apple.com/documentation/Xcode/sharing-your-teams-signing-certificates)

### Create the App Store provisioning profile

In **Certificates, Identifiers & Profiles → Profiles → +**:

1. Under **Distribution**, choose **App Store Connect**.
2. Select the App ID for `org.nyccsda.app`.
3. Select the Apple Distribution certificate created above.
4. Give the profile a recognizable internal name, such as
   `NYCCSDA App Store Distribution`.
5. Generate and download the `.mobileprovision` file.

The provisioning profile is a separate file from the `.p12`. It ties the app's
App ID to the distribution certificate, so it must be regenerated whenever the
certificate is replaced.

Apple reference:
[Create an App Store Connect provisioning profile](https://developer.apple.com/help/account/provisioning-profiles/create-an-app-store-provisioning-profile)

### Add the signing values to GitHub Actions

The iOS build workflow (`.github/workflows/native-ios-build.yml`) reads four
secrets from the GitHub Environment named `production`. Add them under
**Repository → Settings → Environments → production → Environment secrets**, not
as repository secrets:

| Secret | Value |
| --- | --- |
| `IOS_DISTRIBUTION_CERTIFICATE_BASE64` | Base64 text of the `.p12` file |
| `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD` | The password used when exporting the `.p12` |
| `IOS_PROVISIONING_PROFILE_BASE64` | Base64 text of the `.mobileprovision` file |
| `IOS_TEAM_ID` | The church's Apple Developer Team ID, from **Membership details** in the Apple Developer account. Don't write the real value in this repository. |

Encode each file without printing it. On Windows, in PowerShell, this copies the
Base64 text straight to the clipboard:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\certificate.p12")) | Set-Clipboard
# Paste into IOS_DISTRIBUTION_CERTIFICATE_BASE64

[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\profile.mobileprovision")) | Set-Clipboard
# Paste into IOS_PROVISIONING_PROFILE_BASE64
```

Afterwards, copy something else so the certificate text doesn't stay on the
clipboard. If Windows clipboard history (**Win + V**) is on, clear it too. For
macOS, see the commands in
[iOS setup](native-builds.md#ios-setup-github-hosted-direct-builds).

The workflow checks that the profile belongs to `IOS_TEAM_ID` and to
`org.nyccsda.app` before importing anything, and deletes every signing file when
it finishes. It runs only for commits on `main`, or a manual run from `main`, so
the first signed build happens when a release reaches `main`. It produces an IPA
artifact; uploading it to App Store Connect is a separate manual step (see
[Uploading to the stores](admin-runbook.md#uploading-to-the-stores)). Each upload
needs a higher `expo.ios.buildNumber` in `app.json`.

### Yearly Apple renewals

Three things expire every year. Put each date in the church calendar with a
reminder about a month ahead.

1. **Developer Program membership and the fee waiver.** Because the church is a
   recognized nonprofit, Apple waives the $99 annual fee. The waiver isn't
   permanent: when the membership comes up for renewal, the **Account Holder**
   must confirm that the church is still eligible. Renewal opens 30 days before
   the expiration date. To stay eligible, the church must remain a recognized
   nonprofit (in the U.S., by the IRS), and the app must stay free, with no paid apps, in-app
   purchases, or sales of digital goods. If the membership lapses, the app is
   removed from the App Store (copies already installed keep working) and no
   updates can be uploaded until it's renewed. See Apple's
   [fee waiver requirements](https://developer.apple.com/help/account/membership/fee-waivers/)
   and [program renewal](https://developer.apple.com/help/account/membership/renewal/).
2. **The Apple Distribution certificate** is valid for one year. When it expires,
   the app already on the App Store keeps working, but new builds can't be
   uploaded. Before it expires, create a replacement: a new certificate request,
   certificate, and `.p12`, as above.
3. **The provisioning profile** depends on the certificate. Generate a new
   App Store profile with the new certificate.

After replacing the certificate and profile, update
`IOS_DISTRIBUTION_CERTIFICATE_BASE64`, `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD`
and `IOS_PROVISIONING_PROFILE_BASE64` in the `production` Environment.
`IOS_TEAM_ID` doesn't change. Then run **Actions → Native iOS build → Run
workflow** from `main` to confirm that signing still works. Once the new
certificate works, revoke the old one in the Apple Developer portal. A revoked
certificate doesn't affect the app already on the App Store, but builds signed
with it that are uploaded and not yet submitted may be marked invalid.

## Google Play

> [!NOTE]
> **Draft.** This section is an outline to be completed from the church's actual
> Play Console setup. Replace each **To document** note with the steps as they
> were done. What the repository already records is filled in.

### Developer account

- The church has one **organization** developer account on the `nyccsda.org`
  domain. It paid the one-time $25 fee; there is no yearly fee. See
  [Google Play in the architecture doc](../architecture.md#google-play).
- Organization accounts need a D-U-N-S number and a verified website. `nyccsda.org`
  is verified in Google Search Console by a DNS record.
- Each administrator signs in with their own `nyccsda.org` account, added as a
  user of the organization account.
- **To document:** how the account was created and verified, who holds which
  permission, and how to add or remove an administrator.

### App record

- **To document:** creating the app in Play Console (name, default language, app
  rather than game, free), and the package name `org.nyccsda.app`, which can't
  change after the first upload.

### App content declarations

- **To document:** the privacy policy URL, the Data safety form, the ads
  declaration (no ads), the content rating questionnaire, target audience and
  content (the library includes children's books), and any other declarations
  Play Console asks for. Keep the answers consistent with
  [store-policy-audit.md](store-policy-audit.md).

### Store listing

- **To document:** the short and full descriptions, the app icon, feature graphic,
  and phone and tablet screenshots, and which languages the listing is
  translated into.

### Signing and the first upload

- Google Play keeps the app-signing key (Play App Signing); CI signs with the
  church's **upload key**. The upload key, the `production` Environment secrets,
  and the `versionCode` rules are in
  [Android setup](native-builds.md#android-setup-github-hosted-direct-builds).
- **To document:** enrolling in Play App Signing, the first AAB upload, and where
  the upload key and its passwords are backed up. Don't record the values here.

### Testing and release tracks

- **To document:** the internal testing track and its tester list, whether a
  closed test is required before production for this account type, and the steps
  for promoting a release to production.

### Yearly Google Play upkeep

- There is no yearly fee or certificate to renew. The upload key is long-lived
  and rotates only through Play Console if it's lost or leaked; see
  [Android rotation and recovery policy](native-builds.md#android-rotation-and-recovery-policy).
- Google Play raises its target API level requirement every year; the
  [store toolchain monitor](admin-runbook.md#store-toolchain-monitor-alerts)
  watches for this.
- **To document:** any yearly Play Console declarations or policy confirmations
  the church has to renew.
