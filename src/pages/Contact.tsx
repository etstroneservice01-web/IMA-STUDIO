import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'messages'), {
        name,
        email,
        subject,
        content,
        status: 'new',
        createdAt: Date.now()
      });
      setStatus('success');
      setName('');
      setEmail('');
      setSubject('');
      setContent('');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Contactez-nous</h1>
      
      <div className="bg-white shadow rounded-lg p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {status === 'success' && (
            <div className="bg-green-50 text-green-800 p-4 rounded-md">
              Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
            </div>
          )}
          {status === 'error' && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md">
              Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sujet</label>
            <input
              type="text" required value={subject} onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              required rows={6} value={content} onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <button
            type="submit" disabled={status === 'submitting'}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {status === 'submitting' ? 'Envoi...' : 'Envoyer le message'}
          </button>
        </form>
      </div>
    </div>
  );
}
