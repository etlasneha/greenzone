import { NextRequest, NextResponse } from "next/server";

// Mock AI model: simple keyword detection for demo
const WASTE_SUGGESTIONS: Record<string, { tips: string[], youtube: { title: string, url: string }[] }> = {
  "banana": {
    tips: [
      "Compost banana peels in your home compost bin.",
      "Use banana peels to polish shoes or silver.",
      "Chop peels and use as fertilizer for plants."
    ],
    youtube: [
      { title: "5 Ways to Use Banana Peels", url: "https://www.youtube.com/watch?v=7QdQwK1Q2gE" },
      { title: "Banana Peel Fertilizer Tutorial", url: "https://www.youtube.com/watch?v=8QdQwK1Q2gE" }
    ]
  },
  "plastic bottle": {
    tips: [
      "Rinse and recycle in your local recycling bin.",
      "Reuse as a watering can or plant starter.",
      "Make DIY crafts like bird feeders or organizers."
    ],
    youtube: [
      { title: "5 Useful Life Hacks You Need to Try in 2024! Plastic bottle ...", url: "https://www.youtube.com/watch?v=CBkuNpc0R3Y" },
      { title: "Amazing and pretty plastic bottle recycling craft ideas 2024 ...", url: "https://www.youtube.com/watch?v=I-NTaKRGXmU" }
    ]
  },
  "glass bottle": {
    tips: [
      "Rinse and recycle glass in your local recycling bin.",
      "Reuse glass jars for storage or as vases.",
      "Decorate glass bottles for home decor.",
      "Make glass lanterns or candle holders."
    ],
    youtube: [
      { title: "Thrifted Glass Bottle Upcycle (April 19 2024)", url: "https://www.youtube.com/watch?v=aIqro9PYTH8" },
      { title: "CREATIVE DIY UPCYCLED Glass bottles and jars ...", url: "https://www.youtube.com/watch?v=pY6twglzuA4" }
    ]
  },
  "fruit peel": {
    tips: [
      "Compost fruit peels in your home compost bin.",
      "Use citrus peels to make natural cleaners.",
      "Dry peels for potpourri or tea infusions.",
      "Use banana peels to polish shoes or silver."
    ],
    youtube: [
      { title: "Composting (06.14.2025)", url: "https://www.youtube.com/watch?v=zDGW4j_KFzc" },
      { title: "Ways To Use Fruit Peels And Nourish Your Garden Like Pro", url: "https://www.youtube.com/watch?v=i49ojxi2RSw" },
      { title: "Stop Wasting Fruit Peels! Make This Nutrient-Rich Fertilizer at Home", url: "https://www.youtube.com/watch?v=RL7rtJNdM5c" }
    ]
  },
  "egg carton": {
    tips: [
      "Compost cardboard egg cartons.",
      "Use as seed starters for gardening.",
      "Make DIY crafts like organizers or toys.",
      "Shred and use as packing material."
    ],
    youtube: [
      { title: "5 Ways to Reuse EGG Carton | @CraftStack", url: "https://www.youtube.com/watch?v=1-suJBhimWw" },
      { title: "Unique Ways to Recycle Egg Cartons!", url: "https://www.youtube.com/watch?v=hfLmvTy1lVc" },
      { title: "5 Incredible Idea Of Recycling Egg Cartons", url: "https://www.youtube.com/watch?v=de1e83OxOsg" }
    ]
  },
  "apple": {
    tips: [
      "Compost apple cores and peels.",
      "Make apple cider vinegar from scraps.",
      "Feed to pets (if safe) or wildlife."
    ],
    youtube: [
      { title: "Back to the Core: A Compost Story", url: "https://www.youtube.com/watch?v=0TN2VbnEloM" },
      { title: "Don't Discard Rotten Apples. The Rottener, the More Valuable!", url: "https://www.youtube.com/watch?v=z_abOhpShWo" },
      { title: "Best FAST Garden Compost for Veggie Gardens 2025", url: "https://www.youtube.com/watch?v=INadTDohilU" }
    ]
  },
  "paper": {
    tips: [
      "Recycle clean paper in your blue bin.",
      "Shred and use as mulch or compost.",
      "Reuse for notes or crafts."
    ],
    youtube: [
      { title: "Top 9 Amazing Recycling Process Most Viewed in 2025", url: "https://www.youtube.com/watch?v=c1wkhhgve-U" },
      { title: "How Over 50 MILLION TONS of Paper Waste Is Recycled EACH YEAR", url: "https://www.youtube.com/watch?v=UK7zgtQmW6U" },
      { title: "Global Recycling Day 2025", url: "https://www.youtube.com/watch?v=06CKvd2MmNU" }
    ]
  }
};

function detectWasteType(filename: string): { label: string, tips: string[], youtube: { title: string, url: string }[] } {
  // For demo: guess by filename (in real app, use AI model)
  const lower = filename.toLowerCase();
  if (lower.includes("banana")) return { label: "Banana Peel", ...WASTE_SUGGESTIONS["banana"] };
  if (lower.includes("plastic")) return { label: "Plastic Bottle", ...WASTE_SUGGESTIONS["plastic bottle"] };
  if (lower.includes("glass")) return { label: "Glass Bottle", ...WASTE_SUGGESTIONS["glass bottle"] };
  if (lower.includes("fruit")) return { label: "Fruit Peel", ...WASTE_SUGGESTIONS["fruit peel"] };
  if (lower.includes("egg")) return { label: "Egg Carton", ...WASTE_SUGGESTIONS["egg carton"] };
  if (lower.includes("apple")) return { label: "Apple Core/Peel", ...WASTE_SUGGESTIONS["apple"] };
  if (lower.includes("paper")) return { label: "Paper", ...WASTE_SUGGESTIONS["paper"] };
  return { label: "Unknown Waste", tips: ["Try uploading a clearer photo or use a descriptive filename."], youtube: [] };
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
  }
  const { label, tips, youtube } = detectWasteType(file.name);
  return NextResponse.json({ label, tips, youtube });
}
