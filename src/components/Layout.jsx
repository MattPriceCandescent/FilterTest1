import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import './Layout.css';

export default function Layout() {
  return (
    <div className="app-layout">
      <TopNav />
      <div className="app-body">
        <Sidebar />
        <div className="app-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
