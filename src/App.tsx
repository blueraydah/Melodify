import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { musicService } from './services/music';
import { Track, Playlist, User } from './types';

// Demo tracks as fallback
const DEMO_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Midnight Dreams',
    artist: 'Luna Wave',
    album: 'Nocturnal',
    duration: 234,
    coverUrl: 'https://picsum.photos/seed/track1/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    genre: 'Electronic',
  },
  {
    id: '2',
    title: 'Summer Breeze',
    artist: 'Coastal Vibes',
    album: 'Beach Days',
    duration: 198,
    coverUrl: 'https://picsum.photos/seed/track2/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    genre: 'Pop',
  },
  {
    id: '3',
    title: 'Urban Jungle',
    artist: 'City Beats',
    album: 'Metropolitan',
    duration: 267,
    coverUrl: 'https://picsum.photos/seed/track3/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    genre: 'Hip Hop',
  },
  {
    id: '4',
    title: 'Crystal Clear',
    artist: 'Prism',
    album: 'Refraction',
    duration: 212,
    coverUrl: 'https://picsum.photos/seed/track4/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    genre: 'Ambient',
  },
  {
    id: '5',
    title: 'Neon Lights',
    artist: 'Synthwave Collective',
    album: 'Retro Future',
    duration: 245,
    coverUrl: 'https://picsum.photos/seed/track5/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    genre: 'Synthwave',
  },
  {
    id: '6',
    title: 'Mountain High',
    artist: 'Alpine Sound',
    album: 'Peaks',
    duration: 189,
    coverUrl: 'https://picsum.photos/seed/track6/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    genre: 'Folk',
  },
  {
    id: '7',
    title: 'Deep Ocean',
    artist: 'Aqua Dreams',
    album: 'Depths',
    duration: 278,
    coverUrl: 'https://picsum.photos/seed/track7/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    genre: 'Chillout',
  },
  {
    id: '8',
    title: 'Electric Soul',
    artist: 'Voltage',
    album: 'Charged',
    duration: 223,
    coverUrl: 'https://picsum.photos/seed/track8/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    genre: 'R&B',
  },
  {
    id: '9',
    title: 'Desert Wind',
    artist: 'Sahara Sons',
    album: 'Dunes',
    duration: 256,
    coverUrl: 'https://picsum.photos/seed/track9/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    genre: 'World',
  },
  {
    id: '10',
    title: 'Starlight',
    artist: 'Cosmic Journey',
    album: 'Galaxy',
    duration: 301,
    coverUrl: 'https://picsum.photos/seed/track10/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    genre: 'Trance',
  },
  {
    id: '11',
    title: 'Rainy Day',
    artist: 'Storm Chasers',
    album: 'Weather Patterns',
    duration: 187,
    coverUrl: 'https://picsum.photos/seed/track11/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    genre: 'Jazz',
  },
  {
    id: '12',
    title: 'Phoenix Rising',
    artist: 'Ember',
    album: 'Rebirth',
    duration: 294,
    coverUrl: 'https://picsum.photos/seed/track12/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    genre: 'Rock',
  },
];

const DEMO_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: 'Chill Vibes',
    description: 'Relaxing tracks for unwinding',
    coverUrl: 'https://picsum.photos/seed/chill/300/300',
    trackIds: ['1', '4', '7', '11'],
  },
  {
    id: 'p2',
    name: 'Workout Energy',
    description: 'High energy tracks for your workout',
    coverUrl: 'https://picsum.photos/seed/workout/300/300',
    trackIds: ['3', '5', '8', '12'],
  },
  {
    id: 'p3',
    name: 'Focus Flow',
    description: 'Concentration boosting music',
    coverUrl: 'https://picsum.photos/seed/focus/300/300',
    trackIds: ['2', '6', '9', '10'],
  },
];

// Icons as SVG components
const Icons = {
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Library: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Play: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Pause: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  ),
  SkipBack: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="19 20 9 12 19 4 19 20" />
      <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  SkipForward: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Heart: ({ filled }: { filled?: boolean }) => (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Volume: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Music: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Mic: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
};

