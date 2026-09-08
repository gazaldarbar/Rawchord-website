import { useRef, useState } from "react";


import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo
} from "framer-motion";
import {
  ArrowUpRight, Menu, Phone, Mail, MapPin,
MessageCircle, X, Play, Pause, Music2, ExternalLink,
  
} from "lucide-react";
import logo from "./assets/rawchord-logo.png";
import { services, studio, works } from "./data";

const GALLERY_SPRING = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
};


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
    image: `${import.meta.env.BASE_URL}studio/recording-booth.jpg`
  },
  {
    number: "02",
    title: "Production Console",
    image: `${import.meta.env.BASE_URL}studio/production-console.jpg`
  },
  {
    number: "03",
    title: "Microphones",
    image: `${import.meta.env.BASE_URL}studio/microphones.jpg`
  },
  {
    number: "04",
    title: "Instruments",
    image: `${import.meta.env.BASE_URL}studio/instruments.jpg`
  },
  {
    number: "05",
    title: "Behind the Sessions",
    image: `${import.meta.env.BASE_URL}studio/behind-the-sessions.jpg`
  },
  {
    number: "06",
    title: "Artists at Work",
    image: `${import.meta.env.BASE_URL}studio/artists-at-work.jpg`
  }
];

const shootingFloorGallery = [
  {
    number: "01",
    title: "Content Creation Studio",
    image: `${import.meta.env.BASE_URL}studio/shooting/shooting-floor-01.jpg`,
    alt: "Professional content creation studio and photo video shooting floor at RawChord Chelari Malappuram"
  },
  {
    number: "02",
    title: "Photo Shoot Floor",
    image: `${import.meta.env.BASE_URL}studio/shooting/shooting-floor-02.jpg`,
    alt: "Professional photography shooting floor and creative photo studio in Malappuram"
  },
  {
    number: "03",
    title: "Video Production Floor",
    image: `${import.meta.env.BASE_URL}studio/shooting/shooting-floor-03.jpg`,
    alt: "Professional video shooting and content production studio floor in Chelari Malappuram"
  },
  {
    number: "04",
    title: "Creative Setup",
    image: `${import.meta.env.BASE_URL}studio/shooting/shooting-floor-04.jpg`,
    alt: "Creative content creation setup for photography videos and social media production"
  },
  {
    number: "05",
    title: "Studio Sessions",
    image: `${import.meta.env.BASE_URL}studio/shooting/shooting-floor-05.jpg`,
    alt: "Professional studio session space for photo shoots video shoots and digital content creation"
  }
];

const shootingFloorServices = [
  {
    title: "Photo Shoots",
    desc: "Professional photography space for portraits, fashion, products and creative shoots."
  },
  {
    title: "Video Production",
    desc: "A flexible studio floor for music videos, promotional videos and creative productions."
  },
  {
    title: "Content Creation",
    desc: "Create high-quality reels, YouTube videos and social media content in a professional studio."
  },
  {
    title: "Product Photography & Videography",
    desc: "Clean and controlled studio setups for professional product photography and video."
  },
  {
    title: "Ad shoots",
    desc: "A versatile space for artists, brands and creators to bring visual ideas to life."
  }
];


function InsideRawchordGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  const total = studioGallery.length;

  const goTo = (index: number) => {
    const wrappedIndex =
      ((index % total) + total) % total;

    setActiveIndex(wrappedIndex);
  };

  const getCardPosition = (index: number) => {
    let position = index - activeIndex;

    if (position > total / 2) {
      position -= total;
    }

    if (position < -total / 2) {
      position += total;
    }

    return position;
  };

  return (
    <section
      id="inside-rawchord"
      className="inside-rawchord section"
    >
      <div className="inside-heading section-shell">
        <span className="section-kicker"></span>

        <h2>Inside Rawchord.</h2>

        <p>
          Explore the spaces, tools and creative moments
          behind the sound.
        </p>
      </div>

      <div className="rawchord-gallery">
        <div className="rawchord-gallery-stage">

          {studioGallery.map((item, index) => {
            const position = getCardPosition(index);

            const isActive = position === 0;

            return (
              <motion.article
                key={item.number}
                className={`rawchord-gallery-card ${
                  isActive ? "active" : ""
                }`}
                onClick={() => goTo(index)}
                drag="x"
dragConstraints={{ left: 0, right: 0 }}

                onPanEnd={(_, info) => {
  const swipeThreshold = 50;

  if (info.offset.x < -swipeThreshold) {
    goTo(activeIndex + 1);
  }

  if (info.offset.x > swipeThreshold) {
    goTo(activeIndex - 1);
  }
}}
                
                animate={{
                  x: `${position * 62}%`,
                  scale: isActive
                    ? 1
                    : Math.max(0.72, 0.88 - Math.abs(position) * 0.06),

                  rotateY:
                    position === 0
                      ? 0
                      : position < 0
                      ? 24
                      : -24,

                  opacity:
                    Math.abs(position) > 2
                      ? 0
                      : isActive
                      ? 1
                      : 0.55,

                  zIndex: 20 - Math.abs(position)
                }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 28,
                  mass: 0.9
                }}
                style={{
                  pointerEvents:
                    Math.abs(position) > 2
                      ? "none"
                      : "auto"
                }}
              >
                <div className="rawchord-gallery-image">
                  <img
                    src={item.image}
                    alt={`${item.title} at RawChord recording and music production studio in Chelari, Malappuram`}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>

                <div className="rawchord-gallery-caption">
                  {item.title}
                </div>
              </motion.article>
            );
          })}

        </div>

        <div className="rawchord-gallery-controls">

          <button
            type="button"
            className="rawchord-gallery-arrow"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous studio image"
          >
            ←
          </button>

          <div className="rawchord-gallery-dots">
            {studioGallery.map((item, index) => (
              <button
                key={item.number}
                type="button"
                className={
                  index === activeIndex
                    ? "active"
                    : ""
                }
                onClick={() => goTo(index)}
                aria-label={`View ${item.title}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="rawchord-gallery-arrow"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next studio image"
          >
            →
          </button>

        </div>
      </div>
    </section>
  );
}

function ShootingFloorGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  const total = shootingFloorGallery.length;

  const goTo = (index: number) => {
    const wrappedIndex =
      ((index % total) + total) % total;

    setActiveIndex(wrappedIndex);
  };

  const getCardPosition = (index: number) => {
    let position = index - activeIndex;

    if (position > total / 2) {
      position -= total;
    }

    if (position < -total / 2) {
      position += total;
    }

    return position;
  };

  return (
    <div className="rawchord-gallery shooting-floor-gallery">

      <div className="rawchord-gallery-stage">

        {shootingFloorGallery.map((item, index) => {
          const position = getCardPosition(index);

          const isActive = position === 0;

          return (
            <motion.article
              key={item.number}
              className={`rawchord-gallery-card ${
                isActive ? "active" : ""
              }`}

              onClick={() => goTo(index)}

              drag="x"

              dragConstraints={{
                left: 0,
                right: 0
              }}

              dragElastic={0.12}

              dragMomentum={false}

              onPanEnd={(_, info) => {
                const swipeThreshold = 50;

                if (info.offset.x < -swipeThreshold) {
                  goTo(activeIndex + 1);
                }

                if (info.offset.x > swipeThreshold) {
                  goTo(activeIndex - 1);
                }
              }}

              animate={{
                x: `${position * 62}%`,

                scale: isActive
                  ? 1
                  : Math.max(
                      0.72,
                      0.88 -
                      Math.abs(position) * 0.06
                    ),

                rotateY:
                  position === 0
                    ? 0
                    : position < 0
                    ? 24
                    : -24,

                opacity:
                  Math.abs(position) > 2
                    ? 0
                    : isActive
                    ? 1
                    : 0.55,

                zIndex:
                  20 - Math.abs(position)
              }}

              transition={{
                type: "spring",
                stiffness: 220,
                damping: 28,
                mass: 0.9
              }}

              style={{
                pointerEvents:
                  Math.abs(position) > 2
                    ? "none"
                    : "auto"
              }}
            >

              <div className="rawchord-gallery-image">

                <img
                  src={item.image}
                  alt={item.alt}
                  loading={
                    index === 0
                      ? "eager"
                      : "lazy"
                  }
                />

              </div>

              <div className="rawchord-gallery-caption">
                {item.title}
              </div>

            </motion.article>
          );
        })}

      </div>


      <div className="rawchord-gallery-controls">

        <button
          type="button"
          className="rawchord-gallery-arrow"
          onClick={() =>
            goTo(activeIndex - 1)
          }
          aria-label="Previous shooting floor image"
        >
          ←
        </button>


        <div className="rawchord-gallery-dots">

          {shootingFloorGallery.map(
            (item, index) => (

              <button
                key={item.number}
                type="button"

                className={
                  index === activeIndex
                    ? "active"
                    : ""
                }

                onClick={() =>
                  goTo(index)
                }

                aria-label={`View ${item.title}`}
              />

            )
          )}

        </div>


        <button
          type="button"
          className="rawchord-gallery-arrow"
          onClick={() =>
            goTo(activeIndex + 1)
          }
          aria-label="Next shooting floor image"
        >
          →
        </button>

      </div>

    </div>
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
  ["Inside RawChord", "inside-rawchord"],
  ["Services", "services"],
  ["Shooting Floor", "shooting-floor"],
  ["Our Works", "works"],
  ["Why Us", "why-us"],
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
            fetchPriority="high"
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
      <span className="section-kicker">WHAT WE DO</span>
      <h2>Services.</h2>
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


    <section
  id="shooting-floor"
  className="section shooting-floor-section"
>

  <div className="shooting-floor-heading section-shell">

    <h2>
      The Content Floor.
    </h2>


    <p>
      A professional photo and video shooting floor in Chelari, Malappuram, for content creators, artists, brands and businesses.
    </p>

  </div>


  <ShootingFloorGallery />


  <div className="shooting-services section-shell">

    <div className="shooting-services-grid">

      {shootingFloorServices.map(
        (service, index) => (

          <motion.div
            key={service.title}

            className="shooting-service-card"

            initial={{
              opacity: 0,
              y: 20
            }}

            whileInView={{
              opacity: 1,
              y: 0
            }}

            viewport={{
              once: true,
              amount: 0.2
            }}

            transition={{
              duration: 0.45,
              delay: index * 0.08
            }}
          >

            <span className="shooting-service-number">

              {String(index + 1).padStart(
                2,
                "0"
              )}

            </span>


            <h3>
              {service.title}
            </h3>


            <p>
              {service.desc}
            </p>

          </motion.div>

        )
      )}

    </div>

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


      {/* WHY RAWCHORD */}
<section id="why-us" className="section section-shell why-us-section">

  <div className="why-us-heading">
    <span className="section-kicker">WHY RAWCHORD?</span>

    <h2>More than a studio.</h2>

    <p>
      A creative space built for sound, visuals and ideas.
    </p>
  </div>


  <div className="why-us-list">

    <div className="why-us-card">
      <span className="why-us-number">01</span>

      <div className="why-us-content">
        <h3>Professional Creative Space</h3>

        <p>
          Purpose-built spaces for music production, recording,
          photography and video content.
        </p>
      </div>

      <ArrowUpRight size={22} className="why-us-arrow" />
    </div>


    <div className="why-us-card">
      <span className="why-us-number">02</span>

      <div className="why-us-content">
        <h3>Everything Under One Roof</h3>

        <p>
          Create music, record vocals and produce visual content
          in one creative destination.
        </p>
      </div>

      <ArrowUpRight size={22} className="why-us-arrow" />
    </div>


    <div className="why-us-card">
      <span className="why-us-number">03</span>

      <div className="why-us-content">
        <h3>Built for Creators</h3>

        <p>
          A flexible environment for artists, musicians, brands
          and content creators.
        </p>
      </div>

      <ArrowUpRight size={22} className="why-us-arrow" />
    </div>


    <div className="why-us-card">
      <span className="why-us-number">04</span>

      <div className="why-us-content">
        <h3>Based in Chelari</h3>

        <p>
          A modern creative studio serving creators and businesses
          across Chelari and Malappuram.
        </p>
      </div>

      <ArrowUpRight size={22} className="why-us-arrow" />
    </div>

  </div>

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
