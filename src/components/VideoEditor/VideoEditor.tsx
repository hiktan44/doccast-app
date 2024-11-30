import React, { useEffect, useRef, useState } from 'react';
import { VideoSegment, VideoTransition, VideoEditorService } from '../../services/VideoEditorService';
import { ScissorsIcon, PlayIcon, PauseIcon, TrashIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface Props {
  videoUrl: string;
  onVideoEdited?: (editedVideoUrl: string) => void;
}

export const VideoEditor: React.FC<Props> = ({ videoUrl, onVideoEdited }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<VideoSegment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transitions, setTransitions] = useState<Record<string, VideoTransition>>({}); // segmentId: transition

  const editorService = new VideoEditorService();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.onloadedmetadata = () => {
        setDuration(videoRef.current?.duration || 0);
      };
      videoRef.current.ontimeupdate = () => {
        setCurrentTime(videoRef.current?.currentTime || 0);
      };
    }
  }, [videoUrl]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const createSegment = async () => {
    if (!videoRef.current) return;

    const startTime = currentTime;
    const endTime = Math.min(currentTime + 10, duration); // Varsayılan 10 saniye veya videonun sonuna kadar

    const currentSegment: VideoSegment = {
      id: crypto.randomUUID(),
      videoUrl,
      startTime,
      endTime,
      order: segments.length
    };

    try {
      setIsProcessing(true);
      const trimmedVideoUrl = await editorService.trimVideo(
        videoUrl,
        startTime,
        endTime
      );

      setSegments(prev => [...prev, { ...currentSegment, videoUrl: trimmedVideoUrl }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteSegment = (segmentId: string) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
    if (transitions[segmentId]) {
      const newTransitions = { ...transitions };
      delete newTransitions[segmentId];
      setTransitions(newTransitions);
    }
  };

  const updateSegmentOrder = (segmentId: string, direction: 'up' | 'down') => {
    setSegments(prev => {
      const index = prev.findIndex(s => s.id === segmentId);
      if (index === -1) return prev;

      const newSegments = [...prev];
      if (direction === 'up' && index > 0) {
        [newSegments[index], newSegments[index - 1]] = [newSegments[index - 1], newSegments[index]];
      } else if (direction === 'down' && index < prev.length - 1) {
        [newSegments[index], newSegments[index + 1]] = [newSegments[index + 1], newSegments[index]];
      }

      return newSegments.map((s, i) => ({ ...s, order: i }));
    });
  };

  const addTransition = async (segmentId: string, type: VideoTransition['type']) => {
    const transition: VideoTransition = {
      type,
      duration: 1000 // 1 saniye
    };

    try {
      const segment = segments.find(s => s.id === segmentId);
      if (!segment) return;

      setIsProcessing(true);
      const processedVideoUrl = await editorService.addTransition(
        segment.videoUrl,
        type,
        transition.duration
      );

      setSegments(prev => prev.map(s =>
        s.id === segmentId ? { ...s, videoUrl: processedVideoUrl } : s
      ));

      setTransitions(prev => ({ ...prev, [segmentId]: transition }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const combineSegments = async () => {
    if (segments.length === 0) return;

    try {
      setIsProcessing(true);
      const orderedSegments = [...segments].sort((a, b) => a.order - b.order);
      const combinedVideoUrl = await editorService.combineVideos(orderedSegments);
      onVideoEdited?.(combinedVideoUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Video Player */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full"
            onClick={handlePlayPause}
            controls={false}
          />
        </div>

        {/* Video Controls */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePlayPause}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Timeline */}
          <div
            className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
            onClick={handleTimelineClick}
          >
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          {/* Editing Controls */}
          <div className="flex justify-between items-center">
            <div className="space-x-2">
              <button
                onClick={createSegment}
                disabled={isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
              >
                <ScissorsIcon className="w-5 h-5" />
                <span>Bölüm Oluştur</span>
              </button>

              {segments.length > 0 && (
                <button
                  onClick={combineSegments}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
                >
                  <span>Birleştir</span>
                </button>
              )}
            </div>

            {isProcessing && (
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-white" />
                <span>İşleniyor...</span>
              </div>
            )}
          </div>
        </div>

        {/* Segments */}
        {segments.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Bölümler</h4>
            <div className="space-y-2">
              {segments
                .sort((a, b) => a.order - b.order)
                .map((segment) => (
                  <div
                    key={segment.id}
                    className={`p-4 rounded-lg border-2
                      ${selectedSegment?.id === segment.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">
                          Bölüm {segment.order + 1}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateSegmentOrder(segment.id, 'up')}
                          disabled={segment.order === 0}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => updateSegmentOrder(segment.id, 'down')}
                          disabled={segment.order === segments.length - 1}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => setSelectedSegment(segment)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <AdjustmentsHorizontalIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteSegment(segment.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {selectedSegment?.id === segment.id && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <h5 className="font-medium mb-2">Geçiş Efekti</h5>
                        <div className="grid grid-cols-3 gap-2">
                          {(['fade', 'dissolve', 'slide'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => addTransition(segment.id, type)}
                              className={`p-2 rounded border text-center transition-colors
                                ${transitions[segment.id]?.type === type
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'border-gray-300 hover:border-gray-400'}`}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
