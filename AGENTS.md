# AI Agents Knowledge Base

This file serves as a hand-off and instruction manual for AI agents working on the **Modern Vintage Outliner (MVO)** project.

## Project Context

MVO is a high-performance, keyboard-centric hierarchical outliner. It prioritizes speed, minimal bundle size, and a "Modern Vintage" aesthetic.

## Tech Stack Reminders

- **Core:** Preact + Vite + TypeScript.
- **Reactivity:** **Preact Signals** for O(1) performance in the tree.
- **PWA:** `vite-plugin-pwa` (Workbox) for offline support and installation.
- **State Management:** Hybrid (Context API for DI, `outlinerStore` for data signals).
- **Styling:** Tailwind CSS v4 (CSS-first config).
- **Validation:** Valibot (Schema-first integrity).
- **Icons:** Lucide-Preact.
- **Storage:** IndexedDB (Atomic saves, multi-store for docs/filters).

## Critical Architectural Rules

### 1. Keyboard-First Interaction

- Any new feature **must** be fully usable via keyboard.
- **AZERTY/Windows Friendly:** Prefer `Alt + Key` shortcuts.
- **Library Navigation:** `Alt + L` to focus, `Arrows` to navigate, `E` to rename tags.
- **Node Editing:** `Enter` (New), `Tab` (Indent), `Alt + ↕` (Move), `Alt + ↔` (Columns).
- **Formatting:** `Ctrl+B` (Bold), `Ctrl+I` (Italic), `Ctrl+U` (Underline), `Ctrl+Shift+S` (Strike).
- **History:** Snapshot-based Undo/Redo (`u`, `Ctrl+Z` / `Ctrl+R`, `Ctrl+Y`).
- **Tags:** Supported format is `#[\w\u00C0-\u00FF-]+` (alphanumeric, accents, and hyphens).

### 2. Signal-Driven Data Flow

- **Store-First:** Use `outlinerStore` signals for data that changes frequently (nodes, search).
- **Context for DI:** Providers should still be used to inject store instances or stable UI state.
- **Column Registry:** Rendering of non-text cells is decoupled via `src/components/columns/Registry.tsx`.

### 3. Responsive & Offline Patterns

- **Floating Sidebar:** On mobile/tablet, the sidebar is a fixed overlay with a backdrop. On desktop, it is relative and collapsible.
- **Persistent Footer:** Shortcuts are kept in a wrapping footer with a "Help" modal (`Alt + H`).
- **Offline First:** All data is in IndexedDB. UI reflects connectivity via `useOnlineStatus`.
- **Saved Views:** Filter combinations (query + tags) can be persisted per workspace.

### 4. Switch Div/Textarea (Rich Text)

- **Read Mode:** A `div` renders recursive Markdown styles.
- **Edit Mode:** A `textarea` (auto-resize) handles raw text input for perfect caret alignment.

### 5. Data Portability

- **JSON & OPML:** Supported formats for backups and interoperability.
- **Drag'n Drop:** Implemented via `ImportExportZone`. Dropping valid files triggers replacement/import.

## Current State & Roadmap

### Phase 1 & 2: Core Foundation (Completed)

- [x] Core Outliner (CRUD, Indent, Move)
- [x] **VIM-Hybrid Modal Navigation**: Normal, Insert, and Command modes.
- [x] **PWA Support**: Offline mode and installation.
- [x] **Recursive Markdown Parser**: Supports nested styles.
- [x] **Contextual StatusBar**: Real-time feedback on modes and shortcuts.
- [x] **Responsive Layout**: Collapsible sidebar (Alt+S) and persistent shortcuts footer.

### Phase 3: UX Excellence & Workflow Extensions (Completed)

- [x] **Advanced Keyboard Workflow**: Refined `i`/`a`/`o` modes and Range Selection (`Shift + j/k`).
- [x] **Batch Operations**: Multi-node indentation, deletion, and checkbox toggling.
- [x] **Snapshot-based Undo/Redo**: Global history management for structural changes.
- [x] **Node Hoisting (Focus Mode)**: Isolate sub-branches with `z` or UI buttons.
- [x] **Reactive Multi-Tag Filtering**: Combined search and tag logic via Store Signals.
- [x] **Command Palette (`Ctrl+K`)**: Searchable "Spotlight" interface alongside native Vim mode (`:`).
- [x] **Data Portability**: JSON and OPML support.
- [x] **Signals Migration**: O(1) reactivity for large trees (replaced virtualization for better stability).
- [x] **Persistent Saved Views**: Save filter/tag combinations as named views in the sidebar.
- [x] **Schema Validation**: Valibot integration for robust data integrity.
- [x] **Column Registry**: Decoupled rendering for custom metadata.

### Phase 4: Accessibility & Mobility

- [ ] **Smart Copy/Paste**: Convert multi-line text into indented nodes automatically.
- [ ] **Full A11y Support**: ARIA roles (`tree`, `treeitem`) and screen reader optimization.
- [ ] **Mobile Touch Gestures**: Swipe to indent/outdent/delete on mobile devices.
- [ ] **Offline Resilience**: Enhance PWA reliability and storage limit handling.
- [ ] **Onboarding & Discovery**: Visual hints for first-time users.
- [ ] **Multi-select & Bulk Actions**: Refine visual selection feedback.

### Phase 5: Workspaces & Final Polish

- [x] **Multi-Document Support**: Handle independent outliners (Workspaces).
- [ ] **Markdown Export**: Export hierarchy as a standard `.md` file for interoperability.
- [ ] **Global Search**: Deep search across all nodes and metadata (current search is workspace-local).
- [ ] **Settings Panel**: Centralized management for columns, themes, and database reset.
- [ ] **Bundle Optimization**: Lazy-loading of heavy components and icon tree-shaking.
- [ ] **Undo/Redo Visualization**: Show a brief history log when undoing.
- [ ] **Robustness**: Unit tests for structural logic and advanced error handling for IndexedDB.

## Instructions for Future Agents

- **Modal States:** When implementing new shortcuts, always check the current `mode` from `UIContext`.
- **Focus Management:** Use `setFocus(id, col, targetMode)` for atomic transitions between nodes and modes.
- **Data Integrity:** Always call `sanitizeNodes` during imports or structural changes.
- **Markdown:** Update `src/utils/markdown.ts` for any new syntax using the recursive strategy.
- **Responsive Design:** Use `md:` breakpoints for desktop-only columns and `lg:` for relative vs fixed sidebar positioning.
- **Performance:** Ensure providers separate state from actions to avoid unnecessary re-renders of the entire tree.
