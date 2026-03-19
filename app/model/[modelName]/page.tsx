"use client";

import React, { useState, useEffect, use } from 'react';
import { ArrowDownToLine, Box, FileJson, FileText, ArchiveX, Tag, FileBadge, User, Download, Heart, Activity, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import Link from 'next/link';

// 커뮤니티 컴포넌트 불러오기
import DiscussionBoard from '../../components/DiscussionBoard';

export default function PublicModelPage({ params }: { params: Promise<{ modelName: string }> }) {
  // Next.js 15: params 포장 뜯기 및 한글 디코딩
  const resolvedParams = use(params);
  const modelName = decodeURIComponent(resolvedParams.modelName);

  const [activeTab, setActiveTab] = useState("card");
  const [modelData, setModelData] = useState<any>(null);
  const [modelFiles, setModelFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  // 🟢 브라우저 캐시 무시하고 항상 최신 데이터 불러오기
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) setUsername(storedName);

    const fetchData = async () => {
      try {
        const resData = await fetch(`http://127.0.0.1:8000/models/${modelName}`, { cache: "no-store" });
        const resultData = await resData.json();
        if (resultData.status === "success") setModelData(resultData.data);

        const resFiles = await fetch(`http://127.0.0.1:8000/models/${modelName}/files`, { cache: "no-store" });
        const resultFiles = await resFiles.json();
        if (resultFiles.status === "success") setModelFiles(resultFiles.data);

      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [modelName]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'json': return <FileJson size={20} className="text-yellow-600"/>;
      case 'pt': case 'bin': case 'safetensors': return <Box size={20} className="text-blue-600"/>;
      default: return <FileText size={20} className="text-gray-500"/>;
    }
  };

  // 🟢 파일 다운로드 (캐시 무력화 + 실시간 숫자 반영)
  const handleDownload = (fileName: string) => {
    const timestamp = new Date().getTime();
    window.location.href = `http://127.0.0.1:8000/models/${modelName}/files/${fileName}?t=${timestamp}`;
    
    setModelData((prev: any) => ({
      ...prev,
      downloads: parseInt(prev.downloads || "0") + 1
    }));
  };

  // 🟢 [NEW] 모델 좋아요 누르기 함수
  const handleLike = async () => {
    // 🟢 로그인 안 한 유저는 차단!
    if (!username) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
    try {
      // 주소가 datasets 대신 models 입니다!
      const res = await fetch(`http://127.0.0.1:8000/models/${modelName}/like?username=${username}`, { method: 'POST' });
      const data = await res.json();
      if (data.status === "success") {
        setModelData((prev: any) => ({
          ...prev,
          likes: data.likes,
          liked_by: data.liked_by
        }));
      }
    } catch (error) {
      console.error("좋아요 실패", error);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-gray-50"><div className="animate-pulse flex flex-col items-center gap-3"><Box size={40} className="text-blue-400" /><span className="text-lg font-bold text-gray-500">모델 정보를 불러오는 중입니다...</span></div></div>;
  if (!modelData) return <div className="min-h-screen flex justify-center items-center bg-gray-50"><div className="text-center"><h2 className="text-2xl font-bold text-gray-800 mb-2">404 - Model Not Found</h2><p className="text-gray-500">요청하신 모델을 찾을 수 없습니다.</p><Link href="/" className="text-blue-600 mt-4 inline-block font-bold hover:underline">홈으로 돌아가기</Link></div></div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative pb-20">
      
      {/* ==================================
          헤더 영역 (데이터셋 페이지와 완벽 통일)
          ================================== */}
      <header className="border-b border-gray-200 bg-white pt-24 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link> / 
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1"><Box size={14}/> {modelData.name}</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3 mb-4">
                    {modelData.name}
                  </h1>
                  {/* 통계 및 작성자 뱃지란 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                    <span className="flex items-center gap-1.5"><User size={16} className="text-gray-400"/> {modelData.author}</span>
                    <span className="flex items-center gap-1.5"><Download size={16} className="text-blue-500"/> 다운로드 {modelData.downloads || 0}</span>
                    {/* 🟢 내가 누른 명단에 있는지 실시간 확인 */}
                    {(() => {
                        const isLiked = modelData?.liked_by && modelData.liked_by.split(',').includes(username);
                        return (
                            <button onClick={handleLike} className={`flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer font-bold ${isLiked ? "text-red-600" : "text-gray-500 hover:text-red-600"}`}>
                                <Heart size={16} className={`${isLiked ? "text-blue-600 fill-blue-600" : "text-gray-400 fill-transparent"} transition-colors`}/> 좋아요 {modelData?.likes || 0}
                            </button>
                        );
                    })()}
                    <span className="flex items-center gap-1.5"><Activity size={16} className="text-green-500"/> {modelData.created_at || "최근 업데이트"}</span>
                  </div>
              </div>
          </div>

          <div className="flex gap-6 mt-8">
            <button onClick={() => setActiveTab('card')} className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'card' ? "border-blue-600 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Model Card</button>
            <button onClick={() => setActiveTab('files')} className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'files' ? "border-blue-600 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"} flex items-center gap-2`}>Files and versions <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{modelFiles.length}</span></button>
            <button onClick={() => setActiveTab('community')} className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'community' ? "border-blue-600 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Community</button>
          </div>
        </div>
      </header>

      {/* ==================================
          메인 콘텐츠 영역
          ================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8">
            {/* 탭 1: 마크다운 설명 */}
            {activeTab === 'card' && (
              <article className="prose prose-slate max-w-none animate-fade-in border border-gray-200 p-8 rounded-2xl bg-white shadow-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{modelData.readme}</ReactMarkdown>
              </article>
            )}

            {/* 탭 2: 예쁜 파일 목록 (파란색 호버 테마) */}
            {activeTab === 'files' && (
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white animate-fade-in shadow-sm">
                {modelFiles.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center text-gray-400">
                        <ArchiveX size={48} className="mb-4 opacity-50 text-blue-300"/>
                        <p className="font-bold text-lg">업로드된 파일이 없습니다.</p>
                        <p className="text-sm mt-2">모델 파일이 서버에 존재하지 않습니다.</p>
                    </div>
                ) : (
                    modelFiles.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center p-5 border-b border-gray-100 hover:bg-blue-50/50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 group-hover:border-blue-200 group-hover:text-blue-500 transition-colors shadow-sm shrink-0">
                            {getFileIcon(file.type)} 
                          </div>
                          <div>
                              <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                  {file.name}
                                  {file.lfs && <span className="bg-gray-100 text-[10px] px-1.5 py-0.5 rounded font-bold text-gray-500 border border-gray-200">LFS</span>}
                              </div>
                              <div className="text-xs font-medium text-gray-400 mt-1">{file.size}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <button onClick={() => handleDownload(file.name)} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-white bg-white hover:bg-blue-600 border border-gray-200 hover:border-blue-600 px-4 py-2 rounded-xl transition-all shadow-sm">
                                <ArrowDownToLine size={16}/> 다운로드
                            </button>
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

          {/* ==================================
              우측 사이드바
              ================================== */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. 까만 터미널 다운로드 가이드 */}
            <div className="bg-gray-900 rounded-2xl p-6 shadow-lg text-white">
                <h3 className="font-bold text-gray-100 mb-4 flex items-center gap-2">
                    <Terminal size={18} className="text-blue-400"/> Use this model
                </h3>
                <div className="bg-black/50 p-4 rounded-xl border border-gray-700">
                    <code className="text-sm text-gray-300 break-all font-mono">
                        <span className="text-blue-400">wget</span> http://localhost:8000/models/{modelData.name}/files/[파일명]
                    </code>
                </div>
            </div>

            {/* 2. 메타데이터 정보 카드 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                    <Box size={18} className="text-gray-400"/> Model Info
                </h3>
                <div className="space-y-5">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Author</p>
                        <p className="font-medium text-gray-800 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                            <User size={16} className="text-gray-500"/> {modelData.author}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">License</p>
                        <p className="font-medium text-gray-800 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                            <FileBadge size={16} className="text-blue-400"/> {modelData.license}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tags</p>
                        <div className="flex flex-wrap gap-2">
                            {modelData.tags && modelData.tags.map((tag: string, i: number) => (
                                <span key={i} className="bg-blue-50 text-blue-600 border border-blue-100 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 hover:bg-blue-100 transition-colors cursor-pointer">
                                    <Tag size={12}/> {tag.trim()}
                                </span>
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