
import React, { useState, useEffect } from 'react';
import { IncidentType, Severity, Incident, IncidentDraft, IncidentFormData } from '../lib/mockData.ts';
import { useTranslation } from '../lib/i18n.tsx';

interface ReportFormProps {
  masterIncidentId?: string;
  onSubmit: (incident: IncidentFormData, draftId?: string) => void;
  onSaveDraft: (draftData: IncidentFormData, draftId?: string) => void;
  countdown: number;
  incidentTemplates: Record<IncidentType, string>;
  draft?: IncidentDraft | null;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Helper function to get local time in YYYY-MM-DDTHH:mm format for the datetime-local input
const getLocalTimeForInput = () => {
    const date = new Date();
    // getTimezoneOffset returns the difference in minutes between UTC and local time.
    // We subtract this offset from the current date to get the "local" time in a UTC context.
    const userTimezoneOffset = date.getTimezoneOffset() * 60000; // in milliseconds
    return new Date(date.getTime() - userTimezoneOffset).toISOString().slice(0, 16);
};


const ReportForm: React.FC<ReportFormProps> = ({ masterIncidentId, onSubmit, onSaveDraft, countdown, incidentTemplates, draft }) => {
  const { t } = useTranslation();
  const availableTypes = Object.keys(incidentTemplates);
  const [incidentType, setIncidentType] = useState<IncidentType>(availableTypes[0] || '');
  const [title, setTitle] = useState('');
  const [titleUntouched, setTitleUntouched] = useState(true);
  const [detectionTime, setDetectionTime] = useState(getLocalTimeForInput);
  const [severity, setSeverity] = useState<Severity>('Medium');
  const [timeSince, setTimeSince] = useState('');

  const [reporterName, setReporterName] = useState('Demo User');
  const [reporter, setReporter] = useState('demo@example.com');
  const [company, setCompany] = useState('Incidentio Corp');
  
  const severities: Severity[] = ['Critical', 'High', 'Medium', 'Low'];

  useEffect(() => {
    if (draft) {
      setTitle(draft.title);
      setIncidentType(draft.type);
      setSeverity(draft.severity);
      setDetectionTime(draft.detectionTime);
      setReporter(draft.reporter);
      setReporterName(draft.reporterName);
      setCompany(draft.company);
      setTitleUntouched(false);
    }
  }, [draft]);

  useEffect(() => {
    if (!incidentType || draft) return; // Don't override title if editing a draft
    
    const templateKey = Object.keys(t('incidentTypes', { returnObjects: true }) as object).find(key => t(`incidentTypes.${key}`) === incidentType) || '';
    const template = t(`incidentTemplates.${templateKey}`);
    
    setTitle(template || '');
    setTitleUntouched(true);
  }, [incidentType, t, draft]);

  useEffect(() => {
    const update = () => {
        const now = new Date();
        const detected = new Date(detectionTime);
        if (isNaN(detected.getTime())) return; // Guard against invalid date
        
        const diffMs = now.getTime() - detected.getTime();
        const diffMins = Math.round(diffMs / 60000);
        
        if (diffMins < 1) {
            setTimeSince(t('time.justNow'));
        } else if (diffMins < 60) {
            setTimeSince(t(diffMins > 1 ? 'time.minutesAgo' : 'time.minuteAgo', { replacements: { count: diffMins } }));
        } else {
            const diffHours = Math.floor(diffMins / 60);
            const remainingMins = diffMins % 60;
            setTimeSince(t('time.hmAgo', { replacements: { hours: diffHours, minutes: remainingMins } }));
        }
    };

    if(detectionTime) {
      update();
      const interval = setInterval(update, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [detectionTime, t]);

  const handleTitleFocus = () => {
    if (titleUntouched) {
        const placeholderIndex = title.lastIndexOf('[');
        if (placeholderIndex !== -1) {
            setTitle(title.substring(0, placeholderIndex).trim());
        }
        setTitleUntouched(false);
    }
  };
  
  const getFormData = (): IncidentFormData => ({
    title,
    type: incidentType,
    severity,
    detectionTime,
    reporter,
    reporterName,
    company,
    masterIncidentId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(getFormData(), draft?.draftId);
  };
  
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    onSaveDraft(getFormData(), draft?.draftId);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-lg h-full">
      <div className="flex justify-between items-start mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">{t('reportForm.title')}</h2>
            <p className="text-slate-500 mt-1">
                {draft ? t('reportForm.editingDraft') : masterIncidentId ? t('reportForm.linkingTo', { replacements: { id: masterIncidentId } }) : t('reportForm.creatingNew')}
            </p>
        </div>
        <div className={`text-right p-3 rounded-lg transition-all duration-300 ${countdown <= 300 ? 'bg-red-100 ring-2 ring-red-400 animate-pulse' : ''}`}>
            <div className="text-sm text-slate-500">{t('common.timeRemaining')}</div>
            <div className={`text-2xl font-bold ${countdown <= 300 ? 'text-red-600' : 'text-cyan-600'}`}>
                {formatTime(countdown)}
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="incidentType" className="block text-sm font-medium text-slate-600 mb-2">{t('reportForm.incidentType')}</label>
            <select
              id="incidentType"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value as IncidentType)}
              className="w-full py-3 px-4 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {availableTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-slate-600 mb-2">{t('reportForm.severityLevel')}</label>
            <select
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full py-3 px-4 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {severities.map(s => <option key={s} value={s}>{t(`severity.${s.toLowerCase()}`)}</option>)}
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-600 mb-2">{t('reportForm.incidentTitle')}</label>
          <input
            type="text"
            id="title"
            value={title}
            onFocus={handleTitleFocus}
            onChange={(e) => {
                setTitle(e.target.value);
                setTitleUntouched(false);
            }}
            required
            className="w-full py-3 px-4 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
            <label htmlFor="detectionTime" className="block text-sm font-medium text-slate-600 mb-2">{t('reportForm.detectionTime')}</label>
            <div className="flex items-center gap-4">
                <input
                    type="datetime-local"
                    id="detectionTime"
                    value={detectionTime}
                    onChange={(e) => setDetectionTime(e.target.value)}
                    required
                    className="flex-grow py-3 px-4 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <div className="flex-shrink-0 bg-slate-100 px-4 py-3 rounded-lg text-cyan-700 font-mono text-sm">
                    {timeSince}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
              <label htmlFor="reporterName" className="block text-sm font-medium text-slate-600 mb-2">{t('reportForm.reporterName')}</label>
              <input
                type="text"
                id="reporterName"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                required
                className="w-full py-3 px-4 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label htmlFor="reporterEmail" className="block text-sm font-medium text-slate-600 mb-2">{t('reportForm.reporterEmail')}</label>
              <input
                type="email"
                id="reporterEmail"
                value={reporter}
                onChange={e => setReporter(e.target.value)}
                required
                className="w-full py-3 px-4 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-600 mb-2">{t('reportForm.company')}</label>
              <input
                type="text"
                id="company"
                value={company}
                onChange={e => setCompany(e.target.value)}
                required
                className="w-full py-3 px-4 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
        </div>

        <div className="pt-4 flex flex-col md:flex-row gap-4">
          <button
            type="submit"
            className="w-full md:w-auto flex justify-center py-3 px-8 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 transition-all duration-300"
          >
            {t('reportForm.submit')}
          </button>
           <button
            type="button"
            onClick={handleSave}
            className="w-full md:w-auto flex justify-center py-3 px-8 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 transition-all duration-300"
          >
            {t('reportForm.saveDraft')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;