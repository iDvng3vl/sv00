import { useCallback, useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";
import "./TourPanorama.css";
import { TOUR_ROOMS, tourRoomIndex } from "./tourData.js";

const MIN_FOV = 50;
const MAX_FOV = 100;
const RESTING_ZOOM = 14;

const calmMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Live 360° view that sits inside the "A first look inside" panel.
   Page scrolling is never hijacked: zoom needs Ctrl + scroll, and on
   touch screens one finger scrolls the page while two fingers look around. */
export default function TourPanorama({ active, onChange }) {
  const hostRef = useRef(null);
  const viewerRef = useRef(null);
  const activeRef = useRef(active);
  const hotspotRefs = useRef({});
  const [status, setStatus] = useState("loading");
  const [hint, setHint] = useState(true);

  const placeHotspots = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const room = TOUR_ROOMS[activeRef.current];
    room.links.forEach((link) => {
      const el = hotspotRefs.current[`${room.id}-${link.to}`];
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

  // Create the viewer once
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const viewer = new Viewer({
      container: host,
      panorama: TOUR_ROOMS[activeRef.current].file,
      navbar: false,
      loadingTxt: "",
      minFov: MIN_FOV,
      maxFov: MAX_FOV,
      defaultZoomLvl: RESTING_ZOOM,
      defaultYaw: calmMotion() ? 0 : -0.35,
      moveInertia: 0.85,
      mousewheel: true,
      mousewheelCtrlKey: true,
      touchmoveTwoFingers: true,
      keyboard: false,
      lang: {
        ctrlZoom: "Hold Ctrl and scroll to zoom",
        twoFingers: "Use two fingers to look around",
      },
    });
    viewerRef.current = viewer;

    viewer.addEventListener("ready", () => {
      setStatus("ready");
      placeHotspots();
      if (!calmMotion()) viewer.animate({ yaw: 0, pitch: 0, speed: 2600 });
      TOUR_ROOMS.forEach((r, i) => {
        if (i !== activeRef.current) {
          viewer.textureLoader.preloadPanorama(r.file).catch(() => {});
        }
      });
    });
    viewer.addEventListener("panorama-error", () => setStatus("error"));
    viewer.addEventListener("render", placeHotspots);

    const hideHint = () => setHint(false);
    host.addEventListener("pointerdown", hideHint, { once: true });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [placeHotspots]);

  // Cross-fade to a new room whenever the selection changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || active === activeRef.current) return;
    activeRef.current = active;
    setStatus("moving");
    setHint(false);

    viewer
      .setPanorama(TOUR_ROOMS[active].file, {
        position: { yaw: 0, pitch: 0 },
        zoom: RESTING_ZOOM,
        transition: calmMotion()
          ? false
          : { speed: 1200, rotation: true, effect: "fade" },
        showLoader: false,
      })
      .then(() => {
        setStatus("ready");
        placeHotspots();
      })
      .catch(() => setStatus("error"));
  }, [active, placeHotspots]);

  const room = TOUR_ROOMS[active];

  return (
    <>
      <div
        ref={hostRef}
        className="tp-host"
        data-status={status}
        role="img"
        aria-label={`${room.name}, interactive 360 degree view`}
      />

      <div className="tp-hotspots" data-status={status}>
        {room.links.map((link) => {
          const to = TOUR_ROOMS[tourRoomIndex(link.to)];
          return (
            <button
              key={`${room.id}-${link.to}`}
              ref={(el) => (hotspotRefs.current[`${room.id}-${link.to}`] = el)}
              className="tp-hotspot"
              data-visible="false"
              onClick={() => onChange(tourRoomIndex(link.to))}
              tabIndex={status === "ready" ? 0 : -1}
            >
              <span className="tp-hotspot-ring" aria-hidden="true" />
              <span className="tp-hotspot-label">{to.name}</span>
            </button>
          );
        })}
      </div>

      <p className={`tp-hint ${hint && status === "ready" ? "is-visible" : ""}`}>
        Drag to look around
      </p>
    </>
  );
}
