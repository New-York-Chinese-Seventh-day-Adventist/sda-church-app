# SDA Church App

A React Native mobile application built with Expo for Seventh-day Adventist church community features.

## Table of Contents

- [Getting Started](#getting-started)
- [Testing](#testing)
- [Release & Versioning](#release--versioning)
- [Branch Protection & Workflow](#branch-protection--workflow)

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm
- Java Development Kit (JDK) 17
- For iOS: Xcode (macOS only) supporting iOS 15.0 - 26.3 (Deployment Target) as defined [by Xcode Releases](https://developer.apple.com/support/xcode/)
- For Android: Android Studio, Android SDK 36 (latest), and `ANDROID_HOME` environment variable

### Installation

```bash
npm install
```

### Web (PWA)

To start the app in a web browser:

````bash
npx expo start --web
```

For PWA mobile testing, setup GitHub pages and run this to deploy.

```bash
npm run deploy
```

Once deployed, you may install app directly from browser `codesammich.github.io/sda-church-app/` on Safari (iOS) or Chrome (Android).

## Testing

### iOS

```bash
npm run ios
````

This command:

- Builds the iOS app using Expo
- Requires a Mac with Xcode installed
- Launches the app on the iOS Simulator or a connected device
- Verify on iOS 15.0 - 26.3

### Android

To start the Metro bundler and launch the app:

```bash
# Default
npm run android

# For Expo Go (recommended for most development):
npx expo start --host lan
# Then scan the QR code with the Expo Go app on your Android Emulator or device.

# For a development build (if you need custom native modules):
# export REACT_NATIVE_PACKAGER_HOSTNAME=$(hostname -I | awk '{print $1}') # This attempts to auto-configure the bundler IP
npx expo run:android

# For WSL
npx expo start --dev-client --tunnel
```

This command:

- Builds the Android app using Expo
- Requires Android Studio or Android SDK set up
- Launches the app on the Android Emulator or a connected device
- Verify on Android SDK 36 or higher

#### WSL Debugging

> Error: Unable to load script. Make sure you're running Metro or that your bundle 'index.android.bundle'...

If you are developing in WSL2, the Android Emulator on Windows may not connect automatically to the Metro server. After running `npm run android`, you may need to manually set the bundle location:

Note: `adb reverse` is NOT the fix for emulator! As long as `adb devices` shows a connected `device`, you're okay.

```bash
$ adb devices
List of devices attached
emulator-5554   device
```

- In the Emulator: **Ctrl + M** -> **Change Bundle Location** -> Set to `172.23.202.254:8081` (or whatever your local WSL server is like).

> › Installing /home/dev/dev/sda-church-app/android/app/build/outputs/apk/debug/app-debug.apk
> › Opening sdachurchapp://expo-development-client/?url=http%3A%2F%2F172.23.202.254%3A8081 on Pixel_9a

If it bundles, you're on the right track.

> Android Bundled 1536ms node_modules/expo-router/entry.js (1759 modules)

Then check `localhost:8081` on your WSL (VSCode) and Windows browser (localhost:8001 or 172.23.202.254:8081). If they both load the app, you're one step closer.

```bash
npm run android
```

If that still black screens, simply try this command with Ctrl+M **Change Bundle Location** to `localhost:8081`. Note you have to press `a` for Android.

```bash
npx expo start --dev-client --tunnel

# or alternatively
npm run wsl
```

### Debugging First-Time Launch

The app tracks setup completion in `AsyncStorage`. To re-test the onboarding flow without wiping the emulator's system data (which preserves your "Change Bundle Location" IP):

1. Ensure the app has bundled and isn't showing a black screen (check terminal for errors).
2. Open the Developer Menu (**Ctrl + M** on Android Emulator).
3. Select **Debug: Reset Onboarding**.
4. Reload the app.

This programmatically clears the `has-completed-setup` flag while keeping your development environment settings intact.

## Release & Versioning

This project uses **Semantic Versioning** ([npm SemVer Guide](https://docs.npmjs.com/about-semantic-versioning)) with the following rules:

- **#patch** — Backward compatible bug fixes (e.g., `0.1.0` → `0.1.1`)
- **#minor** — Backward compatible new features (e.g., `0.1.0` → `0.2.0`)
- **#major** — Breaking changes (e.g., `0.1.0` → `1.0.0`)

### Release Process

1. **Create a Release Branch** from `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b release/0.2.1  # Replace 0.2.1 with the next semantic version
   git push -u origin release/0.2.1
   ```

   Check the [latest tag](https://github.com/CodeSammich/sda-church-app/tags) to determine the appropriate next version. For details on semantic versioning, see [npm Semantic Versioning Guide](https://docs.npmjs.com/about-semantic-versioning).

   **All work**, including patches, minor features, and major updates, must go through a release branch. This ensures consistent versioning and automated tagging.

2. **Create a Pull Request** from your release branch → `main`:
   - Add exactly one version tag in the PR description: `#patch`, `#minor`, or `#major`
   - Complete testing checklist
   - Wait for PR checks to pass
   - Branch name must start with `release/` and match the next semantic version from the latest [tag](https://github.com/CodeSammich/sda-church-app/tags)

3. **Automated Tag Creation**:
   - The `Release Auto-Tag` workflow validates the PR body
   - On merge, it automatically creates a git tag (e.g., `v0.2.0`)
   - The version is bumped based on your chosen semantic version tag

4. **Merge to Main**:
   - Merge the PR to `main`
   - A release tag is automatically created on the merge commit
   - The tag follows the format: `v{major}.{minor}.{patch}`

## Branch Protection & Workflow

### Branch Hierarchy

```
main (stable)
  ↑
  └─ release/0.2.0 (release candidate)
       ↑
       └─ feature/awesome-feature (work in progress)
```

### Branch Rules

#### `main` Branch

- **Protected branch** — Cannot push directly
- **Requires PR** — All changes must come through a pull request
- **Requires PR reviews** — Pull requests must be approved before merge
- **Requires checks to pass** — CI/CD checks must pass
- **Source**: Only from `release/**` branches
- **Auto-tag on merge** — Automatically creates semantic version tags

#### `release/*` Branches

- **Source**: Created from `main` for each release
- **Naming convention**: `release/0.2.0` (matches semantic version)
- **Purpose**: Prepare the release and validate the version bump
- **PR validation**:
  - Enforces exactly one version tag (`#patch`, `#minor`, or `#major`)
  - Prevents PRs without a version tag
  - Prevents PRs with multiple version tags

#### Feature/Work Branches

- **Naming convention**: `feature/`, `bugfix/`, `chore/`, `docs/`, etc.
- **Source**: Branch from `release/*` or directly from `main`
- **PR**: Create PR to target release branch or main
- **Target**: Should merge back to the appropriate release branch

### Pull Request Workflow

1. **Create a branch** from `release/0.2.0` or `main`
2. **Make your changes** and commit with clear messages
3. **Push to origin** and create a PR
4. **Fill PR template**:
   - Select one version tag: `#patch`, `#minor`, or `#major`
   - Complete testing checklist
   - Add description of changes
5. **Await checks**:
   - Workflow validates version tag
   - Tests and linting run
   - Reviews are requested
6. **Merge**: Once approved, merge the PR
7. **If merging to main**: Automatic release tag is created

### Automated Checks

#### `Release Auto-Tag` Workflow (`.github/workflows/auto-tag.yml`)

**Pre-merge check** (`enforce-tag` job):

- Runs on: PR open, edit, sync, new commits
- Validates: Exactly one semantic version tag in PR description
- Fails if: No tag or multiple tags found

**Release tagging** (`tag` job):

- Runs on: PR merge to `main` from `release/*` branch
- Creates: Semantic version tag (e.g., `v0.2.0`)
- Bump type: Determined by `#major`, `#minor`, or `#patch` in PR body

### Example Workflow

```bash
# 1. Start from main
git checkout main && git pull origin main

# 2. Create release branch
git checkout -b release/0.2.0
git push -u origin release/0.2.0

# 3. Create feature branch from release
git checkout -b feature/new-calendar-view
# ... make changes ...
git commit -m "feat: add calendar view for sermon schedule"
git push -u origin feature/new-calendar-view

# 4. Create PR: feature/new-calendar-view → release/0.2.0
# Add "#minor" to PR description (new feature)
# Get approval and merge

# 5. Create PR: release/0.2.0 → main
# Add "#minor" to PR description (matches version bump)
# Get approval and merge

# 6. Automated: Tag v0.2.0 is created on merge commit
# Done! Release is published.
```

**Note**: All releases, including patch updates (e.g., `v0.2.1`), follow this same workflow. Create a `release/0.2.1` branch for any hotfixes or patch releases.

---

**Last Updated**: April 2026
