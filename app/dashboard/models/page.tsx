"use client";

import React, { useEffect, useState } from 'react';
import { Database, HardDrive, Trash2, Download, Box, RefreshCw } from 'lucide-react';

export default function ModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/models');
      const data = await res.json();
      setModels(data);
    } catch (e) {
      console.error("Failed to fetch models");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Box className="text-blue-600"/> Model Registry
            </h2>
            <p className="text-gray-500">Manage trained model checkpoints (.pt, .bin).</p>
        </div>
        <button 
            onClick={fetchModels} 
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh List"
        >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-4">Model Name</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Created At</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {models.length === 0 && !loading && (
                    <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400 italic">
                            No models found. Try training a new model first.
                        </td>
                    </tr>
                )}
                
                {models.map((model, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Database size={18}/>
                            </div>
                            {model.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-600">{model.size}</td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {model.type}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{model.created}</td>
                        <td className="px-6 py-4 flex justify-center gap-3">
                            <button className="text-gray-400 hover:text-blue-600 transition-colors" title="Download">
                                <Download size={18}/>
                            </button>
                            <button className="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                <Trash2 size={18}/>
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}