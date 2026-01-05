"use client";

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';
import { Cpu, Activity, Zap, HardDrive, ArrowUpRight } from 'lucide-react';

// 가짜 데이터 (GPU/CPU 실시간 사용량 느낌)
const resourceData = [
  { time: '10:00', gpu: 30, cpu: 20 },
  { time: '10:05', gpu: 45, cpu: 25 },
  { time: '10:10', gpu: 75, cpu: 30 },
  { time: '10:15', gpu: 85, cpu: 45 },
  { time: '10:20', gpu: 60, cpu: 35 },
  { time: '10:25', gpu: 90, cpu: 50 },
  { time: '10:30', gpu: 95, cpu: 60 },
];

const modelPerformanceData = [
  { name: 'Yolo v5', accuracy: 85, speed: 92 },
  { name: 'BERT-Kor', accuracy: 94, speed: 78 },
  { name: 'ResNet50', accuracy: 89, speed: 85 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* 1. 상단 요약 카드 (Stat Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active GPUs" value="4 / 4" sub="All systems running" icon={Zap} color="text-yellow-600" bg="bg-yellow-100" />
        <StatCard title="Avg CPU Load" value="42%" sub="+5% from last hour" icon={Cpu} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Memory Usage" value="64.2 GB" sub="128 GB Total" icon={HardDrive} color="text-purple-600" bg="bg-purple-100" />
        <StatCard title="Active Inference" value="1,204" sub="Requests per min" icon={Activity} color="text-green-600" bg="bg-green-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. 메인 차트: 리소스 사용량 (Area Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Real-time Resource Usage</h3>
                <p className="text-sm text-gray-500">GPU vs CPU Load Monitoring</p>
            </div>
            <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs font-medium text-gray-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> GPU</span>
                <span className="flex items-center gap-1 text-xs font-medium text-gray-500"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> CPU</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resourceData}>
                <defs>
                  <linearGradient id="colorGpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="gpu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorGpu)" />
                <Area type="monotone" dataKey="cpu" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. 서브 차트: 모델 성능 비교 (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Model Benchmark</h3>
          <p className="text-sm text-gray-500 mb-6">Accuracy vs Inference Speed</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb"/>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fill: '#4b5563'}} axisLine={false} tickLine={false}/>
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                <Bar dataKey="accuracy" name="Accuracy (%)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="speed" name="Speed (ms)" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

// 작은 컴포넌트: 통계 카드
function StatCard({ title, value, sub, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
                </div>
                <div className={`p-3 rounded-xl ${bg} ${color}`}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <ArrowUpRight size={16}/> <span>{sub}</span>
            </div>
        </div>
    )
}