import React, { useState } from 'react';
import { FileUploader, UploadedFile } from './components/FileUploader';
import { ScriptGenerator } from './components/ScriptGenerator';
import { VoiceSelector } from './components/VoiceSelector';
import { Script } from './services/ScriptService';
import { VoiceGeneration } from './services/VoiceService';
import { APITester } from './components/APITester';

function App() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [generatedScript, setGeneratedScript] = useState<Script | null>(null);
  const [voiceGenerations, setVoiceGenerations] = useState<VoiceGeneration[]>([]);
  const [showApiTester, setShowApiTester] = useState(false);

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFile(file);
    setGeneratedScript(null);
    setVoiceGenerations([]);
  };

  const handleScriptGenerated = (script: Script) => {
    setGeneratedScript(script);
    setVoiceGenerations([]);
  };

  const handleVoicesGenerated = (generations: VoiceGeneration[]) => {
    setVoiceGenerations(generations);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DocCast</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Dokümanlarınızı podcast'e dönüştürün
              </p>
            </div>
            <button 
              onClick={() => setShowApiTester(!showApiTester)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {showApiTester ? 'Ana Sayfa' : 'API Test'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {showApiTester ? (
          <APITester />
        ) : (
          <div className="grid gap-6">
            {/* Dosya Yükleyici */}
            <FileUploader onFileUploaded={handleFileUpload} />

            {/* Dosya Bilgileri */}
            {uploadedFile && (
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Yüklenen Dosya</h3>
                <div className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                  <p><span className="font-medium">Ad:</span> {uploadedFile.file.name}</p>
                  <p><span className="font-medium">Tip:</span> {uploadedFile.type}</p>
                  <p><span className="font-medium">Boyut:</span> {(uploadedFile.file.size / 1024).toFixed(1)} KB</p>
                  {uploadedFile.type === 'document' && uploadedFile.content && (
                    <div>
                      <p className="font-medium mt-4 mb-2">İçerik Önizleme:</p>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        {uploadedFile.content.slice(0, 200)}
                        {uploadedFile.content.length > 200 ? '...' : ''}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Script Oluşturucu */}
            {uploadedFile?.type === 'document' && uploadedFile.content && (
              <ScriptGenerator
                documentContent={uploadedFile.content}
                onScriptGenerated={handleScriptGenerated}
              />
            )}

            {/* Script ve Ses Seçimi */}
            {generatedScript && (
              <div className="space-y-6">
                {/* Script Görünümü */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    {generatedScript.title}
                  </h3>
                  
                  <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <p>Toplam Süre: {Math.round(generatedScript.estimatedDuration / 60)} dakika</p>
                  </div>

                  <div className="space-y-4">
                    {generatedScript.sections.map((section) => (
                      <div
                        key={section.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {section.speaker}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {Math.round(section.duration)} saniye
                          </span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200">
                          {section.content}
                        </p>
                        {/* Ses Önizleme */}
                        {voiceGenerations.find(g => g.id === section.id)?.audioUrl && (
                          <div className="mt-4">
                            <audio 
                              src={voiceGenerations.find(g => g.id === section.id)?.audioUrl} 
                              controls 
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ses Seçici */}
                <VoiceSelector
                  script={generatedScript}
                  onVoicesGenerated={handleVoicesGenerated}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;