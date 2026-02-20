"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. 로컬 스토리지에서 로그인 토큰 확인
    const token = localStorage.getItem("token");
    
    // 2. 현재 접속하려는 페이지가 로그인/회원가입 페이지인지 확인
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (!token && !isAuthPage) {
      // 토큰이 없는데 다른 페이지를 가려고 하면 강제로 로그인 페이지로 쫓아냄
      router.replace('/login');
    } else if (token && isAuthPage) {
      // 이미 로그인했는데 로그인 페이지를 가려고 하면 메인 홈으로 돌려보냄
      router.replace('/');
    } else {
      // 정상적인 접근이면 통과!
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // 검사가 끝나기 전까지는 빈 화면(또는 로딩)을 보여주어 깜빡임 방지
  if (!isAuthorized) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}