import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { Reservation, Formation } from '../types';

export default function AdminDashboard() {
  const { userData, loading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [activeTab, setActiveTab] = useState('reservations');

  useEffect(() => {
    if (userData && userData.role === 'admin') {
      const fetchData = async () => {
        const resQ = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
        const resSnap = await getDocs(resQ);
        setReservations(resSnap.docs.map(d => ({ id: d.id, ...d.data() } as Reservation)));

        const formQ = query(collection(db, 'formations'), orderBy('createdAt', 'desc'));
        const formSnap = await getDocs(formQ);
        setFormations(formSnap.docs.map(d => ({ id: d.id, ...d.data() } as Formation)));
      };
      fetchData();
    }
  }, [userData]);

  const handleStatusChange = async (resId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'reservations', resId), { status: newStatus });
      setReservations(reservations.map(r => r.id === resId ? { ...r, status: newStatus as any } : r));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut", error);
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!userData || userData.role !== 'admin') return <div className="p-8 text-center">Accès refusé. Administrateur uniquement.</div>;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Administration</h1>
      
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {['reservations', 'formations', 'calendrier', 'messages'].map((tab) => (
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
        {activeTab === 'reservations' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gestion des réservations</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motif</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((res) => (
                    <tr key={res.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.date} <br/><span className="text-gray-500">{res.startTime}-{res.endTime}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.userName} <br/><span className="text-gray-500">{res.userPhone}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.purpose}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          res.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          res.status === 'refused' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {res.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button onClick={() => handleStatusChange(res.id, 'accepted')} className="text-green-600 hover:text-green-900">Accepter</button>
                            <button onClick={() => handleStatusChange(res.id, 'refused')} className="text-red-600 hover:text-red-900">Refuser</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'formations' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Gestion des formations</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Ajouter une formation</button>
            </div>
            {formations.length === 0 ? (
              <p className="text-gray-500">Aucune formation.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formations.map(form => (
                  <div key={form.id} className="border p-4 rounded-md">
                    <h3 className="font-bold">{form.title}</h3>
                    <p className="text-sm text-gray-500">{form.date} - {form.time}</p>
                    <p className="text-sm mt-2">Places: {form.availableSeats} / {form.totalSeats}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendrier' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Bloquer des créneaux</h2>
            <p className="text-gray-500">Module de blocage de calendrier à venir...</p>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Messages de contact</h2>
            <p className="text-gray-500">Aucun message pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
