import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, User, Bot, AlertCircle } from 'lucide-react';
import { chatUI } from '../services/api.js';

export default function ResultPage({ imageUrl, imageFile, analysisResult, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize with the analysis summary
  useEffect(() => {
    if (analysisResult) {
      let initialMsg = `**UI Analysis Complete**\n\n${analysisResult.summary}\n\n**Key Elements Detected:**\n`;
      if (analysisResult.elements && analysisResult.elements.length > 0) {
        analysisResult.elements.forEach(el => {
          initialMsg += `- **${el.type.toUpperCase()}**: ${el.suggestion} (${el.reason})\n`;
        });
      }
      
      setMessages([
        { role: 'assistant', content: initialMsg }
      ]);
    }
  }, [analysisResult]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput('');
    
    const newMessages = [...messages, { role: 'user', content: userQuery }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await chatUI(imageFile, newMessages, userQuery);
      setMessages([...newMessages, { role: 'assistant', content: response.answer }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: `❌ Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple markdown renderer for bold text and lists
  const renderMarkdown = (text) => {
    return text.split('\n').map((line, i) => {
      let htmlLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: htmlLine.substring(2) }} />;
      }
      return <p key={i} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: htmlLine }} />;
    });
  };

  return (
    <div className="h-screen flex flex-col bg-[#09090b] text-white overflow-hidden">
      {/* Topbar */}
      <header className="h-16 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center text-zinc-400 hover:text-white gap-x-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to upload
        </button>

        <div className="flex items-center gap-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-semibold text-sm">Gemini UI Assistant</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left: Image Preview */}
        <div className="flex-1 p-6 flex items-center justify-center bg-zinc-900/30 overflow-auto">
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl max-h-full">
            <img 
              src={imageUrl} 
              alt="Analyzed UI" 
              className="max-w-full max-h-[calc(100vh-120px)] object-contain"
            />
          </div>
        </div>

        {/* Right: Chat Interface */}
        <div className="w-full lg:w-[450px] xl:w-[500px] border-l border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl flex flex-col shrink-0">
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-x-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-zinc-800' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-zinc-800 text-white rounded-tr-sm' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm'
                }`}>
                  {renderMarkdown(msg.content)}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-x-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm p-4 flex items-center gap-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-800/50">
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask how to navigate this UI..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-400 disabled:opacity-50 disabled:hover:bg-blue-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-[10px] text-zinc-500 mt-3 flex items-center justify-center gap-x-1">
              <AlertCircle className="w-3 h-3" />
              AI can make mistakes. Verify critical actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}