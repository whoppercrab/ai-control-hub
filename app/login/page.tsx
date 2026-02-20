"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, Lock, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();

      if (data.status === "success") {
        // 토큰을 브라우저에 저장하고 대시보드로 이동
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        router.push('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("서버와 연결할 수 없습니다. 백엔드가 켜져있나요?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* 헤더 영역 */}
        <div className="bg-[#111827] px-8 pt-10 pb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Cpu size={32} className="text-white"/>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">AI Control Hub</h2>
          <p className="text-gray-400 text-sm">관리자 시스템에 로그인하세요</p>
        </div>

        {/* 폼 영역 */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* 아이디 입력 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400"/>
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400"/>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}

            {/* 로그인 버튼 */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:bg-gray-400"
            >
              {loading ? "로그인 중..." : "Sign In"}
              {!loading && <ArrowRight size={18}/>}
            </button>
          </form>
            {/* 🟢 [NEW] 회원가입 페이지 이동 링크 추가 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요? <Link href="/signup" className="text-blue-600 font-bold hover:underline">회원가입하기</Link>
            </p>
          </div>
          
        </div>

      </div>
    </div>
  );
}