
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'th';

// Helper to safely access nested properties
const get = (obj: any, path: string) => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) return undefined;
  }
  return result;
};

const translations = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      previous: 'Previous',
      next: 'Next',
      page: 'Page {{currentPage}} of {{pageCount}}',
      timeRemaining: 'Time Remaining',
      saveChanges: 'Save Changes',
    },
    nav: {
      dashboard: 'Dashboard',
      reportNewIncident: 'Report New Incident',
      analytics: 'Analytics',
      ongoingIncidents: 'Ongoing Incidents',
      completedIncidents: 'Completed Incidents',
      settings: 'Settings',
      logout: 'Logout',
      drafts: 'Drafts',
    },
    loginPage: {
      welcome: 'Welcome Back',
      signInToContinue: 'Sign in to continue your journey.',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      rememberMe: 'Remember me',
      forgotPasswordAdmin: 'In case of forgotten username or password, contact admin.',
      signIn: 'Sign In',
      signingIn: 'Signing In...',
      invalidCredentials: 'Invalid credentials. Try demo@example.com / password',
    },
    dashboard: {
        welcome: 'Welcome, Operator',
        selectTask: 'Select a task to get started.',
        reportNew_desc: "File a new report for a recent event.",
        analytics_desc: "View KPIs, charts, and export incident data.",
        ongoing_desc: "View and manage incidents currently in progress.",
        completed_desc: "Review history and details of resolved incidents.",
        drafts_desc: "Continue working on saved incident reports.",
        go: "Go"
    },
    incidentList: {
        id: "ID",
        title: "Title",
        severity: "Severity",
        responseSla: "Response SLA",
        resolveSla: "Resolve SLA",
        actions: "Actions",
        viewDetails: "View Details",
        resume: "Resume",
        noIncidents: "No incidents to display."
    },
    draftList: {
        title: "Draft Incidents",
        noDrafts: "You have no saved drafts.",
        lastSaved: "Last Saved",
        editDraft: "Edit Draft",
        deleteDraft: "Delete",
        untitled: "Untitled",
        deleteConfirmTitle: "Delete Draft?",
        deleteConfirmMessage: "Are you sure you want to permanently delete this draft?",
    },
    triagePage: {
        title: "Incident Triage",
        subtitle: "Link to an existing incident or create a new one.",
        searchLabel: "Search for an existing master incident",
        searchPlaceholder: "Search by title or ID...",
        matchingIncidents: "Matching Incidents",
        severity: "Severity",
        noResults: "No matching incidents found.",
        startTyping: "Start typing to search.",
        linkToMaster: "Link to Selected Master",
        createNew: "Create New Incident"
    },
    reportForm: {
        title: "Report New Incident",
        linkingTo: "Linking to master incident: {{id}}",
        creatingNew: "Creating a new master incident.",
        editingDraft: "Editing a saved draft.",
        incidentType: "Incident Type",
        severityLevel: "Severity Level",
        incidentTitle: "Incident Title",
        detectionTime: "Detection Date & Time",
        reporterName: "Reporter's Name",
        reporterEmail: "Reporter's Email",
        company: "Company",
        submit: "Submit and Begin Remediation",
        saveDraft: "Save as Draft",
        specifyService: "Specify Service",
        specifyAsset: "Specify Asset"
    },
    remediation: {
        liveRemediation: "Live Remediation Workflow",
        title: "Live Remediation: {{incidentTitle}}",
        commentPlaceholder: "Add an optional comment...",
        complete: "Complete",
        skip: "Skip",
        attachScreenshot: "Attach Screenshot",
        changeScreenshot: "Change Screenshot",
        finalReportTitle: "Final Report",
        finalReportSubtitle: "All remediation steps have been actioned. Please provide closing notes and submit the final report.",
        closingNotesPlaceholder: "Enter final closing notes here...",
        submitFinalReport: "Submit Final Report & Close Incident",
        saveAndExit: "Save & Exit"
    },
    modal: {
        status: "Status",
        severity: "Severity",
        type: "Type",
        reporter: "Reporter",
        detectionTime: "Detection Time",
        responseSla: "Response SLA",
        resolutionSla: "Resolution SLA",
        relationships: "Incident Relationships",
        parentIncident: "Parent Incident",
        childIncidents: "Child Incidents",
        closingNotes: "Closing Notes",
        remediationDetails: "Remediation Details",
        remediationPlanFor: "Remediation Plan for",
        printToPdf: "Print to PDF",
        timeSpent: "Time Spent",
        comment: "Comment",
        attachment: "Attachment",
        attachmentAlt: "Attached screenshot",
        linkToMaster: "Link to Master",
        cannotLinkTooltip: "This incident cannot be linked because it is already a child or has children."
    },
    linkMasterModal: {
        title: "Link to Master Incident",
        subtitle: "Select a master incident to link '{{id}}' to.",
        searchPlaceholder: "Search for a master incident...",
        noResults: "No potential master incidents found.",
        linkButton: "Link Incident"
    },
    bulkResolve: {
        title: "Resolve Child Incidents?",
        message: "Resolving this master incident will also resolve its {{count}} linked, ongoing child incident(s). This action cannot be undone.",
        confirm: "Resolve All"
    },
    analyticsPage: {
        title: "Reports & Analytics",
        printSummary: "Print Summary",
        exportCsv: "Export CSV",
        filters: {
            searchPlaceholder: "Search ID or Title...",
            allStatuses: "All Statuses",
            allSeverities: "All Severities",
            allTypes: "All Types",
        },
        kpi: {
            totalIncidents: "Total Incidents",
            completedIncidents: "Completed Incidents",
            avgResolutionTime: "Average Resolution Time",
        },
        charts: {
            bySeverity: "Incidents by Severity",
            byType: "Incidents by Type",
            incidentCount: "# of Incidents"
        }
    },
    settings: {
        title: "Admin Settings",
        nav: {
            users: "Manage Users",
            incidentTypes: "Incident Types",
            remediationPlans: "Remediation Plans",
            slaPolicies: "SLA Policies"
        },
        users: {
            title: "Manage Users",
            deleteConfirmTitle: "Delete User?",
            deleteConfirmMessage: "Are you sure you want to permanently delete this user? This action cannot be undone.",
            colName: "Name",
            colEmail: "Email",
            colRole: "Role",
            colStatus: "Status",
            colActions: "Actions",
            block: "Block",
            unblock: "Unblock",
            placeholderName: "Full Name",
            placeholderEmail: "Email Address",
            addNew: "Add New User"
        },
        types: {
            title: "Manage Incident Types",
            description: "Define the categories of incidents and their default title templates. Use [Date], [Service Name], or [Asset] as placeholders.",
            deleteConfirmTitle: "Delete Incident Type?",
            deleteConfirmMessage: "Are you sure you want to delete '{{type}}'? This will also remove associated remediation plans and SLA policies. This action cannot be undone.",
            alreadyExists: "An incident type with this name already exists.",
            namePlaceholder: "Incident Type Name",
            templatePlaceholder: "Title Template",
            addNewTitle: "Add New Type",
            addButton: "Add Type",
            inUseTooltip: "Cannot delete because this type is in use by one or more incidents.",
            inUseErrorDelete: "Cannot delete '{{type}}' because it's currently in use by one or more incidents.",
            inUseErrorRename: "Cannot rename '{{type}}' because it's currently in use. You can still edit the template.",
            inUseInfoRename: "Renaming is disabled because this type is in use. You can still update the title template."
        },
        plans: {
            title: "Manage Remediation Plans",
            selectLabel: "Select Incident Type to Manage",
            noSteps: "No remediation steps defined for this incident type.",
            addNewTitle: "Add New Step to \"{{type}}\"",
            stepTitlePlaceholder: "New Step Title",
            stepDescPlaceholder: "New Step Description",
            addButton: "Add Step",
            deleteConfirmTitle: "Delete Step?",
            deleteConfirmMessage: "Are you sure you want to delete this remediation step?"
        },
        slas: {
            title: "Manage SLA Policies",
            description: "Set response and resolution times in minutes for each incident type and severity.",
            saveSuccess: "SLA policies have been updated!",
            colIncidentType: "Incident Type",
            response: "Response",
            resolution: "Resolution"
        }
    },
    toast: {
        timeWarning: "Triage time is running out!"
    },
    time: {
      justNow: "Just now",
      minuteAgo: "{{count}} minute ago",
      minutesAgo: "{{count}} minutes ago",
      hmAgo: "{{hours}}h {{minutes}}m ago",
      seconds: "{{count}}s",
      minutesSeconds: "{{minutes}}m {{seconds}}s",
      hm: "{{hours}}h {{minutes}}m",
      ms: "{{minutes}}m {{seconds}}s",
      s: "{{seconds}}s"
    },
    severity: {
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    status: {
        ongoing: "Ongoing",
        completed: "Completed",
    },
    stepStatus: {
        pending: "Pending",
        completed: "Completed",
        skipped: "Skipped"
    },
    userRole: {
        admin: "Admin",
        operator: "Operator"
    },
    userStatus: {
        active: "Active",
        blocked: "Blocked"
    },
    incidentTypes: {
        phishingAttack: "Phishing Attack",
        dataBreach: "Data Breach",
        serviceOutage: "Service Outage",
        malwareInfection: "Malware Infection"
    },
    incidentTemplates: {
        phishingAttack: "Phishing attack detected: [Enter details]",
        dataBreach: "Data breach investigation: [Enter details]",
        serviceOutage: "Service outage: [Enter service name]",
        malwareInfection: "Malware infection on: [Enter asset]"
    },
    csv: {
        incidentId: "Incident ID",
        parentId: "Parent ID",
        title: "Title",
        status: "Status",
        severity: "Severity",
        type: "Type",
        detectionTime: "Detection Time",
        completionTime: "Completion Time",
        stepId: "Step ID",
        stepTitle: "Step Title",
        stepStatus: "Step Status",
        timeSpent: "Time Spent (s)",
        stepComment: "Step Comment"
    }
  },
  th: {
    common: {
      save: 'บันทึก',
      cancel: 'ยกเลิก',
      delete: 'ลบ',
      edit: 'แก้ไข',
      close: 'ปิด',
      previous: 'ก่อนหน้า',
      next: 'ถัดไป',
      page: 'หน้า {{currentPage}} จาก {{pageCount}}',
      timeRemaining: 'เวลาที่เหลือ',
      saveChanges: 'บันทึกการเปลี่ยนแปลง',
    },
    nav: {
      dashboard: 'แดชบอร์ด',
      reportNewIncident: 'รายงานเหตุการณ์ใหม่',
      analytics: 'รายงานและบทวิเคราะห์',
      ongoingIncidents: 'เหตุการณ์ที่กำลังเกิด',
      completedIncidents: 'เหตุการณ์ที่เสร็จสิ้น',
      settings: 'การตั้งค่า',
      logout: 'ออกจากระบบ',
      drafts: 'ฉบับร่าง',
    },
    loginPage: {
        welcome: 'ยินดีต้อนรับกลับ',
        signInToContinue: 'ลงชื่อเข้าใช้เพื่อดำเนินการต่อ',
        emailLabel: 'ที่อยู่อีเมล',
        passwordLabel: 'รหัสผ่าน',
        rememberMe: 'จดจำฉันไว้',
        forgotPasswordAdmin: 'กรณีลืมชื่อผู้ใช้หรือรหัสผ่าน ติดต่อผู้ดูแลระบบ',
        signIn: 'ลงชื่อเข้าใช้',
        signingIn: 'กำลังลงชื่อเข้าใช้...',
        invalidCredentials: 'ข้อมูลประจำตัวไม่ถูกต้อง ลอง demo@example.com / password',
    },
    dashboard: {
        welcome: 'ยินดีต้อนรับ, เจ้าหน้าที่',
        selectTask: 'เลือกงานเพื่อเริ่มต้น',
        reportNew_desc: "ยื่นรายงานใหม่สำหรับเหตุการณ์ล่าสุด",
        analytics_desc: "ดู KPI, แผนภูมิ และส่งออกข้อมูลเหตุการณ์",
        ongoing_desc: "ดูและจัดการเหตุการณ์ที่กำลังดำเนินการอยู่",
        completed_desc: "ตรวจสอบประวัติและรายละเอียดของเหตุการณ์ที่แก้ไขแล้ว",
        drafts_desc: "ทำงานต่อจากรายงานเหตุการณ์ที่บันทึกไว้",
        go: "ไป"
    },
    incidentList: {
        id: "ID",
        title: "หัวข้อ",
        severity: "ระดับความรุนแรง",
        responseSla: "SLA การตอบกลับ",
        resolveSla: "SLA การแก้ไข",
        actions: "การดำเนินการ",
        viewDetails: "ดูรายละเอียด",
        resume: "ทำต่อ",
        noIncidents: "ไม่มีเหตุการณ์ที่จะแสดง"
    },
    draftList: {
        title: "เหตุการณ์ฉบับร่าง",
        noDrafts: "คุณไม่มีฉบับร่างที่บันทึกไว้",
        lastSaved: "บันทึกล่าสุด",
        editDraft: "แก้ไขฉบับร่าง",
        deleteDraft: "ลบ",
        untitled: "ไม่มีชื่อ",
        deleteConfirmTitle: "ลบฉบับร่าง?",
        deleteConfirmMessage: "คุณแน่ใจหรือไม่ว่าต้องการลบฉบับร่างนี้อย่างถาวร?",
    },
    triagePage: {
        title: "การคัดแยกเหตุการณ์",
        subtitle: "เชื่อมโยงกับเหตุการณ์ที่มีอยู่หรือสร้างใหม่",
        searchLabel: "ค้นหาเหตุการณ์หลักที่มีอยู่",
        searchPlaceholder: "ค้นหาด้วยหัวข้อหรือ ID...",
        matchingIncidents: "เหตุการณ์ที่ตรงกัน",
        severity: "ระดับความรุนแรง",
        noResults: "ไม่พบเหตุการณ์ที่ตรงกัน",
        startTyping: "เริ่มพิมพ์เพื่อค้นหา",
        linkToMaster: "เชื่อมโยงกับเหตุการณ์หลักที่เลือก",
        createNew: "สร้างเหตุการณ์ใหม่"
    },
    reportForm: {
        title: "รายงานเหตุการณ์ใหม่",
        linkingTo: "กำลังเชื่อมโยงกับเหตุการณ์หลัก: {{id}}",
        creatingNew: "กำลังสร้างเหตุการณ์หลักใหม่",
        editingDraft: "กำลังแก้ไขฉบับร่างที่บันทึกไว้",
        incidentType: "ประเภทเหตุการณ์",
        severityLevel: "ระดับความรุนแรง",
        incidentTitle: "หัวข้อเหตุการณ์",
        detectionTime: "วันที่และเวลาที่ตรวจพบ",
        reporterName: "ชื่อผู้รายงาน",
        reporterEmail: "อีเมลผู้รายงาน",
        company: "บริษัท",
        submit: "ส่งและเริ่มการแก้ไข",
        saveDraft: "บันทึกเป็นฉบับร่าง",
        specifyService: "ระบุบริการ",
        specifyAsset: "ระบุทรัพย์สิน"
    },
    remediation: {
        liveRemediation: "กระบวนการแก้ไขสด",
        title: "การแก้ไขสด: {{incidentTitle}}",
        commentPlaceholder: "เพิ่มความคิดเห็น (ไม่บังคับ)...",
        complete: "เสร็จสิ้น",
        skip: "ข้าม",
        attachScreenshot: "แนบภาพหน้าจอ",
        changeScreenshot: "เปลี่ยนภาพหน้าจอ",
        finalReportTitle: "รายงานฉบับสุดท้าย",
        finalReportSubtitle: "ขั้นตอนการแก้ไขทั้งหมดได้ดำเนินการแล้ว กรุณาใส่บันทึกปิดและส่งรายงานฉบับสุดท้าย",
        closingNotesPlaceholder: "ป้อนบันทึกปิดสุดท้ายที่นี่...",
        submitFinalReport: "ส่งรายงานฉบับสุดท้ายและปิดเหตุการณ์",
        saveAndExit: "บันทึกและออก"
    },
    modal: {
        status: "สถานะ",
        severity: "ระดับความรุนแรง",
        type: "ประเภท",
        reporter: "ผู้รายงาน",
        detectionTime: "เวลาที่ตรวจพบ",
        responseSla: "SLA การตอบกลับ",
        resolutionSla: "SLA การแก้ไข",
        relationships: "ความสัมพันธ์ของเหตุการณ์",
        parentIncident: "เหตุการณ์หลัก",
        childIncidents: "เหตุการณ์ย่อย",
        closingNotes: "บันทึกปิด",
        remediationDetails: "รายละเอียดการแก้ไข",
        remediationPlanFor: "แผนการแก้ไขสำหรับ",
        printToPdf: "พิมพ์เป็น PDF",
        timeSpent: "เวลาที่ใช้",
        comment: "ความคิดเห็น",
        attachment: "ไฟล์แนบ",
        attachmentAlt: "ภาพหน้าจอที่แนบมา",
        linkToMaster: "เชื่อมโยงกับเหตุการณ์หลัก",
        cannotLinkTooltip: "ไม่สามารถเชื่อมโยงเหตุการณ์นี้ได้เนื่องจากเป็นเหตุการณ์ย่อยอยู่แล้วหรือมีเหตุการณ์ย่อยอยู่แล้ว"
    },
    linkMasterModal: {
        title: "เชื่อมโยงกับเหตุการณ์หลัก",
        subtitle: "เลือกเหตุการณ์หลักเพื่อเชื่อมโยง '{{id}}' ไปยัง",
        searchPlaceholder: "ค้นหาเหตุการณ์หลัก...",
        noResults: "ไม่พบเหตุการณ์หลักที่สามารถเป็นไปได้",
        linkButton: "เชื่อมโยงเหตุการณ์"
    },
    bulkResolve: {
        title: "แก้ไขเหตุการณ์ย่อยหรือไม่?",
        message: "การแก้ไขเหตุการณ์หลักนี้จะแก้ไขเหตุการณ์ย่อยที่เชื่อมโยงและกำลังดำเนินการอยู่ {{count}} รายการด้วย การกระทำนี้ไม่สามารถยกเลิกได้",
        confirm: "แก้ไขทั้งหมด"
    },
    analyticsPage: {
        title: "รายงานและบทวิเคราะห์",
        printSummary: "พิมพ์สรุป",
        exportCsv: "ส่งออกเป็น CSV",
        filters: {
            searchPlaceholder: "ค้นหา ID หรือหัวข้อ...",
            allStatuses: "ทุกสถานะ",
            allSeverities: "ทุกระดับความรุนแรง",
            allTypes: "ทุกประเภท",
        },
        kpi: {
            totalIncidents: "จำนวนเหตุการณ์ทั้งหมด",
            completedIncidents: "เหตุการณ์ที่เสร็จสิ้น",
            avgResolutionTime: "เวลาเฉลี่ยในการแก้ไข",
        },
        charts: {
            bySeverity: "เหตุการณ์ตามระดับความรุนแรง",
            byType: "เหตุการณ์ตามประเภท",
            incidentCount: "จำนวนเหตุการณ์"
        }
    },
    settings: {
        title: "การตั้งค่าผู้ดูแลระบบ",
        nav: {
            users: "จัดการผู้ใช้",
            incidentTypes: "ประเภทเหตุการณ์",
            remediationPlans: "แผนการแก้ไข",
            slaPolicies: "นโยบาย SLA"
        },
        users: {
            title: "จัดการผู้ใช้",
            deleteConfirmTitle: "ลบผู้ใช้?",
            deleteConfirmMessage: "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้อย่างถาวร? การกระทำนี้ไม่สามารถยกเลิกได้",
            colName: "ชื่อ",
            colEmail: "อีเมล",
            colRole: "บทบาท",
            colStatus: "สถานะ",
            colActions: "การดำเนินการ",
            block: "บล็อก",
            unblock: "ปลดบล็อก",
            placeholderName: "ชื่อเต็ม",
            placeholderEmail: "ที่อยู่อีเมล",
            addNew: "เพิ่มผู้ใช้ใหม่"
        },
        types: {
            title: "จัดการประเภทเหตุการณ์",
            description: "กำหนดหมวดหมู่ของเหตุการณ์และแม่แบบหัวข้อเริ่มต้น ใช้ [Date], [Service Name], หรือ [Asset] เป็นตัวยึดตำแหน่ง",
            deleteConfirmTitle: "ลบประเภทเหตุการณ์?",
            deleteConfirmMessage: "คุณแน่ใจหรือไม่ว่าต้องการลบ '{{type}}'? การดำเนินการนี้จะลบแผนการแก้ไขและนโยบาย SLA ที่เกี่ยวข้องด้วย การกระทำนี้ไม่สามารถยกเลิกได้",
            alreadyExists: "มีประเภทเหตุการณ์ชื่อนี้อยู่แล้ว",
            namePlaceholder: "ชื่อประเภทเหตุการณ์",
            templatePlaceholder: "แม่แบบหัวข้อ",
            addNewTitle: "เพิ่มประเภทใหม่",
            addButton: "เพิ่มประเภท",
            inUseTooltip: "ไม่สามารถลบได้เนื่องจากประเภทนี้ถูกใช้งานโดยเหตุการณ์อย่างน้อยหนึ่งรายการ",
            inUseErrorDelete: "ไม่สามารถลบ '{{type}}' ได้เนื่องจากกำลังใช้งานโดยเหตุการณ์อย่างน้อยหนึ่งรายการ",
            inUseErrorRename: "ไม่สามารถเปลี่ยนชื่อ '{{type}}' ได้เนื่องจากกำลังใช้งานอยู่ คุณยังสามารถแก้ไขแม่แบบได้",
            inUseInfoRename: "การเปลี่ยนชื่อถูกปิดใช้งานเนื่องจากประเภทนี้กำลังใช้งานอยู่ คุณยังสามารถอัปเดตแม่แบบหัวข้อได้"
        },
        plans: {
            title: "จัดการแผนการแก้ไข",
            selectLabel: "เลือกประเภทเหตุการณ์เพื่อจัดการ",
            noSteps: "ไม่มีขั้นตอนการแก้ไขสำหรับประเภทเหตุการณ์นี้",
            addNewTitle: "เพิ่มขั้นตอนใหม่ใน \"{{type}}\"",
            stepTitlePlaceholder: "หัวข้อขั้นตอนใหม่",
            stepDescPlaceholder: "คำอธิบายขั้นตอนใหม่",
            addButton: "เพิ่มขั้นตอน",
            deleteConfirmTitle: "ลบขั้นตอน?",
            deleteConfirmMessage: "คุณแน่ใจหรือไม่ว่าต้องการลบขั้นตอนการแก้ไขนี้?"
        },
        slas: {
            title: "จัดการนโยบาย SLA",
            description: "ตั้งเวลาตอบกลับและแก้ไขเป็นนาทีสำหรับแต่ละประเภทเหตุการณ์และระดับความรุนแรง",
            saveSuccess: "อัปเดตนโยบาย SLA เรียบร้อยแล้ว!",
            colIncidentType: "ประเภทเหตุการณ์",
            response: "การตอบกลับ",
            resolution: "การแก้ไข"
        }
    },
    toast: {
        timeWarning: "เวลาในการคัดแยกใกล้จะหมดแล้ว!"
    },
    time: {
      justNow: "เมื่อสักครู่",
      minuteAgo: "{{count}} นาทีที่แล้ว",
      minutesAgo: "{{count}} นาทีที่แล้ว",
      hmAgo: "{{hours}} ชม. {{minutes}} น. ที่แล้ว",
      seconds: "{{count}}วิ",
      minutesSeconds: "{{minutes}}น. {{seconds}}วิ",
      hm: "{{hours}}ชม. {{minutes}}น.",
      ms: "{{minutes}}น. {{seconds}}วิ",
      s: "{{seconds}}วิ"
    },
    severity: {
      critical: 'วิกฤต',
      high: 'สูง',
      medium: 'ปานกลาง',
      low: 'ต่ำ',
    },
    status: {
        ongoing: "กำลังดำเนินการ",
        completed: "เสร็จสิ้น",
    },
    stepStatus: {
        pending: "รอดำเนินการ",
        completed: "เสร็จสิ้น",
        skipped: "ข้าม"
    },
    userRole: {
        admin: "ผู้ดูแลระบบ",
        operator: "เจ้าหน้าที่"
    },
    userStatus: {
        active: "ใช้งาน",
        blocked: "ถูกบล็อก"
    },
    incidentTypes: {
        phishingAttack: "การโจมตีแบบฟิชชิ่ง",
        dataBreach: "การรั่วไหลของข้อมูล",
        serviceOutage: "บริการขัดข้อง",
        malwareInfection: "การติดมัลแวร์"
    },
    incidentTemplates: {
        phishingAttack: "ตรวจพบการโจมตีแบบฟิชชิ่ง: [ใส่รายละเอียด]",
        dataBreach: "การสืบสวนการรั่วไหลของข้อมูล: [ใส่รายละเอียด]",
        serviceOutage: "บริการขัดข้อง: [ใส่ชื่อบริการ]",
        malwareInfection: "การติดมัลแวร์บน: [ใส่ชื่อทรัพย์สิน]"
    },
    csv: {
        incidentId: "ID เหตุการณ์",
        parentId: "ID หลัก",
        title: "หัวข้อ",
        status: "สถานะ",
        severity: "ระดับความรุนแรง",
        type: "ประเภท",
        detectionTime: "เวลาที่ตรวจพบ",
        completionTime: "เวลาที่เสร็จสิ้น",
        stepId: "ID ขั้นตอน",
        stepTitle: "หัวข้อขั้นตอน",
        stepStatus: "สถานะขั้นตอน",
        timeSpent: "เวลาที่ใช้ (วินาที)",
        stepComment: "ความคิดเห็นขั้นตอน"
    }
  }
};


interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { replacements?: Record<string, string | number>, returnObjects?: boolean }) => any;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, options?: { replacements?: Record<string, string | number>, returnObjects?: boolean }): any => {
    const langResources = translations[language] || translations.en;
    let text = get(langResources, key);

    if (text === undefined) {
      const fallbackLangResources = translations.en;
      text = get(fallbackLangResources, key);
    }
    
    if (text === undefined) {
        return key;
    }

    if(options?.returnObjects && typeof text === 'object') {
        return text;
    }

    if (typeof text !== 'string') {
        return text;
    }

    let result = text;
    if (options?.replacements) {
      Object.keys(options.replacements).forEach(placeholder => {
        result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(options.replacements![placeholder]));
      });
    }

    return result;
  };
  

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useTranslation = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LocalizationProvider');
  }
  return context;
};
