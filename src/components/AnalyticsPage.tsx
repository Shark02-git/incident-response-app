
import React, { useState, useMemo } from 'react';
import { Incident, Severity, IncidentType, StepState } from '../lib/mockData.ts';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PieController } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import SearchIcon from './icons/SearchIcon.tsx';
import PrinterIcon from './icons/PrinterIcon.tsx';
import DownloadIcon from './icons/DownloadIcon.tsx';
import { useTranslation } from '../lib/i18n.tsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PieController);

interface AnalyticsPageProps {
    incidents: Incident[];
    incidentTypes: IncidentType[];
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ incidents, incidentTypes }) => {
    const { t, language } = useTranslation();
    const severities: Severity[] = ['Critical', 'High', 'Medium', 'Low'];

    const formatDuration = (ms: number) => {
        if (ms < 0) ms = 0;
        const totalSeconds = Math.floor(ms / 1000);
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600);
        
        if (hours > 0) return t('time.hm', { replacements: { hours, minutes } });
        if (minutes > 0) return t('time.ms', { replacements: { minutes, seconds } });
        return t('time.s', { replacements: { seconds } });
    };

    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        severity: 'all',
        type: 'all',
        startDate: '',
        endDate: '',
    });

    const filteredIncidents = useMemo(() => {
        return incidents.filter(inc => {
            const detectionDate = new Date(inc.detectionTime);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;
            if (startDate) startDate.setHours(0,0,0,0);


            if (startDate && detectionDate < startDate) return false;
            if (endDate) {
                const endOfDay = new Date(filters.endDate);
                endOfDay.setHours(23,59,59,999);
                if(detectionDate > endOfDay) return false;
            }
            if (filters.status !== 'all' && inc.status !== filters.status) return false;
            if (filters.severity !== 'all' && inc.severity !== filters.severity) return false;
            if (filters.type !== 'all' && inc.type !== filters.type) return false;
            if (filters.search && !inc.title.toLowerCase().includes(filters.search.toLowerCase()) && !inc.id.toLowerCase().includes(filters.search.toLowerCase())) return false;

            return true;
        });
    }, [incidents, filters]);

    const kpis = useMemo(() => {
        const completed = filteredIncidents.filter(inc => inc.status === 'completed' && inc.completionTime);
        const totalResolutionTime = completed.reduce((acc, inc) => {
            const detection = new Date(inc.detectionTime).getTime();
            const completion = new Date(inc.completionTime!).getTime();
            return acc + (completion - detection);
        }, 0);

        return {
            total: filteredIncidents.length,
            completed: completed.length,
            avgResolutionTime: completed.length > 0 ? formatDuration(totalResolutionTime / completed.length) : 'N/A',
        };
    }, [filteredIncidents, t]);

    const chartData = useMemo(() => {
        const incidentsBySeverity = severities.map(sev => filteredIncidents.filter(inc => inc.severity === sev).length);
        const incidentsByType = incidentTypes.map(type => ({
            type,
            count: filteredIncidents.filter(inc => inc.type === type).length
        })).filter(item => item.count > 0);

        return {
            severity: {
                labels: severities.map(s => t(`severity.${s.toLowerCase()}`)),
                datasets: [{
                    label: t('analyticsPage.charts.incidentCount'),
                    data: incidentsBySeverity,
                    backgroundColor: ['rgba(239, 68, 68, 0.6)', 'rgba(249, 115, 22, 0.6)', 'rgba(234, 179, 8, 0.6)', 'rgba(56, 189, 248, 0.6)'],
                    borderColor: ['rgb(239, 68, 68)', 'rgb(249, 115, 22)', 'rgb(234, 179, 8)', 'rgb(56, 189, 248)'],
                    borderWidth: 1
                }]
            },
            type: {
                labels: incidentsByType.map(t => t.type),
                datasets: [{
                    data: incidentsByType.map(t => t.count),
                     backgroundColor: [
                        'rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 206, 86, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                         'rgb(54, 162, 235)', 'rgb(255, 99, 132)', 'rgb(75, 192, 192)',
                        'rgb(255, 206, 86)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)'
                    ],
                    borderWidth: 1
                }]
            }
        };
    }, [filteredIncidents, incidentTypes, t]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePrint = () => window.print();

    const handleExportCsv = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        const headers = [
            t('csv.incidentId'), t('csv.parentId'), t('csv.title'), t('csv.status'),
            t('csv.severity'), t('csv.type'), t('csv.detectionTime'), t('csv.completionTime'),
            t('csv.stepId'), t('csv.stepTitle'), t('csv.stepStatus'), t('csv.timeSpent'), t('csv.stepComment')
        ];
        csvContent += headers.join(",") + "\r\n";

        filteredIncidents.forEach(inc => {
            const commonFields = [inc.id, inc.masterIncidentId || '', `"${inc.title}"`, t(`status.${inc.status}`), t(`severity.${inc.severity.toLowerCase()}`), inc.type, inc.detectionTime, inc.completionTime || ''];
            if(inc.remediationHistory && inc.remediationHistory[inc.id]) {
                const history = inc.remediationHistory[inc.id];
                 inc.steps.forEach(step => {
                    const stepState: StepState = history[step.id] || { status: 'pending', comment: '', timeSpent: 0 };
                    const row = [...commonFields, step.id, `"${step.title}"`, t(`stepStatus.${stepState.status}`), stepState.timeSpent, `"${stepState.comment.replace(/"/g, '""')}"`];
                    csvContent += row.join(",") + "\r\n";
                });
            } else {
                 csvContent += commonFields.join(",") + "\r\n";
            }
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `incident_report_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#475569' } } }, // slate-600
        scales: {
            y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(203, 213, 225, 0.5)' } }, // slate-500, slate-300
            x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(203, 213, 225, 0.5)' } }
        }
    };
    
    const KPI_CARD_STYLES = "bg-white border border-slate-200 rounded-xl p-6 shadow-lg";

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center no-print">
            <h2 className="text-3xl font-bold text-slate-800">{t('analyticsPage.title')}</h2>
            <div className="flex gap-2">
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors text-slate-700 font-medium">
                    <PrinterIcon className="h-4 w-4" /> {t('analyticsPage.printSummary')}
                </button>
                <button onClick={handleExportCsv} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors text-white font-medium">
                    <DownloadIcon className="h-4 w-4" /> {t('analyticsPage.exportCsv')}
                </button>
            </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-lg no-print">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div className="relative xl:col-span-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="text" name="search" placeholder={t('analyticsPage.filters.searchPlaceholder')} value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900" />
                </div>
                 <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full py-2 px-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-900">
                    <option value="all">{t('analyticsPage.filters.allStatuses')}</option>
                    <option value="ongoing">{t('status.ongoing')}</option>
                    <option value="completed">{t('status.completed')}</option>
                </select>
                <select name="severity" value={filters.severity} onChange={handleFilterChange} className="w-full py-2 px-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-900">
                    <option value="all">{t('analyticsPage.filters.allSeverities')}</option>
                    {severities.map(s => <option key={s} value={s}>{t(`severity.${s.toLowerCase()}`)}</option>)}
                </select>
                <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full py-2 px-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-900">
                    <option value="all">{t('analyticsPage.filters.allTypes')}</option>
                    {incidentTypes.map(typ => <option key={typ} value={typ}>{typ}</option>)}
                </select>
                 <div className="flex items-center gap-2">
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full py-2 px-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-900" />
                    <span className="text-slate-400">-</span>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full py-2 px-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-900" />
                </div>
            </div>
        </div>

        <div id="printable-summary" className="printable-area">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={KPI_CARD_STYLES}>
                  <h3 className="text-slate-500 text-sm font-medium">{t('analyticsPage.kpi.totalIncidents')}</h3>
                  <p className="text-4xl font-bold text-slate-800 mt-2">{kpis.total}</p>
              </div>
              <div className={KPI_CARD_STYLES}>
                  <h3 className="text-slate-500 text-sm font-medium">{t('analyticsPage.kpi.completedIncidents')}</h3>
                  <p className="text-4xl font-bold text-slate-800 mt-2">{kpis.completed}</p>
              </div>
              <div className={KPI_CARD_STYLES}>
                  <h3 className="text-slate-500 text-sm font-medium">{t('analyticsPage.kpi.avgResolutionTime')}</h3>
                  <p className="text-4xl font-bold text-slate-800 mt-2">{kpis.avgResolutionTime}</p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
              <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">{t('analyticsPage.charts.bySeverity')}</h3>
                  <div className="h-80"><Bar options={chartOptions} data={chartData.severity} /></div>
              </div>
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
                   <h3 className="text-lg font-bold text-slate-800 mb-4">{t('analyticsPage.charts.byType')}</h3>
                   <div className="h-80"><Pie options={{...chartOptions, plugins: { legend: { position: 'right', labels: { color: '#475569'} } }}} data={chartData.type} /></div>
              </div>
          </div>
        </div>

      </div>
    );
};

export default AnalyticsPage;