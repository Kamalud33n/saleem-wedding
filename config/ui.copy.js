/**
 * UI / interface copy (buttons, labels, helper text, a11y).
 * Wedding facts live in wedding.config.js — keep them separate.
 */
const uiCopy = {
  envelope: {
    ariaTap: {
      en: "Tap to reveal wedding invitation",
      ta: "திருமண அழைப்பிதழைத் திறக்க தொடவும்",
    },
  },

  hero: {
    presenting: { en: "Presenting", ta: "அறிமுகம்" },
    ariaStage: {
      en: "Wedding invitation reveal",
      ta: "திருமண அழைப்பிதழ் அறிமுகம்",
    },
    and: { en: "and", ta: "மற்றும்" },
  },

  discover: {
    aria: {
      en: "Discover our wedding date",
      ta: "எங்கள் திருமண நாளைக் கண்டறியுங்கள்",
    },
    eyebrow: { en: "A little secret", ta: "ஒரு சிறு ரகசியம்" },
    title: { en: "Discover Our Day", ta: "எங்கள் நாளைக் கண்டறியுங்கள்" },
    hint: { en: "Uncover each heart.", ta: "ஒவ்வொரு இதயத்தையும் திறவுங்கள்." },
    labelDate: { en: "Date", ta: "தேதி" },
    labelMonth: { en: "Month", ta: "மாதம்" },
    labelYear: { en: "Year", ta: "வருடம்" },
    revealAll: {
      en: "Reveal without scratching",
      ta: "தேயாமல் காட்டுங்கள்",
    },
    revealedPrefix: {
      en: "Wedding date revealed:",
      ta: "திருமண நாள் வெளிப்பட்டது:",
    },
    scratchAria: {
      en: "Scratch to reveal {label}: {value}",
      ta: "{label} காட்ட கீறவும்: {value}",
    },
  },

  countdown: {
    aria: { en: "Wedding countdown", ta: "திருமண எண்ணிக்கை" },
    eyebrowWait: { en: "The wait begins", ta: "காத்திருப்பு தொடங்குகிறது" },
    eyebrowToday: { en: "Today is the day", ta: "இன்றுதான் அந்த நாள்" },
    titleWait: { en: 'Until we say "I do"', ta: "நாங்கள் இணையும் வரை" },
    titleToday: { en: "With love, today", ta: "அன்புடன், இன்று" },
    dayHere: { en: "Our day is here", ta: "எங்கள் நாள் வந்துவிட்டது" },
    days: { en: "Days", ta: "நாட்கள்" },
    hrs: { en: "Hrs", ta: "மணி" },
    min: { en: "Min", ta: "நிமி" },
    sec: { en: "Sec", ta: "வினா" },
    liveCounting: {
      en: "Counting down to the wedding",
      ta: "திருமணத்திற்கான எண்ணிக்கை நடைபெறுகிறது",
    },
    liveArrived: {
      en: "Our wedding day is here",
      ta: "எங்கள் திருமண நாள் வந்துவிட்டது",
    },
    liveRemaining: {
      en: "{days} days, {hours} hours, {minutes} minutes, and {seconds} seconds remaining",
      ta: "{days} நாட்கள், {hours} மணி, {minutes} நிமிடங்கள், {seconds} விநாடிகள் மீதம்",
    },
  },

  cinematic: {
    aria: {
      en: "A cinematic wedding memory",
      ta: "ஒரு சினிமா பாணி திருமண நினைவு",
    },
    alt: {
      en: "Saleem and Barakkath",
      ta: "சலீம் மற்றும் பரக்கத்",
    },
  },

  engagement: {
    aria: { en: "Engagement gallery", ta: "நிச்சயதார்த்தப் படத்தொகுப்பு" },
    photoFallback: {
      en: "Engagement photo {id}",
      ta: "நிச்சயதார்த்தப் படம் {id}",
    },
  },

  rsvp: {
    eyebrow: { en: "Join the celebration", ta: "கொண்டாட்டத்தில் இணையுங்கள்" },
    title: { en: "Celebrate With Us", ta: "எங்களுடன் கொண்டாடுங்கள்" },
    subtitle: {
      en: "A few fun questions before the big day",
      ta: "பெரிய நாளுக்கு முன் சில கேள்விகள்",
    },
    guestDetails: { en: "Guest details", ta: "விருந்தினர் விவரங்கள்" },
    yourName: { en: "Your name", ta: "உங்கள் பெயர்" },
    phone: { en: "Phone number", ta: "தொலைபேசி எண்" },
    comingFor: { en: "I'm coming for…", ta: "நான் வருவது…" },
    submit: { en: "Send Love", ta: "அன்புடன் அனுப்பு" },
    submitting: { en: "Sending your love…", ta: "உங்கள் அன்பு அனுப்பப்படுகிறது…" },
    submitAria: {
      en: "Send RSVP and love to the couple",
      ta: "இரட்டைக்கு RSVP மற்றும் அன்பை அனுப்புங்கள்",
    },
    thanksTitle: { en: "We'll save you a seat", ta: "உங்களுக்காக இடம் காத்திருக்கிறது" },
    thanksBody: {
      en: "Thank you, {name}. Your wishes mean everything to us.",
      ta: "நன்றி, {name}. உங்கள் வாழ்த்துகள் எங்களுக்கு மிகவும் உவப்பானவை.",
    },
    validation: {
      nameRequired: {
        en: "Please enter your name.",
        ta: "உங்கள் பெயரை உள்ளிடவும்.",
      },
      nameShort: {
        en: "Your name should be at least 2 characters.",
        ta: "உங்கள் பெயர் குறைந்தது 2 எழுத்துகள் இருக்க வேண்டும்.",
      },
      nameLong: {
        en: "Your name is a little too long.",
        ta: "உங்கள் பெயர் மிக நீளமாக உள்ளது.",
      },
      phoneRequired: {
        en: "Please enter your phone number.",
        ta: "உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்.",
      },
      phoneShort: {
        en: "Please enter a valid phone number (at least 8 digits).",
        ta: "சரியான தொலைபேசி எண்ணை உள்ளிடவும் (குறைந்தது 8 இலக்கங்கள்).",
      },
      phoneLong: {
        en: "That phone number looks too long.",
        ta: "அந்த தொலைபேசி எண் மிக நீளமாக உள்ளது.",
      },
      invalidChoice: {
        en: "Please choose one of the available options.",
        ta: "கிடைக்கும் விருப்பங்களில் ஒன்றைத் தேர்ந்தெடுக்கவும்.",
      },
      spam: {
        en: "Something went wrong. Please try again.",
        ta: "ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.",
      },
    },
    errors: {
      network: {
        en: "We couldn't reach the server. Please check your connection and try again.",
        ta: "சேவையகத்தை அடைய முடியவில்லை. உங்கள் இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
      },
      sendFailed: {
        en: "We couldn't send your RSVP just now. Please try again in a moment.",
        ta: "உங்கள் RSVP இப்போது அனுப்பப்படவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
      },
      rateLimited: {
        en: "Please wait a moment before sending again.",
        ta: "மீண்டும் அனுப்புவதற்கு முன் சிறிது நேரம் காத்திருக்கவும்.",
      },
      server: {
        en: "Something unexpected happened. Please try again.",
        ta: "எதிர்பாராத பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",
      },
    },
  },

  guestbook: {
    eyebrow: { en: "Words for forever", ta: "நிரந்தரமான சொற்கள்" },
    title: { en: "Leave Us a Note", ta: "ஒரு குறிப்பு எழுதுங்கள்" },
    subtitle: {
      en: "A wish, a memory, or advice for married life",
      ta: "ஒரு வாழ்த்து, நினைவு அல்லது திருமண வாழ்க்கைக்கான அறிவுரை",
    },
    tagWish: { en: "Wish", ta: "வாழ்த்து" },
    tagAdvice: { en: "Advice", ta: "அறிவுரை" },
    placeholderName: { en: "Your name", ta: "உங்கள் பெயர்" },
    placeholderMessage: {
      en: "Share a wish or memory…",
      ta: "ஒரு வாழ்த்து அல்லது நினைவைப் பகிருங்கள்…",
    },
    submit: { en: "Add to the memory book", ta: "நினைவுப் புத்தகத்தில் சேர்" },
    submitting: {
      en: "Adding your memory…",
      ta: "உங்கள் நினைவு சேர்க்கப்படுகிறது…",
    },
    submitAria: {
      en: "Add your wish or advice to the memory book",
      ta: "நினைவுப் புத்தகத்தில் உங்கள் வாழ்த்து அல்லது அறிவுரையைச் சேர்க்கவும்",
    },
    success: {
      en: "Your memory has been added to the book.",
      ta: "உங்கள் நினைவு புத்தகத்தில் சேர்க்கப்பட்டது.",
    },
    empty: {
      en: "No memories yet — be the first to leave a wish.",
      ta: "இன்னும் நினைவுகள் இல்லை — முதல் வாழ்த்தை எழுதுங்கள்.",
    },
    emptyFiltered: {
      en: "No {type} yet — yours could be the first.",
      ta: "இன்னும் {type} இல்லை — உங்களுடையதே முதலாக இருக்கலாம்.",
    },
    loadError: {
      en: "We couldn't load the memory book. Please refresh and try again.",
      ta: "நினைவுப் புத்தகத்தை ஏற்ற முடியவில்லை. புதுப்பித்து மீண்டும் முயற்சிக்கவும்.",
    },
    validation: {
      nameRequired: {
        en: "Please enter your name.",
        ta: "உங்கள் பெயரை உள்ளிடவும்.",
      },
      nameShort: {
        en: "Your name should be at least 2 characters.",
        ta: "உங்கள் பெயர் குறைந்தது 2 எழுத்துகள் இருக்க வேண்டும்.",
      },
      nameLong: {
        en: "Your name is a little too long.",
        ta: "உங்கள் பெயர் மிக நீளமாக உள்ளது.",
      },
      messageRequired: {
        en: "Please write a wish or advice.",
        ta: "ஒரு வாழ்த்து அல்லது அறிவுரையை எழுதுங்கள்.",
      },
      messageShort: {
        en: "Your message is a little short — share a few more words.",
        ta: "உங்கள் செய்தி சிறிது குறுகியது — இன்னும் சில வார்த்தைகள் பகிருங்கள்.",
      },
      messageLong: {
        en: "Your message is a little too long.",
        ta: "உங்கள் செய்தி மிக நீளமாக உள்ளது.",
      },
      typeRequired: {
        en: "Please choose Wish or Advice.",
        ta: "வாழ்த்து அல்லது அறிவுரையைத் தேர்ந்தெடுக்கவும்.",
      },
      typeInvalid: {
        en: "Please choose Wish or Advice.",
        ta: "வாழ்த்து அல்லது அறிவுரையைத் தேர்ந்தெடுக்கவும்.",
      },
      spam: {
        en: "Something went wrong. Please try again.",
        ta: "ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.",
      },
    },
    errors: {
      network: {
        en: "We couldn't reach the server. Please check your connection and try again.",
        ta: "சேவையகத்தை அடைய முடியவில்லை. உங்கள் இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
      },
      saveFailed: {
        en: "We couldn't save your memory just now. Please try again in a moment.",
        ta: "உங்கள் நினைவு இப்போது சேமிக்கப்படவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
      },
      storageUnavailable: {
        en: "The memory book is not available right now. Please try again later.",
        ta: "நினைவுப் புத்தகம் இப்போது கிடைக்கவில்லை. பிறகு மீண்டும் முயற்சிக்கவும்.",
      },
      rateLimited: {
        en: "Please wait a moment before adding another memory.",
        ta: "மற்றொரு நினைவைச் சேர்ப்பதற்கு முன் சிறிது நேரம் காத்திருக்கவும்.",
      },
      server: {
        en: "Something unexpected happened. Please try again.",
        ta: "எதிர்பாராத பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",
      },
    },
  },

  music: {
    play: { en: "Play music", ta: "இசையை இயக்கு" },
    pause: { en: "Pause music", ta: "இசையை நிறுத்து" },
    on: { en: "Music on", ta: "இசை இயக்கத்தில்" },
    off: { en: "Music off", ta: "இசை அணைக்கப்பட்டது" },
    label: { en: "Music", ta: "இசை" },
    unavailable: {
      en: "Music file missing — add public/wedding/music.mp3",
      ta: "இசை கோப்பு இல்லை — public/wedding/music.mp3 சேர்க்கவும்",
    },
  },

  language: {
    group: { en: "Language", ta: "மொழி தேர்வு" },
  },
};

/** Replace `{key}` tokens in a localized template string. */
export function formatCopy(template, vars = {}) {
  if (!template) return "";
  return String(template).replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] != null ? String(vars[key]) : ""
  );
}

export default uiCopy;
