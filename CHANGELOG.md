# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-07

### Added

- Initial public release
- **Keeplist System**: Track items across multiple keeplists (Workbenches, Expedition 2, Flickering Flames, Quests)
- **Custom Keeplists**: Create your own keeplists to track personal goals
- **Item Tracking**: Increment/decrement owned quantities, mark items complete
- **Search**: Fuzzy search with keyboard-first alpha-hijack navigation
- **Active Keeplists**: Toggle which keeplists appear in the main view
- **Import/Export**: Backup and restore progress as JSON
- **PWA Support**: Install as standalone app, works offline
- **Responsive Design**: Optimized layouts for desktop and mobile
- **Developer Tools**: Item crawler and keeplist builder at `/#/dev`

### Technical

- React 19 with TypeScript
- Vite 7 build system
- Tailwind CSS 4 for styling
- Zustand for state management with localStorage persistence
- vite-plugin-pwa with Workbox for offline support
- MetaForge CDN integration for item images

[1.0.0]: https://github.com/arckeepers/arckeepers/releases/tag/v1.0.0
