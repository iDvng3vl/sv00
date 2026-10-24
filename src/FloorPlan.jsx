
import { useState } from "react";
import {
  ArrowUpRight,
  BedDouble,
  Check,
  ChevronRight,
  CookingPot,
  DoorOpen,
  House,
  Sofa,
  Utensils,
  X,
} from "lucide-react";
import "./FloorPlan.css";

const rooms = [
  {
    id: "master",
    name: "Master Suite",
    number: "01",
    type: "PRIVATE RESIDENCE",
    description:
      "A considered private retreat, with an en-suite bathroom and space to unwind.",
    features: ["Bedroom", "Private en-suite"],
    tour: "#virtual-tour",
    icon: BedDouble,
  },
  {
    id: "bed2",
    name: "Bedroom Two",
    number: "02",
    type: "PRIVATE RESIDENCE",
    description:
      "A comfortable bedroom designed for privacy, with its own en-suite bathroom.",
    features: ["Bedroom", "Private en-suite"],
    icon: BedDouble,
  },
  {
    id: "bed3",
    name: "Bedroom Three",
    number: "03",
    type: "PRIVATE RESIDENCE",
    description:
      "A versatile bedroom for family or guests, complete with an en-suite bathroom.",
    features: ["Bedroom", "Private en-suite"],
    icon: BedDouble,
  },
  {
    id: "bed4",
    name: "Bedroom Four",
    number: "04",
    type: "PRIVATE RESIDENCE",
    description:
      "A fourth private bedroom with its own en-suite bathroom.",
    features: ["Bedroom", "Private en-suite"],
    icon: BedDouble,
  },
  {
    id: "living",
    name: "Living Room",
    number: "05",
    type: "LIVING & ENTERTAINING",
    description:
      "A welcoming central living space for slow mornings, relaxed evenings and hosting.",
    features: ["Main lounge", "Shared living space"],
    tour: "#virtual-tour",
    icon: Sofa,
  },
  {
    id: "dining",
    name: "Dining Area",
    number: "06",
    type: "LIVING & ENTERTAINING",
    description:
      "A warm gathering space conceptually connected to the living area and kitchen.",
    features: ["Family dining", "Entertaining"],
    icon: Utensils,
  },
  {
    id: "kitchen",
    name: "Kitchen",
    number: "07",
    type: "LIVING & ENTERTAINING",
    description:
      "A contemporary kitchen concept designed around practical everyday living.",
    features: ["Preparation area", "Dining connection"],
    tour: "#virtual-tour",
    icon: CookingPot,
  },
  {
    id: "entry",
    name: "Entrance & Hall",
    number: "08",
    type: "ARRIVAL",
    description:
      "A welcoming arrival zone connecting the home's principal spaces.",
    features: ["Entrance", "Internal circulation"],
    icon: DoorOpen,
  },
  {
    id: "dsq",
    name: "Dedicated DSQ",
    number: "09",
    type: "SERVICE SPACE",
    description:
      "A dedicated servant's quarter included in this conceptual villa layout.",
    features: ["Separate designated space"],
    icon: House,
  },
];

const whatsappLink = (room) => {
  const message = encodeURIComponent(
    `Hello Shangrila Villas Estate, I would like to enquire about the ${room} and arrange a private viewing.`
  );
  return `https://wa.me/254722881784?text=${message}`;
};

function RoomButton({ id, selected, onSelect, children, className = "" }) {
  return (
    <button
      type="button"
      className={`fp-room ${selected === id ? "is-selected" : ""} ${className}`}
      onClick={() => onSelect(id)}
      aria-pressed={selected === id}
    >
      {children}
    </button>
  );
}

