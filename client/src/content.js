// Static demo data for feature pages (shows, podcasts, newsletters, team, etc.)
// All content is original placeholder text for this training project.

export const tvShows = [
  { time: "06:00", title: "Asia First" },
  { time: "09:00", title: "Morning Pulse" },
  { time: "12:00", title: "Asia Now" },
  { time: "15:00", title: "Market Watch" },
  { time: "18:00", title: "Singapore Tonight" },
  { time: "20:00", title: "Insight" },
  { time: "21:00", title: "Documentary Hour" },
  { time: "22:00", title: "The World Tonight" },
];

export const radioShows = [
  { time: "06:00 - 09:00", title: "The Morning Report" },
  { time: "09:00 - 12:00", title: "Open for Business" },
  { time: "12:00 - 13:00", title: "Lunchtime News" },
  { time: "13:00 - 16:00", title: "Mind Your Money" },
  { time: "16:00 - 19:00", title: "Drive Time" },
  { time: "19:00 - 21:00", title: "The Wellness Hour" },
  { time: "21:00 - 23:00", title: "CNA938 Rewind" },
];

export const podcasts = [
  { title: "Mind Your Money", host: "Cheryl Goh", desc: "Weekly money and personal finance insights." },
  { title: "The Big Read", host: "CNA TODAY", desc: "A deep dive into the big issues that matter." },
  { title: "Climate Conversations", host: "Jack Board", desc: "Reporting on the environment across Asia." },
  { title: "Work It", host: "Crispina Robert", desc: "Career advice for a changing workplace." },
  { title: "Heart of the Matter", host: "Steven Chia", desc: "Current affairs, explored in depth." },
  { title: "The Explainer", host: "CNA", desc: "Making sense of the day's complex news." },
];

export const newsletters = [
  { id: "morning", name: "Morning Brief", freq: "Daily", desc: "An automated feed of our top stories to start your morning." },
  { id: "week", name: "Week in Review", freq: "Weekly", desc: "The editor's analysis and picks of the week's biggest news." },
  { id: "bigread", name: "CNA TODAY Big Read", freq: "Weekly", desc: "A deep dive into the big issues that matter." },
  { id: "insider", name: "CNA Insider", freq: "Weekly", desc: "Best current affairs and documentaries on issues affecting Asia." },
  { id: "recommended", name: "Recommended Read", freq: "Daily", desc: "One long-form story worth your time, hand-picked." },
];

export const presenters = [
  { name: "Andrea Heng", role: "CNA938 Presenter" },
  { name: "Steven Chia", role: "Senior Presenter" },
  { name: "Otelli Edwards", role: "News Anchor" },
  { name: "Glenda Chong", role: "News Anchor" },
  { name: "Dawn Tan", role: "Business Presenter" },
  { name: "Cheryl Goh", role: "CNA938 Presenter" },
];

export const correspondents = [
  { name: "Afifah Ariffin", beat: "Malaysia" },
  { name: "Tan Si Hui", beat: "China" },
  { name: "Saifulbahri Ismail", beat: "Indonesia" },
  { name: "Leslie Lopez", beat: "Regional Affairs" },
  { name: "Michiyo Ishida", beat: "Japan" },
  { name: "Jack Board", beat: "Environment" },
];

export const games = [
  { id: "sudoku", name: "Mini Sudoku", desc: "Solve the classic number puzzle." },
  { id: "crossword", name: "Mini Crossword", desc: "A quick daily crossword." },
  { id: "wordle", name: "Word of the Day", desc: "Guess the five-letter word." },
  { id: "quiz", name: "News Quiz", desc: "How well do you know the day's news?" },
];

export const interactives = [
  { title: "Inside Jewel Changi Airport", kind: "Interactive" },
  { title: "Tides That Bind", kind: "Interactive" },
  { title: "The Water Issue", kind: "Special" },
  { title: "Singapore on Foot", kind: "Interactive" },
  { title: "NDP 2026: The Kallang Roar", kind: "Interactive" },
];

export const specialReports = [
  { title: "Interactives", desc: "Rich multimedia storytelling." },
  { title: "Mental Health", desc: "Stories on wellbeing across Asia." },
  { title: "Singapore Parliament", desc: "Coverage of the House." },
  { title: "Sustainability", desc: "Climate and green economy reporting." },
];

export const explains = [
  { title: "How does haze reach Singapore?", kind: "Video Explainer" },
  { title: "Smart glasses and the law", kind: "Explainer" },
  { title: "Why are COE prices so high?", kind: "Explainer" },
  { title: "What caused the Nepal-Tibet disaster?", kind: "Explainer" },
];

export const brandStudioItems = [
  { title: "Beyond banking: serving the affluent", kind: "Highlights" },
  { title: "Laying the foundations for concrete", kind: "Highlights" },
  { title: "Using AI to stay ahead of payment fraud", kind: "Customised Campaigns" },
  { title: "Coordinated breast assessment", kind: "Social Reels" },
];

export const indices = [
  { name: "STI", code: "IDXFTS", value: "5,702.15", chg: "-12.69", pct: "-0.22%", color: "#0b7aff", up: false },
  { name: "FSTAS", code: "IDXFTS", value: "1,273.44", chg: "-2.49", pct: "-0.20%", color: "#f47621", up: false },
  { name: "FSTM", code: "IDXFTS", value: "701.75", chg: "-0.68", pct: "-0.10%", color: "#e5484d", up: false },
];

export const gainers = [
  { lab: "Advancers", value: 78, color: "#0aa652" },
  { lab: "Unchanged", value: 94, color: "#9aa1ad" },
  { lab: "Decliners", value: 75, color: "#f6465d" },
];
