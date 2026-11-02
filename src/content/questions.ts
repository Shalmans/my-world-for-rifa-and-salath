/**
 * ============================================================
 *  THE 13 QUESTIONS — edit freely, order is kept as written.
 * ============================================================
 */

export const questionnaireIntro = {
  eyebrow: "\u2726 Something for you \u2726",
  title: "I want to know the person behind the smile.",
  count: "13 Questions",
  hint: "Don't rush. Write whatever comes to your heart. \u2764\uFE0F",
};

export const questionnaireEnd = {
  eyebrow: "\u2726 You've reached the end \u2726",
  hint: "Take your time. Be honest. \u2764\uFE0F",
  cta: "Submit my answers \u2764\uFE0F",
};

export const questionnaireDone = {
  eyebrow: "\u2726 All done \u2726",
  thanks: "Thank you for telling me a little more about you. \u2764\uFE0F",
  lines: ["Some answers I expected.", "Some I didn't.", "And some... I may never forget."],
  cta: "Continue",
};

export type Question = { id: string; label: string; text: string };

export const questions: Question[] = [
  {
    id: "question_01",
    label: "A memory of us",
    text: "What's one memory of us you'll never forget?",
  },
  {
    id: "question_02",
    label: "Loved without words",
    text: "Have I ever made you feel loved without saying a word?",
  },
  {
    id: "question_03",
    label: "What you'd call me",
    text: "What nickname would you love to call me?",
  },
  {
    id: "question_04",
    label: "A new nickname",
    text: "Give me a new nickname.",
  },
  {
    id: "question_05",
    label: "If your family disagreed",
    text: "If your family disagreed with our love, what would you do?",
  },
  {
    id: "question_06",
    label: "When it gets difficult",
    text: "If our relationship became difficult, would you fight for it or walk away?",
  },
  {
    id: "question_07",
    label: "The real me",
    text: "Do you love the real me or the version of me you imagine?",
  },
  {
    id: "question_08",
    label: "A simple life",
    text: "Would you choose a simple life with me over a luxurious life without me?",
  },
  {
    id: "question_09",
    label: "For my parents",
    text: "What's the first thing you want to do for my parents after marriage?",
  },
  {
    id: "question_10",
    label: "A little jealousy",
    text: "Have you ever been jealous because of another girl?",
  },
  {
    id: "question_11",
    label: "Five reasons",
    text: "Tell me five reasons why you love me.",
  },
  {
    id: "question_12",
    label: "If they insulted me",
    text: "If your family insulted me, how would you react?",
  },
  {
    id: "question_13",
    label: "Your whole world \u2764\uFE0F",
    text: "If you had to choose one person who means the world to you, who would it be?",
  },
];
