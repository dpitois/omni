# Omni — Modern Vintage Outliner

Omni is a high-performance, keyboard-centric hierarchical outliner built with a "Modern Vintage" aesthetic. It combines the structured power of classic outliners with modern web technologies to provide a fast, offline-first note-taking experience.

![Omni Banner](public/vite.svg)

## ✨ Features

- **Multi-Document (Workspaces):** Create and manage independent outlines with isolated data.
- **Hierarchical Outlining:** Unlimited nesting with parent-child relationships and "Focus Mode" (Hoisting).
- **VIM-Hybrid Navigation:** Modal system with Normal, Insert, and Command modes for power users.
- **Command Palette (Ctrl+K):** Searchable "Spotlight" interface to quickly trigger any action or switch workspace.
- **Persistent Filters:** Save complex search and tag combinations as named "Views" in the sidebar.
- **Rich Text Support:** Nested Markdown styles via recursive parsing.
- **Snapshot-based Undo/Redo:** Native history management with Vim (`u`) and standard (`Ctrl+Z`) shortcuts.
- **Smart Checkboxes:** Hierarchical completion logic (cascade check/uncheck).
- **Offline First (PWA):** Installable application that works 100% offline via IndexedDB (v3).
- **Interoperability:** JSON Backup/Restore and standard OPML Import/Export.

## 🛠️ Tech Stack

- **Frontend:** [Preact](https://preactjs.com/) + [@preact/signals](https://preactjs.com/guide/v10/signals/) (O(1) reactivity)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** Hybrid (Context API for DI + Signals for high-frequency updates)
- **Validation:** [Valibot](https://valibot.io/) for data integrity
- **Storage:** IndexedDB (Atomic saves, multi-store for docs and filters)
- **Icons:** [Lucide Preact](https://lucide.dev/)

## ⌨️ Keyboard Shortcuts

### Global & UI

| Shortcut   | Action                    |
| :--------- | :------------------------ |
| `Alt + S`  | Toggle Sidebar            |
| `Alt + L`  | Focus Library (Sidebar)   |
| `Alt + T`  | Switch Theme (Light/Dark) |
| `Alt + C`  | Toggle Tag Colors         |
| `Alt + K`  | Columns Visibility Menu   |
| `Alt + H`  | Show Help Modal           |
| `Ctrl + K` | **Command Palette**       |
| `Ctrl + F` | Focus Search Input        |

### Normal Mode (Vim-style Navigation)

| Shortcut           | Action                  |
| :----------------- | :---------------------- |
| `j` or `↓`         | Navigate Down           |
| `k` or `↑`         | Navigate Up             |
| `Shift + j/k`      | **Select Range**        |
| `z`                | Toggle Focus (Hoist)    |
| `h` or `←`         | Navigate Left / Outdent |
| `l` or `→`         | Navigate Right / Indent |
| `i` / `a`          | Enter Insert Mode       |
| `u` / `Ctrl + R`   | **Undo / Redo**         |
| `o`                | New Node + Insert Mode  |
| `:`                | Enter Command Mode      |
| `d` or `Backspace` | Delete Node(s)          |
| `Space` or `Enter` | Toggle Checkbox         |
| `.`                | Toggle Collapse/Fold    |

### Structure & Editing

| Shortcut            | Action                   |
| :------------------ | :----------------------- |
| `Alt + ↑/↓`         | Move Node Up/Down        |
| `Alt + ←/→`         | Navigate Columns         |
| `Tab` / `Shift+Tab` | Indent / Outdent         |
| `Ctrl + B/I/U/S`    | **Rich Text Formatting** |
| `Esc`               | Return to Normal Mode    |

## 🚀 Getting Started

```bash
npm install
npm run dev
```

## 📄 License

This project is licensed under the MIT License.
