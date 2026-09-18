import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Track, SyncedLyrics } from '../types';
import { musicService } from '../services/music';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  queueIndex: number;
  lyrics: SyncedLyrics['lines'] | null;
  isLoading: boolean;
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  skipForward: () => void;
  skipBack: () => void;
  progress: number;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [lyrics, setLyrics] = useState<SyncedLyrics['lines'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
      skipForward();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const playTrack = useCallback(async (track: Track, newQueue?: Track[]) => {
    setIsLoading(true);
    try {
      if (newQueue) {
        setQueue(newQueue);
        const index = newQueue.findIndex(t => t.id === track.id);
        setQueueIndex(index >= 0 ? index : 0);
      }

      setCurrentTrack(track);
      
      // Get stream URL
      let streamUrl = track.audioUrl;
      if (!streamUrl && track.videoId) {
        streamUrl = await musicService.getStreamUrl(track.videoId) || '';
      }

      if (streamUrl && audioRef.current) {
        audioRef.current.src = streamUrl;
        audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
        
        // Fetch lyrics
        const fetchedLyrics = await musicService.getLyrics(track.title, track.artist, track.duration);
        setLyrics(fetchedLyrics.map(l => ({ time: l.time, text: l.text })));
      }
    } catch (error) {
      console.error('Error playing track:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentTrack]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      setProgress(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol / 100;
      setVolumeState(vol);
      setIsMuted(vol === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  }, [isMuted]);

  const skipForward = useCallback(() => {
    if (queue.length === 0) return;
    
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      setQueueIndex(nextIndex);
      playTrack(queue[nextIndex]);
    }
  }, [queue, queueIndex, playTrack]);

  const skipBack = useCallback(() => {
    if (queue.length === 0) return;
    
    if (currentTime > 3) {
      seek(0);
    } else {
      const prevIndex = Math.max(0, queueIndex - 1);
      setQueueIndex(prevIndex);
      playTrack(queue[prevIndex]);
    }
  }, [queue, queueIndex, currentTime, seek, playTrack]);

  const value: PlayerContextType = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    queueIndex,
    lyrics,
    isLoading,
    playTrack,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    skipForward,
    skipBack,
    progress,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
