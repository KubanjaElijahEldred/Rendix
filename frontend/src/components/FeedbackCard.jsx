import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Download,
  Share,
  Maximize2,
  Minimize2
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAIStore } from '../store/aiStore';

export default function FeedbackCard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const audioRef = useRef(null);
  const textAreaRef = useRef(null);
  
  const { 
    currentResponse, 
    isProcessing, 
    processingType,
    audioData
  } = useAIStore();

  // Auto-scroll when new content is added
  useEffect(() => {
    if (textAreaRef.current && currentResponse?.content) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [currentResponse?.content]);

  // Handle audio playback
  useEffect(() => {
    if (audioData && audioRef.current) {
      const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration);
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current.currentTime);
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      
      return () => {
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [audioData]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = (speed) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadContent = () => {
    if (!currentResponse?.content) return;
    
    const blob = new Blob([currentResponse.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rendix-${processingType}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Content downloaded!');
  };

  const shareContent = async () => {
    if (!currentResponse?.content) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Rendix AI Response',
          text: currentResponse.content,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(currentResponse.content);
        toast.success('Content copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share content');
    }
  };

  const getStatusText = () => {
    if (isProcessing) {
      switch (processingType) {
        case 'ocr': return 'Scanning document...';
        case 'explain': return 'Generating explanation...';
        case 'translate': return 'Translating text...';
        case 'tts': return 'Converting to speech...';
        case 'pdf': return 'Creating PDF...';
        case 'report': return 'Generating report...';
        default: return 'Processing...';
      }
    }
    return 'Ready';
  };

  return (
    <div className={`
      glass-morphism rounded-2xl overflow-hidden transition-all duration-300
      ${isFullscreen ? 'fixed inset-4 z-50' : 'relative'}
    `}>
      {/* Hidden audio element */}
      <audio ref={audioRef} />
      
      {/* Header */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`}></div>
            <h3 className="font-semibold text-white">Live Feedback</h3>
            <span className="text-xs text-gray-400">{getStatusText()}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadContent}
              disabled={!currentResponse?.content}
              className="p-2 rounded-lg hover:bg-glass transition-colors disabled:opacity-50"
            >
              <Download size={16} className="text-gray-400" />
            </button>
            
            <button
              onClick={shareContent}
              disabled={!currentResponse?.content}
              className="p-2 rounded-lg hover:bg-glass transition-colors disabled:opacity-50"
            >
              <Share size={16} className="text-gray-400" />
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-glass transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 size={16} className="text-gray-400" />
              ) : (
                <Maximize2 size={16} className="text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        <div 
          ref={textAreaRef}
          className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 bg-glass rounded-lg"
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-8"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="loading-dna"></div>
                  <p className="text-gray-400 animate-pulse">{getStatusText()}</p>
                </div>
              </motion.div>
            ) : currentResponse?.content ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">
                    {currentResponse.content}
                  </pre>
                </div>
                
                {currentResponse.metadata && (
                  <div className="text-xs text-gray-500 pt-4 border-t border-glass-border">
                    <p>Type: {currentResponse.type}</p>
                    <p>Processed: {new Date(currentResponse.timestamp).toLocaleString()}</p>
                    {currentResponse.metadata.tokens && (
                      <p>Tokens used: {currentResponse.metadata.tokens}</p>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <p className="text-gray-500">
                  Select a function to see AI responses here...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="p-4 border-t border-glass-border">
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400 w-12">
              {formatTime(currentTime)}
            </span>
            
            <div className="flex-1 h-2 bg-glass rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rendix-blue to-cyan-500 transition-all duration-300"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              ></div>
            </div>
            
            <span className="text-xs text-gray-400 w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSkip(-10)}
                disabled={!audioData}
                className="p-2 rounded-lg hover:bg-glass transition-colors disabled:opacity-50"
              >
                <SkipBack size={16} className="text-gray-400" />
              </button>
              
              <button
                onClick={togglePlayPause}
                disabled={!audioData}
                className="p-3 rounded-lg bg-gradient-to-r from-rendix-blue to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50"
              >
                {isPlaying ? (
                  <Pause size={20} className="text-white" />
                ) : (
                  <Play size={20} className="text-white" />
                )}
              </button>
              
              <button
                onClick={() => handleSkip(10)}
                disabled={!audioData}
                className="p-2 rounded-lg hover:bg-glass transition-colors disabled:opacity-50"
              >
                <SkipForward size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                disabled={!audioData}
                className="p-2 rounded-lg hover:bg-glass transition-colors disabled:opacity-50"
              >
                {isMuted ? (
                  <VolumeX size={16} className="text-gray-400" />
                ) : (
                  <Volume2 size={16} className="text-gray-400" />
                )}
              </button>
              
              <select
                value={playbackSpeed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                disabled={!audioData}
                className="px-2 py-1 text-xs bg-glass border border-glass-border rounded text-gray-300 disabled:opacity-50"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
