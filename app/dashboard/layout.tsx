"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Server, Database, BrainCircuit, 
  Activity, Settings, LogOut, Cpu, Terminal, Box, FolderOpen, 
  RouteIcon
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 🟢 [수정됨] 메뉴 목록 업데이트 (데이터셋 관리 추가)
  const menuItems = [
    { name: '대시보드 (Main)', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI 학습 관리', href: '/dashboard/training', icon: BrainCircuit },
    { name: '모델 관리', href: '/dashboard/models', icon: Box },            // 아이콘 변경 (Database -> Box)
    { name: 'IoT 게이트웨이', href: '/dashboard/gateways', icon: RouteIcon }, // 🟢
    { name: '데이터셋 관리', href: '/dashboard/datasets', icon: Database },   // 🟢 새로 추가됨
    //{ name: 'AI 모델 테스트', href: '/dashboard/inference', icon: Terminal },
    { name: '서버 모니터링', href: '/dashboard/monitoring', icon: Server },
    //{ name: '서비스 관제', href: '/dashboard/service', icon: Activity },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      
      {/* 사이드바 */}
      <aside className="w-64 bg-[#111827] text-white flex flex-col shadow-2xl z-20">
        
        {/* 로고 (클릭 시 홈으로 이동) */}
        <Link href="/" className="h-16 flex items-center gap-3 px-6 border-b border-gray-800 bg-[#0f1523] hover:bg-[#1f2937] transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Cpu size={20} className="text-white"/>
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-100">AI Control Hub</span>
        </Link>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3 mt-2">Overview</div>
          
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50 font-medium" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon size={20} className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-white"}`}/>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 하단 관리자 영역 */}
        <div className="p-4 border-t border-gray-800 bg-[#0f1523]">
           <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">Admin</div>
              <div className="flex flex-col">
                  <span className="text-sm font-medium">관리자 (Root)</span>
                  <span className="text-xs text-gray-500">System Operator</span>
              </div>
           </div>
           
           <Link 
             href="/" 
             className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-500/20"
           >
            <LogOut size={16} /> 나가기 (Main Home)
          </Link>
        </div>
      </aside>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f3f4f6]">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
           
           {/* 브레드크럼 */}
           <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-blue-600 cursor-pointer font-medium transition-colors">Home</Link> 
              / 
              <span className="text-gray-900 font-bold">Dashboard</span>
           </div>

           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold text-green-700">System Online</span>
             </div>
             <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><Settings size={20}/></button>
           </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
            {children}
        </main>
      </div>
    </div>
  );
}