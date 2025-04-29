"use client"

import { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';

export default function ChatInterface() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState('auto'); // auto, documents_only, general_knowledge
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue('');

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Show loading indicator
    setLoading(true);
    setError(null);

    try {
      // Get conversation context from previous messages
      const context = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Send message to API
      const response = await api.chat(userMessage, conversationId, context, mode);

      // Update conversation ID if this is the first message
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      // Add response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        sources: response.sources
      }]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Knowledge Source Selector */}
      <div className="mb-4 flex justify-center">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setMode('auto')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${mode === 'auto'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-900 hover:bg-gray-100 dark:bg-dark-3 dark:text-white dark:hover:bg-dark-4'
              }`}
          >
            Auto (Recommended)
          </button>
          <button
            type="button"
            onClick={() => setMode('documents_only')}
            className={`px-4 py-2 text-sm font-medium ${mode === 'documents_only'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-900 hover:bg-gray-100 dark:bg-dark-3 dark:text-white dark:hover:bg-dark-4'
              }`}
          >
            Documents Only
          </button>
          <button
            type="button"
            onClick={() => setMode('general_knowledge')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${mode === 'general_knowledge'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-900 hover:bg-gray-100 dark:bg-dark-3 dark:text-white dark:hover:bg-dark-4'
              }`}
          >
            General Knowledge Only
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3/4 rounded-lg p-4 ${message.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-dark-3 dark:text-white'
              }`}>
              <div className="whitespace-pre-wrap">{message.content}</div>

              {/* Sources citations if available */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-dark-4">
                  <p className="text-sm font-semibold">Sources:</p>
                  <ul className="text-sm">
                    {message.sources.map((source: any, idx: number) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span>{source.document}</span>
                        <span className="text-xs bg-gray-100 dark:bg-dark-2 px-2 py-1 rounded">
                          {Math.round(source.relevance * 100)}% match
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-dark-3 dark:text-white rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-dark-3">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything..."
            className="w-full rounded-full border border-gray-300 dark:border-dark-3 py-3 pl-4 pr-12 focus:border-primary focus:outline-none dark:bg-dark-2 dark:text-white"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-primary p-2 text-white transition hover:bg-primary/90 disabled:bg-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}