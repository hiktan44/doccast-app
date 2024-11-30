export interface Voice {
  id: string;
  name: string;
  previewUrl?: string;
}

export interface VoiceGeneration {
  id: string;
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
      return data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        previewUrl: voice.preview_url
      }));
    } catch (error) {
      console.error('Ses listesi alma hatası:', error);
      throw new Error('Ses listesi alınamadı');
    }
  }

  async generateVoice(text: string, voiceId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        throw new Error('Ses oluşturulamadı');
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Ses oluşturma hatası:', error);
      throw new Error('Ses oluşturulamadı');
    }
  }

  async generateVoicesForScript(sections: Array<{ id: string; content: string }>, voiceId: string): Promise<VoiceGeneration[]> {
    const generations: VoiceGeneration[] = [];

    for (const section of sections) {
      try {
        const audioUrl = await this.generateVoice(section.content, voiceId);
        
        generations.push({
          id: section.id,
          audioUrl,
          duration: 0, // Audio yüklendiğinde güncellenecek
          status: 'completed'
        });
      } catch (error: any) {
        generations.push({
          id: section.id,
          audioUrl: '',
          duration: 0,
          status: 'error',
          error: error.message
        });
      }
    }

    return generations;
  }
}