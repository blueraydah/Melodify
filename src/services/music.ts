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

export async function searchTracks(query: string, limit = 20): Promise<Track[]> {
  try {
    const baseUrl = getInvidiousBase();
    const url = `${baseUrl}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
    
    const response = await fetchWithFallback(url);
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data
      .filter((item: any) => item.type === 'video' && item.videoId)
      .slice(0, limit)
      .map((item: any) => ({
        id: item.videoId,
        title: item.title || 'Unknown Track',
        artist: item.author || 'Unknown Artist',
        album: undefined,
        duration: item.lengthSeconds || 180,
        thumbnail: item.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg`,
        videoId: item.videoId,
      })) as Track[];
  } catch (error) {
    console.error('Search error:', error);
    return getFallbackTracks(query);
  }
}

export async function getTrendingTracks(region = 'US', limit = 30): Promise<Track[]> {
  try {
    const baseUrl = getInvidiousBase();
    const url = `${baseUrl}/api/v1/trending?region=${region}`;
    
    const response = await fetchWithFallback(url);
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return getFallbackTracks('trending');
    }
    
    return data
      .slice(0, limit)
      .map((item: any) => ({
        id: item.videoId,
        title: item.title || 'Unknown Track',
        artist: item.author || 'Unknown Artist',
        album: undefined,
        duration: item.lengthSeconds || 180,
        thumbnail: item.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg`,
        videoId: item.videoId,
      })) as Track[];
  } catch (error) {
    console.error('Trending error:', error);
    return getFallbackTracks('trending');
  }
}

export async function getStreamUrl(videoId: string): Promise<string | null> {
  try {
    const baseUrl = getInvidiousBase();
    const url = `${baseUrl}/api/v1/videos/${videoId}`;
    
    const response = await fetchWithFallback(url);
    const data = await response.json();
    
    if (data && Array.isArray(data.formatStreams)) {
      const audioStreams = data.formatStreams
        .filter((s: any) => s.type && s.type.includes('audio'))
        .sort((a: any, b: any) => {
          const aBitrate = parseInt(a.bitrate) || 0;
          const bBitrate = parseInt(b.bitrate) || 0;
          return bBitrate - aBitrate;
        });
      
      if (audioStreams.length > 0) {
        return audioStreams[0].url;
      }
    }
    
    if (data && Array.isArray(data.adaptiveFormats)) {
      const audioFormats = data.adaptiveFormats
        .filter((f: any) => f.audioQuality || (f.mimeType && f.mimeType.includes('audio')))
        .sort((a: any, b: any) => {
          const aBitrate = parseInt(a.bitrate) || 0;
          const bBitrate = parseInt(b.bitrate) || 0;
          return bBitrate - aBitrate;
        });
      
      if (audioFormats.length > 0) {
        return audioFormats[0].url;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Stream URL error:', error);
    return null;
  }
}

export async function getLyrics(trackTitle: string, artist: string, duration: number): Promise<{ time: number; text: string }[]> {
  try {
    const query = `${trackTitle} ${artist}`;
    const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(trackTitle)}&artist_name=${encodeURIComponent(artist)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
      const searchResponse = await fetch(searchUrl);
      
      if (searchResponse.ok) {
        const results = await searchResponse.json();
        if (Array.isArray(results) && results.length > 0) {
          const bestMatch = results.find((r: any) => 
            Math.abs(r.duration - duration) < 10
          ) || results[0];
          
          if (bestMatch.syncedLyrics) {
            return parseSyncedLyrics(bestMatch.syncedLyrics);
          } else if (bestMatch.plainLyrics) {
            return [{ time: 0, text: bestMatch.plainLyrics }];
          }
        }
      }
      return [];
    }
    
    const data = await response.json();
    
    if (data.syncedLyrics) {
      return parseSyncedLyrics(data.syncedLyrics);
    } else if (data.plainLyrics) {
      return [{ time: 0, text: data.plainLyrics }];
    }
    
    return [];
  } catch (error) {
    console.error('Lyrics error:', error);
    return [];
  }
}

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

function getFallbackTracks(): Track[] {
  const fallbackTracks: Track[] = [
    {
      id: 'demo-1',
      title: 'Electronic Dreams',
      artist: 'Synthwave Master',
      duration: 245,
      thumbnail: 'https://picsum.photos/seed/music1/400/400',
      videoId: 'demo-1',
    },
    {
      id: 'demo-2',
      title: 'Midnight Jazz',
      artist: 'Smooth Quartet',
      duration: 312,
      thumbnail: 'https://picsum.photos/seed/music2/400/400',
      videoId: 'demo-2',
    },
    {
      id: 'demo-3',
      title: 'Rock Anthem',
      artist: 'Thunder Band',
      duration: 278,
      thumbnail: 'https://picsum.photos/seed/music3/400/400',
      videoId: 'demo-3',
    },
    {
      id: 'demo-4',
      title: 'Chill Vibes',
      artist: 'Lo-Fi Beats',
      duration: 198,
      thumbnail: 'https://picsum.photos/seed/music4/400/400',
      videoId: 'demo-4',
    },
    {
      id: 'demo-5',
      title: 'Classical Morning',
      artist: 'Piano Ensemble',
      duration: 356,
      thumbnail: 'https://picsum.photos/seed/music5/400/400',
      videoId: 'demo-5',
    },
    {
      id: 'demo-6',
      title: 'Pop Sensation',
      artist: 'Chart Toppers',
      duration: 223,
      thumbnail: 'https://picsum.photos/seed/music6/400/400',
      videoId: 'demo-6',
    },
  ];
  
  return fallbackTracks;
}

export function switchInvidiousInstance() {
  const oldInstance = getInvidiousBase();
  const newInstance = getNextInvidiousBase();
  console.log(`Switched Invidious instance: ${oldInstance} -> ${newInstance}`);
  return newInstance;
}
