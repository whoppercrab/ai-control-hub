"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 🟢 라우터 추가
import { 
  Search, SlidersHorizontal, Heart, Download, Activity, 
  Box, Terminal, Type, Image as ImageIcon, Mic, Database, Layers,
  LayoutDashboard, ArrowRight , LogOut
} from 'lucide-react';

// 데이터셋은 아직 DB 연동 전이므로 가짜 데이터 유지
const trendingDatasets = [
  { id: 101, author: "nsmc", name: "naver-sentiment-movie-corpus", size: "30MB", likes: 1200, downloads: "500k", updated: "1 year ago", type: "nlp" },
  { id: 102, author: "squad_kor_v1", name: "squad_kor_v1", size: "15MB", likes: 850, downloads: "200k", updated: "2 years ago", type: "nlp" },
  { id: 103, author: "coco", name: "coco-2017", size: "25GB", likes: 5400, downloads: "1.5M", updated: "3 months ago", type: "vision" },
];

const categories = [
  { label: "All", icon: Layers },
  { label: "NLP", icon: Type },
  { label: "Computer Vision", icon: ImageIcon },
  { label: "Audio", icon: Mic },
];

export default function Home() {
  const router = useRouter(); // 🟢 라우터 활성화
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewType, setViewType] = useState<'models' | 'datasets'>('models');

  // 🟢 [NEW] DB에서 불러온 진짜 모델을 담을 상태
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    alert("안전하게 로그아웃 되었습니다.");
    router.push("/login"); // 로그인 화면으로 쫓아냄
  };
  // 🟢 [NEW] 백엔드에서 모델 목록 불러오기
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('http://localhost:8000/models');
        const result = await res.json();
        if (result.status === "success") {
          setModels(result.data); // 진짜 데이터 저장
        }
      } catch (error) {
        console.error("모델 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative">
      
      {/* 상단 네비게이션 바 */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-7xl mx-auto z-10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">AI</div>
            <span>Platform</span>
        </div>
        
        {/* 🟢 [수정됨] 대시보드 버튼과 로그아웃 버튼을 나란히 배치 */}
        <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
                <LogOut size={18} /> 로그아웃
            </button>
            <Link 
                href="/dashboard/models" 
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full font-medium text-sm hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                <LayoutDashboard size={16} />
                Console
                <ArrowRight size={16} className="opacity-50"/>
            </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white pt-32 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            모두를 위한 <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI 허브</span> 플랫폼
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            50만 개 이상의 오픈소스 모델과 데이터셋을 발견하고, <br/>
            직접 학습시켜 나만의 AI 서비스를 구축하세요.
          </p>

          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            </div>
            <input type="text" className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-full focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm" placeholder="모델, 데이터셋, 사용자 검색..." />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 뷰 타입 토글 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-200 pb-2">
            <div className="flex gap-6">
                <button onClick={() => setViewType('models')} className={`flex items-center gap-2 pb-2 text-lg font-bold border-b-2 transition-all ${viewType === 'models' ? "border-blue-600 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                    <Box size={20} /> Models <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-normal">{models.length}</span>
                </button>
                <button onClick={() => setViewType('datasets')} className={`flex items-center gap-2 pb-2 text-lg font-bold border-b-2 transition-all ${viewType === 'datasets' ? "border-red-500 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                    <Database size={20} /> Datasets <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-normal">3</span>
                </button>
            </div>
            {/* 카테고리 필터 */}
            <div className="flex items-center gap-3 overflow-x-auto">
                {categories.map((cat) => (
                    <button key={cat.label} onClick={() => setActiveCategory(cat.label)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${activeCategory === cat.label ? "bg-gray-900 text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                        <cat.icon size={14}/> {cat.label}
                    </button>
                ))}
            </div>
        </div>

        {/* 그리드 리스트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* 모델 탭 로딩 중 */}
            {viewType === 'models' && loading && (
                <div className="col-span-full py-20 text-center text-gray-400 font-bold animate-pulse">
                    데이터베이스에서 모델을 불러오는 중입니다...
                </div>
            )}

            {/* 🟢 진짜 DB 모델 데이터 렌더링 */}
            {viewType === 'models' && !loading && models.map((model) => (
                <Link href={`/model/${model.name}`} key={model.id} className="group block">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all hover:border-blue-300 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 min-w-[40px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-500 group-hover:text-blue-600 group-hover:from-blue-50 group-hover:to-blue-100 transition-colors">
                                    <Box size={20} />
                                </div>
                                <div className="truncate">
                                    <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 group-hover:underline decoration-blue-600 decoration-2 underline-offset-2">{model.name}</h3>
                                    <p className="text-sm text-gray-500">{model.author}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6 flex-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            <Terminal size={12}/> AI Model
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-50">
                            <div className="flex gap-4">
                              <span className="flex items-center gap-1"><Activity size={12}/> {model.created_at}</span>
                              <span className="flex items-center gap-1"><Download size={12}/> 0</span>
                            </div>
                            <span className="flex items-center gap-1 font-medium hover:text-red-500"><Heart size={12}/> 0</span>
                        </div>
                    </div>
                </Link>
            ))}

            {/* 데이터셋 가짜 데이터 렌더링 (유지) */}
            {viewType === 'datasets' && trendingDatasets.map((dataset) => (
                <div key={dataset.id} className="group block cursor-pointer">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all hover:border-red-300 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 min-w-[40px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-500 group-hover:text-red-600 group-hover:from-red-50 group-hover:to-red-100 transition-colors">
                                    <Database size={20} />
                                </div>
                                <div className="truncate">
                                    <h3 className="font-bold text-gray-900 truncate group-hover:text-red-600 group-hover:underline decoration-red-600 decoration-2 underline-offset-2">{dataset.name}</h3>
                                    <p className="text-sm text-gray-500">{dataset.author}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6 flex-1 flex gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"><Database size={12}/> {dataset.size}</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 uppercase">{dataset.type}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-50">
                            <div className="flex gap-4"><span className="flex items-center gap-1"><Activity size={12}/> {dataset.updated}</span><span className="flex items-center gap-1"><Download size={12}/> {dataset.downloads}</span></div>
                            <span className="flex items-center gap-1 font-medium hover:text-red-500"><Heart size={12}/> {dataset.likes}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 py-12 mt-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
            <p>© 테스트 진행중..</p>
        </div>
      </footer>
    </div>
  );
}