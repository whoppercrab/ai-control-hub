"use client";

import React, { useState, useEffect, use } from 'react';
import { ArrowDownToLine, Database, FileJson, FileText, FileSpreadsheet, ArchiveX, Tag, FileBadge, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import Link from 'next/link';
import DiscussionBoard from '../../components/DiscussionBoard';

export default function PublicDatasetPage({ params }: { params: Promise<{ datasetName: string }> }) {
  
  // 🟢 [핵심] Next.js 15 방식: params를 use()로 먼저 안전하게 풀어줍니다!
  const resolvedParams = use(params);
  // 한글이나 띄어쓰기가 깨지지 않도록 디코딩까지 확실하게 해줍니다.
  const datasetName = decodeURIComponent(resolvedParams.datasetName);

  const [activeTab, setActiveTab] = useState("card");
  const [datasetData, setDatasetData] = useState<any>(null);
  const [datasetFiles, setDatasetFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 데이터셋 텍스트 정보 불러오기
        const resData = await fetch(`http://127.0.0.1:8000/datasets/${datasetName}`);
        const resultData = await resData.json();
        if (resultData.status === "success") setDatasetData(resultData.data);

        // 2. 데이터셋에 등록된 진짜 파일 목록 불러오기
        const resFiles = await fetch(`http://127.0.0.1:8000/datasets/${datasetName}/files`);
        const resultFiles = await resFiles.json();
        if (resultFiles.status === "success") setDatasetFiles(resultFiles.data);

      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [datasetName]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'json': return <FileJson size={18} className="text-yellow-600"/>;
      case 'csv': return <FileSpreadsheet size={18} className="text-green-600"/>;
      default: return <FileText size={18} className="text-gray-500"/>;
    }
  };

  const handleDownload = (fileName: string) => {
    // 🟢 [핵심] 브라우저를 통해 진짜 파일 다운로드 요청!
    window.location.href = `http://127.0.0.1:8000/datasets/${datasetName}/files/${fileName}`;
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-gray-50"><div className="animate-pulse flex flex-col items-center gap-3"><Database size={40} className="text-red-400" /><span className="text-lg font-bold text-gray-500">데이터셋 정보를 불러오는 중입니다...</span></div></div>;
  if (!datasetData) return <div className="min-h-screen flex justify-center items-center bg-gray-50"><div className="text-center"><h2 className="text-2xl font-bold text-gray-800 mb-2">404 - Dataset Not Found</h2><p className="text-gray-500">요청하신 데이터셋을 찾을 수 없습니다.</p><Link href="/" className="text-blue-600 mt-4 inline-block font-bold">홈으로 돌아가기</Link></div></div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative pb-20">
      
      {/* 헤더 영역 */}
      <header className="border-b border-gray-200 bg-white pt-24 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-medium">
            <Link href="/datasets" className="hover:text-red-600 transition-colors">Datasets</Link> / 
            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md flex items-center gap-1"><Database size={14}/> {datasetData.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight flex items-center gap-3">
            {datasetData.name}
          </h1>
          <div className="flex gap-6 mt-8">
            <button onClick={() => setActiveTab('card')} className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'card' ? "border-red-600 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Dataset Card</button>
            <button onClick={() => setActiveTab('files')} className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'files' ? "border-red-600 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"} flex items-center gap-2`}>Files and versions <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{datasetFiles.length}</span></button>
            
            {/* 🟢 [NEW] 커뮤니티 탭 버튼 추가 */}
            <button onClick={() => setActiveTab('community')} className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'community' ? "border-red-600 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Community</button>
          </div>
          
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8">
            {/* 탭 1: 설명 (Markdown) */}
            {activeTab === 'card' && (
              <article className="prose prose-slate max-w-none animate-fade-in border border-gray-200 p-8 rounded-2xl bg-white shadow-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{datasetData.readme}</ReactMarkdown>
              </article>
            )}

            {/* 탭 2: 진짜 파일 목록 및 다운로드 */}
            {activeTab === 'files' && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white animate-fade-in shadow-sm">
                {datasetFiles.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center text-gray-400">
                        <ArchiveX size={40} className="mb-3 opacity-50 text-red-300"/>
                        <p className="font-bold">업로드된 파일이 없습니다.</p>
                    </div>
                ) : (
                    datasetFiles.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 border-b hover:bg-red-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)} <span className="text-sm font-mono text-gray-800 font-medium">{file.name}</span>
                          {file.lfs && <span className="bg-gray-200 text-[10px] px-1.5 py-0.5 rounded font-bold text-gray-600">LFS</span>}
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="text-xs font-medium text-gray-400">{file.size}</span>
                            <button onClick={() => handleDownload(file.name)} className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:border-red-200 shadow-sm"><ArrowDownToLine size={16}/> 다운로드</button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
            {/* 🟢 [NEW] 탭 3: 커뮤니티 (토론장) */}
            {activeTab === 'community' && (
              <div className="animate-fade-in">
                {/* targetType을 "dataset"으로 지정해주면 데이터셋 전용 DB 공간에 저장됩니다! */}
                <DiscussionBoard targetType="dataset" targetId={datasetData.name} />
              </div>
            )}
          </div>

          {/* 사이드바 (정보란) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Dataset Info</h3>
                <div className="space-y-4">
                    <div><p className="text-xs text-gray-500 mb-1">Author</p><p className="font-medium flex items-center gap-2"><User size={16} className="text-gray-400"/> {datasetData.author}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">License</p><p className="font-medium flex items-center gap-2"><FileBadge size={16} className="text-red-400"/> {datasetData.license}</p></div>
                    <div>
                        <p className="text-xs text-gray-500 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                            {datasetData.tags && datasetData.tags.map((tag: string, i: number) => (
                                <span key={i} className="bg-red-50 text-red-600 border border-red-100 text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1"><Tag size={12}/> {tag.trim()}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}