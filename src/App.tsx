import { useRef, useState } from "react";


import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import type { MotionValue, PanInfo, Transition } from "framer-motion";
import {
  ArrowUpRight, Menu, Phone, Mail, MapPin,
MessageCircle, X, Play, Pause, Music2, ExternalLink,
  
} from "lucide-react";
import logo from "./assets/rawchord-logo.png";
import { services, studio, works } from "./data";



const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const YoutubeIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.8V8.2L15.8 12l-6.2 3.8Z" />
  </svg>
);

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const studioGallery = [
  {
    number: "01",
    title: "Recording Booth",
    subtitle: "Where every voice finds its space.",
    image: `${import.meta.env.BASE_URL}studio/recording-booth.jpg`
  },
  {
    number: "02",
    title: "Production Console",
    subtitle: "Where ideas become sound.",
    image: `${import.meta.env.BASE_URL}studio/production-console.jpg`
  },
  {
    number: "03",
    title: "Microphones",
    subtitle: "Capturing every detail.",
    image: `${import.meta.env.BASE_URL}studio/microphones.jpg`
  },
  {
    number: "04",
    title: "Instruments",
    subtitle: "Tools for creating something original.",
    image: `${import.meta.env.BASE_URL}studio/instruments.jpg`
  },
  {
    number: "05",
    title: "Behind the Sessions",
    subtitle: "The moments behind the music.",
    image: `${import.meta.env.BASE_URL}studio/behind-the-sessions.jpg`
  },
  {
    number: "06",
    title: "Artists at Work",
    subtitle: "Where creativity comes alive.",
    image: `${import.meta.env.BASE_URL}studio/artists-at-work.jpg`
  }
];

const GALLERY_SPRING: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 34,
  mass: 0.9
};

interface GalleryPageProps {
  item: (typeof studioGallery)[number];
  index: number;
  total: number;
  indexMV: MotionValue<number>;
}

function GalleryPage({ item, index, total, indexMV }: GalleryPageProps) {
  // Continuous "distance from active" — recalculated every frame from indexMV,
  // with zero React re-renders. This is what makes every page (not just the
  // active one) move fluidly during the drag instead of jumping on release.
  const relative = useTransform(indexMV, (v) => index - v);

  const x = useTransform(relative, (r) => {
    const dir = Math.sign(r);
    const abs = Math.abs(r);
    // Asymptotic spread: adjacent pages peek out, far pages bunch up at the
    // edges instead of flying off-screen — this is what reads as "stacked
    // pages" rather than "carousel slides".
    const spread = dir * (1 - Math.exp(-abs / 2.1)) * 92;
    return `${spread}%`;
  });

  const rotateY = useTransform(relative, (r) => {
    const dir = Math.sign(r);
    const abs = Math.min(Math.abs(r), 6);
    return dir * (1 - Math.exp(-abs / 1.5)) * -46;
  });

  const scale = useTransform(relative, (r) => {
    const abs = Math.min(Math.abs(r), 6);
    return 1 - abs * 0.055;
  });

  const opacity = useTransform(relative, (r) => {
    const abs = Math.min(Math.abs(r), 6);
    return abs < 0.01 ? 1 : Math.max(1 - abs * 0.22, 0.08);
  });

  const zIndex = useTransform(relative, (r) => Math.round(100 - Math.abs(r) * 10));

  // Fold/shadow on whichever inner edge is tucked behind a more-central page.
  const foldLeft = useTransform(relative, (r) => Math.max(0, Math.min(r * 0.6, 0.85)));
  const foldRight = useTransform(relative, (r) => Math.max(0, Math.min(-r * 0.6, 0.85)));

  return (
    <motion.article
      className="book-page"
      style={{ x, rotateY, scale, opacity, zIndex }}
    >
      <div
        className="book-page-image"
        style={{ backgroundImage: `url(${item.image})` }}
      />

      <div className="book-page-overlay" />

      <motion.div className="page-fold page-fold-left" style={{ opacity: foldLeft }} />
      <motion.div className="page-fold page-fold-right" style={{ opacity: foldRight }} />

      <div className="book-page-content">
        <span className="book-page-number">
          {item.number} / {String(total).padStart(2, "0")}
        </span>

        <div className="book-page-text">
          <span className="book-page-label">RAWCHORD STUDIO</span>
          <h3>{item.title}</h3>
          <p>{item.subtitle}</p>
        </div>
      </div>
    </motion.article>
  );
}

function InsideRawchordGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = studioGallery.length;

  // The single source of truth for every page's position. A float, not an
  // integer — 1.35 means "35% of the way from page 2 to page 3".
  const indexMV = useMotionValue(0);

  const dragStartIndexRef = useRef(0);
  const containerWidthRef = useRef(800);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const goTo = (target: number) => {
    const clamped = Math.max(0, Math.min(total - 1, target));
    setActiveIndex(clamped);
    animate(indexMV, clamped, GALLERY_SPRING);
  };

  const handleDragStart = () => {
    dragStartIndexRef.current = indexMV.get();
    containerWidthRef.current =
      containerRef.current?.offsetWidth || containerWidthRef.current;
  };

  const handleDrag = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const width = containerWidthRef.current || 800;
    let next = dragStartIndexRef.current - info.offset.x / width;

    // Rubber-band past the first/last page instead of hard-stopping.
    if (next < 0) next *= 0.35;
    if (next > total - 1) next = total - 1 + (next - (total - 1)) * 0.35;

    indexMV.set(next);
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const width = containerWidthRef.current || 800;
    const swipedFraction = info.offset.x / width;
    const velocity = info.velocity.x;

    let target = dragStartIndexRef.current;

    if (swipedFraction < -0.16 || velocity < -420) {
      target = dragStartIndexRef.current + 1;
    } else if (swipedFraction > 0.16 || velocity > 420) {
      target = dragStartIndexRef.current - 1;
    } else {
      target = Math.round(indexMV.get());
    }

    goTo(target);
  };

  return (
    <section id="inside-rawchord" className="inside-rawchord section">
      <div className="inside-heading section-shell">
        <span className="section-kicker"></span>
        <h2>INSIDE   RAWCHORD</h2>
        <p>Explore the spaces, tools and creative moments behind the sound.</p>
      </div>

      <div className="book-carousel">
        <div className="book-viewport" ref={containerRef}>
          <div className="book-stack">
            {studioGallery.map((item, index) => (
              <GalleryPage
                key={item.number}
                item={item}
                index={index}
                total={total}
                indexMV={indexMV}
              />
            ))}
          </div>

          <motion.div
            className="book-drag-layer"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          />
        </div>

        <div className="gallery-navigation">
          <button
            type="button"
            className="gallery-arrow"
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous image"
          >
            ←
          </button>

          <div className="gallery-progress">
            {studioGallery.map((item, index) => (
              <button
                key={item.number}
                type="button"
                className={`gallery-dot ${index === activeIndex ? "active" : ""}`}
                onClick={() => goTo(index)}
                aria-label={`Go to ${item.title}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="gallery-arrow"
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex === total - 1}
            aria-label="Next image"
          >
            →
          </button>
        </div>

        <p className="gallery-swipe-hint"></p>
      </div>
    </section>
  );
}
          
                

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = (index: number) => {
    const track = works[index];

    if (!track.audio) return;

    if (playing === index) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = track.audio;
      audioRef.current.play();
      setPlaying(index);
    }
  };

  const nav = [
    ["Home", "home"],
    ["Services", "services"],
    ["Our Works", "works"],
    ["Contact", "contact"]
  ];

  return (
    <main>
      <section id="home" className="hero section-shell">
        <div className="noise" />
        <header className="header">
          <a className="header-action" href={`tel:+${studio.phone}`} aria-label="Call RawChord">
            <Phone size={19} />
            <span>Call</span>
          </a>

          <div className="social-header" aria-label="Social links">
            <a href={studio.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={20} /></a>
            <a href={studio.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><YoutubeIcon size={20} /></a>
          </div>

          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
        </header>

        <motion.div
          className="hero-orbit orbit-one"
          animate={{ rotate: 360 }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="hero-orbit orbit-two"
          animate={{ rotate: -360 }}
          transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
        />

        <div className="hero-content">
          <motion.img
            src={logo}
            alt="RawChord logo"
            className="logo shake-bottom"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.p
            className="eyebrow hero-text-focus"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
          >
            Recording & Music production studio
          </motion.p>
          <motion.p
            className="location-line hero-text-focus second-focus"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <MapPin size={16} /> Chelari, Malappuram
          </motion.p>
          <motion.button
            className="scroll-cue"
            onClick={() => scrollTo("services")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Explore <ArrowUpRight size={16} />
          </motion.button>
        </div>

        
            </section>

      <InsideRawchordGallery />

    

        <section id="services" className="section section-shell services-section">
  <div className="section-heading">
    <div>
      <span className="section-kicker"></span>
      <h2>SERVICES</h2>
    </div>
    <p></p>
  </div>

  <motion.div
    className="services-master-card"
    initial={{ opacity: 0, y: 25 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.6 }}
  >
    {services.map((service, index) => (
      <motion.div
        className="service-row"
        key={service.title}
        whileHover={{ x: 8 }}
        transition={{ duration: 0.25 }}
      >
        <span className="service-row-number">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="service-row-content">
          <h3>{service.title}</h3>
          <p>{service.desc}</p>
        </div>

        <ArrowUpRight className="service-row-arrow" size={22} />
      </motion.div>
    ))}
  </motion.div>
</section>

      <section id="works" className="section section-shell works-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">SELECTED WORKS</span>
            <h2>Play the feeling.</h2>
          </div>
        </div>

        <div className="album-track">
          {works.map((work, index) => {
            const active = playing === index;
            return (
              <motion.article
                key={work.title}
                className={`album-card ${active ? "active" : ""}`}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
              >
                <div className={`album-art art-${index % 5}`}>
                  <span className="album-index">0{index + 1}</span>
                  <div className="vinyl"><div className="vinyl-core" /></div>
                  <span className="art-mark">RC</span>
                </div>
                <div className="album-info">
                  <span className="genre">{work.genre}</span>
                  <h3>{work.title}</h3>
                  <p>{work.artist}</p>
                </div>
                <button
  className="play-button"
  onClick={() => handlePlay(index)}
  aria-label={`${active ? "Pause" : "Play"} ${work.title}`}
>
  {active ? (
    <Pause size={18} fill="currentColor" />
  ) : (
    <Play size={18} fill="currentColor" />
  )}
</button>
                {active && <div className="equalizer"><i /><i /><i /><i /></div>}
              </motion.article>
            );
          })}
        </div>

      <audio
  ref={audioRef}
  onEnded={() => setPlaying(null)}
/>
      </section>

      <section id="contact" className="section section-shell contact-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">CONTACT & LOCATION</span>
            <h2>Let's make something unforgettable.</h2>
          </div>
        </div>

        <div className="contact-layout">
          <div className="contact-card">
            <div className="contact-item">
              <Phone size={21} />
              <div><span>PHONE</span><a href={`tel:+${studio.phone}`}>+{studio.phone}</a></div>
            </div>
            <div className="contact-item">
              <Mail size={21} />
              <div><span>EMAIL</span><a href={`mailto:${studio.email}`}>{studio.email}</a></div>
            </div>
            <div className="contact-item">
              <MapPin size={21} />
              <div><span>STUDIO</span><p>{studio.address}</p></div>
            </div>

            <div className="contact-actions">
              <a className="contact-btn primary" href={`https://wa.me/${studio.phone}`} target="_blank" rel="noreferrer">
                <MessageCircle size={19} /> WhatsApp
              </a>
              <a className="contact-btn" href={`mailto:${studio.email}`}>
                <Mail size={18} /> Email
              </a>
              <a className="contact-btn" href={`tel:+${studio.phone}`}>
                <Phone size={18} /> Call
              </a>
            </div>
          </div>

          <div className="map-card">
            <iframe
              title="RawChord location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(studio.mapsQuery)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              className="map-open"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(studio.mapsQuery)}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in Maps <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      <footer className="footer section-shell">
  <div className="footer-logo-row">
    <img src={logo} alt="RawChord" />

    <p>
      Recording & Music production studio 
      <br />
      Chelari, Malappuram
    </p>
  </div>

  <div className="footer-socials">
    <a
      href={studio.instagram}
      target="_blank"
      rel="noreferrer"
      aria-label="RawChord Instagram"
    >
      <InstagramIcon size={20} />
    </a>

    <a
      href={studio.youtube}
      target="_blank"
      rel="noreferrer"
      aria-label="RawChord YouTube"
    >
      <YoutubeIcon size={20} />
    </a>
  </div>

  <p className="copyright">
    © {new Date().getFullYear()} RawChord. All rights reserved.
  </p>
</footer>

<div className={`menu-overlay ${menuOpen ? "open" : ""}`}>
  <button
    className="close-menu"
    onClick={() => setMenuOpen(false)}
    aria-label="Close menu"
  >
    <X size={27} />
  </button>

  <nav>
    {nav.map(([label, id], index) => (
      <button
        key={id}
        onClick={() => {
          scrollTo(id);
          setMenuOpen(false);
        }}
      >
        <span>0{index + 1}</span>
        {label}
        <ArrowUpRight size={24} />
      </button>
    ))}
  </nav>
</div>
</main>
);
}

export default App;
