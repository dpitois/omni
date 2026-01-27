# AI Agents Knowledge Base

This file serves as a hand-off and instruction manual for AI agents working on the **Modern Vintage Outliner (MVO)** project.

## Project Context
MVO is a high-performance, keyboard-centric hierarchical outliner. It prioritizes speed, minimal bundle size, and a "Modern Vintage" aesthetic.

## Tech Stack Reminders
- **Core:** Preact + Vite + TypeScript.
- **Styling:** Tailwind CSS v4 (CSS-first config).
- **Icons:** Lucide-Preact.
- **Storage:** IndexedDB (Atomic saves).

## Critical Architectural Rules

### 1. Keyboard-First Interaction
- Any new feature **must** be fully usable via keyboard.
- Avoid adding heavy drag-and-drop libraries.
- Prefer `Alt + Arrows` for moving blocks.

### 2. Bundle Size Optimization
- Keep dependencies to a minimum. 
- Use native browser APIs where possible (e.g., `crypto.randomUUID()` instead of `uuid`).
- Use Shared Singletons for heavy objects (like the measurement Canvas).

### 3. Data Integrity
- The `useOutliner` hook is the source of truth for structural logic.
- **Ranks:** Always call `sanitizeNodes` after structural changes (add, delete, move, indent) to maintain `rank` and `parentId` integrity in IndexedDB.
- **Atomic Saves:** Use `storage.saveNode` for text updates and `storage.saveNodes` for structural/batch updates.

## Current State & Roadmap
- [x] Core Outliner (CRUD, Indent, Move)
- [x] Smart Checkboxes (Cascade logic)
- [x] Folding/Collapsing
- [x] Tag System (Extraction, Filtering, Renaming, Counts)
- [x] IndexedDB Persistence
- [ ] Multi-select / Bulk actions
- [ ] Export to Markdown/JSON
- [ ] Theming system (Light/Dark variants)

## Instructions for Future Agents
- **Refactoring:** Always check `useOutliner.ts` before modifying tree logic. It uses a flat-list representation of a tree.
- **UI:** Maintain the macOS/Macular aesthetic (neutral tones, subtle borders, high-quality typography).
- **Performance:** Memoize component props and use `useCallback` for all event handlers.
