import coupleNight from "@/assets/couple-night.jpg";
import coupleChai from "@/assets/couple-chai.jpg";
import sceneBeginning from "@/assets/scene-beginning.jpg";
import sceneApart from "@/assets/scene-apart.jpg";
import sceneFriends from "@/assets/scene-friends.jpg";
import sceneLove from "@/assets/scene-love.jpg";
import sceneFuture from "@/assets/scene-future.jpg";
import sceneChallenges from "@/assets/scene-challenges.jpg";
import tomJerryLove from "@/assets/tom-jerry-love.jpg";
import owGift from "@/assets/only-for-you/gift-ring-rose.jpg";
import owBike from "@/assets/only-for-you/bike-ride.jpg";
import owCandid from "@/assets/only-for-you/candid.jpg";
import owFirstPic from "@/assets/only-for-you/first-pic.jpg";
import owYercaud from "@/assets/only-for-you/yercaud.jpg";
import owFav1 from "@/assets/only-for-you/fav-1.jpg";
import owFav2 from "@/assets/only-for-you/fav-2.jpg";
import owFav3 from "@/assets/only-for-you/fav-3.jpg";
import owFav4 from "@/assets/only-for-you/fav-4.jpg";
import owFav5 from "@/assets/only-for-you/fav-5.jpg";
import owFav6 from "@/assets/only-for-you/fav-6.jpg";
import owFav7 from "@/assets/only-for-you/fav-7.jpg";
import owFav8 from "@/assets/only-for-you/fav-8.jpg";
import owFav9 from "@/assets/only-for-you/fav-9.jpg";
import owBday1 from "@/assets/only-for-you/bday-1.jpg";
import owBday2 from "@/assets/only-for-you/bday-2.jpg";
import owBday3 from "@/assets/only-for-you/bday-3.jpg";
import owBday4 from "@/assets/only-for-you/bday-4.jpg";
import owBday5 from "@/assets/only-for-you/bday-5.jpg";
import owBday6 from "@/assets/only-for-you/bday-6.jpg";

/**
 * ============================================================
 *  EDIT EVERYTHING HERE — names, dates, texts, photos, music.
 *  No UI code lives in this file.
 * ============================================================
 */

export const person = {
  name: "Rifa",
  nickname: "Papu",
  /** Birthday used by the countdown + final reveal (local time). */
  birthday: "2026-11-03T00:00:00",
  birthdayDisplay: "03 • 11 • 2026",
  /** Compact label used by the small floating countdown badge. */
  birthdayShort: "03 Nov 2026",
};

/**
 * MUSIC — drop an audio file into /public/audio/ and point to it here.
 *
 *   1. copy your song to  public/audio/our-song.mp3
 *   2. set backgroundMusic to  "/audio/our-song.mp3"
 *
 * mp3 / m4a / ogg all work. The path is relative to /public, so it always
 * starts with "/audio/" and never with "public/".
 *
 * While every entry below is null there is no sound at all and the Music
 * On/Off button stays hidden.
 */
export const audio = {
  backgroundMusic: "/audio/bday.mp3" as string | null,
  /** Optional sound effects, same idea. */
  click: null as string | null,
  unlock: null as string | null,
  celebrate: null as string | null,
};

export const intro = {
  line1: "You are my little world, I made a little world for you...",
  line2: "Some memories are simply beyond words.",
  cta: "Enter Our Little World",
};

export const world = {
  title: "A Universe of You and Me",
  subtitle: "Every second with you feels like a beautiful chapter.",
};

export type MemoryCardData = {
  id: string;
  title: string;
  subtitle: string;
  /** Short reflection shown when a normal card is opened. */
  note?: string;
  /** Longer reflection — each line becomes its own paragraph in the card. */
  body?: string[];
  /** Optional photo for the card modal: put a file in /public/photos/ and set the path. */
  photo?: { src: string | null; caption: string };
  secret?: boolean;
  /** Opens the "Our Little Challenges" experience instead of a modal. */
  challenge?: boolean;
  /** Opens the "Our World, Only For You" photo album instead of a modal. */
  gallery?: boolean;
};

