import React, { useState } from 'react';
import { Folder, File, RefreshCw } from 'lucide-react';

interface FileEntry {
  name: string;
  type: 'dir' | 'file';
  size: number | null;
  modified: number;
}

interface FileExplorerProps {
  activeFilePath: string | null;
  setActiveFilePath: (path: string) => void;
  setFileContent: (content: string) => void;
}

export default function FileExplorer({ activeFilePath, setActiveFilePath, setFileContent }: FileExplorerProps) {
  const [directory, setDirectory] = useState<string>('C:/');
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDirectory = async () => {
    if (!directory) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8099/fs/list?directory=${encodeURIComponent(directory)}`);
      if (!res.ok) throw new Error('Failed to load directory');
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (entry: FileEntry) => {
    if (entry.type === 'dir') {
      const newDir = directory.endsWith('/') || directory.endsWith('\\') 
        ? `${directory}${entry.name}` 
        : `${directory}/${entry.name}`;
      setDirectory(newDir);
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8099/fs/list?directory=${encodeURIComponent(newDir)}`);
        if (!res.ok) throw new Error('Failed to load directory');
        const data = await res.json();
        setEntries(data.entries || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      const filePath = directory.endsWith('/') || directory.endsWith('\\') 
        ? `${directory}${entry.name}` 
        : `${directory}/${entry.name}`;
      
      try {
        const res = await fetch(`http://localhost:8099/fs/read?filepath=${encodeURIComponent(filePath)}`);
        if (!res.ok) throw new Error('Failed to read file');
        const data = await res.json();
        setActiveFilePath(data.path || filePath);
        setFileContent(data.content || '');
      } catch (err: any) {
        console.error(err);
        alert('Error reading file: ' + err.message);
      }
    }
  };

  return (
    <div className="w-[250px] min-w-[250px] border-r border-gray-700 flex flex-col bg-gray-900">
      <div className="p-3 border-b border-gray-700 flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Explorer</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={directory}
            onChange={(e) => setDirectory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadDirectory()}
            placeholder="Enter path..."
            className="flex-1 bg-gray-800 text-sm text-gray-200 px-2 py-1 rounded border border-gray-700 focus:outline-none focus:border-blue-500 min-w-0"
          />
          <button
            onClick={loadDirectory}
            className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded flex items-center justify-center shrink-0"
            title="Load Directory"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {entries.length === 0 && !loading && !error && (
          <div className="text-xs text-gray-500 text-center mt-4">No files loaded</div>
        )}
        {entries.map((entry, idx) => {
          const isDir = entry.type === 'dir';
          const filePath = directory.endsWith('/') || directory.endsWith('\\') 
            ? `${directory}${entry.name}` 
            : `${directory}/${entry.name}`;
          const isActive = activeFilePath === filePath;

          return (
            <div
              key={idx}
              onClick={() => handleFileClick(entry)}
              className={`flex items-center gap-2 px-2 py-1 cursor-pointer rounded text-sm select-none ${
                isActive ? 'bg-blue-900/50 text-blue-200' : 'hover:bg-gray-800 text-gray-300'
              }`}
            >
              {isDir ? <Folder size={16} className="text-yellow-500 shrink-0" /> : <File size={16} className="text-gray-400 shrink-0" />}
              <span className="truncate">{entry.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
