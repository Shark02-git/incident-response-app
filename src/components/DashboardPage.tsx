
import React, { useState, useEffect, useCallback, useRef } from 'react';

import DashboardIcon from './icons/DashboardIcon.tsx';
import ReportIcon from './icons/ReportIcon.tsx';
import OngoingIcon from './icons/OngoingIcon.tsx';
import CompletedIcon from './icons/CompletedIcon.tsx';
import SettingsIcon from './icons/SettingsIcon.tsx';
import LogoutIcon from './icons/LogoutIcon.tsx';
import MenuIcon from './icons/MenuIcon.tsx';
import CloseIcon from './icons/CloseIcon.tsx';
import ArrowRightIcon from './icons/ArrowRightIcon.tsx';
import ChevronRightIcon from './icons/ChevronRightIcon.tsx';
import ChartBarIcon from './icons/ChartBarIcon.tsx';
import DraftIcon from './icons/DraftIcon.tsx';
import TriagePage from './TriagePage.tsx';
import ReportForm from './ReportForm.tsx';
import RemediationView from './RemediationView.tsx';
import Toast from './Toast.tsx';
import IncidentDetailModal from './IncidentDetailModal.tsx';
import LinkMasterModal from './LinkMasterModal.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import SettingsPage from './SettingsPage.tsx';
import AnalyticsPage from './AnalyticsPage.tsx';
import LanguageSwitcher from './LanguageSwitcher.tsx';
import { Incident, mockIncidents, remediationSteps, slaPolicies, incidentTemplates, User, mockUsers, IncidentType, Severity, RemediationStep, UserRole, UserStatus, IncidentDraft, IncidentFormData } from '../lib/mockData.ts';
import { useTranslation } from '../lib/i18n.tsx';

interface DashboardPageProps {
  onLogout: () => void;
}

type View = 'dashboard' | 'triage' | 'report' | 'ongoing' | 'completed' | 'settings' | 'remediation' | 'analytics' | 'drafts';

const NavItem: React.FC<{
  view: View;
  label: string;
  activeView: View;
  setActiveView: (view: View) => void;
  Icon: React.FC<{ className?: string }>;
  isSidebarCollapsed: boolean;
}> = ({ view, label, activeView, setActiveView, Icon, isSidebarCollapsed }) => (
  <li>
    <button
      onClick={() => setActiveView(view)}
      className={`w-full flex items-center p-3 my-1 rounded-lg transition-all duration-300 ${
        activeView === view
          ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
          : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-600'
      }`}
    >
      <Icon className="h-6 w-6" />
      {!isSidebarCollapsed && <span className="ml-4 font-medium">{label}</span>}
    </button>
  </li>
);

const DashboardCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  count?: number;
}> = ({ icon, title, description, onClick, count }) => {
    const { t } = useTranslation();
    return (
        <button onClick={onClick} className="text-left p-6 bg-white border border-slate-200 rounded-xl shadow-lg hover:shadow-xl hover:border-cyan-500 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-shrink-0">{icon}</div>
                {typeof count !== 'undefined' && (
                    <span className="text-5xl font-bold text-slate-800">{count}</span>
                )}
            </div>
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <p className="text-slate-500 text-sm mt-1">{description}</p>
            </div>
            <div className="mt-4">
                <div className="flex items-center text-cyan-600 font-semibold">
                    <span>{t('dashboard.go')}</span>
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                </div>
            </div>
        </button>
    );
};


