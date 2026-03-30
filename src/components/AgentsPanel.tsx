import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ChatAgent from './ChatAgent';

interface AgentsPanelProps {
  models: { id: string }[];
}

interface AgentInstance {
  id: string;
  model: string;
  thread_id: string;
}

export default function AgentsPanel({ models }: AgentsPanelProps) {
  const [agents, setAgents] = useState<AgentInstance[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  React.useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].id);
    }
  }, [models, selectedModel]);

  const spawnAgent = () => {
    if (!selectedModel) return;
    const newAgent: AgentInstance = {
      id: `agent-${Date.now()}`,
      model: selectedModel,
      thread_id: `thread-${Math.random().toString(36).substring(2, 9)}`,
    };
    setAgents([...agents, newAgent]);
  };

  const removeAgent = (id: string) => {
    setAgents(agents.filter((a) => a.id !== id));
  };

  return (
    <div className="w-[350px] min-w-[350px] bg-gray-900 flex flex-col h-full">
      <div className="p-3 border-b border-gray-700 flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Agents Dock</h2>
        <div className="flex gap-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="flex-1 bg-gray-800 text-sm text-gray-200 px-2 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-blue-500 min-w-0"
          >
            {models.length === 0 && <option value="">Loading models...</option>}
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id}
              </option>
            ))}
          </select>
          <button
            onClick={spawnAgent}
            disabled={!selectedModel}
            className="bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white px-3 py-1.5 rounded flex items-center justify-center transition-colors shrink-0"
            title="Spawn Agent"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col gap-4">
        {agents.length === 0 ? (
          <div className="text-xs text-gray-500 text-center mt-4">
            No agents spawned. Select a model and click + to start.
          </div>
        ) : (
          agents.map((agent) => (
            <ChatAgent
              key={agent.id}
              agent={agent}
              onClose={() => removeAgent(agent.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
