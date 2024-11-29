export interface VideoSegment {
  id: string;
  videoUrl: string;
  startTime: number;
  endTime: number;
  order: number;
}

export interface VideoTransition {
  type: 'fade' | 'slide' | 'dissolve';
  duration: number; // milliseconds
}

export interface EditedVideo {
  id: string;
  segments: VideoSegment[];
  transitions: Record<string, VideoTransition>; // key: segmentId
  duration: number;
}

export class VideoEditorService {
  // FFmpeg instance'ı başlat
  private async initFFmpeg() {
    const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg');
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    return { ffmpeg, fetchFile };
  }

  // Video kesme
  async trimVideo(videoUrl: string, startTime: number, endTime: number): Promise<string> {
    try {
      const { ffmpeg, fetchFile } = await this.initFFmpeg();

      // Video dosyasını yükle
      const videoData = await fetch(videoUrl).then(r => r.arrayBuffer());
      ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoData));

      // Kesme işlemi
      await ffmpeg.run(
        '-i', 'input.mp4',
        '-ss', startTime.toString(),
        '-t', (endTime - startTime).toString(),
        '-c', 'copy',
        'output.mp4'
      );

      // Sonucu al
      const data = ffmpeg.FS('readFile', 'output.mp4');
      
      // Dosyaları temizle
      ffmpeg.FS('unlink', 'input.mp4');
      ffmpeg.FS('unlink', 'output.mp4');

      // Yeni URL oluştur
      return URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    } catch (error) {
      console.error('Video kesme hatası:', error);
      throw new Error('Video kesme işlemi başarısız oldu');
    }
  }

  // Videoları birleştir
  async combineVideos(segments: VideoSegment[]): Promise<string> {
    try {
      const { ffmpeg, fetchFile } = await this.initFFmpeg();

      // Her segment için concat listesi oluştur
      let concatContent = '';
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const fileName = `input${i}.mp4`;

        // Video dosyasını yükle
        const videoData = await fetch(segment.videoUrl).then(r => r.arrayBuffer());
        ffmpeg.FS('writeFile', fileName, await fetchFile(videoData));

        concatContent += `file ${fileName}\n`;
      }

      // Concat listesi dosyası oluştur
      ffmpeg.FS('writeFile', 'concat.txt', concatContent);

      // Videoları birleştir
      await ffmpeg.run(
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c', 'copy',
        'output.mp4'
      );

      // Sonucu al
      const data = ffmpeg.FS('readFile', 'output.mp4');

      // Dosyaları temizle
      segments.forEach((_, i) => {
        ffmpeg.FS('unlink', `input${i}.mp4`);
      });
      ffmpeg.FS('unlink', 'concat.txt');
      ffmpeg.FS('unlink', 'output.mp4');

      return URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    } catch (error) {
      console.error('Video birleştirme hatası:', error);
      throw new Error('Video birleştirme işlemi başarısız oldu');
    }
  }

  // Geçiş efekti ekle
  async addTransition(
    videoUrl: string,
    transitionType: VideoTransition['type'],
    duration: number
  ): Promise<string> {
    try {
      const { ffmpeg, fetchFile } = await this.initFFmpeg();

      // Video dosyasını yükle
      const videoData = await fetch(videoUrl).then(r => r.arrayBuffer());
      ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoData));

      // Geçiş efekti komutları
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

      // Efekti uygula
      await ffmpeg.run(
        '-i', 'input.mp4',
        '-vf', filterComplex,
        '-c:a', 'copy',
        'output.mp4'
      );

      // Sonucu al
      const data = ffmpeg.FS('readFile', 'output.mp4');

      // Dosyaları temizle
      ffmpeg.FS('unlink', 'input.mp4');
      ffmpeg.FS('unlink', 'output.mp4');

      return URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    } catch (error) {
      console.error('Geçiş efekti ekleme hatası:', error);
      throw new Error('Geçiş efekti ekleme işlemi başarısız oldu');
    }
  }
}