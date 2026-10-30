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
  budget?: string;
  counsellor: string;
  enrollmentDate: string;
  nextFollowUp: string;
  overallStatus: string;
  priority: 'High' | 'Medium' | 'Low';
  currentStage: string;
  stageNumber: number; // 1 to 12
  /** Physical SQLite file backing this profile */
  folderName?: string;
  dbFile?: string;
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
    "overallStatus": "Enrolled",
    "priority": "Medium",
    "currentStage": "Enrolled & Ready for Shortlisting",
    "stageNumber": 1,
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
    "stageNumber": 4,
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
    "stageNumber": 4,
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
  }
];
