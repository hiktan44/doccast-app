import { Document } from '../types/document';
import { PdfService } from './PdfService';
import { DocxService } from './DocxService';

export class DocumentService {
  private pdfService: PdfService;
  private docxService: DocxService;

  constructor() {
    this.pdfService = new PdfService();
    this.docxService = new DocxService();
  }

  async readFile(file: File): Promise<Document> {
    try {
      const content = await this.parseFile(file);
      
      return {
        id: crypto.randomUUID(),
        name: file.name,
        type: this.getFileType(file),
        content,
        size: file.size,
        uploadDate: new Date()
      };
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('Dosya okuma hatası');
    }
  }

  private async parseFile(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'txt':
        return await this.readTextFile(file);
      case 'pdf':
        return await this.pdfService.extractText(file);
      case 'docx':
        return await this.docxService.extractText(file);
      default:
        throw new Error('Desteklenmeyen dosya formatı');
    }
  }

  private getFileType(file: File): 'pdf' | 'docx' | 'txt' {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'pdf';
      case 'docx': return 'docx';
      case 'txt': return 'txt';
      default:
        throw new Error('Desteklenmeyen dosya formatı');
    }
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('TXT dosyası okunamadı'));
      reader.readAsText(file);
    });
  }

  async getFormattedContent(file: File): Promise<{ text: string; html?: string }> {
    const type = this.getFileType(file);
    
    switch (type) {
      case 'docx': {
        const result = await this.docxService.extractFormattedText(file);
        return { text: result.value, html: result.html };
      }
      case 'pdf': {
        const text = await this.pdfService.extractText(file);
        return { text };
      }
      case 'txt': {
        const text = await this.readTextFile(file);
        return { text };
      }
      default:
        throw new Error('Desteklenmeyen dosya formatı');
    }
  }
}