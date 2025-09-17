
import React, { useState } from 'react';
import { IncidentType, RemediationStep } from '../../lib/mockData.ts';
import { useTranslation } from '../../lib/i18n.tsx';
import ConfirmationModal from '../ConfirmationModal.tsx';

interface ManageRemediationPlansProps {
    remediationPlans: Record<IncidentType, RemediationStep[]>;
    setRemediationPlans: React.Dispatch<React.SetStateAction<Record<IncidentType, RemediationStep[]>>>;
    incidentTypes: IncidentType[];
}

const ManageRemediationPlans: React.FC<ManageRemediationPlansProps> = ({ remediationPlans, setRemediationPlans, incidentTypes }) => {
    const { t } = useTranslation();
    const [selectedType, setSelectedType] = useState<IncidentType>(incidentTypes[0] || '');
    const [editingStep, setEditingStep] = useState<RemediationStep | null>(null);
    const [newStep, setNewStep] = useState({ title: '', description: '' });
    const [modalState, setModalState] = useState<{ isOpen: boolean; stepId: string | null }>({ isOpen: false, stepId: null });

    const handleAddStep = () => {
        if (!newStep.title || !newStep.description || !selectedType) return;
        const step: RemediationStep = { ...newStep, id: `${selectedType.toLowerCase().replace(' ','-')}-${Date.now()}` };
        setRemediationPlans(prev => ({
            ...prev,
            [selectedType]: [...(prev[selectedType] || []), step]
        }));
        setNewStep({ title: '', description: '' });
    };
    
    const handleUpdateStep = () => {
        if (!editingStep || !selectedType) return;
        setRemediationPlans(prev => ({
            ...prev,
            [selectedType]: prev[selectedType].map(s => s.id === editingStep.id ? editingStep : s)
        }));
        setEditingStep(null);
    };

    const handleDeleteStep = (stepId: string) => {
        if (!selectedType) return;
        setModalState({ isOpen: true, stepId });
    };
    
    const handleConfirmDeleteStep = () => {
        if (!modalState.stepId || !selectedType) return;
        setRemediationPlans(prev => ({
            ...prev,
            [selectedType]: prev[selectedType].filter(s => s.id !== modalState.stepId)
        }));
        setModalState({ isOpen: false, stepId: null });
    };

    const stepsForSelectedType = remediationPlans[selectedType] || [];

    return (
        <div>
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, stepId: null })}
                onConfirm={handleConfirmDeleteStep}
                title={t('settings.plans.deleteConfirmTitle')}
                message={t('settings.plans.deleteConfirmMessage')}
            />
            <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('settings.plans.title')}</h3>
            <div className="mb-6">
                <label htmlFor="incidentTypeSelect" className="block text-sm font-medium text-slate-600 mb-2">{t('settings.plans.selectLabel')}</label>
                <select
                    id="incidentTypeSelect"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as IncidentType)}
                    className="w-full md:w-1/2 py-3 px-4 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    {incidentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>

            <div className="space-y-4">
                {stepsForSelectedType.map(step => (
                    <div key={step.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        {editingStep?.id === step.id ? (
                            <div className="space-y-3">
                                <input type="text" value={editingStep.title} onChange={e => setEditingStep({...editingStep, title: e.target.value})} className="bg-white p-2 rounded w-full text-slate-900 border border-slate-300" placeholder={t('settings.plans.stepTitlePlaceholder')}/>
                                <textarea value={editingStep.description} onChange={e => setEditingStep({...editingStep, description: e.target.value})} className="bg-white p-2 rounded w-full text-slate-900 border border-slate-300" placeholder={t('settings.plans.stepDescPlaceholder')} rows={2}/>
                                <div className="flex gap-2">
                                    <button onClick={handleUpdateStep} className="text-sm px-3 py-1 rounded bg-green-100 text-green-700">{t('common.save')}</button>
                                    <button onClick={() => setEditingStep(null)} className="text-sm px-3 py-1 rounded bg-slate-200 text-slate-700">{t('common.cancel')}</button>
                                </div>
                            </div>
                        ) : (
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-slate-800">{step.title}</p>
                                    <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                                </div>
                                <div className="flex gap-3 flex-shrink-0 ml-4">
                                    <button onClick={() => setEditingStep(step)} className="font-medium text-cyan-600 hover:text-cyan-500">{t('common.edit')}</button>
                                    <button onClick={() => handleDeleteStep(step.id)} className="font-medium text-red-600 hover:text-red-500">{t('common.delete')}</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {stepsForSelectedType.length === 0 && <p className="text-slate-500 text-center py-4">{t('settings.plans.noSteps')}</p>}
            </div>

             <div className="mt-8 border-t border-slate-200 pt-6">
                 <h4 className="text-xl font-bold text-slate-800 mb-3">{t('settings.plans.addNewTitle', { replacements: { type: selectedType } })}</h4>
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                     <input type="text" value={newStep.title} onChange={e => setNewStep({...newStep, title: e.target.value})} className="bg-white p-2 rounded w-full text-slate-900 border border-slate-300" placeholder={t('settings.plans.stepTitlePlaceholder')}/>
                     <textarea value={newStep.description} onChange={e => setNewStep({...newStep, description: e.target.value})} className="bg-white p-2 rounded w-full text-slate-900 border border-slate-300" placeholder={t('settings.plans.stepDescPlaceholder')} rows={2}/>
                     <button onClick={handleAddStep} disabled={!selectedType} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors text-white font-medium disabled:opacity-50">
                        {t('settings.plans.addButton')}
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default ManageRemediationPlans;