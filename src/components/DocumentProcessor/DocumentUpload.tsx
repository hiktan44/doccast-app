import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentTextIcon, ArrowUpTrayIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { DocumentService } from '../../services/DocumentService';
import { Document, DocumentError } from '../../types/document';

export const DocumentUpload = () => {
  const [document, setDocument] = useState<Document | null>(null);
  const [error, setError] = useState<DocumentError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const documentService = new DocumentService();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsLoading(true);
    setError(null);

    try {
      const doc = await documentService.readFile(file);
      setDocument(doc);
    } catch (err: any) {
      setError({
        message: err.message || 'Dosya yüklenirken bir hata oluştu',
        code: 'UPLOAD_ERROR'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const clearDocument = () => {
    setDocument(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="border-2 border-gray-300 rounded-lg p-8 text-center">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="p-3 bg-gray-100 rounded-full">
            <DocumentTextIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">Dosya yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-red-300 rounded-lg p-8 bg-red-50">
        <div className="flex items-center space-x-3 text-red-600">
          <XCircleIcon className="w-6 h-6" />
          <p>{error.message}</p>
        </div>
        <button
          onClick={clearDocument}
          className="mt-4 text-sm text-red-600 hover:text-red-500"
        >
          Tekrar deneyin
        </button>
      </div>
    );
  }

  if (document) {
    return (
      <div className="border-2 border-green-300 rounded-lg p-8 bg-green-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-green-900">{document.name}</h3>
            <p className="text-sm text-green-600">
              {(document.size / 1024).toFixed(1)} KB • {document.type.toUpperCase()}
            </p>
          </div>
          <button
            onClick={clearDocument}
            className="text-green-600 hover:text-green-500"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

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
