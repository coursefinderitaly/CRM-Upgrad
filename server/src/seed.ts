import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.application.deleteMany();
  await prisma.document.deleteMany();
  await prisma.counsellingSession.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.task.deleteMany();
  await prisma.student.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();
  await prisma.university.deleteMany();

  console.log('Seeding Counsellor Neha Sharma...');
  const neha = await prisma.user.create({
    data: {
      name: 'Neha Sharma',
      email: 'neha@studyabroad.com',
      passwordHash: 'hashed_password_placeholder',
      role: 'Counsellor',
      avatar: '/avatars/neha.png',
      phone: '+91 98765 00000',
    },
  });

  console.log('Seeding Universities...');
  await prisma.university.createMany({
    data: [
      {
        name: 'Sapienza University of Rome',
        country: 'Italy',
        city: 'Rome',
        ranking: 'Top 150',
        courses: 'MSc Computer Science, Data Science, AI',
        intake: 'Sept 2026',
        tuitionFee: '€ 1,000 - 3,000 / yr',
        universityType: 'Public',
        requirements: 'IELTS 6.5+, Min 70% in Bachelor',
      },
      {
        name: 'Politecnico di Milano',
        country: 'Italy',
        city: 'Milan',
        ranking: 'Top 120',
        courses: 'MSc Computer Engineering, Management, Architecture',
        intake: 'Sept 2026',
        tuitionFee: '€ 3,900 / yr',
        universityType: 'Public',
        requirements: 'IELTS 6.5+, GRE recommended',
      },
      {
        name: 'Technical University of Munich',
        country: 'Germany',
        city: 'Munich',
        ranking: 'Top 50',
        courses: 'MBA, Informatics, Automotive',
        intake: 'Oct 2026',
        tuitionFee: '€ 0 (Semester fee only)',
        universityType: 'Public',
        requirements: 'IELTS 7.0+, ECTS match',
      },
      {
        name: 'University of Toronto',
        country: 'Canada',
        city: 'Toronto',
        ranking: 'Top 25',
        courses: 'MSc Data Science, CS, Finance',
        intake: 'Sept 2026',
        tuitionFee: 'CAD 45,000 / yr',
        universityType: 'Public',
        requirements: 'IELTS 7.0+, 80%+ GPA',
      },
      {
        name: 'University of Manchester',
        country: 'UK',
        city: 'Manchester',
        ranking: 'Top 35',
        courses: 'BSc Nursing, Healthcare, CS',
        intake: 'Sept 2026',
        tuitionFee: '£ 26,000 / yr',
        universityType: 'Public',
        requirements: 'IELTS 7.0+, Biology score',
      },
      {
        name: 'University of Melbourne',
        country: 'Australia',
        city: 'Melbourne',
        ranking: 'Top 35',
        courses: 'MSc IT, Software Engineering',
        intake: 'July 2026',
        tuitionFee: 'AUD 48,000 / yr',
        universityType: 'Public',
        requirements: 'IELTS 6.5+, 70% in Bachelor',
      },
    ],
  });

  console.log('Seeding Primary 5 Leads from Dashboard Reference...');

  // 1. Rahul Sharma
  const rahul = await prisma.lead.create({
    data: {
      leadId: 'L2025100501',
      studentName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul@gmail.com',
      dob: '12 May 2000',
      address: 'Indore, Madhya Pradesh',
      nationality: 'Indian',
      countryInterest: 'Italy',
      courseInterest: 'MSc Computer Science',
      intake: 'Sept 2026',
      budget: '€ 8,000 – 15,000',
      universityType: 'Public / Private',
      preferredCity: 'Rome / Milan',
      leadSource: 'Google Ads',
      lastActivity: '05 Oct 2025',
      nextFollowUp: '10 Oct 2025',
      nextFollowUpTime: '11:00 AM',
      nextFollowUpTask: 'Call to discuss university options',
      status: 'New Lead',
      avatarUrl: '/avatars/rahul.png',
      counsellorId: neha.id,
      notes: 'Strong candidate for Italy public universities. Wants English taught MSc in AI/Computer Science.',
      tenthBoard: 'CBSE',
      tenthPercentage: '86.4%',
      tenthYear: '2016',
      twelfthBoard: 'CBSE',
      twelfthPercentage: '84.2%',
      twelfthYear: '2018',
      graduationDegree: 'B.Tech Computer Science',
      graduationUniversity: 'RGPV Bhopal',
      graduationCgpa: '8.2 CGPA',
      graduationYear: '2022',
      backlogs: '0',
      educationGaps: 'None',
      testType: 'IELTS',
      testOverallScore: '7.5',
      testDate: '15 Jan 2025',
      testScoresDetails: 'Listening: 8.0, Reading: 7.5, Writing: 7.0, Speaking: 7.5',
      testResultStatus: 'Passed',
      currentStage: 'New Lead',
    },
  });

  // 2. Priya Singh
  const priya = await prisma.lead.create({
    data: {
      leadId: 'L2025100402',
      studentName: 'Priya Singh',
      phone: '+91 87654 32109',
      email: 'priya.singh@gmail.com',
      dob: '18 Aug 1999',
      address: 'Jaipur, Rajasthan',
      nationality: 'Indian',
      countryInterest: 'Germany',
      courseInterest: 'MBA',
      intake: 'Sept 2026',
      budget: '€ 10,000 – 20,000',
      universityType: 'Public',
      preferredCity: 'Munich / Berlin',
      leadSource: 'Website',
      lastActivity: '04 Oct 2025',
      nextFollowUp: '06 Oct 2025',
      nextFollowUpTime: '12:30 PM',
      nextFollowUpTask: 'Course and university options discussion',
      status: 'Counselling',
      avatarUrl: '/avatars/priya.png',
      counsellorId: neha.id,
      notes: 'Looking for tuition-free public universities in Germany. Working on APS certificate.',
      graduationDegree: 'BBA Finance',
      graduationUniversity: 'Rajasthan University',
      graduationCgpa: '7.8 CGPA',
      graduationYear: '2021',
      testType: 'IELTS',
      testOverallScore: '7.0',
      currentStage: 'Counselling',
    },
  });

  // 3. Amit Kumar
  const amit = await prisma.lead.create({
    data: {
      leadId: 'L2025100303',
      studentName: 'Amit Kumar',
      phone: '+91 95432 16789',
      email: 'amit.kumar@gmail.com',
      dob: '04 Nov 2001',
      address: 'Chandigarh, Punjab',
      nationality: 'Indian',
      countryInterest: 'Canada',
      courseInterest: 'MSc Data Science',
      intake: 'Jan 2027',
      budget: 'CAD 25,000 – 35,000',
      universityType: 'Public',
      preferredCity: 'Toronto / Vancouver',
      leadSource: 'Referral',
      lastActivity: '03 Oct 2025',
      nextFollowUp: '08 Oct 2025',
      nextFollowUpTime: '02:00 PM',
      nextFollowUpTask: 'Send IELTS preparation & exam options',
      status: 'Interested',
      avatarUrl: '/avatars/amit.png',
      counsellorId: neha.id,
      notes: 'Referred by alumni Karan Verma. Preparing for IELTS exam in November.',
      graduationDegree: 'B.Sc Statistics & Math',
      graduationUniversity: 'Panjab University',
      graduationCgpa: '8.4 CGPA',
      graduationYear: '2023',
      testType: 'IELTS',
      testOverallScore: 'In Prep',
      currentStage: 'New Lead',
    },
  });

  // 4. Sneha Patel
  const sneha = await prisma.lead.create({
    data: {
      leadId: 'L2025100504',
      studentName: 'Sneha Patel',
      phone: '+91 99876 54321',
      email: 'sneha.patel@gmail.com',
      dob: '22 Mar 2003',
      address: 'Ahmedabad, Gujarat',
      nationality: 'Indian',
      countryInterest: 'UK',
      courseInterest: 'BSc Nursing',
      intake: 'Sept 2026',
      budget: '£ 20,000 – 28,000',
      universityType: 'Public',
      preferredCity: 'London / Manchester',
      leadSource: 'Instagram',
      lastActivity: '05 Oct 2025',
      nextFollowUp: '09 Oct 2025',
      nextFollowUpTime: '04:00 PM',
      nextFollowUpTask: 'Check admission interest & offer acceptances',
      status: 'Enrolled',
      avatarUrl: '/avatars/sneha.png',
      counsellorId: neha.id,
      notes: 'Completed enrollment fee payment. Documentation submitted for Manchester and Birmingham.',
      isEnrolled: true,
      enrolledAt: new Date('2025-10-04'),
      isTransferredToDocs: true,
      transferredAt: new Date('2025-10-05'),
      currentStage: 'Enrolled',
      tenthPercentage: '91.2%',
      twelfthPercentage: '88.6%',
      testType: 'IELTS',
      testOverallScore: '7.5',
    },
  });

  // Student entry for enrolled Sneha
  await prisma.student.create({
    data: {
      studentId: 'STU20251004',
      leadId: sneha.id,
      name: sneha.studentName,
      email: sneha.email,
      phone: sneha.phone,
      country: sneha.countryInterest,
      course: sneha.courseInterest,
      intake: sneha.intake || 'Sept 2026',
      stage: 'Documentation',
      enrolledDate: new Date('2025-10-04'),
    },
  });

  // 5. Rohit Verma
  const rohit = await prisma.lead.create({
    data: {
      leadId: 'L2025100205',
      studentName: 'Rohit Verma',
      phone: '+91 91234 56789',
      email: 'rohit.verma@gmail.com',
      dob: '15 Jul 2000',
      address: 'Lucknow, Uttar Pradesh',
      nationality: 'Indian',
      countryInterest: 'Australia',
      courseInterest: 'MSc IT',
      intake: 'July 2026',
      budget: 'AUD 35,000 – 45,000',
      universityType: 'Public',
      preferredCity: 'Melbourne / Sydney',
      leadSource: 'Justdial',
      lastActivity: '02 Oct 2025',
      nextFollowUp: '07 Oct 2025',
      nextFollowUpTime: '05:00 PM',
      nextFollowUpTask: 'Prepare proposal and share university shortlist',
      status: 'Follow-up',
      avatarUrl: '/avatars/rohit.png',
      counsellorId: neha.id,
      notes: 'Interested in post-study work visa in Australia. 2 years IT work experience.',
      graduationDegree: 'BCA Information Technology',
      graduationUniversity: 'Lucknow University',
      graduationCgpa: '7.9 CGPA',
      graduationYear: '2022',
      testType: 'PTE',
      testOverallScore: '68',
      currentStage: 'Counselling',
    },
  });

  console.log('Seeding Remaining Leads to match EXACT totals (48 leads, 22 contacted, 15 counselling, 8 enrolled, 5 transferred, 6 on hold, 3 lost)...');

  // We already have:
  // Rahul: New Lead (Google Ads, Italy)
  // Priya: Counselling (Website, Germany)
  // Amit: Interested / Contacted (Referral, Canada)
  // Sneha: Enrolled / Transferred (Instagram, UK)
  // Rohit: Follow-up / Contacted (Justdial, Australia)
  //
  // Remaining to make total 48:
  // Countries target: Italy 16 (1 seeded, need 15), Germany 10 (1 seeded, need 9), Canada 8 (1 seeded, need 7), UK 6 (1 seeded, need 5), Australia 4 (1 seeded, need 3), Others 4 (0 seeded, need 4)
  // Sources target: Google Ads 17 (1 seeded, need 16), Website 12 (1 seeded, need 11), Instagram 7 (1 seeded, need 6), Justdial 5 (1 seeded, need 4), Referral 5 (1 seeded, need 4), Others 2 (need 2)
  // Statuses: Counselling 15 (Priya + 14), Enrolled 8 (Sneha + 7), Transferred 5 (Sneha + 4), On Hold 6, Lost 3, Follow-up / Contacted / New Lead to fill remaining.

  const additionalLeads = [
    // Italy (15 more)
    { name: 'Ananya Deshmukh', country: 'Italy', course: 'MSc International Business', source: 'Google Ads', status: 'Counselling', activity: '05 Oct 2025', followUp: '11 Oct 2025' },
    { name: 'Kunal Joshi', country: 'Italy', course: 'MSc Mechanical Engineering', source: 'Google Ads', status: 'Counselling', activity: '04 Oct 2025', followUp: '12 Oct 2025' },
    { name: 'Pooja Iyer', country: 'Italy', course: 'MA Fashion Design', source: 'Instagram', status: 'Enrolled', activity: '03 Oct 2025', followUp: '10 Oct 2025', isEnrolled: true, isTransferredToDocs: false },
    { name: 'Vikas Rao', country: 'Italy', course: 'MSc Computer Science', source: 'Google Ads', status: 'Transferred', activity: '04 Oct 2025', followUp: '15 Oct 2025', isEnrolled: true, isTransferredToDocs: true },
    { name: 'Deepika Malhotra', country: 'Italy', course: 'MSc Economics & Finance', source: 'Website', status: 'Counselling', activity: '02 Oct 2025', followUp: '09 Oct 2025' },
    { name: 'Aditya Kulkarni', country: 'Italy', course: 'MSc Data Engineering', source: 'Google Ads', status: 'Interested', activity: '05 Oct 2025', followUp: '11 Oct 2025' },
    { name: 'Ritu Mehra', country: 'Italy', course: 'MA Architecture', source: 'Google Ads', status: 'On Hold', activity: '01 Oct 2025', followUp: '18 Oct 2025' },
    { name: 'Siddharth Jain', country: 'Italy', course: 'MSc Cyber Security', source: 'Website', status: 'Enrolled', activity: '04 Oct 2025', followUp: '14 Oct 2025', isEnrolled: true },
    { name: 'Tanvi Nair', country: 'Italy', course: 'MSc Biotechnology', source: 'Google Ads', status: 'Counselling', activity: '03 Oct 2025', followUp: '13 Oct 2025' },
    { name: 'Harsh Vardhan', country: 'Italy', course: 'MSc Robotics', source: 'Justdial', status: 'Follow-up', activity: '02 Oct 2025', followUp: '08 Oct 2025' },
    { name: 'Simran Kaur', country: 'Italy', course: 'MSc Food Safety & Technology', source: 'Google Ads', status: 'Lost', activity: '28 Sep 2025', followUp: 'None' },
    { name: 'Gaurav Saxena', country: 'Italy', course: 'MSc Renewable Energy', source: 'Google Ads', status: 'Contacted', activity: '05 Oct 2025', followUp: '12 Oct 2025' },
    { name: 'Megha Sen', country: 'Italy', course: 'MSc Product Design', source: 'Instagram', status: 'On Hold', activity: '30 Sep 2025', followUp: '20 Oct 2025' },
    { name: 'Arjun Das', country: 'Italy', course: 'MSc Biomedical Engineering', source: 'Website', status: 'Counselling', activity: '03 Oct 2025', followUp: '11 Oct 2025' },
    { name: 'Rohan Bhatt', country: 'Italy', course: 'MSc Artificial Intelligence', source: 'Google Ads', status: 'Contacted', activity: '04 Oct 2025', followUp: '10 Oct 2025' },

    // Germany (9 more)
    { name: 'Manish Tiwari', country: 'Germany', course: 'MSc Automotive Systems', source: 'Website', status: 'Counselling', activity: '05 Oct 2025', followUp: '10 Oct 2025' },
    { name: 'Swati Pandey', country: 'Germany', course: 'MSc Chemical Engineering', source: 'Google Ads', status: 'Enrolled', activity: '04 Oct 2025', followUp: '12 Oct 2025', isEnrolled: true },
    { name: 'Nikhil Shinde', country: 'Germany', course: 'MSc Embedded Systems', source: 'Website', status: 'Transferred', activity: '03 Oct 2025', followUp: '15 Oct 2025', isEnrolled: true, isTransferredToDocs: true },
    { name: 'Shruti Agarwal', country: 'Germany', course: 'MSc Management', source: 'Referral', status: 'Counselling', activity: '04 Oct 2025', followUp: '11 Oct 2025' },
    { name: 'Pranav Roy', country: 'Germany', course: 'MSc Electrical Engineering', source: 'Google Ads', status: 'On Hold', activity: '01 Oct 2025', followUp: '19 Oct 2025' },
    { name: 'Kavita Menon', country: 'Germany', course: 'MSc Physics', source: 'Website', status: 'Counselling', activity: '02 Oct 2025', followUp: '09 Oct 2025' },
    { name: 'Varun Chopra', country: 'Germany', course: 'MSc Mechatronics', source: 'Justdial', status: 'Follow-up', activity: '05 Oct 2025', followUp: '13 Oct 2025' },
    { name: 'Shalini Gupta', country: 'Germany', course: 'MSc Data Analytics', source: 'Google Ads', status: 'Contacted', activity: '04 Oct 2025', followUp: '08 Oct 2025' },
    { name: 'Akash Yadav', country: 'Germany', course: 'MSc Industrial Engineering', source: 'Website', status: 'Enrolled', activity: '03 Oct 2025', followUp: '14 Oct 2025', isEnrolled: true },

    // Canada (7 more)
    { name: 'Bhavna Rajput', country: 'Canada', course: 'Post Graduate Diploma in AI', source: 'Referral', status: 'Counselling', activity: '05 Oct 2025', followUp: '12 Oct 2025' },
    { name: 'Karan Mehra', country: 'Canada', course: 'MBA Global Business', source: 'Google Ads', status: 'Enrolled', activity: '04 Oct 2025', followUp: '16 Oct 2025', isEnrolled: true },
    { name: 'Sanjay Reddy', country: 'Canada', course: 'MSc Cloud Computing', source: 'Website', status: 'Transferred', activity: '02 Oct 2025', followUp: '14 Oct 2025', isEnrolled: true, isTransferredToDocs: true },
    { name: 'Preeti Sharma', country: 'Canada', course: 'Project Management Diploma', source: 'Referral', status: 'Counselling', activity: '04 Oct 2025', followUp: '11 Oct 2025' },
    { name: 'Girish Patil', country: 'Canada', course: 'MSc Cybersecurity', source: 'Instagram', status: 'On Hold', activity: '29 Sep 2025', followUp: '22 Oct 2025' },
    { name: 'Aakanksha Roy', country: 'Canada', course: 'Diploma in Health Informatics', source: 'Website', status: 'Lost', activity: '27 Sep 2025', followUp: 'None' },
    { name: 'Tarun Sethi', country: 'Canada', course: 'MSc Big Data Analytics', source: 'Google Ads', status: 'Contacted', activity: '05 Oct 2025', followUp: '10 Oct 2025' },

    // UK (5 more)
    { name: 'Divya Nair', country: 'UK', course: 'LLM Corporate Law', source: 'Instagram', status: 'Counselling', activity: '04 Oct 2025', followUp: '11 Oct 2025' },
    { name: 'Sameer Khan', country: 'UK', course: 'MSc Public Health', source: 'Website', status: 'Enrolled', activity: '03 Oct 2025', followUp: '15 Oct 2025', isEnrolled: true },
    { name: 'Ishita Kapoor', country: 'UK', course: 'MSc Finance & Banking', source: 'Instagram', status: 'Counselling', activity: '05 Oct 2025', followUp: '12 Oct 2025' },
    { name: 'Ashish Goel', country: 'UK', course: 'MSc Artificial Intelligence', source: 'Google Ads', status: 'Transferred', activity: '02 Oct 2025', followUp: '14 Oct 2025', isEnrolled: true, isTransferredToDocs: true },
    { name: 'Pallavi Joshi', country: 'UK', course: 'MA Digital Marketing', source: 'Instagram', status: 'On Hold', activity: '30 Sep 2025', followUp: '21 Oct 2025' },

    // Australia (3 more)
    { name: 'Naveen Kumar', country: 'Australia', course: 'Master of Professional Accounting', source: 'Justdial', status: 'Counselling', activity: '04 Oct 2025', followUp: '10 Oct 2025' },
    { name: 'Rupali Sharma', country: 'Australia', course: 'Master of Information Technology', source: 'Justdial', status: 'Enrolled', activity: '05 Oct 2025', followUp: '16 Oct 2025', isEnrolled: true },
    { name: 'Chirag Singhal', country: 'Australia', course: 'Master of Engineering Management', source: 'Website', status: 'Contacted', activity: '03 Oct 2025', followUp: '09 Oct 2025' },

    // Others (Ireland, New Zealand, USA, France - 4 total)
    { name: 'Geetika Das', country: 'Ireland', course: 'MSc Pharmaceutical Sciences', source: 'Referral', status: 'Counselling', activity: '05 Oct 2025', followUp: '11 Oct 2025' },
    { name: 'Abhishek Pillai', country: 'France', course: 'MSc Luxury Management', source: 'Others', status: 'On Hold', activity: '01 Oct 2025', followUp: '18 Oct 2025' },
    { name: 'Kavita Ghosh', country: 'USA', course: 'MS Computer Science', source: 'Others', status: 'Contacted', activity: '04 Oct 2025', followUp: '13 Oct 2025' },
    { name: 'Prateek Somani', country: 'New Zealand', course: 'Master of Construction Management', source: 'Google Ads', status: 'Lost', activity: '25 Sep 2025', followUp: 'None' },
  ];

  let idCounter = 6;
  for (const item of additionalLeads) {
    const leadCode = `L202510${idCounter < 10 ? '0' + idCounter : idCounter}`;
    const phoneNo = `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`;
    const emailAddr = `${item.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

    const l = await prisma.lead.create({
      data: {
        leadId: leadCode,
        studentName: item.name,
        phone: phoneNo,
        email: emailAddr,
        countryInterest: item.country,
        courseInterest: item.course,
        leadSource: item.source,
        lastActivity: item.activity,
        nextFollowUp: item.followUp,
        status: item.status,
        counsellorId: neha.id,
        isEnrolled: !!item.isEnrolled,
        isTransferredToDocs: !!item.isTransferredToDocs,
        enrolledAt: item.isEnrolled ? new Date('2025-10-02') : null,
        transferredAt: item.isTransferredToDocs ? new Date('2025-10-03') : null,
        currentStage: item.isTransferredToDocs ? 'Documentation' : item.isEnrolled ? 'Enrolled' : item.status === 'Counselling' ? 'Counselling' : 'New Lead',
      },
    });

    if (item.isEnrolled) {
      await prisma.student.create({
        data: {
          studentId: `STU202510${idCounter < 10 ? '0' + idCounter : idCounter}`,
          leadId: l.id,
          name: l.studentName,
          email: l.email,
          phone: l.phone,
          country: l.countryInterest,
          course: l.courseInterest,
          intake: 'Sept 2026',
          stage: item.isTransferredToDocs ? 'Documentation' : 'Enrolled',
        },
      });
    }

    idCounter++;
  }

  console.log('Seeding Today Tasks...');
  await prisma.task.createMany({
    data: [
      {
        title: 'Call Rahul Sharma',
        subtitle: 'Discuss documents list',
        time: '11:00 AM',
        dueDate: '10 Oct 2025',
        dueStatus: 'Due Now',
        completed: false,
        priority: 'High',
        leadId: rahul.id,
        assignedToId: neha.id,
      },
      {
        title: 'Counselling with Priya Singh',
        subtitle: 'Course and university options',
        time: '12:30 PM',
        dueDate: '10 Oct 2025',
        dueStatus: 'Upcoming',
        completed: false,
        priority: 'High',
        leadId: priya.id,
        assignedToId: neha.id,
      },
      {
        title: 'Send IELTS options to Amit Kumar',
        subtitle: 'Email and WhatsApp',
        time: '02:00 PM',
        dueDate: '10 Oct 2025',
        dueStatus: 'Upcoming',
        completed: false,
        priority: 'Medium',
        leadId: amit.id,
        assignedToId: neha.id,
      },
      {
        title: 'Follow-up with Sneha Patel',
        subtitle: 'Check admission interest',
        time: '04:00 PM',
        dueDate: '10 Oct 2025',
        dueStatus: 'Upcoming',
        completed: false,
        priority: 'Medium',
        leadId: sneha.id,
        assignedToId: neha.id,
      },
      {
        title: 'Prepare proposal for Rohit Verma',
        subtitle: 'Share university list',
        time: '05:00 PM',
        dueDate: '10 Oct 2025',
        dueStatus: 'Upcoming',
        completed: false,
        priority: 'Low',
        leadId: rohit.id,
        assignedToId: neha.id,
      },
    ],
  });

  console.log('Seeding Follow-ups...');
  await prisma.followUp.createMany({
    data: [
      {
        leadId: rahul.id,
        studentName: 'Rahul Sharma',
        date: '10 Oct 2025',
        time: '11:00 AM',
        task: 'Call to discuss university options and documents list',
        reminder: '15 minutes before',
        status: 'Scheduled',
        notes: 'Provide details regarding Sapienza & Politecnico di Milano',
      },
      {
        leadId: priya.id,
        studentName: 'Priya Singh',
        date: '06 Oct 2025',
        time: '12:30 PM',
        task: 'Course and university options counselling',
        reminder: '30 minutes before',
        status: 'Scheduled',
        notes: 'Check German B1 level status',
      },
    ],
  });

  console.log('Seeding Counselling Sessions...');
  await prisma.counsellingSession.createMany({
    data: [
      {
        leadId: rahul.id,
        date: '05 Oct 2025',
        time: '03:00 PM',
        counsellorName: 'Neha Sharma',
        notes: 'Student interested in English-taught MSc degrees in Italy with affordable tuition fees.',
        recommendations: 'Sapienza University of Rome, Politecnico di Milano, University of Padua',
        concerns: 'English requirements and regional scholarship application timeline',
        outcome: 'Scheduled follow-up for document collection on 10 Oct 2025',
      },
    ],
  });

  console.log('Seeding Rahul Sharma Documents...');
  await prisma.document.createMany({
    data: [
      { leadId: rahul.id, name: 'Passport', category: 'Identity', status: 'Received', notes: 'Valid till 2032' },
      { leadId: rahul.id, name: '10th Marksheet', category: 'Academic', status: 'Received', notes: 'CBSE 86.4%' },
      { leadId: rahul.id, name: '12th Marksheet', category: 'Academic', status: 'Received', notes: 'CBSE 84.2%' },
      { leadId: rahul.id, name: 'Graduation Degree & Transcripts', category: 'Academic', status: 'Under Verification', notes: 'B.Tech 8.2 CGPA' },
      { leadId: rahul.id, name: 'IELTS Score Card', category: 'Language', status: 'Received', notes: '7.5 Overall' },
      { leadId: rahul.id, name: 'Statement of Purpose (SOP)', category: 'Academic', status: 'Requested', notes: 'Drafting in progress' },
      { leadId: rahul.id, name: 'Letter of Recommendation 1', category: 'Academic', status: 'Pending', notes: 'From College Professor' },
      { leadId: rahul.id, name: 'Curriculum Vitae (CV)', category: 'Academic', status: 'Received', notes: 'Europass format' },
    ],
  });

  console.log('Seeding Applications for Application in Process KPI...');
  await prisma.application.createMany({
    data: [
      {
        leadId: sneha.id,
        universityName: 'University of Manchester',
        course: 'BSc Nursing',
        intake: 'Sept 2026',
        status: 'Offer Received',
        referenceNo: 'UCAS-MAN-88219',
        submissionDate: '28 Sep 2025',
        offerType: 'Conditional Offer',
      },
      {
        leadId: sneha.id,
        universityName: 'University of Birmingham',
        course: 'BSc Adult Nursing',
        intake: 'Sept 2026',
        status: 'Under Review',
        referenceNo: 'UCAS-BIR-94102',
        submissionDate: '01 Oct 2025',
        offerType: 'Pending',
      },
      {
        leadId: priya.id,
        universityName: 'Technical University of Munich',
        course: 'MBA Innovation & Tech',
        intake: 'Oct 2026',
        status: 'Submitted',
        referenceNo: 'TUM-2026-MBA-441',
        submissionDate: '03 Oct 2025',
        offerType: 'Pending',
      },
    ],
  });

  console.log('Seeding Notifications...');
  await prisma.notification.createMany({
    data: [
      {
        title: 'New Lead Assigned',
        message: 'Rahul Sharma interested in Italy MSc Computer Science',
        type: 'lead',
        isRead: false,
        link: '/leads/L2025100501',
      },
      {
        title: 'Follow-up Due Now',
        message: 'Call Rahul Sharma scheduled for 11:00 AM today',
        type: 'followup',
        isRead: false,
        link: '/tasks',
      },
      {
        title: 'Offer Received 🎉',
        message: 'Conditional Offer received for Sneha Patel from University of Manchester',
        type: 'application',
        isRead: false,
        link: '/applications',
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
