import { NavLink } from 'react-router-dom';
import dashboardIcon from '../assets/sidebar-icons/dashboard.svg';
import suppliersIcon from '../assets/sidebar-icons/suppliers.svg';
import catalogIcon from '../assets/sidebar-icons/catalog.svg';
import rfqIcon from '../assets/sidebar-icons/rfq.svg';

const navigation = [
  ['/dashboard', 'Dashboard', dashboardIcon], ['/suppliers', 'Suppliers', suppliersIcon],
  ['/items', 'Catalog Items', catalogIcon], ['/rfqs', 'RFQs', rfqIcon],
];

const Sidebar = ({ onNavigate }) => (
  <div className="sidebar-content">
    <NavLink to="/dashboard" className="brand" onClick={onNavigate}>
      <span className="brand-mark" aria-hidden="true">FR</span><span>FR Compare<span className="brand-caption">Procurement, considered.</span></span>
    </NavLink>
    <p className="eyebrow sidebar-label">Workspace</p>
    <nav aria-label="Main navigation">
      {navigation.map(([path, label, icon], index) => <NavLink key={path} to={path} onClick={onNavigate}
        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
        <span className="sidebar-icon" aria-hidden="true" style={{ '--icon-delay': `${index * -1.5}s` }}>
          <span className="sidebar-icon-drawing" style={{ '--icon-source': `url("${icon}")` }} />
        </span>{label}
      </NavLink>)}
    </nav>
    <div className="sidebar-note">
      <img className="sidebar-artwork" src="/sidebar-linework.svg" alt="" aria-hidden="true" />
      <span className="eyebrow">From request to decision</span>
      <p>Manage quotations and compare offers inside each RFQ.</p>
    </div>
  </div>
);

export default Sidebar;
