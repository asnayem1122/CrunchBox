# CrunchBox (CB-09 FIELD UNIT) — QA & Release Ledger

## 1. Test Device Baseline Specifications
- **Device Model:** `LGN_LX2` (Honor series)
- **Connected Identifier:** `AC9K2U6506000266`
- **Physical Screen Size:** `720x1610` px
- **Physical Density:** `320` dpi (xhdpi, ~2.0x scale factor, viewport ~360x805 dp)
- **Baseline Font Scale:** `1.0`
- **Baseline Accelerometer Rotation:** `0` (Portrait lock)
- **OS Platform:** Android 13/14 (Hermes JS Engine)

---

## 2. Baseline Visual Defect Catalogue (Pre-Upgrade)

| Defect ID | Screen / View | Evidence File | Description & Root Cause | Planned Fix |
| :--- | :--- | :--- | :--- | :--- |
| **UI-01** | Mode Selector | `evidence/before/calc_en.png`, `curr_bn.png` | 5 buttons packed in a single horizontal row (~55dp width). Adding a 6th mode (`DEV`) or displaying Bengali labels (`কারেন্সি`, `টুলস`) causes severe cramping. | Redesign into an industrial **2x3 tactile hardware matrix latch** with 2 rows of 3 buttons, full $\ge 100\text{dp}$ touch target, and active LED status pip. |
| **UI-02** | Typography | `evidence/before/calc_bn.png`, `tools_bn.png` | Bengali vowel markers (ই-কার, ঈ-কার, রেফ) risk vertical clipping due to default font padding on Android. | Implement `useHardwareLayout.ts` with `includeFontPadding: false`, proportional leading, and `maxFontSizeMultiplier: 1.2`. |
| **UI-03** | Top Insets | `evidence/before/calc_en.png` | Header row and paper tape pull tab sit tight against Android status bar. | Bind top padding directly to `useSafeAreaInsets().top + 8px`. |
| **UI-04** | LCD Display | `evidence/before/calc_en.png` | LCD lacks micro-annunciators for `BD/INTL` grouping, live base indicator, and exchange rate freshness. | Add etched top **LCD Micro-Annunciator Strip** with live badges. |
| **UI-05** | LCD Ergonomics | `evidence/before/sci_en.png` | Display is locked to single phosphor green palette; lacks high-contrast tactical night vision. | Implement 3-mode LCD Backlight Toggle persisted in Zustand: *Sage Daylight*, *Amber Field Glow*, *Night-Ops Stealth*. |
| **UI-06** | Paper Tape Drawer | `evidence/before/tape_open_en.png` | Tape entries are static; cannot reload into calculator, cannot star/pin entries, cannot export ASCII receipt. | Upgrade `PaperTapeDrawer.tsx` to support tap-to-load, star/pin persistence, and ASCII formatted receipt clipboard export. |
| **UI-07** | Mode Capabilities | N/A | App lacks dedicated Computer Science & Engineering (CSE) tools for 64-bit multi-base, ALU flags, and bitwise logic. | Build new 6th **`DEV`** Mode with 64-bit BigInt bases, ALU flags (`ZF`, `SF`, `CF`, `OF`), IEEE-754 inspector, and interactive bit grid. |
| **UI-08** | Haptic Feedback | N/A | Single haptic intensity across all buttons. | Upgrade `soundEffects.ts` with tiered feedback: `light` for digits, `medium` for operators, `heavy` for `=`, `AC`, and mode changes. |

---

## 3. Test Matrix Execution Status

| Test Suite / Area | Verification Criteria | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Math Engine** | Shunting-Yard, implicit mult, unary neg, 0! = 1 | ✅ PASS | 120/120 Jest tests green |
| **Currency Engine** | Fawaz CDN + Frankfurter ECB overlay + 165+ offline bundled rates | ✅ PASS | BDT fallback rate `124.11` verified |
| **Unit Converter** | Area with Bigha, Katha, Decimal | ✅ PASS | Land formulas exact |
| **DEV Mode Math** | 64-bit BigInt, ALU flags, IEEE-754 float, bit grid, ASCII codec | ✅ PASS | 132/132 Jest tests green |
| **Brand Assets** | 1024x1024 PNG suite generated from winning Concept 1 SVG | ✅ PASS | Icon, adaptive, splash, store assets generated |
| **Release Build** | Standalone signed APK with Hermes, verified on LGN_LX2 | ✅ PASS | Compiled & installed; runs standalone |
| **GitHub Sync** | Push commits and `v1.0.0` tag to remote origin | ✅ PASS | Release tagged v1.0.0 and synced to remote |

---

## 4. Keystore & Release Artifact Record
- **Release Package ID:** `com.crunchbox.cb09`
- **Release Version:** `1.0.0` (versionCode 1)
- **Release Artifact:** `evidence/release/CrunchBox-CB09-v1.0.0-release.apk` (64,235,849 bytes)
- **Keystore Path:** `android/app/crunchbox-release-key.jks` *(Excluded from git via .gitignore)*
- **Properties Config:** `android/keystore.properties` *(Excluded from git via .gitignore)*
- **Key Alias:** `crunchbox-release-key`
- **SHA-256 Fingerprint:** `55:58:3F:2D:13:67:60:FF:15:1B:89:C6:0F:8E:98:22:06:2D:67:37:77:BD:6B:87:49:B0:07:29:94:3F:55:0C`
- **SHA-1 Fingerprint:** `D4:8F:E0:95:2A:E0:56:D7:95:83:B0:F9:1B:B9:F5:92:1B:B5:E0:FC`
- **Stand-alone Verification:** Verified on device `LGN_LX2` (`AC9K2U6506000266`) without Metro bundler.


---

## 5. v1.1.0 Master Upgrade Verification Ledger

### 5.1 Verification Checklist & Automated Quality Gates
| Gate ID | Target Feature / Fix | Verification Criteria | Status | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **QA-110-01** | Top Safe-Area Jump | `lockedAndroidTopInset` maintains permanent high-water mark; opening `/settings` produces 0px shift | ✅ PASS | `evidence/v1.1.0/settings_top_inset_fixed.png` |
| **QA-110-02** | Dark Mode Contrast | All text, chips, and sub-deck tabs in `tacticalDark` exceed 4.5:1 WCAG AA contrast ratio | ✅ PASS | `evidence/v1.1.0/dark_mode_contrast_all_modes.png` & `tests/utils/themeTokensContrast.test.ts` |
| **QA-110-03** | Wide LCD & Auto-Compute | 100% bezel width, auto-scrolling expression line, 0ms live `ans ≈ ...` preview | ✅ PASS | `evidence/v1.1.0/wide_lcd_auto_compute.png` & `src/features/calculator/useLiveCalc.ts` |
| **QA-110-04** | Casio fx-991EX Suite | $S \Leftrightarrow D$ continued fraction, `FACT` prime factorization, $n\text{C}r$/$n\text{P}r$ multiplicative loop, CONST bar | ✅ PASS | `evidence/v1.1.0/fx991ex_sd_and_fact.png` & `tests/features/classWizEngine.test.ts` |
| **QA-110-05** | Fast History Manager | Tape search input, 7 mode filters, 4 action buttons (`+ Use Ans`, `✏ Edit`, `📋 Copy`, `★ Pin`) | ✅ PASS | `src/components/chassis/PaperTapeDrawer.tsx` |
| **QA-110-06** | Interactive Guidebook | Bilingual EN/BN manual with "▶ Try It Now" executable buttons across all 6 categories | ✅ PASS | `evidence/v1.1.0/guidebook_modal_en_bn.png` & `src/features/guidebook/GuidebookModal.tsx` |
| **QA-110-07** | In-App QA Analyzer | Real-time telemetry + 15-point automated self-test runner with formatted ASCII report export | ✅ PASS | `evidence/v1.1.0/qa_analyzer_15_pass.png` & `src/features/diagnostics/HardwareDiagnosticsModal.tsx` |
| **QA-110-08** | In-Place Upgrade Install | `v1.1.0` (`versionCode: 2`) compiled with existing release keystore installs over `v1.0.0` with `adb install -r` | ✅ PASS | Signed standalone release APK verified on `LGN_LX2` |
| **QA-110-09** | Full Test Suite | 154 unit tests passing (100% pass rate) across 12 test suites | ✅ PASS | 154/154 Jest tests green |
