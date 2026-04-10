import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import OnboardingForm from './pages/OnboardingForm';
import AdminDashboard from './pages/AdminDashboard';
import Directory from './pages/Directory';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { LogIn, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import { cn } from './lib/utils';

import AdminNav from './components/AdminNav';

function Navbar() {
  const { user, member, signIn, logout, loading } = useAuth();

  return (
    <nav className="w-full z-[100] px-6 py-4 flex items-center justify-between bg-neutral-950 border-b border-neutral-900 shadow-2xl min-h-[72px]">
      <Link to="/" className="text-gold-500 font-serif text-2xl tracking-tighter hover:text-gold-400 transition-colors">BBB</Link>
      
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-500 text-xs animate-pulse">
            <div className="w-2 h-2 bg-gold-500 rounded-full" />
            Authenticating...
          </div>
        ) : (
          <>
            {user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                {member?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 text-sm text-gold-500 hover:text-gold-400 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-gold-500/5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="hidden xs:inline">Admin</span>
                  </Link>
                )}
                {member?.isApproved && (
                  <>
                    <Link to="/directory" className="text-sm text-neutral-400 hover:text-gold-500 transition-colors px-2 py-1">Directory</Link>
                    <Link to="/profile" className="text-sm text-neutral-400 hover:text-gold-500 transition-colors px-2 py-1">Profile</Link>
                  </>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 rounded-full border border-neutral-800">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-gold-500" />
                  )}
                  <span className="text-xs font-medium text-neutral-300 hidden sm:inline max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0]}
                  </span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-full hover:bg-neutral-900"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={signIn}
                className="flex items-center gap-2 px-6 py-2 bg-gold-600 hover:bg-gold-500 text-neutral-950 font-bold rounded-full transition-all text-sm shadow-lg shadow-gold-600/20"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [isAdminNavVisible, setIsAdminNavVisible] = React.useState(false);

  React.useEffect(() => {
    const checkVisibility = () => {
      const hidden = localStorage.getItem('hide-bbb-admin');
      setIsAdminNavVisible(hidden !== 'true');
    };

    checkVisibility();
    window.addEventListener('admin-nav-toggle', checkVisibility);
    return () => window.removeEventListener('admin-nav-toggle', checkVisibility);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AdminNav />
        <div className={cn("min-h-screen flex flex-col transition-all duration-300", isAdminNavVisible ? "pt-16" : "pt-0")}>
          <div className="sticky top-0 z-[100]">
            <Navbar />
          </div>
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/apply" element={<OnboardingForm />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
