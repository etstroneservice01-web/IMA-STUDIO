import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { userData } = useAuth();

  if (userData) {
    navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
  }

  const getEmailFromLoginId = async (id: string): Promise<string | null> => {
    if (id.includes('@')) {
      return id; // It's likely an email
    }
    // Query by username
    const q = query(collection(db, 'users'), where('username', '==', id.toLowerCase()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().email;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const targetEmail = await getEmailFromLoginId(loginId);
      if (!targetEmail) {
        setError('Identifiant introuvable. Veuillez vérifier votre adresse e-mail ou nom d\'utilisateur.');
        return;
      }
      
      await signInWithEmailAndPassword(auth, targetEmail, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Échec de la connexion. Vérifiez vos identifiants.');
    }
  };

  const handleResetPassword = async () => {
    if (!loginId) {
      setError('Veuillez saisir votre adresse e-mail ou nom d\'utilisateur dans le champ correspondant pour réinitialiser le mot de passe.');
      return;
    }
    try {
      const targetEmail = await getEmailFromLoginId(loginId);
      if (!targetEmail) {
        setError('Identifiant introuvable.');
        return;
      }
      await sendPasswordResetEmail(auth, targetEmail);
      setResetSent(true);
      setError('');
    } catch (err) {
      setError('Erreur lors de l\'envoi de l\'e-mail de réinitialisation.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion à votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            créer un nouveau compte
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {resetSent && <div className="text-green-500 text-sm font-medium">Un e-mail de réinitialisation a été envoyé à l'adresse associée. Veuillez vérifier votre boîte de réception.</div>}
            
            <div>
              <label htmlFor="loginId" className="block text-sm font-medium text-gray-700">
                Adresse e-mail ou Nom d'utilisateur
              </label>
              <div className="mt-1">
                <input
                  id="loginId"
                  name="loginId"
                  type="text"
                  autoComplete="username"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="E-mail ou nom d'utilisateur"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Se connecter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
