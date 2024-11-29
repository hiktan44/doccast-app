import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentTextIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export const DocumentUpload = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Yüklenen dosyalar:', acceptedFiles);
    // TODO: Dosya işleme fonksiyonu eklenecek
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-4">
        <div className="p-3 bg-gray-100 rounded-full">
          {isDragActive ? (
            <ArrowUpTrayIcon className="w-8 h-8 text-blue-500" />
          ) : (
            <DocumentTextIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>
        
        <div className="text-center">
          {isDragActive ? (
            <p className="text-lg font-medium text-blue-500">Dosyayı buraya bırakın</p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-900">
                Dosyanızı buraya sürükleyin
              </p>
              <p className="text-sm text-gray-500">
                veya dosya seçmek için tıklayın
              </p>
            </>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          PDF, DOCX veya TXT (Maks. 10MB)
        </div>
      </div>
    </div>
  );
};
