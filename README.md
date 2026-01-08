# ARC Keepers

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

**ARC Keepers** is a Progressive Web App (PWA) companion for the game [ARC Raiders](https://arcraiders.com). It helps players track loot items needed for expeditions, projects and quests.

🌐 **Live App:** [arckeepers.github.io](https://arckeepers.github.io/)

## Introduction

This app aims to answer the question, "Do I need to keep this item?"
All the items that you might need to keep are arranged in to "keeplists".
A keeplist tracks rare items that are needed for workbenches, projects, quests, etc.
This does **NOT** include very common items like Batteries - unless you need a very large number of them.

Hopefully this app will allow raiders to quickly rebuild after expeditions, or when new events are released.

Happy looting!

**NOTE:** This app is open source! Fixes and features are very welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) to get started. The initial version was shamelessly vibe-coded over a couple of hours. We are more than happy to accept AI-developed pull requests as long as they are of reasonable quality.

## Privacy Notice

This app stores all information locally in the browser - there is no login system and no private data is sent to the cloud. However, we do use the PostHog analytics package to track errors and feature usage. This is used to assess potential improvements. Session recording is NOT enabled.

## Features

- 📋 **Keeplist System** — Organize items into "keeplists" (Workbenches, Quests, Expeditions, etc.)
- 🔢 **Allocated Inventory** — Track items per-list separately (e.g. Light bulbs for projects + expeditions tracked separately)
- ⌨️ **Keyboard-First** — Just start typing to search; efficient Tab navigation through controls
- 📱 **Mobile-Friendly** — Responsive design with touch-friendly controls
- 🌙 **Dark Mode** — Easy on the eyes during late-night gaming sessions
- 📴 **Works Offline** — Full PWA support with cached item images
- 🔒 **Privacy-First** — All data stored locally in your browser; no accounts, no tracking
- 📤 **Import/Export** — Backup and restore your progress as JSON

## Quick Start

### Using the App

1. Visit [arckeepers.github.io](https://arckeepers.github.io)
2. Toggle which keeplists you want to track via the **Keeplists** button
3. Use **+/-** buttons to update item quantities as you collect loot
4. Hit **✓** to mark an item as complete
5. Create custom keeplists in **Keeplists → My Keeplists**

### Keyboard Shortcuts

| Key      | Action                                                      |
| -------- | ----------------------------------------------------------- |
| `a-z`    | Focus search bar and start typing                           |
| `Escape` | Clear search                                                |
| `Tab`    | Navigate through controls (optimized order: +, ✓, -, clear) |

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/arckeepers/arckeepers.git
cd arckeepers

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command               | Description                               |
| --------------------- | ----------------------------------------- |
| `npm run dev`         | Start development server                  |
| `npm run build`       | Build for production                      |
| `npm run preview`     | Preview production build locally          |
| `npm run lint`        | Run ESLint                                |
| `npm run fetch-items` | Fetch latest item data from MetaForge API |

### Project Structure

```
src/
├── components/       # React components
│   ├── Header.tsx       # App header with settings
│   ├── ItemCard.tsx     # Individual item display
│   ├── DemandRow.tsx    # Keeplist demand row
│   ├── SearchBar.tsx    # Search with alpha-hijack
│   └── ...
├── data/             # Static data
│   ├── allItems.ts      # Item database (auto-generated)
│   └── systemKeeplists.ts  # Default keeplists
├── pages/            # Route pages
│   ├── HomePage.tsx     # Main app view
│   └── DevPage.tsx      # Developer tools
├── store/            # Zustand state management
│   └── useAppStore.ts   # App state and actions
└── types/            # TypeScript types
    └── index.ts
```

### Developer Tools

Access developer tools at `/#/dev` for:

- **Item Crawler** — Fetch latest items from MetaForge API
- **Keeplist Builder** — Edit system keeplists

## Data Sources

Item data and images are sourced from [MetaForge](https://metaforge.app/arc-raiders). A massive thank-you to them for their amazing resource.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite 7
- **Styling:** Tailwind CSS 4
- **State:** Zustand with localStorage persistence
- **PWA:** vite-plugin-pwa with Workbox
- **Icons:** Lucide React

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Item data provided by [MetaForge](https://metaforge.app)
- ARC Raiders is a trademark of Embark Studios

---

<p align="center">
  Made with ❤️ for the ARC Raiders community
</p>