export const memoryCards: MemoryCardData[] = [
  {
    id: "challenges",
    title: "Our Little Challenges",
    subtitle: "Let's see how well you remember us...",
    note: "A few little things I want to know.",
    challenge: true,
    photo: { src: sceneChallenges, caption: "our little game" },
  },
  {
    id: "future",
    title: "Our Tom & Jerry Love Story ❤️",
    subtitle: "This beautiful chaos called love",
    note: "Full of silly fights and endless teasing 🐱🐭",
    body: [
      "Our love story is just like Tom and Jerry — full of silly fights, endless teasing, cute little arguments, and a love that hides behind all the chaos.",
      "Sometimes we annoy each other, sometimes we fight over the smallest things, and sometimes our egos make it hard to say sorry. But no matter how much we argue, we always find our way back to each other.",
      "Just like Tom chases Jerry, I will keep chasing your smile, your attention, and those little moments that make my heart happy.",
      "We may not always agree, and our love may not be perfect, but there is something so special about the way we laugh together, tease each other, and turn ordinary moments into beautiful memories.",
      "Beneath every fight is a little care,\nbehind every tease is affection,\nand inside every silly argument is a heart that never wants to lose the other.",
      "Maybe we are a little crazy, a little stubborn, and a little impossible sometimes, but that is what makes our story uniquely ours.",
      "You are my favourite troublemaker,\nmy sweetest headache,\nand my forever partner in this beautiful chaos called love.",
      "No matter how many times we fight, I hope we always choose each other, because even in our most Tom-and-Jerry moments, you will always be my favourite person. 🤍🐱🐭✨",
    ],
    photo: { src: tomJerryLove, caption: "our beautiful chaos" },
  },
  {
    id: "only-for-you",
    title: "Our World, Only For You",
    subtitle: "A little corner locked just for you",
    note: "Only you were meant to open this.",
    secret: true,
    gallery: true,
  },
];

/**
 * ============================================================
 *  OUR WORLD, ONLY FOR YOU — the photo album behind the PIN.
 *  Photos live in src/assets/only-for-you/ (originals in /salath).
 *  Every heading, line and caption below is editable.
 * ============================================================
 */
export type GalleryPhoto = { src: string; caption: string };

export type GalleryMoment = {
  id: string;
  title: string;
  /** Small handwritten line under the heading. */
  note: string;
  lines: string[];
  photos: GalleryPhoto[];
  /** "single" = one big polaroid beside the words, "collage" = a scrapbook wall. */
  layout: "single" | "collage";
  /** Collage only: show the first photo big and wide above the rest. */
  featureFirst?: boolean;
};

export const ourWorld = {
  eyebrow: "a little corner locked just for you",
  title: "Our World,",
  /** Second line of the heading, in shimmering gold-and-rose italics. */
  titleAccent: "Only For You",
  note: "Only you were meant to open this.",
  /** The five polaroids fanned across the top — the middle one sits in front. */
  heroPhotos: [owGift, owBike, owFirstPic, owCandid, owYercaud],
  intro: "Every picture here is a heartbeat I saved for later.\nScroll slowly, Papu — this is us.",
  outro: {
    lines: [
      "These are only the first pages of our album.",
      "There are so many more pictures we haven't taken yet —\nand I want to be in every single one of them with you.",
    ],
    signature: "Always yours ❤",
    back: "Back to our world",
  },
};

