# Requirements: Modern Vintage Outliner (MVO)

## 1. Product Vision

Ultra-lightweight structured note-taking web application. A fusion of the hierarchical ergonomics of OmniOutliner and the tag/view system of Obsidian.

## 2. Tech Stack

- Framework: Preact (via ViteJS) for minimal bundle size.
- Styling: Tailwind CSS (Modern macOS/Aqua look).
- Icons: Lucide-Preact.
- Architecture: Logic/View separation via custom Hooks.
- Persistence: Storage abstraction for future API evolution.

## 3. Software Architecture

- useOutliner (Hook): Tree structure management (CRUD, indentation, state).
- useTags (Hook): Text analyzer for tag extraction via regex (/#\w+/g).
- OutlinerWrapper: Glue component between hooks and UI.
- NodeItem: Pure rendering component for lines.

## 4. Data Structure

Node Interface:

- id: string (UUID)
- text: string
- level: number (0-5)
- checked: boolean
- parentId: string | null
- updatedAt: number

## 5. Functional Specifications

- Keyboard Navigation: Enter (new node), Tab (indent), Shift+Tab (outdent), Arrows (navigation).
- Hierarchical Mode: Tree display with dynamic margins (30px per level).
- Pivot Mode (Tags): Alternative view grouping nodes by tags, regardless of their tree position.
- Persistence: Initial LocalStorage implementation, designed for future REST API injection.

## 6. UI Design

- Zebra-striping (alternating lines).
- Automatic focus when creating a line.
- Status checkbox for progress tracking.
- System typography (San Francisco / Segoe UI).
