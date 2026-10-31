# CrunchBox (CB-09 FIELD UNIT) — Release & Distribution Guide

This document describes the automated production release system for **CrunchBox (`CB-09 FIELD UNIT`)**, including GitHub Actions CI/CD setup, repository secrets configuration, version synchronization, tag-triggered publishing, and local verification gates.

---

## 1. Release Architecture Overview

Every official release APK is built, signed, cryptographically verified, and published through a hardened GitHub Actions workflow (`.github/workflows/android-release.yml`).

```
Git Tag (vX.Y.Z) or workflow_dispatch
    │
    ▼
┌────────────────────────────────────────────────────────┐
│ 1. TypeScript & Jest Quality Gates (154+ Tests Pass)   │
│ 2. Deterministic Version Gate (scripts/verify-version) │
│ 3. Secure Keystore & Credentials Provisioning          │
│ 4. Fail-Closed Gradle Build (assembleRelease)          │
│ 5. APK Signature & Production Fingerprint Gate         │
│ 6. Artifact Checksums (SHA256SUMS.txt)                 │
│ 7. GitHub Release Publishing (CrunchBox-CB09-vX.Y.Z)   │
│ 8. Security Cleanup (Shred Keystore & Properties)      │
└────────────────────────────────────────────────────────┘
```

---

## 2. One-Time GitHub Secrets Configuration

Before the workflow can sign production APKs, configure the following 4 secrets in:
**`https://github.com/asnayem1122/CrunchBox/settings/secrets/actions`**

| Secret Name | Description | Example / Source |
| :--- | :--- | :--- |
| `CRUNCHBOX_RELEASE_KEYSTORE_BASE64` | Base64-encoded string of the release keystore | Exported from `android/app/crunchbox-release-key.jks` |
| `CRUNCHBOX_RELEASE_STORE_PASSWORD` | Master password for the release keystore | From `android/keystore.properties` |
| `CRUNCHBOX_RELEASE_KEY_ALIAS` | Key alias for the release signing key | `crunchbox-release-key` |
| `CRUNCHBOX_RELEASE_KEY_PASSWORD` | Password for the release key alias | From `android/keystore.properties` |

### How to Base64-Encode the Keystore Without Terminal Echo

#### On Windows (PowerShell)
Copies the Base64 string directly to your clipboard without printing secrets to the terminal:
```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("android\app\crunchbox-release-key.jks")) | Set-Clipboard
```
*Paste directly into the GitHub Secret value field.*

#### On Linux / macOS (Bash)
Copies the Base64 string directly to your clipboard:
```bash
# macOS
base64 -i android/app/crunchbox-release-key.jks | pbcopy

# Linux (with xclip)
base64 -w 0 android/app/crunchbox-release-key.jks | xclip -selection clipboard
```

---

## 3. Production Certificate Verification Record

Every production release APK is cryptographically signed with the official CrunchBox Hardware Labs key:

- **Package ID:** `com.crunchbox.cb09`
- **Certificate DN:** `CN=CrunchBox Engineering, OU=CB09 Hardware Labs, O=CrunchBox, L=Dhaka, ST=Dhaka, C=BD`
- **SHA-256 Fingerprint:**
  ```text
  55:58:3F:2D:13:67:60:FF:15:1B:89:C6:0F:8E:98:22:06:2D:67:37:77:BD:6B:87:49:B0:07:29:94:3F:55:0C
  ```
- **Normalized Lowercase Hex:**
  ```text
  55583f2d136760ff151b89c60f8e9822062d673777bd6b8749b00729943f550c
  ```
- **SHA-1 Fingerprint:**
  ```text
  D4:8F:E0:95:2A:E0:56:D7:95:83:B0:F9:1B:B9:F5:92:1B:B5:E0:FC
  ```

> [!CAUTION]
> **Zero Debug Fallback:**
> The release build configuration in `android/app/build.gradle` has no debug fallback. If release credentials or the keystore are missing during a release task, Gradle will throw an immediate `GradleException`. Furthermore, CI verifies via `apksigner` that the certificate is NOT an Android Debug key.

---

## 4. Deterministic Version Synchronization

All release versions must be synchronized across 3 files before tagging:
1. `package.json` (`version`)
2. `app.json` (`expo.version`, `expo.android.versionCode`)
3. `android/app/build.gradle` (`versionName`, `versionCode`)

### Monotonic Version Code Policy
- `v1.0.0` was `versionCode: 1`.
- `v1.1.0` was `versionCode: 2`.
- Any subsequent release must have `versionCode >= 2` and strictly greater than the previous release, either using:
  - Monotonic sequential integers (`versionCode: 3`, `versionCode: 4`, etc.)
  - Deterministic SemVer encoding: `MAJOR * 10000 + MINOR * 100 + PATCH` (e.g. `v1.2.0` $\rightarrow$ `10200`).

### Running the Version Sync Gate Locally
```bash
npm run verify:version -- --tag v1.1.0
```

---

## 5. Standard Release Workflow (Git Tag)

To ship a new production release:

1. **Update Version Numbers:**
   Update `package.json`, `app.json`, and `android/app/build.gradle`.
2. **Verify Version Gate & Tests:**
   ```bash
   npm run verify:version -- --tag vX.Y.Z
   npm run typecheck
   npm test
   ```
3. **Commit & Tag:**
   ```bash
   git add package.json app.json android/app/build.gradle CHANGELOG.md
   git commit -m "feat(release): vX.Y.Z ..."
   git tag -a vX.Y.Z -m "CrunchBox CB-09 FIELD UNIT vX.Y.Z production release"
   ```
4. **Push to GitHub:**
   ```bash
   git push origin main
   git push origin vX.Y.Z
   ```
5. **Monitor CI/CD:**
   Navigate to **Actions** in GitHub. The workflow will automatically compile, verify, and attach `CrunchBox-CB09-vX.Y.Z.apk` and `SHA256SUMS.txt` to the GitHub Release.

---

## 6. Manual Release Dispatch (`workflow_dispatch`)

You can trigger a build and publish for any existing or custom tag without creating a new git tag push:

1. Open **GitHub Actions** $\rightarrow$ **Android Automated Release & Distribution**.
2. Click **Run workflow**.
3. (Optional) Provide the release tag in `Release Git Tag (e.g. v1.1.0)` input.
4. Click **Run workflow**.

Using GitHub CLI (`gh`):
```bash
gh workflow run android-release.yml -f release_tag=v1.1.0
```

---

## 7. Backfilling Existing Releases (`v1.0.0` and `v1.1.0`)

To backfill signed release APKs and checksums for existing repository tags:
```bash
# Trigger workflow dispatch for v1.1.0
gh workflow run android-release.yml -f release_tag=v1.1.0

# Trigger workflow dispatch for v1.0.0
gh workflow run android-release.yml -f release_tag=v1.0.0
```
Because the workflow includes safe `--clobber` checks, existing release notes and historical tags are preserved while uploading the production APK assets.

---

## 8. Local Verification Commands

To verify an APK build on your local development machine:

```powershell
# 1. Verify Android package name, version, and versionCode
& "$env:LOCALAPPDATA\Android\Sdk\build-tools\35.0.0\aapt2.exe" dump badging CrunchBox-CB09-v1.1.0.apk | Select-String "package:"

# 2. Verify signature and certificate fingerprints
& "$env:LOCALAPPDATA\Android\Sdk\build-tools\35.0.0\apksigner.bat" verify --print-certs CrunchBox-CB09-v1.1.0.apk

# 3. Calculate SHA-256 file checksum
certutil -hashfile CrunchBox-CB09-v1.1.0.apk SHA256
```