const DashboardView: React.FC<{ 
    setActiveView: (view: View) => void; 
    draftCount: number; 
    ongoingCount: number;
    completedCount: number;
}> = ({ setActiveView, draftCount, ongoingCount, completedCount }) => {
    const { t } = useTranslation();
    return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg h-full">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">{t('dashboard.welcome')}</h2>
        <p className="text-slate-500 mb-8">{t('dashboard.selectTask')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <DashboardCard
                icon={<ReportIcon className="h-8 w-8 text-cyan-500" />}
                title={t('nav.reportNewIncident')}
                description={t('dashboard.reportNew_desc')}
                onClick={() => setActiveView('triage')}
            />
             <DashboardCard
                icon={<ChartBarIcon className="h-8 w-8 text-cyan-500" />}
                title={t('nav.analytics')}
                description={t('dashboard.analytics_desc')}
                onClick={() => setActiveView('analytics')}
            />
            {draftCount > 0 && (
                <DashboardCard
                    icon={<DraftIcon className="h-8 w-8 text-cyan-500" />}
                    title={t('nav.drafts')}
                    description={t('dashboard.drafts_desc')}
                    onClick={() => setActiveView('drafts')}
                    count={draftCount}
                />
            )}
            <DashboardCard
                icon={<OngoingIcon className="h-8 w-8 text-cyan-500" />}
                title={t('nav.ongoingIncidents')}
                description={t('dashboard.ongoing_desc')}
                onClick={() => setActiveView('ongoing')}
                count={ongoingCount}
            />
            <DashboardCard
                icon={<CompletedIcon className="h-8 w-8 text-cyan-500" />}
                title={t('nav.completedIncidents')}
                description={t('dashboard.completed_desc')}
                onClick={() => setActiveView('completed')}
                count={completedCount}
            />
        </div>
    </div>
)};

