import { z } from "zod";
import {
  IoRestaurantOutline,
  IoSunnyOutline,
  IoTvOutline,
  IoWaterOutline,
} from "react-icons/io5";

export const listingSpacesSchema = z
  .object({
    kitchen: z.enum(["private", "shared"]).optional(),
    living_room: z.enum(["private", "shared"]).optional(),
    shower: z.enum(["private", "shared"]).optional(),
    terrace: z.enum(["private", "shared"]).optional(),
  })
  .strict();

export const LISTING_SPACES = [
  { id: "kitchen", label: "Cuisine", icon: IoRestaurantOutline },
  { id: "living_room", label: "Salon", icon: IoTvOutline },
  { id: "shower", label: "Douche", icon: IoWaterOutline },
  { id: "terrace", label: "Terrasse", icon: IoSunnyOutline },
];

export const SPACE_ACCESS_OPTIONS = [
  { id: "private", label: "Privé" },
  { id: "shared", label: "Partagé" },
];

export const SPACE_ACCESS_LABELS = {
  private: "Privé",
  shared: "Partagé",
};

export function getListingSpaceEntries(spaces) {
  return LISTING_SPACES.filter((space) => spaces?.[space.id]).map((space) => ({
    ...space,
    access: spaces[space.id],
  }));
}