import React, { useState, useEffect, useRef } from 'react';
import { Smile, Send, MessageSquareText } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme, EmojiStyle } from 'emoji-picker-react';
import { chatService } from '../lib/streamService';
import { useUser } from '../contexts/userContext';

interface ChatMessage {
  id: string;
  streamKey: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: number;
  userId?: string;
}

interface ChatSectionProps {
  streamKey: string;
}

export function ChatSection({ streamKey }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { currentUser, isConnected: isWalletConnected } = useUser();

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Connect to chat WebSocket
  useEffect(() => {
    if (streamKey) {
      // Always connect to receive messages, regardless of wallet connection
      const userId = isWalletConnected && currentUser ? currentUser.id : undefined;
      const username = isWalletConnected && currentUser ? currentUser.username : undefined;
      const avatar = isWalletConnected && currentUser ? currentUser.avatar : undefined;

      chatService.connect(
        streamKey,
        userId,
        username,
        avatar
      );

      chatService.onMessage((data) => {
        if (data.type === 'chat_message') {
          setMessages(prev => [...prev, data.message]);
        } else if (data.type === 'recent_messages') {
          const messages = data.messages || [];
          setMessages(messages);
        } else if (data.type === 'tip_notification') {
          // Handle tip notification - create a special message object
          const tipMessage: ChatMessage = {
            id: `tip-${Date.now()}-${Math.random()}`,
            streamKey: streamKey,
            username: '🎉 Tip Notification',
            message: data.message,
            timestamp: Date.now(),
            userId: 'system'
          };
          setMessages(prev => {
            const newMessages = [...prev, tipMessage];
            return newMessages;
          });
        }
      });

      chatService.onConnect(() => {
        setIsChatConnected(true);
        setIsLoading(false);
      });

      chatService.onDisconnect(() => {
        setIsChatConnected(false);
        setIsLoading(false);
      });

      return () => {
        chatService.disconnect();
      };
    }
  }, [streamKey, isWalletConnected, currentUser]);

  const handleSendMessage = () => {
    if (newMessage.trim() && isChatConnected && isWalletConnected) {
      chatService.sendMessage(newMessage.trim());
      setNewMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#232327] border-l border-[#2f2f35]">
      {/* Chat Header */}
      <div className="bg-[#18181b] px-4 py-2 border-b border-[#2f2f35] flex items-center justify-between text-sm font-semibold text-white/80">
        <div className="flex items-center">
          <MessageSquareText className="w-4 h-4 mr-2" /> 
          Stream Chat
          {isChatConnected && (
            <span className="ml-2 w-2 h-2 bg-green-400 rounded-full"></span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {isWalletConnected && (
            <span className="text-[#9147ff]">Connected</span>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-400 text-sm py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9147ff] mx-auto mb-2"></div>
            <p>Connecting to chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            <MessageSquareText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-xs mt-1">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((message) => {
            // Check if this is a tip notification (from both real-time and recent messages)
            const isTipNotification = message.userId === 'system' && message.username === '🎉 Tip Notification';
            return (
              <div key={message.id} className={`flex items-start gap-3 ${isTipNotification ? 'animate-pulse' : ''}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {isTipNotification ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                      <span className="text-white text-sm">🎁</span>
                    </div>
                  ) : (
                    <img
                      src={message.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM5MTQ3ZmYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMTJhNS41IDUuNSAwIDEgMCAwLTExIDUuNSA1LjUgMCAwIDAgMCAxMXptMCAyYy0zLjMzIDAtMTAgMS42Ny0xMCA1djNoMjB2LTNjMC0zLjMzLTYuNjctNS0xMC01eiIvPgo8L3N2Zz4KPC9zdmc+'}
                      alt={message.username}
                      className="w-8 h-8 rounded-full border border-[#2f2f35]"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM5MTQ3ZmYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMTJhNS41IDUuNSAwIDEgMCAwLTExIDUuNSA1LjUgMCAwIDAgMCAxMXptMCAyYy0zLjMzIDAtMTAgMS42Ny0xMCA1djNoMjB2LTNjMC0zLjMzLTYuNjctNS0xMC01eiIvPgo8L3N2Zz4KPC9zdmc+';
                      }}
                    />
                  )}
                </div>
                
                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-sm ${isTipNotification ? 'text-yellow-400' : 'text-[#9147ff]'}`}>
                      {message.username}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div className={`text-sm break-words ${isTipNotification ? 'text-yellow-100 bg-yellow-900/20 px-3 py-2 rounded-lg border border-yellow-500/30' : 'text-white'}`}>
                    {message.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#2f2f35] relative">
        {!isWalletConnected ? (
          <div className="mb-3 p-3 bg-[#18181b] border border-[#2f2f35] rounded-lg">
            <div className="text-center text-gray-400 text-sm">
              <div className="flex items-center justify-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="font-semibold">Connect Wallet to Chat</span>
              </div>
              <p className="text-xs text-gray-500">You can view messages but need to connect your wallet to participate</p>
            </div>
          </div>
        ) : null}
        
        <div className="flex gap-2">
          {/* Emoji Picker Button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded bg-[#18181b] border border-[#2f2f35] hover:bg-[#2f2f35] transition-colors disabled:opacity-50"
            disabled={!isWalletConnected}
            title={!isWalletConnected ? "Connect wallet to use emoji picker" : "Add emoji"}
          >
            <Smile className="w-4 h-4 text-gray-400" />
          </button>

          {/* Message Input */}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isWalletConnected ? "Send a message..." : "Connect wallet to chat"}
            disabled={!isWalletConnected || !isChatConnected}
            className="flex-1 rounded bg-[#18181b] border border-[#2f2f35] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9147ff] disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isWalletConnected || !isChatConnected}
            className="bg-[#9147ff] hover:bg-[#772ce8] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded text-white font-bold transition-colors"
            title={!isWalletConnected ? "Connect wallet to send messages" : "Send message"}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && isWalletConnected && (
          <div ref={emojiPickerRef} className="absolute bottom-20 right-4 z-50">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme={Theme.DARK}
              emojiStyle={EmojiStyle.APPLE}
              width={350}
              height={400}
              searchPlaceholder="Search emoji..."
              previewConfig={{
                showPreview: false
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
} 