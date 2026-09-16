export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  thumbnail: string;
  videoId: string;
  url?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  thumbnail: string;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: Date;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  audioQuality: 'low' | 'medium' | 'high' | 'lossless';
  autoplay: boolean;
  explicitContent: boolean;
  equalizerPreset: string;
}

export interface UserStats {
  listeningTime: number;
  songsPlayed: number;
  likedSongs: string[];
  recentlyPlayed: string[];
  favoriteGenres: string[];
}

export interface LyricsLine {
  time: number;
  text: string;
}

export interface SyncedLyrics {
  trackId: string;
  lines: LyricsLine[];
  language?: string;
}

export type Page = 'home' | 'search' | 'library' | 'profile' | 'settings';