export const galleryMoments: GalleryMoment[] = [
  {
    id: "gift",
    title: "My First Gift For You, Rifa \u{1F618} Ring & Rose ❤️",
    note: "the first of many promises \u{1F48D}\u{1F339}",
    lines: [
      "A little ring and a red rose — my very first gift to you.",
      "The ring was a promise I was too shy to say out loud.\nThe rose was everything I felt but couldn’t put into words.",
    ],
    photos: [{ src: owGift, caption: "ring & rose ❤️" }],
    layout: "single",
  },
  {
    id: "bike",
    title: "Our First Bike Ride \u{1F618}",
    note: "my favourite passenger, forever",
    lines: [
      "Wind in our faces, you holding on tight, and the whole road feeling like it belonged to just us two.",
      "I don’t remember where we were going.\nI only remember not wanting it to end.",
    ],
    photos: [{ src: owBike, caption: "just us & the road" }],
    layout: "single",
  },
  {
    id: "candid",
    title: "Our First Candid Pic \u{1FAE3}\u{1F380}",
    note: "caught you being cute",
    lines: [
      "You didn’t know I was looking.\nI couldn’t look anywhere else.",
      "The most beautiful moments are always the ones nobody planned.",
    ],
    photos: [{ src: owCandid, caption: "unplanned & perfect \u{1FAE3}" }],
    layout: "single",
  },
  {
    id: "first-pic",
    title: "Our First Pic Together \u{1F618}",
    note: "where our album began \u{1F4F8}",
    lines: [
      "The first frame with both of us in it — the day “you” and “me” quietly became “us”.",
      "I’ve looked at this picture more times than I will ever admit.",
    ],
    photos: [{ src: owFirstPic, caption: "you & me, frame one" }],
    layout: "single",
  },
  {
    id: "yercaud",
    title: "Our First Yercaud Date ❤️",
    note: "above the clouds with you ☁️",
    lines: [
      "Cold hills, warm hearts, and clouds drifting past like they were giving us a little privacy.",
      "Our very first date — and I already knew I wanted a lifetime of journeys with you.",
    ],
    photos: [{ src: owYercaud, caption: "Yercaud ❤️" }],
    layout: "single",
  },
  {
    id: "fav",
    title: "Our Fav Pics \u{1F49E}",
    note: "my favourite gallery in the world",
    lines: [
      "No reason. No occasion. Just us — being silly, being soft, being completely ourselves.",
      "These are the ones I open whenever I miss you.",
    ],
    photos: [
      { src: owFav1, caption: "us ❤️" },
      { src: owFav2, caption: "my favourite smile" },
      { src: owFav3, caption: "silly us \u{1F92D}" },
      { src: owFav4, caption: "this one \u{1F60D}" },
      { src: owFav5, caption: "my heart" },
      { src: owFav6, caption: "always you" },
      { src: owFav7, caption: "our little moments" },
      { src: owFav8, caption: "forever like this" },
      { src: owFav9, caption: "my safe place" },
    ],
    layout: "collage",
  },
  {
    id: "bday",
    title: "Surprise Birthday \u{1FAE3}\u{1F380}",
    note: "I’m always with you \u{1F30D}\u{1F49D}",
    lines: [
      "You thought it was just another day.\nI had been secretly planning it for weeks.",
      "The look on your face was worth every secret I had to keep.",
    ],
    photos: [
      { src: owBday1, caption: "Happy Bday Rifa Papu \u{1F30D}\u{1F49D} I’m always with you \u{1F618}" },
      { src: owBday2, caption: "you will never forget this iPhone gift \u{1F923}" },
      { src: owBday3, caption: "surprise! \u{1F380}" },
      { src: owBday4, caption: "that smile \u{1FAE3}" },
      { src: owBday5, caption: "my birthday girl" },
      { src: owBday6, caption: "our little world \u{1F30D}" },
    ],
    layout: "collage",
    featureFirst: true,
  },
];

/**
 * ============================================================
 *  OUR LITTLE CHALLENGES — fully editable.
 *  Add / remove / reword anything below.
 * ============================================================
 */
export const challengeIntro = {
  title: "Our Little Challenges \u2764\uFE0F",
  subtitle: "A few little things I’m curious about…\nHow much of our story do you still remember?",
  cta: "Start",
};

/**
 * Offered only after a wrong answer, so she is never stuck on a challenge.
 * Skipping still counts as "not on the first try" in the heart score.
 */
export const challengeSkip = "Skip this one";

export type ChallengeStep =
  | {
      kind: "text";
      label: string;
      question: string;
      answers: string[];
      correct: string;
      wrong: string;
      /** Big animated word shown after a correct answer. */
      reveal?: string;
      /** Small lines shown under the reveal. */
      revealLines?: string[];
      /** Optional photo shown after the reveal (replace src with your own). */
      photo?: { src: string | null; caption: string };
      memory?: string;
    }
  | {
      kind: "photo";
      label: string;
      question: string;
      options: { src: string | null; caption: string }[];
      correctIndex: number;
      correct: string;
      wrong: string;
      memory: string;
    }
  | {
      kind: "choice";
      label: string;
      question: string;
      options: string[];
      correctIndex: number;
      correct: string;
      wrong: string;
      reveal: string;
      revealLines: string[];
    }
  | {
      kind: "final";
      label: string;
      question: string;
      cta: string;
    };

