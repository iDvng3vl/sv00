// Shared by the 360° section on the home page and the full-screen tour.
// Hotspot positions: yaw is left/right in radians (0 = centre of the image),
// pitch is up/down.
export const TOUR_ROOMS = [
  {
    id: "living",
    name: "Living room",
    subtitle: "A place to come together",
    description:
      "A welcoming living space imagined around warmth, texture and quiet, understated luxury.",
    file: "/images/tour/living-room-360.jpg",
    poster: "/images/tour/living-room-poster.jpg",
    thumb: "/images/tour/living-room-thumb.jpg",
    links: [{ to: "kitchen", yaw: 1.54, pitch: -0.12 }],
  },
  {
    id: "kitchen",
    name: "Kitchen & dining",
    subtitle: "Made for everyday moments",
    description:
      "An open-plan kitchen and dining space designed for gathering, cooking and long dinners.",
    file: "/images/tour/kitchen-dining-360.jpg",
    poster: "/images/tour/kitchen-dining-poster.jpg",
    thumb: "/images/tour/kitchen-dining-thumb.jpg",
    links: [
      { to: "living", yaw: 0.92, pitch: -0.1 },
      { to: "bedroom", yaw: -1.61, pitch: -0.12 },
    ],
  },
  {
    id: "bedroom",
    name: "Master bedroom",
    subtitle: "Your own private retreat",
    description:
      "A calm, softly layered bedroom that opens straight onto its own garden terrace.",
    file: "/images/tour/master-bedroom-360.jpg",
    poster: "/images/tour/master-bedroom-poster.jpg",
    thumb: "/images/tour/master-bedroom-thumb.jpg",
    links: [
      { to: "kitchen", yaw: -1.76, pitch: -0.12 },
      { to: "living", yaw: 1.52, pitch: -0.12 },
    ],
  },
];

export const tourRoomIndex = (id) => TOUR_ROOMS.findIndex((r) => r.id === id);
