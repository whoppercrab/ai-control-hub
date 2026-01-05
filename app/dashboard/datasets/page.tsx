"use client";

import React, { useEffect, useState } from 'react';
import { Database, Upload, Plus, Search, FileText, Server, Trash2, FolderOpen } from 'lucide-react';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // 새 데이터셋 입력 상태
  const [newName, setNewName] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newType, setNewType] = useState("Image");

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/datasets');
      const data = await res.json();
      setDatasets(data);
    } catch (e) {
      console.error("Failed to load datasets");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if(!newName || !newSource) return alert("이름과 출처를 입력하세요.");
    
    try {
      await fetch('http://localhost:8000/datasets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, source: newSource, type: newType }),
      });
      setShowForm(false);
      setNewName("");
      setNewSource("");
      fetchDatasets(); // 목록 갱신
    } catch (e) {
      alert("생성 실패");
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Database className="text-indigo-600"/> 데이터 관리 (Dataset Hub)
            </h2>
            <p className="text-gray-500">COCO, UCI 등 오픈 데이터셋 및 자체 수집 데이터를 통합 관리합니다.</p>
        </div>
        <button 
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-200"
        >
            {showForm ? "취소" : <><Plus size={18}/> 데이터셋 생성 / 연결</>}
        </button>
      </div>

      {/* 데이터셋 생성 폼 (토글) */}
      {showForm && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 animate-fade-in-down">
            <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Upload size={18}/> 새 데이터셋 등록
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-indigo-700 mb-1">데이터셋 이름</label>
                    <input type="text" placeholder="예: My_Custom_Data_v2" className="w-full border p-2 rounded-lg" value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-indigo-700 mb-1">수집 출처 / 설명</label>
                    <input type="text" placeholder="예: 자체 수집 (CCTV)" className="w-full border p-2 rounded-lg" value={newSource} onChange={e => setNewSource(e.target.value)} />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-indigo-700 mb-1">데이터 타입</label>
                    <select className="w-full border p-2 rounded-lg" value={newType} onChange={e => setNewType(e.target.value)}>
                        <option>Image (Vision)</option>
                        <option>Video / CCTV</option>
                        <option>Tabular / CSV</option>
                        <option>Audio / Voice</option>
                        <option>Sensor / IoT</option>
                    </select>
                </div>
                <div className="md:col-span-1">
                    <button onClick={handleCreate} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">등록하기</button>
                </div>
            </div>
        </div>
      )}

      {/* 데이터셋 리스트 테이블 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* 검색 필터 (모양만) */}
        <div className="p-4 border-b border-gray-100 flex gap-3">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input type="text" placeholder="데이터셋 검색..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"/>
            </div>
        </div>

        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-4">Dataset Name</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {datasets.map((ds) => (
                    <tr key={ds.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${ds.name.includes("Self") ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"}`}>
                                {ds.name.includes("Self") ? <Server size={18}/> : <FolderOpen size={18}/>}
                            </div>
                            {ds.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{ds.source}</td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                {ds.type}
                            </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-500">{ds.size}</td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                ds.status === "Ready" ? "bg-green-100 text-green-700" : 
                                ds.status === "Processing" ? "bg-blue-100 text-blue-700 animate-pulse" : "bg-gray-100 text-gray-500"
                            }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    ds.status === "Ready" ? "bg-green-600" : 
                                    ds.status === "Processing" ? "bg-blue-600" : "bg-gray-500"
                                }`}></div>
                                {ds.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full">
                                <Trash2 size={16}/>
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