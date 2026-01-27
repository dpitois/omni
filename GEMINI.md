# Modern Vintage Outliner (MVO)

## Project Overview
Modern Vintage Outliner (MVO) is an ultra-lightweight structured note-taking web application. It aims to fuse the hierarchical ergonomics of OmniOutliner with the tag/view system of Obsidian.

## Technology Stack
- **Framework:** Preact (via ViteJS) for minimal bundle size.
- **Styling:** Tailwind CSS (targeting a modern macOS/Aqua look).
- **Icons:** Lucide-Preact.
- **Persistence:** LocalStorage initially, with abstraction for future API integration.

## Architecture & Design
The project follows a strict separation of Logic and View via Custom Hooks:
- **`useOutliner` Hook:** Manages tree structure (CRUD, indentation, state).
- **`useTags` Hook:** Parses text to extract tags using regex.
- **`OutlinerWrapper`:** Connects logic hooks to the UI components.
- **`NodeItem`:** Pure rendering component for individual lines.

### Data Model (`Node` Interface)
- `id`: string (UUID)
- `text`: string
- `level`: number (0-5)
- `checked`: boolean
- `parentId`: string | null
- `updatedAt`: number

## Development Conventions (Planned)
- **Navigation:** Keyboard-centric (Enter for new node, Tab/Shift+Tab for indentation, Arrows for navigation).
- **UI:** Zebra-striping, auto-focus on creation, system typography.
- **State Management:** Custom hooks manage local state, abstracted for future backend integration.

## Building and Running (Anticipated)
*Since the project is currently in the specification phase, standard Vite commands are expected:*
- **Install Dependencies:** `npm install`
- **Start Dev Server:** `npm run dev`
- **Build:** `npm run build`
