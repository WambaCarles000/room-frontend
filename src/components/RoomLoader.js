"use client";

const SIZE_CLASSES = {
  sm: "room-loader--sm",
  md: "room-loader--md",
  lg: "room-loader--lg",
};

export default function RoomLoader({ size = "md", label = "Chargement" }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`room-loader ${SIZE_CLASSES[size] || SIZE_CLASSES.md}`}
    >
      <span className="sr-only">{label}</span>
      <svg className="room-loader__circular" viewBox="25 25 50 50" aria-hidden="true">
        <circle className="room-loader__arc" cx="50" cy="50" r="20" strokeWidth="2" />
      </svg>
    </span>
  );
}