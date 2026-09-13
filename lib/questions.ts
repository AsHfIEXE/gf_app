export type QuestionType = "text" | "textarea" | "select" | "scale";

export type Question = {
  id: string;
  number: number;
  section: string;
  title: string;
  hint?: string;
  type: QuestionType;
  required?: boolean;
  options?: string[];
  lowLabel?: string;
  highLabel?: string;
};

export const sections = [
  { id: "basic", label: "BASIC FILE", short: "FILE" },
  { id: "personality", label: "PERSONALITY", short: "PERSONALITY" },
  { id: "emotional", label: "EMOTIONAL INTELLIGENCE", short: "EMOTIONAL" },
  { id: "relationship", label: "RELATIONSHIP", short: "RELATIONSHIP" },
  { id: "you-and-me", label: "YOU & ME", short: "YOU & ME" },
  { id: "compatibility", label: "COMPATIBILITY", short: "FIT" },
  { id: "randomness", label: "RANDOMNESS", short: "RANDOM" },
  { id: "dangerous", label: "THE QUESTIONS I ACTUALLY CARE ABOUT", short: "REAL" },
  { id: "final", label: "FINAL TEST", short: "FINAL" },
] as const;

const choice = (id: string, number: number, section: string, title: string, options: string[], required = false): Question => ({
  id, number, section, title, type: "select", options, required,
});

const text = (id: string, number: number, section: string, title: string, hint?: string, required = false): Question => ({
  id, number, section, title, hint, type: "text", required,
});

const long = (id: string, number: number, section: string, title: string, hint?: string, required = false): Question => ({
  id, number, section, title, hint, type: "textarea", required,
});

const scale = (id: string, number: number, section: string, title: string, lowLabel: string, highLabel: string): Question => ({
  id, number, section, title, type: "scale", lowLabel, highLabel,
});

export const questions: Question[] = [
  text("age", 1, "basic", "How old are you?", "You must be 18 or over to apply.", true),
  text("nickname", 2, "basic", "What should I call you?", "A nickname, alias, initials—or nothing at all. This is optional."),
  text("pronouns", 3, "basic", "What are your pronouns?", "Optional."),
  text("location", 4, "basic", "Where are you from?", "Country and city/region are plenty. Never enter your address."),
  long("unobserved", 5, "personality", "Who are you when nobody is watching?", "Don't overthink this one."),
  text("threeWords", 6, "personality", "Describe yourself in three words."),
  long("misunderstood", 7, "personality", "What is something people usually misunderstand about you?"),
  long("proud", 8, "personality", "What is something you are secretly proud of?"),
  long("improving", 9, "personality", "What are you currently trying to improve about yourself?"),
  long("hours", 10, "personality", "What could you talk about for hours?"),
  text("laugh", 11, "personality", "What makes you laugh ridiculously easily?"),
  text("weird", 12, "personality", "What is your weirdest harmless trait?"),
  long("care", 13, "personality", "What is one thing you genuinely care about?"),
  choice("upset", 14, "emotional", "When you are upset, what do you usually want?", ["Space", "Someone to listen", "Reassurance", "A distraction", "I don't know", "It depends"]),
  choice("conflict", 15, "emotional", "How do you normally deal with conflict?", ["Talk immediately", "Need time first", "Avoid confrontation", "Write instead of talking", "It depends"]),
  long("loyalty", 16, "emotional", "What does loyalty mean to you?"),
  long("cannotTolerate", 17, "emotional", "What can you not tolerate in a relationship?"),
  long("communication", 18, "emotional", "What do people underestimate about communication?"),
  long("showCare", 19, "emotional", "When you care about someone, how do you show it?"),
  long("appreciated", 20, "emotional", "What makes you feel genuinely appreciated?"),
  choice("lookingFor", 21, "relationship", "What are you actually looking for?", ["A serious relationship", "Something that could become serious", "Getting to know someone", "Friendship first", "I don't know yet"]),
  long("healthy", 22, "relationship", "What does a healthy relationship look like to you?"),
  text("greenFlag", 23, "relationship", "What is your biggest relationship green flag?"),
  text("redFlag", 24, "relationship", "What is your biggest relationship red flag?"),
  choice("communicationAmount", 25, "relationship", "How much communication do you normally like?", ["Throughout the day", "A few meaningful conversations", "Regular but independent", "Very independent", "It depends on the person"]),
  scale("space", 26, "relationship", "How important is personal space?", "A little", "A lot"),
  long("loseInterest", 27, "relationship", "What would make you lose interest in someone?"),
  long("stay", 28, "relationship", "What would make you stay?", "This one tends to reveal a lot."),
  long("madeApply", 29, "you-and-me", "What made you apply?", "There are no bonus points for sounding impressive.", true),
  long("likeAboutMe", 30, "you-and-me", "What do you think you would like about me?"),
  long("annoyAboutMe", 31, "you-and-me", "What do you think might annoy you about me?", "Idealization is overrated."),
  long("dayTogether", 32, "you-and-me", "If we had an entire day together with no plans, what would you want to do?"),
  long("twoAm", 33, "you-and-me", "What kind of conversation would you want to have with me at 2 AM?"),
  long("earlyUnderstand", 34, "you-and-me", "What would you want me to understand about you early on?"),
  long("hoping", 35, "you-and-me", "What are you hoping happens after submitting this application?"),
  scale("social", 36, "compatibility", "Where do you fall socially?", "Introvert", "Extrovert"),
  scale("planning", 37, "compatibility", "How do you prefer to live?", "Planned", "Spontaneous"),
  scale("conversationStyle", 38, "compatibility", "What kind of conversation wins?", "Serious", "Stupid"),
  scale("outings", 39, "compatibility", "What is your default?", "Staying in", "Going out"),
  scale("contactMode", 40, "compatibility", "How do you naturally connect?", "Texting", "Calling"),
  scale("togetherness", 41, "compatibility", "What feels better?", "Quiet company", "Constant conversation"),
  scale("humor", 42, "compatibility", "How important is humor?", "Not a priority", "Essential"),
  scale("ambition", 43, "compatibility", "How important is ambition?", "Not a priority", "Essential"),
  scale("openness", 44, "compatibility", "How important is emotional openness?", "Not a priority", "Essential"),
  text("comfortFood", 45, "randomness", "What is your comfort food?"),
  text("song", 46, "randomness", "What is a song you never get tired of?"),
  text("character", 47, "randomness", "What fictional character do you relate to?"),
  text("lateNight", 48, "randomness", "What is your ideal late-night activity?"),
  text("uselessFact", 49, "randomness", "What is one completely useless fact about you?"),
  text("weather", 50, "randomness", "If your personality were a weather condition, what would it be?"),
  text("warning", 51, "randomness", "What would your warning label say?", "Example: WARNING: May disappear into thoughts for several hours."),
  long("unexplained", 52, "dangerous", "What do you wish someone understood about you without you having to explain it?"),
  long("hiddenSelf", 53, "dangerous", "What version of yourself almost nobody gets to see?"),
  long("afraidLose", 54, "dangerous", "What are you afraid of losing?"),
  long("bestSelf", 55, "dangerous", "What kind of person brings out the best version of you?"),
  long("worstSelf", 56, "dangerous", "What kind of person brings out the worst version of you?"),
  long("lesson", 57, "dangerous", "What have you learned from a past relationship—or from never having one?"),
  long("real", 58, "final", "Tell me something real.", "Forget what you think I want to hear. No character minimum.", true),
  long("oneSentence", 59, "final", "If I remember only one sentence from your entire application, what should it be?"),
  long("unexpected", 60, "final", "Leave me a message that I will not expect.", "Optional."),
];

export const visibleAnswer = (value?: string) => value?.trim() || "—";
