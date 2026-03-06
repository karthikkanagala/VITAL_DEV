import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiAlertTriangle, FiBarChart2, FiPlusCircle, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import UserProfilePage from './dashboard/UserProfilePage';
import EmergencyContactsPage from './dashboard/EmergencyContactsPage';
import PreviousAssessmentsPage from './dashboard/PreviousAssessmentsPage';
import SettingsPage from './dashboard/SettingsPage';

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'emergency', label: 'Emergency Contacts', icon: FiAlertTriangle },
  { id: 'assessments', label: 'My Assessments', icon: FiBarChart2 },
  { id: 'new', label: 'New Assessment', icon: FiPlusCircle },
];

const BOTTOM_ITEMS = [
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

function Sidebar({ active, setActive }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNav = (id) => {
    if (id === 'new') {
      navigate('/assessment');
    } else {
      setActive(id);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const initial = (user?.displayName || user?.email || 'U')[0].toUpperCase();

  return (
    <aside
      className="flex flex-col shrink-0"
      style={{
        width: 240,
        minWidth: 240,
        maxWidth: 240,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      {/* User info */}
      <div className="px-5 pt-8 pb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="avatar"
            className="w-10 h-10 rounded-full mb-3 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neon-500 flex items-center justify-center text-darkbg font-bold text-lg mb-3">
            {initial}
          </div>
        )}
        <p className="font-semibold text-sm truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
          {user?.displayName || 'User'}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="w-full flex items-center gap-3 text-sm transition-all duration-150 rounded-r-lg"
              style={{
                padding: '12px 20px',
                paddingLeft: isActive ? 17 : 20,
                borderLeft: isActive ? '3px solid #00DC78' : '3px solid transparent',
                background: isActive ? '#0d2010' : 'transparent',
                color: isActive ? '#00DC78' : '#666',
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#111a12';
                  e.currentTarget.style.color = '#00DC78';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#666';
                }
              }}
            >
              <Icon size={16} className="shrink-0" />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pb-4 space-y-1 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
        {BOTTOM_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="w-full flex items-center gap-3 text-sm transition-all duration-150 rounded-r-lg"
              style={{
                padding: '12px 20px',
                paddingLeft: isActive ? 17 : 20,
                borderLeft: isActive ? '3px solid #00DC78' : '3px solid transparent',
                background: isActive ? '#0d2010' : 'transparent',
                color: isActive ? '#00DC78' : '#666',
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#111a12';
                  e.currentTarget.style.color = '#00DC78';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#666';
                }
              }}
            >
              <Icon size={16} className="shrink-0" />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            </button>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-sm transition-all duration-150 rounded-r-lg"
          style={{
            padding: '12px 20px',
            borderLeft: '3px solid transparent',
            color: '#666',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1a0808';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#666';
          }}
        >
          <FiLogOut size={16} className="shrink-0" />
          <span style={{ whiteSpace: 'nowrap' }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default function DashboardPage() {
  const [active, setActive] = useState('profile');

  const pages = {
    profile: <UserProfilePage />,
    emergency: <EmergencyContactsPage />,
    assessments: <PreviousAssessmentsPage />,
    settings: <SettingsPage />,
  };

  return (
    <div className="flex min-h-screen dark:bg-darkbg bg-lightbg pt-16">
      {/* Left sidebar */}
      <Sidebar active={active} setActive={setActive} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8" style={{ minWidth: 0 }}>
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {pages[active] || <UserProfilePage />}
        </motion.div>
      </main>
    </div>
  );
}
