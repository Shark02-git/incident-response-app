
import React, { useState, useEffect } from 'react';
import { IncidentType, Severity } from '../../lib/mockData.ts';
import { useTranslation } from '../../lib/i18n.tsx';

type SlaPolicies = Record<IncidentType, Record<Severity, { responseMinutes: number, resolutionMinutes: number }>>;

interface ManageSLAsProps {
    slaPolicies: SlaPolicies;
    setSlaPolicies: React.Dispatch<React.SetStateAction<SlaPolicies>>;
    incidentTypes: IncidentType[];
}

const severities: Severity[] = ['Critical', 'High', 'Medium', 'Low'];

const ManageSLAs: React.FC<ManageSLAsProps> = ({ slaPolicies, setSlaPolicies, incidentTypes }) => {
    const { t } = useTranslation();
    const [localSlas, setLocalSlas] = useState<SlaPolicies>(slaPolicies);
    
    useEffect(() => {
        setLocalSlas(slaPolicies);
    }, [slaPolicies]);

    const handleSlaChange = (type: IncidentType, severity: Severity, field: 'responseMinutes' | 'resolutionMinutes', value: string) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 0) return;

        setLocalSlas(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [severity]: {
                    ...prev[type][severity],
                    [field]: numValue
                }
            }
        }));
    };

    const handleSaveChanges = () => {
        setSlaPolicies(localSlas);
        alert(t('settings.slas.saveSuccess'));
    };

    return (
        <div>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">{t('settings.slas.title')}</h3>
                    <p className="text-slate-500 mt-1">{t('settings.slas.description')}</p>
                </div>
                 <button onClick={handleSaveChanges} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors text-white font-medium">
                    {t('common.saveChanges')}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-100">
                        <tr>
                            <th scope="col" className="px-4 py-3">{t('settings.slas.colIncidentType')}</th>
                            {severities.map(sev => (
                                <th key={sev} scope="col" className="px-4 py-3 text-center">{t(`severity.${sev.toLowerCase()}`)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {incidentTypes.map(type => (
                            <tr key={type} className="bg-white border-b border-slate-200 align-top">
                                <td className="px-4 py-4 font-bold text-slate-800">{type}</td>
                                {severities.map(sev => (
                                    <td key={sev} className="px-4 py-4">
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-xs text-slate-500">{t('settings.slas.response')}</label>
                                                <input
                                                    type="number"
                                                    value={localSlas[type]?.[sev]?.responseMinutes || 0}
                                                    onChange={(e) => handleSlaChange(type, sev, 'responseMinutes', e.target.value)}
                                                    className="w-full bg-slate-100 p-2 rounded text-slate-800 text-center border border-slate-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500">{t('settings.slas.resolution')}</label>
                                                <input
                                                    type="number"
                                                    value={localSlas[type]?.[sev]?.resolutionMinutes || 0}
                                                    onChange={(e) => handleSlaChange(type, sev, 'resolutionMinutes', e.target.value)}
                                                    className="w-full bg-slate-100 p-2 rounded text-slate-800 text-center border border-slate-300"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageSLAs;