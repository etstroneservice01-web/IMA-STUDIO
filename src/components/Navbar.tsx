import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User as UserIcon } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { userData, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Formations', path: '/formations' },
    { name: 'Réservation', path: '/reservation' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-blue-600 tracking-tight">IMA Studio</span>
            </Link>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                  location.pathname === link.path
                    ? "border-blue-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden sm:flex sm:items-center">
            {!loading && (
              <>
                {userData ? (
                  <div className="flex items-center space-x-4">
                    <Link to={(userData.role === 'admin' || userData.role === 'observer') ? '/admin' : '/dashboard'} className="text-gray-500 hover:text-blue-600 flex items-center space-x-1">
                      <UserIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">{userData.firstName}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      to="/login"
                      className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      S'inscrire
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                  location.pathname === link.path
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {!loading && userData ? (
              <div className="space-y-1">
                <div className="px-4 py-2">
                  <p className="text-base font-medium text-gray-800">{userData.firstName} {userData.lastName}</p>
                  <p className="text-sm font-medium text-gray-500">{userData.email}</p>
                </div>
                <Link
                  to={(userData.role === 'admin' || userData.role === 'observer') ? '/admin' : '/dashboard'}
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Tableau de bord
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="space-y-1 px-4">
                <Link
                  to="/login"
                  className="block py-2 text-base font-medium text-gray-500 hover:text-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="block py-2 text-base font-medium text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
