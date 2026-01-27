# Modern Vintage Outliner (MVO)

## Project Overview
Modern Vintage Outliner (MVO) is an ultra-lightweight structured note-taking web application. It aims to fuse the hierarchical ergonomics of OmniOutliner with the tag/view system of Obsidian.

## Technology Stack
- **Framework:** Preact (via ViteJS) for minimal bundle size.
- **Styling:** Tailwind CSS (targeting a modern macOS/Aqua look).
- **Icons:** Lucide-Preact.
- **Persistence:** IndexedDB (Atomic saves, auto-migration from LocalStorage).

## Architecture & Design
The project follows a strict separation of Logic and View via Custom Hooks:
- **`useOutliner` Hook:** Manages tree structure, ranking, atomic updates, and batch structure saves.
- **`useTags` Hook:** Parses text to extract tags and counts occurrences.
- **`StorageService`:** Abstract adapter pattern. Currently implements `IndexedDBAdapter` with atomic operations (`saveNode`, `saveNodes`, `deleteNodes`).
- **`OutlinerWrapper`:** Connects logic hooks to the UI components.
- **`NodeItem`:** Pure rendering component for individual lines with rich interactions (Keyboard shortcuts, Dragless moving).

### Data Model (`Node` Interface)
- `id`: string (UUID v4 via `crypto.randomUUID`)
- `text`: string
- `level`: number (0-5)
- `rank`: number (for ordering in DB)
- `checked`: boolean
- `collapsed`: boolean (optional)
- `parentId`: string | null (Linked to hierarchy)
- `updatedAt`: number

## Development Conventions

### Commit Strategy
- **Format:** Conventional Commits (English).
  - `feat`: New features.
  - `fix`: Bug fixes.
  - `refactor`: Code changes without behavior changes.
  - `perf`: Performance improvements.
  - `chore`: Maintenance, config, etc.
  - `docs`: Documentation updates.
- **Atomicity:** Commits should be atomic and focused on a single context (e.g., "feat(storage): switch to IndexedDB" separate from "feat(ui): add keyboard shortcuts").

### Coding Standards
- **Navigation:** Keyboard-centric (Enter, Tab, Shift+Tab, Alt+Arrows, Ctrl+., Ctrl+Enter).
- **Optimization:** Memoization of props, Singleton patterns for heavy objects (Canvas), zero-dependency UUIDs.
- **State Management:** Logic handles data integrity (ranks, parentIds) before persistence.

## Building and Running
- **Install Dependencies:** `npm install`
- **Start Dev Server:** `npm run dev`
- **Build:** `npm run build`