import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { Reservation, Inscription, Notification } from '../types';

export default function Dashboard() {
  const { userData, loading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('profil');

  const [reviewResId, setReviewResId] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');

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

  const handleCheckIn = async (resId: string) => {
    await updateDoc(doc(db, 'reservations', resId), { checkedIn: true, checkInTime: Date.now() });
    setReservations(reservations.map(r => r.id === resId ? { ...r, checkedIn: true, checkInTime: Date.now() } : r));
  };

  const handleCheckOut = async (resId: string) => {
    await updateDoc(doc(db, 'reservations', resId), { checkedOut: true, checkOutTime: Date.now() });
    setReservations(reservations.map(r => r.id === resId ? { ...r, checkedOut: true, checkOutTime: Date.now() } : r));
  };

  const submitReview = async (resId: string) => {
    await updateDoc(doc(db, 'reservations', resId), { review: reviewText, reviewDate: Date.now() });
    setReservations(reservations.map(r => r.id === resId ? { ...r, review: reviewText, reviewDate: Date.now() } : r));
    setReviewResId(null);
    setReviewText('');
  };

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
                  <div key={res.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
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

                    {res.status === 'refused' && res.rejectionNote && (
                      <div className="mt-3 bg-red-50 text-red-800 p-3 rounded-md text-sm">
                        <p className="font-semibold mb-1">Motif / Recommandation :</p>
                        <p>{res.rejectionNote}</p>
                      </div>
                    )}

                    {res.status === 'accepted' && (
                      <div className="mt-4 pt-3 border-t">
                        {!res.checkedIn ? (
                          <button onClick={() => handleCheckIn(res.id)} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                            Je suis à ma réservation
                          </button>
                        ) : !res.checkedOut ? (
                          <div className="flex space-x-4 items-center">
                            <span className="text-sm text-green-600 font-medium">En cours...</span>
                            <button onClick={() => handleCheckOut(res.id)} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                              J'ai fini
                            </button>
                          </div>
                        ) : !res.review ? (
                          <div>
                            <span className="text-sm text-gray-600 font-medium mb-2 block">Réservation terminée. Merci !</span>
                            {reviewResId === res.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={reviewText}
                                  onChange={e => setReviewText(e.target.value)}
                                  className="w-full text-sm p-2 border rounded"
                                  placeholder="Votre avis sur cette session (optionnel)"
                                />
                                <div className="flex space-x-2">
                                  <button onClick={() => submitReview(res.id)} className="bg-blue-600 text-white px-3 py-1 text-sm rounded">Envoyer</button>
                                  <button onClick={() => setReviewResId(null)} className="text-gray-500 text-sm">Annuler</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setReviewResId(res.id)} className="text-blue-600 border border-blue-600 px-3 py-1 text-sm rounded hover:bg-blue-50">
                                Laisser un avis
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Avis laissé : {res.review}
                          </div>
                        )}
                      </div>
                    )}
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
