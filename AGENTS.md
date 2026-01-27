# AI Agents Knowledge Base

This file serves as a hand-off and instruction manual for AI agents working on the **Modern Vintage Outliner (MVO)** project.

## Project Context
MVO is a high-performance, keyboard-centric hierarchical outliner. It prioritizes speed, minimal bundle size, and a "Modern Vintage" aesthetic.

## Tech Stack Reminders
- **Core:** Preact + Vite + TypeScript.
- **Styling:** Tailwind CSS v4 (CSS-first config).
- **Icons:** Lucide-Preact.
- **Storage:** IndexedDB (Atomic saves).
- **Theme:** Variable-based (CSS variables) with Light/Dark modes.

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
- [x] Theming system (Light/Dark variants via CSS variables)
- [x] Global Search across all notes.
- [ ] Multi-select / Bulk actions
- [ ] Export to Markdown/JSON
- [ ] **Custom Columns (Limited):** Add support for extra fields per node (e.g., progress slider, custom text field).

## Instructions for Future Agents
- **Refactoring:** Always check `useOutliner.ts` before modifying tree logic. It uses a flat-list representation of a tree.
- **Theming:** Use semantic classes (e.g., `bg-app-bg`, `text-text-main`) defined in `index.css`. Avoid hardcoding hex colors in components.
- **Performance:** Memoize component props (like `tagNames` in `OutlinerWrapper`) and use `useCallback` for all event handlers.