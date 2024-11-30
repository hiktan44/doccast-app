import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class DocumentService {
  async readFile(file: File): Promise<string> {
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
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        resolve(text as string);
      };
      reader.onerror = (e) => reject(new Error('Dosya okunamadı'));
      reader.readAsText(file);
    });
  }

  private async readPdfFile(file: File): Promise<string> {
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