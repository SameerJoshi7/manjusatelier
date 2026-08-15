import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { Order } from '@/types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

type QuickReply = { 
  text: string; 
  type: 'chat' | 'link' | 'action'; 
  href?: string;
  action?: 'show_orders' | 'load_more' | 'cancel_orders';
};

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  
  // Order selection state
  const [showOrderSelection, setShowOrderSelection] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  
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

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
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

  const handleQuickReply = (q: QuickReply) => {
    if (q.type === 'link' && q.href) {
      setIsOpen(false);
      navigate(q.href);
    } else if (q.type === 'action') {
      if (q.action === 'show_orders') {
        setShowOrderSelection(true);
        setOrdersPage(1);
      } else if (q.action === 'load_more') {
        setOrdersPage(p => p + 1);
      } else if (q.action === 'cancel_orders') {
        setShowOrderSelection(false);
        setOrdersPage(1);
      }
    } else {
      // type === 'chat'
      setShowOrderSelection(false);
      setOrdersPage(1);
      handleSend(q.text);
    }
  };

  const suggestedQuestions: QuickReply[] = showOrderSelection ? [
    ...userOrders.slice(0, ordersPage * 3).map(o => {
      const id = o.customOrderId || o._id.slice(-8).toUpperCase();
      return { text: `Track order #${id}`, type: 'chat' as const };
    }),
    ...(userOrders.length > ordersPage * 3 ? [{ text: "Load more orders...", type: 'action' as const, action: 'load_more' as const }] : []),
    { text: "Cancel", type: 'action' as const, action: 'cancel_orders' as const }
  ] : [
    { text: "Where is my order?", type: userOrders.length > 0 ? 'action' as const : 'chat' as const, action: 'show_orders' as const },
    { text: "What is your return policy?", type: 'chat' as const },
    { text: "Do you ship internationally?", type: 'chat' as const },
    { text: "What payment methods are accepted?", type: 'chat' as const },
    { text: "How do I exchange an item?", type: 'chat' as const },
    { text: "How can I contact support?", type: 'link' as const, href: '/contact' }
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
            className={`max-w-[80%] p-3 rounded-2xl text-sm shrink-0 ${
              msg.role === 'user' 
                ? 'bg-brown text-white self-end rounded-tr-sm shadow-sm' 
                : 'bg-white dark:bg-[#26201a] text-brown-dark dark:text-beige self-start rounded-tl-sm shadow-sm border border-beige dark:border-brown'
            }`}
          >
            {msg.text}
          </div>
        ))}

        {/* Quick Replies */}
        {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'model' && (
          <div className="flex gap-2 mt-2 w-full overflow-x-auto pb-4 scrollbar-hide shrink-0">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickReply(q)}
                disabled={isLoading}
                className={`text-xs whitespace-nowrap flex-shrink-0 border px-3 py-1.5 rounded-2xl transition-colors shadow-sm disabled:opacity-50 ${
                  q.action === 'cancel_orders' 
                    ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-[#332a22] dark:text-gray-300 dark:border-[#332a22] dark:hover:bg-[#44382d]' 
                    : q.action === 'load_more' || q.action === 'show_orders'
                    ? 'bg-brown-light/10 text-brown border-brown hover:bg-brown hover:text-white dark:bg-brown/20 dark:text-beige dark:border-brown-light dark:hover:bg-brown-light dark:hover:text-white'
                    : 'bg-white text-brown border-brown hover:bg-brown hover:text-white dark:bg-[#26201a] dark:text-beige dark:border-brown dark:hover:bg-brown dark:hover:text-white'
                }`}
              >
                {q.text}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="bg-white dark:bg-[#26201a] text-brown-dark dark:text-beige self-start p-3 rounded-2xl rounded-tl-sm shadow-sm border border-beige dark:border-brown flex items-center gap-2 shrink-0">
             <div className="w-2 h-2 bg-brown-light rounded-full animate-bounce"></div>
             <div className="w-2 h-2 bg-brown rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
             <div className="w-2 h-2 bg-brown-dark rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-px shrink-0" />
      </div>

      {/* Input Area Removed - Users must use quick replies */}
    </div>
  );
};
