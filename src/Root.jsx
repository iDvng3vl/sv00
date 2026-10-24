import { Suspense, lazy, useEffect, useRef, useState } from "react";
import App from "./App.jsx";

// The 360° tour (and three.js) only downloads when someone opens it
const VirtualTour = lazy(() => import("./VirtualTour.jsx"));
const TOUR_HASH = "#virtual-tour";

export default function Root() {
  const [hash, setHash] = useState(window.location.hash);
  const inTour = hash === TOUR_HASH;
  const wasInTour = useRef(inTour);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (inTour) {
      window.scrollTo(0, 0);
    } else if (wasInTour.current) {
      // Coming back from the tour: land on the section the link points to
      requestAnimationFrame(() => {
        const target = document.getElementById(hash.slice(1));
        if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
        else window.scrollTo(0, 0);
      });
    }
    wasInTour.current = inTour;
  }, [inTour, hash]);

  if (inTour) {
    return (
      <Suspense fallback={<div className="vt-boot" />}>
        <VirtualTour />
      </Suspense>
    );
  }

  return <App />;
}
