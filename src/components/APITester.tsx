import React, { useState } from 'react';
import { testGeminiAPI, testHeyGenAPI, testElevenLabsAPI } from '../utils/apiTester';

export const APITester: React.FC = () => {
  const [results, setResults] = useState<{
    gemini?: { success: boolean; message?: string; error?: string };
    heygen?: { success: boolean; message?: string; error?: string };
    elevenlabs?: { success: boolean; message?: string; error?: string };
  }>({});

  const [isLoading, setIsLoading] = useState({
    gemini: false,
    heygen: false,
    elevenlabs: false
  });

  const testAPIs = async () => {
    // Test Gemini
    setIsLoading(prev => ({ ...prev, gemini: true }));
    const geminiResult = await testGeminiAPI();
    setResults(prev => ({ ...prev, gemini: geminiResult }));
    setIsLoading(prev => ({ ...prev, gemini: false }));

    // Test HeyGen
    setIsLoading(prev => ({ ...prev, heygen: true }));
    const heygenResult = await testHeyGenAPI();
    setResults(prev => ({ ...prev, heygen: heygenResult }));
    setIsLoading(prev => ({ ...prev, heygen: false }));

    // Test ElevenLabs
    setIsLoading(prev => ({ ...prev, elevenlabs: true }));
    const elevenlabsResult = await testElevenLabsAPI();
    setResults(prev => ({ ...prev, elevenlabs: elevenlabsResult }));
    setIsLoading(prev => ({ ...prev, elevenlabs: false }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">API Test Paneli</h2>

        <button
          onClick={testAPIs}
          className="w-full mb-6 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Tüm API'leri Test Et
        </button>

        <div className="space-y-4">
          {/* Gemini API */}
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Gemini API</h3>
              {isLoading.gemini ? (
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent" />
              ) : results.gemini ? (
                <span className={results.gemini.success ? 'text-green-500' : 'text-red-500'}>
                  {results.gemini.success ? '✔' : '✘'}
                </span>
              ) : null}
            </div>
            {results.gemini && (
              <div className={`text-sm ${results.gemini.success ? 'text-green-600' : 'text-red-600'}`}>
                {results.gemini.message || results.gemini.error}
              </div>
            )}
          </div>

          {/* HeyGen API */}
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">HeyGen API</h3>
              {isLoading.heygen ? (
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent" />
              ) : results.heygen ? (
                <span className={results.heygen.success ? 'text-green-500' : 'text-red-500'}>
                  {results.heygen.success ? '✔' : '✘'}
                </span>
              ) : null}
            </div>
            {results.heygen && (
              <div className={`text-sm ${results.heygen.success ? 'text-green-600' : 'text-red-600'}`}>
                {results.heygen.message || results.heygen.error}
              </div>
            )}
          </div>

          {/* ElevenLabs API */}
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">ElevenLabs API</h3>
              {isLoading.elevenlabs ? (
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent" />
              ) : results.elevenlabs ? (
                <span className={results.elevenlabs.success ? 'text-green-500' : 'text-red-500'}>
                  {results.elevenlabs.success ? '✔' : '✘'}
                </span>
              ) : null}
            </div>
            {results.elevenlabs && (
              <div className={`text-sm ${results.elevenlabs.success ? 'text-green-600' : 'text-red-600'}`}>
                {results.elevenlabs.message || results.elevenlabs.error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
