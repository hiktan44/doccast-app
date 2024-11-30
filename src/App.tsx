import React, { useState } from 'react';
import { FileUploader, UploadedFile } from './components/FileUploader';
import { ScriptGenerator } from './components/ScriptGenerator';

function App() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [generatedScript, setGeneratedScript] = useState<any>(null);

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFile(file);
    setGeneratedScript(null);
  };

  const handleScriptGenerated = (script: any) => {
    setGeneratedScript(script);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DocCast</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Dökümanlarınızı podcast'e dönüştürün
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
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

          {/* Oluşturulan Script */}
          {generatedScript && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {generatedScript.title}
              </h3>
              
              <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                <p>Toplam Süre: {Math.round(generatedScript.estimatedDuration)} saniye</p>
              </div>

              <div className="space-y-4">
                {generatedScript.sections.map((section: any) => (
                  <div
                    key={section.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {section.speaker}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {section.duration} saniye
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;