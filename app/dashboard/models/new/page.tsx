"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Save, ArrowLeft, AlignLeft, Tag, FileBadge, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function NewModelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [author, setAuthor] = useState("Admin");

  const [formData, setFormData] = useState({
    name: "",
    license: "apache-2.0",
    tags: "",
    readme: "# 모델 소개\n여기에 마크다운 문법으로 모델에 대한 설명을 작성하세요."
  });

  // 🟢 [NEW] 첨부 파일들을 담을 상태
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) setAuthor(storedName);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("모델 이름을 입력해주세요.");

    setLoading(true);
    try {
      // 1. 모델 텍스트 정보(DB) 먼저 저장
      const res = await fetch('http://127.0.0.1:8000/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, author })
      });
      const data = await res.json();

      if (data.status === "success") {
        
        // 2. 🟢 [NEW] 선택된 파일이 있다면 백엔드로 파일 전송!
        if (selectedFiles && selectedFiles.length > 0) {
            const fileData = new FormData();
            Array.from(selectedFiles).forEach(file => {
                fileData.append("files", file); // 백엔드의 매개변수 이름 "files"와 일치해야 함
            });

            await fetch(`http://127.0.0.1:8000/models/${formData.name}/upload`, {
                method: 'POST',
                body: fileData // 파일은 JSON이 아니라 FormData로 보냅니다!
            });
        }

        alert("모델 및 파일이 성공적으로 등록되었습니다!");
        router.push(`/model/${formData.name}`); // 완료 후 상세 페이지로 이동
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("서버 통신에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/models" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Box className="text-blue-600" /> Create New Model
          </h1>
          <p className="text-gray-500 text-sm mt-1">새로운 AI 모델과 가중치 파일을 레지스트리에 등록합니다.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Model Name *</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} required
                placeholder="예: yolo-v8-korean" 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1"><FileBadge size={16}/> License</label>
              <select 
                name="license" value={formData.license} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
              >
                <option value="apache-2.0">Apache 2.0</option>
                <option value="mit">MIT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1"><Tag size={16}/> Tags</label>
            <input 
              type="text" name="tags" value={formData.tags} onChange={handleChange}
              placeholder="예: PyTorch, Vision" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* 🟢 [NEW] 파일 업로드 입력란 추가 */}
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <UploadCloud size={18} className="text-blue-600"/> 모델 파일 업로드 (.pt, .bin, .json 등)
            </label>
            <input 
              type="file" 
              multiple 
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
            />
            {selectedFiles && <p className="mt-2 text-xs text-green-600 font-bold">{selectedFiles.length}개의 파일이 선택되었습니다.</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1"><AlignLeft size={16}/> Model Card (Markdown)</label>
            <textarea 
              name="readme" value={formData.readme} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-64 font-mono text-sm resize-y"
            />
          </div>

        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-3">
          <Link href="/dashboard/models">
            <button type="button" className="px-6 py-3 font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              취소
            </button>
          </Link>
          <button 
            type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 shadow-lg shadow-blue-500/30"
          >
            <Save size={18}/> {loading ? "업로드 중..." : "모델 등록하기"}
          </button>
        </div>
      </form>
    </div>
  );
}