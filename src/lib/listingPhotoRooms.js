import {
  IoGridOutline,
  IoHomeOutline,
  IoLeafOutline,
  IoRestaurantOutline,
  IoSunnyOutline,
  IoTvOutline,
  IoWaterOutline,
} from "react-icons/io5";

export const LISTING_PHOTO_ROOMS = [
  { id: "general", label: "Vue d’ensemble", icon: IoGridOutline },
  { id: "living_room", label: "Salon", icon: IoTvOutline },
  { id: "kitchen", label: "Cuisine", icon: IoRestaurantOutline },
  { id: "bedroom", label: "Chambre", icon: IoHomeOutline },
  { id: "bathroom", label: "Salle de bain / douche", icon: IoWaterOutline },
  { id: "terrace", label: "Terrasse", icon: IoSunnyOutline },
  { id: "balcony", label: "Balcon", icon: IoLeafOutline },
  { id: "exterior", label: "Extérieur", icon: IoHomeOutline },
  { id: "other", label: "Autre", icon: IoGridOutline },
];

export function getListingPhotoRoom(roomId) {
  return LISTING_PHOTO_ROOMS.find((room) => room.id === roomId) || LISTING_PHOTO_ROOMS[0];
}