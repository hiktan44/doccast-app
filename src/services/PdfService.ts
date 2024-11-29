import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class PdfService {
  async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n\n';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('PDF okuma hatası:', error);
      throw new Error('PDF dosyası okunamadı');
    }
  }
  
  async getPageCount(file: File): Promise<number> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      return pdf.numPages;
    } catch (error) {
      console.error('PDF sayfa sayısı alma hatası:', error);
      throw new Error('PDF sayfa sayısı alınamadı');
    }
  }
  
  async getMetadata(file: File): Promise<any> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      return await pdf.getMetadata();
    } catch (error) {
      console.error('PDF metadata alma hatası:', error);
      return null;
    }
  }
}