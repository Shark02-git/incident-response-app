
export type IncidentType = string; // No longer a strict set
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type IncidentStatus = 'ongoing' | 'completed';
export type StepStatus = 'pending' | 'completed' | 'skipped';
export type UserRole = 'Admin' | 'Operator';
export type UserStatus = 'Active' | 'Blocked';


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface StepState {
  status: StepStatus;
  comment: string;
  screenshot?: string | null;
  timeSpent: number; // in seconds
}

export interface RemediationStep {
  id:string;
  title: string;
  description: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  reporter: string; // email
  reporterName: string;
  company: string;
  severity: Severity;
  detectionTime: string;
  completionTime?: string;
  status: IncidentStatus;
  steps: RemediationStep[];
  slaResponseDeadline: string;
  slaResolutionDeadline: string;
  closingNotes?: string;
  masterIncidentId?: string;
  children?: Incident[];
  remediationHistory?: Record<string, Record<string, StepState>>; // Keyed by IncidentID, then StepID
  remediationStartTime?: string;
}

// Represents the data captured in the report form before it becomes a full incident
export type IncidentFormData = Omit<Incident, 'id' | 'status' | 'steps' | 'children' | 'slaResponseDeadline' | 'slaResolutionDeadline' | 'completionTime' | 'remediationStartTime' | 'remediationHistory'>;

// Represents a saved draft
export type IncidentDraft = IncidentFormData & {
  draftId: string;
  lastSaved: string;
};


export const incidentTemplates: Record<IncidentType, string> = {
  'Phishing Attack': 'Phishing attack detected: [Enter details]',
  'Data Breach': 'Data breach investigation: [Enter details]',
  'Service Outage': 'Service outage: [Enter service name]',
  'Malware Infection': 'Malware infection on: [Enter asset]',
};

export const slaPolicies: Record<IncidentType, Record<Severity, { responseMinutes: number, resolutionMinutes: number }>> = {
  'Phishing Attack': {
    'Critical': { responseMinutes: 15, resolutionMinutes: 120 },
    'High': { responseMinutes: 30, resolutionMinutes: 240 },
    'Medium': { responseMinutes: 60, resolutionMinutes: 480 },
    'Low': { responseMinutes: 240, resolutionMinutes: 1440 },
  },
  'Data Breach': {
    'Critical': { responseMinutes: 5, resolutionMinutes: 180 },
    'High': { responseMinutes: 15, resolutionMinutes: 360 },
    'Medium': { responseMinutes: 45, resolutionMinutes: 720 },
    'Low': { responseMinutes: 120, resolutionMinutes: 2880 },
  },
  'Service Outage': {
    'Critical': { responseMinutes: 5, resolutionMinutes: 60 },
    'High': { responseMinutes: 10, resolutionMinutes: 120 },
    'Medium': { responseMinutes: 30, resolutionMinutes: 240 },
    'Low': { responseMinutes: 60, resolutionMinutes: 480 },
  },
  'Malware Infection': {
    'Critical': { responseMinutes: 10, resolutionMinutes: 90 },
    'High': { responseMinutes: 20, resolutionMinutes: 180 },
    'Medium': { responseMinutes: 60, resolutionMinutes: 360 },
    'Low': { responseMinutes: 180, resolutionMinutes: 720 },
  },
};

export const remediationSteps: Record<IncidentType, RemediationStep[]> = {
    'Phishing Attack': [
        { id: 'phish-1', title: 'Identify Malicious Emails', description: 'Search mail server logs for emails matching the phishing template.' },
        { id: 'phish-2', title: 'Quarantine Emails', description: 'Remove all identified malicious emails from user inboxes.' },
        { id: 'phish-3', title: 'Block Sender & IPs', description: 'Add sender email, domain, and associated IP addresses to the blocklist.' },
        { id: 'phish-4', title: 'Reset Compromised Credentials', description: 'Force password reset for all users who clicked the phishing link.' },
    ],
    'Service Outage': [
        { id: 'outage-1', title: 'Check Monitoring Dashboards', description: 'Review Grafana, Datadog for initial alerts and metrics.' },
        { id: 'outage-2', title: 'Verify Cloud Provider Status', description: 'Check AWS/GCP/Azure status pages for regional issues.' },
        { id: 'outage-3', title: 'Restart Application Services', description: 'Perform a rolling restart of the affected microservices.' },
        { id: 'outage-4', title: 'Analyze Logs', description: 'Check application and infrastructure logs for error messages around the time of the outage.' },
    ],
    'Data Breach': [
        { id: 'breach-1', title: 'Isolate Affected Systems', description: 'Remove compromised servers or databases from the production network.' },
        { id: 'breach-2', title: 'Preserve Evidence', description: 'Take snapshots and memory dumps of affected systems for forensic analysis.' },
        { id: 'breach-3', 'title': 'Identify Breach Vector', description: 'Analyze logs and systems to determine how the attacker gained access.' },
        { id: 'breach-4', 'title': 'Notify Legal & Compliance', description: 'Engage the legal team to assess notification requirements.' },
    ],
    'Malware Infection': [
        { id: 'malware-1', title: 'Disconnect Host', description: 'Disconnect the infected machine from the network to prevent spread.' },
        { id: 'malware-2', title: 'Run Antivirus Scan', description: 'Run a full system scan with updated antivirus definitions.' },
        { id: 'malware-3', title: 'Identify Malware Strain', description: 'Use analysis tools to identify the specific type of malware.' },
        { id: 'malware-4', title: 'Reimage Machine', description: 'Wipe and reimage the machine from a known good source.' },
    ]
}


