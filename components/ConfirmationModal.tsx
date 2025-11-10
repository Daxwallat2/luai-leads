import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                    <p className="text-slate-400 mb-6">{message}</p>
                    <div className="flex justify-end gap-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="bg-slate-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={onConfirm} 
                            className="bg-red-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-red-500 transition-colors"
                        >
                            Confirm Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;