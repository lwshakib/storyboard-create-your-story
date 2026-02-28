export interface StorysetIllustration {
  /** The full filename in the public/storyset directory */
  filename: string
  /** The conceptual title of the illustration */
  title: string
  /** The style of the storyset illustration (e.g. amico, bro, etc.) */
  style: "amico" | "bro" | "cuate" | "pana" | "rafiki" | string
  /** A description of what is shown in the image to help the AI understand without seeing it */
  description: string
  /** The most prominent hex colors found in the SVG file */
  colors: string[]
}

export const STORYSET_REGISTRY: StorysetIllustration[] = [
  {
    filename: "At the office-amico.svg",
    title: "At the office",
    style: "amico",
    description:
      "Illustration of people working in an office setting, collaborating or sitting at desks.",
    colors: ["#ba68c8", "#455a64", "#263238", "#e0e0e0", "#37474f"],
  },
  {
    filename: "At the office-bro.svg",
    title: "At the office",
    style: "bro",
    description:
      "Illustration of people working in an office setting, collaborating or sitting at desks.",
    colors: ["#263238", "#fff", "#92e3a9"],
  },
  {
    filename: "Business decisions-bro.svg",
    title: "Business decisions",
    style: "bro",
    description:
      "Illustration of business people making important decisions or discussing strategy.",
    colors: ["#263238", "#fff", "#92e3a9", "#858585", "#757575"],
  },
  {
    filename: "Business Plan-bro.svg",
    title: "Business Plan",
    style: "bro",
    description:
      "Illustration depicting the process of business planning, strategy creation, or startup visualization.",
    colors: ["#263238", "#fff", "#92e3a9"],
  },
  {
    filename: "Business Plan-cuate.svg",
    title: "Business Plan",
    style: "cuate",
    description:
      "Illustration depicting the process of business planning, strategy creation, or startup visualization.",
    colors: ["#263238", "#c7c7c7", "#455a64", "#ffc727", "#ebebeb"],
  },
  {
    filename: "Data report-amico.svg",
    title: "Data report",
    style: "amico",
    description:
      "Illustration of people analyzing data reports, statistics, charts, and business metrics.",
    colors: ["#ba68c8", "#fff", "#263238", "#37474f", "#455a64"],
  },
  {
    filename: "Data report-pana.svg",
    title: "Data report",
    style: "pana",
    description:
      "Illustration of people analyzing data reports, statistics, charts, and business metrics.",
    colors: ["#263238", "#ff725e", "#455a64", "#fff", "#b78876"],
  },
  {
    filename: "Good team-bro.svg",
    title: "Good team",
    style: "bro",
    description:
      "Illustration showing a positive, collaborative team environment and good teamwork.",
    colors: ["#263238", "#fff", "#92e3a9", "#999", "#a8adaf"],
  },
  {
    filename: "Innovation-amico.svg",
    title: "Innovation",
    style: "amico",
    description:
      "Illustration representing new ideas, creative thinking, problem-solving, and technological innovation.",
    colors: ["#ba68c8", "#fff", "#37474f", "#455a64", "#263238"],
  },
  {
    filename: "Innovation-bro.svg",
    title: "Innovation",
    style: "bro",
    description:
      "Illustration representing new ideas, creative thinking, problem-solving, and technological innovation.",
    colors: ["#263238", "#fff", "#92e3a9"],
  },
  {
    filename: "Innovation-pana.svg",
    title: "Innovation",
    style: "pana",
    description:
      "Illustration representing new ideas, creative thinking, problem-solving, and technological innovation.",
    colors: ["#263238", "#ff725e", "#fff", "#eb996e", "#ffbe9d"],
  },
  {
    filename: "Learning-bro.svg",
    title: "Learning",
    style: "bro",
    description:
      "Illustration showing students or people studying, learning new skills, or taking online courses.",
    colors: ["#263238", "#fff", "#92e3a9"],
  },
  {
    filename: "Learning-cuate.svg",
    title: "Learning",
    style: "cuate",
    description:
      "Illustration showing students or people studying, learning new skills, or taking online courses.",
    colors: ["#37474f", "#fff", "#263238", "#ffc727", "#455a64"],
  },
  {
    filename: "Learning-pana.svg",
    title: "Learning",
    style: "pana",
    description:
      "Illustration showing students or people studying, learning new skills, or taking online courses.",
    colors: ["#263238", "#ff725e", "#455a64", "#eb996e", "#fff"],
  },
  {
    filename: "Learning-rafiki.svg",
    title: "Learning",
    style: "rafiki",
    description:
      "Illustration showing students or people studying, learning new skills, or taking online courses.",
    colors: ["#fff", "#263238", "#407bff", "#ffb573", "#f5f5f5"],
  },
  {
    filename: "Light bulb-bro.svg",
    title: "Light bulb",
    style: "bro",
    description:
      "Illustration featuring a glowing light bulb, symbolizing a bright idea, inspiration, or intelligent solution.",
    colors: ["#fff", "#263238", "#bfbfbf", "#92e3a9", "#999"],
  },
  {
    filename: "Mathematics-bro.svg",
    title: "Mathematics",
    style: "bro",
    description:
      "Illustration related to math, calculations, equations, or educational STEM subjects.",
    colors: ["#263238", "#fff", "#858585", "#92e3a9", "#707070"],
  },
  {
    filename: "Mathematics-cuate.svg",
    title: "Mathematics",
    style: "cuate",
    description:
      "Illustration related to math, calculations, equations, or educational STEM subjects.",
    colors: ["#fff", "#263238", "#ffc727", "#f7a9a0", "#455a64"],
  },
  {
    filename: "Meeting-bro.svg",
    title: "Meeting",
    style: "bro",
    description:
      "Illustration of a professional meeting, group discussion, or corporate presentation.",
    colors: ["#263238", "#fff", "#92e3a9"],
  },
  {
    filename: "Mental health-amico.svg",
    title: "Mental health",
    style: "amico",
    description:
      "Illustration depicting mental health awareness, psychological wellbeing, counseling, or therapy.",
    colors: ["#ba68c8", "#fff", "#455a64", "#263238", "#37474f"],
  },
  {
    filename: "Mobile login-pana.svg",
    title: "Mobile login",
    style: "pana",
    description:
      "Illustration of a person logging into an account on a mobile smartphone application.",
    colors: ["#263238", "#ff725e", "#fff", "#455a64", "#e0e0e0"],
  },
  {
    filename: "Mobile Marketing-bro.svg",
    title: "Mobile Marketing",
    style: "bro",
    description:
      "Illustration representing mobile marketing, social media campaigns, and digital advertising on smartphones.",
    colors: ["#263238", "#fff", "#92e3a9", "#d6d6d6"],
  },
  {
    filename: "Mobile Marketing-pana.svg",
    title: "Mobile Marketing",
    style: "pana",
    description:
      "Illustration representing mobile marketing, social media campaigns, and digital advertising on smartphones.",
    colors: ["#263238", "#ff725e", "#fff", "#455a64", "#eb996e"],
  },
  {
    filename: "Online world-cuate.svg",
    title: "Online world",
    style: "cuate",
    description:
      "Illustration symbolizing the internet, global online connectivity, or navigating the digital world.",
    colors: ["#263238", "#37474f", "#ebebeb", "#fff", "#ffc727"],
  },
  {
    filename: "Questions-bro.svg",
    title: "Questions",
    style: "bro",
    description:
      "Illustration of someone with question marks, seeking answers, thinking, or dealing with an FAQ section.",
    colors: ["#263238", "#fff", "#7d7d7d", "#9c9c9c", "#92e3a9"],
  },
  {
    filename: "Questions-rafiki.svg",
    title: "Questions",
    style: "rafiki",
    description:
      "Illustration of someone with question marks, seeking answers, thinking, or dealing with an FAQ section.",
    colors: ["#263238", "#ffc3bd", "#407bff", "#e0e0e0", "#f5f5f5"],
  },
  {
    filename: "Scrum board-amico.svg",
    title: "Scrum board",
    style: "amico",
    description:
      "Illustration of people using a scrum board or kanban board with sticky notes for agile project management.",
    colors: ["#455a64", "#ba68c8", "#fff", "#f28f8f", "#fafafa"],
  },
  {
    filename: "Scrum board-pana.svg",
    title: "Scrum board",
    style: "pana",
    description:
      "Illustration of people using a scrum board or kanban board with sticky notes for agile project management.",
    colors: ["#fff", "#263238", "#ff725e", "#455a64", "#fafafa"],
  },
  {
    filename: "Stress-amico.svg",
    title: "Stress",
    style: "amico",
    description:
      "Illustration showing a person experiencing stress, anxiety, burnout, or overwhelming work pressure.",
    colors: ["#ba68c8", "#455a64", "#263238", "#e0e0e0", "#fafafa"],
  },
  {
    filename: "Stress-bro.svg",
    title: "Stress",
    style: "bro",
    description:
      "Illustration showing a person experiencing stress, anxiety, burnout, or overwhelming work pressure.",
    colors: ["#263238", "#fff", "#6e6e6e", "#92e3a9", "#525252"],
  },
  {
    filename: "Take Away-pana.svg",
    title: "Take Away",
    style: "pana",
    description:
      "Illustration related to ordering food delivery, fast food takeout, or grabbing a cup of coffee.",
    colors: ["#263238", "#f5f5f5", "#ff725e", "#fff", "#455a64"],
  },
  {
    filename: "Teaching-amico.svg",
    title: "Teaching",
    style: "amico",
    description:
      "Illustration of a teacher, speaker, or instructor presenting information, teaching a class, or giving a lecture.",
    colors: ["#fff", "#ba68c8", "#263238", "#37474f", "#455a64"],
  },
  {
    filename: "Team goals-bro.svg",
    title: "Team goals",
    style: "bro",
    description:
      "Illustration depicting a team aiming for success and working together towards shared business goals.",
    colors: ["#263238", "#fff", "#92e3a9"],
  },
  {
    filename: "Team goals-pana.svg",
    title: "Team goals",
    style: "pana",
    description:
      "Illustration depicting a team aiming for success and working together towards shared business goals.",
    colors: ["#263238", "#455a64", "#ff725e", "#fff", "#ffb394"],
  },
  {
    filename: "Team goals-rafiki.svg",
    title: "Team goals",
    style: "rafiki",
    description:
      "Illustration depicting a team aiming for success and working together towards shared business goals.",
    colors: ["#263238", "#407bff", "#fff", "#ebb376", "#9f5b53"],
  },
  {
    filename: "Team work-cuate.svg",
    title: "Team work",
    style: "cuate",
    description:
      "Illustration depicting people working efficiently as a team, highlighting collaboration and mutual effort.",
    colors: ["#263238", "#ffc727", "#37474f", "#dd6a57", "#fff"],
  },
  {
    filename: "Telecommuting-rafiki.svg",
    title: "Telecommuting",
    style: "rafiki",
    description:
      "Illustration of a person telecommuting, managing remote work, or interacting online from home.",
    colors: ["#263238", "#407bff", "#fff", "#b55b52", "#ffc3bd"],
  },
  {
    filename: "Thinking face-bro.svg",
    title: "Thinking face",
    style: "bro",
    description:
      "Illustration of a person with a thoughtful expression, pondering, deciding, or brainstorming.",
    colors: ["#263238", "#fff", "#92e3a9"],
  },
  {
    filename: "Time management-amico.svg",
    title: "Time management",
    style: "amico",
    description:
      "Illustration about managing time, showing schedules, clocks, and deadlines for efficient productivity.",
    colors: ["#ba68c8", "#e0e0e0", "#455a64", "#263238", "#f5f5f5"],
  },
  {
    filename: "Time management-bro.svg",
    title: "Time management",
    style: "bro",
    description:
      "Illustration about managing time, showing schedules, clocks, and deadlines for efficient productivity.",
    colors: ["#263238", "#fff", "#92e3a9"],
  },
  {
    filename: "Time management-pana.svg",
    title: "Time management",
    style: "pana",
    description:
      "Illustration about managing time, showing schedules, clocks, and deadlines for efficient productivity.",
    colors: ["#263238", "#455a64", "#ff725e", "#fafafa", "#fff"],
  },
]
