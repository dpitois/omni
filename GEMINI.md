# Modern Vintage Outliner (MVO)

## Project Overview

Modern Vintage Outliner (MVO) is an ultra-lightweight structured note-taking web application. It aims to fuse the hierarchical ergonomics of OmniOutliner with the tag/view system of Obsidian.

## Technology Stack

- **Framework:** Preact (via ViteJS) for minimal bundle size.
- **Reactivity:** Preact Signals for O(1) rendering performance.
- **Styling:** Tailwind CSS v4 (macOS/Aqua aesthetic).
- **Validation:** Valibot for schema safety.
- **Persistence:** IndexedDB (Atomic saves, multi-store support).

## Architecture & Design

The project uses a hybrid approach: **Context API** for dependency injection and **Preact Signals** for high-frequency data updates.

- **`outlinerStore` (Signals):** Centralized state management for nodes, workspaces, and filters.
- **`UIContext`:** Manages global UI state (modes, focus, sidebar).
- **`StorageService`:** Atomic IndexedDB operations with support for multiple collections (Documents, SavedFilters).
- **Column Registry:** Decoupled rendering system for custom cell types (Status, Progress, Date).
- **`NodeItem`:** Highly optimized component using signal-based selective re-rendering.

### Modal Navigation System (VIM-Hybrid)

- **Normal Mode:** Structure and navigation (hjkl / Arrows / Range selection).
- **Insert Mode:** Content editing (Rich text, autocomplete, formatting).
- **Command Mode:** Global actions via `:` prefix (e.g., `:w`, `:q`, `:help`).

### Data Model (`Node` Interface)

- `id`: string (UUID v4)
- `text`: string
- `level`: number (0-10)
- `rank`: number (for ordering)
- `checked`: boolean
- `collapsed`: boolean
- `parentId`: string | null
- `docId`: string (Workspace link)
- `metadata`: Record<string, any>
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
- **Command Systems:**
  - **Vim Mode (`:`):** Minimalist text commands in the status bar (e.g., `:w` to export, `:q` to unhoist).
  - **Command Palette (`Ctrl+K`):** Visual Spotlight-style interface for discovering and searching all available actions.
- **Optimization:** Memoization of props, Singleton patterns for heavy objects (Canvas), zero-dependency UUIDs.
- **State Management:** Logic handles data integrity (ranks, parentIds) before persistence.

## Building and Running

- **Install Dependencies:** `npm install`
- **Start Dev Server:** `npm run dev`
- **Build:** `npm run build`
