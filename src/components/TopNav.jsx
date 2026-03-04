import './TopNav.css';

export default function TopNav() {
  return (
    <header className="top-nav">
      <div className="top-nav-left">
        <div className="logo">
          <span className="logo-icon" aria-hidden>◆</span>
          <span className="logo-text">candescent</span>
          <span className="logo-badge">DEV</span>
        </div>
      </div>
      <div className="top-nav-center">
        <div className="search-bar">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search for apps, users, documentation (API, SDK) etc."
            className="search-input"
            aria-label="Search"
          />
        </div>
      </div>
      <div className="top-nav-right">
        <div className="env-toggle" role="group" aria-label="Environment">
          <button type="button" className="env-btn">Sandbox</button>
          <button type="button" className="env-btn env-btn-active">Production</button>
        </div>
        <button type="button" className="icon-btn" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
        </button>
        <button type="button" className="icon-btn" aria-label="Dark mode">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
        </button>
        <div className="user-menu">
          <button type="button" className="user-avatar" aria-label="User menu" aria-haspopup="true">
            <span>DM</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
