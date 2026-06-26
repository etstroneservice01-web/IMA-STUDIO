import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, orderBy, addDoc, deleteDoc } from 'firebase/firestore';
import { Reservation, Formation, User, BlockedSlot, Message, Inscription } from '../types';

export default function AdminDashboard() {
  const { userData, loading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [activeTab, setActiveTab] = useState('reservations');

  // Refusal state
  const [refusalResId, setRefusalResId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  // Block slot form state
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');
  const [blockReason, setBlockReason] = useState('');

  // Formation form state
  const [showFormationForm, setShowFormationForm] = useState(false);
  const [expandedFormationId, setExpandedFormationId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formIntervenant, setFormIntervenant] = useState('');
  const [formRecommendations, setFormRecommendations] = useState('');
  const [formSeats, setFormSeats] = useState(10);
  const [formImg, setFormImg] = useState('');

  const handleCreateFormation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newFormation = {
        title: formTitle,
        description: formDesc,
        program: '',
        duration: '',
        date: formDate,
        time: formTime,
        intervenant: formIntervenant,
        recommendations: formRecommendations,
        totalSeats: formSeats,
        availableSeats: formSeats,
        imageUrl: formImg || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
        createdAt: Date.now()
      };
      const docRef = await addDoc(collection(db, 'formations'), newFormation);
      setFormations([{ id: docRef.id, ...newFormation } as Formation, ...formations]);
      setShowFormationForm(false);
      setFormTitle(''); setFormDesc(''); setFormDate(''); setFormTime(''); setFormIntervenant(''); setFormRecommendations('');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userData && userData.role === 'admin') {
      const fetchData = async () => {
        const resQ = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
        const resSnap = await getDocs(resQ);
        setReservations(resSnap.docs.map(d => ({ id: d.id, ...d.data() } as Reservation)));

        const formQ = query(collection(db, 'formations'), orderBy('createdAt', 'desc'));
        const formSnap = await getDocs(formQ);
        setFormations(formSnap.docs.map(d => ({ id: d.id, ...d.data() } as Formation)));

        const usersQ = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const usersSnap = await getDocs(usersQ);
        setUsersList(usersSnap.docs.map(d => ({ ...d.data() } as User)));

        const slotsQ = query(collection(db, 'blockedSlots'), orderBy('createdAt', 'desc'));
        const slotsSnap = await getDocs(slotsQ);
        setBlockedSlots(slotsSnap.docs.map(d => ({ id: d.id, ...d.data() } as BlockedSlot)));

        const msgQ = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const msgSnap = await getDocs(msgQ);
        setMessages(msgSnap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));

        const insQ = query(collection(db, 'inscriptions'), orderBy('createdAt', 'desc'));
        const insSnap = await getDocs(insQ);
        setInscriptions(insSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      };
      fetchData();
    }
  }, [userData]);

  const handleStatusChange = async (resId: string, newStatus: string, note?: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (note) {
        updateData.rejectionNote = note;
      }
      await updateDoc(doc(db, 'reservations', resId), updateData);
      setReservations(reservations.map(r => r.id === resId ? { ...r, ...updateData } : r));
      setRefusalResId(null);
      setRejectionNote('');
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut", error);
    }
  };

  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBlock = {
        startDate: blockStartDate,
        endDate: blockEndDate || blockStartDate,
        startTime: blockStartTime,
        endTime: blockEndTime,
        reason: blockReason,
        createdAt: Date.now()
      };
      const docRef = await addDoc(collection(db, 'blockedSlots'), newBlock);
      setBlockedSlots([{ id: docRef.id, ...newBlock } as BlockedSlot, ...blockedSlots]);
      setBlockStartDate(''); setBlockEndDate(''); setBlockStartTime(''); setBlockEndTime(''); setBlockReason('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    await deleteDoc(doc(db, 'blockedSlots', id));
    setBlockedSlots(blockedSlots.filter(b => b.id !== id));
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!userData || userData.role !== 'admin') return <div className="p-8 text-center">Accès refusé. Administrateur uniquement.</div>;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Administration</h1>
      
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {['reservations', 'utilisateurs', 'formations', 'calendrier', 'messages'].map((tab) => (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Présence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((res) => (
                    <tr key={res.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.date} <br/><span className="text-gray-500">{res.startTime}-{res.endTime}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.userName} <br/><span className="text-gray-500">{res.userPhone}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {res.purpose}
                        {res.review && <div className="mt-1 text-xs text-blue-600">Avis: {res.review}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          res.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          res.status === 'refused' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {res.checkedIn && <div>Arrivée: {new Date(res.checkInTime || 0).toLocaleTimeString()}</div>}
                        {res.checkedOut && <div>Départ: {new Date(res.checkOutTime || 0).toLocaleTimeString()}</div>}
                        {!res.checkedIn && !res.checkedOut && <span>-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {res.status === 'pending' && (
                          <div className="flex flex-col space-y-2">
                            <button onClick={() => handleStatusChange(res.id, 'accepted')} className="text-green-600 hover:text-green-900 text-left">Accepter</button>
                            <button onClick={() => setRefusalResId(res.id)} className="text-red-600 hover:text-red-900 text-left">Refuser</button>
                            
                            {refusalResId === res.id && (
                              <div className="mt-2 bg-gray-50 p-2 rounded border">
                                <textarea
                                  value={rejectionNote}
                                  onChange={e => setRejectionNote(e.target.value)}
                                  className="w-full text-xs p-1 border rounded"
                                  placeholder="Recommandations / Raison"
                                />
                                <div className="flex space-x-2 mt-2">
                                  <button onClick={() => handleStatusChange(res.id, 'refused', rejectionNote)} className="bg-red-600 text-white px-2 py-1 text-xs rounded">Confirmer le refus</button>
                                  <button onClick={() => setRefusalResId(null)} className="text-gray-500 text-xs">Annuler</button>
                                </div>
                              </div>
                            )}
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

        {activeTab === 'utilisateurs' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Liste des utilisateurs</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersList.map((u) => (
                    <tr key={u.uid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.firstName} {u.lastName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
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
              <button onClick={() => setShowFormationForm(!showFormationForm)} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                {showFormationForm ? 'Annuler' : 'Ajouter une formation'}
              </button>
            </div>

            {showFormationForm && (
              <form onSubmit={handleCreateFormation} className="bg-gray-50 p-4 rounded-md mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Nom de la formation</label>
                    <input type="text" required value={formTitle} onChange={e => setFormTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea required value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" required value={formDate} onChange={e => setFormDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heure</label>
                    <input type="time" required value={formTime} onChange={e => setFormTime(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Intervenant (Optionnel)</label>
                    <input type="text" value={formIntervenant} onChange={e => setFormIntervenant(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre de places</label>
                    <input type="number" required min="1" value={formSeats} onChange={e => setFormSeats(parseInt(e.target.value))} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">URL de l'image (Optionnel)</label>
                    <input type="url" value={formImg} onChange={e => setFormImg(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Recommandations (Optionnel)</label>
                    <textarea value={formRecommendations} onChange={e => setFormRecommendations(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  </div>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium">Créer</button>
              </form>
            )}

            {formations.length === 0 ? (
              <p className="text-gray-500">Aucune formation.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formations.map(form => (
                  <div key={form.id} className="border p-4 rounded-md">
                    {form.imageUrl && <img src={form.imageUrl} alt={form.title} className="w-full h-32 object-cover rounded-md mb-2" />}
                    <h3 className="font-bold">{form.title}</h3>
                    <p className="text-sm text-gray-500">{form.date} - {form.time}</p>
                    {form.intervenant && <p className="text-sm text-gray-600">Par {form.intervenant}</p>}
                    <p className="text-sm mt-2">Places: {form.availableSeats} / {form.totalSeats}</p>
                    <button onClick={() => setExpandedFormationId(expandedFormationId === form.id ? null : form.id)} className="mt-3 text-sm text-blue-600 underline">
                      {expandedFormationId === form.id ? 'Masquer les inscrits' : 'Voir les inscrits'}
                    </button>
                    
                    {expandedFormationId === form.id && (
                      <div className="mt-4 border-t pt-3">
                        <h4 className="text-sm font-semibold mb-2">Liste des inscrits:</h4>
                        {inscriptions.filter(i => i.formationId === form.id).length === 0 ? (
                          <p className="text-xs text-gray-500">Aucun inscrit pour le moment.</p>
                        ) : (
                          <ul className="space-y-2">
                            {inscriptions.filter(i => i.formationId === form.id).map(ins => (
                              <li key={ins.id} className="text-xs bg-gray-50 p-2 rounded">
                                <span className="font-bold block">{ins.userName}</span>
                                <span className="text-gray-600 block">{ins.userEmail}</span>
                                <span className="text-gray-600">{ins.userPhone}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendrier' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Bloquer des créneaux</h2>
            <form onSubmit={handleBlockSlot} className="bg-gray-50 p-4 rounded-md mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de début</label>
                  <input type="date" required value={blockStartDate} onChange={e => setBlockStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de fin (optionnel)</label>
                  <input type="date" value={blockEndDate} onChange={e => setBlockEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Heure de début (optionnel)</label>
                  <input type="time" value={blockStartTime} onChange={e => setBlockStartTime(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Heure de fin (optionnel)</label>
                  <input type="time" value={blockEndTime} onChange={e => setBlockEndTime(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Raison</label>
                  <input type="text" required value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="Maintenance, Férié..." className="mt-1 block w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium">Bloquer</button>
            </form>

            <h3 className="text-lg font-medium mb-2">Créneaux bloqués</h3>
            <div className="space-y-2">
              {blockedSlots.map(block => (
                <div key={block.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <span className="font-bold">{block.startDate}</span> {block.endDate && block.endDate !== block.startDate && <span> au {block.endDate}</span>}
                    {(block.startTime || block.endTime) && <span className="ml-2 text-gray-600">({block.startTime || '00:00'} - {block.endTime || '23:59'})</span>}
                    <span className="ml-2 bg-gray-200 px-2 py-1 rounded text-xs">{block.reason}</span>
                  </div>
                  <button onClick={() => handleDeleteBlock(block.id)} className="text-red-600 hover:text-red-800 text-sm">Supprimer</button>
                </div>
              ))}
              {blockedSlots.length === 0 && <p className="text-gray-500">Aucun créneau bloqué.</p>}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Messages de contact</h2>
            {messages.length === 0 ? (
              <p className="text-gray-500">Aucun message pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`border p-4 rounded-md ${msg.status === 'new' ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{msg.subject}</h3>
                        <p className="text-sm text-gray-500">De: {msg.name} ({msg.email}) - le {new Date(msg.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${msg.status === 'new' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                        {msg.status === 'new' ? 'Nouveau' : 'Traité'}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap">{msg.content}</p>
                    {msg.status === 'new' && (
                      <div className="mt-4 flex space-x-2">
                        <button 
                          onClick={async () => {
                            await updateDoc(doc(db, 'messages', msg.id), { status: 'treated' });
                            setMessages(messages.map(m => m.id === msg.id ? { ...m, status: 'treated' } : m));
                          }} 
                          className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
                        >
                          Marquer comme traité
                        </button>
                        <a href={`mailto:${msg.email}?subject=RE: ${msg.subject}`} className="border border-blue-600 text-blue-600 px-3 py-1 text-sm rounded hover:bg-blue-50">
                          Répondre par email
                        </a>
                      </div>
                    )}
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
