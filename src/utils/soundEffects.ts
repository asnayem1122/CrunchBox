import * as Haptics from 'expo-haptics';

let webAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const AudioCtxClass =
    window.AudioContext ||
    // @ts-ignore
    window.webkitAudioContext;

  if (!AudioCtxClass) {
    return null;
  }

  if (!webAudioCtx || webAudioCtx.state === 'closed') {
    try {
      webAudioCtx = new AudioCtxClass();
    } catch {
      webAudioCtx = null;
    }
  }

  if (webAudioCtx && webAudioCtx.state === 'suspended') {
    webAudioCtx.resume().catch(() => {});
  }

  return webAudioCtx;
}

/**
 * Synthesizes an authentic 12ms mechanical switch click tone using Web Audio API.
 * Uses a square/sawtooth oscillator burst with exponential decay.
 * Zero external audio assets needed (0ms latency, 100% offline).
 */
export function playMechanicalClick(soundEnabled: boolean = true): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.012);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);

    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.012);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.014);
  } catch {
    // Graceful fallback if audio cannot play
  }
}

/**
 * Synthesizes a perforated paper tape tearing noise burst (60ms highpass noise).
 */
export function playTearTapeSound(soundEnabled: boolean = true): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const bufferSize = ctx.sampleRate * 0.06;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(ctx.currentTime);
  } catch {
    // Graceful fallback
  }
}

export type HapticFeedbackTier = 'light' | 'medium' | 'heavy' | 'warning';

/**
 * Triggers native haptic impact or notification feedback on iOS/Android.
 * Strictly non-blocking and fire-and-forget.
 */
export async function triggerHaptic(
  hapticsEnabled: boolean = true,
  style: HapticFeedbackTier = 'light'
): Promise<void> {
  if (!hapticsEnabled) return;
  try {
    if (style === 'warning') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    let impactStyle = Haptics.ImpactFeedbackStyle.Light;
    if (style === 'medium') {
      impactStyle = Haptics.ImpactFeedbackStyle.Medium;
    } else if (style === 'heavy') {
      impactStyle = Haptics.ImpactFeedbackStyle.Heavy;
    }

    await Haptics.impactAsync(impactStyle);
  } catch {
    // Unsupported platform or Web fallback
  }
}

// 25ms throttle timestamp to prevent auditory and haptic stutter during fast bursts
let lastFeedbackTimestamp = 0;

/**
 * Unified feedback trigger combining mechanical sound and haptic pulse.
 * Throttled to at most once per 25ms.
 */
export function triggerTactileFeedback(
  soundEnabled: boolean = true,
  hapticsEnabled: boolean = true,
  tier: HapticFeedbackTier = 'light'
): void {
  const now = Date.now();
  if (now - lastFeedbackTimestamp < 25) {
    return;
  }
  lastFeedbackTimestamp = now;

  playMechanicalClick(soundEnabled);
  // Fire-and-forget: catch any error silently
  triggerHaptic(hapticsEnabled, tier).catch(() => {});
}
