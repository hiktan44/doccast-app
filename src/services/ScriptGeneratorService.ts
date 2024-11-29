import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document } from '../types/document';

export interface Script {
  id: string;
  documentId: string;
  title: string;
  description: string;
  sections: ScriptSection[];
  metadata: ScriptMetadata;
}

export interface ScriptSection {
  id: string;
  speaker: string;
  content: string;
  duration: number; // tahmini süre (saniye)
  order: number;
}

export interface ScriptMetadata {
  totalDuration: number;
  speakerCount: number;
  wordCount: number;
  createdAt: Date;
  lastModified: Date;
}

export class ScriptGeneratorService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!process.env.REACT_APP_GEMINI_API_KEY) {
      throw new Error('Gemini API anahtarı bulunamadı');
    }
    this.genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
  }

  async generateScript(document: Document): Promise<Script> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Bu dökümanı iki kişilik bir podcast scriptine dönüştür:

${document.content}

Şu formatı kullan:
- Doğal ve sohbet havasında olsun
- Teknik konuları basitleştirerek anlat
- Konuyu mantıklı bölümlere ayır
- Her bölüm için konuşmacı belirt (Host ve Konuşmacı)
- Her bölüm için yaklaşık süre belirt

Ayrıca podcast için başlık ve kısa bir açıklama da oluştur.
`;

      const result = await model.generateContent(prompt);
      const scriptText = result.response.text();
      
      return this.parseScriptText(scriptText, document.id);
    } catch (error) {
      console.error('Script oluşturma hatası:', error);
      throw new Error('Script oluşturulamadı');
    }
  }

  private parseScriptText(text: string, documentId: string): Script {
    // Başlık ve açıklamayı ayıkla
    const titleMatch = text.match(/Başlık:\s*(.+)\n/);
    const descriptionMatch = text.match(/Açıklama:\s*(.+)\n/);

    // Bölümleri parse et
    const sections = text
      .split(/\n\n+/)
      .filter(section => section.includes(':'))
      .map((section, index) => {
        const [speaker, ...contentParts] = section.split(':');
        const content = contentParts.join(':').trim();
        
        // Süre tahmini (her 150 kelime ~1 dakika)
        const wordCount = content.split(/\s+/).length;
        const duration = Math.ceil(wordCount / 150 * 60);

        return {
          id: crypto.randomUUID(),
          speaker: speaker.trim(),
          content,
          duration,
          order: index
        };
      });

    const totalWordCount = sections.reduce((sum, section) => 
      sum + section.content.split(/\s+/).length, 0
    );

    return {
      id: crypto.randomUUID(),
      documentId,
      title: titleMatch?.[1] || 'Isimsiz Podcast',
      description: descriptionMatch?.[1] || 'Açıklama bulunamadı',
      sections,
      metadata: {
        totalDuration: sections.reduce((sum, section) => sum + section.duration, 0),
        speakerCount: new Set(sections.map(s => s.speaker)).size,
        wordCount: totalWordCount,
        createdAt: new Date(),
        lastModified: new Date()
      }
    };
  }

  async improveSection(section: ScriptSection): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
Bu podcast bölümünü daha doğal ve akıcı hale getir:

${section.content}

Konuşmacı: ${section.speaker}

Şunlara dikkat et:
- Doğal bir konuşma tonu kullan
- Teknik terimleri basitleştir
- Dinleyiciyi sıkmayacak şekilde düzenle
`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Bölüm iyileştirme hatası:', error);
      throw new Error('Bölüm iyileştirilemedi');
    }
  }
}