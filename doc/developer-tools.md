# Developer Tools

Arc Keepers includes internal tools for maintainers to manage game data. These tools are accessible via the `/dev` route or command line.

## Item Crawler

Fetches all items from the MetaForge API and exports them for use in the app.

### Browser-Based (Development Only)

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:5173/dev`
3. Click **"Fetch Items"** to retrieve all items from the API
4. Click **"Download CSV"** to save the data

> **Note:** The browser-based crawler only works in development mode due to CORS restrictions. A Vite proxy routes requests through the dev server.

### Command Line (Recommended)

Run the CLI script directly:

```bash
npm run fetch-items
```

This fetches all items and saves them to:

| File | Description |
|------|-------------|
| `src/data/items.csv` | CSV format for external tools |
| `src/data/allItems.ts` | TypeScript module ready to import |

The TypeScript module exports:
- `allItems` - Array of all `RequiredItem` objects
- `itemsById` - Map for O(1) lookup by ID
- `getItemById(id)` - Helper function

### API Information

- **Endpoint:** `https://metaforge.app/api/arc-raiders/items`
- **Parameters:** `page`, `limit`
- **Attribution:** Data provided by [MetaForge](https://metaforge.app/arc-raiders)

## Data Flow

```
MetaForge API
     │
     ▼
┌─────────────────┐
│  Item Crawler   │  (CLI or Browser)
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ src/data/       │
│ ├─ allItems.ts  │  ◄── Import in app
│ └─ items.csv    │  ◄── External use
└─────────────────┘
```

## Future Tools

The `/dev` page is designed to host additional developer tools:

- **Keeplist Builder** - UI to create system keeplists (planned)
- **Image Integrity Tester** - Validate item image URLs (planned)

## Updating Game Data

When ARC Raiders receives updates with new items:

1. Run `npm run fetch-items` to pull the latest data
2. Review the changes in `src/data/allItems.ts`
3. Update system keeplists in `src/data/systemKeeplists.ts` if needed
4. Commit and deploy
