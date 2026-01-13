import { TaskStatus, Priority } from '../types';

// Initial tasks for the care plan
export const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Morning Medication',
    description: 'Administer prescribed medications with breakfast',
    instructions: 'Give 2 tablets of Metformin with food. Ensure patient drinks full glass of water.',
    scheduledTime: '08:00 AM',
    timeWindow: '7:30 AM - 9:00 AM',
    priority: Priority.CRITICAL,
    status: TaskStatus.PENDING,
    requiresPhoto: true,
    completedAt: null,
    completionNote: '',
    evidenceUrl: null,
    missedReason: null
  },
  {
    id: '2',
    title: 'Breakfast Assistance',
    description: 'Help with breakfast preparation and eating',
    instructions: 'Prepare oatmeal with fruit. Assist with eating if needed. Monitor food intake.',
    scheduledTime: '08:30 AM',
    timeWindow: '8:00 AM - 9:30 AM',
    priority: Priority.STANDARD,
    status: TaskStatus.PENDING,
    requiresPhoto: false,
    completedAt: null,
    completionNote: '',
    evidenceUrl: null,
    missedReason: null
  },
  {
    id: '3',
    title: 'Morning Walk',
    description: '15-minute assisted walk around the house',
    instructions: 'Use walker for support. Take breaks as needed. Watch for signs of fatigue.',
    scheduledTime: '10:00 AM',
    timeWindow: '9:30 AM - 11:00 AM',
    priority: Priority.QUALITY_OF_LIFE,
    status: TaskStatus.PENDING,
    requiresPhoto: false,
    completedAt: null,
    completionNote: '',
    evidenceUrl: null,
    missedReason: null
  },
  {
    id: '4',
    title: 'Blood Pressure Check',
    description: 'Take and record blood pressure reading',
    instructions: 'Patient should be seated and rested for 5 minutes before taking reading. Record both systolic and diastolic.',
    scheduledTime: '10:30 AM',
    timeWindow: '10:00 AM - 11:30 AM',
    priority: Priority.CRITICAL,
    status: TaskStatus.PENDING,
    requiresPhoto: true,
    completedAt: null,
    completionNote: '',
    evidenceUrl: null,
    missedReason: null
  },
  {
    id: '5',
    title: 'Hydration Check',
    description: 'Ensure patient drinks water',
    instructions: 'Offer 8oz glass of water. Track fluid intake.',
    scheduledTime: '11:00 AM',
    timeWindow: '10:30 AM - 12:00 PM',
    priority: Priority.STANDARD,
    status: TaskStatus.PENDING,
    requiresPhoto: false,
    completedAt: null,
    completionNote: '',
    evidenceUrl: null,
    missedReason: null
  },
  {
    id: '6',
    title: 'Lunch Preparation',
    description: 'Prepare and serve lunch',
    instructions: 'Follow dietary restrictions. Ensure soft foods for easier eating. Cut food into small pieces.',
    scheduledTime: '12:00 PM',
    timeWindow: '11:30 AM - 1:00 PM',
    priority: Priority.STANDARD,
    status: TaskStatus.PENDING,
    requiresPhoto: true,
    completedAt: null,
    completionNote: '',
    evidenceUrl: null,
    missedReason: null
  },
  {
    id: '7',
    title: 'Afternoon Medication',
    description: 'Administer afternoon medications',
    instructions: 'Give blood pressure medication with lunch. Check for any adverse reactions.',
    scheduledTime: '12:30 PM',
    timeWindow: '12:00 PM - 1:30 PM',
    priority: Priority.CRITICAL,
    status: TaskStatus.PENDING,
    requiresPhoto: true,
    completedAt: null,
    completionNote: '',
    evidenceUrl: null,
    missedReason: null
  },
  {
    id: '8',
    title: 'Rest Period',
    description: 'Assist with afternoon rest',
    instructions: 'Help patient to bed for afternoon nap. Ensure comfortable position.',
    scheduledTime: '2:00 PM',
    timeWindow: '1:30 PM - 3:00 PM',
    priority: Priority.QUALITY_OF_LIFE,
    status: TaskStatus.PENDING,
    requiresPhoto: false,
    completedAt: null,
    completionNote: '',
    evidenceUrl: null,
    missedReason: null
  },
  {
    id: '9',
    title: 'Physical Therapy Exercises',
    description: 'Guide through prescribed exercises',
    instructions: 'Follow PT protocol sheet. 10 reps of each exercise. Stop if patient reports pain.',
    scheduledTime: '3:30 PM',
    timeWindow: '3:00 PM - 4:30 PM',
    priority: Priority.STANDARD,
    status: TaskStatus.PENDING,
    requiresPhoto: false,
    completedAt: null,
    completionNote: '',
    evidenceUrl: null,
    missedReason: null
  },
  {
    id: '10',
    title: 'Evening Medication',
    description: 'Administer evening medications',
    instructions: 'Give heart medication and vitamins. Ensure taken with food.',
    scheduledTime: '5:00 PM',
    timeWindow: '4:30 PM - 6:00 PM',
    priority: Priority.CRITICAL,
    status: TaskStatus.PENDING,
    requiresPhoto: true,
    completedAt: null,
    completionNote: '',
    evidenceUrl: null,
    missedReason: null
  },
  {
    id: '11',
    title: 'Dinner Service',
    description: 'Prepare and serve dinner',
    instructions: 'Prepare balanced meal according to dietary plan. Assist with eating as needed.',
    scheduledTime: '6:00 PM',
    timeWindow: '5:30 PM - 7:00 PM',
    priority: Priority.STANDARD,
    status: TaskStatus.PENDING,
    requiresPhoto: true,
    completedAt: null,
    completionNote: '',
    evidenceUrl: null,
    missedReason: null
  },
  {
    id: '12',
    title: 'Bedtime Routine',
    description: 'Assist with bedtime preparation',
    instructions: 'Help with brushing teeth, changing into pajamas. Ensure bedroom is comfortable temperature.',
    scheduledTime: '8:00 PM',
    timeWindow: '7:30 PM - 9:00 PM',
    priority: Priority.STANDARD,
    status: TaskStatus.PENDING,
    requiresPhoto: false,
    completedAt: null,
    completionNote: '',
    evidenceUrl: null,
    missedReason: null
  }
];

