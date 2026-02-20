"use client";

import React, { useState, useEffect } from 'react';
import { ArrowDownToLine, Database, FileJson, FileText, Terminal, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

// 🟢 잘 분리해두셨던 컴포넌트들 불러오기
import ModelHeader from './[modelName]/components/ModelHeader';
import ModelSidebar from './[modelName]/components/ModelSidebar';
import DiscussionBoard from '../components/DiscussionBoard';

// 파일 목록은 일단 시각적 요소를 위해 하드코딩 유지 (추후 DB 연동 가능)
const fileList = [
  { name: "config.json", size: "1.2 KB", date: "2 days ago", type: "json", lfs: false },
  { name: "pytorch_model.bin", size: "420 MB", date: "2 days ago", type: "bin", lfs: true },
  { name: "tokenizer.json", size: "2.4 MB", date: "yesterday", type: "json", lfs: false },
];

export default function ModelPage() {
  const [activeTab, setActiveTab] = useState("card");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });
  
  // 🟢 [핵심] DB에서 가져올 모델 데이터 그릇
  const [modelData, setModelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🟢 DB에서 모델 상세 정보 불러오기
  useEffect(() => {
    const fetchModelData = async () => {
      try {
        const res = await fetch('http://localhost:8000/models/bert-base-korean-v1');
        const result = await res.json();
        
        if (result.status === "success") {
          setModelData(result.data); // 가짜 데이터가 아닌, 진짜 백엔드 데이터를 세팅!
        }
      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchModelData();
  }, []);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'json': return <FileJson size={18} className="text-yellow-600"/>;
      case 'bin': return <Database size={18} className="text-blue-600"/>;
      default: return <FileText size={18} className="text-gray-500"/>;
    }
  };

  const handleDownload = (name: string) => {
    setToast({ show: true, msg: `Downloading ${name}...` });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  // 로딩 및 에러 처리 화면
  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-pulse text-lg font-bold text-gray-500">모델 정보를 불러오는 중입니다...</div></div>;
  if (!modelData) return <div className="min-h-screen flex justify-center items-center text-red-500 font-bold">모델을 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative">
      
      {/* 1. 헤더 영역 (DB 데이터 전달) */}
      <ModelHeader modelData={modelData} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8">
            {/* 탭 1: 모델 카드 (마크다운) */}
            {activeTab === 'card' && (
              <article className="prose prose-slate max-w-none animate-fade-in">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {modelData.readme}
                </ReactMarkdown>
              </article>
            )}

            {/* 탭 2: 파일 목록 */}
            {activeTab === 'files' && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white animate-fade-in">
                {fileList.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)} <span className="text-sm font-mono text-blue-600">{file.name}</span>
                      {file.lfs && <span className="bg-gray-200 text-[10px] px-1 rounded font-bold">LFS</span>}
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">{file.size}</span>
                        <button onClick={() => handleDownload(file.name)}><ArrowDownToLine size={18} className="text-gray-400 hover:text-blue-600"/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 탭 3: 커뮤니티 (DB 연동 완료) */}
            {activeTab === 'community' && (
              <div className="animate-fade-in">
                <DiscussionBoard targetType="model" targetId={modelData.name} />
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            {/* 2. 사이드바 영역 (DB 데이터 전달) */}
            <ModelSidebar modelData={modelData} onOpenModal={() => setShowModal(true)} />
          </div>
        </div>
      </main>

      {/* 모달 팝업 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
           <div className="bg-white p-6 rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
             <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2"><Terminal size={20}/> Use in Transformers</h3><button onClick={() => setShowModal(false)}><X/></button></div>
             <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono">from transformers import pipeline...</div>
           </div>
        </div>
      )}
      
      {/* 토스트 알림 */}
      {toast.show && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce-in z-50">
           <ArrowDownToLine size={20} className="text-green-400"/> <span className="font-medium">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}