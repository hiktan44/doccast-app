import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import mammoth from 'mammoth';

// Worker'ı ayarla
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export class DocumentService {
  async readFile(file: File): Promise<string> {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();

      switch (extension) {
        case 'txt':
          return this.readTextFile(file);
        case 'pdf':
          return this.readPdfFile(file);
        case 'docx':
          return this.readDocxFile(file);
        default:
          throw new Error('Desteklenmeyen dosya formatı');
      }
    } catch (error) {
      console.error('Dosya okuma hatası:', error);
      throw error;
    }
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Dosya okunamadı'));
      reader.readAsText(file);
    });
  }

  private async readPdfFile(file: File): Promise<string> {
    try {
      // PDF dosyasını array buffer olarak oku
      const buffer = await file.arrayBuffer();
      
      // PDF dökümanını yükle
      const pdfDoc = await getDocument(new Uint8Array(buffer)).promise;
      
      let fullText = '';
      
      // Her sayfayı oku
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item: any) => item.str.trim().length > 0)
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n\n';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('PDF okuma hatası:', error);
      throw new Error('PDF dosyası okunamadı: ' + (error as Error).message);
    }
  }

  private async readDocxFile(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    } catch (error) {
      console.error('DOCX okuma hatası:', error);
      throw new Error('DOCX dosyası okunamadı');
    }
  }
}