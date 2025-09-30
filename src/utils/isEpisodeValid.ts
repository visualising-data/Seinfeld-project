export const isEpisodeValid = (season: number, episode: number) => {
  if (
    (season === 6 && episode === 14) ||
    (season === 6 && episode === 15) ||
    (season === 9 && episode === 21) ||
    (season === 9 && episode === 22)
  ) {
    return false
  } else {
    return true
  }
}
