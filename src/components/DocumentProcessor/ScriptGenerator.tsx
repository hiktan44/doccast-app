import React from 'react';

export const ScriptGenerator = () => {
  return (
    <div className="mt-6 bg-white shadow rounded-lg p-6">
      <h3 className="text-xl font-medium mb-4">Script Oluşturucu</h3>
      <div className="space-y-4">
        <div className="border-b pb-4">
          <p className="text-gray-600">Henüz döküman yüklenmedi</p>
          <p className="text-sm text-gray-500">Döküman yükledikten sonra script oluşturma başlayacak</p>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            disabled={true}
          >
            Script Oluştur
          </button>
          
          <div className="text-sm text-gray-500">
            Tahmini süre: --:--
          </div>
        </div>
      </div>
    </div>
  );
};
