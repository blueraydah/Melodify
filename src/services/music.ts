import { Track } from '../types';

const INVIDIOUS_INSTANCES = [
  'https://invidious.io.lol',
  'https://invidious.fdn.fr',
  'https://yewtu.be',
  'https://inv.tux.pizza',
];

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

let currentInvidiousIndex = 0;
let currentProxyIndex = 0;

function getInvidiousBase(): string {
  return INVIDIOUS_INSTANCES[currentInvidiousIndex % INVIDIOUS_INSTANCES.length];
}

function getNextInvidiousBase(): string {
  currentInvidiousIndex++;
  return getInvidiousBase();
}

function getCorsProxy(): string {
  return CORS_PROXIES[currentProxyIndex % CORS_PROXIES.length];
}

async function fetchWithFallback(url: string, useCorsProxy = true): Promise<Response> {
  const urlsToTry = useCorsProxy
    ? [`${getCorsProxy()}${encodeURIComponent(url)}`, url]
    : [url];

  for (const fetchUrl of urlsToTry) {
    try {
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.warn(`Failed to fetch ${fetchUrl}:`, error);
    }
  }
  
  throw new Error('All fetch attempts failed');
}

export const musicService = {
  async searchTracks(query: string, limit = 20): Promise<Track[]> {
    try {
      const invidiousBase = getInvidiousBase();
      const searchUrl = `${invidiousBase}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
      
      const response = await fetchWithFallback(searchUrl);
      const data = await response.json();
      
      return data.slice(0, limit).map((video: any) => ({
        id: video.videoId,
        title: video.title,
        artist: video.author,
        album: 'Single',
        duration: video.lengthSeconds || 180,
        coverUrl: video.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
        audioUrl: '',
        videoId: video.videoId,
        genre: 'Unknown',
      }));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  },

  async getTrendingTracks(region = 'US', limit = 30): Promise<Track[]> {
    try {
      const invidiousBase = getInvidiousBase();
      const trendingUrl = `${invidiousBase}/api/v1/trending?region=${region}`;
      
      const response = await fetchWithFallback(trendingUrl);
      const data = await response.json();
      
      return data.slice(0, limit).map((video: any) => ({
        id: video.videoId,
        title: video.title,
        artist: video.author,
        album: 'Trending',
        duration: video.lengthSeconds || 180,
        coverUrl: video.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
        audioUrl: '',
        videoId: video.videoId,
        genre: 'Unknown',
      }));
    } catch (error) {
      console.error('Trending error:', error);
      return [];
    }
  },

  async getStreamUrl(videoId: string): Promise<string | null> {
    try {
      const invidiousBase = getInvidiousBase();
      const streamUrl = `${invidiousBase}/api/v1/videos/${videoId}`;
      
      const response = await fetchWithFallback(streamUrl);
      const data = await response.json();
      
      const audioStreams = data.adaptiveFormats?.filter((f: any) => f.type.includes('audio')) || [];
      if (audioStreams.length > 0) {
        const bestStream = audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
        return bestStream.url || null;
      }
      
      return null;
    } catch (error) {
      console.error('Stream URL error:', error);
      return null;
    }
  },

  async getLyrics(trackTitle: string, artist: string, duration?: number): Promise<{ time: number; text: string }[]> {
    try {
      const searchQuery = encodeURIComponent(`${trackTitle} ${artist}`);
      const searchUrl = `https://lrclib.net/api/search?q=${searchQuery}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const track = data[0];
        if (track.syncedLyrics) {
          return parseSyncedLyrics(track.syncedLyrics);
        } else if (track.plainLyrics) {
          return [{ time: 0, text: track.plainLyrics }];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Lyrics error:', error);
      return [];
    }
  },
};

function parseSyncedLyrics(syncedLyrics: string): { time: number; text: string }[] {
  const lines = syncedLyrics.split('\n');
  const parsed: { time: number; text: string }[] = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3].padEnd(3, '0'));
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(timeRegex, '').trim();

      if (text) {
        parsed.push({ time, text });
      }
    }
  }

  return parsed;
}

export function switchInvidiousInstance() {
  const oldInstance = getInvidiousBase();
  const newInstance = getNextInvidiousBase();
  console.log(`Switched Invidious instance: ${oldInstance} -> ${newInstance}`);
  return newInstance;
}
