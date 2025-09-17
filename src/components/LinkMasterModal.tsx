
import React, { useState, useMemo, useEffect } from 'react';
import { Incident } from '../lib/mockData.ts';
import { useTranslation } from '../lib/i18n.tsx';
import CloseIcon from './icons/CloseIcon.tsx';
import SearchIcon from './icons/SearchIcon.tsx';

interface LinkMasterModalProps {
  isOpen?: boolean; // Controlled from parent
  onClose: () => void;
  onLink: (childId: string, masterId: string) => void;
  incidents: Incident[];
  currentIncident: Incident;
}

const LinkMasterModal: React.FC<LinkMasterModalProps> = ({
  onClose,
  onLink,
  incidents,
  currentIncident
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaster, setSelectedMaster] = useState<string | null>(null);

   useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const potentialMasters = useMemo(() => {
    return incidents.filter(inc => 
        !inc.masterIncidentId && // Can't be a child itself
        inc.id !== currentIncident.id && // Can't link to itself
        (!searchTerm || inc.title.toLowerCase().includes(searchTerm.toLowerCase()) || inc.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [incidents, currentIncident, searchTerm]);

  const handleLinkClick = () => {
    if (selectedMaster) {
        onLink(currentIncident.id, selectedMaster);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t('linkMasterModal.title')}</h2>
            <p className="text-sm text-slate-500">{t('linkMasterModal.subtitle', { replacements: { id: currentIncident.id } })}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
            <CloseIcon className="h-6 w-6 text-slate-500" />
          </button>
        </header>

        <main className="p-6 space-y-4">
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('linkMasterModal.searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>

            <div className="max-h-80 overflow-y-auto bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
                {potentialMasters.length > 0 ? (
                     potentialMasters.map((inc) => (
                        <button
                            key={inc.id}
                            onClick={() => setSelectedMaster(inc.id === selectedMaster ? null : inc.id)}
                            className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${
                                selectedMaster === inc.id
                                ? 'bg-cyan-100 ring-2 ring-cyan-500'
                                : 'bg-white hover:bg-slate-100'
                            }`}
                        >
                            <p className="font-semibold text-slate-800">{inc.title}</p>
                            <p className="text-sm text-slate-500">{inc.id} - {t('triagePage.severity')}: {t(`severity.${inc.severity.toLowerCase()}`)}</p>
                        </button>
                    ))
                ) : (
                    <p className="text-slate-500 text-center py-8">{t('linkMasterModal.noResults')}</p>
                )}
            </div>
        </main>
        <footer className="flex justify-end items-center p-4 bg-slate-50 rounded-b-2xl space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors text-slate-800 font-medium"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleLinkClick}
            disabled={!selectedMaster}
            className="px-4 py-2 rounded-lg transition-colors text-white font-medium bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('linkMasterModal.linkButton')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LinkMasterModal;