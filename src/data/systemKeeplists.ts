import type { Keeplist } from "../types";

// System keeplists - default state provided by the app
export const systemKeeplists: Keeplist[] = [
  {
    id: "workbenches",
    name: "Workbenches",
    isSystem: true,
    items: [
      { itemId: "scrap-metal", qtyOwned: 0, qtyRequired: 25, isCompleted: false },
      { itemId: "plastic-waste", qtyOwned: 0, qtyRequired: 15, isCompleted: false },
      { itemId: "resin-canister", qtyOwned: 0, qtyRequired: 10, isCompleted: false },
      { itemId: "copper-wire", qtyOwned: 0, qtyRequired: 8, isCompleted: false },
      { itemId: "circuit-board", qtyOwned: 0, qtyRequired: 3, isCompleted: false },
      { itemId: "hydraulic-piston", qtyOwned: 0, qtyRequired: 2, isCompleted: false },
      { itemId: "titanium-alloy", qtyOwned: 0, qtyRequired: 5, isCompleted: false },
    ],
  },
  {
    id: "expedition-2",
    name: "Expedition 2",
    isSystem: true,
    items: [
      { itemId: "optical-sensor", qtyOwned: 0, qtyRequired: 4, isCompleted: false },
      { itemId: "synthetic-weave", qtyOwned: 0, qtyRequired: 12, isCompleted: false },
      { itemId: "carbon-fiber", qtyOwned: 0, qtyRequired: 6, isCompleted: false },
      { itemId: "arc-powercell", qtyOwned: 0, qtyRequired: 2, isCompleted: false },
      { itemId: "quantum-chip", qtyOwned: 0, qtyRequired: 1, isCompleted: false },
      { itemId: "nano-mesh", qtyOwned: 0, qtyRequired: 3, isCompleted: false },
    ],
  },
  {
    id: "quests",
    name: "Quests",
    isSystem: true,
    items: [
      { itemId: "scrap-metal", qtyOwned: 0, qtyRequired: 50, isCompleted: false },
      { itemId: "rubber-scraps", qtyOwned: 0, qtyRequired: 20, isCompleted: false },
      { itemId: "cloth-rags", qtyOwned: 0, qtyRequired: 15, isCompleted: false },
      { itemId: "glass-shards", qtyOwned: 0, qtyRequired: 10, isCompleted: false },
      { itemId: "ceramic-plate", qtyOwned: 0, qtyRequired: 8, isCompleted: false },
      { itemId: "aluminum-tube", qtyOwned: 0, qtyRequired: 6, isCompleted: false },
      { itemId: "arc-core", qtyOwned: 0, qtyRequired: 1, isCompleted: false },
      { itemId: "alien-artifact", qtyOwned: 0, qtyRequired: 1, isCompleted: false },
    ],
  },
];
