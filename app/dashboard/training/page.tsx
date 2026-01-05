"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Save, RefreshCw, Terminal, CheckCircle } from 'lucide-react';

export default function TrainingPage() {
  const [logs, setLogs] = useState<string[]>(["[System] Ready to start training."]);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // 설정값 상태
  const [epochs, setEpochs] = useState(10);
  const [batchSize, setBatchSize] = useState(32);

  // 자동 스크롤을 위한 Ref
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 로그가 추가될 때마다 스크롤 내리기
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // 🟢 1. 학습 상태를 주기적으로 확인 (Polling)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTraining) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('http://localhost:8000/train/status');
          const data = await res.json();
          
          setLogs(data.logs);
          setProgress(data.progress);
          
          // 학습이 끝났으면 Polling 중단
          if (!data.is_training && data.progress === 100) {
            setIsTraining(false);
          }
        } catch (e) {
          console.error("Connection Error");
        }
      }, 1000); // 1초마다 확인
    }
    return () => clearInterval(interval);
  }, [isTraining]);

  // 🟢 2. 학습 시작 요청
  const startTraining = async () => {
    try {
      setLogs(["[System] Sending start request..."]);
      const res = await fetch('http://localhost:8000/train/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epochs: Number(epochs), batch_size: Number(batchSize) }),
      });
      const data = await res.json();
      
      if (data.status === "success") {
        setIsTraining(true);
      } else {
        alert("이미 학습이 진행 중입니다.");
      }
    } catch (e) {
      alert("AI 서버 연결 실패! (api/server.py 실행 확인)");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">New Training Job</h2>
            <p className="text-gray-500">Configure parameters and start model training.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={startTraining}
                disabled={isTraining}
                className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg transition-all ${isTraining ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
                {isTraining ? <RefreshCw className="animate-spin" size={18}/> : <Play size={18}/>}
                {isTraining ? `Training... ${progress}%` : "Start Training"}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 왼쪽: 설정 폼 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold mb-6 border-b pb-4">Hyperparameters</h3>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Epochs (반복 횟수)</label>
                    <input 
                      type="number" 
                      value={epochs}
                      onChange={(e) => setEpochs(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Size</label>
                    <input 
                      type="number" 
                      value={batchSize}
                      onChange={(e) => setBatchSize(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                {/* 나머지 UI용 더미 입력창들 */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Rate</label>
                    <input type="text" defaultValue="0.001" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Optimizer</label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none">
                        <option>AdamW</option>
                        <option>SGD</option>
                    </select>
                </div>
            </div>

            {/* 프로그레스 바 */}
            <div className="mt-8">
                <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">Total Progress</span>
                    <span className="text-blue-600 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* 오른쪽: 터미널 로그 */}
        <div className="lg:col-span-1 bg-[#1e1e1e] rounded-2xl shadow-lg p-6 flex flex-col h-[500px]">
            <div className="flex items-center gap-2 text-gray-400 mb-4 border-b border-gray-700 pb-2">
                <Terminal size={18}/> <span className="text-sm font-mono">Live Logs</span>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-sm space-y-2 custom-scrollbar text-gray-300">
                {logs.map((log, idx) => (
                    <div key={idx} className="break-all border-l-2 border-transparent hover:border-blue-500 pl-2 transition-colors">
                        {log}
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>
        </div>

      </div>
    </div>
  );
}