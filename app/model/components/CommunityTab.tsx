"use client";

import React, { useState } from 'react';
import { MessageSquare, Plus, User, ArrowLeft } from 'lucide-react';

// 초기 데이터
const initialPosts = [
  { id: 1, title: "모델 성능 질문드립니다", author: "user123", date: "1 hour ago", content: "정확도가 궁금합니다.", replies: [{ author: "kykim", content: "89% 입니다.", date: "30 mins ago" }] },
  { id: 2, title: "파인튜닝 데이터셋 공유", author: "dev_kim", date: "3 hours ago", content: "데이터셋 공유합니다.", replies: [] },
];

export default function CommunityTab() {
  const [posts, setPosts] = useState(initialPosts);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const handleSubmit = () => {
    if (!newPostTitle || !newPostContent) return alert("내용을 입력해주세요.");
    const newPost = {
      id: posts.length + 1,
      title: newPostTitle,
      author: "Guest",
      date: "Just now",
      content: newPostContent,
      replies: []
    };
    setPosts([newPost, ...posts]);
    setNewPostTitle("");
    setNewPostContent("");
    setView('list');
  };

  return (
    <div className="min-h-[400px]">
      {/* 1. 목록 보기 */}
      {view === 'list' && (
        <>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2"><MessageSquare size={20} className="text-gray-500"/> Discussions</h3>
            <button onClick={() => setView('create')} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium flex items-center gap-2"><Plus size={16}/> New Discussion</button>
          </div>
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} onClick={() => { setSelectedPost(post); setView('detail'); }} className="block p-5 border border-gray-200 rounded-xl hover:border-blue-400 cursor-pointer bg-white transition-all hover:shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-gray-900 text-lg">{post.title}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{post.date}</span>
                </div>
                <div className="text-sm text-gray-500 flex gap-4"><span className="flex items-center gap-1"><User size={14}/> {post.author}</span><span className="flex items-center gap-1"><MessageSquare size={14}/> {post.replies.length} replies</span></div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 2. 글쓰기 */}
      {view === 'create' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6">Create New Discussion</h3>
          <div className="space-y-4">
            <input type="text" className="w-full border p-2.5 rounded-lg" placeholder="Title" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} />
            <textarea className="w-full border p-3 h-40 rounded-lg resize-none" placeholder="Content" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Submit</button>
              <button onClick={() => setView('list')} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. 상세 보기 */}
      {view === 'detail' && selectedPost && (
        <div>
          <button onClick={() => setView('list')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4"><ArrowLeft size={16}/> Back</button>
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-2">{selectedPost.title}</h2>
            <p className="text-gray-800 whitespace-pre-wrap">{selectedPost.content}</p>
          </div>
          <div className="pl-4 border-l-2 border-gray-100 space-y-4">
            {selectedPost.replies.map((reply: any, idx: number) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg"><span className="font-bold text-sm">{reply.author}</span>: {reply.content}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}