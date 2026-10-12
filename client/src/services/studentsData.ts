// Central Enrolled Students Mock Data & Models for CRM
export interface StudentRecord {
  id: string;
  studentId: string;
  leadId?: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  dob: string;
  address: string;
  nationality: string;
  country: string;
  countryCode: string;
  targetUniversity: string;
  preferredCourse: string;
  alternativeCourses: string[];
  courseLevel: string;
  intake: string;
  counsellor: string;
  enrollmentDate: string;
  nextFollowUp: string;
  overallStatus: string;
  priority: 'High' | 'Medium' | 'Low';
  currentStage: string;
  stageNumber: number; // 1 to 12
  academic: {
    highestQualification: string;
    university: string;
    passingYear: string;
    cgpa: string;
    englishTest: string;
    workExperience: string;
    budget: string;
  };
  payment: {
    servicePackage: string;
    agreementStatus: string;
    totalFee: string;
    amountPaid: string;
    balance: string;
    schedule: string[];
  };
  applications: Array<{
    id: number;
    university: string;
    program: string;
    intake: string;
    date: string;
    status: string;
    statusColor: string;
  }>;
  offers: Array<{
    university: string;
    date: string;
    type: string;
    conditions: string[];
    status: string;
    statusColor: string;
  }>;
  documents: Array<{
    name: string;
    status: string;
    date: string;
  }>;
  scholarships: Array<{
    name: string;
    deadline: string;
    status: string;
    statusColor: string;
  }>;
  preEnrolment: Array<{
    step: string;
    status: string;
    date: string;
  }>;
  dov: {
    processType: string;
    status: string;
    requiredBy: string;
  };
  visa: {
    appointmentDate: string;
    status: string;
    visaType: string;
    vfsReference: string;
  };
  timeline: Array<{
    time: string;
    text: string;
    team: string;
    dotColor: string;
  }>;
}

