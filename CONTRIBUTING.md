# Contributing to CrunchBox (`CB-09 FIELD UNIT`)

Thank you for your interest in contributing to **CrunchBox**! We welcome bug reports, feature enhancements, documentation improvements, and pull requests.

---

## 🛠️ Code of Conduct & Core Philosophy

CrunchBox is designed with a strict **"Heavy-Duty Field Gear"** aesthetic and architectural persona:
1. **Offline-First:** All core calculations, conversions, and CSE tools MUST work with zero internet connectivity.
2. **Zero Raw `BigInt` in State:** Never store raw JavaScript `BigInt` inside Zustand state or persisted objects (`JSON.stringify` will throw a fatal `TypeError`). Store as strings (`'0'`) and parse to `BigInt` inside pure domain functions.
3. **Zero Grid Jitter:** When creating or modifying button components, never mutate outer layout heights on press. Always use fixed containers with a static shadow layer and a `translateY: 3` keycap face.
4. **Bilingual Completeness:** All user-facing strings must have corresponding keys in both [`src/localization/en.json`](src/localization/en.json) and [`src/localization/bn.json`](src/localization/bn.json).
5. **No Font Padding on Android:** Always pair Android text components with `includeFontPadding: false` to prevent Bengali ascenders and descenders from clipping.

---

## 🚀 Development Setup

```powershell
# 1. Clone repository
git clone https://github.com/asnayem1122/CrunchBox.git
cd CrunchBox

# 2. Install dependencies
npm install

# 3. Verify TypeScript and Jest tests
npm run typecheck
npm test
```

---

## 🧪 Testing Guidelines

- We maintain a strict **100% test pass rate** (132+ unit tests).
- When implementing a new feature or fixing a bug, write unit tests in [`tests/`](tests/) following the **Test-Driven Development (TDD)** pattern (Red-Green-Refactor).
- Run test suites before opening a PR:
  ```powershell
  npm test
  ```

---

## 📱 Physical Device USB Testing Workflow

We adhere to the diagnostic cycle:
$$\text{Diagnose} \rightarrow \text{Edit} \rightarrow \text{Reload} \rightarrow \text{Screenshot} \rightarrow \text{Inspect} \rightarrow \text{Decide}$$

To test on your physical Android phone:
```powershell
# Check ADB connection
adb devices

# Set up port reverse for Metro
adb reverse tcp:8081 tcp:8081

# Start dev server
npm start
```

---

## 📝 Commit Conventions

We strictly follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(scope): ...` — A new feature (e.g. `feat(dev-mode): add matrix determinant calculator`)
- `fix(scope): ...` — A bug fix (e.g. `fix(lcd): resolve Bengali vowel clipping on high density screens`)
- `docs: ...` — Documentation updates
- `test: ...` — Adding or refactoring tests
- `refactor: ...` — Code refactoring without behavioral changes
- `chore: ...` — Build tools, dependencies, or repo maintenance

---

## 📬 Pull Request Process

1. Fork the repository and create your feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit changes with conventional commit messages.
3. Ensure `npm run typecheck` and `npm test` pass with 0 errors.
4. Push to your fork and submit a Pull Request to `main`.
5. Clearly describe the problem, changes made, and attach screenshots or evidence where applicable.
