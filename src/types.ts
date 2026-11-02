export type StreamingService =
  | 'netflix'
  | 'prime'
  | 'hulu'
  | 'shudder'
  | 'crunchyroll'
  | 'tubi'
  | 'youtube'
  | 'freevee';

export interface StreamingAccount {
  service: StreamingService;
  connected: boolean;
  profileName: string;
  email: string;
  lastSync: string;
  color: string;
  accentColor: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'show';
  service: StreamingService;
  backdropUrl: string;
  posterUrl: string;
  rating: string;
  duration: string; // e.g. "2h 10m" or "45m"
  description: string;
  genres: string[];
  releaseYear: number;
  ratingScore: number; // e.g. 8.4
  episodeCount?: number;
  currentProgress?: {
    season: number;
    episode: number;
    episodeTitle: string;
    timeCode: string; // e.g. "14:20 / 48:00"
    percentage: number; // e.g. 35
    lastWatched: string; // e.g. "2 hours ago"
  };
}

export interface CustomChannel {
  id: string;
  name: string;
  description: string;
  mediaIds: string[];
  shareCode: string;
  createdAt: string;
}

export interface TvGuideSlot {
  id: string;
  time: string; // e.g. "08:00 PM"
  title: string;
  type: 'movie' | 'show' | 'bumper' | 'trivia' | 'outro';
  duration: string;
  service: StreamingService | 'omnistream';
  description: string;
  subtitle?: string;
  thumbnailUrl?: string;
}

export interface WatchSchedule {
  id: string;
  name: string;
  createdDate: string;
  slots: TvGuideSlot[];
  originalShowsCount: number;
  originalMoviesCount: number;
}
