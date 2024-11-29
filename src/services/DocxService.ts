import mammoth from 'mammoth';

export class DocxService {
  async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (result.messages.length > 0) {
        console.warn('DOCX dönüştürme uyarıları:', result.messages);
      }
      
      return result.value;
    } catch (error) {
      console.error('DOCX okuma hatası:', error);
      throw new Error('DOCX dosyası okunamadı');
    }
  }

  async extractFormattedText(file: File): Promise<{ value: string; html: string }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const [textResult, htmlResult] = await Promise.all([
        mammoth.extractRawText({ arrayBuffer }),
        mammoth.convertToHtml({ arrayBuffer })
      ]);

      return {
        value: textResult.value,
        html: htmlResult.value
      };
    } catch (error) {
      console.error('DOCX okuma hatası:', error);
      throw new Error('DOCX dosyası okunamadı');
    }
  }

  async getMetadata(file: File): Promise<any> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // DOCX metadata extraction can be added here
      return {};
    } catch (error) {
      console.error('DOCX metadata alma hatası:', error);
      return null;
    }
  }
}