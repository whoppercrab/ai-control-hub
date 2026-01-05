"use client";

import React, { useState } from 'react';
import { Terminal, Play, Cpu, Zap } from 'lucide-react';

export default function InferencePage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState("Checking...");

  // 서버 상태 확인
  React.useEffect(() => {
    fetch('http://localhost:8000/')
      .then(() => setServerStatus("Online 🟢"))
      .catch(() => setServerStatus("Offline 🔴"));
  }, []);

  const runInference = async () => {
    if (!inputText) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("AI 서버와 연결할 수 없습니다. 백엔드가 켜져있나요?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 헤더 */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Cpu className="text-purple-600"/> AI Inference Lab
            </h2>
            <p className="text-gray-500">Test your models with real-time inference.</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <span className="text-sm font-semibold text-gray-600">AI Server:</span>
            <span className="text-sm font-mono font-bold">{serverStatus}</span>
        </div>
      </div>

      {/* 메인 테스트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 입력창 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-[400px] flex flex-col">
            <label className="text-sm font-bold text-gray-700 mb-2">Input Text</label>
            <textarea 
                className="flex-1 w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 outline-none resize-none text-lg"
                placeholder="분석할 텍스트를 입력하세요... (예: 이 영화 진짜 재밌네!)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
            />
            <button 
                onClick={runInference}
                disabled={loading}
                className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all disabled:bg-gray-400"
            >
                {loading ? <Zap className="animate-spin"/> : <Play size={20}/>}
                {loading ? "Processing..." : "Run Inference"}
            </button>
        </div>

        {/* 결과창 */}
        <div className="bg-[#1e1e1e] p-6 rounded-2xl shadow-lg h-[400px] flex flex-col font-mono text-gray-300 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-700 pb-2 mb-4">
                <Terminal size={18} className="text-green-400"/>
                <span className="text-sm font-bold">Output Console</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2">
                {!result && !loading && <span className="text-gray-600 italic">// Waiting for input...</span>}
                
                {loading && <span className="text-yellow-400 animate-pulse">Running inference engine...</span>}
                
                {result && (
                    <div className="space-y-4 animate-fade-in-up">
                        <div>
                            <span className="text-blue-400">Input: </span>
                            <span className="text-white">"{result.input}"</span>
                        </div>
                        <div className="pl-4 border-l-2 border-green-500">
                            <div className="text-gray-400 text-xs uppercase mb-1">Prediction</div>
                            <div className="text-2xl font-bold text-green-400">{result.label}</div>
                            <div className="text-sm text-gray-500">Confidence: {(result.score * 100).toFixed(2)}%</div>
                        </div>
                        <div className="text-xs text-gray-600 mt-4">
                            Process finished with exit code 0
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}