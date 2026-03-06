import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/#how-it-works', label: 'How It Works', isHash: true },
  { to: '/assessment', label: 'Assessment' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isDemo, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (link) => {
    setOpen(false);
    if (link.isHash) {
      if (pathname === '/') {
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/');
  };

  const navBg = scrolled
    ? 'backdrop-blur-xl dark:bg-darkbg/80 bg-white/80 border-b dark:border-darkborder border-lightborder'
    : 'bg-transparent border-b border-transparent';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="w-2 h-2 rounded-sm bg-neon-500" />
            <span className="dark:text-white text-lighttext">VITAL</span>
            <span className="text-neon-500 -ml-1.5">SCAN</span>
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => handleNavClick(l)}
                className={`text-sm font-medium transition-colors ${
                  pathname === l.to
                    ? 'text-neon-500'
                    : 'dark:text-darksub text-lightsub hover:text-neon-500'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <div className="relative">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 border dark:border-darkborder border-lightborder hover:dark:bg-white/5 hover:bg-black/5 transition-colors"
                >
                  {isDemo ? (
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">⚡ Demo</span>
                  ) : user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-neon-500 flex items-center justify-center text-darkbg text-xs font-bold">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm dark:text-white text-lighttext max-w-[120px] truncate">
                    {isDemo ? 'Demo Mode' : (user.displayName || user.email)}
                  </span>
                </button>
              </div>
            ) : (
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-neon-500 hover:bg-neon-400 text-darkbg text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              className="dark:text-darksub text-lightsub"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-b px-4 pb-4 dark:bg-darkbg bg-white dark:border-darkborder border-lightborder"
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => handleNavClick(l)}
              className="block py-2 dark:text-gray-300 text-gray-700 hover:text-neon-500"
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="mt-2 w-full border dark:border-darkborder border-lightborder dark:text-darksub text-lightsub font-semibold py-2 rounded-lg hover:text-red-400 transition-colors"
            >
              {isDemo ? 'Exit Demo' : 'Sign Out'}
            </button>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)}>
              <button className="mt-2 w-full bg-neon-500 text-darkbg font-semibold py-2 rounded-lg">
                Sign In
              </button>
            </Link>
          )}
        </motion.div>
      )}
    </nav>
  );
}
