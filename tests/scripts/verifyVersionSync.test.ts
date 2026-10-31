import {
  verifyVersions,
  computeSemVerCode,
} from '../../scripts/verify-version-sync';

describe('Deterministic Version Synchronization Gate', () => {
  const baseValid = {
    pkgVersion: '1.1.0',
    appVersion: '1.1.0',
    appVersionCode: 2,
    gradleVersionName: '1.1.0',
    gradleVersionCode: 2,
    tag: 'v1.1.0',
    minVersionCode: 2,
  };

  test('passes cleanly when all version declarations and tag match', () => {
    const result = verifyVersions(baseValid);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.summary.pkgVersion).toBe('1.1.0');
    expect(result.summary.appVersionCode).toBe(2);
  });

  test('calculates SemVer deterministic version code correctly', () => {
    expect(computeSemVerCode('1.0.0')).toBe(10000);
    expect(computeSemVerCode('1.1.0')).toBe(10100);
    expect(computeSemVerCode('2.0.5')).toBe(20005);
    expect(computeSemVerCode('invalid')).toBeNull();
  });

  test('fails if package.json and app.json versions diverge', () => {
    const result = verifyVersions({
      ...baseValid,
      appVersion: '1.0.9',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('package.json (1.1.0) !== app.json (1.0.9)'))).toBe(true);
  });

  test('fails if package.json and build.gradle versionName diverge', () => {
    const result = verifyVersions({
      ...baseValid,
      gradleVersionName: '1.0.9',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('package.json (1.1.0) !== build.gradle (1.0.9)'))).toBe(true);
  });

  test('fails if app.json and build.gradle versionCode diverge', () => {
    const result = verifyVersions({
      ...baseValid,
      gradleVersionCode: 3,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('app.json (2) !== build.gradle (3)'))).toBe(true);
  });

  test('rejects versionCode regression below baseline (< 2)', () => {
    const result = verifyVersions({
      ...baseValid,
      appVersionCode: 1,
      gradleVersionCode: 1,
      minVersionCode: 2,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('versionCode regression'))).toBe(true);
  });

  test('allows higher versionCode (e.g. versionCode: 3 or 10200 for v1.2.0)', () => {
    const result = verifyVersions({
      pkgVersion: '1.2.0',
      appVersion: '1.2.0',
      appVersionCode: 3,
      gradleVersionName: '1.2.0',
      gradleVersionCode: 3,
      tag: 'v1.2.0',
      minVersionCode: 2,
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('fails if tag version does not match package version', () => {
    const result = verifyVersions({
      ...baseValid,
      tag: 'v1.0.0',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("tag 'v1.0.0'"))).toBe(true);
  });

  test('fails if tag format is invalid', () => {
    const result = verifyVersions({
      ...baseValid,
      tag: 'release-1.1.0',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("Invalid Git tag format: 'release-1.1.0'"))).toBe(true);
  });

  test('warns but passes if tag is omitted outside release mode', () => {
    const result = verifyVersions({
      ...baseValid,
      tag: null,
    });
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.includes('No Git tag detected'))).toBe(true);
  });
});
