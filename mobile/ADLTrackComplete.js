// ADLTrack - Complete High-Fidelity Mobile App
// Exact replica of web application for Expo Snack
// Includes: Auth, Caregiver Dashboard, Family Dashboard with ALL features

import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
  Alert,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
  Animated,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialIcons, FontAwesome5, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// THEME & COLORS
// ============================================
const COLORS = {
  primary: '#25D366',
  primaryDark: '#1ea952',
  accent: '#f43f5e',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  textLight: '#94a3b8',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  critical: '#dc2626',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
};

// ============================================
// CONTEXTS
// ============================================
const AuthContext = createContext(null);
const ThemeContext = createContext(null);

// ============================================
// MOCK DATA - Exact replica of web app data
// ============================================
const MOCK_USERS = {
  caregiver: {
    id: 'cg-001',
    email: 'caregiver@adltrack.com',
    password: 'demo123',
    name: 'Sarah Johnson',
    role: 'caregiver',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    phone: '(555) 123-4567',
    certification: 'CNA',
    experience: '5 years',
  },
  family: {
    id: 'fm-001',
    email: 'family@adltrack.com',
    password: 'demo123',
    name: 'Michael Chen',
    role: 'family',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '(555) 987-6543',
    relationship: 'Son',
  },
};

const MOCK_PATIENT = {
  id: 'pt-001',
  name: 'Eleanor Thompson',
  age: 78,
  dateOfBirth: '1946-03-15',
  gender: 'Female',
  room: '204-A',
  photo: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=200',
  primaryDiagnosis: 'Type 2 Diabetes, Mild Cognitive Impairment',
  codeStatus: 'Full Code',
  mobility: 'Requires Assistance',
  diet: 'Diabetic, Low Sodium',
  allergies: ['Penicillin', 'Sulfa drugs', 'Shellfish'],
  medications: [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', time: '8:00 AM, 6:00 PM' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', time: '8:00 AM' },
    { name: 'Donepezil', dosage: '5mg', frequency: 'Once daily', time: '9:00 PM' },
    { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', time: '8:00 AM' },
  ],
  conditions: [
    'Type 2 Diabetes Mellitus',
    'Hypertension',
    'Mild Cognitive Impairment',
    'Osteoarthritis',
    'History of Falls',
  ],
  emergencyContacts: [
    { name: 'Michael Chen', relationship: 'Son', phone: '(555) 987-6543', isPrimary: true },
    { name: 'Lisa Chen', relationship: 'Daughter-in-law', phone: '(555) 987-6544', isPrimary: false },
  ],
  carePreferences: {
    wakeTime: '7:00 AM',
    sleepTime: '9:00 PM',
    showerPreference: 'Morning',
    mealPreferences: 'Prefers warm meals, dislikes spicy food',
    activities: 'Enjoys reading, puzzles, and watching nature documentaries',
  },
};

