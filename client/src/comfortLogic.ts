export type Temperature = "cold" | "cool" | "comfortable" | "warm" | "hot";
export type Brightness = "dark" | "normal" | "bright" | "very_bright";
export type Noise = "quiet" | "mild" | "moderate" | "noisy";

export interface ComfortStatus {
  key: string;
  title: string;
  description: string;
  color: string;
  img_url: string;
}

const PALETTE = {
  olive: "#5A5F3D",
  terracotta: "#C97A5F",
  wine: "#5B1F26",
  dustyBlue: "#A9BEDF",
  butterYellow: "#F6E6B7",
};

const isBright = (b: Brightness) => b === "bright" || b === "very_bright";

export function normalizeBrightness(raw: string | null): Brightness {
  if (!raw) return "normal";
  const v = raw.toLowerCase();
  if (v.includes("very bright")) return "very_bright";
  if (v.includes("normal")) return "normal";
  if (v.includes("bright")) return "bright";
  if (v === "dark" || v === "dim") return "dark";
  return "normal";
}

export function normalizeNoise(raw: string | null): Noise {
  if (!raw) return "quiet";
  const v = raw.toLowerCase();
  if (v.includes("very noisy")) return "noisy";
  if (v.includes("noisy")) return "noisy";
  if (v.includes("mild")) return "mild";
  return "quiet";
}

export function getComfortStatus(
  temperature: Temperature,
  brightness: Brightness,
  noise: Noise,
): ComfortStatus {
  // Hot Mess special case, which is a more specific hot state.
  if (temperature === "hot") {
    if (isBright(brightness) && noise === "noisy") {
      return {
        key: "hot_mess",
        title: "Hot Mess",
        description:
          "Hot, glaring, and loud all at once. Overstimulating, best to avoid.",
        color: PALETTE.wine,
        img_url: "hot_mess.jpg",
      };
    }
    return {
      key: "furnace_mode",
      title: "Furnace Mode",
      description:
        "Too hot to sit comfortably right now. This spot isn't recommended until it cools down.",
      color: PALETTE.wine,
      img_url: "furnace_mode.png",
    };
  }

  if (brightness === "dark") {
    return {
      key: "blackout_zone",
      title: "Blackout Zone",
      description:
        "No usable light here. Not suitable for reading, studying, or spending time.",
      color: PALETTE.olive,
      img_url: "blackout_zone.png",
    };
  }

  if (temperature === "cool" && noise === "quiet") {
    return {
      key: "cool_vibe",
      title: "Cool Vibe",
      description: "Cool and quiet. Ideal for relaxing or studying solo.",
      color: PALETTE.dustyBlue,
      img_url: "outside.png",
    };
  }

  if (temperature === "warm") {
    if (noise === "quiet") {
      // Sunlit Study is a more specific warm+quiet case (bright + quiet)
      if (brightness === "bright") {
        return {
          key: "sunlit_study",
          title: "Sunlit Study",
          description:
            "Warm, sunny, and peaceful. A great spot to get work done.",
          color: PALETTE.butterYellow,
          img_url: "sunlight_study.png",
        };
      }
      return {
        key: "zen_zone",
        title: "Zen Zone",
        description:
          "Warm and completely silent. A calm spot to focus or unwind.",
        color: PALETTE.dustyBlue,
        img_url: "leaf.png",
      };
    }
    if (isBright(brightness) && noise === "mild") {
      return {
        key: "golden_hour",
        title: "Golden Hour",
        description:
          "Warm sunlight with a light buzz of activity. Pleasant, like a late afternoon glow.",
        color: PALETTE.butterYellow,
        img_url: "yellow_sun.png",
      };
    }
    if (noise === "noisy") {
      return {
        key: "buzzing_campus",
        title: "Buzzing Campus",
        description:
          "Warm and full of energy, with plenty of people around. Great for group hangouts, not for quiet focus.",
        color: PALETTE.terracotta,
        img_url: "buzzing_campus.png",
      };
    }
  }

  return {
    key: "comfortable",
    title: "Comfortable",
    description: "Conditions are within a normal, comfortable range.",
    color: PALETTE.olive,
    img_url: "safe.png",
  };
}
