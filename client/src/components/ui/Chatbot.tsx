import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { Order } from '@/types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch user orders if logged in
  useEffect(() => {
    if (user) {
      api.get<{ orders: Order[] }>('/orders/mine')
        .then(({ orders }) => setUserOrders(orders))
        .catch(() => void 0);
    } else {
      setUserOrders([]);
    }
  }, [user]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'model', text: "Hi there! I'm ManjuBot. How can I help you track your order today?" }]);
    }
  }, [messages.length]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) setInput('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
        }),
      });

      const data = await response.json();
      
      if (data.text) {
        setMessages((prev) => [...prev, { role: 'model', text: data.text }]);
      } else if (data.error) {
         setMessages((prev) => [...prev, { role: 'model', text: `Error: ${data.error}` }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  type QuickReply = { text: string; type: 'chat' | 'link'; href?: string };

  const baseQuestions: QuickReply[] = [
    { text: "Where is my order?", type: 'chat' },
    { text: "What is your return policy?", type: 'link', href: '/terms' },
    { text: "Do you ship internationally?", type: 'chat' },
    { text: "What payment methods are accepted?", type: 'chat' },
    { text: "How do I exchange an item?", type: 'link', href: '/terms' },
    { text: "How can I contact support?", type: 'link', href: '/contact' }
  ];

  const suggestedQuestions: QuickReply[] = [
    ...userOrders.map(o => {
      const id = o.customOrderId || o._id.slice(-8).toUpperCase();
      return { text: `Track order #${id}`, type: 'chat' as const };
    }),
    ...baseQuestions
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-brown text-white rounded-full shadow-lg hover:bg-brown-dark transition-colors z-50 flex items-center justify-center"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white dark:bg-[#26201a] rounded-2xl shadow-2xl border border-gray-100 dark:border-brown-dark flex flex-col z-50 overflow-hidden" style={{ height: '500px', maxHeight: '80vh' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-brown-dark to-brown p-4 text-white flex justify-between items-center shadow-md z-10">
        <div>
          <h3 className="font-semibold text-lg">ManjuBot</h3>
          <p className="text-xs text-beige">Order Tracking & Help</p>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-cream dark:bg-[#1c1712] flex flex-col gap-3">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-brown text-white self-end rounded-tr-sm shadow-sm' 
                : 'bg-white dark:bg-[#26201a] text-brown-dark dark:text-beige self-start rounded-tl-sm shadow-sm border border-beige dark:border-brown'
            }`}
          >
            {msg.text}
          </div>
        ))}

        {/* Quick Replies (show when not loading and last message is from model) */}
        {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'model' && (
          <div className="flex gap-2 mt-2 w-full overflow-x-auto pb-2 scrollbar-hide">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  if (q.type === 'link' && q.href) {
                    setIsOpen(false);
                    navigate(q.href);
                  } else {
                    handleSend(q.text);
                  }
                }}
                disabled={isLoading}
                className="text-xs whitespace-nowrap flex-shrink-0 bg-white dark:bg-[#26201a] border border-brown dark:border-brown text-brown dark:text-beige px-3 py-1.5 rounded-2xl hover:bg-brown dark:hover:bg-brown hover:text-white dark:hover:text-white transition-colors shadow-sm disabled:opacity-50"
              >
                {q.text}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="bg-white dark:bg-[#26201a] text-brown-dark dark:text-beige self-start p-3 rounded-2xl rounded-tl-sm shadow-sm border border-beige dark:border-brown flex items-center gap-2">
             <div className="w-2 h-2 bg-brown-light rounded-full animate-bounce"></div>
             <div className="w-2 h-2 bg-brown rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
             <div className="w-2 h-2 bg-brown-dark rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-[#26201a] border-t border-beige dark:border-brown-dark flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 bg-cream dark:bg-[#1c1712] text-brown-dark dark:text-beige text-base placeholder-brown/50 dark:placeholder-beige/50 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brown/50"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-brown text-white rounded-full hover:bg-brown-dark disabled:opacity-50 disabled:hover:bg-brown transition-colors flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
