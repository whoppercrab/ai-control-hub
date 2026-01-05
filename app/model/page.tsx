"use client";

import React, { useState } from 'react';
import { ArrowDownToLine, Check, Copy, FileText, FileJson, FileCode, Database, Terminal, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

// 컴포넌트 불러오기
import ModelHeader from './components/ModelHeader';
import ModelSidebar from './components/ModelSidebar';
import CommunityTab from './components/CommunityTab';

// 데이터 정의
const modelData = {
  name: "bert-base-korean-v1",
  author: "kykim",
  lastUpdated: "5 days ago",
  downloads: "1,240,500",
  likes: 342,
  license: "apache-2.0",
  tags: ["PyTorch", "Transformers", "bert", "ko", "nlp"],
  readme: `# BERT Base Korean Model\n이 모델은 **Next.js** 컴포넌트로 분리되었습니다.\n\n\`\`\`python\nprint("Refactoring Complete!")\n\`\`\``
};

const fileList = [
  { name: "config.json", size: "1.2 KB", date: "2 days ago", type: "json", lfs: false },
  { name: "pytorch_model.bin", size: "420 MB", date: "2 days ago", type: "bin", lfs: true },
  { name: "tokenizer.json", size: "2.4 MB", date: "yesterday", type: "json", lfs: false },
];

export default function ModelPage() {
  const [activeTab, setActiveTab] = useState("card");
  const [showModal, setShowModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });

  // 헬퍼 함수들 (파일 아이콘, 복사, 다운로드)
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

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative">
      
      {/* 1. 헤더 컴포넌트 사용 */}
      <ModelHeader modelData={modelData} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8">
            {/* 탭 내용들 */}
            {activeTab === 'card' && (
              <article className="prose prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{modelData.readme}</ReactMarkdown>
              </article>
            )}

            {activeTab === 'files' && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
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

            {/* 2. 커뮤니티 컴포넌트 사용 (깔끔!) */}
            {activeTab === 'community' && <CommunityTab />}
          </div>

          <div className="lg:col-span-4">
            {/* 3. 사이드바 컴포넌트 사용 */}
            <ModelSidebar modelData={modelData} onOpenModal={() => setShowModal(true)} />
          </div>
        </div>
      </main>

      {/* 모달 및 토스트 (Global UI) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
           <div className="bg-white p-6 rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
             <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2"><Terminal size={20}/> Use in Transformers</h3><button onClick={() => setShowModal(false)}><X/></button></div>
             <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono">from transformers import pipeline...</div>
           </div>
        </div>
      )}
      
      {toast.show && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce-in z-50">
           <ArrowDownToLine size={20} className="text-green-400"/> <span className="font-medium">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}