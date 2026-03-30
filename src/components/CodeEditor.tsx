import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Save, Check } from 'lucide-react';

interface CodeEditorProps {
  activeFilePath: string | null;
  fileContent: string;
  setFileContent: (content: string) => void;
}

export default function CodeEditor({ activeFilePath, fileContent, setFileContent }: CodeEditorProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!activeFilePath) return;
    setSaving(true);
    try {
      const res = await fetch('http://localhost:8099/fs/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: activeFilePath, content: fileContent }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      console.error(err);
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const language = activeFilePath?.split('.').pop() || 'plaintext';
  
  const getLanguage = (ext: string) => {
    const map: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      json: 'json',
      html: 'html',
      css: 'css',
      py: 'python',
      md: 'markdown',
    };
    return map[ext] || 'plaintext';
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] border-r border-gray-700 min-w-0">
      <div className="h-10 border-b border-gray-700 flex items-center justify-between px-4 bg-gray-900">
        <div className="text-sm text-gray-400 truncate flex-1 mr-4">
          {activeFilePath ? activeFilePath : 'No file opened'}
        </div>
        {activeFilePath && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-3 py-1 rounded text-sm transition-colors shrink-0"
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>
      <div className="flex-1 relative">
        {activeFilePath ? (
          <Editor
            height="100%"
            theme="vs-dark"
            language={getLanguage(language)}
            value={fileContent}
            onChange={(val) => setFileContent(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="text-6xl mb-4 font-bold tracking-tight">Artaria</div>
              <p>Select a file from the explorer to start editing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
