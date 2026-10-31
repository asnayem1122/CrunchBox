import {
  playMechanicalClick,
  playTearTapeSound,
  triggerHaptic,
  triggerTactileFeedback,
} from '../../src/utils/soundEffects';
import {
  fieldLightTokens,
  tacticalDarkTokens,
  getThemeTokens,
} from '../../src/utils/themeTokens';

describe('SoundEffects & Haptics Engine', () => {
  it('safely invokes playMechanicalClick without errors when sound is enabled', () => {
    expect(() => playMechanicalClick(true)).not.toThrow();
  });

  it('safely skips playMechanicalClick when sound is disabled', () => {
    expect(() => playMechanicalClick(false)).not.toThrow();
  });

  it('safely invokes playTearTapeSound without throwing', () => {
    expect(() => playTearTapeSound(true)).not.toThrow();
    expect(() => playTearTapeSound(false)).not.toThrow();
  });

  it('safely invokes triggerHaptic without throwing', async () => {
    await expect(triggerHaptic(true)).resolves.not.toThrow();
    await expect(triggerHaptic(false)).resolves.not.toThrow();
  });

  it('safely invokes combined triggerTactileFeedback', () => {
    expect(() => triggerTactileFeedback(true, true)).not.toThrow();
    expect(() => triggerTactileFeedback(false, false)).not.toThrow();
  });
});

describe('ThemeTokens Hardware Spec', () => {
  it('contains all required color tokens in fieldLightTokens', () => {
    expect(fieldLightTokens.appBackground).toBe('#D8D0C0');
    expect(fieldLightTokens.chassisSurface).toBe('#2D5A3C');
    expect(fieldLightTokens.innerPanel).toBe('#F5F0E1');
    expect(fieldLightTokens.keypadSurface).toBe('#FFFDF7');
    expect(fieldLightTokens.accentOps).toBe('#EAB308');
    expect(fieldLightTokens.dangerRed).toBe('#D93829');
    expect(fieldLightTokens.actionGreen).toBe('#1E4D2B');
    expect(fieldLightTokens.recessedLcd).toBe('#C5D6A7');
    expect(fieldLightTokens.inkBorder).toBe('#1B241E');
  });

  it('contains all required color tokens in tacticalDarkTokens', () => {
    expect(tacticalDarkTokens.appBackground).toBe('#0D120F');
    expect(tacticalDarkTokens.chassisSurface).toBe('#18261D');
    expect(tacticalDarkTokens.innerPanel).toBe('#1F2D24');
    expect(tacticalDarkTokens.keypadSurface).toBe('#28382E');
    expect(tacticalDarkTokens.accentOps).toBe('#CA8A04');
    expect(tacticalDarkTokens.dangerRed).toBe('#B91C1C');
    expect(tacticalDarkTokens.actionGreen).toBe('#2E7D32');
    expect(tacticalDarkTokens.recessedLcd).toBe('#132217');
    expect(tacticalDarkTokens.inkBorder).toBe('#070A08');
  });

  it('returns appropriate tokens via getThemeTokens helper', () => {
    expect(getThemeTokens('field')).toBe(fieldLightTokens);
    expect(getThemeTokens('tactical')).toBe(tacticalDarkTokens);
  });
});
