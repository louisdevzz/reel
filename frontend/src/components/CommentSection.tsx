import React, { useState } from 'react';

interface Comment {
  id: string;
  userId: string;
  username?: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likeCount?: number;
  replyCount?: number;
  pending?: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  open: boolean;
  onClose: () => void;
  videoId: string;
  currentUser: any;
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  loading?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  open,
  onClose,
  currentUser,
  comments,
  onAddComment,
  loading
}) => {
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Calculate total comment count including replies
  const totalCommentCount = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0);
  }, 0);

  // Prevent keyboard events from bubbling up to parent component
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSubmitting(true);
    try {
      await onAddComment(input.trim());
      setInput('');
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`flex gap-3 items-start ${isReply ? 'ml-8' : ''}`}>
      <img
        src={comment.avatar || 'https://ui-avatars.com/api/?name=User'}
        alt={comment.username || 'User'}
        className="w-10 h-10 rounded-full object-cover border border-[#333]"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white text-sm">@{comment.username || comment.userId.slice(0, 6)}</span>
          <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
          
        </div>
        <div className="text-white text-[15px] mt-1 mb-2">{comment.content}</div>
        <div className="flex items-center gap-4 text-gray-400 text-xs">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg> 
            {comment.likeCount || 0}
          </span>
          <span className="flex items-center gap-1 cursor-pointer hover:underline">
            {comment.replyCount || 0} replies
          </span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-pink-500">Reply</span>
        </div>
        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
      <button className="text-gray-400 hover:text-white">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="2"/>
          <circle cx="12" cy="5" r="2"/>
          <circle cx="12" cy="19" r="2"/>
        </svg>
      </button>
    </div>
  );

  return (
    <div
      className={`fixed right-0 top-16 bg-[#18181b] flex flex-col z-50 border-l border-[#2f2f35] transition-all duration-300 
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}
      style={{ boxShadow: open ? '-4px 0 24px rgba(0,0,0,0.4)' : 'none' }}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between px-5 py-2 border-b border-[#222]">
          <div className="font-semibold text-white">
            Comments <span className="text-gray-300 font-normal">({totalCommentCount.toLocaleString('vi')})</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-6">
          {loading ? (
            <span className="text-gray-400 text-center mt-8">Loading comments...</span>
          ) : comments.length === 0 ? (
            <span className="text-gray-400 text-center mt-8">No comments yet</span>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t border-[#222] flex items-center gap-3 bg-[#18181b]">
          <img
            src={currentUser?.avatar || 'https://ui-avatars.com/api/?name=User'}
            alt={currentUser?.username || 'User'}
            className="w-9 h-9 rounded-full object-cover border border-[#333]"
          />
          <input
            className="flex-1 bg-[#222] text-white rounded-full px-4 py-2 outline-none border-none placeholder:text-gray-400"
            placeholder="Write a comment..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={submitting}
            maxLength={300}
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 rounded-full bg-pink-500 text-white font-semibold hover:bg-pink-600 transition disabled:opacity-60"
            disabled={submitting || !input.trim()}
          >Send</button>
        </form>
      </div>
    </div>
  );
};

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff/86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff/2592000)} months ago`;
  return `${Math.floor(diff/31536000)} years ago`;
} 