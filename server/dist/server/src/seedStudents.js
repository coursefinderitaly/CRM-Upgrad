"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Resets all student profile folders and seeds 4 rich demo profiles.
 *
 * Run with:  npm run seed:students --prefix server
 *
 * Each student gets:
 *  - dedicated folder + SQLite DB in student_profile/<Name>_<Phone>/
 *  - academic record, test scores, counselling record
 *  - university shortlists, approval, document checklist + sample PDFs
 *  - applications, offers, scholarship, pre-enrolment, DOV/CIMEA, visa, pre-departure
 *  - timeline activities, payment plan + installments
 *  - matching Prisma Lead row so the profile appears in My Students / Enrolled Students
 */
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const client_1 = require("@prisma/client");
const node_sqlite_1 = require("node:sqlite");
const db_1 = require("../../student_profile/db");
const prisma = new client_1.PrismaClient();
const uid = () => crypto.randomUUID();
const STUDENTS = [
    // ─────────────────────────────────────────────────────────────
    // 1. Ananya Sharma — Italy — Counselling stage
    // ─────────────────────────────────────────────────────────────
    {
        profile: {
            id: 'prof-ananya-sharma',
            student_id: 'ITA-2027-001',
            lead_id: 'L2026103001',
            name: 'Ananya Sharma',
            phone: '+91 98765 43211',
            email: 'ananya.sharma@gmail.com',
            dob: '14 Feb 2001',
            address: 'Kothrud, Pune, Maharashtra',
            nationality: 'Indian',
            country: 'Italy',
            country_code: 'ITA',
            target_university: 'Sapienza University of Rome',
            preferred_course: 'MSc Artificial Intelligence & Robotics',
            course_level: 'Master',
            intake: 'Sept 2026',
            budget: '€ 8,000 – 15,000',
            counsellor_name: 'Neha Sharma',
            enrollment_date: '05 Jan 2026',
            next_follow_up: '02 Nov 2026',
            overall_status: 'Counselling',
            current_stage: 'Counselling In Progress',
            stage_number: 1,
            priority: 'High',
        },
        academic: {
            tenth_board: 'CBSE',
            tenth_percentage: '92%',
            twelfth_board: 'CBSE',
            twelfth_percentage: '89%',
            bachelor_degree: 'B.Tech Computer Science & Engineering',
            bachelor_university: 'Pune Institute of Technology',
            bachelor_cgpa: '8.7 CGPA',
            bachelor_passing_year: '2023',
            backlogs: '0',
            education_gaps: 'None',
            work_experience: '1 year internship at Infosys',
        },
        test: {
            test_type: 'IELTS',
            overall_score: '7.5',
            reading: '8.0',
            writing: '6.5',
            listening: '8.0',
            speaking: '7.0',
            test_date: '12 Jan 2026',
            status: 'Passed',
        },
        counselling: {
            counsellor_name: 'Neha Sharma',
            session_date: '05 Jan 2026',
            preferred_countries: 'Italy, Germany',
            budget_bracket: '€ 8,000 – 15,000',
            notes: 'Strong CGPA with AI project portfolio. Wants English-taught MSc in AI/Robotics.',
            recommendations: 'Target Sapienza, Politecnico di Milano and Bologna. Prepare SOP around robotics research.',
            outcome: 'Interested — shortlist AI programs',
        },
        shortlists: [
            {
                university_name: 'Sapienza University of Rome',
                program_name: 'MSc Artificial Intelligence & Robotics',
                country: 'Italy',
                tuition_fee: '€ 2,900 / yr',
                cfu_credits: '120 ECTS',
                status: 'Shortlisted',
            },
            {
                university_name: 'Politecnico di Milano',
                program_name: 'MSc Automation & Control Engineering',
                country: 'Italy',
                tuition_fee: '€ 3,900 / yr',
                cfu_credits: '120 ECTS',
                status: 'Shortlisted',
            },
            {
                university_name: 'University of Bologna',
                program_name: 'MSc Artificial Intelligence',
                country: 'Italy',
                tuition_fee: '€ 3,200 / yr',
                cfu_credits: '120 ECTS',
                status: 'Under Review',
            },
        ],
        approval: {
            choice_1_university: 'Sapienza University of Rome',
            choice_2_university: 'Politecnico di Milano',
            agreement_signed: 0,
            agreement_status: 'Pending Student Signature',
            student_signature_note: 'Agreement draft shared on 20 Oct 2026',
            service_package: 'Comprehensive Study Abroad Service Package',
            total_fee: '₹ 70,800',
            amount_paid: '₹ 0',
            balance: '₹ 70,800',
            payment_schedule: '1st installment on signup; 2nd before visa lodgement',
        },
        documents: [
            { name: 'Passport Copy (All Pages)', category: 'Identity', status: 'Verified', remarks: 'Valid till 2032' },
            { name: '10th Standard Marksheet', category: 'Academic', status: 'Verified' },
            { name: '12th Standard Marksheet', category: 'Academic', status: 'Verified' },
            { name: 'Graduation Degree Certificate', category: 'Academic', status: 'Verified' },
            { name: 'IELTS Official Scorecard', category: 'Academic', status: 'Verified', remarks: 'Band 7.5' },
            { name: 'Statement of Purpose (SOP)', category: 'Academic', status: 'Received', remarks: 'Draft v2 under review' },
            { name: 'Letter of Recommendation 1', category: 'Academic', status: 'Received' },
            { name: 'Letter of Recommendation 2', category: 'Academic', status: 'Pending' },
            { name: 'Bank Financial Statement', category: 'Financial', status: 'Pending' },
            { name: 'Curriculum Vitae (CV)', category: 'Identity', status: 'Verified' },
        ],
        applications: [
            {
                university_name: 'Sapienza University of Rome',
                program_name: 'MSc Artificial Intelligence & Robotics',
                portal_application_id: 'APP-48211',
                submission_date: '28 Oct 2026',
                status: 'Under Evaluation',
            },
        ],
        offers: [],
        scholarship: {
            scholarship_name: 'DSU Regional Financial Aid',
            regional_authority: 'LazioDisco',
            isee_parificato_amount: '€ 14,200',
            family_income_doc_status: 'Pending',
            stipend_amount: '€ 7,200 / yr',
            application_deadline: '15 Jul 2026',
            status: 'Eligibility Check Pending',
        },
        preEnrolment: {
            universitaly_summary_code: '',
            university_validation_status: 'Not Started',
            status: 'Not Started',
        },
        legalization: {
            process_type: 'CIMEA Statement of Comparability',
            cimea_diploma_ref: '',
            status: 'Not Started',
        },
        visa: {
            vfs_center: 'VFS New Delhi',
            appointment_date: '',
            appointment_time: '',
            visa_type: 'National Visa Type D (Study)',
            vfs_reference_no: '',
            checklist_verification: 'Not Started',
            financial_proof_amount: '',
            decision: 'Not Started',
        },
        preDeparture: {
            flight_booking_status: 'Not Booked',
            accommodation_status: 'Not Arranged',
            forex_card_status: 'Not Started',
            status: 'Not Started',
        },
        payments: {
            planName: 'Comprehensive Study Abroad Service Package',
            agreedBudget: '€ 8,000 – 15,000',
            totalFee: 60000,
            totalPaid: 0,
            status: 'Pending',
            installments: [
                {
                    number: 1,
                    title: '1st Installment - Registration & Assessment',
                    amount: 30000,
                    dueDate: '2026-11-10',
                    status: 'Pending',
                    notes: 'Payable on agreement signing',
                },
                {
                    number: 2,
                    title: '2nd Installment - Application & Visa Lodgement',
                    amount: 30000,
                    dueDate: '2026-12-15',
                    status: 'Pending',
                    notes: 'Payable before visa appointment',
                },
            ],
        },
        timeline: [
            {
                action: 'Counselling Session Completed',
                portal: 'counsellor',
                operator: 'Neha Sharma',
                details: 'Profile evaluated for Italy AI/Robotics masters. IELTS 7.5 and 8.7 CGPA.',
                color: 'bg-blue-500',
            },
            {
                action: 'University Shortlist Prepared',
                portal: 'counsellor',
                operator: 'Neha Sharma',
                details: 'Sapienza, Politecnico di Milano and Bologna shortlisted for MSc AI programs.',
                color: 'bg-indigo-500',
            },
            {
                action: 'Application Submitted',
                portal: 'docs',
                operator: 'Rahul Nair',
                details: 'Sapienza application APP-48211 submitted and under evaluation.',
                color: 'bg-emerald-500',
            },
        ],
        lead: {
            leadId: 'L2026103001',
            status: 'Counselling',
            source: 'Website',
            lastActivity: '28 Oct 2026',
            nextFollowUp: '02 Nov 2026',
            nextFollowUpTime: '11:00 AM',
            nextFollowUpTask: 'Review SOP draft and confirm LOR 2',
        },
    },
    // ─────────────────────────────────────────────────────────────
    // 2. Rohan Mehta — Germany — Interested stage
    // ─────────────────────────────────────────────────────────────
    {
        profile: {
            id: 'prof-rohan-mehta',
            student_id: 'GER-2027-002',
            lead_id: 'L2026103002',
            name: 'Rohan Mehta',
            phone: '+91 98220 11223',
            email: 'rohan.mehta@gmail.com',
            dob: '09 Jul 2000',
            address: 'Andheri West, Mumbai, Maharashtra',
            nationality: 'Indian',
            country: 'Germany',
            country_code: 'GER',
            target_university: 'Technical University of Munich',
            preferred_course: 'MSc Data Science',
            course_level: 'Master',
            intake: 'Oct 2026',
            budget: '€ 10,000 – 20,000',
            counsellor_name: 'Neha Sharma',
            enrollment_date: '18 Dec 2025',
            next_follow_up: '04 Nov 2026',
            overall_status: 'Interested',
            current_stage: 'Interested — Awaiting Shortlist Approval',
            stage_number: 1,
            priority: 'Medium',
        },
        academic: {
            tenth_board: 'ICSE',
            tenth_percentage: '89%',
            twelfth_board: 'ISC',
            twelfth_percentage: '87%',
            bachelor_degree: 'B.E. Information Technology',
            bachelor_university: 'University of Mumbai',
            bachelor_cgpa: '8.4 CGPA',
            bachelor_passing_year: '2022',
            backlogs: '0',
            education_gaps: 'None',
            work_experience: '2 years as Data Analyst at TCS',
        },
        test: {
            test_type: 'IELTS',
            overall_score: '7.0',
            reading: '7.5',
            writing: '6.5',
            listening: '7.5',
            speaking: '6.5',
            test_date: '22 Nov 2025',
            status: 'Passed',
        },
        counselling: {
            counsellor_name: 'Neha Sharma',
            session_date: '18 Dec 2025',
            preferred_countries: 'Germany, Netherlands',
            budget_bracket: '€ 10,000 – 20,000',
            notes: 'Wants tuition-free public universities in Germany. Strong SQL/Python profile.',
            recommendations: 'Apply to TU Munich, RWTH Aachen and TU Berlin. Highlight 2 years analytics experience.',
            outcome: 'Interested — awaiting shortlist approval',
        },
        shortlists: [
            {
                university_name: 'Technical University of Munich',
                program_name: 'MSc Data Science',
                country: 'Germany',
                tuition_fee: '€ 0 (Public)',
                cfu_credits: '120 ECTS',
                status: 'Shortlisted',
            },
            {
                university_name: 'RWTH Aachen University',
                program_name: 'MSc Data Science',
                country: 'Germany',
                tuition_fee: '€ 0 (Public)',
                cfu_credits: '120 ECTS',
                status: 'Shortlisted',
            },
            {
                university_name: 'TU Berlin',
                program_name: 'MSc Computer Science',
                country: 'Germany',
                tuition_fee: '€ 0 (Public)',
                cfu_credits: '120 ECTS',
                status: 'Under Review',
            },
        ],
        approval: {
            choice_1_university: 'Technical University of Munich',
            choice_2_university: 'RWTH Aachen University',
            agreement_signed: 0,
            agreement_status: 'Awaiting Student Decision',
            student_signature_note: '',
            service_package: 'Standard Counselling Package',
            total_fee: '₹ 59,000',
            amount_paid: '₹ 0',
            balance: '₹ 59,000',
            payment_schedule: '50% on signup; 50% after offer',
        },
        documents: [
            { name: 'Passport Copy (All Pages)', category: 'Identity', status: 'Verified' },
            { name: '10th Standard Marksheet', category: 'Academic', status: 'Verified' },
            { name: '12th Standard Marksheet', category: 'Academic', status: 'Verified' },
            { name: 'Graduation Degree Certificate', category: 'Academic', status: 'Verified' },
            { name: 'IELTS Official Scorecard', category: 'Academic', status: 'Verified', remarks: 'Band 7.0' },
            { name: 'Statement of Purpose (SOP)', category: 'Academic', status: 'Received' },
            { name: 'Letter of Recommendation 1', category: 'Academic', status: 'Received' },
            { name: 'Letter of Recommendation 2', category: 'Academic', status: 'Pending' },
            { name: 'Bank Financial Statement', category: 'Financial', status: 'Received', remarks: 'Blocked account proof awaited' },
            { name: 'Curriculum Vitae (CV)', category: 'Identity', status: 'Verified' },
        ],
        applications: [
            {
                university_name: 'Technical University of Munich',
                program_name: 'MSc Data Science',
                portal_application_id: 'APP-48109',
                submission_date: '20 Oct 2026',
                status: 'Submitted',
            },
        ],
        offers: [],
        scholarship: {
            scholarship_name: 'DAAD Study Scholarship',
            regional_authority: 'DAAD Germany',
            isee_parificato_amount: '-',
            family_income_doc_status: 'Not Required',
            stipend_amount: '€ 992 / month',
            application_deadline: '31 Oct 2026',
            status: 'Application In Progress',
        },
        preEnrolment: {
            universitaly_summary_code: '',
            university_validation_status: 'Not Applicable',
            status: 'Not Applicable',
        },
        legalization: {
            process_type: 'APS Certificate (Germany)',
            cimea_diploma_ref: 'APS-2026-4410',
            status: 'Application Submitted',
        },
        visa: {
            vfs_center: 'VFS Mumbai',
            appointment_date: '',
            appointment_time: '',
            visa_type: 'National Visa Type D (Study)',
            vfs_reference_no: '',
            checklist_verification: 'Not Started',
            financial_proof_amount: '€ 11,904 blocked account target',
            decision: 'Not Started',
        },
        preDeparture: {
            flight_booking_status: 'Not Booked',
            accommodation_status: 'Not Arranged',
            forex_card_status: 'Not Started',
            status: 'Not Started',
        },
        payments: {
            planName: 'Standard Counselling Package',
            agreedBudget: '€ 10,000 – 20,000',
            totalFee: 50000,
            totalPaid: 25000,
            status: 'Partially Paid',
            installments: [
                {
                    number: 1,
                    title: '1st Installment - Registration & Shortlisting',
                    amount: 25000,
                    dueDate: '2025-12-20',
                    paidDate: '2025-12-19',
                    mode: 'UPI',
                    ref: 'UTR8891200451',
                    status: 'Paid',
                },
                {
                    number: 2,
                    title: '2nd Installment - Application & Visa Support',
                    amount: 25000,
                    dueDate: '2026-11-20',
                    status: 'Pending',
                },
            ],
        },
        timeline: [
            {
                action: 'Counselling Session Completed',
                portal: 'counsellor',
                operator: 'Neha Sharma',
                details: 'Germany public university plan discussed. Budget and APS requirements explained.',
                color: 'bg-blue-500',
            },
            {
                action: 'University Shortlist Shared',
                portal: 'counsellor',
                operator: 'Neha Sharma',
                details: 'TU Munich, RWTH Aachen and TU Berlin shortlisted for MSc Data Science.',
                color: 'bg-indigo-500',
            },
            {
                action: 'Application Submitted',
                portal: 'docs',
                operator: 'Rahul Nair',
                details: 'TU Munich application APP-48109 submitted on 20 Oct 2026.',
                color: 'bg-emerald-500',
            },
        ],
        lead: {
            leadId: 'L2026103002',
            status: 'Interested',
            source: 'Google Ads',
            lastActivity: '26 Oct 2026',
            nextFollowUp: '04 Nov 2026',
            nextFollowUpTime: '03:30 PM',
            nextFollowUpTask: 'Confirm university shortlist and APS timeline',
        },
    },
    // ─────────────────────────────────────────────────────────────
    // 3. Kavya Iyer — United Kingdom — Contacted stage
    // ─────────────────────────────────────────────────────────────
    {
        profile: {
            id: 'prof-kavya-iyer',
            student_id: 'UK-2027-003',
            lead_id: 'L2026103003',
            name: 'Kavya Iyer',
            phone: '+91 99001 22334',
            email: 'kavya.iyer@gmail.com',
            dob: '21 Nov 2003',
            address: 'Adyar, Chennai, Tamil Nadu',
            nationality: 'Indian',
            country: 'United Kingdom',
            country_code: 'UK',
            target_university: 'University of Manchester',
            preferred_course: 'BSc Nursing',
            course_level: 'Bachelor',
            intake: 'Sept 2026',
            budget: '£ 20,000 – 28,000',
            counsellor_name: 'Priya Singh',
            enrollment_date: '22 Oct 2026',
            next_follow_up: '01 Nov 2026',
            overall_status: 'Contacted',
            current_stage: 'First Contact Completed',
            stage_number: 1,
            priority: 'High',
        },
        academic: {
            tenth_board: 'CBSE',
            tenth_percentage: '88%',
            twelfth_board: 'CBSE',
            twelfth_percentage: '86%',
            bachelor_degree: 'Not Applicable (Undergraduate Applicant)',
            bachelor_university: '-',
            bachelor_cgpa: '-',
            bachelor_passing_year: '-',
            backlogs: '0',
            education_gaps: 'None',
            work_experience: 'Volunteer at Apollo Hospital (6 months)',
        },
        test: {
            test_type: 'IELTS',
            overall_score: '6.5',
            reading: '7.0',
            writing: '6.0',
            listening: '7.0',
            speaking: '6.5',
            test_date: '05 Oct 2026',
            status: 'Passed',
        },
        counselling: {
            counsellor_name: 'Priya Singh',
            session_date: '22 Oct 2026',
            preferred_countries: 'United Kingdom, Ireland',
            budget_bracket: '£ 20,000 – 28,000',
            notes: 'Class 12 biology student targeting UK nursing degrees. Needs UCAS guidance.',
            recommendations: 'Manchester, King’s College London and Edinburgh Napier shortlisted for BSc Nursing.',
            outcome: 'Contacted — counselling call scheduled',
        },
        shortlists: [
            {
                university_name: 'University of Manchester',
                program_name: 'BSc Nursing (Adult)',
                country: 'United Kingdom',
                tuition_fee: '£ 24,500 / yr',
                cfu_credits: '360 credits',
                status: 'Shortlisted',
            },
            {
                university_name: "King's College London",
                program_name: 'BSc Nursing Studies',
                country: 'United Kingdom',
                tuition_fee: '£ 27,800 / yr',
                cfu_credits: '360 credits',
                status: 'Shortlisted',
            },
            {
                university_name: 'Edinburgh Napier University',
                program_name: 'BSc Nursing',
                country: 'United Kingdom',
                tuition_fee: '£ 21,900 / yr',
                cfu_credits: '360 credits',
                status: 'Under Review',
            },
        ],
        approval: {
            choice_1_university: 'University of Manchester',
            choice_2_university: 'Edinburgh Napier University',
            agreement_signed: 0,
            agreement_status: 'Pending Counselling',
            student_signature_note: '',
            service_package: 'Undergraduate Admission Package',
            total_fee: '₹ 47,200',
            amount_paid: '₹ 0',
            balance: '₹ 47,200',
            payment_schedule: 'Registration fee after counselling sign-off',
        },
        documents: [
            { name: 'Passport Copy (All Pages)', category: 'Identity', status: 'Received' },
            { name: '10th Standard Marksheet', category: 'Academic', status: 'Verified' },
            { name: '12th Standard Marksheet', category: 'Academic', status: 'Received' },
            { name: 'IELTS Official Scorecard', category: 'Academic', status: 'Verified', remarks: 'Band 6.5' },
            { name: 'Statement of Purpose (SOP)', category: 'Academic', status: 'Pending' },
            { name: 'Letter of Recommendation 1', category: 'Academic', status: 'Pending' },
            { name: 'Letter of Recommendation 2', category: 'Academic', status: 'Pending' },
            { name: 'Bank Financial Statement', category: 'Financial', status: 'Pending' },
            { name: 'Curriculum Vitae (CV)', category: 'Identity', status: 'Received' },
        ],
        applications: [],
        offers: [],
        scholarship: {
            scholarship_name: 'Chevening Scholarship (UG)',
            regional_authority: 'UK Government',
            isee_parificato_amount: '-',
            family_income_doc_status: 'Not Required',
            stipend_amount: 'Full tuition + stipend',
            application_deadline: '05 Nov 2026',
            status: 'Eligibility Review',
        },
        preEnrolment: {
            universitaly_summary_code: '',
            university_validation_status: 'Not Applicable',
            status: 'Not Applicable',
        },
        legalization: {
            process_type: 'Not Applicable',
            cimea_diploma_ref: '',
            status: 'Not Applicable',
        },
        visa: {
            vfs_center: 'VFS Chennai',
            appointment_date: '',
            appointment_time: '',
            visa_type: 'UK Student Route Visa',
            vfs_reference_no: '',
            checklist_verification: 'Not Started',
            financial_proof_amount: '£ 28,000 target',
            decision: 'Not Started',
        },
        preDeparture: {
            flight_booking_status: 'Not Booked',
            accommodation_status: 'Not Arranged',
            forex_card_status: 'Not Started',
            status: 'Not Started',
        },
        payments: {
            planName: 'Undergraduate Admission Package',
            agreedBudget: '£ 20,000 – 28,000',
            totalFee: 40000,
            totalPaid: 0,
            status: 'Pending',
            installments: [
                {
                    number: 1,
                    title: 'Registration & UCAS Counselling Fee',
                    amount: 20000,
                    dueDate: '2026-11-05',
                    status: 'Pending',
                },
                {
                    number: 2,
                    title: 'Visa & Pre-Departure Support Fee',
                    amount: 20000,
                    dueDate: '2027-05-15',
                    status: 'Pending',
                },
            ],
        },
        timeline: [
            {
                action: 'Lead Contacted',
                portal: 'counsellor',
                operator: 'Priya Singh',
                details: 'First call completed. UK nursing options and UCAS process explained to student and parent.',
                color: 'bg-cyan-500',
            },
            {
                action: 'Counselling Call Scheduled',
                portal: 'counsellor',
                operator: 'Priya Singh',
                details: 'Detailed counselling call booked for 01 Nov 2026 at 11:30 AM.',
                color: 'bg-blue-500',
            },
        ],
        lead: {
            leadId: 'L2026103003',
            status: 'Contacted',
            source: 'Instagram',
            lastActivity: '22 Oct 2026',
            nextFollowUp: '01 Nov 2026',
            nextFollowUpTime: '11:30 AM',
            nextFollowUpTask: 'Counselling call — UK nursing shortlist',
        },
    },
    // ─────────────────────────────────────────────────────────────
    // 4. Arjun Verma — Canada — Enrolled / Documentation stage
    // ─────────────────────────────────────────────────────────────
    {
        profile: {
            id: 'prof-arjun-verma',
            student_id: 'CAN-2027-004',
            lead_id: 'L2026103004',
            name: 'Arjun Verma',
            phone: '+91 98111 55667',
            email: 'arjun.verma@gmail.com',
            dob: '03 Jun 1998',
            address: 'Vasant Kunj, New Delhi',
            nationality: 'Indian',
            country: 'Canada',
            country_code: 'CAN',
            target_university: 'University of Toronto',
            preferred_course: 'MBA',
            course_level: 'Master',
            intake: 'Sept 2026',
            budget: 'CAD 25,000 – 35,000',
            counsellor_name: 'Neha Sharma',
            enrollment_date: '10 Sep 2025',
            next_follow_up: '08 Nov 2026',
            overall_status: 'Contacted',
            current_stage: 'Contacted — Dossier Prepared',
            stage_number: 1,
            priority: 'High',
        },
        academic: {
            tenth_board: 'CBSE',
            tenth_percentage: '91%',
            twelfth_board: 'CBSE',
            twelfth_percentage: '88%',
            bachelor_degree: 'BBA (Bachelor of Business Administration)',
            bachelor_university: 'Shaheed Sukhdev College of Business Studies, Delhi University',
            bachelor_cgpa: '8.9 CGPA',
            bachelor_passing_year: '2020',
            backlogs: '0',
            education_gaps: 'None',
            work_experience: '4 years as Business Analyst at Deloitte',
        },
        test: {
            test_type: 'GMAT',
            overall_score: '680',
            reading: '36',
            writing: '5.5',
            listening: '-',
            speaking: '-',
            test_date: '18 Aug 2025',
            status: 'Passed',
        },
        counselling: {
            counsellor_name: 'Neha Sharma',
            session_date: '10 Sep 2025',
            preferred_countries: 'Canada, United Kingdom',
            budget_bracket: 'CAD 25,000 – 35,000',
            notes: 'Experienced professional targeting top Canadian MBA with strong analytics background.',
            recommendations: 'Apply to Rotman, Ivey and Smith. Focus on leadership essays and GMAT 680 profile.',
            outcome: 'Enrolled — documentation in progress',
        },
        shortlists: [
            {
                university_name: 'University of Toronto (Rotman)',
                program_name: 'MBA',
                country: 'Canada',
                tuition_fee: 'CAD 32,500 / yr',
                cfu_credits: '60 credits',
                status: 'Approved',
            },
            {
                university_name: 'Ivey Business School',
                program_name: 'MBA',
                country: 'Canada',
                tuition_fee: 'CAD 34,000 / yr',
                cfu_credits: '60 credits',
                status: 'Shortlisted',
            },
            {
                university_name: 'Smith School of Business',
                program_name: 'MBA',
                country: 'Canada',
                tuition_fee: 'CAD 30,800 / yr',
                cfu_credits: '60 credits',
                status: 'Shortlisted',
            },
        ],
        approval: {
            choice_1_university: 'University of Toronto (Rotman)',
            choice_2_university: 'Ivey Business School',
            agreement_signed: 1,
            agreement_status: 'Signed by Student',
            student_signature_note: 'Agreement signed digitally on 18 Sep 2025',
            service_package: 'Comprehensive Study Abroad Service Package',
            total_fee: '₹ 82,600',
            amount_paid: '₹ 41,300',
            balance: '₹ 41,300',
            payment_schedule: '50% on signup; 50% before visa lodgement',
        },
        documents: [
            { name: 'Passport Copy (All Pages)', category: 'Identity', status: 'Verified', remarks: 'Valid till 2033' },
            { name: '10th Standard Marksheet', category: 'Academic', status: 'Verified' },
            { name: '12th Standard Marksheet', category: 'Academic', status: 'Verified' },
            { name: 'Graduation Degree Certificate', category: 'Academic', status: 'Verified' },
            { name: 'GMAT Official Scorecard', category: 'Academic', status: 'Verified', remarks: 'Score 680' },
            { name: 'Statement of Purpose (SOP)', category: 'Academic', status: 'Verified' },
            { name: 'Letter of Recommendation 1', category: 'Academic', status: 'Verified' },
            { name: 'Letter of Recommendation 2', category: 'Academic', status: 'Verified' },
            { name: 'Bank Financial Statement', category: 'Financial', status: 'Under Verification', remarks: 'GIC + education loan sanction' },
            { name: 'Curriculum Vitae (CV)', category: 'Identity', status: 'Verified' },
        ],
        applications: [
            {
                university_name: 'University of Toronto (Rotman)',
                program_name: 'MBA',
                portal_application_id: 'APP-47552',
                submission_date: '02 Oct 2025',
                status: 'Accepted',
            },
            {
                university_name: 'Ivey Business School',
                program_name: 'MBA',
                portal_application_id: 'APP-47553',
                submission_date: '05 Oct 2025',
                status: 'Under Evaluation',
            },
        ],
        offers: [
            {
                university_name: 'University of Toronto (Rotman)',
                offer_type: 'Unconditional Offer',
                received_date: '12 Dec 2025',
                conditions: 'Official transcripts and deposit before 15 Jan 2026',
                deposit_amount: 'CAD 5,000 (Paid)',
                deposit_deadline: '15 Jan 2026',
                seat_confirmed: '1',
                status: 'Seat Secured',
            },
        ],
        scholarship: {
            scholarship_name: 'Rotman Merit Scholarship',
            regional_authority: 'University of Toronto',
            isee_parificato_amount: '-',
            family_income_doc_status: 'Verified',
            stipend_amount: 'CAD 10,000 one-time',
            application_deadline: '30 Nov 2025',
            status: 'Awarded',
        },
        preEnrolment: {
            universitaly_summary_code: '',
            university_validation_status: 'Not Applicable',
            status: 'Not Applicable',
        },
        legalization: {
            process_type: 'WES ECA (Canada)',
            cimea_diploma_ref: 'WES-CA-2025-8891',
            status: 'Completed & Verified',
        },
        visa: {
            vfs_center: 'VFS New Delhi',
            appointment_date: '20 Jan 2026',
            appointment_time: '09:30 AM',
            visa_type: 'Canadian Study Permit (SDS)',
            vfs_reference_no: 'VFS-CA-77120',
            checklist_verification: 'Complete (GIC, Loan, Offer, Medicals)',
            financial_proof_amount: 'CAD 20,635 GIC + CAD 35,000 loan',
            decision: 'Approved',
        },
        preDeparture: {
            flight_booking_status: 'Reserved (Air Canada AC-43)',
            accommodation_status: 'Confirmed — Graduate House, Toronto',
            forex_card_status: 'Loaded (CAD 3,000)',
            status: 'Arrival Ready',
        },
        payments: {
            planName: 'Comprehensive Study Abroad Service Package',
            agreedBudget: 'CAD 25,000 – 35,000',
            totalFee: 70000,
            totalPaid: 35000,
            status: 'Partially Paid',
            installments: [
                {
                    number: 1,
                    title: '1st Installment - Registration & Application',
                    amount: 35000,
                    dueDate: '2025-09-20',
                    paidDate: '2025-09-19',
                    mode: 'Bank Transfer (NEFT/RTGS)',
                    ref: 'UTR7721900345',
                    status: 'Paid',
                    notes: 'Includes GST',
                },
                {
                    number: 2,
                    title: '2nd Installment - Visa & Pre-Departure',
                    amount: 35000,
                    dueDate: '2026-01-10',
                    status: 'Pending',
                },
            ],
        },
        timeline: [
            {
                action: 'Lead Converted to Student',
                portal: 'counsellor',
                operator: 'Neha Sharma',
                details: 'MBA counselling completed and student enrolled for Canada intake.',
                color: 'bg-emerald-500',
            },
            {
                action: 'Applications Submitted',
                portal: 'docs',
                operator: 'Rahul Nair',
                details: 'Rotman and Ivey MBA applications submitted with GMAT 680 and 4 years work experience.',
                color: 'bg-emerald-500',
            },
            {
                action: 'Offer Received & Seat Confirmed',
                portal: 'docs',
                operator: 'Rahul Nair',
                details: 'Unconditional offer from Rotman received. CAD 5,000 deposit paid.',
                color: 'bg-amber-500',
            },
            {
                action: 'Visa Approved',
                portal: 'visa',
                operator: 'Meera Joshi',
                details: 'Canadian study permit approved on 12 Feb 2026 via SDS category.',
                color: 'bg-cyan-500',
            },
            {
                action: 'Documentation Verification In Progress',
                portal: 'docs',
                operator: 'Rahul Nair',
                details: 'Financial documents under final verification before pre-departure clearance.',
                color: 'bg-violet-500',
            },
        ],
        lead: {
            leadId: 'L2026103004',
            status: 'Enrolled',
            source: 'Referral',
            lastActivity: '28 Oct 2026',
            nextFollowUp: '08 Nov 2026',
            nextFollowUpTime: '04:00 PM',
            nextFollowUpTask: 'Verify financial documents and pre-departure checklist',
        },
    },
];
function clearStudentFolders() {
    const entries = node_fs_1.default.readdirSync(db_1.DB_DIR, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory())
            continue;
        const target = node_path_1.default.join(db_1.DB_DIR, entry.name);
        node_fs_1.default.rmSync(target, { recursive: true, force: true });
        console.log(`🗑️  Removed student profile folder: ${entry.name}`);
    }
}
function clearAuditHistory() {
    for (const file of ['history.db', 'audit.db']) {
        const dbPath = node_path_1.default.join(db_1.DB_DIR, file);
        if (!node_fs_1.default.existsSync(dbPath))
            continue;
        try {
            const db = new node_sqlite_1.DatabaseSync(dbPath);
            for (const table of ['history_records', 'profile_audit']) {
                try {
                    db.prepare(`DELETE FROM ${table}`).run();
                }
                catch {
                    /* table may not exist in this file */
                }
            }
            db.close();
        }
        catch (err) {
            console.warn(`Could not clear ${file}:`, err);
        }
    }
}
async function clearPrismaData() {
    // Children first (FK constraints), then leads/students
    await prisma.followUp.deleteMany();
    await prisma.task.deleteMany();
    await prisma.application.deleteMany();
    await prisma.document.deleteMany();
    await prisma.counsellingSession.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.student.deleteMany();
    await prisma.notification.deleteMany();
}
function seedProfileDetails(student) {
    const profile = student.profile;
    const folderName = (0, db_1.getStudentFolderName)(profile.name, profile.phone);
    const dbPath = node_path_1.default.join(db_1.DB_DIR, folderName, `${folderName}.db`);
    const db = (0, db_1.getStudentDb)(dbPath);
    const pid = profile.id;
    // Academic record
    db.prepare(`
    UPDATE academic_records SET
      tenth_board = ?, tenth_percentage = ?, twelfth_board = ?, twelfth_percentage = ?,
      bachelor_degree = ?, bachelor_university = ?, bachelor_cgpa = ?, bachelor_passing_year = ?,
      backlogs = ?, education_gaps = ?, work_experience = ?, updated_at = CURRENT_TIMESTAMP
    WHERE student_id = ?
  `).run(student.academic.tenth_board, student.academic.tenth_percentage, student.academic.twelfth_board, student.academic.twelfth_percentage, student.academic.bachelor_degree, student.academic.bachelor_university, student.academic.bachelor_cgpa, student.academic.bachelor_passing_year, student.academic.backlogs, student.academic.education_gaps, student.academic.work_experience, pid);
    // Replace auto-generated test score with the detailed one
    db.prepare(`DELETE FROM test_scores WHERE student_id = ?`).run(pid);
    db.prepare(`
    INSERT INTO test_scores (id, student_id, test_type, overall_score, reading, writing, listening, speaking, test_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uid(), pid, student.test.test_type, student.test.overall_score, student.test.reading, student.test.writing, student.test.listening, student.test.speaking, student.test.test_date, student.test.status);
    // Counselling record
    db.prepare(`
    UPDATE counselling_records SET
      counsellor_name = ?, session_date = ?, preferred_countries = ?, budget_bracket = ?,
      notes = ?, recommendations = ?, outcome = ?, updated_at = CURRENT_TIMESTAMP
    WHERE student_id = ?
  `).run(student.counselling.counsellor_name, student.counselling.session_date, student.counselling.preferred_countries, student.counselling.budget_bracket, student.counselling.notes, student.counselling.recommendations, student.counselling.outcome, pid);
    // Shortlists
    db.prepare(`DELETE FROM university_shortlists WHERE student_id = ?`).run(pid);
    for (const s of student.shortlists) {
        db.prepare(`
      INSERT INTO university_shortlists (id, student_id, university_name, program_name, country, tuition_fee, cfu_credits, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uid(), pid, s.university_name, s.program_name, s.country, s.tuition_fee, s.cfu_credits, s.status);
    }
    // Approval
    db.prepare(`DELETE FROM student_approvals WHERE student_id = ?`).run(pid);
    db.prepare(`
    INSERT INTO student_approvals
      (id, student_id, choice_1_university, choice_2_university, agreement_signed, agreement_status,
       student_signature_note, service_package, total_fee, amount_paid, balance, payment_schedule, approved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uid(), pid, student.approval.choice_1_university, student.approval.choice_2_university, student.approval.agreement_signed, student.approval.agreement_status, student.approval.student_signature_note, student.approval.service_package, student.approval.total_fee, student.approval.amount_paid, student.approval.balance, student.approval.payment_schedule, student.approval.agreement_signed ? new Date().toISOString() : null);
    // Document checklist
    db.prepare(`DELETE FROM documents_checklist WHERE student_id = ?`).run(pid);
    for (const d of student.documents) {
        db.prepare(`
      INSERT INTO documents_checklist (id, student_id, document_name, category, status, remarks, verified_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(uid(), pid, d.name, d.category, d.status, d.remarks || null, d.status === 'Verified' ? 'Docs Team' : null);
    }
    // Applications
    db.prepare(`DELETE FROM university_applications WHERE student_id = ?`).run(pid);
    for (const a of student.applications) {
        db.prepare(`
      INSERT INTO university_applications
        (id, student_id, university_name, program_name, portal_application_id, submission_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(uid(), pid, a.university_name, a.program_name, a.portal_application_id, a.submission_date, a.status);
    }
    // Offers
    db.prepare(`DELETE FROM offer_letters WHERE student_id = ?`).run(pid);
    for (const o of student.offers) {
        db.prepare(`
      INSERT INTO offer_letters
        (id, student_id, university_name, offer_type, received_date, conditions, deposit_amount,
         deposit_deadline, seat_confirmed, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uid(), pid, o.university_name, o.offer_type, o.received_date, o.conditions, o.deposit_amount, o.deposit_deadline, Number(o.seat_confirmed || 0), o.status);
    }
    // Scholarship
    db.prepare(`DELETE FROM scholarships WHERE student_id = ?`).run(pid);
    if (student.scholarship) {
        const s = student.scholarship;
        db.prepare(`
      INSERT INTO scholarships
        (id, student_id, scholarship_name, regional_authority, isee_parificato_amount,
         family_income_doc_status, stipend_amount, application_deadline, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uid(), pid, s.scholarship_name, s.regional_authority, s.isee_parificato_amount, s.family_income_doc_status, s.stipend_amount, s.application_deadline, s.status);
    }
    // Pre-enrolment
    db.prepare(`DELETE FROM pre_enrolments WHERE student_id = ?`).run(pid);
    if (student.preEnrolment) {
        const p = student.preEnrolment;
        db.prepare(`
      INSERT INTO pre_enrolments (id, student_id, universitaly_summary_code, university_validation_status, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(uid(), pid, p.universitaly_summary_code, p.university_validation_status, p.status);
    }
    // DOV / CIMEA
    db.prepare(`DELETE FROM legalizations WHERE student_id = ?`).run(pid);
    if (student.legalization) {
        const l = student.legalization;
        db.prepare(`
      INSERT INTO legalizations (id, student_id, process_type, cimea_diploma_ref, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(uid(), pid, l.process_type, l.cimea_diploma_ref, l.status);
    }
    // Visa
    db.prepare(`DELETE FROM visa_processes WHERE student_id = ?`).run(pid);
    if (student.visa) {
        const v = student.visa;
        db.prepare(`
      INSERT INTO visa_processes
        (id, student_id, vfs_center, appointment_date, appointment_time, visa_type,
         vfs_reference_no, checklist_verification, financial_proof_amount, decision)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uid(), pid, v.vfs_center, v.appointment_date, v.appointment_time, v.visa_type, v.vfs_reference_no, v.checklist_verification, v.financial_proof_amount, v.decision);
    }
    // Pre-departure
    db.prepare(`DELETE FROM pre_departures WHERE student_id = ?`).run(pid);
    if (student.preDeparture) {
        const p = student.preDeparture;
        db.prepare(`
      INSERT INTO pre_departures (id, student_id, flight_booking_status, accommodation_status, forex_card_status, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uid(), pid, p.flight_booking_status, p.accommodation_status, p.forex_card_status, p.status);
    }
    // Payments plan + installments
    const existingPlan = db.prepare(`SELECT id FROM student_payments WHERE student_id = ? LIMIT 1`).get(pid);
    const planId = existingPlan?.id || uid();
    if (!existingPlan) {
        db.prepare(`
      INSERT INTO student_payments
        (id, student_id, plan_name, agreed_budget, total_package_fee, total_paid, balance_due,
         installment_count, gst_included, gst_percentage, gst_amount, currency, payment_status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(planId, pid, student.payments.planName, student.payments.agreedBudget, student.payments.totalFee, student.payments.totalPaid, student.payments.totalFee - student.payments.totalPaid, student.payments.installments.length, 1, 18, Math.round((student.payments.totalFee * 18) / 100), 'INR', student.payments.status, 'Seeded demo payment plan');
    }
    else {
        db.prepare(`
      UPDATE student_payments SET
        plan_name = ?, agreed_budget = ?, total_package_fee = ?, total_paid = ?, balance_due = ?,
        installment_count = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE student_id = ?
    `).run(student.payments.planName, student.payments.agreedBudget, student.payments.totalFee, student.payments.totalPaid, student.payments.totalFee - student.payments.totalPaid, student.payments.installments.length, student.payments.status, pid);
    }
    db.prepare(`DELETE FROM payment_installments WHERE student_id = ?`).run(pid);
    for (const inst of student.payments.installments) {
        const gst = Math.round((inst.amount * 18) / 100);
        db.prepare(`
      INSERT INTO payment_installments
        (id, student_id, payment_id, installment_number, title, amount, gst_rate, gst_type,
         gst_amount, total_amount, payment_date, due_date, payment_mode, transaction_ref,
         receipt_no, status, collected_by, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uid(), pid, planId, inst.number, inst.title, inst.amount, 18, 'With GST (18%)', gst, inst.amount + gst, inst.paidDate || null, inst.dueDate, inst.mode || 'UPI', inst.ref || '', `REC-2026-${String(inst.number).padStart(3, '0')}`, inst.status, student.profile.counsellor_name || 'Counsellor', inst.notes || null);
    }
    // Timeline (newest first is handled by query ordering)
    db.prepare(`DELETE FROM timeline_activities WHERE student_id = ?`).run(pid);
    for (const t of student.timeline) {
        db.prepare(`
      INSERT INTO timeline_activities (id, student_id, action, portal_role, operator_name, details, dot_color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(uid(), pid, t.action, t.portal, t.operator, t.details, t.color);
    }
    db.close();
}
async function seedLeads() {
    const counsellor = await prisma.user.findFirst({ where: { role: 'Counsellor' } });
    for (const student of STUDENTS) {
        const p = student.profile;
        await prisma.lead.create({
            data: {
                leadId: student.lead.leadId,
                studentName: p.name,
                phone: p.phone,
                email: p.email,
                dob: p.dob,
                address: p.address,
                nationality: p.nationality,
                countryInterest: p.country,
                courseInterest: p.preferred_course,
                intake: p.intake,
                budget: p.budget,
                universityType: 'Public / Private',
                preferredCity: p.address?.split(',').slice(-2, -1)[0]?.trim(),
                leadSource: student.lead.source,
                lastActivity: student.lead.lastActivity,
                nextFollowUp: student.lead.nextFollowUp,
                nextFollowUpTime: student.lead.nextFollowUpTime,
                nextFollowUpTask: student.lead.nextFollowUpTask,
                status: student.lead.status,
                currentStage: p.current_stage,
                isEnrolled: p.overall_status === 'Enrolled' || (p.stage_number || 1) >= 4,
                isTransferredToDocs: (p.stage_number || 1) >= 4,
                enrolledAt: (p.stage_number || 1) >= 4 ? new Date() : null,
                transferredAt: (p.stage_number || 1) >= 4 ? new Date() : null,
                counsellorId: counsellor?.id,
                tenthBoard: student.academic.tenth_board,
                tenthPercentage: student.academic.tenth_percentage,
                twelfthBoard: student.academic.twelfth_board,
                twelfthPercentage: student.academic.twelfth_percentage,
                graduationDegree: student.academic.bachelor_degree,
                graduationUniversity: student.academic.bachelor_university,
                graduationCgpa: student.academic.bachelor_cgpa,
                graduationYear: student.academic.bachelor_passing_year,
                backlogs: student.academic.backlogs,
                educationGaps: student.academic.education_gaps,
                testType: student.test.test_type,
                testOverallScore: student.test.overall_score,
                testDate: student.test.test_date,
                testScoresDetails: `L: ${student.test.listening}, R: ${student.test.reading}, W: ${student.test.writing}, S: ${student.test.speaking}`,
                testResultStatus: student.test.status,
                notes: `Seeded demo profile — ${p.country} ${p.preferred_course}`,
            },
        });
    }
}
async function main() {
    console.log('🧹 Removing all existing student profiles...');
    clearStudentFolders();
    clearAuditHistory();
    console.log('🧹 Clearing leads, tasks, follow-ups and related records...');
    await clearPrismaData();
    console.log('🌱 Creating 4 detailed demo student profiles...');
    for (const student of STUDENTS) {
        const folderName = (0, db_1.getStudentFolderName)(student.profile.name, student.profile.phone);
        console.log(`   → ${student.profile.name} (${folderName})`);
        (0, db_1.createStudentFolderAndDb)(student.profile, true, 'Seed Script', 'counsellor', {
            skipAudit: true,
        });
        seedProfileDetails(student);
    }
    console.log('🔗 Creating matching lead records...');
    await seedLeads();
    console.log('\n✅ Done. Seeded students:');
    for (const s of STUDENTS) {
        console.log(`   • ${s.profile.name} | ${s.profile.student_id} | ${s.profile.country} | ${s.profile.preferred_course} | ${s.profile.overall_status}`);
    }
}
main()
    .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
