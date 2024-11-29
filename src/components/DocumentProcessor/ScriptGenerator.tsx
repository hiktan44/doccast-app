import React, { useState } from 'react';
import { Document } from '../../types/document';
import { Script, ScriptSection, ScriptGeneratorService } from '../../services/ScriptGeneratorService';
import { PencilIcon, SpeakerWaveIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  document: Document | null;
  onScriptGenerated?: (script: Script) => void;
}

export const ScriptGenerator: React.FC<Props> = ({ document, onScriptGenerated }) => {
  const [script, setScript] = useState<Script | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scriptGenerator = new ScriptGeneratorService();

  const handleGenerateScript = async () => {
    if (!document) return;

    setIsGenerating(true);
    setError(null);

    try {
      const generatedScript = await scriptGenerator.generateScript(document);
      setScript(generatedScript);
      onScriptGenerated?.(generatedScript);
    } catch (err: any) {
      setError(err.message || 'Script oluşturulurken bir hata oluştu');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveSection = async (section: ScriptSection) => {
    try {
      const improvedContent = await scriptGenerator.improveSection(section);
      
      if (script) {
        const updatedSections = script.sections.map(s =>
          s.id === section.id ? { ...s, content: improvedContent } : s
        );

        const updatedScript = {
          ...script,
          sections: updatedSections,
          metadata: {
            ...script.metadata,
            lastModified: new Date()
          }
        };

        setScript(updatedScript);
        onScriptGenerated?.(updatedScript);
      }
    } catch (err: any) {
      setError(err.message || 'Bölüm iyileştirilemedi');
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} dakika`;
  };

  if (!document) {
    return (
      <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-xl font-medium mb-4">Script Oluşturucu</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Henüz döküman yüklenmedi
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium">Script Oluşturucu</h3>
          <button
            onClick={handleGenerateScript}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-md flex items-center space-x-2
              ${isGenerating 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            {isGenerating ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Oluşturuluyor...</span>
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
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-md">
            {error}
          </div>
        )}

        {script && (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h4 className="font-medium text-lg mb-2">{script.title}</h4>
              <p className="text-gray-600 dark:text-gray-400">{script.description}</p>
              <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{formatDuration(script.metadata.totalDuration)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SpeakerWaveIcon className="w-4 h-4" />
                  <span>{script.metadata.speakerCount} Konuşmacı</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {script.sections.map((section) => (
                <div 
                  key={section.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {section.speaker}
                    </span>
                    <button
                      onClick={() => handleImproveSection(section)}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      İyileştir
                    </button>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200">
                    {section.content}
                  </p>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {formatDuration(section.duration)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
