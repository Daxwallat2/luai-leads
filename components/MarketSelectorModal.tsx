import React, { useState, useMemo } from 'react';
import { US_STATES } from '../data/locations';

interface MarketSelectorModalProps {
    initialSelectedMarkets: string[];
    onClose: () => void;
    onSave: (selectedMarkets: string[]) => void;
}

const MarketSelectorModal: React.FC<MarketSelectorModalProps> = ({ initialSelectedMarkets, onClose, onSave }) => {
    const [selectedMarkets, setSelectedMarkets] = useState<Set<string>>(new Set(initialSelectedMarkets));
    const [searchTerm, setSearchTerm] = useState('');

    const handleStateToggle = (state: string) => {
        const newSelection = new Set(selectedMarkets);
        if (newSelection.has(state)) {
            newSelection.delete(state);
        } else {
            newSelection.add(state);
        }
        setSelectedMarkets(newSelection);
    };

    const handleSelectAll = () => {
        setSelectedMarkets(new Set(US_STATES));
    };

    const handleDeselectAll = () => {
        setSelectedMarkets(new Set());
    };

    const filteredStates = useMemo(() => {
        return US_STATES.filter(state => 
            state.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Select Markets (States)</h2>
                    <div className="flex gap-2">
                         <button onClick={handleSelectAll} className="text-sm bg-slate-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-slate-500 transition-colors">
                            Select All
                         </button>
                         <button onClick={handleDeselectAll} className="text-sm bg-slate-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-slate-500 transition-colors">
                            Deselect All
                         </button>
                    </div>
                </div>
                <div className="p-4 border-b border-slate-700">
                    <input
                        type="text"
                        placeholder="Search states..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-green"
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {filteredStates.map(state => (
                             <label key={state} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 rounded bg-slate-600 border-slate-500 text-brand-green focus:ring-brand-green"
                                    checked={selectedMarkets.has(state)}
                                    onChange={() => handleStateToggle(state)}
                                />
                                <span className="text-slate-300 text-sm">{state}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-slate-700 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-500 transition-colors">
                        Cancel
                    </button>
                    <button type="button" onClick={() => onSave(Array.from(selectedMarkets))} className="bg-brand-green text-white font-bold py-2 px-5 rounded-lg hover:bg-emerald-500 transition-colors">
                        Save ({selectedMarkets.size}) Markets
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketSelectorModal;