const baseUrl = 'https://amdufour.github.io/hosted-data/apis/illustrations/';

// Each entry maps a season+episode to its illustration filename.
// Episode assignments based on the item featured in each illustration.
export const illustrationEpisodes: { season: number; episode: number; filename: string }[] = [
  // Season 1
  { season: 1, episode: 5, filename: 'Seinfeld__0000_Season-1-_-Superman-T-Shirt.png' }, // The Stock Tip — Jerry's Superman t-shirt
  { season: 1, episode: 3, filename: 'Seinfeld__0001_Season-1-_-For-Sale-Ad.png' }, // The Robbery — Jerry considers moving, apartment ads
  { season: 1, episode: 2, filename: 'Seinfeld__0002_Season-1-_-Scrabble.png' }, // Male Unbonding — game night with Joel
  { season: 1, episode: 2, filename: 'Seinfeld__0003_Season-1-_-Business-Cards.png' }, // The Stakeout — George's fake Art Vandelay business cards

  // Season 2
  { season: 2, episode: 3, filename: 'Seinfeld__0005_Season-2-_-Jerrys-Coat.png' }, // The Jacket — Jerry's suede jacket with pink stripes
  { season: 2, episode: 6, filename: 'Seinfeld__0006_Season-2-_-Statue.png' }, // The Statue — Elaine's father's stolen statue
  { season: 2, episode: 10, filename: 'Seinfeld__0007_Season-2-_-TV.png' }, // The Baby Shower — Kramer wants illegal cable TV
  { season: 2, episode: 10, filename: 'Seinfeld__0008_Season-2-_-Bosco-Sauce.png' }, // The Chinese Restaurant — waiting, food obsession

  // Season 3
  { season: 3, episode: 14, filename: 'Seinfeld__0009_Season-3-_-The-PEZ-Dispenser.png' }, // The Pez Dispenser
  { season: 3, episode: 19, filename: "Seinfeld__0010_Season-3-_-O'Brien-Sign.png" }, // The Subway — underground signage
  { season: 3, episode: 11, filename: 'Seinfeld__0011_Season-3-_-Pretzels.png' }, // The Alternate Side — "These pretzels are making me thirsty"
  { season: 3, episode: 6, filename: 'Seinfeld__0012_Season-3-_-Goldfish.png' }, // The Letter — the painting, Elaine and the fish

  // Season 4
  { season: 4, episode: 14, filename: 'Seinfeld__0013_Season-4_-Rochelle-Rochelle.png' }, // The Movie — they try to see Rochelle Rochelle
  { season: 4, episode: 3, filename: 'Seinfeld__0014_Season-4-_-NBC-Logo.png' }, // The Pitch — Jerry and George pitch show to NBC
  { season: 4, episode: 7, filename: 'Seinfeld__0015_Season-4-_-Trivial-Pursuit.png' }, // The Bubble Boy — Trivial Pursuit game with Donald
  { season: 4, episode: 8, filename: 'Seinfeld__0016_Season-4-_-Cuban-Cigar.png' }, // The Cheever Letters — Cuban cigars

  // Season 5
  { season: 5, episode: 19, filename: 'Seinfeld__0017_Season-5-_-Trenchcoat.png' }, // The Raincoats (Part 2) — trenchcoats and Alton Benes
  { season: 5, episode: 14, filename: 'Seinfeld__0018_Season-5-_-Golf-Ball.png' }, // The Marine Biologist — George pulls golf ball from whale
  { season: 5, episode: 3, filename: 'Seinfeld__0019_Season-5-_-Georges-Lady-Glasses.png' }, // The Glasses — George's prescription mix-up
  { season: 5, episode: 7, filename: 'Seinfeld__0020_Season-5-_-Frozen-Yoghurt.png' }, // The Non-Fat Yoghurt — the frozen yogurt shop

  // Season 6
  { season: 6, episode: 3, filename: 'Seinfeld__0021_Season-6-_-Snickers.png' }, // The Pledge Drive — eating Snickers with fork and knife
  { season: 6, episode: 8, filename: 'Seinfeld__0022_Season-6-_-Woody-Woodpecker.png' }, // The Mom and Pop Store — Kramer's connection to cartoons
  { season: 6, episode: 12, filename: 'Seinfeld__0023_Season-6-_-Risk.png' }, // The Label Maker — Risk game on the subway
  { season: 6, episode: 21, filename: 'Seinfeld__0024_Season-6-_-Number-Plate.png' }, // The Scofflaw — special parking scofflaw plate

  // Season 7
  { season: 7, episode: 2, filename: 'Seinfeld__0025_Season-7-_-Coffee-Cup.png' }, // The Soup Nazi — no soup for you
  { season: 7, episode: 4, filename: 'Seinfeld__0026_Season-7-_-Yankees-Hat.png' }, // The Cadillac — George still with the Yankees
  { season: 7, episode: 11, filename: 'Seinfeld__0027_Season-7-_-Marble-Rye.png' }, // The Rye — Jerry steals the marble rye
  { season: 7, episode: 12, filename: 'Seinfeld__0028_Season-7-_-Golf-Club.png' }, // The Caddy — Kramer and Stan the caddy play golf

  // Season 8
  { season: 8, episode: 5, filename: 'Seinfeld__0029_Season-8-_-Camera-Film.png' }, // The Package — mysterious mailing, film development
  { season: 8, episode: 11, filename: 'Seinfeld__0030_Season-8-_-Kramers-Cockerel.png' }, // The Little Jerry — Kramer's rooster named Little Jerry Seinfeld
  { season: 8, episode: 2, filename: 'Seinfeld__0031_Season-8-_-Georges-Briefcase.png' }, // The Comeback — George's props and comeback line
  { season: 8, episode: 17, filename: 'Seinfeld__0032_Season-8-_-Dad-T-shirt.png' }, // The Checks — Japanese royalty checks and fan shirts

  // Season 9
  { season: 9, episode: 20, filename: 'Seinfeld__0033_Season-9-_-Puerto-Rican-Flag.png' }, // The Puerto Rican Day
  { season: 9, episode: 10, filename: 'Seinfeld__0034_Season-9-_-Festuvus-Stick.png' }, // The Strike — Festivus for the rest of us
  { season: 9, episode: 12, filename: 'Seinfeld__0035_Season-9-_-Puddy-Balls-Jacket.png' }, // The Reverse Peephole — Puddy's fur coat controversy
  { season: 9, episode: 6, filename: 'Seinfeld__0036_Season-9-_-Merv-Griffin.png' }, // The Merv Griffin Show — Kramer's apartment set
];

export function getIllustrationForEpisode(season: number, episode: number) {
  const matches = illustrationEpisodes.filter((i) => i.season === season && i.episode === episode);
  if (matches.length === 0) return null;
  const entry = matches[Math.floor(Math.random() * matches.length)];
  return `${baseUrl}${encodeURIComponent(entry.filename)}`;
}