// Format time helper
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Skeleton Loader Component
const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/10 rounded ${className}`} />
);

// Track Card Component
const TrackCard: React.FC<{ track: Track; onPlay: (track: Track) => void }> = React.memo(({ track, onPlay }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div 
      className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={() => onPlay(track)}
    >
      <div className="relative aspect-square mb-4 rounded-xl overflow-hidden">
        {!imageLoaded && <SkeletonLoader className="absolute inset-0 w-full h-full" />}
        <img
          src={track.coverUrl}
          alt={track.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <Icons.Play />
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-white truncate">{track.title}</h3>
      <p className="text-sm text-gray-400 truncate">{track.artist}</p>
    </div>
  );
});

// Player Bar Component
const PlayerBar: React.FC = () => {
  const { currentTrack, isPlaying, togglePlay, progress, duration, seek, volume, setVolume, skipForward, skipBack } = usePlayer();
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      // Fetch lyrics
      musicService.getLyrics(currentTrack.title, currentTrack.artist).then(setLyrics);
      setLiked(false);
    }
  }, [currentTrack]);

  if (!currentTrack) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-xl border-t border-white/10 p-4 z-50">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-16 h-16 rounded-xl object-cover shadow-lg"
            />
            <div className="min-w-0">
              <h4 className="font-semibold text-white truncate">{currentTrack.title}</h4>
              <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
            </div>
            <button
              onClick={() => setLiked(!liked)}
              className={`ml-2 transition-colors ${liked ? 'text-pink-500' : 'text-gray-400 hover:text-white'}`}
            >
              <Icons.Heart filled={liked} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="flex items-center gap-4">
              <button onClick={skipBack} className="text-gray-400 hover:text-white transition-colors">
                <Icons.SkipBack />
              </button>
              <button
                onClick={togglePlay}
                className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 hover:scale-105 transition-transform"
              >
                {isPlaying ? <Icons.Pause /> : <Icons.Play />}
              </button>
              <button onClick={skipForward} className="text-gray-400 hover:text-white transition-colors">
                <Icons.SkipForward />
              </button>
            </div>
            <div className="flex items-center gap-3 w-full max-w-md">
              <span className="text-xs text-gray-400 w-10 text-right">{formatTime(progress)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={progress}
                onChange={(e) => seek(Number(e.target.value))}
                className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
              <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume & Extras */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`transition-colors ${showLyrics ? 'text-pink-500' : 'text-gray-400 hover:text-white'}`}
            >
              <Icons.Mic />
            </button>
            <div className="flex items-center gap-2">
              <Icons.Volume />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lyrics Panel */}
      {showLyrics && (
        <div className="fixed bottom-24 right-4 w-80 bg-black/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 z-50 max-h-64 overflow-y-auto">
          <h4 className="font-semibold text-white mb-2">Lyrics</h4>
          {lyrics.length > 0 ? (
            <div className="space-y-1">
              {lyrics.map((line, i) => (
                <p key={i} className="text-sm text-gray-300">{line}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading lyrics...</p>
          )}
        </div>
      )}
    </>
  );
};

// Home Page Component
const HomePage: React.FC<{ onPlayTrack: (track: Track) => void }> = ({ onPlayTrack }) => {
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [playlists] = useState<Playlist[]>(DEMO_PLAYLISTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch real tracks, fallback to demo
    const fetchTracks = async () => {
      try {
        const fetched = await musicService.searchTracks('trending');
        if (fetched.length > 0) setTracks(fetched);
      } catch (e) {
        console.log('Using demo tracks');
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-8 backdrop-blur-sm">
        <h1 className="text-4xl font-bold text-white mb-2">{getGreeting()}</h1>
        <p className="text-gray-300">Discover amazing music tailored for you</p>
      </div>

      {/* Featured Playlists */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Featured Playlists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-3">
                <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
              <p className="text-sm text-gray-400 truncate">{playlist.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Tracks */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Trending Now</h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <SkeletonLoader key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tracks.slice(0, 10).map((track) => (
              <TrackCard key={track.id} track={track} onPlay={onPlayTrack} />
            ))}
          </div>
        )}
      </section>

      {/* All Tracks */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">All Tracks</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} onPlay={onPlayTrack} />
          ))}
        </div>
      </section>
    </div>
  );
};

// Search Page Component
const SearchPage: React.FC<{ onPlayTrack: (track: Track) => void }> = ({ onPlayTrack }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const fetched = await musicService.searchTracks(debouncedQuery);
        setResults(fetched.length > 0 ? fetched : DEMO_TRACKS.filter(t => 
          t.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(debouncedQuery.toLowerCase())
        ));
      } catch (e) {
        setResults(DEMO_TRACKS.filter(t => 
          t.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(debouncedQuery.toLowerCase())
        ));
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  return (
    <div className="space-y-6 pb-32">
      <div className="sticky top-0 bg-black/80 backdrop-blur-xl z-40 py-4 -mx-4 px-4">
        <div className="relative">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search for songs, artists, albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icons.Search />
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <SkeletonLoader key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-20">
          <Icons.Music />
          <h3 className="text-xl font-semibold text-white mt-4">No results found</h3>
          <p className="text-gray-400">Try searching for something else</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Search Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {results.map((track) => (
              <TrackCard key={track.id} track={track} onPlay={onPlayTrack} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Library Page Component
const LibraryPage: React.FC<{ onPlayTrack: (track: Track) => void }> = ({ onPlayTrack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'liked' | 'recent' | 'playlists'>('liked');

  const likedTracks = DEMO_TRACKS.slice(0, 5);
  const recentTracks = DEMO_TRACKS.slice(5, 10);
  const playlists = DEMO_PLAYLISTS;

  return (
    <div className="space-y-6 pb-32">
      <h1 className="text-3xl font-bold text-white">Your Library</h1>

      <div className="flex gap-2 border-b border-white/10">
        {(['liked', 'recent', 'playlists'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {activeTab === 'liked' && likedTracks.map((track) => (
          <TrackCard key={track.id} track={track} onPlay={onPlayTrack} />
        ))}
        {activeTab === 'recent' && recentTracks.map((track) => (
          <TrackCard key={track.id} track={track} onPlay={onPlayTrack} />
        ))}
        {activeTab === 'playlists' && playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="aspect-square rounded-xl overflow-hidden mb-3">
              <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
            <p className="text-sm text-gray-400 truncate">{playlist.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Profile Page Component
const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 pb-32">
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{user.name}</h1>
            <p className="text-gray-300">{user.email}</p>
            <p className="text-sm text-gray-400 mt-2">Member since {new Date(user.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-3xl font-bold text-white">{Math.floor(user.stats.listeningTime / 3600)}</h3>
          <p className="text-gray-400">Hours Listened</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-3xl font-bold text-white">{user.stats.songsPlayed}</h3>
          <p className="text-gray-400">Songs Played</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-3xl font-bold text-white">{user.stats.likedSongs}</h3>
          <p className="text-gray-400">Liked Songs</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-3xl font-bold text-white">{user.stats.recentlyPlayed.length}</h3>
          <p className="text-gray-400">Recent Plays</p>
        </div>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-6 py-3 transition-colors"
      >
        <Icons.LogOut />
        <span>Sign Out</span>
      </button>
    </div>
  );
};

// Settings Page Component
const SettingsPage: React.FC = () => {
  const { user, updateUserPreferences } = useAuth();
  const [quality, setQuality] = useState(user?.preferences.audioQuality || 'high');
  const [autoplay, setAutoplay] = useState(user?.preferences.autoplay ?? true);
  const [theme, setTheme] = useState(user?.preferences.theme || 'dark');

  const handleSave = () => {
    if (user) {
      updateUserPreferences({ audioQuality: quality, autoplay, theme });
    }
  };

  return (
    <div className="space-y-6 pb-32">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Audio Quality</h3>
          <div className="space-y-2">
            {(['low', 'medium', 'high', 'lossless'] as const).map((q) => (
              <label key={q} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="quality"
                  checked={quality === q}
                  onChange={() => setQuality(q)}
                  className="accent-purple-500"
                />
                <span className="text-gray-300 capitalize">{q}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Playback</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
              className="accent-purple-500"
            />
            <span className="text-gray-300">Autoplay next track</span>
          </label>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
          <div className="space-y-2">
            {(['dark', 'light', 'auto'] as const).map((t) => (
              <label key={t} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === t}
                  onChange={() => setTheme(t)}
                  className="accent-purple-500"
                />
                <span className="text-gray-300 capitalize">{t}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-8 py-3 font-semibold text-white hover:scale-105 transition-transform"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Auth Pages Component
const AuthPages: React.FC = () => {
  const { login, signup, error } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      login(email, password);
    } else {
      signup(name, email, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-6 py-3 mb-4">
            <Icons.Music />
            <span className="text-xl font-bold text-white">Melodify</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-gray-400 mt-2">
            {isLogin ? 'Sign in to continue listening' : 'Join millions of music lovers'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl py-3 font-semibold text-white hover:scale-105 transition-transform"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

// Main App Content
const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { playTrack } = usePlayer();
  const [currentPage, setCurrentPage] = useState<'home' | 'search' | 'library' | 'profile' | 'settings'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-6 py-3 mb-4 animate-pulse">
            <Icons.Music />
            <span className="text-xl font-bold text-white">Melodify</span>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPages />;
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: Icons.Home },
    { id: 'search', label: 'Search', icon: Icons.Search },
    { id: 'library', label: 'Library', icon: Icons.Library },
    { id: 'profile', label: 'Profile', icon: Icons.User },
    { id: 'settings', label: 'Settings', icon: Icons.Settings },
  ] as const;

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPlayTrack={playTrack} />;
      case 'search':
        return <SearchPage onPlayTrack={playTrack} />;
      case 'library':
        return <LibraryPage onPlayTrack={playTrack} />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-black/80 backdrop-blur-xl border-r border-white/10 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-4 py-2 mb-8">
            <Icons.Music />
            <span className="text-xl font-bold text-white">Melodify</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  currentPage === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 bg-black/80 backdrop-blur-xl border-b border-white/10 z-30 p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-4 py-2">
              <Icons.Music />
              <span className="font-bold text-white">Melodify</span>
            </div>
            <div className="w-6" />
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {renderPage()}
        </div>
      </main>

      {/* Player Bar */}
      <PlayerBar />
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </AuthProvider>
  );
};

export default App;