export const challenges: ChallengeStep[] = [
  {
    kind: "text",
    label: "Challenge 01",
    question: "Where did our story begin?",
    answers: ["deja vu hotel", "deja vu", "dejavu", "dejavu hotel"],
    correct: "You remembered. \u2764\uFE0F",
    wrong: "Hmm... think again, Papu \u2764\uFE0F",
    reveal: "06.01.2019",
    revealLines: ["Every story has a beginning...", "Deja Vu Hotel"],
    photo: { src: sceneBeginning, caption: "Deja Vu Hotel" },
  },
  {
    kind: "photo",
    label: "Challenge 02",
    question: "Which one takes you back to our beginning?",
    options: [
      { src: sceneBeginning, caption: "Deja Vu Hotel" },
      { src: coupleChai, caption: "College days" },
      { src: sceneFriends, caption: "Friends again" },
      { src: sceneLove, caption: "Love" },
    ],
    correctIndex: 0,
    correct: "That's the one. \u2764\uFE0F",
    wrong: "Almost... look a little closer. \u{1F98B}",
    memory: "This is the frame my whole story starts from.",
  },
  {
    kind: "text",
    label: "Challenge 03",
    question: "What is the name I call you?",
    answers: ["papu"],
    correct: "Of course you remembered. \u2764\uFE0F",
    wrong: "Hmm... think again, Papu \u2764\uFE0F",
    reveal: "PAPU",
    revealLines: ["My favourite name for my favourite person."],
  },
  {
    kind: "text",
    label: "Challenge 04",
    question: "Complete this memory...\n\u201CI first met you at ______.\u201D",
    answers: ["deja vu hotel", "deja vu", "dejavu", "dejavu hotel"],
    correct: "You remembered. \u2764\uFE0F",
    wrong: "Hmm... think again, Papu \u2764\uFE0F",
    reveal: "DEJA VU HOTEL \u2764\uFE0F",
    memory: "One hello there, and everything after it belonged to you.",
  },
  {
    kind: "choice",
    label: "Challenge 05",
    question: "At some point, something changed...",
    options: ["Just Friends", "Something More \u2764\uFE0F"],
    correctIndex: 1,
    correct: "That's exactly it. \u2764\uFE0F",
    wrong: "Almost... look a little closer. \u{1F98B}",
    reveal: "LOVE",
    revealLines: ["Somewhere along the way, friendship became something more."],
  },
  {
    kind: "final",
    label: "Final Challenge",
    question: "One last thing...\nHold the heart until it glows.",
    cta: "Hold me \u2764",
  },
];

export const challengeOutro = {
  title: "You did it \u2764\uFE0F",
  lines: ["You remembered the little things.", "But there is still one thing waiting for you..."],
  cta: "One Last Surprise \u{1F381}",
  back: "Back to our world",
};

/**
 * What she sees AFTER the last challenge is answered \u2014 the little result world.
 * Every line here is editable.
 */
export const challengeResult = {
  /** Shown while her answers are being kept. */
  sealing: {
    eyebrow: "keeping your answers safe",
    line: "sealing them into our world\u2026",
  },
  /** The animated heart score (how many she got right on the very first try). */
  score: {
    eyebrow: "your heart score",
    unit: "remembered on the first try",
  },
  /** Highest matching tier wins. `min` = first-try answers needed. */
  tiers: [
    {
      min: 6,
      title: "You remembered everything \u2764\uFE0F",
      line: "Every single little thing. I knew your heart would.",
    },
    {
      min: 4,
      title: "Your heart remembers us \u2764\uFE0F",
      line: "The ones that matter most never left you.",
    },
    {
      min: 2,
      title: "You still found your way \u{1F98B}",
      line: "You took a moment \u2014 and still came back to us.",
    },
    {
      min: 0,
      title: "And you stayed till the end \u2764\uFE0F",
      line: "That is the only answer I ever really needed.",
    },
  ],
  /** The recap of everything she just answered. */
  recap: {
    eyebrow: "what you remembered",
    firstTry: "first try \u2764\uFE0F",
    gotThere: "you got there \u{1F98B}",
    heldAnswer: "You held the heart until it glowed \u2764\uFE0F",
  },
  /** The little gift she taps to unwrap the ending. */
  gift: {
    eyebrow: "one thing left",
    hint: "tap the gift",
    opening: "unwrapping\u2026",
  },
};


