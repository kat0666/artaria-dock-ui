import React, { useState, useEffect } from 'react';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import AgentsPanel from './components/AgentsPanel';
import { EditorProvider } from './context/EditorContext';

interface ModelsResponse {
  models: { id: string }[];
}

export default function App() {
  const [models, setModels] = useState<{ id: string }[]>([]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('http://localhost:8099/models');
        if (!res.ok) throw new Error('Failed to fetch models');
        const data: ModelsResponse = await res.json();
        if (data.models) {
          setModels(data.models);
        }
      } catch (err: unknown) {
        console.error('Failed to fetch models:', err instanceof Error ? err.message : String(err));
      }
    };

    fetchModels();
  }, []);

  return (
    <EditorProvider>
      <div className="flex h-screen w-full bg-gray-900 text-gray-100 overflow-hidden font-sans">
        <FileExplorer />
        <CodeEditor />
        <AgentsPanel models={models} />
      </div>
    </EditorProvider>
  );
}
