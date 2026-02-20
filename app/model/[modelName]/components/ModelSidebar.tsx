"use client";

import React from 'react';
import { Download, Box, Shield } from 'lucide-react';

export default function ModelSidebar({ modelData, onOpenModal }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
          <Download size={14} /> Downloads
        </h3>
        <div className="text-2xl font-bold text-gray-900 mb-4">{modelData.downloads}</div>
        <button
          onClick={onOpenModal}
          className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-medium flex justify-center items-center gap-2 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
        >
          <Box size={18} /> Use in Transformers
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {modelData.tags.map((tag: string) => (
            <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}