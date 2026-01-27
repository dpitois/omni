# AI Agents Knowledge Base

This file serves as a hand-off and instruction manual for AI agents working on the **Modern Vintage Outliner (MVO)** project.

## Project Context
MVO is a high-performance, keyboard-centric hierarchical outliner. It prioritizes speed, minimal bundle size, and a "Modern Vintage" aesthetic.

## Tech Stack Reminders
- **Core:** Preact + Vite + TypeScript.
- **PWA:** `vite-plugin-pwa` (Workbox) for offline support and installation.
- **State Management:** **React Context API** (Domain-driven providers).
- **Styling:** Tailwind CSS v4 (CSS-first config).
- **Icons:** Lucide-Preact.
- **Storage:** IndexedDB (Atomic saves).
- **Theme:** Variable-based (CSS variables) with Light/Dark modes.

## Critical Architectural Rules

### 1. Keyboard-First Interaction
- Any new feature **must** be fully usable via keyboard.
- Standard formatting: `Ctrl+B` (Bold), `Ctrl+I` (Italic), `Ctrl+U` (Underline), `Ctrl+Shift+S` (Strike).

### 2. Context-Driven Architecture
- **Prop Drilling is forbidden.** Components should consume domain-specific contexts:
    - `OutlinerContext`: Data (nodes, tags) and CRUD actions.
    - `UIContext`: Visual state (theme, focus, columns, navigation).
    - `FilterContext`: Search and tag filtering logic.

### 3. Responsive & Offline Patterns
- **Floating Sidebar:** On mobile/tablet, the sidebar is a fixed overlay with a backdrop. On desktop, it is relative.
- **Persistent Footer:** Shortcuts are kept in a wrapping footer to ensure accessibility.
- **Offline First:** All data is in IndexedDB. UI reflects connectivity via `useOnlineStatus`.

### 4. Switch Div/Textarea (Rich Text)
- **Read Mode:** A `div` renders recursive Markdown styles.
- **Edit Mode:** A `textarea` (auto-resize) handles raw text input for perfect caret alignment.

### 5. Data Portability
- **JSON Format:** The primary exchange format for backups.
- **Drag'n Drop:** Implemented via `ImportExportZone`. Dropping a valid `.json` file anywhere triggers a full outline replacement (after confirmation).

## Current State & Roadmap
- [x] Core Outliner (CRUD, Indent, Move)
- [x] **Context API Migration:** Full decoupling of components from logic.
- [x] **Recursive Markdown Parser:** Supports nested styles.
- [x] **PWA Support:** Offline mode and installation.
- [x] **Responsive Layout:** Floating sidebar and wrapping shortcuts footer.
- [x] **Data Portability:** JSON Backup/Restore and global Drag'n Drop import.
- [x] **Custom Columns:** Dynamic visibility for Status, Date, and Progress slider.
- [x] **High-Contrast UI:** Zebra-striping (30% dark, 8% light).
- [x] Global Search across all notes.
- [ ] **Multi-select & Bulk Actions:** Shift+Arrows selection, batch indent/check/delete.
- [ ] **Markdown Export:** Export hierarchy as a standard `.md` file for interoperability.
- [ ] **Onboarding & Help:** Pre-loaded "Help Outline" for new users and empty states.
- [ ] **Settings Panel:** Centralized management for columns, themes, and database reset.
- [ ] **Robustness:** Unit tests for structural logic and advanced error handling for IndexedDB.

## Instructions for Future Agents
- **Data Integrity:** Always call `sanitizeNodes` during imports or structural changes.
- **Markdown:** Update `src/utils/markdown.ts` for any new syntax using the recursive strategy.
- **Responsive Design:** Use `md:` breakpoints for desktop-only columns and `lg:` for relative vs fixed sidebar positioning.
- **Performance:** Ensure providers separate state from actions to avoid unnecessary re-renders of the entire tree.