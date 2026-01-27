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
- **Persistent Footer:** Shortcuts are kept in a wrapping footer to ensure they never overlap content and remain accessible on small screens.
- **Offline First:** All data is in IndexedDB. Use the `useOnlineStatus` hook to display the connectivity state in the UI.

### 4. Switch Div/Textarea (Rich Text)
- To ensure perfect caret alignment and native text wrapping:
    - **Read Mode:** A `div` renders recursive Markdown styles.
    - **Edit Mode:** A `textarea` (auto-resize) handles raw text input.
- Styles are not applied during editing to prevent horizontal caret drift in proportional fonts.

### 5. Data Integrity
- The `useOutliner` hook is the source of truth for structural logic.
- **Ranks:** Always call `sanitizeNodes` after structural changes to maintain IndexedDB integrity.

## Current State & Roadmap
- [x] Core Outliner (CRUD, Indent, Move)
- [x] **Context API Migration:** Full decoupling of components from logic.
- [x] **Recursive Markdown Parser:** Supports nested styles (Bold, Italic, Underline, Strikethrough).
- [x] **PWA Support:** Offline mode, manifest, and connectivity indicator.
- [x] **Responsive Layout:** Floating sidebar, wrapping shortcuts footer, and flexbox-based grid.
- [x] **Custom Columns:** Dynamic visibility for Status, Date, and Progress slider.
- [x] **High-Contrast UI:** Zebra-striping (30% dark, 8% light).
- [x] Global Search across all notes.
- [ ] Multi-select / Bulk actions
- [ ] Export to Markdown/JSON

## Instructions for Future Agents
- **Responsive Design:** Use `md:` breakpoints for desktop-only columns and `lg:` for relative vs fixed sidebar positioning.
- **PWA Updates:** Configuration is in `vite.config.ts`. The service worker is registered in `src/main.tsx`.
- **Markdown:** Update `src/utils/markdown.ts` for any new syntax. It uses an earliest-match recursive strategy.