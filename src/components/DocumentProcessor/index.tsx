import React from 'react';
import { DocumentUpload } from './DocumentUpload';
import { ScriptGenerator } from './ScriptGenerator';

export const DocumentProcessor = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Döküman İşleme</h2>
      <DocumentUpload />
      <ScriptGenerator />
    </div>
  );
};