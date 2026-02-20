"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, Plus, Search } from 'lucide-react';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/datasets');
        const result = await res.json();
        if (result.status === "success") {
          setDatasets(result.data);
        }
      } catch (error) {
        console.error("데이터셋 로드 실패", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Database className="text-red-500" size={32} /> Datasets
          </h1>
          <p className="text-gray-500 mt-2">등록된 데이터셋을 관리하고 새 데이터셋을 추가하세요.</p>
        </div>
        <Link href="/dashboard/datasets/new" className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">
          <Plus size={20} /> New Dataset
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 font-bold animate-pulse">데이터셋을 불러오는 중입니다...</div>
        ) : datasets.length === 0 ? (
          <div className="p-10 text-center text-gray-400">등록된 데이터셋이 없습니다. 우측 상단의 New Dataset을 눌러 추가해보세요.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                <th className="p-4 font-semibold">데이터셋 이름</th>
                <th className="p-4 font-semibold">작성자</th>
                <th className="p-4 font-semibold">생성일</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((ds) => (
                <tr key={ds.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                    <Database size={16} className="text-red-400"/> {ds.name}
                  </td>
                  <td className="p-4 text-gray-600">{ds.author}</td>
                  <td className="p-4 text-gray-500 text-sm">{ds.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}