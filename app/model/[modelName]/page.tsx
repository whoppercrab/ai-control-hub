"use client";

import React, { useState, useEffect, use } from 'react';
import { ArrowDownToLine, Database, FileJson, FileText, Terminal, X, ArchiveX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

import ModelHeader from './components/ModelHeader';
import ModelSidebar from './components/ModelSidebar';
import DiscussionBoard from '../../components/DiscussionBoard';

export default function PublicModelPage({ params }: { params: Promise<{ modelName: string }> }) {
  const { modelName } = use(params);

  const [activeTab, setActiveTab] = useState("card");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });
  
  const [modelData, setModelData] = useState<any>(null);
  
  // 🟢 [NEW] 진짜 파일 목록을 담을 그릇
  const [modelFiles, setModelFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModelDataAndFiles = async () => {
      try {
        // 1. 모델 텍스트 정보 불러오기
        const resModel = await fetch(`http://127.0.0.1:8000/models/${modelName}`);
        const resultModel = await resModel.json();
        if (resultModel.status === "success") setModelData(resultModel.data);

        // 2. 🟢 [NEW] 모델에 등록된 진짜 파일 목록 불러오기
        const resFiles = await fetch(`http://127.0.0.1:8000/models/${modelName}/files`);
        const resultFiles = await resFiles.json();
        if (resultFiles.status === "success") setModelFiles(resultFiles.data);

      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModelDataAndFiles();
  }, [modelName]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'json': return <FileJson size={18} className="text-yellow-600"/>;
      case 'bin': return <Database size={18} className="text-blue-600"/>;
      default: return <FileText size={18} className="text-gray-500"/>;
    }
  };

  // 🟢 [NEW] 진짜 파일 다운로드 요청 함수
  const handleDownload = (fileName: string) => {
    setToast({ show: true, msg: `Downloading ${fileName}...` });
    // 브라우저를 통해 백엔드의 파일 다운로드 주소로 찔러줍니다!
    window.location.href = `http://127.0.0.1:8000/models/${modelName}/files/${fileName}`;
    
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-gray-50"><div className="animate-pulse flex flex-col items-center gap-3"><Database size={40} className="text-blue-400" /><span className="text-lg font-bold text-gray-500">모델 정보를 불러오는 중입니다...</span></div></div>;
  if (!modelData) return <div className="min-h-screen flex justify-center items-center bg-gray-50"><div className="text-center"><h2 className="text-2xl font-bold text-gray-800 mb-2">404 - Model Not Found</h2><p className="text-gray-500">요청하신 모델을 찾을 수 없습니다.</p></div></div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative">
      <ModelHeader modelData={modelData} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            
            {/* 탭 1: 모델 설명 */}
            {activeTab === 'card' && (
              <article className="prose prose-slate max-w-none animate-fade-in">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {modelData.readme}
                </ReactMarkdown>
              </article>
            )}

            {/* 탭 2: 🟢 [수정됨] 진짜 파일 목록 출력 영역 */}
            {activeTab === 'files' && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white animate-fade-in">
                {modelFiles.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center text-gray-400">
                        <ArchiveX size={40} className="mb-3 opacity-50"/>
                        <p className="font-bold">업로드된 파일이 없습니다.</p>
                        <p className="text-sm mt-1">이 모델에는 아직 가중치 파일이 등록되지 않았습니다.</p>
                    </div>
                ) : (
                    modelFiles.map((file, idx) => (
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
                    ))
                )}
              </div>
            )}

            {/* 탭 3: 커뮤니티 */}
            {activeTab === 'community' && (
              <div className="animate-fade-in">
                <DiscussionBoard targetType="model" targetId={modelData.name} />
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <ModelSidebar modelData={modelData} onOpenModal={() => setShowModal(true)} />
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
           <div className="bg-white p-6 rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
             <div className="flex justify-between mb-4">
                <h3 className="font-bold flex gap-2 items-center"><Terminal size={20}/> Use in Transformers</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900"><X size={20}/></button>
             </div>
             <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
{`from transformers import AutoModel, AutoTokenizer

model_name = "${modelData.author}/${modelData.name}"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)`}
             </div>
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