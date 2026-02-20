"use client";

import React, { useEffect, useState } from 'react';
import { Database, Download, Box, RefreshCw, Trash2, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';

interface ModelData {
  id: number;
  name: string;
  author: string;
  size: string;
  type: string;
  created_at: string;
}

export default function ModelRegistryPage() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/models');
      const result = await res.json();
      if (result.status === "success") {
        setModels(result.data);
      }
    } catch (error) {
      console.error("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. 헤더 영역 */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Box className="text-blue-600"/> Model Registry
            </h2>
            <p className="text-gray-500 text-sm mt-1">Manage trained model checkpoints (.pt, .bin).</p>
        </div>
        
        {/* 🟢 여기에 [새 모델 등록] 버튼이 들어갑니다! */}
        <div className="flex items-center gap-3">
            <button onClick={fetchModels} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh List">
                <RefreshCw size={20} className={loading ? "animate-spin text-blue-600" : ""} />
            </button>
            <Link href="/dashboard/models/new">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                    <Plus size={18}/> 새 모델 등록
                </button>
            </Link>
        </div>
      </div>

      {/* 2. 데이터 테이블 영역 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 uppercase tracking-wider text-xs">
                <tr>
                    <th className="px-6 py-4">Model Name</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Created At</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-400 font-bold animate-pulse">데이터를 불러오는 중입니다...</td></tr>
                ) : models.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-400 italic">등록된 모델이 없습니다. 새 모델을 등록해보세요!</td></tr>
                ) : (
                    models.map((model) => (
                        <tr key={model.id} className="hover:bg-blue-50/50 transition-colors group">
                            <td className="px-6 py-4 font-bold text-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Database size={18}/></div>
                                    <div className="flex flex-col">
                                        {/* 🟢 대시보드 밖의 퍼블릭 상세 페이지(/model/이름)로 이동하도록 링크 수정 */}
                                        <Link href={`/model/${model.name}`} className="hover:text-blue-600 hover:underline">
                                            {model.name}
                                        </Link>
                                        <span className="text-xs text-gray-400 font-normal">by {model.author}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-gray-600">{model.size}</td>
                            <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{model.type}</span></td>
                            <td className="px-6 py-4 text-gray-500">{model.created_at}</td>
                            
                            <td className="px-6 py-4 flex justify-center gap-3">
                                {/* 🟢 액션 버튼의 '상세보기'도 퍼블릭 상세 페이지로 이동하도록 수정 */}
                                <Link href={`/model/${model.name}`}>
                                    <button className="text-gray-400 hover:text-indigo-600 transition-colors" title="View Public Page">
                                        <ArrowRight size={18}/>
                                    </button>
                                </Link>
                                <button className="text-gray-400 hover:text-red-500 transition-colors" title="Delete Model">
                                    <Trash2 size={18}/>
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}