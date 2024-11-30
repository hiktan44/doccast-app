import { FFmpeg } from '@ffmpeg/ffmpeg';

export interface VideoSegment {
  id: string;
  videoUrl: string;
  startTime: number;
  endTime: number;
  order: number;
}

export interface VideoTransition {
  type: 'fade' | 'slide' | 'dissolve';
  duration: number;
}

export interface EditedVideo {
  id: string;
  segments: VideoSegment[];
  transitions: Record<string, VideoTransition>;
  duration: number;
}

export class VideoEditorService {
  private ffmpeg: FFmpeg | null = null;

  async trimVideo(videoUrl: string, startTime: number, endTime: number): Promise<string> {
    try {
      if (!this.ffmpeg) {
        const { createFFmpeg } = await import('@ffmpeg/ffmpeg');
        this.ffmpeg = createFFmpeg({ log: true });
        await this.ffmpeg.load();
      }

      const response = await fetch(videoUrl);
      const data = await response.arrayBuffer();
      this.ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(data));

      await this.ffmpeg.run(
        '-i', 'input.mp4',
        '-ss', startTime.toString(),
        '-t', (endTime - startTime).toString(),
        '-c', 'copy',
        'output.mp4'
      );

      const outputData = this.ffmpeg.FS('readFile', 'output.mp4');
      
      // Cleanup
      this.ffmpeg.FS('unlink', 'input.mp4');
      this.ffmpeg.FS('unlink', 'output.mp4');

      return URL.createObjectURL(
        new Blob([outputData.buffer], { type: 'video/mp4' })
      );
    } catch (error) {
      console.error('Video kesme hatası:', error);
      throw new Error('Video kesme işlemi başarısız oldu');
    }
  }

  async combineVideos(segments: VideoSegment[]): Promise<string> {
    try {
      if (!this.ffmpeg) {
        const { createFFmpeg } = await import('@ffmpeg/ffmpeg');
        this.ffmpeg = createFFmpeg({ log: true });
        await this.ffmpeg.load();
      }

      // Create concat list
      let concatContent = '';
      for (let i = 0; i < segments.length; i++) {
        const response = await fetch(segments[i].videoUrl);
        const data = await response.arrayBuffer();
        const fileName = `input${i}.mp4`;
        
        this.ffmpeg.FS('writeFile', fileName, new Uint8Array(data));
        concatContent += `file ${fileName}\n`;
      }

      this.ffmpeg.FS('writeFile', 'concat.txt', concatContent);

      await this.ffmpeg.run(
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c', 'copy',
        'output.mp4'
      );

      const outputData = this.ffmpeg.FS('readFile', 'output.mp4');

      // Cleanup
      segments.forEach((_, i) => {
        this.ffmpeg?.FS('unlink', `input${i}.mp4`);
      });
      this.ffmpeg.FS('unlink', 'concat.txt');
      this.ffmpeg.FS('unlink', 'output.mp4');

      return URL.createObjectURL(
        new Blob([outputData.buffer], { type: 'video/mp4' })
      );
    } catch (error) {
      console.error('Video birleştirme hatası:', error);
      throw new Error('Video birleştirme işlemi başarısız oldu');
    }
  }

  async addTransition(
    videoUrl: string,
    transitionType: VideoTransition['type'],
    duration: number
  ): Promise<string> {
    try {
      if (!this.ffmpeg) {
        const { createFFmpeg } = await import('@ffmpeg/ffmpeg');
        this.ffmpeg = createFFmpeg({ log: true });
        await this.ffmpeg.load();
      }

      const response = await fetch(videoUrl);
      const data = await response.arrayBuffer();
      this.ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(data));

      let filterComplex = '';
      switch (transitionType) {
        case 'fade':
          filterComplex = `fade=t=in:st=0:d=${duration/1000},fade=t=out:st=end_pts-${duration/1000}:d=${duration/1000}`;
          break;
        case 'dissolve':
          filterComplex = `dissolve,fade=t=in:st=0:d=${duration/1000}`;
          break;
        case 'slide':
          filterComplex = `slide=l=distance=${duration}`;
          break;
      }

      await this.ffmpeg.run(
        '-i', 'input.mp4',
        '-vf', filterComplex,
        '-c:a', 'copy',
        'output.mp4'
      );

      const outputData = this.ffmpeg.FS('readFile', 'output.mp4');

      // Cleanup
      this.ffmpeg.FS('unlink', 'input.mp4');
      this.ffmpeg.FS('unlink', 'output.mp4');

      return URL.createObjectURL(
        new Blob([outputData.buffer], { type: 'video/mp4' })
      );
    } catch (error) {
      console.error('Geçiş efekti ekleme hatası:', error);
      throw new Error('Geçiş efekti ekleme işlemi başarısız oldu');
    }
  }
}