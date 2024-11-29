import React, { useEffect, useState } from 'react';
import {
  VideoService,
  Avatar,
  VideoGeneration,
  VideoGenerationOptions
} from '../../services/VideoService';
import {
  VideoCameraIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Props {
  audioSections: Array<{ id: string; audioUrl: string }>;
  onVideoGenerated?: (videoGenerations: VideoGeneration[]) => void;
}

export const AvatarSelector: React.FC<Props> = ({ audioSections, onVideoGenerated }) => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoOptions, setVideoOptions] = useState<VideoGenerationOptions>({
    resolution: '1080p',
    aspectRatio: '16:9'
  });

  const videoService = new VideoService();

  useEffect(() => {
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    try {
      const availableAvatars = await videoService.getAvatars();
      setAvatars(availableAvatars);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleGenerate = async () => {
    if (!selectedAvatar) return;

    setIsLoading(true);
    setError(null);

    try {
      const videoGenerations = await videoService.generateVideosForSections(
        audioSections,
        selectedAvatar.id,
        videoOptions
      );
      onVideoGenerated?.(videoGenerations);

      // Video durumlarını kontrol et
      startStatusChecks(videoGenerations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startStatusChecks = (generations: VideoGeneration[]) => {
    const processingVideos = generations.filter(g => g.status === 'processing');
    
    processingVideos.forEach(video => {
      const checkStatus = async () => {
        try {
          const status = await videoService.checkVideoStatus(video.id);
          
          if (status.status === 'completed' || status.status === 'error') {
            // Güncellenen durumu bildir
            onVideoGenerated?.(generations.map(g =>
              g.id === video.id ? { ...g, ...status } : g
            ));
          } else {
            // Hala işleniyor, 5 saniye sonra tekrar kontrol et
            setTimeout(checkStatus, 5000);
          }
        } catch (error) {
          console.error('Video durum kontrol hatası:', error);
        }
      };

      checkStatus();
    });
  };

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-xl font-medium mb-6">Avatar Seçimi</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {avatars.map((avatar) => (
          <div
            key={avatar.id}
            onClick={() => handleAvatarSelect(avatar)}
            className={`relative rounded-lg overflow-hidden cursor-pointer border-2
              ${selectedAvatar?.id === avatar.id
                ? 'border-blue-500'
                : 'border-transparent hover:border-gray-300'}`}
          >
            <img
              src={avatar.previewUrl}
              alt={avatar.name}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <span className="text-white font-medium">{avatar.name}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Çözünürlük</label>
          <select
            value={videoOptions.resolution}
            onChange={(e) => setVideoOptions(prev => ({
              ...prev,
              resolution: e.target.value as '720p' | '1080p'
            }))}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">En Boy Oranı</label>
          <select
            value={videoOptions.aspectRatio}
            onChange={(e) => setVideoOptions(prev => ({
              ...prev,
              aspectRatio: e.target.value as '16:9' | '9:16' | '1:1'
            }))}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="16:9">Yatay (16:9)</option>
            <option value="9:16">Dikey (9:16)</option>
            <option value="1:1">Kare (1:1)</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!selectedAvatar || isLoading}
        className={`w-full py-2 px-4 rounded-md flex items-center justify-center space-x-2
          ${!selectedAvatar || isLoading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
      >
        {isLoading ? (
          <>
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
            <span>Video Oluşturuluyor...</span>
          </>
        ) : (
          <>
            <VideoCameraIcon className="w-5 h-5" />
            <span>Video Oluşturmaya Başla</span>
          </>
        )}
      </button>
    </div>
  );
};
