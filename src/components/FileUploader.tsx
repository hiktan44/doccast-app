import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentTextIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

export interface UploadedFile {
  id: string;
  file: File;
  type: 'document' | 'audio';
  content?: string;
}

interface Props {
  onFileUploaded: (file: UploadedFile) => void;
}

export const FileUploader: React.FC<Props> = ({ onFileUploaded }) => {
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

      onFileUploaded(uploadedFile);
    } catch (err) {
      setError('Dosya yüklenirken bir hata oluştu');
      console.error('Dosya yükleme hatası:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onFileUploaded]);

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
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Doküman veya Podcast Yükle
      </h2>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}
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
                <p className="text-gray-600 dark:text-gray-300">
                  Doküman (.txt, .pdf, .docx) veya ses dosyası (.mp3, .wav) yükleyin
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dosyayı sürükleyip bırakın veya seçmek için tıklayın
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};
