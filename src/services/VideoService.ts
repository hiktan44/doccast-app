export interface Avatar {
  id: string;
  name: string;
  previewUrl: string;
  gender: 'male' | 'female';
  style: 'casual' | 'business' | 'professional';
}

export interface VideoGeneration {
  id: string;
  scriptSectionId: string;
  audioUrl: string;
  videoUrl: string;
  avatarId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

export interface VideoGenerationOptions {
  resolution: '720p' | '1080p';
  background?: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
}

export class VideoService {
  private apiKey: string;
  private baseUrl = 'https://api.heygen.com/v1';

  constructor() {
    const apiKey = process.env.REACT_APP_HEYGEN_API_KEY;
    if (!apiKey) {
      throw new Error('HeyGen API anahtarı bulunamadı');
    }
    this.apiKey = apiKey;
  }

  async getAvatars(): Promise<Avatar[]> {
    try {
      const response = await fetch(`${this.baseUrl}/avatars`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Avatar listesi alınamadı');
      }

      const data = await response.json();
      return data.avatars;
    } catch (error) {
      console.error('Avatar listesi alma hatası:', error);
      throw new Error('Avatar listesi alınamadı');
    }
  }

  async generateVideo(
    audioUrl: string,
    avatarId: string,
    options: VideoGenerationOptions
  ): Promise<VideoGeneration> {
    try {
      // Video oluşturma isteği gönder
      const response = await fetch(`${this.baseUrl}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          avatar_id: avatarId,
          audio_url: audioUrl,
          resolution: options.resolution,
          background: options.background,
          aspect_ratio: options.aspectRatio
        })
      });

      if (!response.ok) {
        throw new Error('Video oluşturulamadı');
      }

      const data = await response.json();
      return {
        id: data.video_id,
        scriptSectionId: '', // Bu değer dışarıdan set edilecek
        audioUrl,
        videoUrl: '', // Bu URL video hazır olduğunda güncellenecek
        avatarId,
        status: 'processing',
        progress: 0
      };
    } catch (error) {
      console.error('Video oluşturma hatası:', error);
      throw new Error('Video oluşturulamadı');
    }
  }

  async checkVideoStatus(videoId: string): Promise<VideoGeneration> {
    try {
      const response = await fetch(`${this.baseUrl}/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Video durumu alınamadı');
      }

      const data = await response.json();
      
      return {
        id: videoId,
        scriptSectionId: '', // Dışarıdan set edilmeli
        audioUrl: data.audio_url,
        videoUrl: data.video_url,
        avatarId: data.avatar_id,
        status: data.status,
        progress: data.progress
      };
    } catch (error) {
      console.error('Video durum kontrol hatası:', error);
      throw new Error('Video durumu alınamadı');
    }
  }

  async generateVideosForSections(
    sections: Array<{ id: string; audioUrl: string }>,
    avatarId: string,
    options: VideoGenerationOptions
  ): Promise<VideoGeneration[]> {
    const videoGenerations: VideoGeneration[] = [];

    for (const section of sections) {
      try {
        const generation = await this.generateVideo(section.audioUrl, avatarId, options);
        generation.scriptSectionId = section.id;
        videoGenerations.push(generation);
      } catch (error: any) {
        videoGenerations.push({
          id: crypto.randomUUID(),
          scriptSectionId: section.id,
          audioUrl: section.audioUrl,
          videoUrl: '',
          avatarId,
          status: 'error',
          error: error.message
        });
      }
    }

    return videoGenerations;
  }
}