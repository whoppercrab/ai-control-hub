"use client";

import React, { useEffect, useState } from 'react';
import { Router, Activity, AlertTriangle, CheckCircle, Wifi, Cpu, HardDrive, Zap } from 'lucide-react';

export default function GatewaysPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/gateways');
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error("Failed to fetch gateway data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
    // 5초마다 자동 갱신 (관제 화면이므로)
    const interval = setInterval(fetchGateways, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) return <div className="p-8">Loading Gateway Status...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. 상단: 전체 장치 상태 모니터링 (Aggregate View) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 총 설치 수 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Total Gateways</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{data?.summary.total}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Router size={24}/>
            </div>
        </div>

        {/* 온라인 상태 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Online Devices</p>
                <h3 className="text-3xl font-bold text-green-600 mt-1">{data?.summary.online}</h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <Wifi size={24}/>
            </div>
        </div>

        {/* 장애/오프라인 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Offline / Errors</p>
                <h3 className="text-3xl font-bold text-red-500 mt-1">{data?.summary.offline}</h3>
            </div>
            <div className="p-3 bg-red-100 text-red-500 rounded-xl">
                <AlertTriangle size={24}/>
            </div>
        </div>

        {/* 평균 CPU 부하율 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Avg. System Load</p>
                <h3 className="text-3xl font-bold text-indigo-600 mt-1">{data?.summary.avg_cpu}%</h3>
            </div>
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <Activity size={24}/>
            </div>
        </div>
      </div>

      {/* 2. 하단: 개별 장치 상태 모니터링 (Detailed Table) */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Router size={20} className="text-gray-500"/> Installed Gateways List
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Auto-refresh: 5s</span>
        </div>
        
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-4">Device Info</th>
                    <th className="px-6 py-4">Status / Uptime</th>
                    <th className="px-6 py-4">Resource Usage (CPU / Mem / Flash)</th>
                    <th className="px-6 py-4">Versions (FW / App)</th>
                    <th className="px-6 py-4 text-center">Sensors</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data?.devices.map((gw: any) => (
                    <tr key={gw.id} className="hover:bg-gray-50 transition-colors">
                        {/* 디바이스 정보 */}
                        <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{gw.location}</div>
                            <div className="text-xs text-gray-500 font-mono">{gw.id}</div>
                        </td>

                        {/* 상태 및 가동 시간 */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 mb-1">
                                {gw.status === "Online" ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                        <CheckCircle size={10}/> Online
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                        <AlertTriangle size={10}/> Offline
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">Up: {gw.uptime}</div>
                        </td>

                        {/* 리소스 사용량 (Progress Bars) */}
                        <td className="px-6 py-4 min-w-[200px]">
                           {gw.status === "Online" ? (
                             <div className="space-y-2">
                                {/* CPU */}
                                <div className="flex items-center gap-2 text-xs">
                                    <Cpu size={12} className="text-gray-400"/>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div className={`h-1.5 rounded-full ${gw.cpu > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${gw.cpu}%`}}></div>
                                    </div>
                                    <span className="w-8 text-right">{gw.cpu}%</span>
                                </div>
                                {/* Memory */}
                                <div className="flex items-center gap-2 text-xs">
                                    <Zap size={12} className="text-gray-400"/>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div className={`h-1.5 rounded-full ${gw.memory > 80 ? 'bg-orange-500' : 'bg-purple-500'}`} style={{width: `${gw.memory}%`}}></div>
                                    </div>
                                    <span className="w-8 text-right">{gw.memory}%</span>
                                </div>
                                {/* Flash */}
                                <div className="flex items-center gap-2 text-xs">
                                    <HardDrive size={12} className="text-gray-400"/>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div className={`h-1.5 rounded-full ${gw.flash > 90 ? 'bg-red-600' : 'bg-green-500'}`} style={{width: `${gw.flash}%`}}></div>
                                    </div>
                                    <span className="w-8 text-right">{gw.flash}%</span>
                                </div>
                             </div>
                           ) : (
                               <span className="text-gray-400 text-xs">- No Data -</span>
                           )}
                        </td>

                        {/* 버전 정보 */}
                        <td className="px-6 py-4">
                            <div className="text-xs text-gray-600"><span className="font-semibold">FW:</span> {gw.fw_ver}</div>
                            <div className="text-xs text-gray-600"><span className="font-semibold">App:</span> {gw.app_ver}</div>
                        </td>

                        {/* 연결된 센서 수 */}
                        <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-gray-700 text-xs">
                                {gw.sensors}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}