import React, { useState, useEffect } from 'react';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import AgentsPanel from './components/AgentsPanel';

export default function App() {
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [models, setModels] = useState<{ id: string }[]>([]);

  useEffect(() => {
    fetch('http://localhost:8099/models')
      .then((res) => res.json())
      .then((data) => {
        if (data.models) {
          setModels(data.models);
        }
      })
      .catch((err) => console.error('Failed to fetch models:', err));
  }, []);

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-100 overflow-hidden font-sans">
      <FileExplorer
        activeFilePath={activeFilePath}
        setActiveFilePath={setActiveFilePath}
        setFileContent={setFileContent}
      />
      <CodeEditor
        activeFilePath={activeFilePath}
        fileContent={fileContent}
        setFileContent={setFileContent}
      />
      <AgentsPanel
        models={models}
        fileContent={fileContent}
      />
    </div>
  );
}
