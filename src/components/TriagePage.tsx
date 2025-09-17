
import React, { useState, useMemo } from 'react';
import SearchIcon from './icons/SearchIcon.tsx';
import { Incident } from '../lib/mockData.ts';
import { useTranslation } from '../lib/i18n.tsx';

interface TriagePageProps {
  countdown: number;
  incidents: Incident[];
  onTimeUp: () => void;
  onCreateNew: () => void;
  onLinkToMaster: (id: string) => void;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const TriagePage: React.FC<TriagePageProps> = ({ countdown, incidents, onCreateNew, onLinkToMaster }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaster, setSelectedMaster] = useState<string | null>(null);
  const { t } = useTranslation();

  const filteredIncidents = useMemo(() => {
    if (!searchTerm) return [];
    return incidents.filter(
      (inc) =>
        inc.status === 'ongoing' && !inc.masterIncidentId &&
        (inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inc.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, incidents]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{t('triagePage.title')}</h2>
          <p className="text-slate-500 mt-1">{t('triagePage.subtitle')}</p>
        </div>
        <div className={`text-right p-3 rounded-lg transition-all duration-300 ${countdown <= 300 ? 'bg-red-100 ring-2 ring-red-400 animate-pulse' : ''}`}>
          <div className="text-sm text-slate-500">{t('common.timeRemaining')}</div>
          <div className={`text-2xl font-bold ${countdown <= 300 ? 'text-red-600' : 'text-cyan-600'}`}>
            {formatTime(countdown)}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="search-master" className="block text-sm font-medium text-slate-600 mb-2">
          {t('triagePage.searchLabel')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            id="search-master"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('triagePage.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-300"
          />
        </div>
      </div>

      <div className="flex-grow bg-slate-50 rounded-lg p-4 border border-slate-200 min-h-[200px] overflow-y-auto">
        <h3 className="text-slate-800 font-semibold mb-3">{t('triagePage.matchingIncidents')}</h3>
        {searchTerm && filteredIncidents.length > 0 ? (
          <ul className="space-y-2">
            {filteredIncidents.map((inc) => (
              <li key={inc.id}>
                <button
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
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 text-center py-8">
            {searchTerm ? t('triagePage.noResults') : t('triagePage.startTyping')}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-4">
        <button
          onClick={() => onLinkToMaster(selectedMaster!)}
          disabled={!selectedMaster}
          className="w-full flex-1 justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('triagePage.linkToMaster')}
        </button>
        <button
          onClick={onCreateNew}
          className="w-full flex-1 justify-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-slate-500 transition-all duration-300"
        >
          {t('triagePage.createNew')}
        </button>
      </div>
    </div>
  );
};

export default TriagePage;