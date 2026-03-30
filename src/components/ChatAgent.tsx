import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Code, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

interface ChatAgentProps {
  key?: React.Key;
  agent: {
    id: string;
    model: string;
    thread_id: string;
  };
  onClose: () => void;
  editorContent: string;
}

export default function ChatAgent({ agent, onClose, editorContent }: ChatAgentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8099/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: agent.model,
          messages: newMessages,
          thread_id: agent.thread_id,
          agent_id: agent.model,
        }),
      });

      if (!res.ok) throw new Error('Chat request failed');
      const data = await res.json();
      
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
    } catch (err: any) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const injectCode = () => {
    if (!editorContent) return;
    setInput((prev) => prev + (prev ? '\n\n' : '') + '```\n' + editorContent + '\n```\n');
  };

  return (
    <div className="flex flex-col bg-gray-800 rounded-lg border border-gray-700 overflow-hidden h-[400px] shadow-lg shrink-0">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-700 border-b border-gray-600">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-gray-200 truncate">{agent.model}</span>
          <span className="text-[10px] text-gray-400 font-mono truncate">{agent.thread_id}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-600 shrink-0">
          <X size={14} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-xs text-gray-500 text-center mt-2">Start a conversation...</div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`text-sm p-2 rounded-lg max-w-[90%] ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white self-end rounded-tr-none' 
                : 'bg-gray-700 text-gray-200 self-start rounded-tl-none'
            }`}
          >
            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="self-start bg-gray-700 text-gray-200 p-2 rounded-lg rounded-tl-none">
            <Loader2 size={16} className="animate-spin" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 bg-gray-750 border-t border-gray-700">
        <div className="flex gap-2 mb-2">
          <button
            onClick={injectCode}
            className="text-xs flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
            title="Inject Editor Code"
          >
            <Code size={12} />
            Inject Code
          </button>
        </div>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask something..."
            className="flex-1 bg-gray-900 text-sm text-gray-200 px-2 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-blue-500 resize-none min-h-[36px] max-h-[100px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white p-2 rounded flex items-center justify-center transition-colors self-end shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
