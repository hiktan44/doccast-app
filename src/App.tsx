import React, { useState } from 'react';
import { FileUploader, UploadedFile } from './components/FileUploader';

function App() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFile(file);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DocCast</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid gap-6">
          <FileUploader onFileUploaded={handleFileUpload} />

          {uploadedFile && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Yüklenen Dosya</h3>
              <div className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                <p><span className="font-medium">Ad:</span> {uploadedFile.file.name}</p>
                <p><span className="font-medium">Tip:</span> {uploadedFile.type}</p>
                <p><span className="font-medium">Boyut:</span> {(uploadedFile.file.size / 1024).toFixed(1)} KB</p>
                {uploadedFile.type === 'document' && (
                  <div>
                    <p className="font-medium mb-1">İçerik Önizleme:</p>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      {uploadedFile.content?.slice(0, 200)}
                      {(uploadedFile.content?.length || 0) > 200 ? '...' : ''}
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