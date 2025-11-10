import React, { useState } from 'react';

interface WebhookSimulationModalProps {
    onClose: () => void;
    onProcess: (payload: string) => void;
}

const examplePayload = `{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "(555) 111-2222",
  "source": "Manual Test",
  "status": "Qualified",
  "notes": ["Called and left a voicemail."],
  "address": "789 Market St, San Francisco, CA 94103"
}`;

const WebhookSimulationModal: React.FC<WebhookSimulationModalProps> = ({ onClose, onProcess }) => {
    const [payload, setPayload] = useState(examplePayload);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onProcess(payload);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-white">Simulate Inbound Webhook</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-slate-400">
                            Paste the JSON payload you would receive from your lead source below and click "Process Lead" to simulate a real-time webhook.
                        </p>
                        <div>
                             <label htmlFor="payload" className="block text-sm font-medium text-slate-400 mb-1">JSON Payload</label>
                             <textarea
                                id="payload"
                                value={payload}
                                onChange={(e) => setPayload(e.target.value)}
                                rows={10}
                                className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                                placeholder="Enter JSON payload here..."
                             />
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-700 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-500 transition-colors">
                            Cancel
                        </button>
                         <button type="submit" className="bg-brand-green text-white font-bold py-2 px-5 rounded-lg hover:bg-emerald-500 transition-colors">
                            Process Lead
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WebhookSimulationModal;