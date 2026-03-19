"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, SlidersHorizontal, Heart, Download, Activity, 
  Box, Terminal, Type, Image as ImageIcon, Mic, Database, Layers,
  LayoutDashboard, ArrowRight , LogOut
} from 'lucide-react';

// 🟢 가짜 데이터(trendingDatasets)는 이제 필요 없으니 삭제했습니다!

const categories = [
  { label: "All", icon: Layers },
  { label: "NLP", icon: Type },
  { label: "Computer Vision", icon: ImageIcon },
  { label: "Audio", icon: Mic },
];

export default function Home() {
  const router = useRouter(); 
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewType, setViewType] = useState<'models' | 'datasets'>('models');

  const [models, setModels] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);




  // 🟢 [NEW] 1. 검색어를 저장할 그릇 만들기
  const [searchQuery, setSearchQuery] = useState("");

  // 🟢 [NEW] 2. 검색어에 맞춰 데이터 걸러내기 (이름 또는 작성자에 검색어가 포함되어 있는지 대소문자 무시하고 검사)
  const filteredModels = models.filter((model) => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    model.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDatasets = datasets.filter((dataset) => 
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    dataset.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    alert("안전하게 로그아웃 되었습니다.");
    router.push("/login"); 
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resModels = await fetch('http://127.0.0.1:8000/models');
        const dataModels = await resModels.json();
        if (dataModels.status === "success") setModels(dataModels.data);

        const resDatasets = await fetch('http://127.0.0.1:8000/datasets');
        const dataDatasets = await resDatasets.json();
        if (dataDatasets.status === "success") setDatasets(dataDatasets.data);

      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative">
      
      {/* 상단 네비게이션 바 */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-7xl mx-auto z-10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">AI</div>
            <span>Platform</span>
        </div>
        
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
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-full focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm" 
                placeholder="모델, 데이터셋, 사용자 검색..." 
            />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 뷰 타입 토글 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-200 pb-2">
            <div className="flex gap-6">
                <button onClick={() => setViewType('models')} className={`flex items-center gap-2 pb-2 text-lg font-bold border-b-2 transition-all ${viewType === 'models' ? "border-blue-600 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                    <Box size={20} /> Models <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-normal">{filteredModels.length}</span>
                </button>
                {/* 🟢 하드코딩된 숫자 '3' 대신 진짜 datasets.length로 변경! */}
                <button onClick={() => setViewType('datasets')} className={`flex items-center gap-2 pb-2 text-lg font-bold border-b-2 transition-all ${viewType === 'datasets' ? "border-red-500 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                    <Database size={20} /> Datasets <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-normal">{filteredDatasets.length}</span>
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
            
            {/* 로딩 중 메시지 */}
            {loading && (
                <div className="col-span-full py-20 text-center text-gray-400 font-bold animate-pulse">
                    데이터베이스에서 정보를 불러오는 중입니다...
                </div>
            )}

            {/* 🟦 모델 카드 렌더링 (파란색 테마) */}
            {viewType === 'models' && !loading && filteredModels.map((model) => (
                <Link href={`/model/${model.name}`} key={model.id} className="group block h-full cursor-pointer">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all hover:border-blue-300 h-full flex flex-col">
                        {/* 헤더: 아이콘 + 제목 + 작성자 */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-blue-600 group-hover:from-blue-50 group-hover:to-blue-100 group-hover:border-blue-200 transition-all shadow-sm">
                                <Box size={24} />
                            </div>
                            <div className="overflow-hidden pt-1">
                                <h3 className="font-extrabold text-gray-900 text-lg truncate group-hover:text-blue-600 transition-colors">{model.name}</h3>
                                <p className="text-sm font-medium text-gray-500 truncate">{model.author}</p>
                            </div>
                        </div>
                        
                        {/* 중간: 뱃지 정보 */}
                        <div className="mb-6 flex-1 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">
                                <Terminal size={14}/> {model.type || "AI Model"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">
                                <Box size={14}/> {model.size || "Unknown"}
                            </span>
                        </div>
                        
                        {/* 하단: 통계 정보 */}
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1.5"><Activity size={14}/> {model.created_at?.split(' ')[0] || "Just now"}</span>
                              <span className="flex items-center gap-1.5"><Download size={14}/> {model.downloads || 0}</span>
                            </div>
                            <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors"><Heart size={14}/> {model.likes || 0}</span>
                        </div>
                    </div>
                </Link>
            ))}

            {/* 🟥 데이터셋 카드 렌더링 (빨간색 테마) */}
            {viewType === 'datasets' && !loading && filteredDatasets.map((dataset) => (
                <Link href={`/dataset/${dataset.name}`} key={dataset.id} className="group block h-full cursor-pointer">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all hover:border-red-300 h-full flex flex-col">
                        {/* 헤더: 아이콘 + 제목 + 작성자 */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-red-600 group-hover:from-red-50 group-hover:to-red-100 group-hover:border-red-200 transition-all shadow-sm">
                                <Database size={24} />
                            </div>
                            <div className="overflow-hidden pt-1">
                                <h3 className="font-extrabold text-gray-900 text-lg truncate group-hover:text-red-600 transition-colors">{dataset.name}</h3>
                                <p className="text-sm font-medium text-gray-500 truncate">{dataset.author}</p>
                            </div>
                        </div>
                        
                        {/* 중간: 뱃지 정보 */}
                        <div className="mb-6 flex-1 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">
                                <Database size={14}/> {dataset.type || "Dataset"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">
                                <Database size={14}/> {dataset.size || "0 MB"}
                            </span>
                        </div>
                        
                        {/* 하단: 통계 정보 */}
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1.5"><Activity size={14}/> {dataset.created_at?.split(' ')[0] || "Just now"}</span>
                              <span className="flex items-center gap-1.5"><Download size={14}/> {dataset.downloads || 0}</span>
                            </div>
                            <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors"><Heart size={14}/> {dataset.likes || 0}</span>
                        </div>
                    </div>
                </Link>
            ))}
            
            {/* 데이터가 하나도 없을 때 보여줄 화면 */}
            {viewType === 'datasets' && !loading && filteredDatasets.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-400 font-medium">검색 결과가 없습니다.</div>
            )}
            {viewType === 'models' && !loading && filteredModels.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-400 font-medium">검색 결과가 없습니다.</div>
            )}
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