/**
 * PIN that unlocks ONLY the secret card. Never rendered in the UI.
 * The keypad, the dots and the auto-submit all read its length, so changing
 * the number here is all that is needed.
 */
export const secretPin = "6051";

export const secretDoor = {
  line: "Some memories deserve their own key.",
  cta: "Enter the secret",
  wrongPin: `Not quite... try again, ${person.nickname} \u2764`,
  /**
   * Shown from the third wrong try onward \u2014 playful, and aimed at anyone who
   * is not her. It only changes the message: the keypad never locks, so a
   * fumbled number can't shut her out of her own door.
   */
  lockedPin: "Don\u2019t even try \u{1F612} Salath locked this one.",
  /** Wrong tries allowed before the teasing message takes over. */
  triesBeforeTease: 3,
};

export const prologue = {
  date: "06.01.2019",
  line: "Every story has a beginning...",
  cta: "Remember",
};

/**
 * PHOTOS — replace `src` with your own image.
 * 1. Put the file in /public/photos/  (e.g. /public/photos/college-1.jpg)
 * 2. Set src: "/photos/college-1.jpg"
 * Leave src as null to keep the elegant placeholder frame.
 */
export type Photo = { src: string | null; caption: string; message: string };

/** Optional little question shown before a chapter's content is revealed. */
export type ChapterQuestion = {
  prompt: string;
  /** Accepted answers, case-insensitive. */
  answers: string[];
  correct: string;
  wrong: string;
  /** Set false to skip the question without deleting it. */
  enabled?: boolean;
};

/** A tiny hidden thing she can find inside a chapter. */
export type Discovery = {
  glyph: "heart" | "butterfly" | "star" | "envelope";
  /** Position inside the chapter, in percent. */
  x: number;
  y: number;
  message: string;
};

export type Chapter = {
  id: string;
  kind: "hotel" | "college" | "apart" | "friends" | "love" | "future";
  title: string;
  eyebrow?: string;
  lines: string[];
  memoryQuote?: string;
  photos: Photo[];
  question?: ChapterQuestion;
  discoveries?: Discovery[];
  /** Chapter 5 style slow reveal — the word appears after the lines. */
  revealWord?: string;
};

