"use client";

import { LISTING_PHOTO_ROOMS } from "@/lib/listingPhotoRooms";

export default function ListingPhotoRoomSelect({ value, onChange, photoName }) {
  const id = `photo-room-${photoName}`;

  return (
    <select
      id={id}
      value={value || "general"}
      onChange={(event) => onChange(event.target.value)}
      aria-label={`Section de la photo ${photoName}`}
      className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
    >
      {LISTING_PHOTO_ROOMS.map((room) => (
        <option key={room.id} value={room.id}>{room.label}</option>
      ))}
    </select>
  );
}