// Proposed tasks from family members
export const PROPOSED_TASKS = [
  {
    id: 'p1',
    title: 'Extra Walk in Garden',
    description: 'Take a short walk in the backyard garden',
    instructions: 'Weather permitting, help David walk to see the flowers. He enjoys this.',
    scheduledTime: '4:00 PM',
    timeWindow: '3:30 PM - 5:00 PM',
    priority: Priority.QUALITY_OF_LIFE,
    status: TaskStatus.PROPOSED,
    requiresPhoto: true,
    proposedBy: 'Mary Smith (Daughter)',
    proposedAt: new Date().toISOString()
  },
  {
    id: 'p2',
    title: 'Video Call with Grandchildren',
    description: 'Help set up tablet for video call',
    instructions: 'The grandkids want to say hi! Help David use the tablet to video call.',
    scheduledTime: '5:30 PM',
    timeWindow: '5:00 PM - 6:30 PM',
    priority: Priority.QUALITY_OF_LIFE,
    status: TaskStatus.PROPOSED,
    requiresPhoto: false,
    proposedBy: 'Tom Smith (Son)',
    proposedAt: new Date().toISOString()
  }
];

// Initial vitals data
export const INITIAL_VITALS = {
  bloodPressure: [
    { date: 'Mon', systolic: 122, diastolic: 78, time: '10:30 AM' },
    { date: 'Tue', systolic: 118, diastolic: 76, time: '10:15 AM' },
    { date: 'Wed', systolic: 125, diastolic: 80, time: '10:45 AM' },
    { date: 'Thu', systolic: 120, diastolic: 77, time: '10:30 AM' },
    { date: 'Fri', systolic: 119, diastolic: 75, time: '10:20 AM' },
    { date: 'Sat', systolic: 121, diastolic: 78, time: '10:35 AM' },
    { date: 'Sun', systolic: 120, diastolic: 76, time: '10:30 AM' }
  ],
  heartRate: [
    { date: 'Mon', value: 72, time: '10:30 AM' },
    { date: 'Tue', value: 68, time: '10:15 AM' },
    { date: 'Wed', value: 75, time: '10:45 AM' },
    { date: 'Thu', value: 70, time: '10:30 AM' },
    { date: 'Fri', value: 71, time: '10:20 AM' },
    { date: 'Sat', value: 69, time: '10:35 AM' },
    { date: 'Sun', value: 72, time: '10:30 AM' }
  ],
  temperature: [
    { date: 'Mon', value: 98.4, time: '10:30 AM' },
    { date: 'Tue', value: 98.6, time: '10:15 AM' },
    { date: 'Wed', value: 98.2, time: '10:45 AM' },
    { date: 'Thu', value: 98.5, time: '10:30 AM' },
    { date: 'Fri', value: 98.7, time: '10:20 AM' },
    { date: 'Sat', value: 98.4, time: '10:35 AM' },
    { date: 'Sun', value: 98.6, time: '10:30 AM' }
  ],
  pain: [
    { date: 'Mon', value: 2, time: '10:30 AM' },
    { date: 'Tue', value: 3, time: '10:15 AM' },
    { date: 'Wed', value: 2, time: '10:45 AM' },
    { date: 'Thu', value: 1, time: '10:30 AM' },
    { date: 'Fri', value: 2, time: '10:20 AM' },
    { date: 'Sat', value: 2, time: '10:35 AM' },
    { date: 'Sun', value: 1, time: '10:30 AM' }
  ]
};

