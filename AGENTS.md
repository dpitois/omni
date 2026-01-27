# AI Agents Knowledge Base

This file serves as a hand-off and instruction manual for AI agents working on the **Modern Vintage Outliner (MVO)** project.

## Project Context
MVO is a high-performance, keyboard-centric hierarchical outliner. It prioritizes speed, minimal bundle size, and a "Modern Vintage" aesthetic.

## Tech Stack Reminders
- **Core:** Preact + Vite + TypeScript.
- **State Management:** **React Context API** (Domain-driven providers).
- **Styling:** Tailwind CSS v4 (CSS-first config).
- **Icons:** Lucide-Preact.
- **Storage:** IndexedDB (Atomic saves).
- **Theme:** Variable-based (CSS variables) with Light/Dark modes.

## Critical Architectural Rules

### 1. Keyboard-First Interaction
- Any new feature **must** be fully usable via keyboard.
- Avoid adding heavy drag-and-drop libraries.
- Standard formatting: `Ctrl+B` (Bold), `Ctrl+I` (Italic), `Ctrl+U` (Underline), `Ctrl+Shift+S` (Strike).

### 2. Context-Driven Architecture
- **Prop Drilling is forbidden.** Components should consume domain-specific contexts:
    - `OutlinerContext`: Data (nodes, tags) and CRUD actions.
    - `UIContext`: Visual state (theme, focus, columns, navigation).
    - `FilterContext`: Search and tag filtering logic.
- Separate **Data** (state) from **Actions** (callbacks) in providers to minimize re-renders.

### 3. Ghost Marker Rendering (Rich Text)
- Rich text (Bold, Italic, etc.) uses a **recursive multi-pass parser**.
- **Edit Mode:** Markers (e.g., `**`) are visible but dimmed (`text-blue-500/50`) to ensure 1:1 caret alignment with the hidden textarea.
- **Read Mode:** Markers are hidden, and full styles (Bold, Italic, Strikethrough, Underline) are applied.
- **Constraint:** Styles are not applied during editing to prevent horizontal caret drift in proportional fonts.

### 4. Data Integrity
- The `useOutliner` hook is the source of truth for structural logic.
- **Ranks:** Always call `sanitizeNodes` after structural changes to maintain IndexedDB integrity.

## Current State & Roadmap
- [x] Core Outliner (CRUD, Indent, Move)
- [x] **Smart Checkboxes:** Cascade logic with Lucide icons.
- [x] **Context API Migration:** Full decoupling of components from logic.
- [x] **Recursive Markdown Parser:** Supports nested styles (Bold, Italic, Underline, Strikethrough).
- [x] **Ghost Marker Rendering:** Perfect caret alignment during rich text editing.
- [x] **Custom Columns:** Dynamic visibility for Status, Date, and Progress slider.
- [x] **High-Contrast UI:** Zebra-striping (30% dark, 8% light) and "Click outside to deselect".
- [x] Global Search across all notes.
- [ ] Multi-select / Bulk actions
- [ ] Export to Markdown/JSON

## Instructions for Future Agents
- **Component Creation:** Keep components "pure" by fetching state/actions via `useUIState()`, `useUIActions()`, etc.
- **Theming:** Use semantic classes (e.g., `bg-app-bg`, `text-text-main`).
- **Markdown:** Update `src/utils/markdown.ts` for any new syntax. It uses an earliest-match recursive strategy.
