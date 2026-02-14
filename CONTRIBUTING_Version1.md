# Contributing to Cyber Kart 3D

## 🎯 Development Workflow

### 1. **Branches erstellen**
```bash
# Neue Feature (aus develop)
git checkout develop
git pull origin develop
git checkout -b feature/phase-1-setup

# Work on feature...
git add .
git commit -m "feat(core): implement game loop"
git push origin feature/phase-1-setup
```

### 2. **Pull Request erstellen**
- Gehe zu GitHub → New Pull Request
- Setze `develop` als Ziel (nicht `main`)
- Beschreibe die Changes
- Verlinke relevante Issues (#123)

### 3. **Code Review & Merge**
- Mindestens 1 Approval erforderlich
- Squash & Merge zu `develop`

### 4. **Release zu Main**
```bash
# Nur aus develop!
git checkout main
git pull origin main
git merge develop
git tag -a v0.1.0 -m "Phase 1 Release"
git push origin main --tags
```

---

## 📐 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Typen:
- **feat**: Neues Feature
- **fix**: Bug-Fix
- **docs**: Dokumentation
- **style**: Code-Stil (kein Logic-Change)
- **refactor**: Code-Umstrukturierung
- **test**: Tests hinzufügen/ändern
- **chore**: Dependencies, Build-Tools

### Beispiele:
```
feat(physics): add drift mechanics to kart

- Implemented drift angle calculation
- Added grip reduction during drift
- Added visual particle effects

Closes #42
```

---

## 🤝 Synchronisierungs-Regeln

### Daily Standup (Asynchron)
- Updates in Discussions posten
- Status: In Progress / Blockers / Done

### Weekly Sync (Optional)
- Code Review Session
- Architecture Discussions
- Planning nächster Sprint

### Branch Protection Rules
- ✅ Require PR Reviews
- ✅ Dismiss stale PR approvals
- ✅ Require status checks to pass
- ✅ Require branches to be up to date

---

## 📊 Tracking Progress

### Meilensteine:
- Phase 1: Feb 28, 2026
- Phase 2: Mar 31, 2026
- Phase 3: Apr 30, 2026
- Phase 4: May 31, 2026
- Phase 5: Jun 30, 2026

### Issue Labels:
- `priority-critical`, `priority-high`, `priority-medium`
- `phase-1`, `phase-2`, `phase-3`, `phase-4`, `phase-5`
- `bug`, `feature`, `enhancement`, `documentation`
- `good first issue` (für Anfänger)

---

## 💻 Lokale Umgebung Setup

```bash
# Clone repo
git clone https://github.com/Bissegger/cyber-kart-3d.git

# Install deps
npm install

# Start dev server
npm run dev

# Run linting
npm run lint

# Format code
npm run format

# Build production
npm run build
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📚 Dokumentation

- Code Comments: Komplexe Logik erklären
- JSDoc: Für alle Public APIs
- README: Projekt-Übersicht
- Architecture.md: Technische Entscheidungen
- API.md: Public API-Dokumentation

---

## 🚀 Release-Prozess

1. Alle PRs in develop mergen
2. `CHANGELOG.md` aktualisieren
3. Version in `package.json` bumpen
4. GitHub Release erstellen
5. Deploy zu Production

---

Fragen? Erstelle ein Issue oder poste in Discussions!