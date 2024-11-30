import { GoogleGenerativeAI } from '@google/generative-ai';

export async function testGeminiAPI() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Merhaba, bu bir test mesajıdır.");
    return {
      success: true,
      message: result.response.text()
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

export async function testHeyGenAPI() {
  try {
    const response = await fetch('https://api.heygen.com/v2/avatars', {
      headers: {
        'X-Api-Key': process.env.REACT_APP_HEYGEN_API_KEY || '',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: `${data.data.length} avatar bulundu`
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

export async function testElevenLabsAPI() {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.REACT_APP_ELEVENLABS_API_KEY || '',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: `${data.voices.length} ses bulundu`
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}