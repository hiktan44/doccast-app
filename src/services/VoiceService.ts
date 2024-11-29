export interface Voice {
  id: string;
  name: string;
  previewUrl?: string;
  settings?: VoiceSettings;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface AudioGeneration {
  id: string;
  scriptSectionId: string;
  audioUrl: string;
  duration: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export class VoiceService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    const apiKey = process.env.REACT_APP_ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API anahtarı bulunamadı');
    }
    this.apiKey = apiKey;
  }

  async getVoices(): Promise<Voice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error('Ses listesi alınamadı');
      }

      const data = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Ses listesi alma hatası:', error);
      throw new Error('Ses listesi alınamadı');
    }
  }

  async generateAudio(text: string, voiceId: string, settings?: VoiceSettings): Promise<ArrayBuffer> {
    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          voice_settings: settings
        })
      });

      if (!response.ok) {
        throw new Error('Ses oluşturulamadı');
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Ses oluşturma hatası:', error);
      throw new Error('Ses oluşturulamadı');
    }
  }

  createAudioUrl(audioBuffer: ArrayBuffer): string {
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  }

  async generateAudioForScript(
    scriptSections: { id: string; content: string }[], 
    voiceId: string
  ): Promise<AudioGeneration[]> {
    const audioGenerations: AudioGeneration[] = [];

    for (const section of scriptSections) {
      try {
        const audioBuffer = await this.generateAudio(section.content, voiceId);
        const audioUrl = this.createAudioUrl(audioBuffer);

        audioGenerations.push({
          id: crypto.randomUUID(),
          scriptSectionId: section.id,
          audioUrl,
          duration: 0, // Duration will be set when audio is loaded
          status: 'completed'
        });
      } catch (error: any) {
        audioGenerations.push({
          id: crypto.randomUUID(),
          scriptSectionId: section.id,
          audioUrl: '',
          duration: 0,
          status: 'error',
          error: error.message
        });
      }
    }

    return audioGenerations;
  }
}