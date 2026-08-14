import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Settings, Globe } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting based on language
  useEffect(() => {
    if (language && messages.length === 0) {
      const greeting = language === 'en' 
        ? "Hi there! I'm Manju's Atelier AI Assistant. How can I help you track your order today?"
        : "नमस्ते! मैं मंजू एटलियर का एआई सहायक हूँ। आज मैं आपका ऑर्डर ट्रैक करने में कैसे मदद कर सकता हूँ?";
      setMessages([{ role: 'model', text: greeting }]);
    }
  }, [language, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || !language) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMsg.text,
          history: messages,
          language: language,
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
      setMessages((prev) => [...prev, { role: 'model', text: language === 'en' ? 'Sorry, I am having trouble connecting right now.' : 'क्षमा करें, मुझे अभी कनेक्ट करने में परेशानी हो रही है।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50 flex items-center justify-center"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden" style={{ height: '500px', maxHeight: '80vh' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex justify-between items-center shadow-md z-10">
        <div>
          <h3 className="font-semibold text-lg">{language === 'en' ? 'AI Support' : 'एआई सहायता'}</h3>
          <p className="text-xs text-purple-100">{language === 'en' ? 'Order Tracking & Help' : 'ऑर्डर ट्रैकिंग और मदद'}</p>
        </div>
        <div className="flex items-center gap-2">
          {language && (
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Settings size={20} />
            </button>
          )}
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute top-16 right-0 w-full bg-gray-50 border-b border-gray-200 p-4 z-20 shadow-inner flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2"><Globe size={16}/> Language</span>
            <div className="flex gap-2">
                <button 
                    onClick={() => { setLanguage('en'); setShowSettings(false); }}
                    className={`px-3 py-1 rounded text-sm ${language === 'en' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >English</button>
                <button 
                    onClick={() => { setLanguage('hi'); setShowSettings(false); }}
                    className={`px-3 py-1 rounded text-sm ${language === 'hi' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >हिंदी</button>
            </div>
        </div>
      )}

      {/* Language Selection Screen */}
      {!language ? (
        <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-50 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600">
            <Globe size={32} />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Choose your language</h4>
          <p className="text-sm text-gray-500 mb-6">अपनी भाषा चुनें</p>
          <div className="flex flex-col w-full gap-3">
            <button 
              onClick={() => setLanguage('en')}
              className="w-full py-3 bg-white border-2 border-purple-100 hover:border-purple-600 rounded-lg font-medium text-gray-700 transition-colors shadow-sm"
            >
              English
            </button>
            <button 
              onClick={() => setLanguage('hi')}
              className="w-full py-3 bg-white border-2 border-purple-100 hover:border-purple-600 rounded-lg font-medium text-gray-700 transition-colors shadow-sm"
            >
              हिंदी (Hindi)
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white self-end rounded-tr-sm shadow-sm' 
                    : 'bg-white text-gray-800 self-start rounded-tl-sm shadow-sm border border-gray-100'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="bg-white text-gray-800 self-start p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 flex items-center gap-2">
                 <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === 'en' ? "Type a message..." : "एक संदेश लिखें..."}
              className="flex-1 bg-gray-100 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600/50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
