import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaCommentDots } from 'react-icons/fa';
import { aiService } from '../services/api';
import Chip from './ui/Chip';

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I am the JNTU-GV SmartCampus Assistant. How can I help you with campus issues today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "How do I report an issue?",
    "What information should I provide?",
    "How can I check my issue status?",
    "Which department handles Wi-Fi?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.chat(newMessages);
      setMessages([...newMessages, { role: 'model', content: res.response }]);
    } catch (err) {
      let errorMsg = 'AI service is temporarily unavailable. Please try again.';

      if (!err.response) {
        errorMsg = 'Unable to connect to the AI service.';
      } else if (err.response.status === 503) {
        errorMsg = err.response.data?.message || 'AI assistant is not configured.';
      } else if (err.response.status === 429) {
        errorMsg = 'AI service is temporarily busy. Please try again later.';
      } else if (err.response.status === 401 || err.response.status === 403) {
        errorMsg = 'Please sign in again.';
      } else if (err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }

      setMessages([
        ...newMessages,
        { role: 'model', content: errorMsg }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend(input);
    }
  };

  const handleClear = () => {
    setMessages([
      { role: 'model', content: "Hello! I am the JNTU-GV SmartCampus Assistant. How can I help you with campus issues today?" }
    ]);
  };

  return (
    <>
      {/* Floating Action Button (M3 standard FAB) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] h-14 w-14 rounded-2xl shadow-m3-2 hover:shadow-m3-3 transition-all z-50 flex items-center justify-center focus-visible:outline-none"
          aria-label="Open AI Assistant"
        >
          <FaCommentDots className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window (M3 16px radius card) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-[var(--md-sys-color-surface)] rounded-card shadow-m3-3 border border-[var(--md-sys-color-outline-variant)] z-50 flex flex-col overflow-hidden transition-all h-[520px] max-h-[85vh]">
          {/* Header */}
          <div className="bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] px-4 py-3 flex justify-between items-center border-b border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
                <FaRobot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium leading-5">Campus AI Assistant</h3>
                <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block">Powered by Gemini</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <button
                type="button"
                onClick={handleClear}
                className="text-[var(--md-sys-color-primary)] hover:underline px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] p-1.5 rounded-full hover:bg-neutral-200/50"
                aria-label="Close Assistant"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto bg-[var(--md-sys-color-surface-container)] space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-5 ${msg.role === 'user'
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-tr-xs'
                      : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-tl-xs shadow-xs'
                    }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl rounded-tl-xs px-4 py-2 text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center space-x-2">
                  <FaSpinner className="animate-spin h-3.5 w-3.5 text-[var(--md-sys-color-primary)]" />
                  <span>Assistant is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested chips */}
          {messages.length <= 2 && (
            <div className="p-2.5 bg-[var(--md-sys-color-surface)] border-t border-[var(--md-sys-color-outline-variant)] flex gap-1.5 overflow-x-auto text-xs">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 rounded-chip bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-[11px] whitespace-nowrap transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input field */}
          <div className="p-3 bg-[var(--md-sys-color-surface)] border-t border-[var(--md-sys-color-outline-variant)] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a campus issue question..."
              className="flex-1 h-10 px-3 text-sm rounded-input border border-[var(--md-sys-color-outline-variant)] bg-transparent focus:border-[var(--md-sys-color-primary)] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="h-10 w-10 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center disabled:opacity-38 transition-all hover:shadow-m3-1 shrink-0"
              aria-label="Send Message"
            >
              <FaPaperPlane className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
