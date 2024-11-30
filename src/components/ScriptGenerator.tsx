import React, { useState } from 'react';
import { Script, ScriptSection, ScriptService } from '../services/ScriptService';
import { PencilIcon, ArrowPathIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  documentContent: string;
  onScriptGenerated: (script: Script) => void;
}

export const ScriptGenerator: React.FC<Props> = ({ documentContent, onScriptGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<ScriptSection | null>(null);

  const scriptService = new ScriptService();

  const handleGenerateScript = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const script = await scriptService.generateScript(documentContent);
      onScriptGenerated(script);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveSection = async (section: ScriptSection) => {
    setEditingSection(section);
    
    try {
      const improvedContent = await scriptService.improveSection(section);
      // İyileştirilen bölümü parent komponente bildir
      onScriptGenerated(currentScript => ({
        ...currentScript,
        sections: currentScript.sections.map(s =>
          s.id === section.id ? { ...s, content: improvedContent } : s
        )
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEditingSection(null);
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
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded-full"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Doküman önizleme */}
      <div className="mb-6">
        <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
Doküman İçeriği</h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {documentContent.slice(0, 200)}
            {documentContent.length > 200 ? '...' : ''}
          </p>
        </div>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Script oluşturmak için butona tıklayın
      </div>
    </div>
  );
};