export const chapters: Chapter[] = [
  {
    id: "hotel",
    kind: "hotel",
    title: "Deja Vu Hotel",
    eyebrow: "06 January 2019",
    lines: ["This is where it began."],
    memoryQuote: "Hi, I'm Shalma. What's your name?",
    question: {
      prompt: "Where did our story begin?",
      answers: ["deja vu", "deja vu hotel", "dejavu", "dejavu hotel"],
      correct: "You remembered. \u2764",
      wrong: "Think again, Papu...",
    },
    discoveries: [
      { glyph: "heart", x: 12, y: 26, message: "I still remember what you were wearing." },
    ],
    photos: [
      {
        src: sceneBeginning,
        caption: "Deja Vu Hotel",
        message: "The place where a single question quietly rewrote my life.",
      },
    ],
  },
  {
    id: "college",
    kind: "college",
    title: "College Days",
    eyebrow: "Those beautiful days",
    lines: [
      "Then came the days that became memories.",
      "Those were the days when seeing you slowly became part of my routine.",
    ],
    question: {
      prompt: "What do I call you?",
      answers: ["papu"],
      correct: "You remembered. \u2764",
      wrong: "Think again, Papu...",
      enabled: false,
    },
    discoveries: [
      { glyph: "star", x: 86, y: 30, message: "A tiny memory only we would understand." },
    ],
    photos: [
      { src: coupleChai, caption: "Us, back then", message: "You laughed at something silly and I forgot what I was saying." },
      { src: sceneChallenges, caption: "That corner", message: "We spent more time here than in any classroom." },
      { src: sceneBeginning, caption: "Ordinary day", message: "Nothing special happened. I still remember all of it." },
    ],
  },
  {
    id: "apart",
    kind: "apart",
    title: "The Years Apart",
    eyebrow: "Some distance, many lessons",
    lines: [
      "Life took us in different directions for a while.",
      "Some distance changes people.\nSome distance teaches them what matters.",
    ],
    discoveries: [
      { glyph: "butterfly", x: 15, y: 68, message: "If Allah has written our paths to meet again, no distance, no time, and no circumstance can change what He has destined" },
    ],
    photos: [
      { src: sceneApart, caption: "Same moon", message: "Different roads, the same sky above both of us." },
    ],
  },
  {
    id: "friends",
    kind: "friends",
    title: "Friends Again",
    eyebrow: "We found our way back",
    lines: [
      "Years passed. Life changed. Somehow, we found our way back to each other.",
    ],
    discoveries: [
      { glyph: "envelope", x: 84, y: 62, message: "The first message after all those years." },
    ],
    photos: [
      { src: sceneFriends, caption: "Back again", message: "It felt like no time had passed at all." },
      { src: coupleChai, caption: "Late night talks", message: "Hours disappeared and neither of us noticed." },
    ],
  },
  {
    id: "love",
    kind: "love",
    title: "Love",
    eyebrow: "When friendship became something more",
    lines: [
      "And then...",
      "Something changed.",
      "Somewhere between friendship and everything else, you became someone I couldn't imagine losing.",
    ],
    revealWord: "LOVE \u2764",
    discoveries: [
      { glyph: "heart", x: 10, y: 55, message: "The exact moment I knew." },
    ],
    photos: [
      { src: sceneLove, caption: "You & me", message: "My favourite person, in my favourite frame." },
      { src: coupleNight, caption: "That smile", message: "I would build a hundred worlds just to see it again." },
    ],
  },
  {
    id: "future",
    kind: "future",
    title: "The Chapters of Life",
    lines: [
      "Life is never one straight line.\n\nThere will be beautiful seasons and difficult ones. There will be moments when we understand why something happened, and moments when we don't.",
      "Prophet Yusuf (AS) was betrayed, separated from his family, falsely accused, and imprisoned. Yet what looked like the end was only another chapter of Allah's plan. His hardship eventually led him to honor and reunited him with his family.",
      "Prophet Ayyub (AS) also endured great hardship, but he never lost his trust in Allah. In time, Allah removed his suffering.\nQur'an 21:83–84",
      "Their stories remind us that no hardship lasts forever, and no blessing should ever be taken for granted.",
      "So when life becomes difficult, may we have sabr.\nWhen life becomes beautiful, may we have shukr.\nAnd when we cannot understand what comes next, may we have tawakkul.",
      "Because we may not know what tomorrow holds,\n\nbut Allah already knows every chapter.",
      "If our paths are written to continue together, may we stand beside each other not only through the easy days, but through the difficult ones too.",
      "May Allah protect our hearts, guide our steps, bless our lives with barakah, and make every chapter bring us closer to Him.",
      "The seasons will change.\nLife will change.\nWe will change.\n\nBut may our trust in Allah remain.",
      "Whatever chapter comes next,\nmay we face it with faith, patience, gratitude, and love.",
    ],
    revealWord: "INSHAALLAH",
    discoveries: [
      { glyph: "star", x: 88, y: 22, message: "A wish I keep making." },
    ],
    photos: [{ src: sceneFuture, caption: "Someday", message: "A photo we haven't taken yet." }],
  },
];

export const finale = {
  message: `You became a part of my heart\nthat I could never live without Rifa \ud83d\ude18\u2764\ufe0f`,
  name: "RIFA",
  greeting: `Happy Birthday, ${person.nickname} \u2764`,
};

export const letter = {
  teaser: "One last thing...",
  cta: "Enter My Letter World",
  heading: `For you, ${person.nickname} \u2764`,
  /** Write as long a letter as you like — each line becomes a paragraph. */
  body: [
    "My dearest Rifa,",
    "I'm not very good at saying these things out loud, so I built you a whole world instead. Every light, every butterfly, every quiet little corner of it is something I thought about while thinking about you.",
    "Thank you for the years, the silences, the coming back, and for every ordinary day you made feel like something worth remembering.",
    "Whatever the next chapter holds, I hope I get to read it beside you.",
    "Happy birthday, Papu.",
  ],
  signature: "Always yours",
  footer: `Made with \u2764 for ${person.name.split(" ")[0]}`,
  replay: "Replay Our Story",
};
