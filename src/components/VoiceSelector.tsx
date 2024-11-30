import React, { useEffect, useState } from 'react';
import { Voice, VoiceGeneration, VoiceService } from '../services/VoiceService';
import { Script } from '../services/ScriptService';
import { SpeakerWaveIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

interface Props {
  script: Script;
  onVoicesGenerated: (generations: VoiceGeneration[]) => void;
}

export const VoiceSelector: React.FC<Props> = ({ script, onVoicesGenerated }) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const voiceService = new VoiceService();

  useEffect(() => {
    loadVoices();
    return () => {
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.src = '';
      }
    };
  }, []);

  const loadVoices = async () => {
    try {
      const availableVoices = await voiceService.getVoices();
      setVoices(availableVoices);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVoiceSelect = (voice: Voice) => {
    setSelectedVoice(voice);
    if (previewAudio) {
      previewAudio.pause();
      setIsPlaying(false);
    }
  };

  const handlePreview = async (voice: Voice) => {
    if (isPlaying && previewAudio) {
      previewAudio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setError(null);
      const previewText = 'Merhaba, ben podcast sunucunuz. Size yardımcı olmaktan mutluluk duyarım.';
      const audioUrl = await voiceService.generateVoice(previewText, voice.id);

      if (previewAudio) {
        previewAudio.src = audioUrl;
      } else {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        setPreviewAudio(audio);
      }

      await previewAudio?.play();
      setIsPlaying(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerate = async () => {
    if (!selectedVoice) return;

    setIsLoading(true);
    setError(null);

    try {
      const generations = await voiceService.generateVoicesForScript(
        script.sections,
        selectedVoice.id
      );
      onVoicesGenerated(generations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
        Ses Seçimi
      </h3>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {voices.map((voice) => (
          <div
            key={voice.id}
            onClick={() => handleVoiceSelect(voice)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors
              ${selectedVoice?.id === voice.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 dark:text-white">
                {voice.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(voice);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                {isPlaying && selectedVoice?.id === voice.id ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={!selectedVoice || isLoading}
        className={`w-full py-2 px-4 rounded-md flex items-center justify-center space-x-2 text-white transition-colors
          ${!selectedVoice || isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        <SpeakerWaveIcon className="w-5 h-5" />
        <span>{isLoading ? 'Ses Oluşturuluyor...' : 'Seslendirmeyi Başlat'}</span>
      </button>
    </div>
  );
};