export const mockUsers: User[] = [
    { id: 'user-1', name: 'Admin User', email: 'demo@example.com', role: 'Admin', status: 'Active' },
    { id: 'user-2', name: 'John Operator', email: 'john.o@example.com', role: 'Operator', status: 'Active' },
    { id: 'user-3', name: 'Jane Smith', email: 'jane.s@example.com', role: 'Operator', status: 'Blocked' },
];

const childIncident1: Incident = {
  id: 'CHILD-2024-001',
  masterIncidentId: 'INC-2024-001',
  type: 'Service Outage',
  title: 'Login service failing for EU users',
  reporter: 'jane.s@example.com',
  reporterName: 'Jane Smith',
  company: 'Client Europe',
  severity: 'High',
  detectionTime: '2024-07-29T10:05:00Z',
  status: 'ongoing',
  remediationStartTime: '2024-07-29T10:06:00Z',
  steps: remediationSteps['Service Outage'].slice(0, 2), // Subset of steps
  slaResponseDeadline: '2024-07-29T10:35:00Z',
  slaResolutionDeadline: '2024-07-29T14:05:00Z',
  children: []
};

const childIncident2: Incident = {
  id: 'CHILD-2024-002',
  masterIncidentId: 'INC-2024-001',
  type: 'Service Outage',
  title: 'Payment processing timeouts',
  reporter: 'john.o@example.com',
  reporterName: 'John Operator',
  company: 'Payments API Team',
  severity: 'High',
  detectionTime: '2024-07-29T10:08:00Z',
  status: 'ongoing',
  remediationStartTime: '2024-07-29T10:09:00Z',
  steps: remediationSteps['Service Outage'].slice(2, 4), // Different subset of steps
  slaResponseDeadline: '2024-07-29T10:38:00Z',
  slaResolutionDeadline: '2024-07-29T14:08:00Z',
  children: []
};

export const mockIncidents: Incident[] = [
  {
    id: 'INC-2024-001',
    type: 'Service Outage',
    title: 'API Gateway Unresponsive',
    reporter: 'monitoring@system.com',
    reporterName: 'Monitoring Bot',
    company: 'Incidentio Corp',
    severity: 'Critical',
    detectionTime: '2024-07-29T10:00:00Z',
    status: 'ongoing',
    remediationStartTime: '2024-07-29T10:01:00Z',
    steps: remediationSteps['Service Outage'],
    slaResponseDeadline: '2024-07-29T10:05:00Z',
    slaResolutionDeadline: '2024-07-29T11:00:00Z',
    children: [childIncident1, childIncident2],
  },
  childIncident1,
  childIncident2,
  {
    id: 'INC-2024-002',
    type: 'Phishing Attack',
    title: 'Phishing Campaign Targeting Finance Dept',
    reporter: 'security@internal',
    reporterName: 'Security Team',
    company: 'Incidentio Corp',
    severity: 'High',
    detectionTime: '2024-07-28T14:30:00Z',
    status: 'ongoing',
    remediationStartTime: '2024-07-28T14:32:00Z',
    steps: remediationSteps['Phishing Attack'],
    slaResponseDeadline: '2024-07-28T15:00:00Z',
    slaResolutionDeadline: '2024-07-28T18:30:00Z',
    children: [],
  },
   {
    id: 'INC-2023-105',
    type: 'Data Breach',
    title: 'User Database Credentials Leaked',
    reporter: 'security@internal',
    reporterName: 'Security Team',
    company: 'Incidentio Corp',
    severity: 'Critical',
    detectionTime: '2023-11-15T09:00:00Z',
    completionTime: '2023-11-15T11:45:00Z',
    status: 'completed',
    remediationStartTime: '2023-11-15T09:02:15Z',
    steps: remediationSteps['Data Breach'],
    slaResponseDeadline: '2023-11-15T09:05:00Z',
    slaResolutionDeadline: '2023-11-15T12:00:00Z',
    closingNotes: "The breach was contained by rotating all credentials and isolating the affected database. A patch has been applied to the vulnerable library. All affected users have been notified.",
    remediationHistory: {
      'INC-2023-105': {
        'breach-1': { status: 'completed', comment: 'Network isolation confirmed via firewall rules.', timeSpent: 305, screenshot: null },
        'breach-2': { status: 'completed', comment: 'EBS snapshots taken for all relevant volumes.', timeSpent: 621, screenshot: null },
        'breach-3': { status: 'completed', comment: 'Determined to be a vulnerable third-party library.', timeSpent: 1253, screenshot: null },
        'breach-4': { status: 'skipped', comment: 'Not required for this type of internal credential leak per policy 3.4.a.', timeSpent: 122, screenshot: null }
      }
    },
    children: [],
  },
];
