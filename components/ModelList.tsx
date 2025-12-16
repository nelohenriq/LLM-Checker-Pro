import React, { useState } from 'react';
import { LLMModel } from '../types';
import { Search, Filter, Cpu, Download, ThumbsUp, Tag, Calendar, Database, X, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface ModelListProps {
  models: LLMModel[];
}

const ModelCard: React.FC<{ model: LLMModel }> = ({ model }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(model.description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-cyan-500/50 rounded-xl p-5 transition-all group">
      <div className="flex justify-between items-start">
        <div className="flex gap-4 w-full">
          <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-500 group-hover:text-cyan-400 group-hover:bg-cyan-950 transition-colors shrink-0">
            {model.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-200 group-hover:text-cyan-400 transition-colors flex items-center gap-2 flex-wrap">
              {model.provider}/{model.name}
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-800 text-gray-400 border border-gray-700">
                {model.parameters}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-900/30 text-blue-400 border border-blue-900/50">
                {model.license}
              </span>
            </h3>

            <div className="mt-1">
              <p className={`text-sm text-gray-400 transition-all max-w-2xl ${isExpanded ? '' : 'line-clamp-2'}`}>
                {model.description}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-xs font-medium text-cyan-500 hover:text-cyan-400 focus:outline-none transition-colors"
                >
                  {isExpanded ? (
                    <>Show less <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Read more <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>

                {isExpanded && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    title="Copy full description"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy description'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                <Database className="w-3 h-3" /> {model.vramSize} VRAM
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                <Calendar className="w-3 h-3" /> {model.releaseDate}
              </span>
              {model.tags.slice(0, 3).map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-400 bg-gray-950 px-2 py-1 rounded border border-gray-800">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="font-mono">{model.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-400 bg-gray-950 px-2 py-1 rounded border border-gray-800">
            <Download className="w-3.5 h-3.5" />
            <span className="font-mono">{model.downloads.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModelList: React.FC<ModelListProps> = ({ models }) => {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [licenseFilter, setLicenseFilter] = useState('all');
  const [vramFilter, setVramFilter] = useState('all');
  const [paramFilter, setParamFilter] = useState('all');

  const filtered = models.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.provider.toLowerCase().includes(search.toLowerCase());
    
    const matchesLicense = licenseFilter === 'all' || m.license === licenseFilter;
    
    // Simple logic for VRAM filtering demo
    const matchesVram = vramFilter === 'all' || 
      (vramFilter === 'low' && (parseInt(m.vramSize) <= 8 || m.vramSize.includes('8GB'))) ||
      (vramFilter === 'medium' && (parseInt(m.vramSize) > 8 && parseInt(m.vramSize) <= 24)) ||
      (vramFilter === 'high' && parseInt(m.vramSize) > 24);

    // Simple logic for Params filtering demo
    const matchesParams = paramFilter === 'all' ||
      (paramFilter === 'small' && m.parameters.includes('7B')) ||
      (paramFilter === 'medium' && (m.parameters.includes('8B') || m.parameters.includes('13B'))) ||
      (paramFilter === 'large' && (m.parameters.includes('70B') || m.parameters.includes('405B')));

    return matchesSearch && matchesLicense && matchesVram && matchesParams;
  });

  const clearFilters = () => {
    setLicenseFilter('all');
    setVramFilter('all');
    setParamFilter('all');
    setSearch('');
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-in slide-in-from-right-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">Model Database</h2>
            <p className="text-gray-400 text-sm">Local cache of discovered Hugging Face models.</p>
        </div>
        <div className="text-xs font-mono text-gray-500">
            {filtered.length} / {models.length} visible
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col gap-2">
        <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl flex gap-3">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search models (e.g., 'llama', 'mistral')..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-gray-600"
                />
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border ${showFilters ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'}`}
            >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
            </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
            <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold uppercase">License</label>
                    <select 
                        value={licenseFilter}
                        onChange={(e) => setLicenseFilter(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-cyan-500 outline-none"
                    >
                        <option value="all">Any License</option>
                        <option value="apache-2.0">Apache 2.0</option>
                        <option value="mit">MIT</option>
                        <option value="llama3">Llama 3</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold uppercase">VRAM Req</label>
                    <select 
                        value={vramFilter}
                        onChange={(e) => setVramFilter(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-cyan-500 outline-none"
                    >
                        <option value="all">Any VRAM</option>
                        <option value="low">Low (≤ 8GB)</option>
                        <option value="medium">Medium (8-24GB)</option>
                        <option value="high">High (> 24GB)</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold uppercase">Parameters</label>
                    <select 
                        value={paramFilter}
                        onChange={(e) => setParamFilter(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-cyan-500 outline-none"
                    >
                        <option value="all">Any Size</option>
                        <option value="small">Small (~7B)</option>
                        <option value="medium">Medium (~13B)</option>
                        <option value="large">Large (70B+)</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <button onClick={clearFilters} className="w-full px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                        <X className="w-3 h-3" /> Clear
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Cpu className="w-12 h-12 mb-4 opacity-20" />
                <p>No models found matching your criteria.</p>
            </div>
        ) : (
            filtered.map((model) => (
                <ModelCard key={model.id} model={model} />
            ))
        )}
      </div>
    </div>
  );
};

export default ModelList;