const MOCK_VITALS = [
  { id: 'v1', type: 'BP', label: 'Blood Pressure', value: '128/82', unit: 'mmHg', status: 'normal', time: '8:00 AM', icon: 'heart' },
  { id: 'v2', type: 'HR', label: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal', time: '8:00 AM', icon: 'pulse' },
  { id: 'v3', type: 'TEMP', label: 'Temperature', value: '98.4', unit: '°F', status: 'normal', time: '8:00 AM', icon: 'thermometer' },
  { id: 'v4', type: 'O2', label: 'Oxygen Sat', value: '97', unit: '%', status: 'normal', time: '8:00 AM', icon: 'water' },
  { id: 'v5', type: 'PAIN', label: 'Pain Level', value: '2', unit: '/10', status: 'low', time: '8:00 AM', icon: 'fitness' },
];

const MOCK_VITALS_HISTORY = [
  { date: '2024-01-15', BP: '128/82', HR: '72', TEMP: '98.4', O2: '97', PAIN: '2' },
  { date: '2024-01-14', BP: '130/84', HR: '74', TEMP: '98.2', O2: '96', PAIN: '3' },
  { date: '2024-01-13', BP: '126/80', HR: '70', TEMP: '98.6', O2: '98', PAIN: '2' },
  { date: '2024-01-12', BP: '132/86', HR: '76', TEMP: '98.4', O2: '97', PAIN: '4' },
  { date: '2024-01-11', BP: '124/78', HR: '68', TEMP: '98.8', O2: '96', PAIN: '2' },
];

const MOCK_TASKS = [
  {
    id: 't1',
    title: 'Morning Medication',
    description: 'Administer morning medications: Metformin 500mg, Lisinopril 10mg, Aspirin 81mg',
    category: 'medication',
    priority: 'critical',
    status: 'pending',
    scheduledTime: '8:00 AM',
    estimatedDuration: '10 min',
    instructions: [
      'Verify patient identity',
      'Check for allergies',
      'Administer with full glass of water',
      'Document in MAR',
    ],
  },
  {
    id: 't2',
    title: 'Breakfast Assistance',
    description: 'Assist with breakfast. Diabetic diet - monitor carb intake',
    category: 'nutrition',
    priority: 'high',
    status: 'pending',
    scheduledTime: '8:30 AM',
    estimatedDuration: '30 min',
    instructions: [
      'Ensure diabetic-appropriate meal',
      'Monitor food intake',
      'Document percentage eaten',
      'Offer fluids',
    ],
  },
  {
    id: 't3',
    title: 'Morning Hygiene',
    description: 'Assist with morning hygiene routine - oral care, face wash, grooming',
    category: 'hygiene',
    priority: 'standard',
    status: 'completed',
    scheduledTime: '7:30 AM',
    completedTime: '7:45 AM',
    completedBy: 'Sarah Johnson',
    estimatedDuration: '20 min',
    notes: 'Patient cooperative. No skin issues observed.',
    completionPhoto: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200',
  },
  {
    id: 't4',
    title: 'Blood Glucose Check',
    description: 'Check blood glucose level before lunch',
    category: 'vitals',
    priority: 'high',
    status: 'pending',
    scheduledTime: '11:30 AM',
    estimatedDuration: '5 min',
    instructions: [
      'Use glucometer from bedside',
      'Record reading in vitals',
      'Alert RN if > 250 or < 70',
    ],
  },
  {
    id: 't5',
    title: 'Physical Therapy Exercises',
    description: 'Guide through prescribed PT exercises - range of motion, light stretching',
    category: 'therapy',
    priority: 'standard',
    status: 'pending',
    scheduledTime: '10:00 AM',
    estimatedDuration: '30 min',
    instructions: [
      'Review PT plan',
      'Assist with transfers',
      'Monitor for pain or discomfort',
      'Document exercises completed',
    ],
  },
  {
    id: 't6',
    title: 'Lunch Medication',
    description: 'Administer noon medications if prescribed',
    category: 'medication',
    priority: 'high',
    status: 'pending',
    scheduledTime: '12:00 PM',
    estimatedDuration: '10 min',
  },
  {
    id: 't7',
    title: 'Afternoon Rest Check',
    description: 'Check on patient during afternoon rest period',
    category: 'monitoring',
    priority: 'low',
    status: 'pending',
    scheduledTime: '2:00 PM',
    estimatedDuration: '5 min',
  },
];

const MOCK_PROPOSED_TASKS = [
  {
    id: 'pt1',
    title: 'Extra Walking Session',
    description: 'Mom mentioned she wants to walk more. Can we add an extra 10-minute walk in the afternoon?',
    requestedBy: 'Michael Chen',
    requestedAt: '2024-01-15 09:30 AM',
    priority: 'standard',
    status: 'proposed',
  },
  {
    id: 'pt2',
    title: 'Video Call Setup',
    description: 'Please help set up a video call with grandchildren at 3 PM today',
    requestedBy: 'Michael Chen',
    requestedAt: '2024-01-15 08:00 AM',
    priority: 'low',
    status: 'proposed',
  },
];

const MOCK_INCIDENTS = [
  {
    id: 'inc1',
    title: 'Near Fall in Bathroom',
    type: 'Fall Risk',
    severity: 'moderate',
    date: '2024-01-14',
    time: '6:45 PM',
    location: 'Patient Bathroom',
    description: 'Patient lost balance while transitioning from toilet. Caregiver was present and prevented fall. No injury sustained.',
    reportedBy: 'Sarah Johnson',
    witnesses: ['Night shift nurse'],
    actionsTaken: [
      'Assisted patient to bed safely',
      'Notified RN on duty',
      'Updated fall risk assessment',
      'Requested PT evaluation',
    ],
    followUp: 'PT to evaluate tomorrow. Consider bathroom grab bar adjustment.',
    status: 'under_review',
    photos: [],
  },
  {
    id: 'inc2',
    title: 'Medication Refusal',
    type: 'Medication',
    severity: 'low',
    date: '2024-01-13',
    time: '8:00 AM',
    location: 'Patient Room',
    description: 'Patient initially refused morning Metformin citing upset stomach. After 30 minutes and toast, patient accepted medication.',
    reportedBy: 'Sarah Johnson',
    actionsTaken: [
      'Documented refusal',
      'Offered food first',
      'Re-attempted after 30 minutes',
      'Medication successfully administered',
    ],
    status: 'resolved',
  },
];

const MOCK_MESSAGES = [
  {
    id: 'm1',
    sender: 'Michael Chen',
    senderRole: 'family',
    content: 'Hi Sarah, how is mom doing today? She mentioned feeling tired yesterday.',
    timestamp: '2024-01-15 08:30 AM',
    read: true,
  },
  {
    id: 'm2',
    sender: 'Sarah Johnson',
    senderRole: 'caregiver',
    content: 'Good morning! She slept well and had a good appetite at breakfast. Her energy seems better today. We\'ll do some light activities this morning.',
    timestamp: '2024-01-15 08:45 AM',
    read: true,
  },
  {
    id: 'm3',
    sender: 'Michael Chen',
    senderRole: 'family',
    content: 'That\'s great to hear! Please let me know if she needs anything. I\'ll try to visit this weekend.',
    timestamp: '2024-01-15 09:00 AM',
    read: false,
  },
];

const MOCK_UPDATES = [
  {
    id: 'u1',
    type: 'task_completed',
    title: 'Morning Hygiene Completed',
    description: 'Morning hygiene routine completed successfully. Patient was cooperative.',
    timestamp: '2024-01-15 07:45 AM',
    caregiver: 'Sarah Johnson',
  },
  {
    id: 'u2',
    type: 'vitals_recorded',
    title: 'Vitals Recorded',
    description: 'Morning vitals recorded. All readings within normal range.',
    timestamp: '2024-01-15 08:00 AM',
    caregiver: 'Sarah Johnson',
    data: { BP: '128/82', HR: '72', Temp: '98.4°F' },
  },
  {
    id: 'u3',
    type: 'note_added',
    title: 'Care Note Added',
    description: 'Patient expressed interest in doing puzzles today. Will incorporate into afternoon activities.',
    timestamp: '2024-01-15 08:30 AM',
    caregiver: 'Sarah Johnson',
  },
];

const MOCK_SHIFT = {
  startTime: '7:00 AM',
  endTime: '3:00 PM',
  hoursWorked: 5.5,
  totalHours: 8,
  tasksCompleted: 3,
  totalTasks: 7,
  breaksTaken: 1,
  breaksAllowed: 2,
};

const INCIDENT_TYPES = [
  'Fall',
  'Near Fall',
  'Medication Error',
  'Medication Refusal',
  'Behavioral',
  'Skin Integrity',
  'Equipment Malfunction',
  'Environmental Hazard',
  'Other',
];

const INCIDENT_SEVERITIES = [
  { value: 'low', label: 'Low', color: COLORS.info },
  { value: 'moderate', label: 'Moderate', color: COLORS.warning },
  { value: 'high', label: 'High', color: COLORS.error },
  { value: 'critical', label: 'Critical', color: COLORS.critical },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return COLORS.success;
    case 'pending': return COLORS.warning;
    case 'missed': return COLORS.error;
    case 'in_progress': return COLORS.info;
    default: return COLORS.textSecondary;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'critical': return COLORS.critical;
    case 'high': return COLORS.error;
    case 'standard': return COLORS.info;
    case 'low': return COLORS.textSecondary;
    default: return COLORS.textSecondary;
  }
};

