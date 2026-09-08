import { useRef, useState } from "react";


import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform
} from "framer-motion";
import {
  ArrowUpRight, Menu, Phone, Mail, MapPin,
  MessageCircle, X, Play, Pause, Music2, Volume2, ExternalLink,
  
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
    image: "/studio/recording-booth.jpg"
  },
  {
    number: "02",
    title: "Production Console",
    subtitle: "Where ideas become sound.",
    image: "/studio/production-console.jpg"
  },
  {
    number: "03",
    title: "Microphones",
    subtitle: "Capturing every detail.",
    image: "/studio/microphones.jpg"
  },
  {
    number: "04",
    title: "Instruments",
    subtitle: "Tools for creating something original.",
    image: "/studio/instruments.jpg"
  },
  {
    number: "05",
    title: "Behind the Sessions",
    subtitle: "The moments behind the music.",
    image: "/studio/behind-the-sessions.jpg"
  },
  {
    number: "06",
    title: "Artists at Work",
    subtitle: "Where creativity comes alive.",
    image: "/studio/artists-at-work.jpg"
  }
];

function InsideRawchordGallery() {
  const [activePage, setActivePage] = useState(0);
  const [direction, setDirection] = useState(0);

  const x = useMotionValue(0);

  const rotateY = useTransform(
    x,
    [-400, 0, 400],
    [-24, 0, 24]
  );

  const scale = useTransform(
    x,
    [-400, 0, 400],
    [0.97, 1, 0.97]
  );

  const shadow = useTransform(
    x,
    [-400, 0, 400],
    [
      "0 35px 90px rgba(0,0,0,.75)",
      "0 25px 70px rgba(0,0,0,.55)",
      "0 35px 90px rgba(0,0,0,.75)"
    ]
  );

  const goNext = () => {
    if (activePage < studioGallery.length - 1) {
      setDirection(-1);
      setActivePage((current) => current + 1);
    }
  };

  const goPrevious = () => {
    if (activePage > 0) {
      setDirection(1);
      setActivePage((current) => current - 1);
    }
  };

  const handleDragEnd = (
    _: unknown,
    info: {
      offset: {
        x: number;
        y: number;
      };
      velocity: {
        x: number;
        y: number;
      };
    }
  ) => {
    const swipeDistance = 80;
    const swipeVelocity = 400;

    if (
      info.offset.x < -swipeDistance ||
      info.velocity.x < -swipeVelocity
    ) {
      goNext();
    }

    if (
      info.offset.x > swipeDistance ||
      info.velocity.x > swipeVelocity
    ) {
      goPrevious();
    }
  };

  const currentItem = studioGallery[activePage];

  return (
    <section
      id="inside-rawchord"
      className="inside-rawchord section"
    >
      <div className="inside-heading section-shell">
        <span className="section-kicker">
          INSIDE RAWCHORD
        </span>

        <h2>
          Where sound takes shape.
        </h2>

        <p>
          Explore the spaces, tools and creative moments
          behind the sound.
        </p>
      </div>

      <div className="swipe-book-shell">

        {/* PAGE COUNTER */}

        <div className="swipe-book-counter">
          <span>
            {String(activePage + 1).padStart(2, "0")}
          </span>

          <i />

          <span>
            {String(studioGallery.length).padStart(2, "0")}
          </span>
        </div>


        {/* BOOK */}

        <div className="swipe-book">

          {/* NEXT PAGE PREVIEW */}

          {activePage < studioGallery.length - 1 && (
            <div
              className="swipe-book-preview"
              style={{
                backgroundImage: `url(${studioGallery[activePage + 1].image})`
              }}
            />
          )}


          {/* PREVIOUS PAGE PREVIEW */}

          {activePage > 0 && (
            <div
              className="swipe-book-preview previous"
              style={{
                backgroundImage: `url(${studioGallery[activePage - 1].image})`
              }}
            />
          )}


          <AnimatePresence
            initial={false}
            custom={direction}
            mode="popLayout"
          >
            <motion.article
              key={activePage}
              className="swipe-book-page"

              custom={direction}

              initial={{
                opacity: 0,
                rotateY: direction === -1 ? 72 : -72,
                x: direction === -1 ? 80 : -80,
                scale: 0.96
              }}

              animate={{
                opacity: 1,
                rotateY: 0,
                x: 0,
                scale: 1
              }}

              exit={{
                opacity: 0,
                rotateY: direction === -1 ? -115 : 115,
                x: direction === -1 ? -180 : 180,
                scale: 0.92
              }}

              transition={{
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1]
              }}

              drag="x"

              dragConstraints={{
                left: 0,
                right: 0
              }}

              dragElastic={0.32}

              onDragEnd={handleDragEnd}

              style={{
                rotateY,
                scale,
                boxShadow: shadow
              }}
            >

              {/* IMAGE */}

              <div
                className="swipe-book-image"
                style={{
                  backgroundImage: `url(${currentItem.image})`
                }}
              />


              {/* CINEMATIC OVERLAY */}

              <div className="swipe-book-overlay" />


              {/* PAGE LIGHT */}

              <motion.div
                className="page-light"
                style={{
                  opacity: useTransform(
                    x,
                    [-350, 0, 350],
                    [0.5, 0, 0.5]
                  )
                }}
              />


              {/* CONTENT */}

              <div className="swipe-book-content">

                <span className="swipe-book-number">
                  {currentItem.number} /{" "}
                  {String(studioGallery.length).padStart(
                    2,
                    "0"
                  )}
                </span>

                <div className="swipe-book-text">

                  <span className="swipe-book-label">
                    RAWCHORD STUDIO
                  </span>

                  <h3>
                    {currentItem.title}
                  </h3>

                  <p>
                    {currentItem.subtitle}
                  </p>

                </div>

              </div>


              {/* PAGE EDGE */}

              <div className="page-edge" />

            </motion.article>

          </AnimatePresence>

        </div>


        {/* SWIPE HINT */}

        <div className="swipe-hint">

          <span>←</span>

          <p>
            SWIPE TO EXPLORE
          </p>

          <span>→</span>

        </div>


        {/* DOT INDICATORS */}

        <div className="swipe-dots">

          {studioGallery.map((item, index) => (
            <button
              key={item.number}

              className={
                index === activePage
                  ? "active"
                  : ""
              }

              onClick={() => {
                setDirection(
                  index > activePage
                    ? -1
                    : 1
                );

                setActivePage(index);
              }}

              aria-label={`View ${item.title}`}
            />

          ))}

        </div>

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
            Music production and recording studio
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
            Explore the studio <ArrowUpRight size={16} />
          </motion.button>
        </div>

        
            </section>

      <InsideRawchordGallery />

      <section id="services" className="section section-shell services-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">SERVICES</span>
            <h2>Crafted for the sound you imagine.</h2>
          </div>
          <p></p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <motion.article
              className="service-card"
              key={service.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: index * 0.04 }}
            >
              <div className="service-top">
                <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
                <Music2 size={18} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              <div className="price-row">
                <span>Starting from</span>
                <strong>{service.price}</strong>
              </div>
            </motion.article>
          ))}
        </div>
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
          <p>Music production and recording studio<br />Chelari, Malappuram</p>
        </div>
        <div className="footer-socials">
          <a href={studio.instagram} target="_blank" rel="noreferrer" aria-label="RawChord Instagram"><InstagramIcon size={20} /></a>
          <a href={studio.youtube} target="_blank" rel="noreferrer" aria-label="RawChord YouTube"><YoutubeIcon size={20} /></a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} RawChord. All rights reserved.</p>
      </footer>

      <div className={`menu-overlay ${menuOpen ? "open" : ""}`}>
        <button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={27} /></button>
        <nav>
          {nav.map(([label, id], index) => (
            <button key={id} onClick={() => { scrollTo(id); setMenuOpen(false); }}>
              <span>0{index + 1}</span>{label}<ArrowUpRight size={24} />
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}

export default App;
