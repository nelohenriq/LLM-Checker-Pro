import React from 'react';
import { Copy, Terminal } from 'lucide-react';

const ApiDocs: React.FC = () => {
  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 overflow-y-auto pr-2">
      <header>
        <h2 className="text-2xl font-bold text-white mb-1">API Reference</h2>
        <p className="text-gray-400 text-sm">Documentation for the REST API endpoints served by `src/api.ts`.</p>
      </header>

      <div className="space-y-8 max-w-4xl">
        
        {/* Endpoint 1 */}
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 font-mono text-xs border border-green-500/20 font-bold">GET</span>
                <code className="text-gray-200 font-mono bg-gray-900 px-2 py-1 rounded">/api/v1/models</code>
            </div>
            <p className="text-gray-400 text-sm">Retrieve a paginated list of all discovered models in the database.</p>
            
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 font-mono text-sm group relative">
                <button className="absolute top-3 right-3 p-1.5 rounded hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors">
                    <Copy className="w-4 h-4" />
                </button>
                <div className="text-gray-500 mb-2"># Example Request</div>
                <div className="text-cyan-400">curl -X GET "http://localhost:3000/api/v1/models?limit=10"</div>
                <div className="text-gray-500 my-2"># Response</div>
                <pre className="text-gray-300 overflow-x-auto">
{`{
  "data": [
    {
      "id": "meta-llama/Llama-2-7b",
      "downloads": 150200,
      "tags": ["nlp", "llama"]
    }
  ],
  "meta": {
    "total": 1,
    "page": 1
  }
}`}
                </pre>
            </div>
        </div>

        <div className="border-t border-gray-800"></div>

        {/* Endpoint 2 */}
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-mono text-xs border border-blue-500/20 font-bold">POST</span>
                <code className="text-gray-200 font-mono bg-gray-900 px-2 py-1 rounded">/api/v1/check/trigger</code>
            </div>
            <p className="text-gray-400 text-sm">Manually trigger the polling process (force sync with Hugging Face).</p>
            
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 font-mono text-sm group relative">
                 <button className="absolute top-3 right-3 p-1.5 rounded hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors">
                    <Copy className="w-4 h-4" />
                </button>
                <div className="text-cyan-400">curl -X POST "http://localhost:3000/api/v1/check/trigger"</div>
            </div>
        </div>

        <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-xl p-6 flex items-center justify-center gap-4 text-gray-500">
            <Terminal className="w-6 h-6" />
            <span>Full Swagger documentation available at <span className="text-cyan-400 underline cursor-pointer">/api/docs</span></span>
        </div>

      </div>
    </div>
  );
};

export default ApiDocs;