const getCategoryIcon = (category) => {
  switch (category) {
    case 'medication': return 'medical';
    case 'nutrition': return 'restaurant';
    case 'hygiene': return 'water';
    case 'vitals': return 'pulse';
    case 'therapy': return 'fitness';
    case 'monitoring': return 'eye';
    default: return 'checkmark-circle';
  }
};

// ============================================
// NAVIGATION SETUP
// ============================================
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ============================================
// AUTH PROVIDER
// ============================================
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password, role) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = MOCK_USERS[role];
    if (mockUser && email === mockUser.email && password === mockUser.password) {
      setUser(mockUser);
      setIsLoading(false);
      return { success: true };
    }
    setIsLoading(false);
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ============================================
// AUTH SCREEN
// ============================================
const AuthScreen = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('caregiver');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setError('');
    const result = await login(email, password, selectedRole);
    if (!result.success) {
      setError(result.error);
    }
  };

  const fillDemoCredentials = (role) => {
    setSelectedRole(role);
    setEmail(MOCK_USERS[role].email);
    setPassword(MOCK_USERS[role].password);
    setError('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.authContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.authGradient}
      >
        <ScrollView 
          contentContainerStyle={styles.authScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.authLogoSection}>
            <View style={styles.authLogoContainer}>
              <Ionicons name="heart-circle" size={60} color="#fff" />
            </View>
            <Text style={styles.authTitle}>ADLTrack</Text>
            <Text style={styles.authSubtitle}>Caregiving Coordination</Text>
          </View>

          {/* Login Card */}
          <View style={styles.authCard}>
            <Text style={styles.authCardTitle}>Welcome Back</Text>
            <Text style={styles.authCardSubtitle}>Sign in to continue</Text>

            {/* Role Selector */}
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'caregiver' && styles.roleButtonActive
                ]}
                onPress={() => fillDemoCredentials('caregiver')}
              >
                <Ionicons 
                  name="medkit" 
                  size={20} 
                  color={selectedRole === 'caregiver' ? '#fff' : COLORS.primary} 
                />
                <Text style={[
                  styles.roleButtonText,
                  selectedRole === 'caregiver' && styles.roleButtonTextActive
                ]}>Caregiver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'family' && styles.roleButtonActive
                ]}
                onPress={() => fillDemoCredentials('family')}
              >
                <Ionicons 
                  name="people" 
                  size={20} 
                  color={selectedRole === 'family' ? '#fff' : COLORS.primary} 
                />
                <Text style={[
                  styles.roleButtonText,
                  selectedRole === 'family' && styles.roleButtonTextActive
                ]}>Family</Text>
              </TouchableOpacity>
            </View>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={COLORS.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {/* Demo Credentials Info */}
            <View style={styles.demoInfo}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.info} />
              <Text style={styles.demoInfoText}>
                Tap a role above to auto-fill demo credentials
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

