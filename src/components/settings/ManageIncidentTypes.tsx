
import React, { useState } from 'react';
import { Incident, IncidentType } from '../../lib/mockData.ts';
import { useTranslation } from '../../lib/i18n.tsx';
import ConfirmationModal from '../ConfirmationModal.tsx';

interface ManageIncidentTypesProps {
    incidents: Incident[];
    incidentTypes: Record<IncidentType, string>;
    onUpdate: (originalType: string, newName: string, newTemplate: string) => void;
    onDelete: (typeToDelete: string) => void;
    onAdd: (name: string, template: string) => void;
}

const ManageIncidentTypes: React.FC<ManageIncidentTypesProps> = ({ incidents, incidentTypes, onUpdate, onDelete, onAdd }) => {
    const { t } = useTranslation();
    const [editingType, setEditingType] = useState<string | null>(null);
    const [editValue, setEditValue] = useState({ name: '', template: '' });
    const [newType, setNewType] = useState({ name: '', template: '' });
    const [modalState, setModalState] = useState<{ isOpen: boolean; type: string | null }>({ isOpen: false, type: null });

    const isTypeInUse = (type: string) => {
        return incidents.some(inc => inc.type === type);
    };

    const handleStartEdit = (type: string, template: string) => {
        setEditingType(type);
        setEditValue({ name: type, template });
    };

    const handleSaveEdit = () => {
        if (!editingType || !editValue.name) return;

        if (editValue.name !== editingType && isTypeInUse(editingType)) {
             alert(t('settings.types.inUseErrorRename', { replacements: { type: editingType } }));
             return;
        }
        
        onUpdate(editingType, editValue.name, editValue.template);
        setEditingType(null);
    };

    const handleDelete = (typeToDelete: string) => {
        if (isTypeInUse(typeToDelete)) {
            alert(t('settings.types.inUseErrorDelete', { replacements: { type: typeToDelete } }));
            return;
        }
        setModalState({ isOpen: true, type: typeToDelete });
    };

    const handleConfirmDelete = () => {
        if (modalState.type) {
            onDelete(modalState.type);
        }
        setModalState({ isOpen: false, type: null });
    };
    
    const handleAddNew = () => {
        if (!newType.name || !newType.template) return;
        if (incidentTypes[newType.name]) {
            alert(t('settings.types.alreadyExists'));
            return;
        }

        onAdd(newType.name, newType.template);
        setNewType({ name: '', template: '' });
    }

    return (
        <div>
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, type: null })}
                onConfirm={handleConfirmDelete}
                title={t('settings.types.deleteConfirmTitle')}
                message={t('settings.types.deleteConfirmMessage', { replacements: { type: modalState.type || '' } })}
                confirmText={t('common.delete')}
            />
            <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('settings.types.title')}</h3>
            <p className="text-slate-500 mb-6 text-sm">{t('settings.types.description')}</p>
            
            <div className="space-y-4">
                {Object.entries(incidentTypes).map(([type, template]) => {
                    const typeInUse = isTypeInUse(type);
                    return (
                    <div key={type} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        {editingType === type ? (
                            <div className="space-y-3">
                                <input 
                                    type="text" 
                                    value={editValue.name} 
                                    onChange={e => setEditValue({...editValue, name: e.target.value})} 
                                    disabled={typeInUse}
                                    className="bg-white p-2 rounded w-full text-slate-900 border border-slate-300 disabled:opacity-70 disabled:cursor-not-allowed" 
                                    placeholder={t('settings.types.namePlaceholder')}
                                />
                                <input 
                                    type="text" 
                                    value={editValue.template} 
                                    onChange={e => setEditValue({...editValue, template: e.target.value})} 
                                    className="bg-white p-2 rounded w-full text-slate-900 border border-slate-300" 
                                    placeholder={t('settings.types.templatePlaceholder')}
                                />
                                {typeInUse && <p className="text-xs text-yellow-600">{t('settings.types.inUseInfoRename')}</p>}
                                <div className="flex gap-2">
                                    <button onClick={handleSaveEdit} className="text-sm px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200">{t('common.save')}</button>
                                    <button onClick={() => setEditingType(null)} className="text-sm px-3 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300">{t('common.cancel')}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-slate-800">{type}</p>
                                    <p className="text-sm text-slate-500 font-mono">{template}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => handleStartEdit(type, template)} className="font-medium text-cyan-600 hover:text-cyan-500">{t('common.edit')}</button>
                                    <button 
                                        onClick={() => handleDelete(type)} 
                                        disabled={typeInUse} 
                                        className="font-medium text-red-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                                        title={typeInUse ? t('settings.types.inUseTooltip') : ''}
                                    >
                                        {t('common.delete')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )})}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
                 <h4 className="text-xl font-bold text-slate-800 mb-3">{t('settings.types.addNewTitle')}</h4>
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                     <input type="text" value={newType.name} onChange={e => setNewType({...newType, name: e.target.value})} className="bg-white p-2 rounded w-full text-slate-900 border border-slate-300" placeholder={t('settings.types.namePlaceholder')}/>
                     <input type="text" value={newType.template} onChange={e => setNewType({...newType, template: e.target.value})} className="bg-white p-2 rounded w-full text-slate-900 border border-slate-300" placeholder={t('settings.types.templatePlaceholder')}/>
                     <button onClick={handleAddNew} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors text-white font-medium">
                        {t('settings.types.addButton')}
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default ManageIncidentTypes;