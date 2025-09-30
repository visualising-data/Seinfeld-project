export type EpisodeData = {
    doubleLocation: string;
    episode: string;
    eventAttribute: string;
    eventCategory: string;
    eventDuration: string;
    eventDurationSeconds: string;
    eventTime: string;
    eventTimeSeconds: string;
    eventValue: string;
    recordId: string;
    sceneNumber: string;
    season: string;
}

export type Episode = { 
    season: number;
    episode: number;
    duration: number; 
    data: EpisodeData[];
    laughs: EpisodeData[];
};