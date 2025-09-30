import { seasons } from "$lib/data/seasons";
import { isEpisodeValid } from "./isEpisodeValid";

/**
   * @param {any[]} arr
   * @param {number} n
   */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRandom = (arr: any[], n: number) => {
  let len = arr.length;
  let num = n > len ? len : n;
  const result = new Array(num);
  const taken = new Array(len);
  while (num--) {
    const x = Math.floor(Math.random() * len);
    result[num] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

export const getRandomEpisode = () => {
  const newSeason = Math.floor(Math.random() * 9) + 1;
  const numEpisodes = seasons.find((s) => s.seasonNum === newSeason)?.numEpisodes;
  if (numEpisodes) {
    const newEpisode = Math.floor(Math.random() * numEpisodes) + 1;

    if (isEpisodeValid(newSeason, newEpisode)) {
      return { newSeason: newSeason, newEpisode: newEpisode };
    } else {
      getRandomEpisode();
    }
  } else {
    getRandomEpisode();
  }
}