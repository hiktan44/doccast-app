import React from 'react';
import { APITester } from './components/APITester';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold">DocCast</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Test Paneli */}
        <div className="mb-8">
          <APITester />
        </div>

        {/* Ana Uygulama İçeriği */}
        <div className="p-6 bg-white dark:bg-gray-800 shadow rounded-lg">
          <h2 className="text-xl font-bold mb-4">Ana Uygulama</h2>
          {/* Diğer komponentler buraya gelecek */}
        </div>
      </main>
    </div>
  );
}

export default App;