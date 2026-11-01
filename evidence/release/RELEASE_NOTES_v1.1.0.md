# CrunchBox (CB-09 FIELD UNIT) — v1.1.0 Release Notes

**CB-09 Tactical Field Computer & Scientific Calculator**  
*Release Date: November 1, 2026 | Version: 1.1.0 (versionCode: 2)*

---

## 📲 Direct Download
- **Download Standalone APK:** [CrunchBox-CB09-v1.1.0-release.apk](https://github.com/asnayem1122/CrunchBox/releases/download/v1.1.0/CrunchBox-CB09-v1.1.0-release.apk)
- **Latest Releases Page:** [https://github.com/asnayem1122/CrunchBox/releases/latest](https://github.com/asnayem1122/CrunchBox/releases/latest)

```
File: CrunchBox-CB09-v1.1.0-release.apk
Size: 64,273,005 bytes (61.3 MB)
SHA-256: 26D89188CD728D973C707C62AF76456AA8AC66D60D1D80D9E4C1708614979CE7
Signing SHA-256: 55:58:3F:2D:13:67:60:FF:15:1B:89:C6:0F:8E:98:22:06:2D:67:37:77:BD:6B:87:49:B0:07:29:94:3F:55:0C
```

---

## 🚀 What's New in v1.1.0

### 1. Direct Binary Calculation Section (`DEV > BIN CALC` / `দ্বিমিক হিসাব`)
- **Dual Universal Operands:** Independently switch and enter Operand A and Operand B in ANY radix (`BIN`, `DEC`, `HEX`, `OCT`, `ASCII`). Switching formats converts representations seamlessly without losing canonical values.
- **Dedicated ASCII Character Picker:** Direct 1-character input with keyboard support plus 19 one-tap presets (`'A'`, `'a'`, `'0'`, `'!'`, `'~'`, `'SPC'`, `'\n'`, `'\0'`).
- **Interactive Bit Truth Table:** Touch-friendly column-aligned inspection grid (`32dp` touch targets, 4-bit nibble separators). Tap any bit in Operand A or B to toggle `0 ⇄ 1` instantaneously. Supports 8, 16, 32, and 64-bit word sizes.
- **Extended ALU Operations:**
  - `MUL` with full unsigned carry (`CF`) and signed two's-complement overflow (`OF`) detection.
  - `DIV` and `MOD` with explicit divide-by-zero fault handling (`DIV_BY_ZERO`, `ZF = false`, LCD alert `"ERR: DIV BY 0"`).
  - `SAR` (sign-preserving arithmetic shift right) alongside `SHL`, `SHR`, `ROL`, and `ROR`.
- **Multi-Format Result Panel:** Simultaneous live readouts across all bases (`BIN`, `DEC`, `HEX`, `OCT`, `ASCII`), ALU flags (`ZF`, `SF`, `CF`, `OF`), `ANS → A` chaining, one-tap copy, and Paper Tape logging.

### 2. Zero-Shake UI Stabilization & 60fps Performance Overhaul
- **Strict Fixed-Height Rule:** Keypad buttons, mode selector latches, and LCD containers never reflow or change container height during button presses or live expression scaling. Press motion is isolated to inner keycap translation (`transform: [{ translateY: 2.5 }]`) over static shadow plates.
- **Atomic Zustand Subscriptions:** Keypad buttons subscribe via fine-grained atomic selectors (`s => s.prop`), reducing button re-renders during active typing to 0.
- **RAM-Speed Persistence:** Zustand `AsyncStorage` writes are debounced with a 250ms trailing timer. Rapid typing runs 100% in RAM with zero JS thread stalling.
- **Feedback Throttling:** Audio click synthesis and haptic vibrations throttled to $\ge 25\text{ms}$ with singleton `AudioContext` reuse.

### 3. Casio ClassWiz fx-991EX Math Engine
- **$S \Leftrightarrow D$ Display Key:** Toggle evaluated results between decimal, exact simplified proper/improper fractions, and mixed numbers.
- **`FACT` Key:** Casio ClassWiz prime factorization (`24` $\rightarrow$ `2³ × 3`).
- **Permutations ($n\text{P}r$) & Combinations ($n\text{C}r$):** Multiplicative loop implementation supporting $n > 170$ without overflow.
- **Scientific Constants Rail:** Instant insertion of $\pi$, $e$, $c$, $h$, $G$, and $N_A$.

### 4. Live Auto-Compute Engine
- Monospace sub-readout line rendering live evaluated totals (`ans ≈ ...`) as mathematical expressions are typed, before pressing `=`.

### 5. Interactive Bilingual Guidebook & In-App QA Analyzer
- **Interactive Guidebook (`EN` / `বাংলা`):** Complete field manual with `"▶ Try It Now"` buttons that launch directly into modes with exact expressions loaded (e.g., `0b1010 + 0b0101`, `0xAA ^ 0x55`, `0b1100 << 2`).
- **Embedded Hardware QA Analyzer:** 15-point automated diagnostic suite running self-tests across all hardware engines with formatted ASCII receipt export.

---

## 🛠️ Verification & Test Ledger

- **Jest Unit Test Suite:** `182 / 182 passing` across 15 test suites (100% pass rate).
- **TypeScript Static Verification:** `tsc --noEmit` passed with 0 errors.
- **Version Parity:** Monotonic version check passed (`1.1.0`, `versionCode: 2`).
- **Signature Verification:** Verified with Android SDK `apksigner` using official CB-09 hardware release keystore.

---

## 📦 Installation Instructions

### Direct APK Installation (via ADB)
```powershell
adb install -r CrunchBox-CB09-v1.1.0-release.apk
adb shell am start -n com.crunchbox.cb09/.MainActivity
```

### Direct Download to Phone
1. Download `CrunchBox-CB09-v1.1.0-release.apk` directly to your Android device.
2. Tap the downloaded file in your Notification Bar or Downloads folder.
3. Allow "Install unknown apps" if prompted, then tap **Install**.
