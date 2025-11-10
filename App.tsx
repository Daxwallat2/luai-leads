import React, { useState, useCallback, useEffect } from 'react';
import type { Page, Lead, Buyer, DeliveryLog, User } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
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
        const deliveredLogEntries = deliveryLogs.filter(log => log.buyerId === buyer.id && log.status === 'Success');
        const leadMap = new Map(leads.map(lead => [lead.id, lead]));
        return deliveredLogEntries.map(log => leadMap.get(log.leadId)).filter((lead): lead is Lead => lead !== undefined)
            .filter(lead => {
                if (qualificationFilter === 'All') return true;
                const isQualified = lead.status === 'Qualified';
                if (qualificationFilter === 'Qualified') return isQualified;
                if (qualificationFilter === 'Not Qualified') return !isQualified;
                return true;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [buyer, leads, deliveryLogs, qualificationFilter]);
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Leads for {buyer.name} ({buyerLeads.length})</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-slate-400">Filter by:</span>
                            <button onClick={() => setQualificationFilter('All')} className={`text-xs px-3 py-1 rounded-full ${qualificationFilter === 'All' ? 'bg-brand-green text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>All</button>
                            <button onClick={() => setQualificationFilter('Qualified')} className={`text-xs px-3 py-1 rounded-full ${qualificationFilter === 'Qualified' ? 'bg-brand-green text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Qualified</button>
                            <button onClick={() => setQualificationFilter('Not Qualified')} className={`text-xs px-3 py-1 rounded-full ${qualificationFilter === 'Not Qualified' ? 'bg-brand-green text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Not Qualified</button>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    {buyerLeads.length > 0 ? (
                        <table className="w-full text-sm text-left text-slate-400">
                             <thead className="text-xs text-slate-400 uppercase bg-slate-700/50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th><th scope="col" className="px-6 py-3">Contact</th>
                                    <th scope="col" className="px-6 py-3">Address</th><th scope="col" className="px-6 py-3">Source</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {buyerLeads.map(lead => (
                                    <tr key={lead.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{lead.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><div><span>{lead.email}</span><span className="text-slate-400 text-xs">{lead.phone}</span></div></td>
                                        <td className="px-6 py-4 whitespace-nowrap">{`${lead.street}, ${lead.city}, ${lead.state} ${lead.zipCode}`}</td>
                                        <td className="px-6 py-4">{lead.source}</td><td className="px-6 py-4">{lead.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (<div className="text-center py-16"><p className="text-slate-400">No leads match the current filter.</p></div>)}
                </div>
                <div className="p-4 border-t border-slate-700 flex justify-end">
                    <button onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-500 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'u1',
    name: 'Dax',
    email: 'Dax@leadsupai.com',
    role: 'Admin',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [deliveryLog, setDeliveryLog] = useState<DeliveryLog[]>([]);
  
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingBuyerLeads, setViewingBuyerLeads] = useState<Buyer | null>(null);
  const [editingBuyerLeadCount, setEditingBuyerLeadCount] = useState<Buyer | null>(null);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [selectedBuyerIds, setSelectedBuyerIds] = useState<Set<string>>(new Set());
  const [deleteConfirmation, setDeleteConfirmation] = useState<{isOpen: boolean; itemType: string; count: number; onConfirm: () => void;}>
    ({ isOpen: false, itemType: 'item', count: 0, onConfirm: () => {} });
  
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, leadsRes, buyersRes, logsRes] = await Promise.all([
        fetch('/api/users'), fetch('/api/leads'), fetch('/api/buyers'), fetch('/api/delivery-log')
      ]);
      const [loadedUsers, loadedLeads, loadedBuyers, loadedLogs] = await Promise.all([
        usersRes.json(), leadsRes.json(), buyersRes.json(), logsRes.json()
      ]);
      setUsers(loadedUsers);
      setLeads(loadedLeads);
      setBuyers(loadedBuyers);
      setDeliveryLog(loadedLogs);
    } catch (error) {
      console.error("Failed to load data from API:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
      setCurrentUser(null);
      // Reset state on logout
      setUsers([]);
      setLeads([]);
      setBuyers([]);
      setDeliveryLog([]);
      setActivePage('dashboard');
      setSelectedLeadIds(new Set());
      setSelectedBuyerIds(new Set());
  };

  const handleCsvUpload = (file: File) => {
    setIsProcessingCsv(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const dataRows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          return headers.reduce((obj, header, index) => {
            const key = header.toLowerCase().replace(/ \w/g, m => m[1].toUpperCase());
            obj[key] = values[index];
            return obj;
          }, {} as Record<string, string>);
        });
        
        // Sequentially send each lead to the webhook endpoint
        for (const leadData of dataRows) {
            await fetch(`/api/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });
        }
        alert(`${dataRows.length} leads submitted for processing. The UI will refresh shortly.`);
        await loadData(); // Refresh data after processing
      } catch (error) {
        console.error("Error processing CSV file:", error);
        alert("Failed to process CSV file.");
      } finally {
        setIsProcessingCsv(false);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveBuyer = async (buyerToSave: Buyer) => {
    const isEditing = !!buyerToSave.id;
    const url = isEditing ? `/api/buyers?id=${buyerToSave.id}` : '/api/buyers';
    const method = isEditing ? 'PUT' : 'POST';

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buyerToSave)
    });
    
    await loadData();
    setIsBuyerModalOpen(false);
    setEditingBuyer(null);
  };

  const handleSaveLead = async (updatedLead: Lead) => {
      await fetch(`/api/leads?id=${updatedLead.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedLead)
      });
      await loadData();
      setEditingLead(null);
  };

  const handleSaveUser = async (userToSave: User) => {
    const isEditing = !!userToSave.id;
    const url = isEditing ? `/api/users?id=${userToSave.id}` : '/api/users';
    const method = isEditing ? 'PUT' : 'POST';

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userToSave)
    });

    await loadData();
    setIsUserModalOpen(false);
    setEditingUser(null);
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (users.length <= 1) { alert("You cannot delete the only user."); return; }
    if (currentUser?.id === userId) { alert("You cannot delete yourself."); return; }
    setDeleteConfirmation({ isOpen: true, itemType: 'user', count: 1, onConfirm: async () => {
        await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
        await loadData();
        setDeleteConfirmation({ isOpen: false, itemType: '', count: 0, onConfirm: () => {} });
    }});
  };

  const handleDeleteSelectedLeads = () => {
    setDeleteConfirmation({ isOpen: true, itemType: 'lead', count: selectedLeadIds.size, onConfirm: async () => {
        await fetch(`/api/leads`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: Array.from(selectedLeadIds) })
        });
        setSelectedLeadIds(new Set());
        await loadData();
        setDeleteConfirmation({ isOpen: false, itemType: '', count: 0, onConfirm: () => {} });
    }});
  };
  
  const handleDeleteSelectedBuyers = () => {
      setDeleteConfirmation({ isOpen: true, itemType: 'buyer', count: selectedBuyerIds.size, onConfirm: async () => {
          await fetch(`/api/buyers`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: Array.from(selectedBuyerIds) })
          });
          setSelectedBuyerIds(new Set());
          await loadData();
          setDeleteConfirmation({ isOpen: false, itemType: '', count: 0, onConfirm: () => {} });
      }});
  };
  
  const handleSimulateMonthEnd = async () => {
    await fetch('/api/buyers/reset-monthly-counts', { method: 'POST' });
    await loadData();
    alert("Monthly lead counts for all buyers have been reset to 0.");
  };

  const handleSendTestLead = async (buyerId: string) => {
    const buyer = buyers.find(b => b.id === buyerId);
    if (!buyer || !buyer.webhookUrl) {
      alert("This buyer does not have a webhook URL configured.");
      return;
    }
    const testLeadPayload = {
      name: 'Test Lead', email: 'test.lead@example.com', phone: '(555) 000-0000',
      source: 'Internal Test', status: 'Not Qualified',
      address: '123 Test St, Testville, CA 90210', notes: ['This is a test lead.']
    };
    await fetch(`/api/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testLeadPayload)
    });
    alert(`Test lead sent to ${buyer.name}. Check the Delivery Log. The UI will refresh shortly.`);
    await loadData();
  };
  
  const handleUpdateBuyerLeadsSent = async (buyerId: string, newCount: number) => {
      const buyer = buyers.find(b => b.id === buyerId);
      if (buyer) {
        const updatedCount = Math.max(0, Math.min(buyer.monthlyCap, newCount));
        await fetch(`/api/buyers?id=${buyerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...buyer, leadsSentThisMonth: updatedCount })
        });
        await loadData();
      }
      setEditingBuyerLeadCount(null);
  };

  if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white"><p>Loading dashboard data...</p></div>;
  }
  
  const pageToRender = (activePage === 'settings' && currentUser?.role !== 'Admin') ? 'dashboard' : activePage;

  return (
    <div className="flex bg-slate-900 text-white min-h-screen font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} user={currentUser} />
      <main className="flex-1 ml-64">
        <Header title={pageToRender} user={currentUser} onLogout={handleLogout} />
        <div className="p-8">
          {
            {
              'dashboard': <Dashboard buyers={buyers} />,
              'leads': <Leads leads={leads} onCsvUpload={handleCsvUpload} onEditLead={setEditingLead} isProcessing={isProcessingCsv} selectedLeadIds={selectedLeadIds} onSelectionChange={(id, sel) => setSelectedLeadIds(p => {const n=new Set(p); sel?n.add(id):n.delete(id); return n;})} onSelectAll={(sel) => setSelectedLeadIds(sel ? new Set(leads.map(l=>l.id)) : new Set())} onDeleteSelected={handleDeleteSelectedLeads} />,
              'buyers': <Buyers buyers={buyers} onOpenModal={(b) => { setEditingBuyer(b); setIsBuyerModalOpen(true); }} onSimulateMonthEnd={handleSimulateMonthEnd} onViewDetails={setViewingBuyerLeads} onSendTestLead={handleSendTestLead} onUpdateLeadsSent={setEditingBuyerLeadCount} selectedBuyerIds={selectedBuyerIds} onSelectionChange={(id, sel) => setSelectedBuyerIds(p => {const n=new Set(p); sel?n.add(id):n.delete(id); return n;})} onSelectAll={(sel) => setSelectedBuyerIds(sel ? new Set(buyers.map(b=>b.id)) : new Set())} onDeleteSelected={handleDeleteSelectedBuyers}/>,
              'delivery': <LeadDelivery deliveryLog={deliveryLog} leads={leads} buyers={buyers} />,
              'analytics': <Analytics />,
              'settings': <Settings users={users} onOpenUserModal={(u) => { setEditingUser(u); setIsUserModalOpen(true); }} onDeleteUser={handleDeleteUser}/>,
            }[pageToRender]
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