// ============================================
// CAREGIVER DASHBOARD - HOME TAB
// ============================================
const CaregiverHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [proposedTasks, setProposedTasks] = useState(MOCK_PROPOSED_TASKS);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const criticalTasks = pendingTasks.filter(t => t.priority === 'critical' || t.priority === 'high');

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCompleteTask = (taskId, notes, photo) => {
    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, status: 'completed', completedTime: new Date().toISOString(), notes, completionPhoto: photo }
        : t
    ));
    setShowTaskModal(false);
    Alert.alert('Success', 'Task completed successfully!');
  };

  const handleAcceptProposed = (taskId) => {
    const proposedTask = proposedTasks.find(t => t.id === taskId);
    if (proposedTask) {
      setTasks([...tasks, { ...proposedTask, id: `t${tasks.length + 1}`, status: 'pending', scheduledTime: 'TBD' }]);
      setProposedTasks(proposedTasks.filter(t => t.id !== taskId));
      Alert.alert('Success', 'Task accepted and added to your list');
    }
  };

  const handleDeclineProposed = (taskId) => {
    Alert.alert(
      'Decline Task Request',
      'Are you sure you want to decline this task request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Decline', 
          style: 'destructive',
          onPress: () => setProposedTasks(proposedTasks.filter(t => t.id !== taskId))
        }
      ]
    );
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.dashboardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.headerAvatar}>
            <Image source={{ uri: user?.avatar }} style={styles.avatarImage} />
          </TouchableOpacity>
        </View>

        {/* Shift Progress */}
        <View style={styles.shiftCard}>
          <View style={styles.shiftHeader}>
            <View style={styles.shiftInfo}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={styles.shiftLabel}>Current Shift</Text>
            </View>
            <Text style={styles.shiftTime}>{MOCK_SHIFT.startTime} - {MOCK_SHIFT.endTime}</Text>
          </View>
          <View style={styles.shiftProgressBar}>
            <View style={[styles.shiftProgressFill, { width: `${(MOCK_SHIFT.hoursWorked / MOCK_SHIFT.totalHours) * 100}%` }]} />
          </View>
          <View style={styles.shiftStats}>
            <View style={styles.shiftStatItem}>
              <Text style={styles.shiftStatValue}>{MOCK_SHIFT.tasksCompleted}/{MOCK_SHIFT.totalTasks}</Text>
              <Text style={styles.shiftStatLabel}>Tasks</Text>
            </View>
            <View style={styles.shiftStatItem}>
              <Text style={styles.shiftStatValue}>{MOCK_SHIFT.hoursWorked}h</Text>
              <Text style={styles.shiftStatLabel}>Worked</Text>
            </View>
            <View style={styles.shiftStatItem}>
              <Text style={styles.shiftStatValue}>{MOCK_SHIFT.breaksTaken}/{MOCK_SHIFT.breaksAllowed}</Text>
              <Text style={styles.shiftStatLabel}>Breaks</Text>
            </View>
          </View>
        </View>

        {/* Patient Card */}
        <TouchableOpacity 
          style={styles.patientCard}
          onPress={() => setShowPatientProfile(true)}
        >
          <Image source={{ uri: MOCK_PATIENT.photo }} style={styles.patientPhoto} />
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{MOCK_PATIENT.name}</Text>
            <Text style={styles.patientDetails}>Room {MOCK_PATIENT.room} • {MOCK_PATIENT.age} years old</Text>
            <View style={styles.patientTags}>
              <View style={styles.patientTag}>
                <Text style={styles.patientTagText}>{MOCK_PATIENT.mobility}</Text>
              </View>
              <View style={[styles.patientTag, styles.patientTagWarning]}>
                <Text style={styles.patientTagTextWarning}>{MOCK_PATIENT.diet}</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setShowVitalsModal(true)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="pulse" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.quickActionText}>Vitals</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setShowIncidentModal(true)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="warning" size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.quickActionText}>Incident</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Messages')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="chatbubbles" size={24} color={COLORS.info} />
            </View>
            <Text style={styles.quickActionText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('AICopilot')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="sparkles" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.quickActionText}>AI Help</Text>
          </TouchableOpacity>
        </View>

        {/* Current Vitals Summary */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Vitals</Text>
            <TouchableOpacity onPress={() => setShowVitalsModal(true)}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.vitalsRow}>
              {MOCK_VITALS.map((vital) => (
                <View key={vital.id} style={styles.vitalCard}>
                  <View style={[styles.vitalIconContainer, { backgroundColor: vital.status === 'normal' ? '#dcfce7' : '#fef3c7' }]}>
                    <Ionicons name={vital.icon} size={20} color={vital.status === 'normal' ? COLORS.success : COLORS.warning} />
                  </View>
                  <Text style={styles.vitalValue}>{vital.value}</Text>
                  <Text style={styles.vitalUnit}>{vital.unit}</Text>
                  <Text style={styles.vitalLabel}>{vital.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Priority Tasks */}
        {criticalTasks.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={[styles.sectionTitle, { color: COLORS.error, marginLeft: 6 }]}>Priority Tasks</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{criticalTasks.length}</Text>
              </View>
            </View>
            {criticalTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onPress={() => handleTaskPress(task)}
                showPriority
              />
            ))}
          </View>
        )}

        {/* Proposed Tasks from Family */}
        {proposedTasks.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="people" size={20} color={COLORS.info} />
                <Text style={[styles.sectionTitle, { marginLeft: 6 }]}>Family Requests</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: COLORS.info }]}>
                <Text style={styles.badgeText}>{proposedTasks.length}</Text>
              </View>
            </View>
            {proposedTasks.map((task) => (
              <ProposedTaskCard
                key={task.id}
                task={task}
                onAccept={() => handleAcceptProposed(task.id)}
                onDecline={() => handleDeclineProposed(task.id)}
              />
            ))}
          </View>
        )}

        {/* All Tasks */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <Text style={styles.sectionSubtitle}>{completedTasks.length}/{tasks.length} completed</Text>
          </View>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onPress={() => handleTaskPress(task)}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <PatientProfileModal 
        visible={showPatientProfile} 
        onClose={() => setShowPatientProfile(false)} 
        patient={MOCK_PATIENT}
      />
      <VitalsModal 
        visible={showVitalsModal} 
        onClose={() => setShowVitalsModal(false)}
        vitals={MOCK_VITALS}
        history={MOCK_VITALS_HISTORY}
        isCaregiver={true}
      />
      <TaskCompletionModal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        task={selectedTask}
        onComplete={handleCompleteTask}
      />
      <IncidentReportModal
        visible={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
      />
    </View>
  );
};

