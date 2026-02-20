"use client";

import React from 'react';
import { Box, Copy, Hash, Activity, FileText, HardDrive, MessageSquare } from 'lucide-react';

export default function ModelHeader({ modelData, activeTab, setActiveTab }: any) {
  return (
    <header className="border-b border-gray-200 bg-gray-50/50 pt-10 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <span className="text-2xl font-bold">B</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
              <span className="text-gray-500 font-normal">{modelData.author} /</span>
              {modelData.name}
              <button className="text-gray-400 hover:text-gray-600 ml-2"><Copy size={18} /></button>
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
              <span className="flex items-center gap-1"><Hash size={14} /> Updated {modelData.lastUpdated}</span>
              <span className="flex items-center gap-1"><Activity size={14} /> {modelData.likes} likes</span>
            </div>
          </div>
        </div>

        <div className="flex gap-8 mt-8">
          {[
            { id: 'card', label: 'Model Card', icon: FileText },
            { id: 'files', label: 'Files and versions', icon: HardDrive },
            { id: 'community', label: 'Community', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}