
import React from 'react';
import { Incident, StepState, RemediationStep, Severity, IncidentStatus } from '../lib/mockData.ts';
import CloseIcon from './icons/CloseIcon.tsx';
import LinkIcon from './icons/LinkIcon.tsx';
import { useTranslation } from '../lib/i18n.tsx';

interface IncidentDetailModalProps {
  incident: Incident;
  onClose: () => void;
  onLinkToMaster: () => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
  <div className={className}>
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-base text-slate-800 font-medium">{value}</p>
  </div>
);

const StepDetail: React.FC<{ step: RemediationStep, state?: StepState }> = ({ step, state }) => {
    const { t } = useTranslation();
    const formatTimeSpent = (seconds: number) => {
        if (seconds < 60) return t('time.seconds', { replacements: { count: seconds } });
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return t('time.minutesSeconds', { replacements: { minutes: minutes, seconds: secs } });
    };

    return (
    <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
        <div className="flex justify-between items-start">
            <h5 className="font-bold text-slate-800 flex-1">{step.title}</h5>
            {state && (
                 <span className={`text-xs font-bold px-2 py-1 rounded-full ml-4 ${
                    state.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                 }`}>{t(`stepStatus.${state.status}`)}</span>
            )}
        </div>
        <p className="text-sm text-slate-500 mt-1 mb-3">{step.description}</p>
        {state && (
            <div className="space-y-3 text-sm border-t border-slate-200 pt-3 mt-3">
                <p><strong className="text-slate-500">{t('modal.timeSpent')}:</strong> {formatTimeSpent(state.timeSpent)}</p>
                {state.comment && <p><strong className="text-slate-500">{t('modal.comment')}:</strong> <span className="text-slate-600 whitespace-pre-wrap">{state.comment}</span></p>}
                {state.screenshot && (
                    <div>
                        <strong className="text-slate-500">{t('modal.attachment')}:</strong>
                        <img src={state.screenshot} alt={t('modal.attachmentAlt')} className="mt-2 rounded-md border border-slate-300 max-w-xs" />
                    </div>
                )}
            </div>
        )}
    </div>
)};


const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({ incident, onClose, onLinkToMaster }) => {
  const { t, language } = useTranslation();
  const handlePrint = () => {
    window.print();
  };
    
  const renderRemediationHistory = (inc: Incident, history: Incident['remediationHistory']) => {
    const incidentHistory = history?.[inc.id];
    if (!inc.steps || inc.steps.length === 0) return null;

    return (
        <div key={inc.id} className="space-y-3">
            <h4 className="text-md font-semibold text-cyan-700 border-b border-cyan-500/20 pb-1">
                {t('modal.remediationPlanFor')}: <span className="font-bold text-slate-800">{inc.title} ({inc.id})</span>
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {inc.steps.map(step => (
                  <StepDetail key={step.id} step={step} state={incidentHistory?.[step.id]} />
              ))}
            </div>
        </div>
    );
  };
  
  const severities: Record<Severity, string> = {
    Critical: t('severity.critical'),
    High: t('severity.high'),
    Medium: t('severity.medium'),
    Low: t('severity.low'),
  };

  const statuses: Record<IncidentStatus, string> = {
      ongoing: t('status.ongoing'),
      completed: t('status.completed'),
  }

  const canLink = !incident.masterIncidentId && (!incident.children || incident.children.length === 0);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 printable-area"
      onClick={onClose}
    >
      <style>{`
        @media print {
          body > * {
            display: none;
          }
          .printable-area, .printable-area > * {
            display: block !important;
          }
          .printable-content {
            box-shadow: none !important;
            border: none !important;
            height: 100vh;
            width: 100vw;
            max-height: none;
            border-radius: 0;
            background: #fff !important;
            color: #000 !important;
          }
          .printable-content .print-text-black {
             color: #000 !important;
          }
           .printable-content .print-text-black * {
            color: #000 !important;
             background-color: transparent !important;
          }
          .no-print {
            display: none !important;
          }
          .print-bg-white {
             background: #fff !important;
          }
        }
      `}</style>
      <div 
        className="bg-white/95 border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col printable-content"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200 flex-shrink-0 print-bg-white">
          <div className="print-text-black">
            <h2 className="text-2xl font-bold text-slate-800 ">{incident.title}</h2>
            <p className="text-sm font-mono text-cyan-600 ">{incident.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors no-print">
            <CloseIcon className="h-6 w-6 text-slate-500" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto space-y-6 print-text-black">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg">
            <DetailItem label={t('modal.status')} value={<span className={`px-2 py-1 text-sm rounded-full ${incident.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{statuses[incident.status]}</span>} />
            <DetailItem label={t('modal.severity')} value={<span className={`px-2 py-1 text-sm rounded-full ${
                    incident.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                    incident.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                    incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-sky-100 text-sky-700'
                }`}>{severities[incident.severity]}</span>} />
            <DetailItem label={t('modal.type')} value={incident.type} />
            <DetailItem label={t('modal.reporter')} value={`${incident.reporterName} (${incident.reporter})`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DetailItem label={t('modal.detectionTime')} value={new Date(incident.detectionTime).toLocaleString(language)} className="bg-slate-50 p-3 rounded-lg" />
              <DetailItem label={t('modal.responseSla')} value={new Date(incident.slaResponseDeadline).toLocaleString(language)} className="bg-slate-50 p-3 rounded-lg" />
              <DetailItem label={t('modal.resolutionSla')} value={new Date(incident.slaResolutionDeadline).toLocaleString(language)} className="bg-slate-50 p-3 rounded-lg" />
          </div>

          { (incident.masterIncidentId || (incident.children && incident.children.length > 0)) &&
            <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('modal.relationships')}</h3>
                {incident.masterIncidentId && <DetailItem label={t('modal.parentIncident')} value={incident.masterIncidentId} />}
                {incident.children && incident.children.length > 0 && (
                    <div>
                        <p className="text-sm text-slate-500">{t('modal.childIncidents')}</p>
                        <ul className="list-disc list-inside text-slate-800 font-mono text-sm">
                            {incident.children.map(c => <li key={c.id}>{c.id}: {c.title}</li>)}
                        </ul>
                    </div>
                )}
            </div>
          }
          
          {incident.closingNotes && (
              <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('modal.closingNotes')}</h3>
                  <p className="text-slate-600 whitespace-pre-wrap">{incident.closingNotes}</p>
              </div>
          )}

           {incident.remediationHistory && (
              <div className="bg-slate-50 p-4 rounded-lg space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">{t('modal.remediationDetails')}</h3>
                {renderRemediationHistory(incident, incident.remediationHistory)}
                {incident.children?.map(child => {
                    const childHistory = incident.remediationHistory?.[child.id] ? incident.remediationHistory : undefined;
                    return renderRemediationHistory(child, childHistory)
                })}
              </div>
            )}


        </main>
        
        <footer className="flex justify-between items-center p-4 border-t border-slate-200 flex-shrink-0 no-print">
            <div className="flex gap-2">
                <button 
                    onClick={onLinkToMaster} 
                    disabled={!canLink}
                    title={!canLink ? t('modal.cannotLinkTooltip') : ''}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <LinkIcon className="h-4 w-4" />
                    {t('modal.linkToMaster')}
                </button>
                 <button onClick={handlePrint} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors text-white font-medium">
                    {t('modal.printToPdf')}
                </button>
            </div>
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors text-slate-800 font-medium">
                {t('common.close')}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default IncidentDetailModal;