const IncidentRow: React.FC<{
    incident: Incident;
    onViewDetails: (incident: Incident) => void;
    onResume?: (incident: Incident) => void;
    isChild?: boolean;
    hasChildren?: boolean;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
}> = ({ incident, onViewDetails, onResume, isChild, hasChildren, isExpanded, onToggleExpand }) => {
    const { t, language } = useTranslation();
    const severities: Record<Severity, string> = {
        Critical: t('severity.critical'),
        High: t('severity.high'),
        Medium: t('severity.medium'),
        Low: t('severity.low'),
    };
    
    return (
        <tr className={`border-b border-slate-200 ${isChild ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100`}>
            <td className="px-6 py-4 font-mono text-slate-900">
                <div className="flex items-center gap-2">
                    {hasChildren && (
                        <button onClick={onToggleExpand} className="p-1 rounded-full hover:bg-slate-200">
                            <ChevronRightIcon className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                    )}
                    <span className={`${isChild ? 'ml-6' : ''}`}>{incident.id}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-slate-900">{incident.title}</td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    incident.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                    incident.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                    incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-sky-100 text-sky-700'
                }`}>{severities[incident.severity]}</span>
            </td>
            <td className="px-6 py-4 hidden md:table-cell">{new Date(incident.slaResponseDeadline).toLocaleString(language)}</td>
            <td className="px-6 py-4 hidden md:table-cell">{new Date(incident.slaResolutionDeadline).toLocaleString(language)}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-4">
                    <button onClick={() => onViewDetails(incident)} className="font-medium text-cyan-600 hover:underline">{t('incidentList.viewDetails')}</button>
                    {onResume && (
                        <button onClick={() => onResume(incident)} className="font-medium text-green-600 hover:underline">{t('incidentList.resume')}</button>
                    )}
                </div>
            </td>
        </tr>
    );
};

const IncidentListView: React.FC<{
  incidents: Incident[];
  allIncidents: Incident[];
  expandedRows: Record<string, boolean>;
  onToggleExpand: (incidentId: string) => void;
  onViewDetails: (incident: Incident) => void;
  onResume?: (incident: Incident) => void;
}> = ({ incidents, allIncidents, expandedRows, onToggleExpand, onViewDetails, onResume }) => {
    const { t } = useTranslation();

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-100">
                    <tr>
                        <th scope="col" className="px-6 py-3">{t('incidentList.id')}</th>
                        <th scope="col" className="px-6 py-3">{t('incidentList.title')}</th>
                        <th scope="col" className="px-6 py-3">{t('incidentList.severity')}</th>
                        <th scope="col" className="px-6 py-3 hidden md:table-cell">{t('incidentList.responseSla')}</th>
                        <th scope="col" className="px-6 py-3 hidden md:table-cell">{t('incidentList.resolveSla')}</th>
                        <th scope="col" className="px-6 py-3">{t('incidentList.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {incidents.map((inc) => (
                        <React.Fragment key={inc.id}>
                            <IncidentRow
                                incident={inc}
                                onViewDetails={onViewDetails}
                                onResume={onResume}
                                hasChildren={inc.children && inc.children.length > 0}
                                isExpanded={expandedRows[inc.id]}
                                onToggleExpand={() => onToggleExpand(inc.id)}
                            />
                            {expandedRows[inc.id] && inc.children && inc.children.map(childRef => {
                                const childIncident = allIncidents.find(i => i.id === childRef.id);
                                return childIncident ? (
                                    <IncidentRow
                                        key={childIncident.id}
                                        incident={childIncident}
                                        onViewDetails={onViewDetails}
                                        onResume={onResume}
                                        isChild
                                    />
                                ) : null;
                            })}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            {incidents.length === 0 && <p className="text-center py-8 text-slate-500">{t('incidentList.noIncidents')}</p>}
        </div>
    );
};

const DraftListView: React.FC<{
    drafts: IncidentDraft[];
    onEdit: (draft: IncidentDraft) => void;
    onDelete: (draftId: string) => void;
}> = ({ drafts, onEdit, onDelete }) => {
    const { t, language } = useTranslation();
    const severities: Record<Severity, string> = {
        Critical: t('severity.critical'),
        High: t('severity.high'),
        Medium: t('severity.medium'),
        Low: t('severity.low'),
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-100">
                    <tr>
                        <th scope="col" className="px-6 py-3">{t('incidentList.title')}</th>
                        <th scope="col" className="px-6 py-3">{t('incidentList.severity')}</th>
                        <th scope="col" className="px-6 py-3 hidden md:table-cell">{t('draftList.lastSaved')}</th>
                        <th scope="col" className="px-6 py-3">{t('incidentList.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {drafts.map((draft) => (
                        <tr key={draft.draftId} className="bg-white border-b border-slate-200 hover:bg-slate-100">
                            <td className="px-6 py-4 text-slate-900">{draft.title || `(${t('draftList.untitled')})`}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    draft.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                                    draft.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                                    draft.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-sky-100 text-sky-700'
                                }`}>{severities[draft.severity]}</span>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">{new Date(draft.lastSaved).toLocaleString(language)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => onEdit(draft)} className="font-medium text-cyan-600 hover:underline">{t('draftList.editDraft')}</button>
                                    <button onClick={() => onDelete(draft.draftId)} className="font-medium text-red-600 hover:underline">{t('draftList.deleteDraft')}</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {drafts.length === 0 && <p className="text-center py-8 text-slate-500">{t('draftList.noDrafts')}</p>}
        </div>
    );
};


