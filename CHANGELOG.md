# Changelog

All notable changes to **CrunchBox (Chassis Model: `CB-09 FIELD UNIT`)** are documented in this file.
The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] - 2026-11-01

### Added
#### Chassis & Tactile Ergonomics
- **Neo-Brutalist Tactile Hardware Identity:** Bold 3px ink borders (`#1B241E`), chamfered chassis plates, brass hex screws, and 3D depressible keycaps with zero grid jitter.
- **2x3 Hardware Matrix Mode Selector:** Tactile 2-row latch (`[CALC | SCI | DEV]` and `[CURR | UNIT | TOOLS]`) with active green LED indicators and full touch targets ($\ge 100\text{dp}$).
- **LCD Micro-Annunciator Strip:** Real-time status badges for angular mode (`DEG`/`RAD`), backlight mode (`☼ SAGE`, `AMBR`, `NVG`), digit grouping (`BD`/`INTL`), rate status (`LIVE`/`CACH`/`BNDL`), and active ALU flags.
- **3-Mode LCD Backlight Toggle:** Persisted switching between *Sage Daylight* (`#8FA893`), *Amber Field Glow* (`#E5A823`), and *Night-Ops Stealth* (`#1A241C` / `#4EFA90`).
- **Monospace Perforated Paper Tape:** Pull-down drawer with row pinning, tap-to-load expression recall, and monospace ASCII receipt export.
- **Zero-Asset Mechanical Audio Synthesizer:** Pure Web Audio 12ms square/sawtooth oscillator click and 60ms paper tear sound paired with tiered haptics (`light`, `medium`, `heavy`, `warning`).
- **Hardware Fault Recovery:** Neo-Brutalist `HardwareErrorBoundary` with amber LCD terminal, stack trace dump, and `REBOOT UNIT` / `PURGE STORAGE` recovery buttons.

#### Computing & Science Engines
- **Shunting-Yard Math Engine:** Supports unary negation (`-5 + 3`, `4 × (-2)`), implicit multiplication (`2π`, `5(2+3)`), percentage operators, and factorial edge cases (`0! = 1`).
- **Bipolar Scientific Engine:** Degrees and Radians trig functions (`sin`, `cos`, `tan`), hyperbolic, inverse, logarithms (`ln`, `log10`), and power operators.

#### 6th "DEV" Mode — CSE Systems Workbench
- **64-bit Multi-Base Converter:** Arbitrary-precision radix conversion across `HEX`, `DEC`, `OCT`, and `BIN` with nibble spacing and strict keypad digit locking.
- **Hardware ALU & Status Flags:** Full bitwise logic suite (`AND`, `OR`, `XOR`, `NOT`, `NAND`, `NOR`, `XNOR`, shifts, rotates, endian swaps) with live status flags: `ZF`, `SF`, `CF` (`null`/`—` on logic ops), and `OF` (Signed Two's Complement Overflow).
- **IEEE-754 Single-Precision Float Inspector:** Hardware-level 32-bit floating point breakdown showing Sign, Exponent, Mantissa, and hex output (`-12.375` $\rightarrow$ `0xC1460000`).
- **Interactive 64-bit Bit Grid:** Visual 8-bits-per-row grid with tappable bit flips and bit indices (`63..0`).
- **Pure-TS Multi-Byte UTF-8 Codec:** Zero-dependency encoder and decoder for ASCII and multi-byte Unicode strings (including Bengali `'বাংলা'`).
- **Discrete Math:** Modular arithmetic, GCD, LCM, Prime checks with factor decomposition, and powers of two.

#### Currencies & Units
- **165+ Currency Engine:** Dual-source rate merging (Fawaz Ahmed CDN overlay + Frankfurter ECB) with bundled offline fallback rates; first-class support for `BDT` (`৳`), `SAR`, `AED`, `KWD`.
- **Regional Land Converter:** Exact Survey of Bangladesh land calculations ($1\text{ Bigha} = 20\text{ Katha} = 14,400\text{ sq ft} = 1337.80\text{ m}^2$, $1\text{ Katha} = 720\text{ sq ft}$, $1\text{ Decimal} = 435.6\text{ sq ft}$, $1\text{ Acre} = 100\text{ Decimal}$).
- **Everyday Financial Toolkit:** Tip & Bill Split, Discount & Tax, Fuel Economy & Trip Cost, and Compound Interest / Loan EMI.

#### Localization & Brand
- **Synchronous Bilingual Dictionaries:** Complete, natural English (`en.json`) and Bengali (`bn.json`) translations without uninitialized warning flashes.
- **Brand Identity Suite:** 3 concept SVGs, 1024x1024 master icon mark, adaptive icons, splash screens, and store feature banners.
- **Quality Gates:** 132 passing unit tests across 10 test suites with strict TypeScript validation.
