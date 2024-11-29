import React, { useEffect, useState } from 'react';
import {
  VoiceService,
  Voice,
  AudioGeneration
} from '../../services/VoiceService';
import { Script } from '../../services/ScriptGeneratorService';
import { SpeakerWaveIcon, PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  script: Script;
  onAudioGenerated?: (audioGenerations: AudioGeneration[]) => void;
}

export const VoiceSelector: React.FC<Props> = ({ script, onAudioGenerated }) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const voiceService = new VoiceService();

  useEffect(() => {
    loadVoices();
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
      const sampleText = 'İyi günler! Bu benim sesim. Size yardımcı olmak için buradayım.';
      const audioBuffer = await voiceService.generateAudio(sampleText, voice.id);
      const audioUrl = voiceService.createAudioUrl(audioBuffer);

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
      const audioGenerations = await voiceService.generateAudioForScript(
        script.sections,
        selectedVoice.id
      );
      onAudioGenerated?.(audioGenerations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-xl font-medium mb-6">Ses Seçimi</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {voices.map((voice) => (
          <div
            key={voice.id}
            className={`p-4 rounded-lg border-2 cursor-pointer
              ${selectedVoice?.id === voice.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}`}
            onClick={() => handleVoiceSelect(voice)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{voice.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(voice);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
        className={`w-full py-2 px-4 rounded-md flex items-center justify-center space-x-2
          ${!selectedVoice || isLoading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
      >
        {isLoading ? (
          <>
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
            <span>Ses Oluşturuluyor...</span>
          </>
        ) : (
          <>
            <SpeakerWaveIcon className="w-5 h-5" />
            <span>Seslendirmeyi Başlat</span>
          </>
        )}
      </button>
    </div>
  );
};
