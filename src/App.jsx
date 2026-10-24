
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Compass,
  Maximize2,
  Menu,
  X,
} from "lucide-react";
import "./App.css";
import { TOUR_ROOMS } from "./tourData.js";
import FloorPlan from "./FloorPlan.jsx";

// three.js and the 360° viewer only download when the tour section is near
const TourPanorama = lazy(() => import("./TourPanorama.jsx"));

const PHONE = "254722881784";
const PHONE_DISPLAY = "0722 881 784";

const homes = [
  {
    number: "01",
    name: "Four-Bedroom Villas",
    detail: "FOUR BEDROOMS · ALL EN-SUITE",
    description:
      "Thoughtfully designed for space, privacy and the rhythms of modern family life.",
    image:
      "/images/shangrila-01.jpg",
    alt: "Shangrila four-bedroom villas lining a paved estate drive",
    position: "30% center",
  },
  {
    number: "02",
    name: "Room to Belong",
    detail: "SPACE · COMFORT · PRIVACY",
    description:
      "Generous living spaces and dedicated servant's quarters make everyday living more considered.",
    image:
      "/images/shangrila-02.jpg",
    alt: "Open-plan living room with leather sofa, timber floors and a feature staircase",
    position: "40% center",
  },
  {
    number: "03",
    name: "A Life Well Lived",
    detail: "A GATED RESIDENTIAL COMMUNITY",
    description:
      "A private residential setting designed around comfort, connection and a more considered way of living.",
    image:
      "/images/shangrila-03.jpg",
    alt: "The Shangrila Villas entrance wall and gated driveway",
    position: "84% center",
  },
];

const amenities = [
  {
    number: "01",
    title: "Modern fitness",
    description:
      "A fully equipped modern gym to keep your daily routine moving.",
    icon: "fitness",
  },
  {
    number: "02",
    title: "Poolside living",
    description:
      "A pristine swimming pool for leisurely afternoons and refreshing escapes.",
    icon: "pool",
  },
  {
    number: "03",
    title: "The daily pause",
    description:
      "A welcoming cafeteria for your morning coffee and everyday unwinding.",
    icon: "coffee",
  },
  {
    number: "04",
    title: "Considered infrastructure",
    description:
      "Cabro-paved avenues and lanes throughout the estate.",
    icon: "roads",
  },
];

const REVEAL_IMAGES =
  ".residence-image, .experience-image, .tour-viewer, .location-visual";
const REVEAL_TEXT = [
  ".section-index",
  ".intro-small-note",
  ".intro-main > *",
  ".section-heading > *",
  ".residence-info",
  ".image-disclaimer",
  ".experience-heading > *",
  ".amenity-card",
  ".experience-image-caption",
  ".tour-heading > *",
  ".tour-controls",
  ".tour-room-list",
  ".tour-note",
  ".fp-heading > *",
  ".fp-stats",
  ".fp-plan-panel",
  ".fp-detail-panel",
  ".location-copy > *",
  ".closing > *",
  ".footer-main > *",
  ".footer-bottom",
].join(", ");

/* Reveal sections as they scroll into view. Elements stay visible if
   JavaScript is off or the visitor prefers reduced motion. */
function useScrollReveal() {
  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const root = document.documentElement;
    const nodes = document.querySelectorAll(`${REVEAL_IMAGES}, ${REVEAL_TEXT}`);

    const tagged = [];
    nodes.forEach((el) => {
      if (el.parentElement.closest("[data-reveal]")) return;
      el.dataset.reveal = el.matches(REVEAL_IMAGES) ? "image" : "up";
      tagged.push(el);
    });

    // Stagger siblings that share a parent (cards, stacked copy)
    tagged.forEach((el) => {
      const siblings = tagged.filter((n) => n.parentElement === el.parentElement);
      const index = Math.min(siblings.indexOf(el), 5);
      el.style.setProperty("--reveal-delay", `${index * 110}ms`);
    });

    root.classList.add("reveal-ready");

    // A fully clipped image never counts as "visible" to the observer,
    // so images are watched through their (unclipped) parent instead.
    const watched = new Map();
    tagged.forEach((el) => {
      const target = el.dataset.reveal === "image" ? el.parentElement : el;
      if (!watched.has(target)) watched.set(target, []);
      watched.get(target).push(el);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            watched.get(entry.target)?.forEach((el) => el.classList.add("is-revealed"));
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );

    watched.forEach((_, target) => observer.observe(target));

    // Safety net: never leave anything hidden if the observer misses it
    const fallback = setTimeout(() => {
      tagged.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-revealed");
      });
    }, 1500);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
      root.classList.remove("reveal-ready");
      tagged.forEach((el) => {
        delete el.dataset.reveal;
        el.classList.remove("is-revealed");
        el.style.removeProperty("--reveal-delay");
      });
    };
  }, []);
}

