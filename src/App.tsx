import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentTextIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

interface UploadedFile {
  id: string;
  file: File;
  type: 'document' | 'audio';
  content?: string;
}

function App() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Dosya tipini kontrol et
      const isAudio = file.type.startsWith('audio/');
      const uploadedFile: UploadedFile = {
        id: crypto.randomUUID(),
        file,
        type: isAudio ? 'audio' : 'document',
      };

      // Eğer döküman ise içeriğini oku
      if (!isAudio) {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Dosya okunamadı'));
          reader.readAsText(file);
        });
        uploadedFile.content = text;
      }

      setUploadedFile(uploadedFile);
    } catch (err) {
      setError('Dosya yüklenirken bir hata oluştu');
      console.error('Dosya yükleme hatası:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav']
    },
    maxFiles: 1
  });

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
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              Doküman veya Podcast Yükle
            </h2>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
              <input {...getInputProps()} />
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                  <span className="text-blue-500">Yükleniyor...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <DocumentTextIcon className="h-10 w-10 text-gray-400" />
                    <MusicalNoteIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  {isDragActive ? (
                    <p className="text-blue-500 font-medium">Dosyayı buraya bırakın</p>
                  ) : (
                    <>
                      <p className="text-gray-600">
                        Doküman (.txt, .pdf, .docx) veya ses dosyası (.mp3, .wav) yükleyin
                      </p>
                      <p className="text-sm text-gray-500">
                        Dosyayı sürükleyip bırakın veya seçmek için tıklayın
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}
          </div>

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