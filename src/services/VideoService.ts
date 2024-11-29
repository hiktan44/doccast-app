export interface Avatar {
  id: string;
  name: string;
  previewUrl: string;
  style: 'normal' | 'style1' | 'style2';
  type: 'avatar';
}

export interface VideoGeneration {
  id: string;
  scriptSectionId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  videoUrl?: string;
  progress?: number;
  error?: string;
}

export interface VideoGenerationOptions {
  dimension: {
    width: number;
    height: number;
  };
}

export class VideoService {
  private apiKey: string;
  private baseUrl = 'https://api.heygen.com';

  constructor() {
    const apiKey = process.env.REACT_APP_HEYGEN_API_KEY;
    if (!apiKey) {
      throw new Error('HeyGen API anahtarı bulunamadı');
    }
    this.apiKey = apiKey;
  }

  async getAvatars(): Promise<Avatar[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/avatars`, {
        headers: {
          'X-Api-Key': this.apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Avatar listesi alınamadı');
      }

      const data = await response.json();
      return data.data.map((avatar: any) => ({
        id: avatar.avatar_id,
        name: avatar.name,
        previewUrl: avatar.preview_url,
        style: avatar.style || 'normal',
        type: 'avatar'
      }));
    } catch (error) {
      console.error('Avatar listesi alma hatası:', error);
      throw new Error('Avatar listesi alınamadı');
    }
  }

  async generateVideo(
    text: string,
    voiceId: string,
    avatarId: string,
    options: VideoGenerationOptions
  ): Promise<VideoGeneration> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/video/generate`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_inputs: [{
            character: {
              type: 'avatar',
              avatar_id: avatarId,
              avatar_style: 'normal'
            },
            voice: {
              type: 'text',
              input_text: text,
              voice_id: voiceId,
              speed: 1.0
            }
          }],
          dimension: options.dimension
        })
      });

      if (!response.ok) {
        throw new Error('Video oluşturulamadı');
      }

      const data = await response.json();
      return {
        id: data.video_id,
        scriptSectionId: '', // Dışarıdan set edilecek
        status: 'processing'
      };
    } catch (error) {
      console.error('Video oluşturma hatası:', error);
      throw new Error('Video oluşturulamadı');
    }
  }

  async checkVideoStatus(videoId: string): Promise<VideoGeneration> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v1/video_status.get?video_id=${videoId}`,
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Video durumu alınamadı');
      }

      const data = await response.json();
      
      return {
        id: videoId,
        scriptSectionId: '', // Dışarıdan set edilmeli
        status: data.status,
        videoUrl: data.video_url,
        progress: data.progress || 0
      };
    } catch (error) {
      console.error('Video durum kontrol hatası:', error);
      throw new Error('Video durumu alınamadı');
    }
  }

  async generateVideosForSections(
    sections: Array<{ id: string; text: string; voiceId: string }>,
    avatarId: string,
    options: VideoGenerationOptions
  ): Promise<VideoGeneration[]> {
    const videoGenerations: VideoGeneration[] = [];

    for (const section of sections) {
      try {
        const generation = await this.generateVideo(
          section.text,
          section.voiceId,
          avatarId,
          options
        );
        generation.scriptSectionId = section.id;
        videoGenerations.push(generation);
      } catch (error: any) {
        videoGenerations.push({
          id: crypto.randomUUID(),
          scriptSectionId: section.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return videoGenerations;
  }
}