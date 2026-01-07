import type { RequiredItem } from "../types";

// Dummy items for UI preview (until real data is fetched via /dev tools)
export const dummyItems: RequiredItem[] = [
  // Common items
  { id: "scrap-metal", name: "Scrap Metal", rarity: "Common" },
  { id: "plastic-waste", name: "Plastic Waste", rarity: "Common" },
  { id: "rubber-scraps", name: "Rubber Scraps", rarity: "Common" },
  { id: "cloth-rags", name: "Cloth Rags", rarity: "Common" },
  { id: "glass-shards", name: "Glass Shards", rarity: "Common" },

  // Uncommon items
  { id: "resin-canister", name: "Resin Canister", rarity: "Uncommon" },
  { id: "copper-wire", name: "Copper Wire", rarity: "Uncommon" },
  { id: "synthetic-weave", name: "Synthetic Weave", rarity: "Uncommon" },
  { id: "ceramic-plate", name: "Ceramic Plate", rarity: "Uncommon" },
  { id: "aluminum-tube", name: "Aluminum Tube", rarity: "Uncommon" },

  // Rare items
  { id: "optical-sensor", name: "Optical Sensor", rarity: "Rare" },
  { id: "hydraulic-piston", name: "Hydraulic Piston", rarity: "Rare" },
  { id: "circuit-board", name: "Circuit Board", rarity: "Rare" },
  { id: "titanium-alloy", name: "Titanium Alloy", rarity: "Rare" },
  { id: "carbon-fiber", name: "Carbon Fiber", rarity: "Rare" },

  // Epic items
  { id: "arc-powercell", name: "ARC Powercell", rarity: "Epic" },
  { id: "quantum-chip", name: "Quantum Chip", rarity: "Epic" },
  { id: "nano-mesh", name: "Nano Mesh", rarity: "Epic" },

  // Legendary items
  { id: "arc-core", name: "ARC Core", rarity: "Legendary" },
  { id: "alien-artifact", name: "Alien Artifact", rarity: "Legendary" },
];

// Create a lookup map for quick access
export const itemsById = new Map<string, RequiredItem>(
  dummyItems.map((item) => [item.id, item])
);

// Get item by ID
export const getItemById = (id: string): RequiredItem | undefined =>
  itemsById.get(id);
