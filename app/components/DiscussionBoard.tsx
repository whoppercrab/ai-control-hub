"use client";

import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';

interface DiscussionBoardProps {
  targetType: 'model' | 'dataset';
  targetId: string;
}

export default function DiscussionBoard({ targetType, targetId }: DiscussionBoardProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  // 현재 로그인한 사용자 이름 가져오기
  const currentUser = typeof window !== "undefined" ? localStorage.getItem("username") || "Anonymous" : "Anonymous";

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:8000/comments/${targetType}/${targetId}`);
      const data = await res.json();
      setComments(data);
    } catch (e) {
      console.error("댓글을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [targetType, targetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await fetch('http://localhost:8000/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          username: currentUser,
          content: newComment
        })
      });
      setNewComment("");
      fetchComments(); // 등록 후 목록 새로고침
    } catch (e) {
      alert("등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mt-6 overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <MessageSquare size={20} className="text-blue-600"/>
        <h3 className="text-lg font-bold text-gray-900">Community Discussion</h3>
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{comments.length}</span>
      </div>

      <div className="p-6 space-y-6">
        {/* 댓글 목록 */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {comments.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">아직 등록된 의견이 없습니다. 첫 번째 의견을 남겨보세요!</div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                  {c.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 text-sm">{c.username}</span>
                    <span className="text-xs text-gray-400">{c.created_at}</span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 댓글 입력창 */}
        <form onSubmit={handleSubmit} className="relative mt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`${targetId}에 대한 의견이나 질문을 남겨주세요...`}
            className="w-full border border-gray-300 rounded-xl p-4 pr-14 outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24 text-sm"
          />
          <button 
            type="submit" 
            disabled={loading || !newComment.trim()}
            className="absolute right-3 bottom-4 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            <Send size={18}/>
          </button>
        </form>
      </div>
    </div>
  );
}