// AI-Generated Images for care moments
export const CARE_IMAGES = {
  medication: 'https://static.prod-images.emergentagent.com/jobs/2b918343-0fe7-4d73-803a-a8a8c813b61f/images/453bd1aab795a8d4c312f29d43640ac6652d636e5e19337acdc001016a4e77c3.png',
  meal: 'https://static.prod-images.emergentagent.com/jobs/2b918343-0fe7-4d73-803a-a8a8c813b61f/images/cafa07225118a63f61111220ac6230125b17389a84d7450834c273696c27b3b7.png',
  walk: 'https://static.prod-images.emergentagent.com/jobs/2b918343-0fe7-4d73-803a-a8a8c813b61f/images/c527b65ae92f45fb0d1b3073f2d9982be28fd338adaa3f25d6f48e6f9a64e813.png',
  vitals: 'https://static.prod-images.emergentagent.com/jobs/2b918343-0fe7-4d73-803a-a8a8c813b61f/images/1e85b317545e5b7c120268579cc779fadaef5109861b649162128123f74bb2a1.png'
};

// Patient profile data
export const PATIENT_PROFILE = {
  id: 'patient-1',
  name: 'David Smith',
  age: 78,
  dateOfBirth: '1946-03-15',
  photo: 'https://images.unsplash.com/photo-1758691030490-fe1cb6c972ce?w=800&q=80',
  address: '123 Oak Street, Springfield, IL 62701',
  phone: '(555) 123-4567',
  medicalConditions: [
    'Type 2 Diabetes',
    'Hypertension',
    'Mild Cognitive Impairment'
  ],
  allergies: ['Penicillin', 'Shellfish'],
  medications: [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
    { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' }
  ],
  emergencyContacts: [
    { name: 'Mary Smith', relationship: 'Daughter', phone: '(555) 234-5678', isPrimary: true },
    { name: 'Tom Smith', relationship: 'Son', phone: '(555) 345-6789', isPrimary: false }
  ],
  primaryCarePhysician: {
    name: 'Dr. Rebecca Johnson',
    phone: '(555) 456-7890',
    facility: 'Springfield Medical Center'
  },
  codeStatus: 'Full Code',
  dietaryRestrictions: ['Low sodium', 'Diabetic diet'],
  mobilityStatus: 'Uses walker for ambulation',
  accessInstructions: 'Key under flower pot by front door. Alarm code: 1234.'
};

// Caregiver profile data
export const CAREGIVER_PROFILE = {
  id: 'caregiver-1',
  name: 'Julia Martinez',
  role: 'Certified Nursing Assistant',
  photo: 'https://static.prod-images.emergentagent.com/jobs/2b918343-0fe7-4d73-803a-a8a8c813b61f/images/0d5b21a613a79f2e524a35cfa17574e562820a771203c2d63f5294db092f5e94.png',
  phone: '(555) 567-8901',
  email: 'julia.martinez@careagency.com',
  certifications: ['CNA', 'CPR/First Aid', 'Dementia Care'],
  yearsExperience: 5,
  rating: 4.9,
  shiftsCompleted: 234
};

// Decline reasons for tasks
export const DECLINE_REASONS = [
  'Schedule Conflict',
  'Patient Refused',
  'Not Certified for This Task',
  'Safety Concern',
  'Need More Information',
  'Other'
];