function App() {
  useScrollReveal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState(0);
  const tourViewerRef = useRef(null);
  const [tourNear, setTourNear] = useState(false);

  useEffect(() => {
    const el = tourViewerRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setTourNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTourNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    interest: "Four-bedroom villa",
    message: "",
  });

  const openEnquiry = () => {
    setSubmitted(false);
    setEnquiryOpen(true);
    setMenuOpen(false);
  };

  const closeEnquiry = () => {
    setEnquiryOpen(false);
    setSubmitted(false);
  };

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitEnquiry = (event) => {
    event.preventDefault();

    const message = [
      "Hello Shangrila Villas Estate, I would like to enquire about a private viewing.",
      "",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email || "Not provided"}`,
      `Interest: ${form.interest}`,
      `Message: ${form.message || "I would like to learn more about the estate."}`,
    ].join("\n");

    window.open(
      `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );

    setSubmitted(true);
  };

  const navItems = [
    { label: "The residences", href: "#residences" },
    { label: "The lifestyle", href: "#lifestyle" },
    { label: "Our location", href: "#location" },
  ];

  return (
    <div className="oasis-page">
      <div className="announcement">
        <span>SHANGRILA VILLAS ESTATE</span>
        <span className="announcement-divider">—</span>
        <span>A MORE CONSIDERED WAY TO LIVE</span>
      </div>

      <header className="site-header">
        <a
          href="#home"
          className="brand"
          aria-label="Shangrila Villas Estate home"
          onClick={() => setMenuOpen(false)}
        >
          <img
            className="brand-logo"
            src="/images/shangrila-logo-dark.svg"
            alt="Shangrila Villas"
            width="240"
            height="48"
          />
        </a>

        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <button className="nav-enquire" onClick={openEnquiry}>
            Arrange a viewing <ArrowUpRight size={15} />
          </button>
        </nav>

        <button
          className="mobile-menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-image">
            <img
              src="/images/shangrila-hero.jpg"
              alt="Shangrila villas set around landscaped lawns and gardens"
            />
            <div className="hero-image-shade" />
          </div>

          <div className="hero-content">
            <p className="eyebrow hero-eyebrow">
              A PRIVATE RESIDENTIAL ADDRESS
            </p>
            <h1 className="hero-title">
              A quieter
              <br />
              kind of <em>luxury.</em>
            </h1>
            <p className="hero-description">
              Space to live. Room to belong.
              <br />
              Discover Shangrila Villas Estate.
            </p>
            <a href="#residences" className="hero-cta">
              Discover the residences <ArrowDownRight size={18} />
            </a>
          </div>

          <div className="hero-bottom">
            <span>FOUR-BEDROOM VILLAS</span>
            <span className="hero-scroll">SCROLL TO DISCOVER ↓</span>
          </div>
        </section>

        <section className="intro section-pad" id="about">
          <div className="intro-side">
            <span className="section-index">01 / THE PHILOSOPHY</span>
            <div className="intro-small-note">
              <span className="olive-dot" />
              <span>Designed around living well</span>
            </div>
          </div>

          <div className="intro-main">
            <h2>
              More than a home.
              <br />
              <em>A way of life.</em>
            </h2>
            <p className="intro-copy">
              Welcome to Shangrila Villas Estate, a premier gated community
              created for those who appreciate the finer things in life.
              Discover thoughtfully designed four-bedroom villas, each with
              en-suite bedrooms and dedicated servant&apos;s quarters.
            </p>
            <p className="intro-copy">
              Here, space meets privacy, everyday comfort meets thoughtful
              design, and home becomes the setting for a life well lived.
            </p>
            <a href="#lifestyle" className="text-link">
              Explore the lifestyle <ArrowUpRight size={16} />
            </a>
          </div>
        </section>

        <section className="residences section-pad" id="residences">
          <div className="section-heading">
            <div>
              <span className="section-index">02 / THE RESIDENCES</span>
              <h2>
                Made for living.
                <br />
                <em>Designed to belong.</em>
              </h2>
            </div>
            <p>
              A considered balance of generous space, privacy and modern
              residential living.
            </p>
          </div>

          <div className="residences-grid">
            {homes.map((home, index) => (
              <article className="residence-card" key={home.number}>
                <a
                  href="#enquire"
                  className="residence-image"
                  onClick={(event) => {
                    event.preventDefault();
                    openEnquiry();
                  }}
                  aria-label={`Enquire about ${home.name}`}
                >
                  <img
                    src={home.image}
                    alt={home.alt}
                    loading="lazy"
                    style={{ objectPosition: home.position }}
                  />
                  <span className="residence-number">{home.number}</span>
                  <span className="residence-arrow">
                    <ArrowUpRight size={19} />
                  </span>
                </a>
                <div className="residence-info">
                  <span className="residence-detail">{home.detail}</span>
                  <h3>{home.name}</h3>
                  <p>{home.description}</p>
                </div>
              </article>
            ))}
          </div>

          <p className="image-disclaimer">
            Illustrative architectural imagery. Actual property photography
            and specifications should be confirmed with the estate.
          </p>
        </section>

        <section className="experience section-pad" id="lifestyle">
          <div className="experience-heading">
            <span className="section-index">03 / THE LIFESTYLE</span>
            <h2>
              The everyday,
              <br />
              <em>elevated.</em>
            </h2>
            <p>
              A home is only part of the story. Discover the shared amenities
              that bring more possibility to everyday living.
            </p>
          </div>

          <div className="amenities-grid">
            {amenities.map((amenity) => (
              <article className="amenity-card" key={amenity.number}>
                <span className="amenity-number">{amenity.number}</span>
                <span className="amenity-mark">
                  {amenity.icon === "fitness" && <span>↗</span>}
                  {amenity.icon === "pool" && <span>≈</span>}
                  {amenity.icon === "coffee" && <span>○</span>}
                  {amenity.icon === "roads" && <span>⌁</span>}
                </span>
                <h3>{amenity.title}</h3>
                <p>{amenity.description}</p>
              </article>
            ))}
          </div>

          <div className="experience-image">
            <img
              src="/images/shangrila-slow-down.jpg"
              alt="Landscaped lawns and gardens in front of a Shangrila Villas building"
              loading="lazy"
              style={{ objectPosition: "center 38%" }}
            />
            <div className="experience-image-caption">
              <span>SPACE TO SLOW DOWN</span>
              <span>TIME TO LIVE WELL</span>
            </div>
          </div>
          <p className="image-disclaimer">
            Illustrative amenity imagery. Final amenities and facilities are
            subject to confirmation.
          </p>
        </section>

        <section className="tour section-pad" id="tour">
          <div className="tour-heading">
            <span className="section-index">04 / A FIRST LOOK INSIDE</span>
            <h2>
              Imagine yourself
              <br />
              <em>at home.</em>
            </h2>
            <p>
              Take a first look at the spaces and atmosphere that inspire
              considered contemporary living.
            </p>
          </div>

          <div className="tour-viewer" ref={tourViewerRef}>
            <div className="tour-image">
              <img
                key={TOUR_ROOMS[activeRoom].poster}
                src={TOUR_ROOMS[activeRoom].poster}
                alt=""
                loading="lazy"
              />
              {tourNear && (
                <Suspense fallback={null}>
                  <TourPanorama active={activeRoom} onChange={setActiveRoom} />
                </Suspense>
              )}
              <div className="tour-image-overlay" />
              <div className="tour-label">
                <Compass size={16} />
                <span>360° EXPERIENCE</span>
              </div>
              <a
                href="#virtual-tour"
                className="tour-label tour-expand"
                aria-label="Open the 360° tour full screen"
              >
                <span>FULL SCREEN</span>
                <Maximize2 size={14} />
              </a>
              <div className="tour-caption">
                <span className="tour-caption-index">
                  0{activeRoom + 1} / 03
                </span>
                <h3>{TOUR_ROOMS[activeRoom].name}</h3>
                <p>{TOUR_ROOMS[activeRoom].subtitle}</p>
              </div>
              <div className="tour-controls">
                <button
                  aria-label="Previous room"
                  onClick={() =>
                    setActiveRoom(
                      (current) =>
                        (current - 1 + TOUR_ROOMS.length) % TOUR_ROOMS.length
                    )
                  }
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  aria-label="Next room"
                  onClick={() =>
                    setActiveRoom(
                      (current) => (current + 1) % TOUR_ROOMS.length
                    )
                  }
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="tour-room-list">
              <span className="tour-list-heading">EXPLORE THE SPACES</span>
              {TOUR_ROOMS.map((room, index) => (
                <button
                  key={room.name}
                  className={`tour-room ${
                    activeRoom === index ? "active" : ""
                  }`}
                  onClick={() => setActiveRoom(index)}
                >
                  <span>0{index + 1}</span>
                  <span>{room.name}</span>
                  {activeRoom === index && <ArrowUpRight size={17} />}
                </button>
              ))}
              <div className="tour-note">
                <span className="olive-dot" />
                <p>
                  Drag the view to look around, or follow the doorways from
                  room to room. Interiors are concept visualisations.
                </p>
              </div>
            </div>
          </div>
          <p className="image-disclaimer">
            Preview images are illustrative and are not confirmed photographs
            of Shangrila Villas Estate.
          </p>
        </section>

        <FloorPlan />

        <section className="location section-pad" id="location">
          <div className="location-copy">
            <span className="section-index">06 / YOUR NEXT CHAPTER</span>
            <h2>
              A place to
              <br />
              <em>call your own.</em>
            </h2>
            <p>
              Discover a private residential community designed to bring
              together space, comfort and the freedom to live well.
            </p>
            <p>
              Get in touch with our team for the estate&apos;s location,
              property details and private viewing arrangements.
            </p>
            <button className="text-link" onClick={openEnquiry}>
              Enquire about the estate <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="location-visual">
            <img
              src="/images/shangrila-next-chapter.jpg"
              alt="A family with their two dogs walking the lawns between the Shangrila villas"
              loading="lazy"
              style={{ objectPosition: "52% center" }}
            />
            <div className="location-visual-label">
              <span>SHANGRILA VILLAS ESTATE</span>
              <span>YOUR PRIVATE RESIDENTIAL ADDRESS</span>
            </div>
          </div>
          <p className="image-disclaimer">
            Estate location and property imagery to be updated with verified
            project information.
          </p>
        </section>

        <section className="closing section-pad" id="enquire">
          <span className="section-index">YOUR INVITATION</span>
          <h2>
            Your next chapter
            <br />
            <em>starts here.</em>
          </h2>
          <p>
            Some places are best experienced in person.
            <br />
            Arrange a private viewing of Shangrila Villas Estate.
          </p>
          <button className="closing-cta" onClick={openEnquiry}>
            Arrange a private viewing <ArrowUpRight size={18} />
          </button>
          <a
            className="closing-phone"
            href={`https://wa.me/${PHONE}`}
            target="_blank"
            rel="noreferrer"
          >
            Or speak to our team: {PHONE_DISPLAY}
          </a>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <a href="#home" className="brand footer-brand">
            <img
              className="brand-logo"
              src="/images/shangrila-logo-dark.svg"
              alt="Shangrila Villas"
              width="240"
              height="48"
              loading="lazy"
            />
          </a>
          <p>
            A more considered way to live.
            <br />
            Discover your next chapter.
          </p>
          <button className="footer-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            BACK TO TOP ↑
          </button>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Shangrila Villas Estate</span>
          <span>RESIDENTIAL LIVING, REIMAGINED.</span>
        </div>
      </footer>

      {enquiryOpen && (
        <div
          className="enquiry-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEnquiry();
          }}
        >
          <div
            className="enquiry-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-title"
          >
            <button
              className="modal-close"
              aria-label="Close enquiry"
              onClick={closeEnquiry}
            >
              <X size={22} />
            </button>

            {!submitted ? (
              <>
                <span className="section-index">A PERSONAL INVITATION</span>
                <h2 id="enquiry-title">
                  Let's find your
                  <br />
                  <em>place.</em>
                </h2>
                <p className="modal-description">
                  Share your details and continue your enquiry with the
                  Shangrila Villas Estate team on WhatsApp.
                </p>

                <form className="enquiry-form" onSubmit={submitEnquiry}>
                  <label>
                    Your name *
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={updateForm}
                      placeholder="Full name"
                      autoComplete="name"
                      required
                    />
                  </label>

                  <label>
                    Phone number *
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={updateForm}
                      placeholder="Your preferred contact number"
                      autoComplete="tel"
                      required
                    />
                  </label>

                  <label>
                    Email address
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={updateForm}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </label>

                  <label>
                    I'm interested in
                    <select
                      name="interest"
                      value={form.interest}
                      onChange={updateForm}
                    >
                      <option>Four-bedroom villa</option>
                      <option>Private viewing</option>
                      <option>Estate amenities</option>
                      <option>More property information</option>
                    </select>
                  </label>

                  <label>
                    Anything you'd like to ask?
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={updateForm}
                      placeholder="Tell us what you'd like to know..."
                      rows={3}
                    />
                  </label>

                  <button type="submit" className="form-submit">
                    Continue on WhatsApp <ArrowUpRight size={17} />
                  </button>
                  <p className="form-note">
                    Your message will open in WhatsApp for you to review and
                    send. Nothing is sent automatically from this form.
                  </p>
                </form>
              </>
            ) : (
              <div className="form-success">
                <span className="success-icon">
                  <Check size={25} />
                </span>
                <span className="section-index">ENQUIRY PREPARED</span>
                <h2>
                  One step closer
                  <br />
                  <em>to home.</em>
                </h2>
                <p>
                  WhatsApp should have opened with your enquiry. Please send
                  the message there to contact the estate team.
                </p>
                <a
                  className="form-submit success-link"
                  href={`https://wa.me/${PHONE}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open WhatsApp <ArrowUpRight size={17} />
                </a>
                <button className="text-link" onClick={closeEnquiry}>
                  Close window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
