import React, { useState, useEffect, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import type { Page, Lead, Buyer, DeliveryLog, UserProfile } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Auth from './components/pages/Auth';
import Dashboard from './components/pages/Dashboard';
import Leads from './components/pages/Leads';
import Buyers from './components/pages/Buyers';
import LeadDelivery from './components/pages/LeadDelivery';
import Analytics from './components/pages/Analytics';
import Settings from './components/pages/Settings';
import NewBuyerModal from './components/NewBuyerModal';
import EditLeadModal from './components/EditLeadModal';
import ConfirmationModal from './components/ConfirmationModal';
import UserModal from './components/UserModal';
import UpdateLeadsSentModal from './components/UpdateLeadsSentModal';

const BuyerLeadsModal: React.FC<{buyer: Buyer; leads: Lead[]; deliveryLogs: DeliveryLog[]; onClose: () => void;}> = ({ buyer, leads, deliveryLogs, onClose }) => {
    const [qualificationFilter, setQualificationFilter] = useState<'All' | 'Qualified' | 'Not Qualified'>('All');
    const buyerLeads = React.useMemo(() => {
        const deliveredLogEntries = deliveryLogs.filter(log => log.buyer_id === buyer.id && log.status === 'Success');
        const leadMap = new Map(leads.map(lead => [lead.id, lead]));
        return deliveredLogEntries.map(log => leadMap.get(log.lead_id)).filter((lead): lead is Lead => lead !== undefined)
            .filter(lead => {
                if (qualificationFilter === 'All') return true;
                return lead.status === qualificationFilter;
            })
            .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
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
                                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{lead.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{`${lead.street}, ${lead.city}, ${lead.state} ${lead.zip_code}`}</td>
                                    <td className="px-6 py-4">{lead.source}</td>
                                    <td className="px-6 py-4">{new Date(lead.created_at!).toLocaleDateString()}</td>
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
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [deliveryLog, setDeliveryLog] = useState<DeliveryLog[]>([]);
  
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingBuyerLeads, setViewingBuyerLeads] = useState<Buyer | null>(null);
  const [editingBuyerLeadCount, setEditingBuyerLeadCount] = useState<Buyer | null>(null);
  
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [selectedBuyerIds, setSelectedBuyerIds] = useState<Set<string>>(new Set());
  const [deleteConfirmation, setDeleteConfirmation] = useState<{isOpen: boolean; itemType: string; count: number; onConfirm: () => void;}>
    ({ isOpen: false, itemType: 'item', count: 0, onConfirm: () => {} });

  const loadData = useCallback(async (user: SupabaseUser) => {
    try {
      const [
          { data: profilesData, error: profilesError },
          { data: leadsData, error: leadsError },
          { data: buyersData, error: buyersError },
          { data: logsData, error: logsError }
      ] = await Promise.all([
          supabase!.from('profiles').select('*'),
          supabase!.from('leads').select('*'),
          supabase!.from('buyers').select('*'),
          supabase!.from('delivery_logs').select('*')
      ]);

      if (profilesError) throw profilesError;
      if (leadsError) throw leadsError;
      if (buyersError) throw buyersError;
      if (logsError) throw logsError;
      
      const userProfile = profilesData.find(p => p.id === user.id);
      setCurrentUser(userProfile || null);

      setUsers(profilesData as UserProfile[]);
      setLeads(leadsData as Lead[]);
      setBuyers(buyersData as Buyer[]);
      setDeliveryLog(logsData as DeliveryLog[]);

    } catch (error) {
      console.error("Failed to load data from Supabase:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
            await loadData(session.user);
        } else {
            setIsLoading(false);
        }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        if (session?.user) {
            setIsLoading(true);
            await loadData(session.user);
        } else {
            setCurrentUser(null);
        }
    });

    return () => authListener.subscription.unsubscribe();
  }, [loadData]);
  
  const handleSimulateWebhook = async () => {
     try {
        const response = await fetch(`/api/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Simulated Lead",
                email: `simulated-${Date.now()}@example.com`,
                phone: "(555) 555-5555",
                source: "Internal Simulation",
                status: "Qualified",
                address: "123 Awesome St, Austin, TX 78701"
            })
        });
        if (!response.ok) throw new Error('Webhook simulation failed.');
        alert('Webhook simulated successfully! Data will refresh.');
        if (session?.user) await loadData(session.user);
    } catch (error) {
        console.error("Error simulating webhook:", error);
        alert("Failed to simulate webhook.");
    }
  };

  const handleSaveBuyer = async (buyerToSave: Buyer) => {
    const { data, error } = await (editingBuyer
        ? supabase!.from('buyers').update(buyerToSave).eq('id', editingBuyer.id)
        : supabase!.from('buyers').insert({ ...buyerToSave, user_id: session?.user?.id })
    );
    if (error) alert(error.message);
    else if (session?.user) await loadData(session.user);
    
    setIsBuyerModalOpen(false);
    setEditingBuyer(null);
  };

  const handleSaveLead = async (updatedLead: Lead) => {
      const { error } = await supabase!.from('leads').update(updatedLead).eq('id', updatedLead.id);
      if (error) alert(error.message);
      else if (session?.user) await loadData(session.user);
      setEditingLead(null);
  };

  const handleSaveUser = async (userToSave: UserProfile) => {
    // Note: User creation is handled by Supabase Auth. This only updates profile.
    if (editingUser) {
        const { error } = await supabase!.from('profiles').update({ full_name: userToSave.full_name, role: userToSave.role }).eq('id', editingUser.id);
        if (error) alert(error.message);
        else if (session?.user) await loadData(session.user);
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
  };
  
  const handleDeleteSelectedLeads = () => {
    setDeleteConfirmation({ isOpen: true, itemType: 'lead', count: selectedLeadIds.size, onConfirm: async () => {
        const ids = Array.from(selectedLeadIds);
        const { error } = await supabase!.from('leads').delete().in('id', ids);
        if (error) alert(error.message);
        else if (session?.user) {
            setSelectedLeadIds(new Set());
            await loadData(session.user);
        }
        setDeleteConfirmation({ isOpen: false, itemType: '', count: 0, onConfirm: () => {} });
    }});
  };
  
  const handleDeleteSelectedBuyers = () => {
      setDeleteConfirmation({ isOpen: true, itemType: 'buyer', count: selectedBuyerIds.size, onConfirm: async () => {
          const ids = Array.from(selectedBuyerIds);
          const { error } = await supabase!.from('buyers').delete().in('id', ids);
          if (error) alert(error.message);
          else if (session?.user) {
              setSelectedBuyerIds(new Set());
              await loadData(session.user);
          }
          setDeleteConfirmation({ isOpen: false, itemType: '', count: 0, onConfirm: () => {} });
      }});
  };
  
  const handleUpdateBuyerLeadsSent = async (buyerId: string, newCount: number) => {
      const { error } = await supabase!.from('buyers').update({ leads_sent_this_month: newCount }).eq('id', buyerId);
      if (error) alert(error.message);
      else if (session?.user) await loadData(session.user);
      setEditingBuyerLeadCount(null);
  };

  if (!supabase) {
    return (
        <div className="flex items-center justify-center min-h-screen text-red-400 text-center p-8 bg-slate-900">
            <div>
                <h2 className="text-2xl font-bold mb-4">Application Initialization Failed</h2>
                <p className="text-slate-300">Could not connect to the backend service. Please ensure that the Supabase URL and Key are configured correctly in the Vercel environment variables.</p>
            </div>
        </div>
    );
  }

  if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen"><p>Loading application...</p></div>;
  }
  
  if (!session) {
      return <Auth />;
  }

  return (
    <div className="flex bg-slate-900 text-white min-h-screen font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 ml-64">
        <Header title={activePage} user={currentUser} onLogout={() => supabase.auth.signOut()} />
        <div className="p-8">
          {
            {
              'dashboard': <Dashboard buyers={buyers} />,
              'leads': <Leads leads={leads} onEditLead={setEditingLead} selectedLeadIds={selectedLeadIds} onSelectionChange={(id, sel) => setSelectedLeadIds(p => {const n=new Set(p); sel?n.add(id):n.delete(id); return n;})} onSelectAll={(sel) => setSelectedLeadIds(sel ? new Set(leads.filter(l=>l.id).map(l=>l.id!)) : new Set())} onDeleteSelected={handleDeleteSelectedLeads} />,
              'buyers': <Buyers buyers={buyers} onOpenModal={(b) => { setEditingBuyer(b); setIsBuyerModalOpen(true); }} onViewDetails={setViewingBuyerLeads} onUpdateLeadsSent={setEditingBuyerLeadCount} selectedBuyerIds={selectedBuyerIds} onSelectionChange={(id, sel) => setSelectedBuyerIds(p => {const n=new Set(p); sel?n.add(id):n.delete(id); return n;})} onSelectAll={(sel) => setSelectedBuyerIds(sel ? new Set(buyers.filter(b=>b.id).map(b=>b.id!)) : new Set())} onDeleteSelected={handleDeleteSelectedBuyers}/>,
              'delivery': <LeadDelivery deliveryLog={deliveryLog} leads={leads} buyers={buyers} />,
              'analytics': <Analytics />,
              'settings': <Settings onSimulateWebhook={handleSimulateWebhook} users={users} onOpenUserModal={(u) => { setEditingUser(u); setIsUserModalOpen(true); }} />,
            }[activePage]
          }
        </div>
      </main>
      {isBuyerModalOpen && <NewBuyerModal buyer={editingBuyer} onClose={() => {setEditingBuyer(null); setIsBuyerModalOpen(false);}} onSave={handleSaveBuyer}/>}
      {isUserModalOpen && <UserModal user={editingUser} onClose={() => {setEditingUser(null); setIsUserModalOpen(false);}} onSave={handleSaveUser} />}
      {viewingBuyerLeads && <BuyerLeadsModal buyer={viewingBuyerLeads} leads={leads} deliveryLogs={deliveryLog} onClose={() => setViewingBuyerLeads(null)}/>}
      {editingLead && <EditLeadModal lead={editingLead} onClose={() => setEditingLead(null)} onSave={handleSaveLead} />}
      {deleteConfirmation.isOpen && (<ConfirmationModal isOpen={deleteConfirmation.isOpen} onClose={() => setDeleteConfirmation(p=>({...p,isOpen:false}))} onConfirm={deleteConfirmation.onConfirm} title={`Delete ${deleteConfirmation.itemType}(s)`} message={`Are you sure you want to delete ${deleteConfirmation.count} ${deleteConfirmation.itemType}(s)? This action cannot be undone.`}/>)}
      {editingBuyerLeadCount && <UpdateLeadsSentModal buyer={editingBuyerLeadCount} onClose={() => setEditingBuyerLeadCount(null)} onSave={handleUpdateBuyerLeadsSent}/>}
    </div>
  );
};

export default App;