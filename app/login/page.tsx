"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Lock, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(''); // 입력할 때 에러 메시지 초기화
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 백엔드 로그인 API 호출
      const res = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.status === "success") {
        // 🟢 로그인 성공! 토큰과 유저 이름을 로컬 스토리지에 저장 (이게 통행증입니다!)
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        
        // 홈 화면으로 이동
        router.push('/');
      } else {
        setErrorMsg(data.message); // "아이디 또는 비밀번호가 틀렸습니다" 등
      }
    } catch (err) {
      setErrorMsg("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        {/* 로고 & 타이틀 */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Box size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">AI Platform 로그인</h2>
          <p className="text-sm text-gray-500 mt-2">서비스를 이용하려면 로그인이 필요합니다.</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input 
                type="text" name="username" required value={formData.username} onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="아이디를 입력하세요"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input 
                type="password" name="password" required value={formData.password} onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          {errorMsg && <p className="text-red-500 text-sm font-bold text-center">{errorMsg}</p>}

          <button 
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:bg-gray-400 mt-2"
          >
            {loading ? "로그인 중..." : "로그인"} <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
          계정이 없으신가요? <Link href="/signup" className="text-blue-600 font-bold hover:underline">회원가입</Link>
        </div>
      </div>
    </div>
  );
}