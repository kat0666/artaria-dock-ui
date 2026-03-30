import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditorContextType {
  activeFilePath: string | null;
  setActiveFilePath: (path: string | null) => void;
  fileContent: string;
  setFileContent: (content: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  return (
    <EditorContext.Provider value={{ activeFilePath, setActiveFilePath, fileContent, setFileContent }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
