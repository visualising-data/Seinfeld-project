export type SceneResult = {
  sceneNumber: number;
  duration: number;
  laughDuration: number;
  laughRate: number;
};

export type EpisodeResult = {
  season: number;
  episode: number;
  scenes: SceneResult[];
};

/**
 * For a combination of lead characters, supporting characters, and an optional location,
 * find all scenes across all episodes where at least one of each selected group appears
 * within the same scene. Empty arrays / null location means "no filter on that dimension".
 *
 * Character matching is exclusive: a scene must contain exactly the selected characters — all of
 * them must appear, and no others. Location matching is inclusive: the scene just needs to include
 * the selected location (it may have others).
 * Scene duration = all unique time points in the scene × 5s (each event is a 5-second window).
 * Laugh duration = unique time points in the scene with a CAUSES THE LAUGH event × 5s.
 */
export function getCombinationScenes(
  episodesData: any[],
  leadChars: string[],
  suppChars: string[],
  location: string | null,
): EpisodeResult[] {
  const result: EpisodeResult[] = [];

  episodesData.forEach((episode) => {
    // Group all events by scene number
    const sceneEvents = new Map<number, any[]>();
    episode.data.forEach((e: any) => {
      const sceneNum = +e.sceneNumber;
      if (!sceneEvents.has(sceneNum)) sceneEvents.set(sceneNum, []);
      sceneEvents.get(sceneNum)!.push(e);
    });

    const scenes: SceneResult[] = [];

    sceneEvents.forEach((events, sceneNumber) => {
      const selectedChars = new Set([...leadChars, ...suppChars]);

      if (selectedChars.size > 0) {
        const sceneChars = new Set(
          events
            .filter((e) => e.eventCategory === 'CHARACTERS')
            .map((e) => e.eventAttribute as string),
        );

        // All selected characters must be present
        for (const char of selectedChars) {
          if (!sceneChars.has(char)) return;
        }

        // No characters beyond the selected ones may appear
        for (const char of sceneChars) {
          if (!selectedChars.has(char)) return;
        }
      }

      if (location !== null) {
        const hasLocation = events.some(
          (e) => e.eventCategory === 'LOCATION' && e.eventAttribute === location,
        );
        if (!hasLocation) return;
      }

      // Count unique time points for scene duration
      const allTimes = new Set(events.map((e) => e.eventTimeSeconds));
      const laughTimes = new Set(
        events
          .filter((e) => e.eventCategory === 'CAUSES THE LAUGH')
          .map((e) => e.eventTimeSeconds),
      );

      const duration = allTimes.size * 5;
      const laughDuration = laughTimes.size * 5;

      scenes.push({
        sceneNumber,
        duration,
        laughDuration,
        laughRate: duration > 0 ? laughDuration / duration : 0,
      });
    });

    if (scenes.length > 0) {
      result.push({ season: episode.season, episode: episode.episode, scenes });
    }
  });

  return result;
}
