import {
  NavLink,
  Outlet,
  useNavigate
} from 'react-router-dom';

import {
  Activity,
  BarChart3,
  Boxes,
  Building2,
  ChevronDown,
  ClipboardList,
  Contact,
  LogOut,
  Package,
  Receipt,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Menu,
  X
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const groups = [
  {
    label: 'WORKSPACE',
    items: [
      ['Dashboard', '/', LayoutDashboard],
      ['Products', '/products', Package],
      ['Sales', '/sales', ShoppingCart],
      ['Purchases', '/purchases', Truck],
      ['Inventory', '/inventory', Boxes]
    ]
  },
  {
    label: 'RELATIONSHIPS',
    items: [
      ['Customers', '/customers', Contact],
      ['Suppliers', '/suppliers', Building2]
    ]
  },
  {
    label: 'FINANCE & PEOPLE',
    items: [
      ['Expenses', '/expenses', Wallet],
      ['Invoices', '/invoices', Receipt],
      ['Employees', '/employees', Users],
      ['Departments', '/departments', ClipboardList]
    ]
  },
  {
    label: 'INSIGHTS',
    items: [
      ['Reports', '/reports', BarChart3],
      ['Activity Log', '/activities', Activity],
      ['Settings', '/settings', Settings]
    ]
  }
] as const;

export default function Layout() {
  const { user, logout } = useAuth();

  const nav = useNavigate();

  const [open, setOpen] = useState(false);

  const [workspaceName, setWorkspaceName] =
    useState('Northstar Trading');

  // Get workspace name from MongoDB
  useEffect(() => {
    let active = true;

    const loadWorkspace = async () => {
      try {
        const { data } = await api.get('/workspace');

        if (active) {
          setWorkspaceName(data.workspace.name);
        }
      } catch (error) {
        console.error('Workspace loading failed:', error);
      }
    };

    loadWorkspace();

    // Listen for workspace updates from Settings
    const handleWorkspaceUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        name: string;
      }>;

      if (customEvent.detail?.name) {
        setWorkspaceName(customEvent.detail.name);
      }
    };

    window.addEventListener(
      'bizflow:workspace-updated',
      handleWorkspaceUpdate
    );

    return () => {
      active = false;

      window.removeEventListener(
        'bizflow:workspace-updated',
        handleWorkspaceUpdate
      );
    };
  }, []);

  const signout = () => {
    logout();
    nav('/login');
  };

  const workspaceInitial =
    workspaceName.trim().charAt(0).toUpperCase() || 'B';

  return (
    <div className="app-shell">

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>

        <div className="brand">
          <div className="brand-mark">B</div>

          <div>
            <b>bizflow</b>
            <small>BUSINESS SUITE</small>
          </div>

          <button
            className="mobile-close"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Workspace */}
        <div className="workspace-switch">
          <div className="workspace-icon">
            {workspaceInitial}
          </div>

          <div>
            <b>{workspaceName}</b>
            <small>Free workspace</small>
          </div>

          <ChevronDown size={15} />
        </div>

        <nav>
          {groups.map(group => (
            <div className="nav-group" key={group.label}>

              <p>{group.label}</p>

              {group.items.map(([label, path, Icon]) => (
                <NavLink
                  onClick={() => setOpen(false)}
                  end={path === '/'}
                  to={path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  key={path}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </NavLink>
              ))}

            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">

          <div className="help-card">
            <b>Need a hand?</b>
            <span>Explore the BizFlow workspace guide.</span>

            <a
              href="https://www.mongodb.com/docs/"
              target="_blank"
              rel="noreferrer"
            >
              View documentation ↗
            </a>
          </div>

          <button className="user-card" onClick={signout}>
            <div className="avatar">
              {user?.name?.slice(0, 1) || 'A'}
            </div>

            <div className="user-meta">
              <b>{user?.name || 'Admin User'}</b>
              <small>{user?.role || 'Administrator'}</small>
            </div>

            <LogOut size={16} />
          </button>

        </div>
      </aside>

      {open && (
        <div
          className="scrim"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="main-area">

        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>

          <div className="crumb">
            Workspace <span>/</span> <b>Overview</b>
          </div>

          <div className="top-actions">
            <span className="status-dot" />
            <span className="online-label">
              System operational
            </span>

            <div className="top-avatar">
              {user?.name?.slice(0, 1) || 'A'}
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>

      </main>
    </div>
  );
}