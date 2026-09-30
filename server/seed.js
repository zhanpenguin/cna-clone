// Seed data for the demo news site.
// All article text below is original placeholder content written for this
// training project (it is not copied from the real CNA website).

const now = Date.now();
const ago = {
  min: (n) => new Date(now - n * 60 * 1000).toISOString(),
  hour: (n) => new Date(now - n * 60 * 60 * 1000).toISOString(),
  day: (n) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString(),
};

export const categories = [
  { id: "cat-singapore", name: "Singapore", slug: "singapore", order: 1 },
  { id: "cat-asia", name: "Asia", slug: "asia", order: 2 },
  { id: "cat-east-asia", name: "East Asia", slug: "east-asia", order: 3 },
  { id: "cat-world", name: "World", slug: "world", order: 4 },
  { id: "cat-business", name: "Business", slug: "business", order: 5 },
  { id: "cat-sport", name: "Sport", slug: "sport", order: 6 },
  { id: "cat-commentary", name: "Commentary", slug: "commentary", order: 7 },
  { id: "cat-lifestyle", name: "Lifestyle", slug: "lifestyle", order: 8 },
  { id: "cat-insider", name: "Insider", slug: "insider", order: 9 },
];

const img = (seed, w = 800, h = 500) =>
  `https://picsum.photos/seed/cna${seed}/${w}/${h}`;

let n = 0;
const article = (data) => {
  n += 1;
  return {
    id: `art-${String(n).padStart(3, "0")}`,
    title: "",
    summary: "",
    category: "singapore",
    author: null,
    imageUrl: img(n),
    publishedAt: ago.hour(3),
    updatedAt: null,
    featured: false,
    breaking: false,
    trending: false,
    kind: "article",
    duration: null,
    tags: [],
    body: [],
    ...data,
  };
};

const p = (...texts) => texts;

