import { useCallback, useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";
import {
  ArrowLeft,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import "./VirtualTour.css";
import { TOUR_ROOMS, tourRoomIndex } from "./tourData.js";

const PHONE = "254722881784";
const WHATSAPP_MESSAGE =
  "Hello Shangrila Villas Estate, I'd like to arrange a private viewing of the villas. I explored the virtual tour and would love to learn more.";
const WHATSAPP_URL = `https://wa.me/${PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

// Field of view: wide by default so the panoramas stay crisp
const MAX_FOV = 100;
const MIN_FOV = 50;
const RESTING_ZOOM = 18;

const ROOMS = TOUR_ROOMS;
const roomIndex = tourRoomIndex;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function VirtualTour() {
  const rootRef = useRef(null);
  const hostRef = useRef(null);
  const viewerRef = useRef(null);
  const hotspotRefs = useRef({});
  const activeRef = useRef(0);

  const [active, setActive] = useState(0);
  const [status, setStatus] = useState("loading"); // loading | ready | moving | error
  const [hintVisible, setHintVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canFullscreen =
    typeof document !== "undefined" && document.fullscreenEnabled;

  const room = ROOMS[active];

  /* Keep each doorway hotspot pinned to its spot in the panorama */
  const placeHotspots = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const current = ROOMS[activeRef.current];

    current.links.forEach((link) => {
      const el = hotspotRefs.current[`${current.id}-${link.to}`];
      if (!el) return;
      const position = { yaw: link.yaw, pitch: link.pitch };
      if (viewer.dataHelper.isPointVisible(position)) {
        const { x, y } = viewer.dataHelper.sphericalCoordsToViewerCoords(position);
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        el.dataset.visible = "true";
      } else {
        el.dataset.visible = "false";
      }
    });
  }, []);

  /* Create the viewer once */
  useEffect(() => {
    if (!hostRef.current) return;
    const calm = prefersReducedMotion();

    const viewer = new Viewer({
      container: hostRef.current,
      panorama: ROOMS[0].file,
      navbar: false,
      loadingTxt: "",
      minFov: MIN_FOV,
      maxFov: MAX_FOV,
      defaultZoomLvl: calm ? RESTING_ZOOM : 0,
      defaultYaw: calm ? 0 : -0.7,
      defaultPitch: calm ? 0 : 0.08,
      moveInertia: 0.85,
      mousewheel: true,
      mousewheelCtrlKey: false,
      touchmoveTwoFingers: false,
      keyboard: "always",
    });
    viewerRef.current = viewer;

    viewer.addEventListener("ready", () => {
      setStatus("ready");
      placeHotspots();
      // A slow, cinematic settle into the room on first arrival
      if (!calm) {
        viewer.animate({ yaw: 0, pitch: 0, zoom: RESTING_ZOOM, speed: 3600 });
      }
      // Warm up the other rooms so switching is instant
      ROOMS.slice(1).forEach((r) =>
        viewer.textureLoader.preloadPanorama(r.file).catch(() => {})
      );
    });

    viewer.addEventListener("panorama-error", () => setStatus("error"));
    viewer.addEventListener("render", placeHotspots);

    const hideHint = () => setHintVisible(false);
    hostRef.current.addEventListener("pointerdown", hideHint, { once: true });
    const hintTimer = setTimeout(hideHint, 7000);

    return () => {
      clearTimeout(hintTimer);
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [placeHotspots]);

  /* Move between rooms with a soft cross-fade */
  const goTo = useCallback(
    async (index) => {
      const viewer = viewerRef.current;
      if (!viewer || index === activeRef.current || index < 0 || index >= ROOMS.length) {
        return;
      }
      const target = ROOMS[index];
      activeRef.current = index;
      setActive(index);
      setStatus("moving");
      setHintVisible(false);

      try {
        await viewer.setPanorama(target.file, {
          position: { yaw: 0, pitch: 0 },
          zoom: RESTING_ZOOM,
          transition: prefersReducedMotion()
            ? false
            : { speed: 1400, rotation: true, effect: "fade" },
          showLoader: false,
        });
        setStatus("ready");
        placeHotspots();
      } catch {
        setStatus("error");
      }
    },
    [placeHotspots]
  );

  /* Number keys jump between rooms */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea")) return;
      const n = Number(e.key);
      if (n >= 1 && n <= ROOMS.length) goTo(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const previous = document.title;
    document.title = "Virtual tour — Shangrila Villas Estate";
    return () => {
      document.title = previous;
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await rootRef.current?.requestFullscreen();
    } catch {
      // Fullscreen can be blocked inside embedded previews
    }
  };

  const resetView = () =>
    viewerRef.current?.animate({ yaw: 0, pitch: 0, zoom: RESTING_ZOOM, speed: 900 });

  return (
    <main className="vt" ref={rootRef} data-status={status}>
      <div
        ref={hostRef}
        className="vt-viewer"
        aria-label={`${room.name}, interactive 360 degree view`}
        role="img"
      />

      {/* Doorways to the other rooms */}
      <div className="vt-hotspots" aria-hidden={status !== "ready"}>
        {room.links.map((link) => {
          const to = ROOMS[roomIndex(link.to)];
          return (
            <button
              key={`${room.id}-${link.to}`}
              ref={(el) => (hotspotRefs.current[`${room.id}-${link.to}`] = el)}
              className="vt-hotspot"
              data-visible="false"
              onClick={() => goTo(roomIndex(link.to))}
              tabIndex={status === "ready" ? 0 : -1}
            >
              <span className="vt-hotspot-ring" aria-hidden="true" />
              <span className="vt-hotspot-label">
                <small>Walk to</small>
                {to.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="vt-scrim" aria-hidden="true" />

      <header className="vt-top">
        <a className="vt-brand" href="#home" aria-label="Back to the Shangrila Villas website">
          <img
            src="/images/shangrila-logo-dark.svg"
            alt="Shangrila Villas"
            width="180"
            height="36"
          />
        </a>

        <div className="vt-top-actions">
          <a className="vt-back" href="#tour">
            <ArrowLeft size={16} strokeWidth={1.5} />
            <span>Back to the website</span>
          </a>
          <a className="vt-enquire" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            Arrange a private viewing
            <ArrowUpRight size={16} strokeWidth={1.5} />
          </a>
        </div>
      </header>

      <section className="vt-room" aria-live="polite">
        <p className="vt-room-count">
          Room {active + 1} of {ROOMS.length}
        </p>
        <div className="vt-room-copy" key={room.id}>
          <h1>{room.name}</h1>
          <p className="vt-room-subtitle">{room.subtitle}</p>
          <p className="vt-room-description">{room.description}</p>
        </div>
        <p className="vt-concept">Concept visualisation. Final finishes may differ.</p>
      </section>

      <nav className="vt-rooms" aria-label="Choose a room">
        {ROOMS.map((r, i) => (
          <button
            key={r.id}
            className={`vt-room-chip ${i === active ? "is-active" : ""}`}
            aria-current={i === active ? "true" : undefined}
            onClick={() => goTo(i)}
          >
            <img src={r.thumb} alt="" width="160" height="124" />
            <span>{r.name}</span>
          </button>
        ))}
      </nav>

      <div className="vt-tools">
        <button onClick={resetView} aria-label="Reset view" title="Reset view">
          <RotateCcw size={17} strokeWidth={1.5} />
        </button>
        {canFullscreen && (
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
            title={isFullscreen ? "Exit full screen" : "Full screen"}
          >
            {isFullscreen ? (
              <Minimize2 size={17} strokeWidth={1.5} />
            ) : (
              <Maximize2 size={17} strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>

      <p className={`vt-hint ${hintVisible && status === "ready" ? "is-visible" : ""}`}>
        Drag to look around. Scroll or pinch to zoom.
      </p>

      {status === "loading" && (
        <div className="vt-loading" aria-live="polite">
          <span className="vt-loading-mark" aria-hidden="true" />
          <p>Preparing your tour</p>
        </div>
      )}

      {status === "error" && (
        <div className="vt-error" role="alert">
          <h2>This room couldn&rsquo;t load</h2>
          <p>
            Check that the 360° images are in <code>public/images/tour/</code> and
            that the file names match.
          </p>
        </div>
      )}
    </main>
  );
}