export default function FloorPlan() {
  const [selectedId, setSelectedId] = useState("living");
  const [directoryOpen, setDirectoryOpen] = useState(false);

  const selectedRoom = rooms.find((room) => room.id === selectedId) || rooms[4];
  const SelectedIcon = selectedRoom.icon;

  return (
    <section className="floor-plan section-pad" id="floor-plan">
      <div className="fp-shell">
        <header className="fp-heading">
          <div>
            <span className="section-index">05 / THE FLOOR PLAN</span>
            <h2>Space to call <em>your own.</em></h2>
            <p>
              Explore the considered spaces of a four-bedroom villa.
              Select a room to discover more.
            </p>
          </div>

          <div className="fp-heading-mark" aria-hidden="true">
            <House size={28} strokeWidth={1.2} />
          </div>
        </header>

        <div className="fp-stats" aria-label="Villa features">
          <div><strong>04</strong><span>Bedrooms</span></div>
          <div><strong>04</strong><span>En-suite bedrooms</span></div>
          <div><strong>01</strong><span>Dedicated DSQ</span></div>
        </div>

        <div className="fp-workspace">
          <section className="fp-plan-panel">
            <div className="fp-plan-topline">
              <span className="fp-eyebrow">THE RESIDENCE</span>
              <span className="fp-concept-tag">CONCEPT · NOT TO SCALE</span>
            </div>

            <div className="fp-plan-canvas">
              <div className="fp-plan-label fp-label-top">PRIVATE WING</div>

              <div className="fp-bedroom-grid">
                <RoomButton id="bed2" selected={selectedId} onSelect={setSelectedId}>
                  <BedDouble />
                  <strong>Bedroom 02</strong>
                  <span>En-suite</span>
                </RoomButton>

                <RoomButton id="master" selected={selectedId} onSelect={setSelectedId}>
                  <BedDouble />
                  <strong>Master Suite</strong>
                  <span>En-suite</span>
                </RoomButton>

                <RoomButton id="bed3" selected={selectedId} onSelect={setSelectedId}>
                  <BedDouble />
                  <strong>Bedroom 03</strong>
                  <span>En-suite</span>
                </RoomButton>

                <RoomButton id="bed4" selected={selectedId} onSelect={setSelectedId}>
                  <BedDouble />
                  <strong>Bedroom 04</strong>
                  <span>En-suite</span>
                </RoomButton>
              </div>

              <div className="fp-lower-grid">
                <RoomButton
                  id="living"
                  selected={selectedId}
                  onSelect={setSelectedId}
                  className="fp-living"
                >
                  <Sofa />
                  <strong>Living Room</strong>
                  <span>Main lounge</span>
                </RoomButton>

                <div className="fp-kitchen-stack">
                  <RoomButton id="dining" selected={selectedId} onSelect={setSelectedId}>
                    <Utensils />
                    <strong>Dining</strong>
                  </RoomButton>

                  <RoomButton id="kitchen" selected={selectedId} onSelect={setSelectedId}>
                    <CookingPot />
                    <strong>Kitchen</strong>
                  </RoomButton>
                </div>
              </div>

              <div className="fp-service-grid">
                <RoomButton id="entry" selected={selectedId} onSelect={setSelectedId}>
                  <DoorOpen />
                  <strong>Entrance & Hall</strong>
                </RoomButton>

                <RoomButton id="dsq" selected={selectedId} onSelect={setSelectedId}>
                  <House />
                  <strong>Dedicated DSQ</strong>
                </RoomButton>
              </div>

              <div className="fp-plan-label fp-label-bottom">
                ILLUSTRATIVE ROOM ARRANGEMENT
              </div>
            </div>

            <div className="fp-plan-footer">
              <span><i /> Selected space</span>
              <span><i /> Other spaces</span>
              <button
                type="button"
                className="fp-directory-toggle"
                onClick={() => setDirectoryOpen((open) => !open)}
                aria-expanded={directoryOpen}
              >
                {directoryOpen ? "Close directory" : "All rooms"}
                {directoryOpen ? <X size={15} /> : <ChevronRight size={15} />}
              </button>
            </div>

            {directoryOpen && (
              <div className="fp-directory">
                {rooms.map((room) => (
                  <button
                    type="button"
                    key={room.id}
                    onClick={() => {
                      setSelectedId(room.id);
                      setDirectoryOpen(false);
                    }}
                    className={selectedId === room.id ? "is-selected" : ""}
                  >
                    <span>{room.number}</span>
                    {room.name}
                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="fp-detail-panel" aria-live="polite">
            <div className="fp-detail-top">
              <span className="fp-eyebrow">{selectedRoom.type}</span>
              <span className="fp-room-number">{selectedRoom.number}</span>
            </div>

            <div className="fp-detail-icon">
              <SelectedIcon size={31} strokeWidth={1.25} />
            </div>

            <h3>{selectedRoom.name}</h3>
            <p className="fp-room-description">{selectedRoom.description}</p>

            <div className="fp-feature-list">
              {selectedRoom.features.map((feature) => (
                <div key={feature}>
                  <Check size={15} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {selectedRoom.tour && (
              <a className="fp-tour-link" href={selectedRoom.tour}>
                Explore the 360° tour <ArrowUpRight size={17} />
              </a>
            )}

            <a
              className="fp-enquire-button"
              href={whatsappLink(selectedRoom.name)}
              target="_blank"
              rel="noreferrer"
            >
              Enquire about this space <ArrowUpRight size={17} />
            </a>

            <p className="fp-disclaimer">
              This is a conceptual illustration, not an architectural
              or construction drawing. Actual room positions, dimensions
              and circulation must be confirmed against approved plans.
            </p>
          </aside>
        </div>

      </div>
    </section>
  );
}