// ============================================
// TASK CARD COMPONENT
// ============================================
const TaskCard = ({ task, onPress, showPriority = false }) => {
  const isCompleted = task.status === 'completed';
  
  return (
    <TouchableOpacity 
      style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
      onPress={onPress}
    >
      <View style={[
        styles.taskStatusIndicator, 
        { backgroundColor: getStatusColor(task.status) }
      ]} />
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <View style={[styles.taskCategoryIcon, { backgroundColor: `${getPriorityColor(task.priority)}15` }]}>
            <Ionicons 
              name={getCategoryIcon(task.category)} 
              size={16} 
              color={getPriorityColor(task.priority)} 
            />
          </View>
          <View style={styles.taskTitleContainer}>
            <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
              {task.title}
            </Text>
            <Text style={styles.taskTime}>
              <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
              {' '}{task.scheduledTime}
              {task.estimatedDuration && ` • ${task.estimatedDuration}`}
            </Text>
          </View>
          {showPriority && (
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
              <Text style={styles.priorityBadgeText}>{task.priority}</Text>
            </View>
          )}
        </View>
        <Text style={styles.taskDescription} numberOfLines={2}>
          {task.description}
        </Text>
        {isCompleted && (
          <View style={styles.taskCompletedInfo}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.taskCompletedText}>
              Completed at {task.completedTime ? formatTime(task.completedTime) : 'N/A'}
            </Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
};

// ============================================
// PROPOSED TASK CARD COMPONENT
// ============================================
const ProposedTaskCard = ({ task, onAccept, onDecline }) => {
  return (
    <View style={styles.proposedTaskCard}>
      <View style={styles.proposedTaskHeader}>
        <View style={styles.proposedTaskIcon}>
          <Ionicons name="person-circle" size={36} color={COLORS.info} />
        </View>
        <View style={styles.proposedTaskInfo}>
          <Text style={styles.proposedTaskTitle}>{task.title}</Text>
          <Text style={styles.proposedTaskRequester}>
            Requested by {task.requestedBy}
          </Text>
          <Text style={styles.proposedTaskTime}>{task.requestedAt}</Text>
        </View>
      </View>
      <Text style={styles.proposedTaskDescription}>{task.description}</Text>
      <View style={styles.proposedTaskActions}>
        <TouchableOpacity 
          style={styles.declineButton}
          onPress={onDecline}
        >
          <Ionicons name="close" size={18} color={COLORS.error} />
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={onAccept}
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================
// PATIENT PROFILE MODAL - Complete Version
// ============================================
const PatientProfileModal = ({ visible, onClose, patient }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'person' },
    { id: 'medical', label: 'Medical', icon: 'medical' },
    { id: 'history', label: 'History', icon: 'calendar' },
    { id: 'contacts', label: 'Contacts', icon: 'call' },
  ];

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Basic Info */}
      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Basic Information</Text>
        <View style={styles.profileInfoGrid}>
          <View style={styles.profileInfoItem}>
            <Text style={styles.profileInfoLabel}>Full Name</Text>
            <Text style={styles.profileInfoValue}>{patient.name}</Text>
          </View>
          <View style={styles.profileInfoItem}>
            <Text style={styles.profileInfoLabel}>Date of Birth</Text>
            <Text style={styles.profileInfoValue}>{patient.dateOfBirth}</Text>
          </View>
          <View style={styles.profileInfoItem}>
            <Text style={styles.profileInfoLabel}>Age</Text>
            <Text style={styles.profileInfoValue}>{patient.age} years</Text>
          </View>
          <View style={styles.profileInfoItem}>
            <Text style={styles.profileInfoLabel}>Gender</Text>
            <Text style={styles.profileInfoValue}>{patient.gender}</Text>
          </View>
          <View style={styles.profileInfoItem}>
            <Text style={styles.profileInfoLabel}>Room</Text>
            <Text style={styles.profileInfoValue}>{patient.room}</Text>
          </View>
          <View style={styles.profileInfoItem}>
            <Text style={styles.profileInfoLabel}>Code Status</Text>
            <Text style={styles.profileInfoValue}>{patient.codeStatus}</Text>
          </View>
        </View>
      </View>

      {/* Care Preferences */}
      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Care Preferences</Text>
        <View style={styles.preferenceItem}>
          <Ionicons name="sunny-outline" size={20} color={COLORS.primary} />
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceLabel}>Wake Time</Text>
            <Text style={styles.preferenceValue}>{patient.carePreferences.wakeTime}</Text>
          </View>
        </View>
        <View style={styles.preferenceItem}>
          <Ionicons name="moon-outline" size={20} color={COLORS.primary} />
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceLabel}>Sleep Time</Text>
            <Text style={styles.preferenceValue}>{patient.carePreferences.sleepTime}</Text>
          </View>
        </View>
        <View style={styles.preferenceItem}>
          <Ionicons name="water-outline" size={20} color={COLORS.primary} />
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceLabel}>Shower Preference</Text>
            <Text style={styles.preferenceValue}>{patient.carePreferences.showerPreference}</Text>
          </View>
        </View>
        <View style={styles.preferenceItem}>
          <Ionicons name="restaurant-outline" size={20} color={COLORS.primary} />
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceLabel}>Meal Preferences</Text>
            <Text style={styles.preferenceValue}>{patient.carePreferences.mealPreferences}</Text>
          </View>
        </View>
        <View style={styles.preferenceItem}>
          <Ionicons name="heart-outline" size={20} color={COLORS.primary} />
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceLabel}>Activities</Text>
            <Text style={styles.preferenceValue}>{patient.carePreferences.activities}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderMedical = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Allergies - Critical */}
      <View style={[styles.profileSection, styles.alertSection]}>
        <View style={styles.alertHeader}>
          <Ionicons name="alert-circle" size={24} color={COLORS.error} />
          <Text style={[styles.profileSectionTitle, { color: COLORS.error, marginLeft: 8 }]}>
            Allergies
          </Text>
        </View>
        <View style={styles.allergyTags}>
          {patient.allergies.map((allergy, index) => (
            <View key={index} style={styles.allergyTag}>
              <Text style={styles.allergyTagText}>{allergy}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Conditions */}
      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Medical Conditions</Text>
        {patient.conditions.map((condition, index) => (
          <View key={index} style={styles.conditionItem}>
            <View style={styles.conditionDot} />
            <Text style={styles.conditionText}>{condition}</Text>
          </View>
        ))}
      </View>

      {/* Medications */}
      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Current Medications</Text>
        {patient.medications.map((med, index) => (
          <View key={index} style={styles.medicationCard}>
            <View style={styles.medicationIcon}>
              <Ionicons name="medical" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{med.name}</Text>
              <Text style={styles.medicationDetails}>
                {med.dosage} • {med.frequency}
              </Text>
              <Text style={styles.medicationTime}>
                <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
                {' '}{med.time}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Mobility & Diet */}
      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Care Requirements</Text>
        <View style={styles.careReqItem}>
          <Ionicons name="walk" size={20} color={COLORS.warning} />
          <View style={styles.careReqContent}>
            <Text style={styles.careReqLabel}>Mobility</Text>
            <Text style={styles.careReqValue}>{patient.mobility}</Text>
          </View>
        </View>
        <View style={styles.careReqItem}>
          <Ionicons name="nutrition" size={20} color={COLORS.success} />
          <View style={styles.careReqContent}>
            <Text style={styles.careReqLabel}>Diet</Text>
            <Text style={styles.careReqValue}>{patient.diet}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderHistory = () => {
    // Simple calendar implementation
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => null);
    const allDays = [...emptyDays, ...days];

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setSelectedDate(newDate);
            }}>
              <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.calendarMonth}>
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setSelectedDate(newDate);
            }}>
              <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarWeekDays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.calendarWeekDay}>{day}</Text>
            ))}
          </View>
          <View style={styles.calendarDays}>
            {allDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  day === selectedDate.getDate() && styles.calendarDaySelected
                ]}
                onPress={() => day && setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
              >
                {day && <Text style={[
                  styles.calendarDayText,
                  day === selectedDate.getDate() && styles.calendarDayTextSelected
                ]}>{day}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.historyContent}>
          <Text style={styles.historyTitle}>Care Summary for {formatDate(selectedDate)}</Text>
          <View style={styles.historySummary}>
            <View style={styles.historySummaryItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.historySummaryText}>7 tasks completed</Text>
            </View>
            <View style={styles.historySummaryItem}>
              <Ionicons name="pulse" size={20} color={COLORS.info} />
              <Text style={styles.historySummaryText}>4 vital checks</Text>
            </View>
            <View style={styles.historySummaryItem}>
              <Ionicons name="document-text" size={20} color={COLORS.warning} />
              <Text style={styles.historySummaryText}>2 notes added</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderContacts = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Emergency Contacts</Text>
        {patient.emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactAvatar}>
              <Text style={styles.contactAvatarText}>
                {contact.name.split(' ').map(n => n[0]).join('')}
              </Text>
              {contact.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Ionicons name="star" size={10} color="#fff" />
                </View>
              )}
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRelation}>{contact.relationship}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity style={styles.contactActionBtn}>
                <Ionicons name="call" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactActionBtn}>
                <Ionicons name="chatbubble" size={20} color={COLORS.info} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Patient Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Patient Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: patient.photo }} style={styles.profilePhoto} />
          <Text style={styles.profileName}>{patient.name}</Text>
          <Text style={styles.profileSubtitle}>
            Room {patient.room} • {patient.age} years old • {patient.gender}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.profileTabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.profileTab, activeTab === tab.id && styles.profileTabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon} 
                size={18} 
                color={activeTab === tab.id ? COLORS.primary : COLORS.textSecondary} 
              />
              <Text style={[
                styles.profileTabText,
                activeTab === tab.id && styles.profileTabTextActive
              ]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.profileContent}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'medical' && renderMedical()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'contacts' && renderContacts()}
        </View>
      </View>
    </Modal>
  );
};