const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<{ masterIncidentId?: string, key?: number } | null>(null);
  const [triageTimeLeft, setTriageTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const triageDeadlineRef = useRef<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const { t } = useTranslation();
  
  const [activeRemediationIncident, setActiveRemediationIncident] = useState<Incident | null>(null);
  const [detailIncident, setDetailIncident] = useState<Incident | null>(null);
  
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [drafts, setDrafts] = useState<IncidentDraft[]>([]);
  const [editingDraft, setEditingDraft] = useState<IncidentDraft | null>(null);

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [types, setTypes] = useState<Record<IncidentType, string>>(incidentTemplates);
  const [plans, setPlans] = useState<Record<IncidentType, RemediationStep[]>>(remediationSteps);
  const [slas, setSlas] = useState<Record<IncidentType, Record<Severity, { responseMinutes: number, resolutionMinutes: number }>>>(slaPolicies);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [linkModalState, setLinkModalState] = useState<{isOpen: boolean, incidentToLink: Incident | null}>({isOpen: false, incidentToLink: null});
  const [bulkResolveState, setBulkResolveState] = useState<{ isOpen: boolean; incident: Incident | null; childrenCount: number }>({ isOpen: false, incident: null, childrenCount: 0 });
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);

  const ongoingCount = incidents.filter(i => i.status === 'ongoing').length;
  const completedCount = incidents.filter(i => i.status === 'completed').length;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeView]);

  const resetTriage = useCallback(() => {
    setTriageTimeLeft(30 * 60);
    setCurrentIncident(null);
    setEditingDraft(null);
    triageDeadlineRef.current = null;
  }, []);

  useEffect(() => {
    let timer: number;
    const isTimedView = activeView === 'triage' || activeView === 'report';

    if (isTimedView) {
      if (triageDeadlineRef.current === null) {
        triageDeadlineRef.current = Date.now() + triageTimeLeft * 1000;
      }

      timer = window.setInterval(() => {
        if (triageDeadlineRef.current) {
          const remaining = Math.max(0, Math.round((triageDeadlineRef.current - Date.now()) / 1000));
          
          setTriageTimeLeft(prevTime => {
            if (prevTime > 300 && remaining <= 300) {
              setShowToast(true);
            }
            return remaining;
          });
          
          if (remaining === 0) {
            clearInterval(timer);
            triageDeadlineRef.current = null;
            if (activeView === 'triage') {
              setActiveView('dashboard');
            }
          }
        }
      }, 1000);
    } else {
      triageDeadlineRef.current = null;
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [activeView, setActiveView]);


  // --- Settings Handlers ---
  const handleAddUser = useCallback((newUser: Omit<User, 'id' | 'status'>) => {
    setUsers(prev => [...prev, { ...newUser, id: `user-${Date.now()}`, status: 'Active' }]);
  }, []);

  const handleUpdateUserStatus = useCallback((userId: string, status: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  }, []);

  const handleDeleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const handleUpdateIncidentType = useCallback((originalType: string, newName: string, newTemplate: string) => {
    if (newName !== originalType) {
        // Name is being changed, update all three state objects
        setTypes(prev => {
            const updated = { ...prev };
            delete updated[originalType];
            updated[newName] = newTemplate;
            return updated;
        });
        setPlans(prev => {
            const updated = { ...prev };
            if (updated[originalType]) {
                const plan = updated[originalType];
                delete updated[originalType];
                updated[newName] = plan;
            }
            return updated;
        });
        setSlas(prev => {
            const updated = { ...prev };
            if (updated[originalType]) {
                const sla = updated[originalType];
                delete updated[originalType];
                updated[newName] = sla;
            }
            return updated;
        });
    } else {
        // Only the template is changed
        setTypes(prev => ({ ...prev, [originalType]: newTemplate }));
    }
  }, []);

  const handleDeleteIncidentType = useCallback((typeToDelete: string) => {
    setTypes(prev => {
        const updated = { ...prev };
        delete updated[typeToDelete];
        return updated;
    });
    setPlans(prev => {
        const updated = { ...prev };
        delete updated[typeToDelete];
        return updated;
    });
    setSlas(prev => {
        const updated = { ...prev };
        delete updated[typeToDelete];
        return updated;
    });
  }, []);

  const handleAddIncidentType = useCallback((name: string, template: string) => {
    setTypes(prev => ({ ...prev, [name]: template }));
    setPlans(prev => ({ ...prev, [name]: [] }));
    setSlas(prev => ({
        ...prev,
        [name]: {
            'Critical': { responseMinutes: 15, resolutionMinutes: 60 },
            'High': { responseMinutes: 30, resolutionMinutes: 120 },
            'Medium': { responseMinutes: 60, resolutionMinutes: 240 },
            'Low': { responseMinutes: 120, resolutionMinutes: 480 },
        }
    }));
  }, []);
  // --- End of Settings Handlers ---

  const handleStartReport = (masterIncidentId?: string) => {
    setEditingDraft(null);
    setCurrentIncident({ masterIncidentId: masterIncidentId, key: Math.random() });
    setActiveView('report');
  };
  
  const handleIncidentSubmit = (incidentDetails: IncidentFormData, draftId?: string) => {
    const detectionDate = new Date(incidentDetails.detectionTime);
    const policy = slas[incidentDetails.type]?.[incidentDetails.severity] || { responseMinutes: 60, resolutionMinutes: 480 };
    const slaResponseDeadline = new Date(detectionDate.getTime() + policy.responseMinutes * 60000).toISOString();
    const slaResolutionDeadline = new Date(detectionDate.getTime() + policy.resolutionMinutes * 60000).toISOString();

    const newIncident: Incident = {
        ...incidentDetails,
        id: `INC-${Date.now()}`,
        status: 'ongoing',
        slaResponseDeadline,
        slaResolutionDeadline,
        remediationStartTime: new Date().toISOString(),
        steps: plans[incidentDetails.type] || [],
        children: [],
    };

    setIncidents(prev => {
        const updatedIncidents = [newIncident, ...prev];
        if (newIncident.masterIncidentId) {
            const masterIndex = updatedIncidents.findIndex(inc => inc.id === newIncident.masterIncidentId);
            if (masterIndex > -1) {
                const master = { ...updatedIncidents[masterIndex] };
                master.children = [...(master.children || []), newIncident];
                updatedIncidents[masterIndex] = master;
            }
        }
        return updatedIncidents;
    });
    
    if (draftId) {
        setDrafts(prev => prev.filter(d => d.draftId !== draftId));
    }
    setEditingDraft(null);

    setActiveRemediationIncident(newIncident);
    setActiveView('remediation');
  };

  const handleSaveDraft = (draftData: IncidentFormData, draftId?: string) => {
    if (draftId) {
        setDrafts(prev => prev.map(d => d.draftId === draftId ? { ...draftData, draftId, lastSaved: new Date().toISOString() } : d));
    } else {
        const newDraft: IncidentDraft = {
            ...draftData,
            draftId: `DRAFT-${Date.now()}`,
            lastSaved: new Date().toISOString(),
        };
        setDrafts(prev => [newDraft, ...prev]);
    }
    setEditingDraft(null);
    setActiveView('dashboard');
  };

  const handleEditDraft = (draft: IncidentDraft) => {
      setEditingDraft(draft);
      setCurrentIncident(null);
      setActiveView('report');
  };

  const handleDeleteDraft = (draftId: string) => {
      setDrafts(prev => prev.filter(d => d.draftId !== draftId));
      setDraftToDelete(null);
  };


  const handleFinalReport = (finalizedIncident: Incident) => {
    const ongoingChildren = (finalizedIncident.children || [])
        .map(childRef => incidents.find(i => i.id === childRef.id))
        .filter(child => child && child.status === 'ongoing');

    if (ongoingChildren.length > 0) {
        setBulkResolveState({ isOpen: true, incident: finalizedIncident, childrenCount: ongoingChildren.length });
    } else {
        setIncidents(prev => prev.map(inc => 
            inc.id === finalizedIncident.id ? finalizedIncident : inc
        ));
        setActiveRemediationIncident(null);
        setActiveView('completed');
    }
  };

  const handleConfirmBulkResolve = () => {
    if (!bulkResolveState.incident) return;

    const master = bulkResolveState.incident;
    const completionTime = new Date().toISOString();

    setIncidents(prev => {
        const childIdsToResolve = (master.children || []).map(c => c.id);
        
        return prev.map(inc => {
            // Finalize the master
            if (inc.id === master.id) {
                return master;
            }
            // Finalize the children
            if (childIdsToResolve.includes(inc.id) && inc.status === 'ongoing') {
                return { ...inc, status: 'completed', completionTime };
            }
            return inc;
        });
    });

    setBulkResolveState({ isOpen: false, incident: null, childrenCount: 0 });
    setActiveRemediationIncident(null);
    setActiveView('completed');
  };
  
  const handleSaveProgress = (partiallyUpdatedIncident: Incident) => {
    setIncidents(prev => prev.map(inc => 
        inc.id === partiallyUpdatedIncident.id ? partiallyUpdatedIncident : inc
    ));
    setActiveRemediationIncident(null);
    setActiveView('ongoing');
  };
  
  const handleResumeIncident = (incidentToResume: Incident) => {
      setActiveRemediationIncident(incidentToResume);
      setActiveView('remediation');
  };

  const handleToggleExpandRow = (incidentId: string) => {
    setExpandedRows(prev => ({ ...prev, [incidentId]: !prev[incidentId] }));
  };

  const handleLinkIncidents = (childId: string, masterId: string) => {
    setIncidents(prev => {
        const incidentsCopy = [...prev];
        const childIndex = incidentsCopy.findIndex(i => i.id === childId);
        const masterIndex = incidentsCopy.findIndex(i => i.id === masterId);

        if (childIndex === -1 || masterIndex === -1) return prev; // Should not happen

        const child = { ...incidentsCopy[childIndex], masterIncidentId: masterId };
        const master = { ...incidentsCopy[masterIndex] };
        master.children = [...(master.children || []), child];

        incidentsCopy[childIndex] = child;
        incidentsCopy[masterIndex] = master;

        return incidentsCopy;
    });
    setLinkModalState({ isOpen: false, incidentToLink: null });
    setDetailIncident(null); // Close the detail view after linking
  };

  const viewTitles: { [key in View]: string } = {
    dashboard: t('nav.dashboard'),
    triage: t('nav.reportNewIncident'),
    report: t('nav.reportNewIncident'),
    ongoing: t('nav.ongoingIncidents'),
    completed: t('nav.completedIncidents'),
    settings: t('nav.settings'),
    remediation: t('remediation.liveRemediation'),
    analytics: t('nav.analytics'),
    drafts: t('nav.drafts'),
  };

  const renderContent = () => {
    switch(activeView) {
        case 'dashboard':
            return <DashboardView 
                setActiveView={setActiveView} 
                draftCount={drafts.length} 
                ongoingCount={ongoingCount} 
                completedCount={completedCount} 
            />;
        case 'triage':
            return <TriagePage 
                incidents={incidents.filter(i => i.status === 'ongoing' && !i.masterIncidentId)}
                countdown={triageTimeLeft} 
                onTimeUp={() => { setActiveView('dashboard'); resetTriage(); }}
                onCreateNew={() => handleStartReport()}
                onLinkToMaster={(id) => handleStartReport(id)}
            />;
        case 'report':
            return <ReportForm 
                key={editingDraft?.draftId || currentIncident?.key}
                masterIncidentId={currentIncident?.masterIncidentId}
                onSubmit={handleIncidentSubmit}
                onSaveDraft={handleSaveDraft}
                countdown={triageTimeLeft}
                incidentTemplates={types}
                draft={editingDraft}
            />;
        case 'remediation':
             if (activeRemediationIncident) {
                return <RemediationView 
                    incident={activeRemediationIncident}
                    onFinalize={handleFinalReport}
                    onSaveAndExit={handleSaveProgress}
                />;
             }
             setActiveView('dashboard');
             return null;
        case 'drafts':
            return (
                 <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg h-full flex flex-col">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{viewTitles.drafts}</h2>
                    <div className="flex-grow">
                        <DraftListView drafts={drafts} onEdit={handleEditDraft} onDelete={(id) => setDraftToDelete(id)} />
                    </div>
                 </div>
            );
        case 'ongoing':
        case 'completed': {
            const incidentsToShow = incidents.filter(i => 
                activeView === 'ongoing' ? i.status === 'ongoing' : 
                activeView === 'completed' ? i.status === 'completed' :
                false
            );
            
            const masterIncidents = incidentsToShow.filter(i => !i.masterIncidentId);

            const pageCount = Math.ceil(masterIncidents.length / itemsPerPage);
            const paginatedIncidents = masterIncidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


            return (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg h-full flex flex-col">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{viewTitles[activeView]}</h2>
                  <>
                  <div className="flex-grow">
                    <IncidentListView 
                        incidents={paginatedIncidents} 
                        allIncidents={incidents}
                        expandedRows={expandedRows}
                        onToggleExpand={handleToggleExpandRow}
                        onViewDetails={(inc) => setDetailIncident(inc)}
                        onResume={activeView === 'ongoing' ? handleResumeIncident : undefined}
                    />
                  </div>
                  {pageCount > 1 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                      <button 
                        onClick={() => setCurrentPage(p => p - 1)} 
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium rounded-md bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('common.previous')}
                      </button>
                      <span className="text-sm text-slate-500">{t('common.page', { replacements: { currentPage: currentPage, pageCount: pageCount } })}</span>
                       <button 
                        onClick={() => setCurrentPage(p => p + 1)} 
                        disabled={currentPage === pageCount}
                        className="px-4 py-2 text-sm font-medium rounded-md bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('common.next')}
                      </button>
                    </div>
                  )}
                  </>
              </div>
            );
        }
        case 'settings':
            return <SettingsPage 
              incidents={incidents}
              users={users}
              incidentTypes={types}
              remediationPlans={plans}
              setRemediationPlans={setPlans} // Keep for direct manipulation in ManageRemediationPlans
              slaPolicies={slas}
              setSlaPolicies={setSlas} // Keep for direct manipulation in ManageSLAs
              onAddUser={handleAddUser}
              onUpdateUserStatus={handleUpdateUserStatus}
              onDeleteUser={handleDeleteUser}
              onUpdateIncidentType={handleUpdateIncidentType}
              onDeleteIncidentType={handleDeleteIncidentType}
              onAddIncidentType={handleAddIncidentType}
            />;
        case 'analytics':
            return <AnalyticsPage incidents={incidents} incidentTypes={Object.keys(types)} />;
        default:
            return <DashboardView 
                setActiveView={setActiveView} 
                draftCount={drafts.length} 
                ongoingCount={ongoingCount} 
                completedCount={completedCount}
            />;
    }
  };

  const handleNavClick = (view: View) => {
    if (view === 'triage') {
        resetTriage();
    } else if (view !== 'report' && view !== 'remediation') {
        resetTriage();
        setActiveRemediationIncident(null);
    }
    setActiveView(view);
    setIsSidebarOpen(false);
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      {detailIncident && <IncidentDetailModal incident={detailIncident} onClose={() => setDetailIncident(null)} onLinkToMaster={() => setLinkModalState({isOpen: true, incidentToLink: detailIncident})} />}
      {linkModalState.isOpen && linkModalState.incidentToLink && (
        <LinkMasterModal
            incidents={incidents}
            currentIncident={linkModalState.incidentToLink}
            onClose={() => setLinkModalState({ isOpen: false, incidentToLink: null })}
            onLink={handleLinkIncidents}
        />
      )}
       <ConfirmationModal
            isOpen={bulkResolveState.isOpen}
            onClose={() => setBulkResolveState({ isOpen: false, incident: null, childrenCount: 0 })}
            onConfirm={handleConfirmBulkResolve}
            title={t('bulkResolve.title')}
            message={t('bulkResolve.message', { replacements: { count: bulkResolveState.childrenCount }})}
            confirmText={t('bulkResolve.confirm')}
            confirmButtonClass="bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500"
        />
        <ConfirmationModal
            isOpen={!!draftToDelete}
            onClose={() => setDraftToDelete(null)}
            onConfirm={() => draftToDelete && handleDeleteDraft(draftToDelete)}
            title={t('draftList.deleteConfirmTitle')}
            message={t('draftList.deleteConfirmMessage')}
            confirmText={t('common.delete')}
        />
      <Toast message={t('toast.timeWarning')} duration={5000} show={showToast} onHide={() => setShowToast(false)} />
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-4 transition-all duration-300 no-print">
        <div className="text-center py-4 mb-4">
          <h1 className="text-2xl font-bold tracking-widest text-slate-900">INCIDENTIO</h1>
        </div>
        <nav className="flex-1">
          <ul>
            <NavItem view="dashboard" label={t('nav.dashboard')} activeView={activeView} setActiveView={handleNavClick} Icon={DashboardIcon} isSidebarCollapsed={false} />
            <NavItem view="triage" label={t('nav.reportNewIncident')} activeView={activeView} setActiveView={handleNavClick} Icon={ReportIcon} isSidebarCollapsed={false} />
            <NavItem view="drafts" label={`${t('nav.drafts')} (${drafts.length})`} activeView={activeView} setActiveView={handleNavClick} Icon={DraftIcon} isSidebarCollapsed={false} />
            <NavItem view="analytics" label={t('nav.analytics')} activeView={activeView} setActiveView={handleNavClick} Icon={ChartBarIcon} isSidebarCollapsed={false} />
            <NavItem view="ongoing" label={`${t('nav.ongoingIncidents')} (${ongoingCount})`} activeView={activeView} setActiveView={handleNavClick} Icon={OngoingIcon} isSidebarCollapsed={false} />
            <NavItem view="completed" label={`${t('nav.completedIncidents')} (${completedCount})`} activeView={activeView} setActiveView={handleNavClick} Icon={CompletedIcon} isSidebarCollapsed={false} />
            <NavItem view="settings" label={t('nav.settings')} activeView={activeView} setActiveView={handleNavClick} Icon={SettingsIcon} isSidebarCollapsed={false} />
          </ul>
        </nav>
        <div className="mt-auto space-y-4">
           <LanguageSwitcher />
           <button
            onClick={onLogout}
            className="w-full flex items-center p-3 rounded-lg text-slate-600 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
          >
            <LogoutIcon className="h-6 w-6" />
            <span className="ml-4 font-medium">{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
       <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white/80 backdrop-blur-md border-r border-slate-200 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:hidden no-print`}>
         <aside className="flex flex-col h-full p-4">
            <div className="text-center py-4 mb-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-widest text-slate-900">INCIDENTIO</h1>
                 <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 hover:text-slate-800">
                    <CloseIcon className="h-6 w-6" />
                </button>
            </div>
            <nav className="flex-1">
            <ul>
                <NavItem view="dashboard" label={t('nav.dashboard')} activeView={activeView} setActiveView={handleNavClick} Icon={DashboardIcon} isSidebarCollapsed={false} />
                <NavItem view="triage" label={t('nav.reportNewIncident')} activeView={activeView} setActiveView={handleNavClick} Icon={ReportIcon} isSidebarCollapsed={false} />
                <NavItem view="drafts" label={`${t('nav.drafts')} (${drafts.length})`} activeView={activeView} setActiveView={handleNavClick} Icon={DraftIcon} isSidebarCollapsed={false} />
                <NavItem view="analytics" label={t('nav.analytics')} activeView={activeView} setActiveView={handleNavClick} Icon={ChartBarIcon} isSidebarCollapsed={false} />
                <NavItem view="ongoing" label={`${t('nav.ongoingIncidents')} (${ongoingCount})`} activeView={activeView} setActiveView={handleNavClick} Icon={OngoingIcon} isSidebarCollapsed={false} />
                <NavItem view="completed" label={`${t('nav.completedIncidents')} (${completedCount})`} activeView={activeView} setActiveView={handleNavClick} Icon={CompletedIcon} isSidebarCollapsed={false} />
                <NavItem view="settings" label={t('nav.settings')} activeView={activeView} setActiveView={handleNavClick} Icon={SettingsIcon} isSidebarCollapsed={false} />
            </ul>
            </nav>
             <div className="mt-auto space-y-4">
                <LanguageSwitcher />
                <button
                    onClick={onLogout}
                    className="w-full flex items-center p-3 rounded-lg text-slate-600 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                >
                    <LogoutIcon className="h-6 w-6" />
                    <span className="ml-4 font-medium">{t('nav.logout')}</span>
                </button>
            </div>
         </aside>
      </div>
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-20 md:hidden"></div>}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-slate-200 no-print">
           <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 hover:text-slate-800">
            <MenuIcon className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold text-slate-800">{viewTitles[activeView]}</h2>
          <div className="w-6"></div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;