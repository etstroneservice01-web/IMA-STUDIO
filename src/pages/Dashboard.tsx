import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Reservation, Inscription, Notification } from '../types';

export default function Dashboard() {
  const { userData, loading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('profil');

  useEffect(() => {
    if (userData) {
      const fetchUserData = async () => {
        // Fetch Reservations
        const resQ = query(collection(db, 'reservations'), where('userId', '==', userData.uid), orderBy('createdAt', 'desc'));
        const resSnap = await getDocs(resQ);
        setReservations(resSnap.docs.map(d => ({ id: d.id, ...d.data() } as Reservation)));

        // Fetch Inscriptions
        const insQ = query(collection(db, 'inscriptions'), where('userId', '==', userData.uid), orderBy('createdAt', 'desc'));
        const insSnap = await getDocs(insQ);
        setInscriptions(insSnap.docs.map(d => ({ id: d.id, ...d.data() } as Inscription)));

        // Fetch Notifications
        const notifQ = query(collection(db, 'notifications'), where('userId', '==', userData.uid), orderBy('createdAt', 'desc'));
        const notifSnap = await getDocs(notifQ);
        setNotifications(notifSnap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
      };
      fetchUserData();
    }
  }, [userData]);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!userData) return <div className="p-8 text-center">Veuillez vous connecter.</div>;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>
      
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {['profil', 'reservations', 'formations', 'notifications'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'profil' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Mon Profil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Nom complet</p>
                <p className="font-medium text-gray-900">{userData.firstName} {userData.lastName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">E-mail</p>
                <p className="font-medium text-gray-900">{userData.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Téléphone</p>
                <p className="font-medium text-gray-900">{userData.phone}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Mes Réservations</h2>
            {reservations.length === 0 ? (
              <p className="text-gray-500">Aucune réservation trouvée.</p>
            ) : (
              <div className="space-y-4">
                {reservations.map(res => (
                  <div key={res.id} className="border rounded-md p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{res.date} - {res.startTime} à {res.endTime}</p>
                      <p className="text-sm text-gray-500">{res.purpose}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      res.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      res.status === 'refused' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {res.status === 'accepted' ? 'Acceptée' : res.status === 'refused' ? 'Refusée' : 'En attente'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'formations' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Mes Formations</h2>
            {inscriptions.length === 0 ? (
              <p className="text-gray-500">Aucune inscription trouvée.</p>
            ) : (
              <div className="space-y-4">
                {inscriptions.map(ins => (
                  <div key={ins.id} className="border rounded-md p-4">
                    <p className="font-medium text-gray-900">Formation ID: {ins.formationId}</p>
                    <p className="text-sm text-gray-500">Inscrit le: {new Date(ins.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Mes Notifications</h2>
            {notifications.length === 0 ? (
              <p className="text-gray-500">Aucune notification.</p>
            ) : (
              <div className="space-y-4">
                {notifications.map(notif => (
                  <div key={notif.id} className={`border rounded-md p-4 ${notif.read ? 'bg-white' : 'bg-blue-50'}`}>
                    <p className="font-medium text-gray-900">{notif.title}</p>
                    <p className="text-sm text-gray-600">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
