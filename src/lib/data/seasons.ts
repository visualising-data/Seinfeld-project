import { sum } from "d3-array"

export const seasons = [
  { id: 's1', seasonNum: 1, years: '1989-90', color: '#FDE824', accessibleOverDarkColor: '#FDE824', numEpisodes: 5 },
  { id: 's2', seasonNum: 2, years: '1990-91', color: '#B8CE32', accessibleOverDarkColor: '#B8CE32', numEpisodes: 12 },
  { id: 's3', seasonNum: 3, years: '1991-92', color: '#7DBA57', accessibleOverDarkColor: '#7DBA57', numEpisodes: 23 },
  { id: 's4', seasonNum: 4, years: '1992-93', color: '#4CB278', accessibleOverDarkColor: '#4CB278', numEpisodes: 24 },
  { id: 's5', seasonNum: 5, years: '1993-94', color: '#1DA388', accessibleOverDarkColor: '#1DA388', numEpisodes: 22 },
  { id: 's6', seasonNum: 6, years: '1994-95', color: '#228A8D', accessibleOverDarkColor: '#2BA8AB', numEpisodes: 24 },
  { id: 's7', seasonNum: 7, years: '1995-96', color: '#2F708E', accessibleOverDarkColor: '#4195BC', numEpisodes: 24 },
  { id: 's8', seasonNum: 8, years: '1996-97', color: '#39578D', accessibleOverDarkColor: '#547EC9', numEpisodes: 22 },
  { id: 's9', seasonNum: 9, years: '1997-98', color: '#453782', accessibleOverDarkColor: '#6752C2', numEpisodes: 24 }
]

export const totalNumEpisodes = sum(seasons, d => d.numEpisodes) as number