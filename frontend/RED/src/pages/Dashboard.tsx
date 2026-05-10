import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface Props {
  user: string;
  onLogout: () => void;
}

const stats = [
  { id: 'stat-model',    label: 'Model',          value: 'Mistral 7B',   icon: '🧠' },
  { id: 'stat-device',   label: 'Device',         value: 'CPU',          icon: '💻' },
  { id: 'stat-backend',  label: 'Backend',        value: 'Express 5',    icon: '⚡' },
  { id: 'stat-status',   label: 'API Status',     value: 'Ready',        icon: '✅' },
];

const quickActions = [
  { id: 'qa-chat',       label: 'Open Chat',      desc: 'Talk to RED AI model',        icon: '💬', route: '/chat' },
  { id: 'qa-docs',       label: 'HF Model',       desc: 'View on Hugging Face',        icon: '📦', route: 'https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3', external: true },
  { id: 'qa-api',        label: 'API Health',     desc: 'Check backend status',        icon: '🔍', route: 'http://localhost:5000/health', external: true },
];

export default function Dashboard({ user, onLogout }: Props) {
  const navigate = useNavigate();

  const handleAction = (action: typeof quickActions[0]) => {
    if (action.external) {
      window.open(action.route, '_blank', 'noopener');
    } else {
      navigate(action.route);
    }
  };

  return (
    <div className="dash-root">
      {/* Sidebar */}
      <aside className="dash-sidebar" aria-label="Sidebar navigation">
        <div className="dash-logo" aria-label="RED AI">
          <span className="dash-logo-icon">R</span>
          <span className="dash-logo-label">RED AI</span>
        </div>

        <nav className="dash-nav">
          <button id="nav-dashboard" className="dash-nav-item dash-nav-active" aria-current="page">
            <span className="dash-nav-icon">📊</span> Dashboard
          </button>
          <button id="nav-chat" className="dash-nav-item" onClick={() => navigate('/chat')}>
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
          <button id="btn-logout" className="dash-logout-btn" onClick={onLogout} title="Sign out">
            ⏻
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1 className="dash-heading">Dashboard</h1>
            <p className="dash-subheading">RED AI · Local inference pipeline</p>
          </div>
          <button id="btn-open-chat" className="dash-cta-btn" onClick={() => navigate('/chat')}>
            Open Chat →
          </button>
        </header>

        {/* Stats */}
        <section className="dash-stats" aria-label="System stats">
          {stats.map(s => (
            <div key={s.id} id={s.id} className="stat-card">
              <span className="stat-icon">{s.icon}</span>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Quick actions */}
        <section className="dash-section">
          <h2 className="dash-section-title">Quick Actions</h2>
          <div className="dash-actions">
            {quickActions.map(a => (
              <button key={a.id} id={a.id} className="action-card" onClick={() => handleAction(a)}>
                <span className="action-icon">{a.icon}</span>
                <div>
                  <div className="action-label">{a.label}</div>
                  <div className="action-desc">{a.desc}</div>
                </div>
                <span className="action-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="dash-section">
          <h2 className="dash-section-title">About RED</h2>
          <div className="about-card">
            <p>
              <strong>RED</strong> is a local AI inference system powered by{' '}
              <code>Mistral 7B Instruct</code> via the <code>mistral_inference</code> library
              (with Hugging Face Transformers as fallback), served through an{' '}
              <code>Express 5</code> API, and displayed in this React 19 + Vite frontend.
            </p>
            <p>
              Send prompts from the <strong>Chat</strong> page and RED will generate
              text responses using the Mistral 7B local model pipeline.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
