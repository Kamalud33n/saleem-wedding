// ---------------------------------------------------------------------------
// Wedding-specific content. Prefer { en, ta } for guest-facing copy.
// UI chrome (buttons, labels) lives in config/ui.copy.js.
// ---------------------------------------------------------------------------

const weddingConfig = {
  couple: {
    partnerOne: {
      name: { en: "Saleem", ta: "சலீம்" },
    },
    partnerTwo: {
      name: { en: "Barakkath", ta: "பரக்கத்" },
    },
    monogram: "S + B",
  },

  weddingDate: "2026-12-27T10:30:00+05:30",
  weddingDateDisplay: {
    day: "27",
    month: { en: "December", ta: "டிசம்பர்" },
    monthShort: { en: "DEC", ta: "டிச" },
    year: "2026",
  },

  discoverInviteLine: {
    en: "You are invited",
    ta: "நீங்கள் அழைக்கப்பட்டுள்ளீர்கள்",
  },

  hero: {
    invitationLine: {
      en: "With the blessings of Almighty Allah, we cordially invite you to the Nikkah ceremony.",
      ta: "அல்லாஹ்வின் அருளுடன், எங்கள் நிக்காஹ் நிகழ்ச்சிக்கு உங்களை அன்புடன் அழைக்கிறோம்.",
    },
    stage: {
      assets: {
        bride: "/wedding/hero/bride.png",
        groom: "/wedding/hero/groom.png",
        petals: [
          "/wedding/hero/petal-01.png",
          "/wedding/hero/petal-02.png",
          "/wedding/hero/petal-03.png",
          "/wedding/hero/petal-04.png",
        ],
      },
    },
  },

  closingLine: {
    en: "May Allah bless this union. We look forward to celebrating with you.",
    ta: "அல்லாஹ் இந்த இணைப்பை அருள்வானாக. உங்களுடன் கொண்டாட ஆவலுடன் காத்திருக்கிறோம்.",
  },

  engagementGallery: {
    eyebrow: { en: "Blessed beginnings", ta: "அருளான தொடக்கம்" },
    title: { en: "Moments of Grace", ta: "அருளின் தருணங்கள்" },
    subtitle: {
      en: "A few frames of gratitude, family, and the beginning of a new journey.",
      ta: "நன்றியுணர்வு, குடும்பம், புதிய பயணத்தின் தொடக்கம் — சில பதிவுகள்.",
    },
    photos: [
      {
        id: 1,
        caption: { en: "A new beginning", ta: "ஒரு புதிய தொடக்கம்" },
        src: "/gallery/engagement/01.jpeg",
        width: 2773,
        height: 4160,
      },
      {
        id: 2,
        caption: { en: "With our families", ta: "எங்கள் குடும்பங்களுடன்" },
        src: "/gallery/engagement/02.jpeg",
        width: 4160,
        height: 2773,
      },
      {
        id: 3,
        caption: { en: "Gratitude and joy", ta: "நன்றியும் மகிழ்ச்சியும்" },
        src: "/gallery/engagement/03.jpeg",
        width: 4160,
        height: 2773,
      },
    ],
  },

  cinematic: {
    src: "/gallery/cinematic.jpeg",
    line: {
      en: "May Allah bless you both, and unite you in goodness.",
      ta: "அல்லாஹ் உங்கள் இருவரையும் அருள்புரிந்து, நன்மையில் ஒன்றிணைப்பானாக.",
    },
  },

  music: {
    src: "/wedding/music.mp3",
    volume: 0.20,
    videoSrc: "/wedding/video-music.mp3",
    videoVolume: 1,
  },

  /**
   * Guest visit tracking (writes to Vercel Blob).
   * Guestbook memories are separate and always stay on.
   * Set enabled to false to pause analytics and save Blob quota.
   */
  analytics: {
    enabled: false,
  },

  ceremoniesSection: {
    eyebrow: { en: "The blessed day", ta: "அருள்மிகு நாள்" },
    title: { en: "Nikkah Ceremony", ta: "நிக்காஹ் நிகழ்ச்சி" },
    subtitle: {
      en: "Both families welcome you with love and duas.",
      ta: "இருவீட்டாரும் அன்புடனும் துஆவுடனும் உங்களை வரவேற்கிறோம்.",
    },
    directions: { en: "Get directions", ta: "வழிகாட்டி" },
  },

  ceremonies: [
    {
      id: "nikkah",
      title: { en: "Nikkah", ta: "நிக்காஹ்" },
      date: {
        en: "Sunday, 27 December 2026",
        ta: "27.12.2026 ஞாயிற்றுக்கிழமை",
      },
      time: {
        en: "10:30 AM – 12:00 PM",
        ta: "காலை 10.30 முதல் 12.00 மணி வரை",
      },
      venue: {
        en: "43, Hameempuram South Street",
        ta: "43, ஹமீம்புரம் தெற்கு தெரு",
      },
      city: {
        en: "Melapalayam, Tirunelveli – 627005",
        ta: "மேலப்பாளையம், திருநெல்வேலி – 627005",
      },
      mapsQuery: "43, Hameempuram South Street, Melapalayam, Tirunelveli 627005",
    },
  ],

  rsvp: {
    question: {
      en: "Who will get emotional first?",
      ta: "யார் முதலில் உணர்ச்சிவசப்படுவார்கள்?",
    },
    options: [
      { id: "groom", label: { en: "Saleem", ta: "சலீம்" } },
      { id: "bride", label: { en: "Barakkath", ta: "பரக்கத்" } },
      { id: "both", label: { en: "Both, definitely", ta: "இருவரும் நிச்சயம்" } },
    ],
    moods: [
      { id: "food", label: { en: "The food 🍛", ta: "உணவு 🍛" } },
      { id: "family", label: { en: "Time with family 🤍", ta: "குடும்பத்துடன் நேரம் 🤍" } },
      { id: "dua", label: { en: "The duas 🤲", ta: "துஆக்கள் 🤲" } },
      { id: "all", label: { en: "All of it ✨", ta: "அனைத்தும் ✨" } },
    ],
  },

  footerCredit: {
    label: {
      en: "Made with love for",
      ta: "அன்புடன் உருவாக்கப்பட்டது",
    },
  },

  footer: {
    src: "/gallery/footer.jpeg",
    width: 4160,
    height: 2773,
  },
};

export default weddingConfig;
