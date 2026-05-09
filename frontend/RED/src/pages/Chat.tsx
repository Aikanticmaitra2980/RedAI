import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  ts: number;
}

interface Props {
  user: string;
  onLogout: () => void;
}

const API = 'http://localhost:5000/api/generate';

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function Chat({ user, onLogout }: Props) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: `Hello ${user}! I'm RED, your local AI assistant powered by DistilGPT-2. Send me a prompt and I'll generate a response.`,
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [input]);

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    // Add user message
    const userMsg: Message = { id: uid(), role: 'user', text: prompt, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Add placeholder bot message
    const botId = uid();
    setMessages(prev => [...prev, { id: botId, role: 'bot', text: '…', ts: Date.now() }]);

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      const responseText = res.ok
        ? (data.output ?? 'No output returned.')
        : `Error: ${data.details ?? data.error ?? 'Unknown error'}`;

      setMessages(prev =>
        prev.map(m => (m.id === botId ? { ...m, text: responseText } : m))
      );
    } catch (e) {
      const errText = e instanceof Error ? e.message : String(e);
      setMessages(prev =>
        prev.map(m =>
          m.id === botId
            ? { ...m, text: `Network error: ${errText}\n\nMake sure the Express server is running on port 5000.` }
            : m
        )
      );
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: uid(),
      role: 'bot',
      text: `Chat cleared. Send a new prompt to get started, ${user}!`,
      ts: Date.now(),
    }]);
  };

  return (
    <div className="chat-root">
      {/* Sidebar */}
      <aside className="dash-sidebar" aria-label="Sidebar navigation">
        <div className="dash-logo">
          <span className="dash-logo-icon">R</span>
          <span className="dash-logo-label">RED AI</span>
        </div>
        <nav className="dash-nav">
          <button id="nav-dashboard" className="dash-nav-item" onClick={() => navigate('/dashboard')}>
            <span className="dash-nav-icon">📊</span> Dashboard
          </button>
          <button id="nav-chat" className="dash-nav-item dash-nav-active" aria-current="page">
            <span className="dash-nav-icon">💬</span> Chat
          </button>
        </nav>
        <div className="dash-sidebar-footer">
          <div className="dash-user">
            <div className="dash-avatar">{user.charAt(0).toUpperCase()}</div>
            <div className="dash-user-info">
              <span className="dash-user-name">{user}</span>
              <span className="dash-user-role">Developer</span>
            </div>
          </div>
          <button id="btn-logout" className="dash-logout-btn" onClick={onLogout} title="Sign out">⏻</button>
        </div>
      </aside>

      {/* Chat panel */}
      <div className="chat-panel">
        {/* Chat header */}
        <header className="chat-header">
          <div className="chat-header-info">
            <div className="chat-model-dot" aria-hidden="true" />
            <div>
              <span className="chat-model-name">Mistral 7B</span>
              <span className="chat-model-status">Local inference</span>
            </div>
          </div>
          <button id="btn-clear-chat" className="chat-clear-btn" onClick={clearChat} title="Clear conversation">
            🗑 Clear
          </button>
        </header>

        {/* Messages */}
        <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-msg chat-msg-${msg.role}`}>
              <div className="chat-msg-avatar">
                {msg.role === 'bot' ? 'R' : user.charAt(0).toUpperCase()}
              </div>
              <div className="chat-msg-body">
                <div className="chat-msg-name">
                  {msg.role === 'bot' ? 'RED AI' : user}
                </div>
                <div className={`chat-bubble ${msg.text === '…' ? 'chat-bubble-typing' : ''}`}>
                  {msg.text === '…'
                    ? <span className="typing-dots"><span/><span/><span/></span>
                    : <pre className="chat-pre">{msg.text}</pre>}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <textarea
              id="chat-input"
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Ask RED AI… (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              rows={1}
              aria-label="Message input"
            />
            <button
              id="btn-send"
              className="chat-send-btn"
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              {loading
                ? <span className="login-spinner" />
                : <span className="send-icon">↑</span>}
            </button>
          </div>
          <p className="chat-hint">RED is a local model — responses may be short or quirky.</p>
        </div>
      </div>
    </div>
  );
}
