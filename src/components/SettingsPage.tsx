
import React, { useState } from 'react';
import { User, IncidentType, RemediationStep, Severity, Incident, UserRole, UserStatus } from '../lib/mockData.ts';
import UsersIcon from './icons/UsersIcon.tsx';
import DocumentTextIcon from './icons/DocumentTextIcon.tsx';
import ShieldCheckIcon from './icons/ShieldCheckIcon.tsx';
import ClockIcon from './icons/ClockIcon.tsx';

import ManageUsers from './settings/ManageUsers.tsx';
import ManageIncidentTypes from './settings/ManageIncidentTypes.tsx';
import ManageRemediationPlans from './settings/ManageRemediationPlans.tsx';
import ManageSLAs from './settings/ManageSLAs.tsx';
import { useTranslation } from '../lib/i18n.tsx';


type ActiveSetting = 'users' | 'types' | 'plans' | 'slas';

interface SettingsPageProps {
    incidents: Incident[];
    users: User[];
    incidentTypes: Record<IncidentType, string>;
    remediationPlans: Record<IncidentType, RemediationStep[]>;
    setRemediationPlans: React.Dispatch<React.SetStateAction<Record<IncidentType, RemediationStep[]>>>;
    slaPolicies: Record<IncidentType, Record<Severity, { responseMinutes: number, resolutionMinutes: number }>>;
    setSlaPolicies: React.Dispatch<React.SetStateAction<Record<IncidentType, Record<Severity, { responseMinutes: number, resolutionMinutes: number }>>>>;
    
    // Centralized handlers
    onAddUser: (newUser: Omit<User, 'id' | 'status'>) => void;
    onUpdateUserStatus: (userId: string, status: UserStatus) => void;
    onDeleteUser: (userId: string) => void;
    onUpdateIncidentType: (originalType: string, newName: string, newTemplate: string) => void;
    onDeleteIncidentType: (typeToDelete: string) => void;
    onAddIncidentType: (name: string, template: string) => void;
}

const SettingsNavItem: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
    Icon: React.FC<{className?: string}>;
}> = ({ label, active, onClick, Icon }) => (
    <button onClick={onClick} className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${active ? 'bg-cyan-100 text-cyan-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}>
        <Icon className="h-5 w-5 mr-3" />
        <span className="font-medium">{label}</span>
    </button>
);


const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    const [activeSetting, setActiveSetting] = useState<ActiveSetting>('users');
    const { t } = useTranslation();

    const renderActiveSetting = () => {
        switch (activeSetting) {
            case 'users':
                return <ManageUsers 
                            users={props.users} 
                            onAddUser={props.onAddUser}
                            onUpdateUserStatus={props.onUpdateUserStatus}
                            onDeleteUser={props.onDeleteUser}
                       />;
            case 'types':
                return <ManageIncidentTypes 
                    incidents={props.incidents}
                    incidentTypes={props.incidentTypes}
                    onUpdate={props.onUpdateIncidentType}
                    onDelete={props.onDeleteIncidentType}
                    onAdd={props.onAddIncidentType}
                />;
            case 'plans':
                return <ManageRemediationPlans remediationPlans={props.remediationPlans} setRemediationPlans={props.setRemediationPlans} incidentTypes={Object.keys(props.incidentTypes)} />;
            case 'slas':
                return <ManageSLAs slaPolicies={props.slaPolicies} setSlaPolicies={props.setSlaPolicies} incidentTypes={Object.keys(props.incidentTypes)} />;
            default:
                return null;
        }
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg h-full flex flex-col md:flex-row">
            <aside className="w-full md:w-64 p-4 border-b md:border-b-0 md:border-r border-slate-200 flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-800 mb-6 px-2">{t('settings.title')}</h2>
                <nav className="space-y-2">
                   <SettingsNavItem label={t('settings.nav.users')} active={activeSetting === 'users'} onClick={() => setActiveSetting('users')} Icon={UsersIcon} />
                   <SettingsNavItem label={t('settings.nav.incidentTypes')} active={activeSetting === 'types'} onClick={() => setActiveSetting('types')} Icon={DocumentTextIcon} />
                   <SettingsNavItem label={t('settings.nav.remediationPlans')} active={activeSetting === 'plans'} onClick={() => setActiveSetting('plans')} Icon={ShieldCheckIcon} />
                   <SettingsNavItem label={t('settings.nav.slaPolicies')} active={activeSetting === 'slas'} onClick={() => setActiveSetting('slas')} Icon={ClockIcon} />
                </nav>
            </aside>
            <main className="flex-1 p-6 overflow-y-auto">
                {renderActiveSetting()}
            </main>
        </div>
    );
};

export default SettingsPage;