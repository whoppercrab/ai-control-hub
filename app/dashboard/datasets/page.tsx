"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, Plus, ExternalLink, Trash2 } from 'lucide-react'; 

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 데이터셋 목록 불러오기
  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {0
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

  const handleDelete = async (datasetName: string) => {
    if (!confirm(`정말로 데이터셋 '${datasetName}'을(를) 삭제하시겠습니까?\n업로드된 파일들도 서버에서 영구적으로 삭제됩니다.`)) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/datasets/${datasetName}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.status === "success") {
        alert(data.message);
        setDatasets(datasets.filter(ds => ds.name !== datasetName));
      } else {
        alert("삭제 실패: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("서버 연결에 실패했습니다.");
    }
  };

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
              {/* 🟢 영문 헤더 및 Size, Type 열 추가 */}
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                <th className="p-4 font-semibold">Dataset Name</th>
                <th className="p-4 font-semibold">Size</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Created At</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((ds) => (
                <tr key={ds.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {/* 🟢 1. 이름과 작성자를 위아래로 묶은 열 */}
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                            <Database size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-base">{ds.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">by {ds.author}</div>
                        </div>
                    </div>
                  </td>
                  
                  {/* 🟢 2. 크기 (Size) */}
                  <td className="p-4 text-sm font-medium text-gray-600">
                    {ds.size || "0 MB"}
                  </td>

                  {/* 🟢 3. 타입 (Type) - 뱃지 스타일 */}
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium border border-gray-200">
                        {ds.type || "Dataset"}
                    </span>
                  </td>

                  {/* 🟢 4. 생성일 (Created At) */}
                  <td className="p-4 text-gray-500 text-sm">
                    {ds.created_at}
                  </td>
                  
                  {/* 🟢 5. 관리 버튼 (Actions) */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                        <Link href={`/dataset/${ds.name}`} target="_blank" title="상세 페이지 보기" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <ExternalLink size={18} />
                        </Link>
                        <button onClick={() => handleDelete(ds.name)} title="데이터셋 삭제" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}