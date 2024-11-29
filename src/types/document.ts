export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt';
  content: string;
  size: number;
  uploadDate: Date;
}

export interface DocumentError {
  message: string;
  code: string;
  details?: any;
}