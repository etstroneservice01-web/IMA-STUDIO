import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Formation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Users } from 'lucide-react';

export default function Formations() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loadingFormations, setLoadingFormations] = useState(true);
  const { userData } = useAuth();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFormations = async () => {
      const q = query(collection(db, 'formations'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setFormations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Formation)));
      setLoadingFormations(false);
    };
    fetchFormations();
  }, []);

  const handleInscription = async (formationId: string) => {
    if (!userData) {
      setMessage('Veuillez vous connecter pour vous inscrire.');
      return;
    }
    try {
      await addDoc(collection(db, 'inscriptions'), {
        formationId,
        userId: userData.uid,
        userName: `${userData.firstName} ${userData.lastName}`,
        userPhone: userData.phone,
        userEmail: userData.email,
        createdAt: Date.now()
      });
      
      const formationDoc = doc(db, 'formations', formationId);
      const formationData = formations.find(f => f.id === formationId);
      if (formationData && formationData.availableSeats > 0) {
        await updateDoc(formationDoc, { availableSeats: formationData.availableSeats - 1 });
        setFormations(formations.map(f => f.id === formationId ? { ...f, availableSeats: f.availableSeats - 1 } : f));
      }

      setMessage('Inscription réussie ! Vous la retrouverez dans votre tableau de bord.');
    } catch (error) {
      setMessage('Erreur lors de l\'inscription.');
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Nos Formations</h1>
        <p className="mt-4 text-xl text-gray-600">Développez vos compétences avec nos experts de l'audiovisuel.</p>
      </div>

      {message && (
        <div className="mb-8 p-4 bg-blue-50 text-blue-800 rounded-md text-center font-medium">
          {message}
        </div>
      )}

      {loadingFormations ? (
        <div className="text-center">Chargement des formations...</div>
      ) : formations.length === 0 ? (
        <div className="text-center text-gray-500">Aucune formation disponible pour le moment.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {formations.map((formation) => (
            <div key={formation.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="h-48 bg-gray-200 w-full relative">
                {formation.imageUrl ? (
                  <img src={formation.imageUrl} alt={formation.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Image indisponible</div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{formation.title}</h3>
                {formation.intervenant && <p className="text-sm font-medium text-blue-600 mb-2">Par {formation.intervenant}</p>}
                <p className="text-gray-600 mb-4 line-clamp-3">{formation.description}</p>
                {formation.recommendations && (
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 mb-4 italic">
                    <span className="font-semibold block mb-1">Recommandations :</span>
                    {formation.recommendations}
                  </div>
                )}
                
                <div className="mt-auto space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" /> {formation.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" /> {formation.time} ({formation.duration})
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" /> {formation.availableSeats} places restantes sur {formation.totalSeats}
                  </div>
                </div>

                {formation.availableSeats === 0 ? (
                  <button disabled className="w-full py-3 px-4 rounded-md bg-gray-100 text-gray-500 font-medium cursor-not-allowed">
                    Formation complète
                  </button>
                ) : (
                  <button 
                    onClick={() => handleInscription(formation.id)}
                    className="w-full py-3 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                  >
                    S'inscrire
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