export function buildArticles() {
  return [
    article({
      title: "New rail link extension to connect Jurong Innovation District by 2030",
      summary:
        "The two-stop extension will cut travel time for commuters in the west and unlock new housing sites along the corridor, transport officials said.",
      category: "singapore",
      publishedAt: ago.min(18),
      updatedAt: ago.min(8),
      featured: true,
      breaking: true,
      tags: ["public transport", "MRT", "commuters"],
      body: p(
        "Commuters in Singapore's west can look forward to a faster ride with a new rail extension that will serve the Jurong Innovation District by 2030.",
        "The two-stop extension will connect existing lines and open up new housing developments along the corridor, according to transport officials.",
        "Construction is expected to begin next year, with the first stations coming online in phases."
      ),
    }),
    article({
      title: "Hawker centres to trial cashless-only payment lanes next year",
      summary:
        "A six-month pilot at three hawker centres will test whether dedicated QR-payment lanes can speed up queues and reduce cash handling.",
      category: "singapore",
      publishedAt: ago.hour(2),
      body: p(
        "Three hawker centres will introduce dedicated cashless payment lanes as part of a six-month pilot starting early next year.",
        "The trial aims to speed up queues during peak hours and help older stallholders reduce the time spent handling cash."
      ),
    }),
    article({
      title: "National library launches AI-assisted archive of rare manuscripts",
      summary:
        "Researchers can now search centuries-old texts using handwriting recognition trained on Southeast Asian scripts.",
      category: "singapore",
      publishedAt: ago.hour(5),
      body: p(
        "A new digital archive lets researchers search through rare manuscripts using handwriting recognition trained specifically on Southeast Asian scripts.",
        "The library said the tool will make fragile documents more accessible while keeping the originals in climate-controlled storage."
      ),
    }),
    article({
      title: "Regional leaders gather in Bangkok for annual trade summit",
      summary:
        "Supply-chain resilience and digital trade rules are expected to dominate the agenda as ministers meet over two days.",
      category: "asia",
      publishedAt: ago.min(40),
      breaking: true,
      body: p(
        "Trade ministers from across the region opened their annual summit in Bangkok with a focus on supply-chain resilience and digital trade rules.",
        "Officials said negotiators are close to finalising an agreement on cross-border data flows that could shape e-commerce for a decade."
      ),
    }),
    article({
      title: "Indonesia unveils plan to reach 40 percent renewable energy by 2040",
      summary:
        "The roadmap leans heavily on solar and geothermal, with new incentives aimed at attracting private investment.",
      category: "asia",
      publishedAt: ago.hour(4),
      body: p(
        "Indonesia announced a revised energy roadmap that targets 40 percent renewable generation by 2040.",
        "The plan relies on expanded solar and geothermal capacity, alongside tax incentives designed to draw in private capital."
      ),
    }),
    article({
      title: "Malaysia's durian growers eye new export markets after record season",
      summary:
        "Growers are investing in cold-chain logistics as demand from regional cities continues to climb.",
      category: "asia",
      publishedAt: ago.hour(9),
      body: p(
        "After a record harvest, Malaysian durian growers are investing in cold-chain logistics to reach new markets.",
        "Industry groups say demand from regional cities has doubled in three years, driven by online ordering platforms."
      ),
    }),
    article({
      title: "Seoul announces round-the-clock subway service on key weekend lines",
      summary:
        "The city says the pilot will run for six months and could be extended if late-night ridership meets targets.",
      category: "east-asia",
      publishedAt: ago.hour(3),
      body: p(
        "Seoul will run 24-hour subway service on two key lines over weekends under a six-month pilot.",
        "City officials said the programme responds to growing demand from shift workers and the late-night economy."
      ),
    }),
    article({
      title: "Tokyo researchers demo battery breakthrough for colder climates",
      summary:
        "A new electrolyte formulation keeps charge capacity stable at temperatures below freezing, the team says.",
      category: "east-asia",
      publishedAt: ago.hour(7),
      body: p(
        "Researchers in Tokyo demonstrated a battery formulation that retains its charge capacity at sub-zero temperatures.",
        "The team said the breakthrough could extend the range of electric vehicles in colder climates."
      ),
    }),
    article({
      title: "Global shipping alliance pledges carbon-neutral routes by 2035",
      summary:
        "Twelve of the world's largest carriers have agreed to fund low-emission fuels for their busiest trade lanes.",
      category: "world",
      publishedAt: ago.min(55),
      breaking: true,
      body: p(
        "A dozen of the world's largest shipping carriers committed to making their busiest trade lanes carbon-neutral by 2035.",
        "The alliance will pool funds to purchase low-emission fuels and retrofit older vessels."
      ),
    }),
    article({
      title: "Global chip industry braces for another year of uneven demand",
      summary:
        "Analysts expect strong AI-related orders to offset weakness in consumer electronics through next year.",
      category: "business",
      publishedAt: ago.hour(6),
      body: p(
        "Chipmakers are preparing for another year of uneven demand, with AI-related orders expected to offset softness in consumer electronics.",
        "Analysts said capacity investment remains concentrated in advanced packaging and memory."
      ),
    }),
    article({
      title: "Regional tech firms post record third-quarter earnings",
      summary:
        "A rebound in cloud spending helped several listed companies beat analyst expectations.",
      category: "business",
      publishedAt: ago.hour(11),
      body: p(
        "Several regional technology firms posted record third-quarter earnings, helped by a rebound in enterprise cloud spending.",
        "Executives pointed to stronger-than-expected demand from financial services and logistics customers."
      ),
    }),
    article({
      title: "Singapore shuttlers advance to regional finals after tight win",
      summary:
        "The doubles pair fought back from a game down to book their place in Sunday's final.",
      category: "sport",
      publishedAt: ago.min(30),
      body: p(
        "Singapore's doubles pair fought back from a game down to reach the regional finals.",
        "They will face the top seeds on Sunday, with the team's head coach describing the comeback as a turning point."
      ),
    }),
    article({
      title: "Local football club unveils plans for new youth academy",
      summary:
        "The academy will train 200 young players a year, with scholarships for the most promising talent.",
      category: "sport",
      publishedAt: ago.hour(13),
      body: p(
        "A local football club unveiled plans for a new youth academy that will train up to 200 players each year.",
        "The club said scholarships will be offered to the most promising players, regardless of family background."
      ),
    }),
    article({
      title: "Commentary: Why small states matter in the global AI race",
      summary:
        "Size is no longer the decisive factor. Agility, trust and regulation are becoming the real currency of the digital economy.",
      category: "commentary",
      author: "Mei Ling Tan",
      publishedAt: ago.hour(8),
      body: p(
        "For decades, the assumption was that only the largest economies could set the rules of new technologies.",
        "That assumption is breaking down. Small states that move quickly on regulation and build trust can shape how AI is adopted across entire regions."
      ),
    }),
    article({
      title: "Commentary: The quiet return of the office lunch",
      summary:
        "As hybrid work settles into routine, the humble shared meal is making a comeback as the glue of team culture.",
      category: "commentary",
      author: "Daniel Koh",
      publishedAt: ago.day(1),
      body: p(
        "The office lunch was declared dead more than once during the remote-work era.",
        "Yet as hybrid arrangements mature, teams are rediscovering the value of a shared meal as an informal space for trust."
      ),
    }),
    article({
      title: "Five hidden food gems in Singapore's east",
      summary:
        "From a 40-year-old prawn noodle stall to a late-night prata shop, here is where locals actually eat.",
      category: "lifestyle",
      publishedAt: ago.hour(2),
      body: p(
        "Away from the tourist trail, Singapore's east is home to some of the island's most beloved neighbourhood food.",
        "Here are five stalls that have kept generations of regulars coming back for decades."
      ),
    }),
    article({
      title: "A beginner's guide to urban cycling in the city",
      summary:
        "From the best routes to the gear you actually need, here is how to start riding safely.",
      category: "lifestyle",
      publishedAt: ago.hour(16),
      body: p(
        "Urban cycling is growing fast, and with new park connectors opening every year, there has never been a better time to start.",
        "This guide covers the essentials: routes, safety gear and the unspoken rules of shared paths."
      ),
    }),
    article({
      title: "Inside the team keeping the city's reservoirs clean",
      summary:
        "Divers and engineers work around the clock to keep the water supply safe for millions of residents.",
      category: "insider",
      publishedAt: ago.day(1),
      body: p(
        "Every day, a small team of divers and engineers works beneath the surface to keep the city's reservoirs clean.",
        "Their job has grown more demanding as extreme weather events become more frequent."
      ),
    }),
    article({
      title: "The last artisan letterpress workshop in the city",
      summary:
        "A third-generation printer is keeping a dying craft alive, one card at a time.",
      category: "insider",
      publishedAt: ago.day(2),
      body: p(
        "Tucked into a narrow shophouse, the city's last artisan letterpress workshop still runs on machines older than most of its customers.",
        "Its owner is determined to pass the craft to a new generation."
      ),
    }),
    article({
      title: "Watch: Behind the scenes of the city's biggest fireworks show",
      summary:
        "Our cameras followed the pyrotechnics crew for 48 hours as they prepared the annual display.",
      category: "lifestyle",
      kind: "video",
      duration: "3m 12s",
      publishedAt: ago.hour(5),
      body: p(
        "Preparing the city's largest fireworks display takes more than a year of planning and 48 hours of intense on-site work.",
        "We followed the crew through setup, safety checks and the final countdown."
      ),
    }),
    article({
      title: "Visual story: How a hawker dish goes from market to table",
      summary:
        "Follow the 12-hour journey of a single bowl of noodles, from pre-dawn market run to lunchtime service.",
      category: "lifestyle",
      kind: "visual",
      publishedAt: ago.hour(12),
      body: p(
        "A bowl of noodles seems simple, but its journey to your table begins long before sunrise.",
        "This visual story traces every step, from the pre-dawn market run to the lunchtime rush."
      ),
    }),
    article({
      title: "Asia markets round-up: Stocks edge higher on trade optimism",
      summary:
        "Regional indices closed mostly higher as investors looked past mixed earnings reports.",
      category: "business",
      publishedAt: ago.min(10),
      trending: true,
      body: p(
        "Regional stock markets closed mostly higher as investors weighed trade optimism against mixed earnings reports.",
        "Gains were led by technology and shipping stocks."
      ),
    }),
    article({
      title: "City to add 50 more sheltered walkways near transport hubs",
      summary:
        "The expansion targets areas with high pedestrian traffic and limited shade.",
      category: "singapore",
      publishedAt: ago.day(1),
      body: p(
        "The city will add sheltered walkways at 50 more locations near transport hubs over the next two years.",
        "The expansion focuses on areas with high pedestrian traffic and limited tree cover."
      ),
    }),
    article({
      title: "Podcast: What the region's next decade of trade could look like",
      summary:
        "Our correspondents unpack the forces reshaping supply chains, from AI to climate policy.",
      category: "asia",
      kind: "podcast",
      duration: "21 mins",
      publishedAt: ago.hour(3),
      body: p(
        "In this episode, our correspondents discuss the forces reshaping regional trade over the next decade.",
        "From AI-driven logistics to climate policy, the conversation explores who stands to gain and who may be left behind."
      ),
    }),
    article({
      title: "Short: 60 seconds around the new waterfront park",
      summary: "Take a quick tour of the city's newest green space.",
      category: "lifestyle",
      kind: "short",
      duration: "1m 02s",
      publishedAt: ago.hour(1),
      body: p("A one-minute look at the city's newest waterfront park."),
    }),
    article({
      title: "World leaders to meet for climate finance talks next month",
      summary:
        "The summit is expected to focus on funding for adaptation in low-lying coastal cities.",
      category: "world",
      publishedAt: ago.hour(14),
      body: p(
        "World leaders will meet next month for talks on climate finance, with adaptation funding for coastal cities high on the agenda.",
        "Negotiators say bridging the financing gap remains the central obstacle."
      ),
    }),
  ];
}

export function buildTrending() {
  return [
    "art-001",
    "art-023",
    "art-004",
    "art-009",
    "art-005",
  ];
}
