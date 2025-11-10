import React, { useState, useEffect, useCallback } from 'react';
import * as db from './db';
import type { Page, Lead, Buyer, DeliveryLog, DailyLeads, User } from './types';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/pages/Dashboard';
import Leads from './components/pages/Leads';
import Buyers from './components/pages/Buyers';
import LeadDelivery from './components/pages/LeadDelivery';
import Analytics from './components/pages/Analytics';
import Settings from './components/pages/Settings';
import Login from './components/pages/Login';

import NewBuyerModal from './components/NewBuyerModal';
import EditLeadModal from './components/EditLeadModal';
import ConfirmationModal from './components/ConfirmationModal';
import UserModal from './components/UserModal';
import WebhookSimulationModal from './components/WebhookSimulationModal';
import UpdateLeadsSentModal from './components/UpdateLeadsSentModal';


const BuyerLeadsModal: React.FC<{buyer: Buyer; leads: Lead[]; deliveryLogs: DeliveryLog[]; onClose: () => void;}> = ({ buyer, leads, deliveryLogs, onClose }) => {
    const [qualificationFilter, setQualificationFilter] = useState<'All' | 'Qualified' | 'Not Qualified'>('All');
    const buyerLeads = React.useMemo(() => {
        const deliveredLogEntries = deliveryLogs.filter(log => log.buyerId === buyer.id && log.status === 'Success');
        const leadMap = new Map(leads.map(lead => [lead.id, lead]));
        return deliveredLogEntries.map(log => leadMap.get(log.leadId)).filter((lead): lead is Lead => lead !== undefined)
            .filter(lead => {
                if (qualificationFilter === 'All') return true;
                return lead.status === qualificationFilter;
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [buyer, leads, deliveryLogs, qualificationFilter]);
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Leads for {buyer.name} ({buyerLeads.length})</h2>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                   <table className="w-full text-sm text-left text-slate-400">
                         <thead className="text-xs text-slate-400 uppercase bg-slate-700/50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Address</th>
                                <th scope="col" className="px-6 py-3">Source</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {buyerLeads.map(lead => (
                                <tr key={lead.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-medium text-white">{lead.name}</td>
                                    <td className="px-6 py-4">{`${lead.street}, ${lead.city}, ${lead.state} ${lead.zipCode}`}</td>
                                    <td className="px-6 py-4">{lead.source}</td>
                                    <td className="px-6 py-4">{new Date(lead.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-700 flex justify-end">
                    <button onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-500 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [deliveryLog, setDeliveryLog] = useState<DeliveryLog[]>([]);
  const [dailyLeads, setDailyLeads] = useState<DailyLeads[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingBuyerLeads, setViewingBuyerLeads] = useState<Buyer | null>(null);
  const [editingBuyerLeadCount, setEditingBuyerLeadCount] = useState<Buyer | null>(null);
  
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [selectedBuyerIds, setSelectedBuyerIds] = useState<Set<string>>(new Set());
  const [deleteConfirmation, setDeleteConfirmation] = useState<{isOpen: boolean; itemType: string; count: number; onConfirm: () => void;}>
    ({ isOpen: false, itemType: 'item', count: 0, onConfirm: () => {} });

  const loadAllData = useCallback(async () => {
    try {
        await db.initDB();
        const [leads, buyers, logs, daily, users, user] = await Promise.all([
            db.getAllLeads(),
            db.getAllBuyers(),
            db.getDeliveryLog(),
            db.getDailyLeads(),
            db.getAllUsers(),
            db.getCurrentUser()
        ]);
        setLeads(leads);
        setBuyers(buyers);
        setDeliveryLog(logs);
        setDailyLeads(daily);
        setUsers(users);
        setCurrentUser(user); // Set current user from DB
    } catch (error) {
        console.error("Failed to load initial data:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);
  
  const handleSimulateWebhook = async () => {
    // This now just opens the simulation modal
    setIsWebhookModalOpen(true);
  };
  
  const handleProcessWebhookPayload = async (payload: string) => {
    try {
        const url = new URL('/api/v1/webhooks/in/u-AbCdEfG12345', window.location.origin);
        await fetch(url.toString(), {
            method: 'POST',
            body: payload,
            headers: { 'Content-Type': 'application/json' },
        });
        setIsWebhookModalOpen(false);
        // Give SW time to process
        setTimeout(() => {
            alert(`A new lead has been received and is being processed! The UI will update shortly.`);
            loadAllData();
        }, 1000);
    } catch (error) {
        alert("Failed to process webhook payload. Please ensure it is valid JSON.");
    }
  };

  const handleSaveBuyer = async (buyerToSave: Omit<Buyer, 'id'>) => {
    if (editingBuyer) {
        await db.updateBuyer({ ...editingBuyer, ...buyerToSave });
    } else {
        await db.addBuyer(buyerToSave);
    }
    loadAllData();
    setIsBuyerModalOpen(false);
    setEditingBuyer(null);
  };

  const handleSaveLead = async (updatedLead: Lead) => {
      await db.updateLead(updatedLead);
      loadAllData();
      setEditingLead(null);
  };

  const handleAddLead = async (leadToAdd: Omit<Lead, 'id'>) => {
      await db.addLead(leadToAdd);
      loadAllData();
      setEditingLead(null);
  };

  const handleSaveUser = async (userToSave: Omit<User, 'id'>, isNew: boolean) => {
    if (isNew) {
        await db.addUser(userToSave);
    } else {
        await db.updateUser({ ...editingUser, ...userToSave } as User);
    }
    loadAllData();
    setIsUserModalOpen(false);
    setEditingUser(null);
  };
  
  const handleDeleteSelectedLeads = () => {
    setDeleteConfirmation({ isOpen: true, itemType: 'lead', count: selectedLeadIds.size, onConfirm: async () => {
        await db.deleteLeads(Array.from(selectedLeadIds));
        setSelectedLeadIds(new Set());
        loadAllData();
        setDeleteConfirmation({ isOpen: false, itemType: '', count: 0, onConfirm: () => {} });
    }});
  };
  
  const handleDeleteSelectedBuyers = () => {
      setDeleteConfirmation({ isOpen: true, itemType: 'buyer', count: selectedBuyerIds.size, onConfirm: async () => {
          await db.deleteBuyers(Array.from(selectedBuyerIds));
          setSelectedBuyerIds(new Set());
          loadAllData();
          setDeleteConfirmation({ isOpen: false, itemType: '', count: 0, onConfirm: () => {} });
      }});
  };
  
  const handleUpdateBuyerLeadsSent = async (buyerId: string, newCount: number) => {
      await db.updateBuyerLeadsSent(buyerId, newCount);
      loadAllData();
      setEditingBuyerLeadCount(null);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    db.setCurrentUser(user.id);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    db.clearCurrentUser();
  };

  if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen bg-slate-900"><p className="text-white">Loading database...</p></div>;
  }
  
  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="flex bg-slate-900 text-white min-h-screen font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 ml-64">
        <Header title={activePage} user={currentUser} onLogout={handleLogout} />
        <div className="p-8">
          {
            {
              'dashboard': <Dashboard leads={leads} buyers={buyers} dailyLeads={dailyLeads} />,
              'leads': <Leads leads={leads} onEditLead={setEditingLead} onAddLead={() => setEditingLead({} as Lead)} selectedLeadIds={selectedLeadIds} onSelectionChange={(id, sel) => setSelectedLeadIds(p => {const n=new Set(p); sel?n.add(id):n.delete(id); return n;})} onSelectAll={(sel) => setSelectedLeadIds(sel ? new Set(leads.map(l=>l.id)) : new Set())} onDeleteSelected={handleDeleteSelectedLeads} />,
              'buyers': <Buyers buyers={buyers} onOpenModal={(b) => { setEditingBuyer(b); setIsBuyerModalOpen(true); }} onViewDetails={setViewingBuyerLeads} onUpdateLeadsSent={setEditingBuyerLeadCount} selectedBuyerIds={selectedBuyerIds} onSelectionChange={(id, sel) => setSelectedBuyerIds(p => {const n=new Set(p); sel?n.add(id):n.delete(id); return n;})} onSelectAll={(sel) => setSelectedBuyerIds(sel ? new Set(buyers.map(b=>b.id)) : new Set())} onDeleteSelected={handleDeleteSelectedBuyers}/>,
              'delivery': <LeadDelivery deliveryLog={deliveryLog} leads={leads} buyers={buyers} />,
              'analytics': <Analytics />,
              'settings': <Settings onSimulateWebhook={handleSimulateWebhook} users={users} currentUser={currentUser} onOpenUserModal={(u) => { setEditingUser(u); setIsUserModalOpen(true); }} />,
            }[activePage]
          }
        </div>
      </main>
      {isBuyerModalOpen && <NewBuyerModal buyer={editingBuyer} onClose={() => {setEditingBuyer(null); setIsBuyerModalOpen(false);}} onSave={handleSaveBuyer}/>}
      {isUserModalOpen && <UserModal user={editingUser} onClose={() => {setEditingUser(null); setIsUserModalOpen(false);}} onSave={handleSaveUser} />}
      {viewingBuyerLeads && <BuyerLeadsModal buyer={viewingBuyerLeads} leads={leads} deliveryLogs={deliveryLog} onClose={() => setViewingBuyerLeads(null)}/>}
      {editingLead && <EditLeadModal lead={editingLead} onClose={() => setEditingLead(null)} onSave={handleSaveLead} onAdd={handleAddLead} />}
      {deleteConfirmation.isOpen && (<ConfirmationModal isOpen={deleteConfirmation.isOpen} onClose={() => setDeleteConfirmation(p=>({...p,isOpen:false}))} onConfirm={deleteConfirmation.onConfirm} title={`Delete ${deleteConfirmation.itemType}(s)`} message={`Are you sure you want to delete ${deleteConfirmation.count} ${deleteConfirmation.itemType}(s)? This action cannot be undone.`}/>)}
      {isWebhookModalOpen && <WebhookSimulationModal onClose={() => setIsWebhookModalOpen(false)} onProcess={handleProcessWebhookPayload} />}
      {editingBuyerLeadCount && <UpdateLeadsSentModal buyer={editingBuyerLeadCount} onClose={() => setEditingBuyerLeadCount(null)} onSave={handleUpdateBuyerLeadsSent}/>}
    </div>
  );
};

export default App;