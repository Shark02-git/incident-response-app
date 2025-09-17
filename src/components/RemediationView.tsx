
import React, { useState, useEffect, useRef } from 'react';
import { Incident, RemediationStep, StepState } from '../lib/mockData.ts';
import UploadIcon from './icons/UploadIcon.tsx';
import ArrowRightIcon from './icons/ArrowRightIcon.tsx';
import { useTranslation } from '../lib/i18n.tsx';


const initialStepState = (steps: RemediationStep[]): Record<string, StepState> => {
  return steps.reduce((acc, step) => {
    acc[step.id] = { status: 'pending', comment: '', timeSpent: 0, screenshot: null };
    return acc;
  }, {} as Record<string, StepState>);
};

const ChecklistItem: React.FC<{
    step: RemediationStep;
    state: StepState;
    onStateChange: (newState: Partial<StepState>) => void;
    isActive: boolean;
    elapsedTimeSeconds: number;
}> = ({ step, state, onStateChange, isActive, elapsedTimeSeconds }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const isFinalized = state.status !== 'pending';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                onStateChange({ screenshot: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const timeDisplay = isFinalized ? state.timeSpent : elapsedTimeSeconds;
    const minutes = Math.floor(timeDisplay / 60);
    const seconds = timeDisplay % 60;

    return (
        <div className={`p-4 rounded-lg transition-all duration-300 ${isActive && !isFinalized ? 'bg-cyan-50 ring-2 ring-cyan-500' : 'bg-white'}`}>
            <div className="flex justify-between items-center">
                <div className="flex-grow">
                    <h4 className={`font-bold ${isFinalized ? 'line-through text-slate-400' : 'text-slate-800'}`}>{step.title}</h4>
                    <p className="text-sm text-slate-500">{step.description}</p>
                </div>
                <div className="font-mono text-sm text-slate-500 ml-4">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</div>
            </div>
            <div className="mt-4 space-y-3">
                <textarea
                    value={state.comment}
                    onChange={e => onStateChange({ comment: e.target.value })}
                    placeholder={t('remediation.commentPlaceholder')}
                    rows={2}
                    disabled={isFinalized}
                    className="w-full text-sm p-2 bg-slate-100 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
                 {state.screenshot && (
                    <div className="mt-2">
                        <img src={state.screenshot} alt="Screenshot preview" className="max-h-32 rounded-md border border-slate-300" />
                    </div>
                 )}
                <div className="flex flex-wrap gap-3 items-center">
                    <button onClick={() => onStateChange({ status: 'completed' })} disabled={isFinalized} className="text-sm px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed">{t('remediation.complete')}</button>
                    <button onClick={() => onStateChange({ status: 'skipped' })} disabled={isFinalized} className="text-sm px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed">{t('remediation.skip')}</button>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isFinalized} className="flex items-center text-sm px-3 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        <UploadIcon className="h-4 w-4 mr-2"/> {state.screenshot ? t('remediation.changeScreenshot') : t('remediation.attachScreenshot')}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} disabled={isFinalized} className="hidden" accept="image/*" />
                </div>
            </div>
        </div>
    );
};

const IncidentChecklist: React.FC<{
    incident: Incident;
    stepStates: Record<string, Record<string, StepState>>;
    setStepStates: React.Dispatch<React.SetStateAction<Record<string, Record<string, StepState>>>>;
    activeStep: { incidentId: string; stepId: string } | null;
    setActiveStep: (active: { incidentId: string; stepId: string } | null) => void;
    startTime: number;
    elapsedTimeSeconds: number;
}> = ({ incident, stepStates, setStepStates, activeStep, setActiveStep, startTime, elapsedTimeSeconds }) => {
    const [isCollapsed, setIsCollapsed] = useState(!!incident.masterIncidentId);

    const handleStateChange = (stepId: string, newState: Partial<StepState>) => {
        setStepStates(prev => {
            const currentIncidentStates = prev[incident.id] || {};
            const currentStepState = currentIncidentStates[stepId];
            if (!currentStepState) return prev; // Safety check

            const updatedState = { ...newState };
            // If the status is changing to a final one from pending, record the final time.
            if (currentStepState.status === 'pending' && newState.status && newState.status !== 'pending') {
                updatedState.timeSpent = Math.floor((Date.now() - startTime) / 1000);
            }

            return {
                ...prev,
                [incident.id]: {
                    ...currentIncidentStates,
                    [stepId]: { ...currentStepState, ...updatedState },
                },
            };
        });

        if (newState.status && newState.status !== 'pending') {
             const currentIndex = incident.steps.findIndex(s => s.id === stepId);
             const nextStep = incident.steps[currentIndex + 1];
             if (nextStep) {
                 setActiveStep({ incidentId: incident.id, stepId: nextStep.id });
             }
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg">
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full p-4 text-left bg-slate-50 rounded-t-xl hover:bg-slate-100 transition-colors">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">{incident.title} ({incident.id})</h3>
                    <ArrowRightIcon className={`h-5 w-5 text-slate-500 transition-transform ${!isCollapsed && 'rotate-90'}`} />
                </div>
            </button>
            {!isCollapsed && (
                 <div className="p-4 space-y-4">
                    {incident.steps.map(step => (
                        <div key={step.id} onClick={() => stepStates[incident.id]?.[step.id]?.status === 'pending' && setActiveStep({incidentId: incident.id, stepId: step.id})}>
                           <ChecklistItem
                                step={step}
                                state={stepStates[incident.id]?.[step.id]}
                                onStateChange={(newState) => handleStateChange(step.id, newState)}
                                isActive={activeStep?.incidentId === incident.id && activeStep?.stepId === step.id}
                                elapsedTimeSeconds={elapsedTimeSeconds}
                           />
                        </div>
                    ))}
                 </div>
            )}
        </div>
    );
};


const RemediationView: React.FC<{ 
    incident: Incident; 
    onFinalize: (finalizedIncident: Incident) => void;
    onSaveAndExit: (incident: Incident) => void;
}> = ({ incident, onFinalize, onSaveAndExit }) => {
  const allIncidents = [incident, ...(incident.children || [])];
  const { t } = useTranslation();
  
  const [stepStates, setStepStates] = useState<Record<string, Record<string, StepState>>>(() => 
    incident.remediationHistory ||
    allIncidents.reduce((acc, inc) => {
        acc[inc.id] = initialStepState(inc.steps);
        return acc;
    }, {} as Record<string, Record<string, StepState>>)
  );

  const [activeStep, setActiveStep] = useState<{ incidentId: string; stepId: string } | null>(() => {
    for (const inc of allIncidents) {
        const firstPendingStep = inc.steps.find(s => stepStates[inc.id]?.[s.id]?.status === 'pending');
        if (firstPendingStep) {
            return { incidentId: inc.id, stepId: firstPendingStep.id };
        }
    }
    return null;
  });

  const [closingNotes, setClosingNotes] = useState(incident.closingNotes || '');

  const [startTime] = useState(() => 
    incident.remediationStartTime ? new Date(incident.remediationStartTime).getTime() : Date.now()
  );
  const [elapsedTimeSeconds, setElapsedTimeSeconds] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
        setElapsedTimeSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);
  
  const handleFinalize = () => {
      const finalizedIncident: Incident = { 
        ...incident, 
        status: 'completed',
        completionTime: new Date().toISOString(),
        closingNotes,
        remediationHistory: stepStates,
      };
      onFinalize(finalizedIncident);
  };
  
  const handleSave = () => {
    const partiallyUpdatedIncident: Incident = {
      ...incident,
      status: 'ongoing',
      remediationHistory: stepStates,
      closingNotes: closingNotes,
    };
    onSaveAndExit(partiallyUpdatedIncident);
  };

  const allStepsCompleted = Object.values(stepStates).every(incidentSteps => 
    Object.values(incidentSteps).every(step => step.status !== 'pending')
  );

  return (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-800">{t('remediation.title', { replacements: { incidentTitle: incident.title } })}</h2>
        {allIncidents.map(inc => (
            <IncidentChecklist 
                key={inc.id}
                incident={inc}
                stepStates={stepStates}
                setStepStates={setStepStates}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                startTime={startTime}
                elapsedTimeSeconds={elapsedTimeSeconds}
            />
        ))}

        {allStepsCompleted && (
            <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-slate-800">{t('remediation.finalReportTitle')}</h3>
                <p className="text-slate-500 mt-1 mb-4">{t('remediation.finalReportSubtitle')}</p>
                <textarea
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    placeholder={t('remediation.closingNotesPlaceholder')}
                    rows={8}
                    className="w-full text-base p-3 bg-slate-100 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
            </div>
        )}

        <div className="mt-6 flex flex-col md:flex-row gap-4 md:justify-end border-t border-slate-200 pt-6">
            <button 
                onClick={handleSave}
                className="w-full md:w-auto justify-center py-3 px-6 border border-slate-300 rounded-lg shadow-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
            >
                {t('remediation.saveAndExit')}
            </button>
            <button 
                onClick={handleFinalize}
                disabled={!allStepsCompleted}
                className="w-full md:w-auto justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {t('remediation.submitFinalReport')}
            </button>
        </div>
    </div>
  );
};

export default RemediationView;