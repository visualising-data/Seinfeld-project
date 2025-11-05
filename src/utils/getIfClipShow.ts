export const getIfClipShow = (season: number, episode: number) => {
  switch (true) {
    case season === 6 && episode === 14:
      return true
    case season === 6 && episode === 15:
      return true
    case season === 9 && episode === 21:
      return true
    case season === 9 && episode === 22:
      return true
    default:
      return false
  }
}