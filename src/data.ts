export const studio = {
  phone: "919995114780", // CHANGE THIS to the real number without +
  email: "torawchord@gmail.com", // CHANGE THIS
  instagram: "https://www.instagram.com/raw.chord", // CHANGE THIS
  youtube: "https://youtube.com/@jishakkul", // CHANGE THIS
  address: "Chelari, Malappuram, Kerala, India",
  mapsQuery: "Chelari, Malappuram, Kerala, India" // Replace with exact studio address/coordinates for an exact pin
};

export const services = [
  { title: "Music Production", price: "₹2,500+", desc: "From idea to a polished, release-ready production." },
  { title: "Vocal Recording", price: "₹500/hr", desc: "Clean, comfortable sessions with professional guidance." },
  { title: "Mixing & Mastering", price: "₹2,000+", desc: "Balance, depth and clarity for every important detail." },
  { title: "Live Instrument Recording", price: "₹1,000/hr", desc: "Capture authentic performances with precision." },
  { title: "Podcast / Voiceover", price: "₹1,000+", desc: "Professional recording and finishing for spoken audio." }
];

export const works = [
  {
    title: "Cha Cha Chi Chi",
    artist: "Jishakkul",
    genre: "Electronic",
    audio: `${import.meta.env.BASE_URL}music/Cha%20Cha%20Chi%20Chi.mp3`
  },
  {
    title: "Illey Illa",
    artist: "Jishakkul",
    genre: "Ambient",
    audio: `${import.meta.env.BASE_URL}music/Illey%20Illa.mp3`
  },
  {
    title: "Kalyani",
    artist: "Jishakkul",
    genre: "Pop",
    audio: `${import.meta.env.BASE_URL}music/KALYANI.mp3`
  },
  {
    title: "Loser Song",
    artist: "Jishakkul",
    genre: "R&B",
    audio: `${import.meta.env.BASE_URL}music/Loser%20Song.mp3`
  },
  {
    title: "The Bloodline",
    artist: "Jishakkul",
    genre: "Cinematic",
    audio: `${import.meta.env.BASE_URL}music/The%20Bloodline.mp3`
  }
];
