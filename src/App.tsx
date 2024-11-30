import React, { useState } from 'react';
import { FileUploader, UploadedFile } from './components/FileUploader';

function App() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFile(file);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-2xl font-bold">DocCast</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="space-y-6">
          {/* Dosya Yükleyici */}
          <FileUploader onFileUploaded={handleFileUpload} />

          {/* Dosya Bilgileri */}
          {uploadedFile && (
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="font-medium mb-4">Yüklenen Dosya</h3>
              <div className="text-sm space-y-2">
                <p><span className="font-medium">Ad:</span> {uploadedFile.file.name}</p>
                <p><span className="font-medium">Tip:</span> {uploadedFile.type}</p>
                <p><span className="font-medium">Boyut:</span> {(uploadedFile.file.size / 1024).toFixed(1)} KB</p>
                {uploadedFile.type === 'document' && uploadedFile.content && (
                  <div>
                    <p className="font-medium mt-4 mb-2">İçerik Önizleme:</p>
                    <div className="p-3 bg-gray-50 rounded">
                      {uploadedFile.content.slice(0, 200)}
                      {uploadedFile.content.length > 200 ? '...' : ''}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;