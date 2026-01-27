# Omni — Modern Vintage Outliner

Omni is a high-performance, keyboard-centric hierarchical outliner built with a "Modern Vintage" aesthetic. It combines the structured power of classic outliners with modern web technologies to provide a fast, offline-first note-taking experience.

![Omni Banner](public/vite.svg)

## ✨ Features

- **Hierarchical Outlining:** Unlimited nesting with parent-child relationships.
- **Keyboard First:** Optimized for speed with comprehensive keyboard shortcuts.
- **Rich Text Support:** Nested Markdown styles (Bold, Italic, Underline, Strikethrough) via recursive parsing.
- **Smart Checkboxes:** Hierarchical completion logic (cascade check/uncheck).
- **Tag System:** Extraction, filtering, and tag management with counts.
- **Custom Columns:** Dynamic visibility for Status, Date, and Progress slider.
- **Global Search:** Instant search across all nodes with hierarchical context.
- **Offline First (PWA):** Installable application that works 100% offline via IndexedDB.
- **Data Portability:** JSON Backup/Restore and global Drag'n Drop import.
- **Beautiful UI:** Light/Dark modes with "Modern Vintage" stone tones and high-contrast zebra-striping.

## 🛠️ Tech Stack

- **Frontend:** [Preact](https://preactjs.com/) (Ultra-lightweight React alternative)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** React Context API (Domain-driven)
- **Storage:** IndexedDB (Persistent, scalable client-side storage)
- **Icons:** [Lucide Preact](https://lucide.dev/)
- **PWA:** `vite-plugin-pwa`

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Enter` | Create New Node |
| `Tab` | Indent Node |
| `Shift + Tab` | Outdent Node |
| `Alt + ↑/↓` | Move Node Up/Down |
| `Ctrl + .` | Toggle Fold/Collapse |
| `Ctrl + Enter` | Toggle Checkbox |
| `Alt + ←/→` | Navigate Columns |
| `Ctrl + B` | Bold Text |
| `Ctrl + I` | Italic Text |
| `Ctrl + U` | Underline Text |
| `Ctrl + Shift + S` | Strikethrough Text |
| `Ctrl + F` | Focus Search |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/omni.git
   cd omni
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

To create a production-ready bundle with Service Worker generation:

```bash
npm run build
```

## 📄 License

This project is licensed under the MIT License.
