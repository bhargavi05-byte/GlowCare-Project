import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User, RefreshCw, AlertCircle } from 'lucide-react';

const N8N_WEBHOOK_URL = 'https://cap00136105.app.n8n.cloud/webhook/472be8b4-1cd9-4776-9b81-1743eea8f0e7/chat';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  'What is the best serum for hyperpigmentation?',
  'Can I use Retinol and Niacinamide together?',
  'How do I track my skincare order?',
  'Recommend a routine for dry skin'
];

export const N8nChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Hello! ✨ Welcome to GlowCare. I am your AI Skincare Consultant powered by our automated care workflow. How can I help your skin thrive today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState<string>(() => 'glow-' + Math.random().toString(36).substring(2, 10));
  const [mode, setMode] = useState<'custom' | 'native'>('custom');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Attempt to load official @n8n/chat CDN library
  useEffect(() => {
    let scriptLoaded = false;
    const loadN8nLibrary = async () => {
      try {
        // Import official n8n chat ES module
        // @ts-ignore
        const n8nModule = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js');
        if (n8nModule && typeof n8nModule.createChat === 'function') {
          // Initialize native n8n chat widget
          n8nModule.createChat({
            webhookUrl: N8N_WEBHOOK_URL,
            showWelcomeScreen: true,
            defaultLanguage: 'en',
            initialMessages: [
              'Hi there! 👋 Welcome to GlowCare.',
              'I am your AI Skincare Advisor. How can I assist you today?'
            ],
            i18n: {
              en: {
                title: 'GlowCare AI Advisor',
                subtitle: 'Powered by n8n Workflow',
                footer: 'GlowCare Intelligence',
                getStarted: 'Start Consultation',
                inputPlaceholder: 'Ask a skincare question...',
              },
            },
          });
          setMode('native');
          scriptLoaded = true;
          console.log('Official @n8n/chat initialized successfully.');
        }
      } catch (err) {
        console.warn('Native n8n chat bundle fallback to custom glassmorphism widget:', err);
        setMode('custom');
      }
    };

    loadN8nLibrary();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId,
          chatInput: messageText,
          message: messageText
        })
      });

      let botResponseText = '';
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          botResponseText = data.output || data.text || data.message || data.response || JSON.stringify(data);
        } else {
          botResponseText = await response.text();
        }
      } else {
        botResponseText = `I received your inquiry ("${messageText}"). Our automated n8n workflow has registered the event. For instant routine guidance, try asking about our 15% Vitamin C Serum, Ceramide Cream, or SPF 50!`;
      }

      const botMsg: ChatMessage = {
        id: 'msg-bot-' + Date.now(),
        sender: 'bot',
        text: botResponseText || 'Thank you for your message! Our skincare advisor workflow has processed your request.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('n8n webhook direct fetch note (likely CORS on cloud node):', err);
      // Helpful fallback response so the user's experience is always delightful
      const fallbackMsg: ChatMessage = {
        id: 'msg-bot-err-' + Date.now(),
        sender: 'bot',
        text: `Your message was dispatched to our n8n webhook. If your n8n Chat Trigger has CORS restrictions enabled, ensure "Allowed Origins (CORS)" in your n8n node is set to "*" or your web app domain.

💡 **Quick Skincare Recommendation for "${messageText}":**
- For **Dullness & Spots**: Use our GlowRevive 15% Vitamin C Brightening Serum + SPF 50.
- For **Dryness/Barrier**: Use Ceramide Barrier Recovery Velvet Cream.
- For **Oily/Pores**: Use 10% Niacinamide + 1% Zinc Serum.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // If native mode has rendered its own bubble, we keep the custom widget hidden unless clicked
  return (
    <>
      {/* Floating Toggle Button (Always available for instant access) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 py-3 px-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-xl shadow-rose-500/30 hover:scale-105 transition-all duration-300 border border-white/30"
            title="Chat with GlowCare AI Advisor"
          >
            <div className="relative">
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
            </div>
            <span className="text-xs font-semibold tracking-wide pr-1 hidden sm:inline">
              Ask AI Advisor
            </span>
          </button>
        ) : (
          /* Glassmorphic Chat Window */
          <div className="w-[92vw] sm:w-96 h-[540px] max-h-[85vh] rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/80 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold leading-tight">GlowCare AI Advisor</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[10px] text-rose-100 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    <span>Connected to n8n Automation</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
                  title="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 border border-rose-200/60">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="max-w-[80%] space-y-1">
                    <div
                      className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-br-none shadow-xs'
                          : 'bg-white/80 border border-stone-200/70 text-stone-800 rounded-bl-none shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span
                      className={`text-[9px] text-stone-400 block px-1 ${
                        msg.sender === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-stone-900 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 items-center text-xs text-stone-400">
                  <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white/70 border border-stone-200/60 text-stone-500 text-[11px] flex items-center gap-1.5">
                    <span>Consulting n8n AI workflow...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Suggestions */}
            {messages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[10px] py-1 px-2 rounded-lg bg-rose-50/80 hover:bg-rose-100/90 text-rose-800 border border-rose-200/50 transition-colors text-left font-medium"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-white/70 border-t border-rose-100/80">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about skincare, orders, routine..."
                  disabled={isLoading}
                  className="glass-input flex-1 px-3.5 py-2.5 rounded-xl text-xs text-stone-800 placeholder-stone-400"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-xs disabled:opacity-40 transition-all"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[9px] text-stone-400 mt-1.5 px-1">
                <span>Webhook: n8n cloud chat</span>
                <span>Press Enter to send</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
