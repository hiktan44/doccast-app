export interface VideoGenerationOptions {
  dimension: {
    width: number;
    height: number;
  };
  aspectRatio: '16:9' | '9:16' | '1:1';
  resolution: '720p' | '1080p';
}