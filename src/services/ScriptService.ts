import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Script {
  id: string;
  title: string;
  sections: ScriptSection[];
  estimatedDuration: number;
  createdAt: Date;
}

export interface ScriptSection {
  id: string;
  speaker: string;
  content: string;
  duration: number; // tahmini süre (saniye)
  order: number;
}

export class ScriptService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!process.env.REACT_APP_GEMINI_API_KEY) {
      throw new Error('Gemini API anahtarı bulunamadı');
    }
    this.genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
  }

  async generateScript(content: string): Promise<Script> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
Bu metni iki kişilik bir podcast scriptine dönüştür:

${content}

Şu formatta olsun:
1. Başlık: [başlık önerisi]
2. Konuşmacılar: Host ve Konuk
3. Her konuşmacı bölümü yeni satırda olsun
4. Doğal ve sohbet havasında olsun
5. Teknik konuları basitleştir
6. Her bölüm için yaklaşık konuşma süresi belirt

Örnek format:
Başlık: [başlık]

Host: [metin] (süre: X saniye)
Konuk: [metin] (süre: X saniye)
Host: [metin] (süre: X saniye)
...
`;

      const result = await model.generateContent(prompt);
      const scriptText = result.response.text();
      
      return this.parseScriptText(scriptText);
    } catch (error) {
      console.error('Script oluşturma hatası:', error);
      throw new Error('Script oluşturulamadı');
    }
  }

  private parseScriptText(text: string): Script {
    try {
      // Başlığı ayıkla
      const titleMatch = text.match(/Başlık:\s*(.+)/);
      const title = titleMatch ? titleMatch[1].trim() : 'Başlıksız Script';

      // Konuşmaları ayıkla
      const lines = text.split('\n').filter(line => line.trim());
      const sections: ScriptSection[] = [];
      let totalDuration = 0;

      lines.forEach((line, index) => {
        // Sadece konuşma satırlarını işle
        const speakerMatch = line.match(/(Host|Konuk):\s*(.+)\s*\(süre:\s*(\d+)\s*saniye\)/);
        if (speakerMatch) {
          const [, speaker, content, durationStr] = speakerMatch;
          const duration = parseInt(durationStr);
          
          sections.push({
            id: crypto.randomUUID(),
            speaker,
            content: content.trim(),
            duration,
            order: sections.length
          });

          totalDuration += duration;
        }
      });

      return {
        id: crypto.randomUUID(),
        title,
        sections,
        estimatedDuration: totalDuration,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Script ayrıştırma hatası:', error);
      throw new Error('Script ayrıştırılamadı');
    }
  }

  async improveSection(section: ScriptSection): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      
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