#!/usr/bin/env node
/**
 * CrunchBox (CB-09 FIELD UNIT) — Deterministic Version Synchronization Gate
 * Validates that package.json, app.json, android/app/build.gradle, and Git release tags match identically.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function readPackageJson(rootPath = process.cwd()) {
  const filePath = path.join(rootPath, 'package.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`package.json not found at ${filePath}`);
  }
  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return { version: pkg.version };
}

function readAppJson(rootPath = process.cwd()) {
  const filePath = path.join(rootPath, 'app.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`app.json not found at ${filePath}`);
  }
  const app = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const expo = app.expo || {};
  const android = expo.android || {};
  return {
    version: expo.version,
    versionCode: android.versionCode,
  };
}

function readBuildGradle(rootPath = process.cwd()) {
  const filePath = path.join(rootPath, 'android', 'app', 'build.gradle');
  if (!fs.existsSync(filePath)) {
    throw new Error(`build.gradle not found at ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');

  const versionCodeMatch = content.match(/versionCode\s+(\d+)/);
  const versionNameMatch = content.match(/versionName\s+["']([^"']+)["']/);

  if (!versionCodeMatch) {
    throw new Error('versionCode not found in android/app/build.gradle');
  }
  if (!versionNameMatch) {
    throw new Error('versionName not found in android/app/build.gradle');
  }

  return {
    versionCode: parseInt(versionCodeMatch[1], 10),
    versionName: versionNameMatch[1],
  };
}

function resolveTag(argv = process.argv) {
  // Check CLI arguments for --tag <tag> or --tag=<tag>
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--tag' && argv[i + 1]) {
      return argv[i + 1];
    }
    if (argv[i].startsWith('--tag=')) {
      return argv[i].split('=')[1];
    }
  }

  // Check Environment Variables (GitHub Actions & CI)
  if (process.env.RELEASE_TAG) {
    return process.env.RELEASE_TAG.trim();
  }
  if (process.env.GITHUB_REF_NAME && process.env.GITHUB_REF_TYPE === 'tag') {
    return process.env.GITHUB_REF_NAME.trim();
  }

  // Fallback to git describe if inside git repo
  try {
    const gitTag = execSync('git describe --tags --exact-match', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    if (gitTag) return gitTag;
  } catch {
    // No exact tag at HEAD
  }

  return null;
}

/**
 * @param {string} versionStr
 * @returns {number | null}
 */
function computeSemVerCode(versionStr) {
  const parts = versionStr.split('.').map(p => parseInt(p, 10));
  if (parts.length !== 3 || parts.some(isNaN)) {
    return null;
  }
  const [major, minor, patch] = parts;
  return major * 10000 + minor * 100 + patch;
}

/**
 * @param {Object} params
 * @param {string} params.pkgVersion
 * @param {string} params.appVersion
 * @param {number} params.appVersionCode
 * @param {string} params.gradleVersionName
 * @param {number} params.gradleVersionCode
 * @param {string | null} [params.tag]
 * @param {number} [params.minVersionCode]
 */
function verifyVersions(params) {
  const {
    pkgVersion,
    appVersion,
    appVersionCode,
    gradleVersionName,
    gradleVersionCode,
    tag = null,
    minVersionCode = 2,
  } = params;

  const errors = [];
  const warnings = [];

  // 1. Version name consistency
  if (pkgVersion !== appVersion) {
    errors.push(`Version mismatch: package.json (${pkgVersion}) !== app.json (${appVersion})`);
  }
  if (pkgVersion !== gradleVersionName) {
    errors.push(`Version mismatch: package.json (${pkgVersion}) !== build.gradle (${gradleVersionName})`);
  }

  // 2. Version code consistency
  if (appVersionCode !== gradleVersionCode) {
    errors.push(`Version code mismatch: app.json (${appVersionCode}) !== build.gradle (${gradleVersionCode})`);
  }

  // 3. Monotonic Version Code Guard (v1.1.0 baseline is 2)
  if (typeof appVersionCode !== 'number' || isNaN(appVersionCode)) {
    errors.push(`Invalid versionCode: '${appVersionCode}' is not a valid integer`);
  } else if (appVersionCode < minVersionCode) {
    errors.push(
      `versionCode regression: ${appVersionCode} is less than required minimum ${minVersionCode} (v1.1.0 baseline). ` +
      `Android package manager will reject in-place upgrades.`
    );
  }

  // 4. Git Tag Consistency (if tag is provided)
  if (tag) {
    const tagRegex = /^v(\d+)\.(\d+)\.(\d+)$/;
    if (!tagRegex.test(tag)) {
      errors.push(`Invalid Git tag format: '${tag}'. Must follow 'vX.Y.Z' SemVer pattern.`);
    } else {
      const tagVersion = tag.replace(/^v/, '');
      if (tagVersion !== pkgVersion) {
        errors.push(`Git tag version mismatch: tag '${tag}' (version '${tagVersion}') !== package.json ('${pkgVersion}')`);
      }
    }
  } else {
    warnings.push('No Git tag detected or provided. Skipping tag comparison check.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      pkgVersion,
      appVersion,
      gradleVersionName,
      appVersionCode,
      gradleVersionCode,
      tag: tag || '(None)',
      semVerEquivalentCode: computeSemVerCode(pkgVersion),
    },
  };
}

function runCli() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║     CRUNCHBOX (CB-09) — DETERMINISTIC VERSION SYNCHRONIZATION GATE   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');

  const rootPath = process.cwd();
  const pkg = readPackageJson(rootPath);
  const app = readAppJson(rootPath);
  const gradle = readBuildGradle(rootPath);
  const tag = resolveTag(process.argv);

  const result = verifyVersions({
    pkgVersion: pkg.version,
    appVersion: app.version,
    appVersionCode: app.versionCode,
    gradleVersionName: gradle.versionName,
    gradleVersionCode: gradle.versionCode,
    tag,
    minVersionCode: 2,
  });

  console.log('\n[VERSION LEDGER AUDIT]');
  console.log(`  * package.json (version)        : ${result.summary.pkgVersion}`);
  console.log(`  * app.json (expo.version)       : ${result.summary.appVersion}`);
  console.log(`  * app.json (android.versionCode): ${result.summary.appVersionCode}`);
  console.log(`  * build.gradle (versionName)    : ${result.summary.gradleVersionName}`);
  console.log(`  * build.gradle (versionCode)    : ${result.summary.gradleVersionCode}`);
  console.log(`  * Git Tag                       : ${result.summary.tag}`);
  console.log(`  * SemVer Calculated Code        : ${result.summary.semVerEquivalentCode}`);

  if (result.warnings.length > 0) {
    console.log('\n[WARNINGS]');
    result.warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }

  if (!result.valid) {
    console.error('\n[FAIL] Version synchronization errors detected:');
    result.errors.forEach(e => console.error(`  ✖ ${e}`));
    process.exit(1);
  }

  console.log('\n[PASS] All version declarations and monotonicity gates are verified!\n');
}

if (require.main === module) {
  runCli();
}

module.exports = {
  readPackageJson,
  readAppJson,
  readBuildGradle,
  resolveTag,
  computeSemVerCode,
  verifyVersions,
};
