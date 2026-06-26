import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

export default function Reservation() {
  const { userData, loading } = useAuth();
  const navigate = useNavigate();
  
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('Podcast');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [existingReservations, setExistingReservations] = useState<any[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);

  useEffect(() => {
    if (date) {
      // Fetch existing reservations and blocked slots for this date
      const fetchSlots = async () => {
        const resQ = query(collection(db, 'reservations'), where('date', '==', date), where('status', 'in', ['pending', 'accepted']));
        const resSnap = await getDocs(resQ);
        setExistingReservations(resSnap.docs.map(d => d.data()));

        const blockQ = query(collection(db, 'blockedSlots'), where('startDate', '<=', date)); // simplified check
        const blockSnap = await getDocs(blockQ);
        setBlockedSlots(blockSnap.docs.map(d => d.data()).filter(d => d.endDate >= date));
      };
      fetchSlots();
    }
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!userData) {
      setError('Vous devez être connecté pour réserver le studio.');
      return;
    }

    // Basic validation
    const dayOfWeek = new Date(date).getDay(); // 0 is Sunday, 6 is Saturday
    if (dayOfWeek === 0) {
      setError('Le studio est fermé le dimanche.');
      return;
    }
    
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    if (endHour <= startHour) {
      setError('L\'heure de fin doit être supérieure à l\'heure de début.');
      return;
    }
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if (startHour < 9 || endHour > 19) {
        setError('En semaine, les horaires sont de 09h00 à 19h00.');
        return;
      }
    } else if (dayOfWeek === 6) {
      if (startHour < 8 || endHour > 12) {
        setError('Le samedi, les horaires sont de 08h00 à 12h00.');
        return;
      }
    }

    // Check conflicts
    let conflict = false;
    existingReservations.forEach(res => {
      if ((startTime >= res.startTime && startTime < res.endTime) ||
          (endTime > res.startTime && endTime <= res.endTime) ||
          (startTime <= res.startTime && endTime >= res.endTime)) {
        conflict = true;
      }
    });

    let isBlocked = false;
    let blockReason = '';
    blockedSlots.forEach(block => {
      // If the block is for the whole day (no specific times) or overlaps with requested time
      if (!block.startTime || !block.endTime) {
        isBlocked = true;
        blockReason = block.reason;
      } else if (
          (startTime >= block.startTime && startTime < block.endTime) ||
          (endTime > block.startTime && endTime <= block.endTime) ||
          (startTime <= block.startTime && endTime >= block.endTime)
      ) {
        isBlocked = true;
        blockReason = block.reason;
      }
    });

    if (conflict || isBlocked) {
      setError(isBlocked ? `Ce créneau est bloqué (${blockReason}).` : 'Une réservation est déjà en cours pour ce créneau. Veuillez consulter le planning ci-dessous et faire une nouvelle demande sur une plage disponible.');
      return;
    }

    try {
      await addDoc(collection(db, 'reservations'), {
        userId: userData.uid,
        userName: `${userData.firstName} ${userData.lastName}`,
        userPhone: userData.phone,
        userEmail: userData.email,
        date,
        startTime,
        endTime,
        duration: endHour - startHour,
        purpose,
        description,
        status: 'pending',
        createdAt: Date.now()
      });
      setSuccess('Votre demande de réservation a été envoyée avec succès.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError('Erreur lors de la réservation.');
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Réserver le studio</h1>
      
      {blockedSlots.length > 0 && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6" role="alert">
          <p className="font-bold">Attention</p>
          <p>Certains créneaux ou la journée entière sont bloqués pour la date sélectionnée. Veuillez consulter le planning ci-dessous.</p>
        </div>
      )}

      {!userData && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-md mb-6 text-center">
          Veuillez vous <Link to="/login" className="font-bold underline">connecter</Link> pour réserver.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
            {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{success}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de réservation</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Heure de début</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Heure de fin</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Objet de la réservation</label>
              <select
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Podcast">Podcast</option>
                <option value="Enregistrement audio">Enregistrement audio</option>
                <option value="Vidéo">Vidéo</option>
                <option value="Shooting photo">Shooting photo</option>
                <option value="Réunion">Réunion</option>
                <option value="Formation">Formation</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Détails supplémentaires sur votre besoin..."
              />
            </div>

            <button
              type="submit"
              disabled={!userData}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Confirmer la réservation
            </button>
          </form>
        </div>

        <div>
          {date ? (
            <div className="bg-white shadow rounded-lg p-6 overflow-hidden">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Planning du {new Date(date).toLocaleDateString()}</h2>
              
              {existingReservations.length === 0 && blockedSlots.length === 0 ? (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-md">
                  Tous les créneaux sont disponibles pour cette date.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horaire</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        {(userData?.role === 'admin' || userData?.role === 'observer') && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>}
                        {(userData?.role === 'admin' || userData?.role === 'observer') && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {existingReservations.map((res, idx) => (
                        <tr key={`res-${idx}`}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{res.startTime} - {res.endTime}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">Réservé</span>
                          </td>
                          {(userData?.role === 'admin' || userData?.role === 'observer') && <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{res.userName}</td>}
                          {(userData?.role === 'admin' || userData?.role === 'observer') && <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{res.purpose}</td>}
                        </tr>
                      ))}
                      {blockedSlots.map((block, idx) => (
                        <tr key={`block-${idx}`}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{block.startTime} - {block.endTime}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">Indisponible</span>
                          </td>
                          {(userData?.role === 'admin' || userData?.role === 'observer') && <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{block.reason}</td>}
                          {(userData?.role === 'admin' || userData?.role === 'observer') && <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Bloqué</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-500">
              <p>Sélectionnez une date pour voir les créneaux disponibles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
