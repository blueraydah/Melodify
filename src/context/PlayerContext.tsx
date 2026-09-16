import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Track, SyncedLyrics } from '../types';
import { getStreamUrl, getLyrics } from '../services/music';

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
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [lyrics, setLyrics] = useState<SyncedLyrics['lines'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamUrlRef = useRef<string | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (queue.length > queueIndex + 1) {
        nextTrack();
      }
    };
    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setIsLoading(false);
      if (streamUrlRef.current) {
        streamUrlRef.current = null;
        setTimeout(() => {
          if (currentTrack) {
            playTrack(currentTrack, queue);
          }
        }, 1000);
      }
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playTrack = useCallback(async (track: Track, newQueue?: Track[]) => {
    try {
      setIsLoading(true);
      
      if (newQueue) {
        setQueue(newQueue);
        const trackIndex = newQueue.findIndex(t => t.id === track.id);
        setQueueIndex(trackIndex >= 0 ? trackIndex : 0);
      }
      
      setCurrentTrack(track);
      setCurrentTime(0);
      setLyrics(null);
      
      let url = streamUrlRef.current;
      
      if (!url || !streamUrlRef.current) {
        url = await getStreamUrl(track.videoId);
        
        if (!url) {
          console.warn('Could not get stream URL, using fallback');
          url = `https://www.youtube.com/watch?v=${track.videoId}`;
        }
        
        streamUrlRef.current = url;
      }
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
        
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          
          const fetchedLyrics = await getLyrics(track.title, track.artist, track.duration);
          setLyrics(fetchedLyrics);
        } catch (playError) {
          console.error('Playback failed:', playError);
          setIsPlaying(false);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing track:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [queue]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentTrack]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(Math.max(0, Math.min(1, vol)));
    setIsMuted(vol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      setQueueIndex(nextIndex);
      playTrack(queue[nextIndex]);
    } else {
      setIsPlaying(false);
    }
  }, [queue, queueIndex, playTrack]);

  const prevTrack = useCallback(() => {
    if (queue.length === 0) return;
    
    if (currentTime > 3) {
      seek(0);
      return;
    }
    
    const prevIndex = Math.max(0, queueIndex - 1);
    setQueueIndex(prevIndex);
    playTrack(queue[prevIndex]);
  }, [queue, queueIndex, currentTime, seek, playTrack]);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(0);
  }, []);

  return (
    <PlayerContext.Provider value={{
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
      nextTrack,
      prevTrack,
      addToQueue,
      clearQueue,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