// Student Directory Mock Dataset

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    "id": "ac20235b-33fb-4a0f-b728-99548e13ce02",
    "studentId": "ITA-2027-001",
    "name": "Rahul Sharma",
    "avatar": "/avatars/rahul.png",
    "phone": "+91 98765 43210",
    "email": "rahulsharma@gmail.com",
    "dob": "12 Mar 2001",
    "address": "Indore, Madhya Pradesh",
    "nationality": "Indian",
    "country": "Italy",
    "countryCode": "IT",
    "targetUniversity": "University of Padova",
    "preferredCourse": "Materials Engineering",
    "alternativeCourses": [
      "Polymer Engineering",
      "Chemical Engineering"
    ],
    "courseLevel": "Master",
    "intake": "2027/28",
    "counsellor": "Neha Jain",
    "enrollmentDate": "12 Oct 2025",
    "nextFollowUp": "15 Oct 2025",
    "overallStatus": "Processing",
    "priority": "Medium",
    "currentStage": "Applications In Progress",
    "stageNumber": 5,
    "academic": {
      "highestQualification": "B.Tech (Mechanical)",
      "university": "RGPV, Bhopal",
      "passingYear": "2025",
      "cgpa": "7.8 / 10",
      "englishTest": "IELTS 6.5 (Available)",
      "workExperience": "Fresher",
      "budget": "€10,000 – €15,000/year"
    },
    "payment": {
      "servicePackage": "Italy Study Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,80,000",
      "amountPaid": "₹ 1,00,000",
      "balance": "₹ 1,80,000",
      "schedule": [
        "1st: ₹40,000 (Paid)",
        "2nd: ₹40,000 (Dec 2025)",
        "3rd: ₹2,00,000 (After Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "University of Padova",
        "program": "Materials Engineering",
        "intake": "2027/28",
        "date": "05 Oct 2025",
        "status": "Under Review",
        "statusColor": "bg-[#e0f2fe] text-[#0284c7]"
      },
      {
        "id": 2,
        "university": "University of Bologna",
        "program": "Advanced Materials Engineering",
        "intake": "2027/28",
        "date": "28 Sep 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      },
      {
        "id": 3,
        "university": "Politecnico di Torino",
        "program": "Chemical Engineering",
        "intake": "2027/28",
        "date": "02 Oct 2025",
        "status": "Submitted",
        "statusColor": "bg-[#e0f2fe] text-[#0284c7]"
      },
      {
        "id": 4,
        "university": "University of Pavia",
        "program": "Industrial Engineering",
        "intake": "2027/28",
        "date": "-",
        "status": "Draft",
        "statusColor": "bg-[#f1f5f9] text-[#64748b]"
      }
    ],
    "offers": [
      {
        "university": "University of Bologna",
        "date": "10 Oct 2025",
        "type": "Conditional",
        "conditions": [
          "IELTS 6.5",
          "Final Transcript"
        ],
        "status": "Under Verification",
        "statusColor": "bg-[#fef3c7] text-[#d97706]"
      },
      {
        "university": "University of Pavia",
        "date": "-",
        "type": "-",
        "conditions": [
          "-"
        ],
        "status": "Not Received",
        "statusColor": "bg-[#f1f5f9] text-[#64748b]"
      }
    ],
    "documents": [
      {
        "name": "Passport",
        "status": "Verified",
        "date": "12 Oct 2025"
      },
      {
        "name": "10th Marksheet",
        "status": "Verified",
        "date": "12 Oct 2025"
      },
      {
        "name": "12th Marksheet",
        "status": "Verified",
        "date": "12 Oct 2025"
      },
      {
        "name": "Bachelor Degree",
        "status": "Verified",
        "date": "12 Oct 2025"
      },
      {
        "name": "Transcripts (All Sem)",
        "status": "Verified",
        "date": "12 Oct 2025"
      },
      {
        "name": "CV / Resume",
        "status": "Verified",
        "date": "10 Oct 2025"
      },
      {
        "name": "SOP",
        "status": "Verified",
        "date": "10 Oct 2025"
      }
    ],
    "scholarships": [
      {
        "name": "DSU Regional Scholarship",
        "deadline": "30 Nov 2026",
        "status": "Documents Pending",
        "statusColor": "bg-[#fef3c7] text-[#d97706]"
      },
      {
        "name": "University of Padova Merit",
        "deadline": "15 Feb 2027",
        "status": "Not Applied",
        "statusColor": "bg-[#f1f5f9] text-[#64748b]"
      }
    ],
    "preEnrolment": [
      {
        "step": "Account Created",
        "status": "Completed",
        "date": "-"
      },
      {
        "step": "Form Submission",
        "status": "Completed",
        "date": "05 Oct 2025"
      },
      {
        "step": "University Validation",
        "status": "Pending",
        "date": "-"
      }
    ],
    "dov": {
      "processType": "DoV",
      "status": "Not Started",
      "requiredBy": "Embassy"
    },
    "visa": {
      "appointmentDate": "-",
      "status": "Not Started",
      "visaType": "Study Visa (Type D)",
      "vfsReference": "-"
    },
    "timeline": [
      {
        "time": "12 Oct 2025 10:30 AM",
        "text": "Document verification completed",
        "team": "Documentation Team",
        "dotColor": "bg-[#16a34a]"
      },
      {
        "time": "10 Oct 2025 04:15 PM",
        "text": "Offer letter received - University of Bologna",
        "team": "Application Team",
        "dotColor": "bg-[#16a34a]"
      },
      {
        "time": "08 Oct 2025 11:20 AM",
        "text": "Application submitted - University of Padova",
        "team": "Application Team",
        "dotColor": "bg-[#087cf5]"
      },
      {
        "time": "05 Oct 2025 03:40 PM",
        "text": "Pre-enrolment form submitted",
        "team": "Documentation Team",
        "dotColor": "bg-[#087cf5]"
      },
      {
        "time": "02 Oct 2025 01:10 PM",
        "text": "University shortlisting approved by student",
        "team": "Counsellor - Neha Jain",
        "dotColor": "bg-[#eab308]"
      }
    ]
  },
  {
    "id": "f8791011-85b3-467f-94ad-73bc11e64903",
    "studentId": "GER-2026-004",
    "name": "Priya Singh",
    "avatar": "/avatars/priya.png",
    "phone": "+91 87654 32109",
    "email": "priya.singh@gmail.com",
    "dob": "18 Jul 2002",
    "address": "Jaipur, Rajasthan",
    "nationality": "Indian",
    "country": "Germany",
    "countryCode": "DE",
    "targetUniversity": "Technical University of Munich",
    "preferredCourse": "MSc Computer Science",
    "alternativeCourses": [
      "Informatics",
      "Computational Data"
    ],
    "courseLevel": "Master",
    "intake": "2026/27",
    "counsellor": "Amit Verma",
    "enrollmentDate": "01 Aug 2025",
    "nextFollowUp": "18 Oct 2025",
    "overallStatus": "Offer Received",
    "priority": "High",
    "currentStage": "Offer Letter Received",
    "stageNumber": 6,
    "academic": {
      "highestQualification": "B.Tech (CSE)",
      "university": "MNIT, Jaipur",
      "passingYear": "2024",
      "cgpa": "8.4 / 10",
      "englishTest": "IELTS 7.5",
      "workExperience": "1 Year Software Engineer",
      "budget": "€12,000 / year"
    },
    "payment": {
      "servicePackage": "Germany Public University Master",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,50,000",
      "amountPaid": "₹ 1,50,000",
      "balance": "₹ 1,00,000",
      "schedule": [
        "1st: ₹50,000 (Paid)",
        "2nd: ₹1,00,000 (Paid)",
        "3rd: ₹1,00,000 (After Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "TU Munich",
        "program": "Informatics",
        "intake": "2026/27",
        "date": "15 Aug 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      },
      {
        "id": 2,
        "university": "RWTH Aachen",
        "program": "Computer Science",
        "intake": "2026/27",
        "date": "20 Aug 2025",
        "status": "Under Review",
        "statusColor": "bg-[#e0f2fe] text-[#0284c7]"
      }
    ],
    "offers": [
      {
        "university": "TU Munich",
        "date": "28 Sep 2025",
        "type": "Unconditional",
        "conditions": [
          "None"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport",
        "status": "Verified",
        "date": "01 Aug 2025"
      },
      {
        "name": "Degree & Transcript",
        "status": "Verified",
        "date": "01 Aug 2025"
      },
      {
        "name": "APS Certificate",
        "status": "Verified",
        "date": "10 Sep 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "APS",
      "status": "Completed",
      "requiredBy": "DAAD"
    },
    "visa": {
      "appointmentDate": "25 Oct 2025",
      "status": "In Progress",
      "visaType": "National Visa D",
      "vfsReference": "GER-DEL-1029"
    },
    "timeline": [
      {
        "time": "28 Sep 2025 02:00 PM",
        "text": "Offer letter received from TU Munich",
        "team": "Application Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "d9101234-91f2-491a-b6ce-82ef12d75014",
    "studentId": "ITA-2027-008",
    "name": "Rohit Verma",
    "avatar": "/avatars/rohit.png",
    "phone": "+91 91234 56780",
    "email": "rohit.verma@gmail.com",
    "dob": "05 May 2000",
    "address": "Lucknow, Uttar Pradesh",
    "nationality": "Indian",
    "country": "Italy",
    "countryCode": "IT",
    "targetUniversity": "Politecnico di Milano",
    "preferredCourse": "Mechanical Engineering",
    "alternativeCourses": [
      "Automotive Engineering"
    ],
    "courseLevel": "Master",
    "intake": "2027/28",
    "counsellor": "Neha Jain",
    "enrollmentDate": "20 Sep 2025",
    "nextFollowUp": "16 Oct 2025",
    "overallStatus": "Under Review",
    "priority": "Medium",
    "currentStage": "Documentation Completed",
    "stageNumber": 2,
    "academic": {
      "highestQualification": "B.Tech (Mech)",
      "university": "AKTU, Lucknow",
      "passingYear": "2023",
      "cgpa": "7.5 / 10",
      "englishTest": "IELTS 6.5",
      "workExperience": "2 Years",
      "budget": "€12,000 / year"
    },
    "payment": {
      "servicePackage": "Italy Study Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,80,000",
      "amountPaid": "₹ 80,000",
      "balance": "₹ 2,00,000",
      "schedule": [
        "1st: ₹80,000 (Paid)",
        "2nd: ₹1,00,000 (Due Dec)",
        "3rd: ₹1,00,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "Politecnico di Milano",
        "program": "Mechanical Engineering",
        "intake": "2027/28",
        "date": "02 Oct 2025",
        "status": "Submitted",
        "statusColor": "bg-[#e0f2fe] text-[#0284c7]"
      }
    ],
    "offers": [],
    "documents": [
      {
        "name": "Passport",
        "status": "Verified",
        "date": "20 Sep 2025"
      },
      {
        "name": "10th & 12th",
        "status": "Verified",
        "date": "20 Sep 2025"
      },
      {
        "name": "B.Tech Transcript",
        "status": "Verified",
        "date": "25 Sep 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "CIMEA",
      "status": "Not Started",
      "requiredBy": "PoliMi"
    },
    "visa": {
      "appointmentDate": "-",
      "status": "Not Started",
      "visaType": "Study Visa",
      "vfsReference": "-"
    },
    "timeline": [
      {
        "time": "02 Oct 2025 11:00 AM",
        "text": "Politecnico di Milano application submitted",
        "team": "Application Team",
        "dotColor": "bg-[#087cf5]"
      }
    ]
  },
  {
    "id": "e1029384-a123-4567-8901-bcdef1234567",
    "studentId": "UK-2026-012",
    "name": "Sneha Patel",
    "avatar": "/avatars/sneha.png",
    "phone": "+91 94567 89012",
    "email": "sneha.patel@gmail.com",
    "dob": "22 Nov 2001",
    "address": "Ahmedabad, Gujarat",
    "nationality": "Indian",
    "country": "UK",
    "countryCode": "GB",
    "targetUniversity": "University of Manchester",
    "preferredCourse": "MSc Data Science",
    "alternativeCourses": [
      "Business Analytics"
    ],
    "courseLevel": "Master",
    "intake": "Sept 2026",
    "counsellor": "Rohan Shetty",
    "enrollmentDate": "10 Jun 2025",
    "nextFollowUp": "17 Oct 2025",
    "overallStatus": "Documentation",
    "priority": "High",
    "currentStage": "Documentation In Progress",
    "stageNumber": 2,
    "academic": {
      "highestQualification": "B.Sc (Statistics)",
      "university": "Gujarat University",
      "passingYear": "2024",
      "cgpa": "8.8 / 10",
      "englishTest": "IELTS 7.0",
      "workExperience": "Fresher",
      "budget": "£22,000 / year"
    },
    "payment": {
      "servicePackage": "UK Premium Master Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,20,000",
      "amountPaid": "₹ 1,70,000",
      "balance": "₹ 50,000",
      "schedule": [
        "1st: ₹1,00,000 (Paid)",
        "2nd: ₹70,000 (Paid)",
        "3rd: ₹50,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "Univ of Manchester",
        "program": "MSc Data Science",
        "intake": "Sept 2026",
        "date": "15 Jul 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "Univ of Manchester",
        "date": "20 Aug 2025",
        "type": "Unconditional",
        "conditions": [
          "CAS Generated"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport",
        "status": "Verified",
        "date": "10 Jun 2025"
      },
      {
        "name": "Degree & Transcripts",
        "status": "Verified",
        "date": "10 Jun 2025"
      },
      {
        "name": "Financial Proofs",
        "status": "Verified",
        "date": "01 Oct 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "CAS",
      "status": "Completed",
      "requiredBy": "UKVI"
    },
    "visa": {
      "appointmentDate": "22 Oct 2025",
      "status": "In Progress",
      "visaType": "Student Visa (Tier 4)",
      "vfsReference": "GWF-UK-88219"
    },
    "timeline": [
      {
        "time": "05 Oct 2025 04:00 PM",
        "text": "CAS statement received from Manchester",
        "team": "Application Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "a5210984-71bc-4e2a-921f-c01928374650",
    "studentId": "ITA-2027-015",
    "name": "Amit Kumar",
    "avatar": "/avatars/amit.png",
    "phone": "+91 98111 22334",
    "email": "amit.kumar@gmail.com",
    "dob": "14 Jan 2001",
    "address": "New Delhi, Delhi",
    "nationality": "Indian",
    "country": "Italy",
    "countryCode": "IT",
    "targetUniversity": "Sapienza University of Rome",
    "preferredCourse": "MSc Artificial Intelligence & Robotics",
    "alternativeCourses": [
      "Computer Science"
    ],
    "courseLevel": "Master",
    "intake": "2027/28",
    "counsellor": "Neha Jain",
    "enrollmentDate": "15 Sep 2025",
    "nextFollowUp": "19 Oct 2025",
    "overallStatus": "Documentation",
    "priority": "High",
    "currentStage": "Documentation In Progress",
    "stageNumber": 2,
    "academic": {
      "highestQualification": "B.Tech (IT)",
      "university": "DTU, Delhi",
      "passingYear": "2024",
      "cgpa": "8.2 / 10",
      "englishTest": "IELTS 7.0",
      "workExperience": "6 Months Intern",
      "budget": "€11,000 / year"
    },
    "payment": {
      "servicePackage": "Italy Study Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,80,000",
      "amountPaid": "₹ 1,00,000",
      "balance": "₹ 1,80,000",
      "schedule": [
        "1st: ₹50,000 (Paid)",
        "2nd: ₹50,000 (Paid)",
        "3rd: ₹1,80,000 (After Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "Sapienza University of Rome",
        "program": "AI & Robotics",
        "intake": "2027/28",
        "date": "04 Oct 2025",
        "status": "Under Review",
        "statusColor": "bg-[#e0f2fe] text-[#0284c7]"
      }
    ],
    "offers": [],
    "documents": [
      {
        "name": "Passport",
        "status": "Verified",
        "date": "15 Sep 2025"
      },
      {
        "name": "Transcripts",
        "status": "Verified",
        "date": "15 Sep 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "CIMEA",
      "status": "In Progress",
      "requiredBy": "Sapienza"
    },
    "visa": {
      "appointmentDate": "-",
      "status": "Not Started",
      "visaType": "Study Visa Type D",
      "vfsReference": "-"
    },
    "timeline": [
      {
        "time": "04 Oct 2025 03:00 PM",
        "text": "Application submitted to Sapienza Rome",
        "team": "Application Team",
        "dotColor": "bg-[#087cf5]"
      }
    ]
  },
  {
    "id": "b6321095-82cd-4f3b-032a-d12039485761",
    "studentId": "GER-2026-019",
    "name": "Ananya Sharma",
    "avatar": "/avatars/ananya.png",
    "phone": "+91 97222 33445",
    "email": "ananya.sharma@gmail.com",
    "dob": "09 Sep 2002",
    "address": "Pune, Maharashtra",
    "nationality": "Indian",
    "country": "Germany",
    "countryCode": "DE",
    "targetUniversity": "Heidelberg University",
    "preferredCourse": "MSc Molecular Biotechnology",
    "alternativeCourses": [
      "Biomedical Sciences"
    ],
    "courseLevel": "Master",
    "intake": "2026/27",
    "counsellor": "Amit Verma",
    "enrollmentDate": "10 Aug 2025",
    "nextFollowUp": "20 Oct 2025",
    "overallStatus": "Offer Received",
    "priority": "Medium",
    "currentStage": "Offer Letter Received",
    "stageNumber": 6,
    "academic": {
      "highestQualification": "B.Sc (Biotech)",
      "university": "SPPU Pune",
      "passingYear": "2024",
      "cgpa": "8.6 / 10",
      "englishTest": "TOEFL 102",
      "workExperience": "Fresher",
      "budget": "€10,000 / year"
    },
    "payment": {
      "servicePackage": "Germany Public University Master",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,50,000",
      "amountPaid": "₹ 1,50,000",
      "balance": "₹ 1,00,000",
      "schedule": [
        "1st: ₹50,000 (Paid)",
        "2nd: ₹1,00,000 (Paid)",
        "3rd: ₹1,00,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "Heidelberg University",
        "program": "Molecular Biotech",
        "intake": "2026/27",
        "date": "20 Aug 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "Heidelberg University",
        "date": "01 Oct 2025",
        "type": "Unconditional",
        "conditions": [
          "-"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport",
        "status": "Verified",
        "date": "10 Aug 2025"
      },
      {
        "name": "APS Certificate",
        "status": "Verified",
        "date": "05 Sep 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "APS",
      "status": "Completed",
      "requiredBy": "DAAD"
    },
    "visa": {
      "appointmentDate": "15 Nov 2025",
      "status": "Slot Booked",
      "visaType": "National Visa D",
      "vfsReference": "GER-MUM-9912"
    },
    "timeline": [
      {
        "time": "01 Oct 2025 05:00 PM",
        "text": "Unconditional offer accepted for Heidelberg",
        "team": "Application Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "c7432106-93de-5a4c-143b-e23140596872",
    "studentId": "UK-2026-022",
    "name": "Rohan Gupta",
    "avatar": "/avatars/rohit.png",
    "phone": "+91 96333 44556",
    "email": "rohan.gupta@gmail.com",
    "dob": "11 Dec 1999",
    "address": "Chandigarh, Punjab",
    "nationality": "Indian",
    "country": "UK",
    "countryCode": "GB",
    "targetUniversity": "King’s College London",
    "preferredCourse": "MSc International Management",
    "alternativeCourses": [
      "Finance"
    ],
    "courseLevel": "Master",
    "intake": "Sept 2026",
    "counsellor": "Rohan Shetty",
    "enrollmentDate": "01 May 2025",
    "nextFollowUp": "21 Oct 2025",
    "overallStatus": "Departure Ready",
    "priority": "Low",
    "currentStage": "Travel & Arrival Ready",
    "stageNumber": 12,
    "academic": {
      "highestQualification": "B.Com (Hons)",
      "university": "Panjab University",
      "passingYear": "2022",
      "cgpa": "8.0 / 10",
      "englishTest": "IELTS 7.5",
      "workExperience": "2 Years Finance Analyst",
      "budget": "£25,000 / year"
    },
    "payment": {
      "servicePackage": "UK Premium Master Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,20,000",
      "amountPaid": "₹ 2,20,000",
      "balance": "₹ 0",
      "schedule": [
        "Full fee settled"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "King’s College London",
        "program": "MSc Int Management",
        "intake": "Sept 2026",
        "date": "10 Jun 2025",
        "status": "Enrolled",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "King’s College London",
        "date": "15 Jul 2025",
        "type": "Unconditional",
        "conditions": [
          "None"
        ],
        "status": "CAS Issued",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport & Visa Stamped",
        "status": "Verified",
        "date": "25 Sep 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "CAS",
      "status": "Completed",
      "requiredBy": "UKVI"
    },
    "visa": {
      "appointmentDate": "10 Sep 2025",
      "status": "Visa Approved",
      "visaType": "Student Visa",
      "vfsReference": "GWF-UK-7721"
    },
    "timeline": [
      {
        "time": "25 Sep 2025 10:00 AM",
        "text": "Visa stamped and flight booked",
        "team": "Visa Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "d8543217-04ef-6b5d-254c-f34251607983",
    "studentId": "ITA-2027-029",
    "name": "Vikram Malhotra",
    "avatar": "/avatars/vikram.png",
    "phone": "+91 95444 55667",
    "email": "vikram.m@gmail.com",
    "dob": "29 Oct 2000",
    "address": "Bangalore, Karnataka",
    "nationality": "Indian",
    "country": "Italy",
    "countryCode": "IT",
    "targetUniversity": "University of Bologna",
    "preferredCourse": "MSc Automation Engineering",
    "alternativeCourses": [
      "Mechatronics"
    ],
    "courseLevel": "Master",
    "intake": "2027/28",
    "counsellor": "Neha Jain",
    "enrollmentDate": "28 Aug 2025",
    "nextFollowUp": "Today, 03:00 PM",
    "overallStatus": "Counselling",
    "priority": "High",
    "currentStage": "Counselling In Progress",
    "stageNumber": 1,
    "academic": {
      "highestQualification": "B.E. (Electrical)",
      "university": "VTU, Belgaum",
      "passingYear": "2023",
      "cgpa": "7.9 / 10",
      "englishTest": "IELTS 6.5",
      "workExperience": "1 Year Robotics",
      "budget": "€11,000 / year"
    },
    "payment": {
      "servicePackage": "Italy Study Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,80,000",
      "amountPaid": "₹ 1,40,000",
      "balance": "₹ 1,40,000",
      "schedule": [
        "1st: ₹70,000 (Paid)",
        "2nd: ₹70,000 (Paid)",
        "3rd: ₹1,40,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "University of Bologna",
        "program": "Automation Engg",
        "intake": "2027/28",
        "date": "10 Sep 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "University of Bologna",
        "date": "04 Oct 2025",
        "type": "Conditional",
        "conditions": [
          "Final Degree"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport",
        "status": "Verified",
        "date": "28 Aug 2025"
      }
    ],
    "scholarships": [
      {
        "name": "ER.GO Scholarship",
        "deadline": "31 Aug 2026",
        "status": "Applied",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "preEnrolment": [],
    "dov": {
      "processType": "CIMEA",
      "status": "Submitted",
      "requiredBy": "UniBo"
    },
    "visa": {
      "appointmentDate": "-",
      "status": "Not Started",
      "visaType": "Study Visa",
      "vfsReference": "-"
    },
    "timeline": [
      {
        "time": "04 Oct 2025 02:30 PM",
        "text": "Offer received from Bologna",
        "team": "Application Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "e9654328-15fa-7c6e-365d-045362718094",
    "studentId": "GER-2026-033",
    "name": "Divya Rao",
    "avatar": "/avatars/priya.png",
    "phone": "+91 94555 66778",
    "email": "divya.rao@gmail.com",
    "dob": "03 Feb 2002",
    "address": "Hyderabad, Telangana",
    "nationality": "Indian",
    "country": "Germany",
    "countryCode": "DE",
    "targetUniversity": "RWTH Aachen University",
    "preferredCourse": "MSc Automotive Engineering",
    "alternativeCourses": [
      "Production Engineering"
    ],
    "courseLevel": "Master",
    "intake": "2026/27",
    "counsellor": "Amit Verma",
    "enrollmentDate": "14 Jul 2025",
    "nextFollowUp": "Today, 05:30 PM",
    "overallStatus": "Counselling",
    "priority": "High",
    "currentStage": "Counselling In Progress",
    "stageNumber": 1,
    "academic": {
      "highestQualification": "B.Tech (Automobile)",
      "university": "JNTU Hyderabad",
      "passingYear": "2024",
      "cgpa": "8.7 / 10",
      "englishTest": "IELTS 7.5",
      "workExperience": "Fresher",
      "budget": "€12,000 / year"
    },
    "payment": {
      "servicePackage": "Germany Public University Master",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,50,000",
      "amountPaid": "₹ 1,50,000",
      "balance": "₹ 1,00,000",
      "schedule": [
        "1st: ₹50,000 (Paid)",
        "2nd: ₹1,00,000 (Paid)",
        "3rd: ₹1,00,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "RWTH Aachen",
        "program": "Automotive Engg",
        "intake": "2026/27",
        "date": "01 Aug 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "RWTH Aachen",
        "date": "25 Sep 2025",
        "type": "Unconditional",
        "conditions": [
          "-"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport",
        "status": "Verified",
        "date": "14 Jul 2025"
      },
      {
        "name": "APS Certificate",
        "status": "Verified",
        "date": "20 Aug 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "APS",
      "status": "Completed",
      "requiredBy": "DAAD"
    },
    "visa": {
      "appointmentDate": "02 Nov 2025",
      "status": "Slot Booked",
      "visaType": "National Visa D",
      "vfsReference": "GER-HYD-4410"
    },
    "timeline": [
      {
        "time": "25 Sep 2025 01:15 PM",
        "text": "Admit letter issued by RWTH Aachen",
        "team": "Application Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "fa765439-26ab-8d7f-476e-156473829105",
    "studentId": "ITA-2027-038",
    "name": "Karan Mehta",
    "avatar": "/avatars/amit.png",
    "phone": "+91 93666 77889",
    "email": "karan.m@gmail.com",
    "dob": "17 Jun 2001",
    "address": "Surat, Gujarat",
    "nationality": "Indian",
    "country": "Italy",
    "countryCode": "IT",
    "targetUniversity": "Politecnico di Torino",
    "preferredCourse": "MSc Computer Engineering",
    "alternativeCourses": [
      "Data Science"
    ],
    "courseLevel": "Master",
    "intake": "2027/28",
    "counsellor": "Neha Jain",
    "enrollmentDate": "05 Sep 2025",
    "nextFollowUp": "Tomorrow, 11:00 AM",
    "overallStatus": "Counselling",
    "priority": "Medium",
    "currentStage": "Counselling In Progress",
    "stageNumber": 1,
    "academic": {
      "highestQualification": "B.E. (Computer)",
      "university": "GTU, Ahmedabad",
      "passingYear": "2024",
      "cgpa": "7.7 / 10",
      "englishTest": "IELTS 6.5",
      "workExperience": "Fresher",
      "budget": "€10,000 / year"
    },
    "payment": {
      "servicePackage": "Italy Study Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,80,000",
      "amountPaid": "₹ 80,000",
      "balance": "₹ 2,00,000",
      "schedule": [
        "1st: ₹80,000 (Paid)",
        "2nd: ₹1,00,000 (Dec)",
        "3rd: ₹1,00,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "Politecnico di Torino",
        "program": "Computer Engg",
        "intake": "2027/28",
        "date": "28 Sep 2025",
        "status": "Under Review",
        "statusColor": "bg-[#e0f2fe] text-[#0284c7]"
      }
    ],
    "offers": [],
    "documents": [
      {
        "name": "Passport",
        "status": "Verified",
        "date": "05 Sep 2025"
      }
    ],
    "scholarships": [
      {
        "name": "EDISU Piemonte",
        "deadline": "30 Aug 2026",
        "status": "Pending",
        "statusColor": "bg-[#fef3c7] text-[#d97706]"
      }
    ],
    "preEnrolment": [],
    "dov": {
      "processType": "CIMEA",
      "status": "Draft",
      "requiredBy": "PoliTo"
    },
    "visa": {
      "appointmentDate": "-",
      "status": "Not Started",
      "visaType": "Study Visa",
      "vfsReference": "-"
    },
    "timeline": [
      {
        "time": "28 Sep 2025 04:00 PM",
        "text": "Application submitted to PoliTo portal",
        "team": "Application Team",
        "dotColor": "bg-[#087cf5]"
      }
    ]
  },
  {
    "id": "0b876540-37bc-9e80-587f-267584930216",
    "studentId": "UK-2026-041",
    "name": "Pooja Nair",
    "avatar": "/avatars/sneha.png",
    "phone": "+91 92777 88990",
    "email": "pooja.nair@gmail.com",
    "dob": "23 Mar 2001",
    "address": "Kochi, Kerala",
    "nationality": "Indian",
    "country": "UK",
    "countryCode": "GB",
    "targetUniversity": "University of Edinburgh",
    "preferredCourse": "MSc Finance & Investment",
    "alternativeCourses": [
      "Banking & Risk"
    ],
    "courseLevel": "Master",
    "intake": "Sept 2026",
    "counsellor": "Rohan Shetty",
    "enrollmentDate": "18 May 2025",
    "nextFollowUp": "25 Oct 2025",
    "overallStatus": "Visa Process",
    "priority": "High",
    "currentStage": "Visa Process In Progress",
    "stageNumber": 11,
    "academic": {
      "highestQualification": "B.Com (Finance)",
      "university": "MG University, Kottayam",
      "passingYear": "2023",
      "cgpa": "8.9 / 10",
      "englishTest": "IELTS 7.5",
      "workExperience": "1 Year KPMG",
      "budget": "£26,000 / year"
    },
    "payment": {
      "servicePackage": "UK Premium Master Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,20,000",
      "amountPaid": "₹ 1,70,000",
      "balance": "₹ 50,000",
      "schedule": [
        "1st: ₹1,00,000 (Paid)",
        "2nd: ₹70,000 (Paid)",
        "3rd: ₹50,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "Univ of Edinburgh",
        "program": "MSc Finance",
        "intake": "Sept 2026",
        "date": "25 Jun 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "Univ of Edinburgh",
        "date": "10 Aug 2025",
        "type": "Unconditional",
        "conditions": [
          "CAS Done"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport & CAS",
        "status": "Verified",
        "date": "01 Oct 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "CAS",
      "status": "Completed",
      "requiredBy": "UKVI"
    },
    "visa": {
      "appointmentDate": "29 Oct 2025",
      "status": "Appointment Booked",
      "visaType": "Student Visa",
      "vfsReference": "GWF-UK-66120"
    },
    "timeline": [
      {
        "time": "05 Oct 2025 09:30 AM",
        "text": "VFS Biometrics appointment scheduled at Kochi",
        "team": "Visa Team",
        "dotColor": "bg-[#087cf5]"
      }
    ]
  },
  {
    "id": "1c987651-48cd-af91-6980-378695041327",
    "studentId": "GER-2026-047",
    "name": "Arjun Reddy",
    "avatar": "/avatars/rohit.png",
    "phone": "+91 91888 99001",
    "email": "arjun.reddy@gmail.com",
    "dob": "08 Aug 2001",
    "address": "Visakhapatnam, AP",
    "nationality": "Indian",
    "country": "Germany",
    "countryCode": "DE",
    "targetUniversity": "TU Berlin",
    "preferredCourse": "MSc Information Systems",
    "alternativeCourses": [
      "Computer Science"
    ],
    "courseLevel": "Master",
    "intake": "2026/27",
    "counsellor": "Amit Verma",
    "enrollmentDate": "25 Jul 2025",
    "nextFollowUp": "26 Oct 2025",
    "overallStatus": "Shortlisting",
    "priority": "Medium",
    "currentStage": "University Shortlisting In Progress",
    "stageNumber": 3,
    "academic": {
      "highestQualification": "B.Tech (IT)",
      "university": "Andhra University",
      "passingYear": "2024",
      "cgpa": "8.1 / 10",
      "englishTest": "IELTS 7.0",
      "workExperience": "Fresher",
      "budget": "€11,000 / year"
    },
    "payment": {
      "servicePackage": "Germany Public University Master",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,50,000",
      "amountPaid": "₹ 1,50,000",
      "balance": "₹ 1,00,000",
      "schedule": [
        "1st: ₹50,000 (Paid)",
        "2nd: ₹1,00,000 (Paid)",
        "3rd: ₹1,00,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "TU Berlin",
        "program": "Information Systems",
        "intake": "2026/27",
        "date": "10 Aug 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "TU Berlin",
        "date": "30 Sep 2025",
        "type": "Unconditional",
        "conditions": [
          "-"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport & APS",
        "status": "Verified",
        "date": "25 Jul 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "APS",
      "status": "Completed",
      "requiredBy": "DAAD"
    },
    "visa": {
      "appointmentDate": "18 Nov 2025",
      "status": "Slot Booked",
      "visaType": "National Visa D",
      "vfsReference": "GER-DEL-7744"
    },
    "timeline": [
      {
        "time": "30 Sep 2025 03:00 PM",
        "text": "Admit letter from TU Berlin verified",
        "team": "Application Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "2da98762-59de-ba02-7a91-489706152438",
    "studentId": "ITA-2027-052",
    "name": "Riya Sen",
    "avatar": "/avatars/ananya.png",
    "phone": "+91 90999 00112",
    "email": "riya.sen@gmail.com",
    "dob": "19 Apr 2002",
    "address": "Kolkata, West Bengal",
    "nationality": "Indian",
    "country": "Italy",
    "countryCode": "IT",
    "targetUniversity": "University of Milan",
    "preferredCourse": "MSc Data Science for Economics",
    "alternativeCourses": [
      "Quantitative Finance"
    ],
    "courseLevel": "Master",
    "intake": "2027/28",
    "counsellor": "Neha Jain",
    "enrollmentDate": "12 Sep 2025",
    "nextFollowUp": "27 Oct 2025",
    "overallStatus": "Shortlisting",
    "priority": "Medium",
    "currentStage": "University Shortlisting In Progress",
    "stageNumber": 3,
    "academic": {
      "highestQualification": "B.Sc (Economics)",
      "university": "Presidency University",
      "passingYear": "2024",
      "cgpa": "8.3 / 10",
      "englishTest": "IELTS 7.0",
      "workExperience": "Fresher",
      "budget": "€11,000 / year"
    },
    "payment": {
      "servicePackage": "Italy Study Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,80,000",
      "amountPaid": "₹ 1,40,000",
      "balance": "₹ 1,40,000",
      "schedule": [
        "1st: ₹70,000 (Paid)",
        "2nd: ₹70,000 (Paid)",
        "3rd: ₹1,40,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "University of Milan",
        "program": "Data Science Economics",
        "intake": "2027/28",
        "date": "20 Sep 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "University of Milan",
        "date": "08 Oct 2025",
        "type": "Conditional",
        "conditions": [
          "Final Degree"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport",
        "status": "Verified",
        "date": "12 Sep 2025"
      }
    ],
    "scholarships": [
      {
        "name": "DSU UniMi",
        "deadline": "15 Sep 2026",
        "status": "Pending",
        "statusColor": "bg-[#fef3c7] text-[#d97706]"
      }
    ],
    "preEnrolment": [],
    "dov": {
      "processType": "CIMEA",
      "status": "In Review",
      "requiredBy": "UniMi"
    },
    "visa": {
      "appointmentDate": "-",
      "status": "Not Started",
      "visaType": "Study Visa",
      "vfsReference": "-"
    },
    "timeline": [
      {
        "time": "08 Oct 2025 04:30 PM",
        "text": "Admit from University of Milan accepted",
        "team": "Application Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "3eb09873-6aef-cb13-8ba2-590817263549",
    "studentId": "FRA-2026-058",
    "name": "Varun Joshi",
    "avatar": "/avatars/vikram.png",
    "phone": "+91 99888 11223",
    "email": "varun.joshi@gmail.com",
    "dob": "02 May 2000",
    "address": "Dehradun, Uttarakhand",
    "nationality": "Indian",
    "country": "France",
    "countryCode": "FR",
    "targetUniversity": "Sorbonne University",
    "preferredCourse": "MSc Quantitative Economics",
    "alternativeCourses": [
      "Applied Mathematics"
    ],
    "courseLevel": "Master",
    "intake": "Sept 2026",
    "counsellor": "Amit Verma",
    "enrollmentDate": "19 Aug 2025",
    "nextFollowUp": "Tomorrow, 02:30 PM",
    "overallStatus": "Counselling",
    "priority": "Medium",
    "currentStage": "Counselling In Progress",
    "stageNumber": 1,
    "academic": {
      "highestQualification": "B.Sc (Maths)",
      "university": "HNB Garhwal University",
      "passingYear": "2023",
      "cgpa": "7.8 / 10",
      "englishTest": "IELTS 6.5",
      "workExperience": "1 Year Teaching",
      "budget": "€10,000 / year"
    },
    "payment": {
      "servicePackage": "France Public University Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,40,000",
      "amountPaid": "₹ 1,00,000",
      "balance": "₹ 1,40,000",
      "schedule": [
        "1st: ₹50,000 (Paid)",
        "2nd: ₹50,000 (Paid)",
        "3rd: ₹1,40,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "Sorbonne University",
        "program": "Quant Economics",
        "intake": "Sept 2026",
        "date": "01 Oct 2025",
        "status": "Submitted",
        "statusColor": "bg-[#e0f2fe] text-[#0284c7]"
      }
    ],
    "offers": [],
    "documents": [
      {
        "name": "Passport & Transcripts",
        "status": "Verified",
        "date": "19 Aug 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "Campus France",
      "status": "In Progress",
      "requiredBy": "Consulate"
    },
    "visa": {
      "appointmentDate": "-",
      "status": "Not Started",
      "visaType": "Long Stay Student Visa",
      "vfsReference": "-"
    },
    "timeline": [
      {
        "time": "01 Oct 2025 11:45 AM",
        "text": "Etudes en France dossier submitted",
        "team": "Application Team",
        "dotColor": "bg-[#087cf5]"
      }
    ]
  },
  {
    "id": "4fc10984-7bfa-dc24-9cb3-601928374650",
    "studentId": "IRL-2026-061",
    "name": "Meera Iyer",
    "avatar": "/avatars/sneha.png",
    "phone": "+91 98777 22334",
    "email": "meera.iyer@gmail.com",
    "dob": "15 Jul 2001",
    "address": "Chennai, Tamil Nadu",
    "nationality": "Indian",
    "country": "Ireland",
    "countryCode": "IE",
    "targetUniversity": "Trinity College Dublin",
    "preferredCourse": "MSc Computer Science (Data Science)",
    "alternativeCourses": [
      "Intelligent Systems"
    ],
    "courseLevel": "Master",
    "intake": "Sept 2026",
    "counsellor": "Rohan Shetty",
    "enrollmentDate": "22 May 2025",
    "nextFollowUp": "29 Oct 2025",
    "overallStatus": "Visa Process",
    "priority": "High",
    "currentStage": "Visa Process In Progress",
    "stageNumber": 11,
    "academic": {
      "highestQualification": "B.Tech (CSE)",
      "university": "Anna University",
      "passingYear": "2024",
      "cgpa": "8.9 / 10",
      "englishTest": "IELTS 7.5",
      "workExperience": "Fresher",
      "budget": "€18,000 / year"
    },
    "payment": {
      "servicePackage": "Ireland Premium Master Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,20,000",
      "amountPaid": "₹ 1,70,000",
      "balance": "₹ 50,000",
      "schedule": [
        "1st: ₹1,00,000 (Paid)",
        "2nd: ₹70,000 (Paid)",
        "3rd: ₹50,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "Trinity College Dublin",
        "program": "MSc CS Data Science",
        "intake": "Sept 2026",
        "date": "01 Jul 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "Trinity College Dublin",
        "date": "12 Aug 2025",
        "type": "Unconditional",
        "conditions": [
          "-"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport & Garda Proofs",
        "status": "Verified",
        "date": "15 Sep 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "Irish Visa Portal",
      "status": "Completed",
      "requiredBy": "INIS"
    },
    "visa": {
      "appointmentDate": "05 Nov 2025",
      "status": "VFS Scheduled",
      "visaType": "Study Visa D",
      "vfsReference": "IRL-CHE-3319"
    },
    "timeline": [
      {
        "time": "02 Oct 2025 02:00 PM",
        "text": "AVATS online summary sheet submitted for Ireland",
        "team": "Visa Team",
        "dotColor": "bg-[#087cf5]"
      }
    ]
  },
  {
    "id": "50d21095-8cfb-ed35-0dc4-712039485761",
    "studentId": "ITA-2027-066",
    "name": "Siddharth Jain",
    "avatar": "/avatars/rahul.png",
    "phone": "+91 97666 33445",
    "email": "siddharth.j@gmail.com",
    "dob": "30 Aug 2001",
    "address": "Indore, Madhya Pradesh",
    "nationality": "Indian",
    "country": "Italy",
    "countryCode": "IT",
    "targetUniversity": "University of Pisa",
    "preferredCourse": "MSc Aerospace Engineering",
    "alternativeCourses": [
      "Space Engineering"
    ],
    "courseLevel": "Master",
    "intake": "2027/28",
    "counsellor": "Neha Jain",
    "enrollmentDate": "01 Jul 2025",
    "nextFollowUp": "30 Oct 2025",
    "overallStatus": "Visa Process",
    "priority": "Medium",
    "currentStage": "Visa Process In Progress",
    "stageNumber": 11,
    "academic": {
      "highestQualification": "B.Tech (Aero)",
      "university": "RGPV Bhopal",
      "passingYear": "2024",
      "cgpa": "8.0 / 10",
      "englishTest": "IELTS 6.5",
      "workExperience": "Fresher",
      "budget": "€11,000 / year"
    },
    "payment": {
      "servicePackage": "Italy Study Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,80,000",
      "amountPaid": "₹ 2,00,000",
      "balance": "₹ 80,000",
      "schedule": [
        "1st: ₹1,00,000 (Paid)",
        "2nd: ₹1,00,000 (Paid)",
        "3rd: ₹80,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "University of Pisa",
        "program": "Aerospace Engg",
        "intake": "2027/28",
        "date": "15 Jul 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "University of Pisa",
        "date": "20 Aug 2025",
        "type": "Unconditional",
        "conditions": [
          "-"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport & DoV Dossier",
        "status": "Verified",
        "date": "10 Sep 2025"
      }
    ],
    "scholarships": [
      {
        "name": "DSU Toscana",
        "deadline": "05 Sep 2026",
        "status": "Applied",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "preEnrolment": [
      {
        "step": "Universitaly Validated",
        "status": "Completed",
        "date": "15 Sep 2025"
      }
    ],
    "dov": {
      "processType": "CIMEA",
      "status": "Completed",
      "requiredBy": "UniPisa"
    },
    "visa": {
      "appointmentDate": "08 Nov 2025",
      "status": "Appointment Booked",
      "visaType": "Study Visa Type D",
      "vfsReference": "VFS-ITA-9021"
    },
    "timeline": [
      {
        "time": "04 Oct 2025 11:30 AM",
        "text": "Universitaly pre-enrolment summary verified by Embassy",
        "team": "Documentation Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "61e32106-9d0c-fe46-1ed5-823140596872",
    "studentId": "GER-2026-070",
    "name": "Tanvi Deshmukh",
    "avatar": "/avatars/ananya.png",
    "phone": "+91 96555 44556",
    "email": "tanvi.d@gmail.com",
    "dob": "14 May 2002",
    "address": "Nagpur, Maharashtra",
    "nationality": "Indian",
    "country": "Germany",
    "countryCode": "DE",
    "targetUniversity": "University of Stuttgart",
    "preferredCourse": "MSc Mechanical Systems",
    "alternativeCourses": [
      "Mechatronics"
    ],
    "courseLevel": "Master",
    "intake": "2026/27",
    "counsellor": "Amit Verma",
    "enrollmentDate": "18 Jul 2025",
    "nextFollowUp": "31 Oct 2025",
    "overallStatus": "Shortlisting",
    "priority": "High",
    "currentStage": "University Shortlisting In Progress",
    "stageNumber": 3,
    "academic": {
      "highestQualification": "B.E. (Mech)",
      "university": "VNIT Nagpur",
      "passingYear": "2024",
      "cgpa": "8.5 / 10",
      "englishTest": "IELTS 7.5",
      "workExperience": "Fresher",
      "budget": "€12,000 / year"
    },
    "payment": {
      "servicePackage": "Germany Public University Master",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,50,000",
      "amountPaid": "₹ 1,50,000",
      "balance": "₹ 1,00,000",
      "schedule": [
        "1st: ₹50,000 (Paid)",
        "2nd: ₹1,00,000 (Paid)",
        "3rd: ₹1,00,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "Univ of Stuttgart",
        "program": "Mechanical Systems",
        "intake": "2026/27",
        "date": "05 Aug 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "Univ of Stuttgart",
        "date": "28 Sep 2025",
        "type": "Unconditional",
        "conditions": [
          "-"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport & APS",
        "status": "Verified",
        "date": "18 Jul 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "APS",
      "status": "Completed",
      "requiredBy": "DAAD"
    },
    "visa": {
      "appointmentDate": "24 Nov 2025",
      "status": "Slot Booked",
      "visaType": "National Visa D",
      "vfsReference": "GER-MUM-6102"
    },
    "timeline": [
      {
        "time": "28 Sep 2025 03:45 PM",
        "text": "Admit letter from University of Stuttgart accepted",
        "team": "Application Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "72f43217-0e1d-0f57-2fe6-934251607983",
    "studentId": "UK-2026-075",
    "name": "Aditya Kapoor",
    "avatar": "/avatars/amit.png",
    "phone": "+91 95444 66778",
    "email": "aditya.kapoor@gmail.com",
    "dob": "07 Nov 2000",
    "address": "Noida, Uttar Pradesh",
    "nationality": "Indian",
    "country": "UK",
    "countryCode": "GB",
    "targetUniversity": "University of Warwick",
    "preferredCourse": "MSc Supply Chain & Logistics Management",
    "alternativeCourses": [
      "Business Analytics"
    ],
    "courseLevel": "Master",
    "intake": "Sept 2026",
    "counsellor": "Rohan Shetty",
    "enrollmentDate": "10 Apr 2025",
    "nextFollowUp": "01 Nov 2025",
    "overallStatus": "Departure Ready",
    "priority": "Low",
    "currentStage": "Travel & Arrival Ready",
    "stageNumber": 12,
    "academic": {
      "highestQualification": "B.Tech (Industrial)",
      "university": "Thapar University",
      "passingYear": "2023",
      "cgpa": "8.3 / 10",
      "englishTest": "IELTS 7.5",
      "workExperience": "2 Years Supply Chain",
      "budget": "£24,000 / year"
    },
    "payment": {
      "servicePackage": "UK Premium Master Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,20,000",
      "amountPaid": "₹ 2,20,000",
      "balance": "₹ 0",
      "schedule": [
        "Full fee cleared"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "Univ of Warwick",
        "program": "Supply Chain Management",
        "intake": "Sept 2026",
        "date": "15 May 2025",
        "status": "Enrolled",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "Univ of Warwick",
        "date": "20 Jun 2025",
        "type": "Unconditional",
        "conditions": [
          "-"
        ],
        "status": "CAS Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport & Stamped BRP Letter",
        "status": "Verified",
        "date": "20 Sep 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "CAS",
      "status": "Completed",
      "requiredBy": "UKVI"
    },
    "visa": {
      "appointmentDate": "15 Aug 2025",
      "status": "Visa Issued",
      "visaType": "Student Visa",
      "vfsReference": "GWF-UK-55019"
    },
    "timeline": [
      {
        "time": "20 Sep 2025 12:00 PM",
        "text": "Visa granted by UKVI, pre-departure briefing completed",
        "team": "Visa Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "83054328-1f2e-1068-30f7-045362718094",
    "studentId": "ITA-2027-081",
    "name": "Shreya Ghosh",
    "avatar": "/avatars/ananya.png",
    "phone": "+91 94333 77889",
    "email": "shreya.ghosh@gmail.com",
    "dob": "26 Jan 2002",
    "address": "Bhubaneswar, Odisha",
    "nationality": "Indian",
    "country": "Italy",
    "countryCode": "IT",
    "targetUniversity": "Ca’ Foscari University of Venice",
    "preferredCourse": "MSc Global Economics & Finance",
    "alternativeCourses": [
      "International Business"
    ],
    "courseLevel": "Master",
    "intake": "2027/28",
    "counsellor": "Neha Jain",
    "enrollmentDate": "15 Sep 2025",
    "nextFollowUp": "02 Nov 2025",
    "overallStatus": "Offer Received",
    "priority": "Medium",
    "currentStage": "Offer Letter Received",
    "stageNumber": 6,
    "academic": {
      "highestQualification": "B.Sc (Statistics)",
      "university": "Utkal University",
      "passingYear": "2024",
      "cgpa": "8.4 / 10",
      "englishTest": "IELTS 7.0",
      "workExperience": "Fresher",
      "budget": "€11,000 / year"
    },
    "payment": {
      "servicePackage": "Italy Study Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,80,000",
      "amountPaid": "₹ 1,40,000",
      "balance": "₹ 1,40,000",
      "schedule": [
        "1st: ₹70,000 (Paid)",
        "2nd: ₹70,000 (Paid)",
        "3rd: ₹1,40,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "Ca’ Foscari Venice",
        "program": "Global Economics",
        "intake": "2027/28",
        "date": "25 Sep 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "Ca’ Foscari Venice",
        "date": "07 Oct 2025",
        "type": "Conditional",
        "conditions": [
          "Degree Verification"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport",
        "status": "Verified",
        "date": "15 Sep 2025"
      }
    ],
    "scholarships": [
      {
        "name": "Veneto Regional ESU",
        "deadline": "30 Sep 2026",
        "status": "Pending",
        "statusColor": "bg-[#fef3c7] text-[#d97706]"
      }
    ],
    "preEnrolment": [],
    "dov": {
      "processType": "CIMEA",
      "status": "Submitted",
      "requiredBy": "CaFoscari"
    },
    "visa": {
      "appointmentDate": "-",
      "status": "Not Started",
      "visaType": "Study Visa",
      "vfsReference": "-"
    },
    "timeline": [
      {
        "time": "07 Oct 2025 04:00 PM",
        "text": "Admit issued by Ca’ Foscari Venice",
        "team": "Application Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "94165439-203f-2179-4108-156473829105",
    "studentId": "GER-2026-085",
    "name": "Harsh Vardhan",
    "avatar": "/avatars/rohit.png",
    "phone": "+91 93222 88990",
    "email": "harsh.v@gmail.com",
    "dob": "16 Aug 2001",
    "address": "Kanpur, Uttar Pradesh",
    "nationality": "Indian",
    "country": "Germany",
    "countryCode": "DE",
    "targetUniversity": "University of Freiburg",
    "preferredCourse": "MSc Renewable Energy Engineering",
    "alternativeCourses": [
      "Sustainable Systems"
    ],
    "courseLevel": "Master",
    "intake": "2026/27",
    "counsellor": "Amit Verma",
    "enrollmentDate": "20 Jun 2025",
    "nextFollowUp": "03 Nov 2025",
    "overallStatus": "Visa Process",
    "priority": "High",
    "currentStage": "Visa Process In Progress",
    "stageNumber": 11,
    "academic": {
      "highestQualification": "B.Tech (Electrical)",
      "university": "HBTU Kanpur",
      "passingYear": "2024",
      "cgpa": "8.3 / 10",
      "englishTest": "IELTS 7.0",
      "workExperience": "Fresher",
      "budget": "€11,000 / year"
    },
    "payment": {
      "servicePackage": "Germany Public University Master",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,50,000",
      "amountPaid": "₹ 2,00,000",
      "balance": "₹ 50,000",
      "schedule": [
        "1st: ₹50,000 (Paid)",
        "2nd: ₹1,50,000 (Paid)",
        "3rd: ₹50,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "Univ of Freiburg",
        "program": "Renewable Energy",
        "intake": "2026/27",
        "date": "10 Jul 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "Univ of Freiburg",
        "date": "20 Aug 2025",
        "type": "Unconditional",
        "conditions": [
          "-"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport & APS",
        "status": "Verified",
        "date": "20 Jun 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "APS",
      "status": "Completed",
      "requiredBy": "DAAD"
    },
    "visa": {
      "appointmentDate": "12 Nov 2025",
      "status": "Appointment Booked",
      "visaType": "National Visa D",
      "vfsReference": "GER-DEL-8921"
    },
    "timeline": [
      {
        "time": "01 Oct 2025 03:00 PM",
        "text": "Blocked account funded and visa appointment confirmed",
        "team": "Visa Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "a5276540-3140-328a-5219-267584930216",
    "studentId": "UK-2026-089",
    "name": "Neha Agarwal",
    "avatar": "/avatars/sneha.png",
    "phone": "+91 92111 99001",
    "email": "neha.agarwal@gmail.com",
    "dob": "05 Mar 2002",
    "address": "Gurgaon, Haryana",
    "nationality": "Indian",
    "country": "UK",
    "countryCode": "GB",
    "targetUniversity": "University of Leeds",
    "preferredCourse": "MSc Sustainable Business",
    "alternativeCourses": [
      "Management"
    ],
    "courseLevel": "Master",
    "intake": "Sept 2026",
    "counsellor": "Rohan Shetty",
    "enrollmentDate": "14 Jul 2025",
    "nextFollowUp": "04 Nov 2025",
    "overallStatus": "Offer Received",
    "priority": "Medium",
    "currentStage": "Offer Letter Received",
    "stageNumber": 6,
    "academic": {
      "highestQualification": "BBA",
      "university": "Delhi University",
      "passingYear": "2024",
      "cgpa": "8.5 / 10",
      "englishTest": "IELTS 7.0",
      "workExperience": "Fresher",
      "budget": "£23,000 / year"
    },
    "payment": {
      "servicePackage": "UK Premium Master Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,20,000",
      "amountPaid": "₹ 1,50,000",
      "balance": "₹ 70,000",
      "schedule": [
        "1st: ₹1,00,000 (Paid)",
        "2nd: ₹50,000 (Paid)",
        "3rd: ₹70,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "Univ of Leeds",
        "program": "Sustainable Business",
        "intake": "Sept 2026",
        "date": "01 Aug 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "Univ of Leeds",
        "date": "22 Sep 2025",
        "type": "Unconditional",
        "conditions": [
          "-"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport & Degree",
        "status": "Verified",
        "date": "14 Jul 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "CAS",
      "status": "Pending Issue",
      "requiredBy": "UKVI"
    },
    "visa": {
      "appointmentDate": "-",
      "status": "Not Started",
      "visaType": "Student Visa",
      "vfsReference": "-"
    },
    "timeline": [
      {
        "time": "22 Sep 2025 04:30 PM",
        "text": "Unconditional admit accepted for University of Leeds",
        "team": "Application Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "b6387651-4251-439b-632a-378695041327",
    "studentId": "ITA-2027-094",
    "name": "Kunal Bhatia",
    "avatar": "/avatars/vikram.png",
    "phone": "+91 91000 11223",
    "email": "kunal.b@gmail.com",
    "dob": "21 Sep 2000",
    "address": "Jaipur, Rajasthan",
    "nationality": "Indian",
    "country": "Italy",
    "countryCode": "IT",
    "targetUniversity": "University of Florence",
    "preferredCourse": "MSc Architecture & Urban Design",
    "alternativeCourses": [
      "Landscape Architecture"
    ],
    "courseLevel": "Master",
    "intake": "2027/28",
    "counsellor": "Neha Jain",
    "enrollmentDate": "10 Sep 2025",
    "nextFollowUp": "25 Oct 2025, 04:00 PM",
    "overallStatus": "Counselling",
    "priority": "High",
    "currentStage": "Counselling In Progress",
    "stageNumber": 1,
    "academic": {
      "highestQualification": "B.Arch",
      "university": "Aayojan School of Architecture",
      "passingYear": "2023",
      "cgpa": "7.9 / 10",
      "englishTest": "IELTS 6.5",
      "workExperience": "1 Year Studio",
      "budget": "€10,000 / year"
    },
    "payment": {
      "servicePackage": "Italy Study Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,80,000",
      "amountPaid": "₹ 80,000",
      "balance": "₹ 2,00,000",
      "schedule": [
        "1st: ₹80,000 (Paid)",
        "2nd: ₹1,00,000 (Due Dec)",
        "3rd: ₹1,00,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "University of Florence",
        "program": "Architecture",
        "intake": "2027/28",
        "date": "02 Oct 2025",
        "status": "Submitted",
        "statusColor": "bg-[#e0f2fe] text-[#0284c7]"
      }
    ],
    "offers": [],
    "documents": [
      {
        "name": "Passport & Portfolio",
        "status": "Verified",
        "date": "10 Sep 2025"
      }
    ],
    "scholarships": [
      {
        "name": "DSU Toscana",
        "deadline": "10 Sep 2026",
        "status": "Pending",
        "statusColor": "bg-[#fef3c7] text-[#d97706]"
      }
    ],
    "preEnrolment": [],
    "dov": {
      "processType": "CIMEA",
      "status": "In Preparation",
      "requiredBy": "UniFi"
    },
    "visa": {
      "appointmentDate": "-",
      "status": "Not Started",
      "visaType": "Study Visa",
      "vfsReference": "-"
    },
    "timeline": [
      {
        "time": "02 Oct 2025 02:00 PM",
        "text": "Portfolio submitted to University of Florence portal",
        "team": "Application Team",
        "dotColor": "bg-[#087cf5]"
      }
    ]
  },
  {
    "id": "c7498762-5362-54ac-743b-489706152438",
    "studentId": "IRL-2026-098",
    "name": "Ishita Saxena",
    "avatar": "/avatars/ananya.png",
    "phone": "+91 90111 22334",
    "email": "ishita.saxena@gmail.com",
    "dob": "12 Jan 2001",
    "address": "Bhopal, Madhya Pradesh",
    "nationality": "Indian",
    "country": "Ireland",
    "countryCode": "IE",
    "targetUniversity": "University College Dublin",
    "preferredCourse": "MSc Business Analytics",
    "alternativeCourses": [
      "Data & Business Analysis"
    ],
    "courseLevel": "Master",
    "intake": "Sept 2026",
    "counsellor": "Rohan Shetty",
    "enrollmentDate": "01 Jun 2025",
    "nextFollowUp": "06 Nov 2025",
    "overallStatus": "Departure Ready",
    "priority": "Low",
    "currentStage": "Travel & Arrival Ready",
    "stageNumber": 12,
    "academic": {
      "highestQualification": "B.Com (Hons)",
      "university": "Barkatullah University",
      "passingYear": "2023",
      "cgpa": "8.7 / 10",
      "englishTest": "IELTS 7.5",
      "workExperience": "1 Year Analytics",
      "budget": "€19,000 / year"
    },
    "payment": {
      "servicePackage": "Ireland Premium Master Program",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,20,000",
      "amountPaid": "₹ 2,20,000",
      "balance": "₹ 0",
      "schedule": [
        "Full fee cleared"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "UCD Dublin",
        "program": "MSc Business Analytics",
        "intake": "Sept 2026",
        "date": "20 Jun 2025",
        "status": "Enrolled",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "UCD Dublin",
        "date": "15 Jul 2025",
        "type": "Unconditional",
        "conditions": [
          "-"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport & Ireland Stamp D",
        "status": "Verified",
        "date": "15 Sep 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "INIS Portal",
      "status": "Completed",
      "requiredBy": "Immigration"
    },
    "visa": {
      "appointmentDate": "20 Aug 2025",
      "status": "Visa Approved",
      "visaType": "Study Visa",
      "vfsReference": "IRL-DEL-4012"
    },
    "timeline": [
      {
        "time": "15 Sep 2025 04:00 PM",
        "text": "Ireland study visa stamped, pre-departure kit shared",
        "team": "Visa Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  },
  {
    "id": "d8509873-6473-65bd-854c-590817263549",
    "studentId": "GER-2026-102",
    "name": "Manan Chawla",
    "avatar": "/avatars/rohit.png",
    "phone": "+91 99222 33445",
    "email": "manan.c@gmail.com",
    "dob": "04 Oct 2000",
    "address": "Ludhiana, Punjab",
    "nationality": "Indian",
    "country": "Germany",
    "countryCode": "DE",
    "targetUniversity": "Karlsruhe Institute of Technology (KIT)",
    "preferredCourse": "MSc Electrical Engineering & IT",
    "alternativeCourses": [
      "Embedded Systems"
    ],
    "courseLevel": "Master",
    "intake": "2026/27",
    "counsellor": "Amit Verma",
    "enrollmentDate": "15 Jun 2025",
    "nextFollowUp": "07 Nov 2025",
    "overallStatus": "Visa Process",
    "priority": "High",
    "currentStage": "Visa Process In Progress",
    "stageNumber": 11,
    "academic": {
      "highestQualification": "B.Tech (ECE)",
      "university": "GNDU Amritsar",
      "passingYear": "2024",
      "cgpa": "8.4 / 10",
      "englishTest": "IELTS 7.0",
      "workExperience": "Fresher",
      "budget": "€11,500 / year"
    },
    "payment": {
      "servicePackage": "Germany Public University Master",
      "agreementStatus": "Signed",
      "totalFee": "₹ 2,50,000",
      "amountPaid": "₹ 2,00,000",
      "balance": "₹ 50,000",
      "schedule": [
        "1st: ₹50,000 (Paid)",
        "2nd: ₹1,50,000 (Paid)",
        "3rd: ₹50,000 (Visa)"
      ]
    },
    "applications": [
      {
        "id": 1,
        "university": "KIT Karlsruhe",
        "program": "Electrical Engineering",
        "intake": "2026/27",
        "date": "01 Jul 2025",
        "status": "Offer Received",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "offers": [
      {
        "university": "KIT Karlsruhe",
        "date": "18 Aug 2025",
        "type": "Unconditional",
        "conditions": [
          "-"
        ],
        "status": "Accepted",
        "statusColor": "bg-[#dcfce7] text-[#15803d]"
      }
    ],
    "documents": [
      {
        "name": "Passport & APS Certificate",
        "status": "Verified",
        "date": "15 Jun 2025"
      }
    ],
    "scholarships": [],
    "preEnrolment": [],
    "dov": {
      "processType": "APS",
      "status": "Completed",
      "requiredBy": "DAAD"
    },
    "visa": {
      "appointmentDate": "10 Nov 2025",
      "status": "Appointment Booked",
      "visaType": "National Visa D",
      "vfsReference": "GER-DEL-9102"
    },
    "timeline": [
      {
        "time": "05 Oct 2025 10:15 AM",
        "text": "Blocked account verified by Coracle, visa checklist ready",
        "team": "Visa Team",
        "dotColor": "bg-[#16a34a]"
      }
    ]
  }
];

