import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navSections = [
  {
    label: 'GENERAL',
    items: [
      { to: '/dashboard', icon: 'home', label: 'Dashboard' },
      { to: '/apps', icon: 'grid', label: 'Apps' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { to: '/user-management', icon: 'users', label: 'User Management' },
    ],
  },
  {
    label: 'MARKETPLACE',
    items: [
      { to: '/onboarding', icon: 'check', label: 'Onboarding' },
      { to: '/products', icon: 'cart', label: 'Products' },
    ],
  },
];

const quickLinks = [
  { href: '#', label: 'Documentation' },
  { href: '#', label: 'Marketplace' },
  { href: '#', label: 'Help Center' },
];

function Icon({ name }) {
  const icons = {
    home: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    ),
    grid: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
    ),
    users: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    check: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
    ),
    cart: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
    ),
  };
  return icons[name] ?? null;
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.label} className="sidebar-section">
            <div className="sidebar-section-label">{section.label}</div>
            <ul className="sidebar-list">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                  >
                    <span className="sidebar-link-icon"><Icon name={item.icon} /></span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="sidebar-section">
          <div className="sidebar-section-label">QUICK NAVIGATION</div>
          <ul className="sidebar-list sidebar-list-links">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="sidebar-quick-link">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
