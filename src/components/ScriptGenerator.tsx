import React, { useState } from 'react';
import { PencilIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  documentContent: string;
  onScriptGenerated: (script: any) => void;
}

export const ScriptGenerator: React.FC<Props> = ({ documentContent, onScriptGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateScript = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Örnek bir script oluştur
      const script = {
        id: crypto.randomUUID(),
        title: 'Test Script',
        sections: [
          {
            id: crypto.randomUUID(),
            speaker: 'Host',
            content: 'Merhaba, bugün yapay zeka hakkında konuşacağız.',
            duration: 5,
            order: 0
          },
          {
            id: crypto.randomUUID(),
            speaker: 'Konuk',
            content: 'Yapay zeka son yıllarda çok gelişti.',
            duration: 4,
            order: 1
          }
        ],
        estimatedDuration: 9,
        createdAt: new Date()
      };

      onScriptGenerated(script);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Script Oluşturucu
        </h2>

        <button
          onClick={handleGenerateScript}
          disabled={isGenerating}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-white transition-colors
            ${isGenerating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isGenerating ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span>Script Oluşturuluyor...</span>
            </>
          ) : (
            <>
              <PencilIcon className="w-5 h-5" />
              <span>Script Oluştur</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Döküman İçeriği</h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {documentContent.slice(0, 200)}
            {documentContent.length > 200 ? '...' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};
