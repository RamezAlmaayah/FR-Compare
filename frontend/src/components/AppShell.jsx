import { useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const AppShell = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const menu = useRef(null);
  const context = pathname.startsWith('/suppliers') ? 'Suppliers' : pathname.startsWith('/items') ? 'Catalog Items'
    : pathname.startsWith('/quotations') ? 'Quotations' : pathname.endsWith('/compare') ? 'Quotation Comparison'
      : pathname.startsWith('/rfqs') ? 'RFQs' : 'Dashboard';
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace-content">Skip to content</a>
      <aside className="desktop-sidebar"><Sidebar /></aside>
      <dialog ref={menu} className="mobile-navigation" aria-label="Navigation menu">
        <button className="btn btn-outline-secondary menu-close" type="button" onClick={() => menu.current.close()}>Close menu</button>
        <Sidebar onNavigate={() => menu.current.close()} />
      </dialog>
      <div className="workspace">
        <header className="workspace-topbar">
          <div className="topbar-context"><button className="btn btn-outline-secondary menu-toggle" type="button"
            aria-haspopup="dialog" onClick={() => menu.current.showModal()}>Menu</button><span>{context}</span></div>
          <div className="user-tools"><span className="user-initials" aria-hidden="true">{user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('')}</span>
            <span className="user-name">{user.name}</span><button className="btn btn-outline-secondary" type="button" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <div id="workspace-content" className="workspace-content" tabIndex="-1"><Outlet /></div>
      </div>
    </div>
  );
};

export default AppShell;
