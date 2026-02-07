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

// ============================================
// VITALS MODAL - Complete Version with Charts
// ============================================
const VitalsModal = ({ visible, onClose, vitals, history, isCaregiver }) => {
  const [activeTab, setActiveTab] = useState('current');
  const [showAddVital, setShowAddVital] = useState(false);
  const [selectedVitalType, setSelectedVitalType] = useState('BP');
  const [vitalValue, setVitalValue] = useState('');

  const vitalTypes = [
    { type: 'BP', label: 'Blood Pressure', unit: 'mmHg', placeholder: '120/80' },
    { type: 'HR', label: 'Heart Rate', unit: 'bpm', placeholder: '72' },
    { type: 'TEMP', label: 'Temperature', unit: '°F', placeholder: '98.6' },
    { type: 'O2', label: 'Oxygen Saturation', unit: '%', placeholder: '97' },
    { type: 'PAIN', label: 'Pain Level', unit: '/10', placeholder: '3' },
  ];

  const handleAddVital = () => {
    if (!vitalValue) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }
    Alert.alert('Success', `${selectedVitalType} recorded: ${vitalValue}`);
    setVitalValue('');
    setShowAddVital(false);
  };

  const renderCurrentVitals = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.vitalsGrid}>
        {vitals.map((vital) => (
          <View key={vital.id} style={styles.vitalDetailCard}>
            <View style={styles.vitalDetailHeader}>
              <View style={[
                styles.vitalDetailIcon,
                { backgroundColor: vital.status === 'normal' ? '#dcfce7' : '#fef3c7' }
              ]}>
                <Ionicons 
                  name={vital.icon} 
                  size={24} 
                  color={vital.status === 'normal' ? COLORS.success : COLORS.warning} 
                />
              </View>
              <View style={[
                styles.vitalStatusBadge,
                { backgroundColor: vital.status === 'normal' ? '#dcfce7' : '#fef3c7' }
              ]}>
                <Text style={[
                  styles.vitalStatusText,
                  { color: vital.status === 'normal' ? COLORS.success : COLORS.warning }
                ]}>
                  {vital.status}
                </Text>
              </View>
            </View>
            <Text style={styles.vitalDetailValue}>{vital.value}</Text>
            <Text style={styles.vitalDetailUnit}>{vital.unit}</Text>
            <Text style={styles.vitalDetailLabel}>{vital.label}</Text>
            <Text style={styles.vitalDetailTime}>
              <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
              {' '}{vital.time}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderHistory = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.vitalsHistoryContainer}>
        {/* Simple Chart Visualization */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Blood Pressure Trend (7 Days)</Text>
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartBars}>
              {history.slice(0, 5).map((record, index) => {
                const [systolic] = record.BP.split('/');
                const height = (parseInt(systolic) - 100) * 2;
                return (
                  <View key={index} style={styles.chartBarContainer}>
                    <View style={[styles.chartBar, { height: Math.max(height, 20) }]} />
                    <Text style={styles.chartBarLabel}>{record.date.split('-')[2]}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* History Table */}
        <View style={styles.historyTable}>
          <View style={styles.historyTableHeader}>
            <Text style={[styles.historyTableCell, styles.historyTableHeaderCell]}>Date</Text>
            <Text style={[styles.historyTableCell, styles.historyTableHeaderCell]}>BP</Text>
            <Text style={[styles.historyTableCell, styles.historyTableHeaderCell]}>HR</Text>
            <Text style={[styles.historyTableCell, styles.historyTableHeaderCell]}>Temp</Text>
            <Text style={[styles.historyTableCell, styles.historyTableHeaderCell]}>O2</Text>
          </View>
          {history.map((record, index) => (
            <View key={index} style={styles.historyTableRow}>
              <Text style={styles.historyTableCell}>{record.date.split('-').slice(1).join('/')}</Text>
              <Text style={styles.historyTableCell}>{record.BP}</Text>
              <Text style={styles.historyTableCell}>{record.HR}</Text>
              <Text style={styles.historyTableCell}>{record.TEMP}</Text>
              <Text style={styles.historyTableCell}>{record.O2}%</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderAddVital = () => (
    <View style={styles.addVitalContainer}>
      <Text style={styles.addVitalTitle}>Record New Vital</Text>
      
      {/* Vital Type Selector */}
      <Text style={styles.addVitalLabel}>Vital Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.vitalTypeSelector}>
          {vitalTypes.map((type) => (
            <TouchableOpacity
              key={type.type}
              style={[
                styles.vitalTypeBtn,
                selectedVitalType === type.type && styles.vitalTypeBtnActive
              ]}
              onPress={() => setSelectedVitalType(type.type)}
            >
              <Text style={[
                styles.vitalTypeBtnText,
                selectedVitalType === type.type && styles.vitalTypeBtnTextActive
              ]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Value Input */}
      <Text style={styles.addVitalLabel}>Value</Text>
      <View style={styles.vitalInputContainer}>
        <TextInput
          style={styles.vitalInput}
          placeholder={vitalTypes.find(t => t.type === selectedVitalType)?.placeholder}
          placeholderTextColor={COLORS.textLight}
          value={vitalValue}
          onChangeText={setVitalValue}
          keyboardType="numeric"
        />
        <Text style={styles.vitalInputUnit}>
          {vitalTypes.find(t => t.type === selectedVitalType)?.unit}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.addVitalActions}>
        <TouchableOpacity 
          style={styles.cancelVitalBtn}
          onPress={() => setShowAddVital(false)}
        >
          <Text style={styles.cancelVitalBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveVitalBtn}
          onPress={handleAddVital}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.saveVitalBtnText}>Save Vital</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Vitals</Text>
          {isCaregiver && !showAddVital && (
            <TouchableOpacity onPress={() => setShowAddVital(true)} style={styles.addVitalHeaderBtn}>
              <Ionicons name="add" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          {(!isCaregiver || showAddVital) && <View style={{ width: 40 }} />}
        </View>

        {showAddVital ? (
          renderAddVital()
        ) : (
          <>
            {/* Tabs */}
            <View style={styles.vitalsTabs}>
              <TouchableOpacity
                style={[styles.vitalsTab, activeTab === 'current' && styles.vitalsTabActive]}
                onPress={() => setActiveTab('current')}
              >
                <Text style={[
                  styles.vitalsTabText,
                  activeTab === 'current' && styles.vitalsTabTextActive
                ]}>Current</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.vitalsTab, activeTab === 'history' && styles.vitalsTabActive]}
                onPress={() => setActiveTab('history')}
              >
                <Text style={[
                  styles.vitalsTabText,
                  activeTab === 'history' && styles.vitalsTabTextActive
                ]}>History</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === 'current' ? renderCurrentVitals() : renderHistory()}
          </>
        )}
      </View>
    </Modal>
  );
};

// ============================================
// TASK COMPLETION MODAL
// ============================================
const TaskCompletionModal = ({ visible, onClose, task, onComplete }) => {
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);

  if (!task) return null;

  const handleComplete = () => {
    onComplete(task.id, notes, photo);
    setNotes('');
    setPhoto(null);
  };

  const handleAddPhoto = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => setPhoto('https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200') },
        { text: 'Choose from Library', onPress: () => setPhoto('https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200') },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {task.status === 'completed' ? 'Task Details' : 'Complete Task'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Task Info */}
          <View style={styles.taskDetailCard}>
            <View style={styles.taskDetailHeader}>
              <View style={[
                styles.taskDetailIcon,
                { backgroundColor: `${getPriorityColor(task.priority)}15` }
              ]}>
                <Ionicons 
                  name={getCategoryIcon(task.category)} 
                  size={24} 
                  color={getPriorityColor(task.priority)} 
                />
              </View>
              <View style={styles.taskDetailInfo}>
                <Text style={styles.taskDetailTitle}>{task.title}</Text>
                <View style={styles.taskDetailMeta}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                    <Text style={styles.priorityBadgeText}>{task.priority}</Text>
                  </View>
                  <Text style={styles.taskDetailTime}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                    {' '}{task.scheduledTime}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.taskDetailDescription}>{task.description}</Text>
          </View>

          {/* Instructions */}
          {task.instructions && (
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>Instructions</Text>
              {task.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Completion Form (only for pending tasks) */}
          {task.status !== 'completed' && (
            <View style={styles.completionForm}>
              <Text style={styles.completionFormTitle}>Completion Details</Text>
              
              {/* Notes */}
              <Text style={styles.formLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes about task completion..."
                placeholderTextColor={COLORS.textLight}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />

              {/* Photo */}
              <Text style={styles.formLabel}>Photo Documentation</Text>
              {photo ? (
                <View style={styles.photoPreview}>
                  <Image source={{ uri: photo }} style={styles.photoPreviewImage} />
                  <TouchableOpacity 
                    style={styles.removePhotoBtn}
                    onPress={() => setPhoto(null)}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
                  <Ionicons name="camera" size={24} color={COLORS.primary} />
                  <Text style={styles.addPhotoBtnText}>Add Photo</Text>
                </TouchableOpacity>
              )}

              {/* Complete Button */}
              <TouchableOpacity style={styles.completeTaskBtn} onPress={handleComplete}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.completeTaskBtnText}>Mark as Complete</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Completed Task Info */}
          {task.status === 'completed' && (
            <View style={styles.completedInfo}>
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                <Text style={styles.completedBadgeText}>Completed</Text>
              </View>
              {task.completedTime && (
                <Text style={styles.completedTime}>
                  Completed at {formatTime(task.completedTime)}
                </Text>
              )}
              {task.notes && (
                <View style={styles.completedNotes}>
                  <Text style={styles.completedNotesLabel}>Notes:</Text>
                  <Text style={styles.completedNotesText}>{task.notes}</Text>
                </View>
              )}
              {task.completionPhoto && (
                <View style={styles.completedPhoto}>
                  <Text style={styles.completedPhotoLabel}>Documentation:</Text>
                  <Image source={{ uri: task.completionPhoto }} style={styles.completedPhotoImage} />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ============================================
// INCIDENT REPORT MODAL - Multi-Step Form
// ============================================
const IncidentReportModal = ({ visible, onClose }) => {
  const [step, setStep] = useState(1);
  const [incidentData, setIncidentData] = useState({
    type: '',
    severity: 'moderate',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    location: '',
    description: '',
    actionsTaken: '',
    witnesses: '',
    photos: [],
    immediateActions: [],
    notifyFamily: true,
    notifyNurse: true,
  });

  const handleNext = () => {
    if (step === 1 && !incidentData.type) {
      Alert.alert('Required', 'Please select an incident type');
      return;
    }
    if (step === 2 && !incidentData.description) {
      Alert.alert('Required', 'Please provide a description');
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    Alert.alert(
      'Incident Reported',
      'Your incident report has been submitted successfully.',
      [{ text: 'OK', onPress: onClose }]
    );
    // Reset form
    setStep(1);
    setIncidentData({
      type: '',
      severity: 'moderate',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      location: '',
      description: '',
      actionsTaken: '',
      witnesses: '',
      photos: [],
      immediateActions: [],
      notifyFamily: true,
      notifyNurse: true,
    });
  };

  const renderStep1 = () => (
    <View style={styles.incidentStepContent}>
      <Text style={styles.incidentStepTitle}>Step 1: Incident Type</Text>
      <Text style={styles.incidentStepSubtitle}>Select the type of incident that occurred</Text>

      <View style={styles.incidentTypeGrid}>
        {INCIDENT_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.incidentTypeCard,
              incidentData.type === type && styles.incidentTypeCardSelected
            ]}
            onPress={() => setIncidentData({ ...incidentData, type })}
          >
            <Ionicons 
              name={
                type.includes('Fall') ? 'walk' :
                type.includes('Medication') ? 'medical' :
                type.includes('Behavioral') ? 'person' :
                type.includes('Skin') ? 'body' :
                type.includes('Equipment') ? 'construct' :
                type.includes('Environmental') ? 'warning' :
                'alert-circle'
              }
              size={24}
              color={incidentData.type === type ? '#fff' : COLORS.primary}
            />
            <Text style={[
              styles.incidentTypeText,
              incidentData.type === type && styles.incidentTypeTextSelected
            ]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Severity */}
      <Text style={styles.formLabel}>Severity Level</Text>
      <View style={styles.severitySelector}>
        {INCIDENT_SEVERITIES.map((sev) => (
          <TouchableOpacity
            key={sev.value}
            style={[
              styles.severityBtn,
              incidentData.severity === sev.value && { backgroundColor: sev.color }
            ]}
            onPress={() => setIncidentData({ ...incidentData, severity: sev.value })}
          >
            <Text style={[
              styles.severityBtnText,
              incidentData.severity === sev.value && styles.severityBtnTextSelected
            ]}>{sev.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.incidentStepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.incidentStepTitle}>Step 2: Details</Text>
      <Text style={styles.incidentStepSubtitle}>Provide information about the incident</Text>

      {/* Date & Time */}
      <View style={styles.dateTimeRow}>
        <View style={styles.dateTimeField}>
          <Text style={styles.formLabel}>Date</Text>
          <View style={styles.dateTimeInput}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.dateTimeText}>{incidentData.date}</Text>
          </View>
        </View>
        <View style={styles.dateTimeField}>
          <Text style={styles.formLabel}>Time</Text>
          <View style={styles.dateTimeInput}>
            <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.dateTimeText}>{incidentData.time}</Text>
          </View>
        </View>
      </View>

      {/* Location */}
      <Text style={styles.formLabel}>Location</Text>
      <TextInput
        style={styles.formInput}
        placeholder="Where did the incident occur?"
        placeholderTextColor={COLORS.textLight}
        value={incidentData.location}
        onChangeText={(text) => setIncidentData({ ...incidentData, location: text })}
      />

      {/* Description */}
      <Text style={styles.formLabel}>Description *</Text>
      <TextInput
        style={[styles.formInput, styles.textArea]}
        placeholder="Describe what happened in detail..."
        placeholderTextColor={COLORS.textLight}
        value={incidentData.description}
        onChangeText={(text) => setIncidentData({ ...incidentData, description: text })}
        multiline
        numberOfLines={5}
      />

      {/* Witnesses */}
      <Text style={styles.formLabel}>Witnesses</Text>
      <TextInput
        style={styles.formInput}
        placeholder="List any witnesses (names)"
        placeholderTextColor={COLORS.textLight}
        value={incidentData.witnesses}
        onChangeText={(text) => setIncidentData({ ...incidentData, witnesses: text })}
      />
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.incidentStepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.incidentStepTitle}>Step 3: Actions Taken</Text>
      <Text style={styles.incidentStepSubtitle}>Document the response to this incident</Text>

      {/* Actions Taken */}
      <Text style={styles.formLabel}>Immediate Actions Taken</Text>
      <TextInput
        style={[styles.formInput, styles.textArea]}
        placeholder="What actions were taken immediately after the incident?"
        placeholderTextColor={COLORS.textLight}
        value={incidentData.actionsTaken}
        onChangeText={(text) => setIncidentData({ ...incidentData, actionsTaken: text })}
        multiline
        numberOfLines={4}
      />

      {/* Photo Documentation */}
      <Text style={styles.formLabel}>Photo Documentation</Text>
      <View style={styles.photoDocSection}>
        <TouchableOpacity 
          style={styles.addPhotoDocBtn}
          onPress={() => {
            Alert.alert('Add Photo', 'Photo capture would open here');
          }}
        >
          <Ionicons name="camera" size={32} color={COLORS.primary} />
          <Text style={styles.addPhotoDocText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addPhotoDocBtn}
          onPress={() => {
            Alert.alert('Add Photo', 'Photo library would open here');
          }}
        >
          <Ionicons name="images" size={32} color={COLORS.primary} />
          <Text style={styles.addPhotoDocText}>Choose Photo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.incidentStepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.incidentStepTitle}>Step 4: Review & Submit</Text>
      <Text style={styles.incidentStepSubtitle}>Review the incident report before submitting</Text>

      {/* Summary Card */}
      <View style={styles.incidentSummaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Type:</Text>
          <Text style={styles.summaryValue}>{incidentData.type}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Severity:</Text>
          <View style={[
            styles.summarySeverityBadge,
            { backgroundColor: INCIDENT_SEVERITIES.find(s => s.value === incidentData.severity)?.color }
          ]}>
            <Text style={styles.summarySeverityText}>{incidentData.severity}</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date/Time:</Text>
          <Text style={styles.summaryValue}>{incidentData.date} at {incidentData.time}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Location:</Text>
          <Text style={styles.summaryValue}>{incidentData.location || 'Not specified'}</Text>
        </View>
        <View style={styles.summaryDescRow}>
          <Text style={styles.summaryLabel}>Description:</Text>
          <Text style={styles.summaryDescText}>{incidentData.description}</Text>
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.notificationSettings}>
        <Text style={styles.notificationTitle}>Notifications</Text>
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Ionicons name="people" size={20} color={COLORS.primary} />
            <Text style={styles.notificationText}>Notify Family Member</Text>
          </View>
          <Switch
            value={incidentData.notifyFamily}
            onValueChange={(value) => setIncidentData({ ...incidentData, notifyFamily: value })}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Ionicons name="medkit" size={20} color={COLORS.primary} />
            <Text style={styles.notificationText}>Notify Supervising Nurse</Text>
          </View>
          <Switch
            value={incidentData.notifyNurse}
            onValueChange={(value) => setIncidentData({ ...incidentData, notifyNurse: value })}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>
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
          <Text style={styles.modalTitle}>Incident Report</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsIndicator}>
          {[1, 2, 3, 4].map((s) => (
            <View key={s} style={styles.stepIndicatorItem}>
              <View style={[
                styles.stepDot,
                step >= s && styles.stepDotActive,
                step === s && styles.stepDotCurrent
              ]}>
                {step > s ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : (
                  <Text style={[
                    styles.stepDotText,
                    step >= s && styles.stepDotTextActive
                  ]}>{s}</Text>
                )}
              </View>
              {s < 4 && (
                <View style={[
                  styles.stepLine,
                  step > s && styles.stepLineActive
                ]} />
              )}
            </View>
          ))}
        </View>

        {/* Step Content */}
        <View style={styles.stepContentContainer}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.stepNavigation}>
          {step > 1 && (
            <TouchableOpacity style={styles.stepBackBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color={COLORS.text} />
              <Text style={styles.stepBackBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {step < 4 ? (
            <TouchableOpacity style={styles.stepNextBtn} onPress={handleNext}>
              <Text style={styles.stepNextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stepSubmitBtn} onPress={handleSubmit}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.stepSubmitBtnText}>Submit Report</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ============================================
// CAREGIVER - INCIDENTS TAB
// ============================================
const CaregiverIncidentsScreen = () => {
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return COLORS.critical;
      case 'high': return COLORS.error;
      case 'moderate': return COLORS.warning;
      case 'low': return COLORS.info;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return 'checkmark-circle';
      case 'under_review': return 'time';
      case 'pending': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Incident Reports</Text>
          <TouchableOpacity 
            style={styles.newIncidentBtn}
            onPress={() => setShowReportModal(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.newIncidentBtnText}>New Report</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.incidentStats}>
          <View style={styles.incidentStatCard}>
            <Text style={styles.incidentStatValue}>
              {incidents.filter(i => i.status === 'under_review').length}
            </Text>
            <Text style={styles.incidentStatLabel}>Under Review</Text>
          </View>
          <View style={styles.incidentStatCard}>
            <Text style={styles.incidentStatValue}>
              {incidents.filter(i => i.status === 'resolved').length}
            </Text>
            <Text style={styles.incidentStatLabel}>Resolved</Text>
          </View>
          <View style={styles.incidentStatCard}>
            <Text style={styles.incidentStatValue}>{incidents.length}</Text>
            <Text style={styles.incidentStatLabel}>Total</Text>
          </View>
        </View>

        {/* Incidents List */}
        <View style={styles.incidentsList}>
          {incidents.map((incident) => (
            <TouchableOpacity 
              key={incident.id} 
              style={styles.incidentCard}
              onPress={() => setSelectedIncident(incident)}
            >
              <View style={styles.incidentCardHeader}>
                <View style={[
                  styles.incidentSeverityIndicator,
                  { backgroundColor: getSeverityColor(incident.severity) }
                ]} />
                <View style={styles.incidentCardTitle}>
                  <Text style={styles.incidentTitle}>{incident.title}</Text>
                  <Text style={styles.incidentType}>{incident.type}</Text>
                </View>
                <View style={[
                  styles.incidentStatusBadge,
                  { backgroundColor: incident.status === 'resolved' ? '#dcfce7' : '#fef3c7' }
                ]}>
                  <Ionicons 
                    name={getStatusIcon(incident.status)} 
                    size={14} 
                    color={incident.status === 'resolved' ? COLORS.success : COLORS.warning}
                  />
                  <Text style={[
                    styles.incidentStatusText,
                    { color: incident.status === 'resolved' ? COLORS.success : COLORS.warning }
                  ]}>
                    {incident.status === 'under_review' ? 'Under Review' : 'Resolved'}
                  </Text>
                </View>
              </View>
              <Text style={styles.incidentDescription} numberOfLines={2}>
                {incident.description}
              </Text>
              <View style={styles.incidentMeta}>
                <Text style={styles.incidentMetaText}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.textSecondary} />
                  {' '}{incident.date}
                </Text>
                <Text style={styles.incidentMetaText}>
                  <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
                  {' '}{incident.time}
                </Text>
                <Text style={styles.incidentMetaText}>
                  <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
                  {' '}{incident.location}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <IncidentReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      {/* Incident Detail Modal */}
      <Modal 
        visible={selectedIncident !== null} 
        animationType="slide" 
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setSelectedIncident(null)} 
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Incident Details</Text>
            <View style={{ width: 40 }} />
          </View>

          {selectedIncident && (
            <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 20 }}>
              {/* Header */}
              <View style={styles.incidentDetailHeader}>
                <View style={[
                  styles.incidentDetailSeverity,
                  { backgroundColor: getSeverityColor(selectedIncident.severity) }
                ]}>
                  <Text style={styles.incidentDetailSeverityText}>
                    {selectedIncident.severity.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.incidentDetailTitle}>{selectedIncident.title}</Text>
                <Text style={styles.incidentDetailType}>{selectedIncident.type}</Text>
              </View>

              {/* Details */}
              <View style={styles.incidentDetailSection}>
                <Text style={styles.incidentDetailLabel}>Date & Time</Text>
                <Text style={styles.incidentDetailValue}>
                  {selectedIncident.date} at {selectedIncident.time}
                </Text>
              </View>

              <View style={styles.incidentDetailSection}>
                <Text style={styles.incidentDetailLabel}>Location</Text>
                <Text style={styles.incidentDetailValue}>{selectedIncident.location}</Text>
              </View>

              <View style={styles.incidentDetailSection}>
                <Text style={styles.incidentDetailLabel}>Description</Text>
                <Text style={styles.incidentDetailValue}>{selectedIncident.description}</Text>
              </View>

              <View style={styles.incidentDetailSection}>
                <Text style={styles.incidentDetailLabel}>Actions Taken</Text>
                {selectedIncident.actionsTaken.map((action, index) => (
                  <View key={index} style={styles.actionItem}>
                    <View style={styles.actionDot} />
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
              </View>

              {selectedIncident.followUp && (
                <View style={styles.incidentDetailSection}>
                  <Text style={styles.incidentDetailLabel}>Follow-up Required</Text>
                  <Text style={styles.incidentDetailValue}>{selectedIncident.followUp}</Text>
                </View>
              )}

              <View style={styles.incidentDetailSection}>
                <Text style={styles.incidentDetailLabel}>Reported By</Text>
                <Text style={styles.incidentDetailValue}>{selectedIncident.reportedBy}</Text>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

// ============================================
// CAREGIVER - MESSAGES TAB
// ============================================
const CaregiverMessagesScreen = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef(null);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: `m${messages.length + 1}`,
      sender: user.name,
      senderRole: user.role,
      content: newMessage,
      timestamp: new Date().toLocaleString(),
      read: true,
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.screenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.chatHeader}>
        <View style={styles.chatHeaderInfo}>
          <Image 
            source={{ uri: MOCK_USERS.family.avatar }} 
            style={styles.chatAvatar} 
          />
          <View>
            <Text style={styles.chatName}>{MOCK_USERS.family.name}</Text>
            <Text style={styles.chatRelation}>Family Member • {MOCK_PATIENT.name}'s Son</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.chatHeaderBtn}>
          <Ionicons name="call" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View 
            key={message.id}
            style={[
              styles.messageBubble,
              message.senderRole === user.role ? styles.messageBubbleSent : styles.messageBubbleReceived
            ]}
          >
            <Text style={[
              styles.messageText,
              message.senderRole === user.role ? styles.messageTextSent : styles.messageTextReceived
            ]}>
              {message.content}
            </Text>
            <Text style={[
              styles.messageTime,
              message.senderRole === user.role ? styles.messageTimeSent : styles.messageTimeReceived
            ]}>
              {message.timestamp.split(' ')[1]} {message.timestamp.split(' ')[2]}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.chatInputContainer}>
        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="attach" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={styles.chatInput}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textLight}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !newMessage.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color={newMessage.trim() ? '#fff' : COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ============================================
// AI COPILOT SCREEN
// ============================================
const AICopilotScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI Care Assistant. I can help you with care questions, documentation, and best practices. How can I assist you today?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const quickPrompts = [
    'How to handle medication refusal?',
    'Fall prevention best practices',
    'Signs of dehydration in elderly',
    'Proper transfer techniques',
  ];

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(text),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 1500);
  };

  const getAIResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('medication') || lowerQuery.includes('refusal')) {
      return 'When a patient refuses medication:\n\n1. Stay calm and respectful\n2. Ask about their concerns\n3. Explain the importance of the medication\n4. Offer alternatives (take with food, different time)\n5. Document the refusal and notify the RN\n6. Try again after 30 minutes if appropriate\n\nNever force medication. Always document refusals in the care record.';
    }
    if (lowerQuery.includes('fall') || lowerQuery.includes('prevention')) {
      return 'Fall Prevention Best Practices:\n\n1. Ensure adequate lighting in all areas\n2. Keep pathways clear of clutter\n3. Use non-slip mats in bathroom\n4. Encourage proper footwear\n5. Assist with transfers when needed\n6. Keep call bell within reach\n7. Regular toileting schedule\n8. Review medications that may cause dizziness\n\nAlways assess fall risk daily and update care plans accordingly.';
    }
    if (lowerQuery.includes('dehydration')) {
      return 'Signs of Dehydration in Elderly:\n\n• Dry mouth and cracked lips\n• Dark urine or decreased output\n• Confusion or dizziness\n• Fatigue and weakness\n• Sunken eyes\n• Rapid heartbeat\n• Low blood pressure\n\nPrevention:\n- Offer fluids regularly (aim for 6-8 cups/day)\n- Include water-rich foods\n- Monitor intake and output\n- Watch for early signs';
    }
    return 'Thank you for your question. As an AI care assistant, I\'m here to help with care-related queries, best practices, and documentation guidance. Please feel free to ask specific questions about patient care, and I\'ll provide evidence-based recommendations.\n\nSome topics I can help with:\n• Medication management\n• Fall prevention\n• Nutrition and hydration\n• Personal care techniques\n• Documentation best practices';
  };

  return (
    <KeyboardAvoidingView 
      style={styles.screenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.aiHeader}>
        <View style={styles.aiHeaderIcon}>
          <Ionicons name="sparkles" size={24} color="#8b5cf6" />
        </View>
        <View>
          <Text style={styles.aiHeaderTitle}>AI Care Assistant</Text>
          <Text style={styles.aiHeaderSubtitle}>Powered by Gemini</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.aiMessagesContainer}
        contentContainerStyle={styles.aiMessagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View 
            key={message.id}
            style={[
              styles.aiMessageBubble,
              message.role === 'user' ? styles.aiUserMessage : styles.aiAssistantMessage
            ]}
          >
            {message.role === 'assistant' && (
              <View style={styles.aiMessageIcon}>
                <Ionicons name="sparkles" size={16} color="#8b5cf6" />
              </View>
            )}
            <Text style={[
              styles.aiMessageText,
              message.role === 'user' ? styles.aiUserMessageText : styles.aiAssistantMessageText
            ]}>
              {message.content}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={styles.aiLoadingBubble}>
            <ActivityIndicator size="small" color="#8b5cf6" />
            <Text style={styles.aiLoadingText}>Thinking...</Text>
          </View>
        )}

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <View style={styles.quickPromptsContainer}>
            <Text style={styles.quickPromptsTitle}>Quick Questions</Text>
            <View style={styles.quickPromptsGrid}>
              {quickPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickPromptBtn}
                  onPress={() => handleSend(prompt)}
                >
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.aiInputContainer}>
        <TextInput
          style={styles.aiInput}
          placeholder="Ask a care question..."
          placeholderTextColor={COLORS.textLight}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity 
          style={[styles.aiSendBtn, !input.trim() && styles.aiSendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!input.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color={input.trim() ? '#fff' : COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ============================================
// CAREGIVER - PROFILE/SETTINGS TAB
// ============================================
const CaregiverProfileScreen = () => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => Alert.alert('Edit Profile') },
    { icon: 'notifications-outline', label: 'Notifications', toggle: true, value: notificationsEnabled, onToggle: setNotificationsEnabled },
    { icon: 'shield-outline', label: 'Privacy & Security', onPress: () => Alert.alert('Privacy') },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => Alert.alert('Support') },
    { icon: 'document-text-outline', label: 'Terms of Service', onPress: () => Alert.alert('Terms') },
    { icon: 'information-circle-outline', label: 'About', onPress: () => Alert.alert('ADLTrack v1.0.0') },
  ];

  return (
    <View style={styles.screenContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileScreenHeader}>
          <Image source={{ uri: user?.avatar }} style={styles.profileScreenAvatar} />
          <Text style={styles.profileScreenName}>{user?.name}</Text>
          <Text style={styles.profileScreenRole}>{user?.certification} • {user?.experience}</Text>
          <View style={styles.profileScreenBadge}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.profileScreenBadgeText}>Verified Caregiver</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.profileStats}>
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>127</Text>
            <Text style={styles.profileStatLabel}>Tasks Done</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>4.9</Text>
            <Text style={styles.profileStatLabel}>Rating</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>98%</Text>
            <Text style={styles.profileStatLabel}>On Time</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.profileMenu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.profileMenuItem}
              onPress={item.onPress}
              disabled={item.toggle}
            >
              <View style={styles.profileMenuItemLeft}>
                <View style={styles.profileMenuIcon}>
                  <Ionicons name={item.icon} size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.profileMenuLabel}>{item.label}</Text>
              </View>
              {item.toggle ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// ============================================
// FAMILY DASHBOARD - HOME TAB
// ============================================
const FamilyHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showRequestTaskModal, setShowRequestTaskModal] = useState(false);

  const completedToday = MOCK_TASKS.filter(t => t.status === 'completed').length;
  const totalTasks = MOCK_TASKS.length;

  return (
    <View style={styles.screenContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.dashboardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.headerAvatar}>
            <Image source={{ uri: user?.avatar }} style={styles.avatarImage} />
          </TouchableOpacity>
        </View>

        {/* Patient Overview Card */}
        <TouchableOpacity 
          style={styles.familyPatientCard}
          onPress={() => setShowPatientProfile(true)}
        >
          <View style={styles.familyPatientCardContent}>
            <Image source={{ uri: MOCK_PATIENT.photo }} style={styles.familyPatientPhoto} />
            <View style={styles.familyPatientInfo}>
              <Text style={styles.familyPatientName}>{MOCK_PATIENT.name}</Text>
              <Text style={styles.familyPatientRelation}>Your Mother</Text>
              <View style={styles.familyPatientStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active Care</Text>
              </View>
            </View>
          </View>
          <View style={styles.familyPatientCardFooter}>
            <View style={styles.caregiverOnDuty}>
              <Image source={{ uri: MOCK_USERS.caregiver.avatar }} style={styles.caregiverMiniAvatar} />
              <View>
                <Text style={styles.caregiverOnDutyLabel}>Current Caregiver</Text>
                <Text style={styles.caregiverOnDutyName}>{MOCK_USERS.caregiver.name}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.messageCaregiverBtn}>
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.familyQuickActions}>
          <TouchableOpacity 
            style={styles.familyQuickActionBtn}
            onPress={() => setShowVitalsModal(true)}
          >
            <View style={[styles.familyQuickActionIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="pulse" size={22} color={COLORS.success} />
            </View>
            <Text style={styles.familyQuickActionText}>Vitals</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.familyQuickActionBtn}
            onPress={() => setShowRequestTaskModal(true)}
          >
            <View style={[styles.familyQuickActionIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="add-circle" size={22} color={COLORS.info} />
            </View>
            <Text style={styles.familyQuickActionText}>Request</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.familyQuickActionBtn}
            onPress={() => navigation.navigate('Messages')}
          >
            <View style={[styles.familyQuickActionIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="chatbubbles" size={22} color={COLORS.warning} />
            </View>
            <Text style={styles.familyQuickActionText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.familyQuickActionBtn}
            onPress={() => navigation.navigate('AICopilot')}
          >
            <View style={[styles.familyQuickActionIcon, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="sparkles" size={22} color="#8b5cf6" />
            </View>
            <Text style={styles.familyQuickActionText}>AI Help</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Care Progress</Text>
            <Text style={styles.progressPercent}>
              {Math.round((completedToday / totalTasks) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressBarFill, 
              { width: `${(completedToday / totalTasks) * 100}%` }
            ]} />
          </View>
          <Text style={styles.progressSubtext}>
            {completedToday} of {totalTasks} tasks completed
          </Text>
        </View>

        {/* Current Vitals */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Vitals</Text>
            <TouchableOpacity onPress={() => setShowVitalsModal(true)}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.vitalsRow}>
              {MOCK_VITALS.slice(0, 4).map((vital) => (
                <View key={vital.id} style={styles.familyVitalCard}>
                  <Ionicons 
                    name={vital.icon} 
                    size={20} 
                    color={vital.status === 'normal' ? COLORS.success : COLORS.warning} 
                  />
                  <Text style={styles.familyVitalValue}>{vital.value}</Text>
                  <Text style={styles.familyVitalLabel}>{vital.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Care Timeline */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Care Timeline</Text>
          </View>
          {MOCK_TASKS.map((task, index) => (
            <View key={task.id} style={styles.timelineItem}>
              <View style={styles.timelineLine}>
                <View style={[
                  styles.timelineDot,
                  { backgroundColor: getStatusColor(task.status) }
                ]} />
                {index < MOCK_TASKS.length - 1 && <View style={styles.timelineConnector} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTime}>{task.scheduledTime}</Text>
                <View style={styles.timelineCard}>
                  <View style={styles.timelineCardHeader}>
                    <Text style={styles.timelineTitle}>{task.title}</Text>
                    <View style={[
                      styles.timelineStatusBadge,
                      { backgroundColor: `${getStatusColor(task.status)}20` }
                    ]}>
                      <Text style={[
                        styles.timelineStatusText,
                        { color: getStatusColor(task.status) }
                      ]}>
                        {task.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.timelineDescription} numberOfLines={2}>
                    {task.description}
                  </Text>
                  {task.status === 'completed' && task.completionPhoto && (
                    <View style={styles.timelinePhotoContainer}>
                      <Image source={{ uri: task.completionPhoto }} style={styles.timelinePhoto} />
                      <Text style={styles.timelinePhotoCaption}>Photo documentation</Text>
                    </View>
                  )}
                  {task.notes && (
                    <View style={styles.timelineNotes}>
                      <Ionicons name="document-text-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.timelineNotesText}>{task.notes}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
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
        isCaregiver={false}
      />
      <RequestTaskModal
        visible={showRequestTaskModal}
        onClose={() => setShowRequestTaskModal(false)}
      />
    </View>
  );
};

// ============================================
// REQUEST TASK MODAL (Family)
// ============================================
const RequestTaskModal = ({ visible, onClose }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState('standard');

  const handleSubmit = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    Alert.alert(
      'Request Sent',
      'Your task request has been sent to the caregiver.',
      [{ text: 'OK', onPress: onClose }]
    );
    setTaskTitle('');
    setTaskDescription('');
    setPriority('standard');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Request Task</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.requestModalSubtitle}>
            Request a task for the caregiver to complete
          </Text>

          {/* Task Title */}
          <Text style={styles.formLabel}>Task Title *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g., Extra walking session"
            placeholderTextColor={COLORS.textLight}
            value={taskTitle}
            onChangeText={setTaskTitle}
          />

          {/* Description */}
          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            placeholder="Add any specific instructions or notes..."
            placeholderTextColor={COLORS.textLight}
            value={taskDescription}
            onChangeText={setTaskDescription}
            multiline
            numberOfLines={4}
          />

          {/* Priority */}
          <Text style={styles.formLabel}>Priority</Text>
          <View style={styles.prioritySelector}>
            {['low', 'standard', 'high'].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.prioritySelectorBtn,
                  priority === p && { backgroundColor: getPriorityColor(p) }
                ]}
                onPress={() => setPriority(p)}
              >
                <Text style={[
                  styles.prioritySelectorText,
                  priority === p && { color: '#fff' }
                ]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Suggestions */}
          <View style={styles.suggestionContainer}>
            <Text style={styles.suggestionTitle}>Quick Suggestions</Text>
            <View style={styles.suggestionTags}>
              {['Extra walk', 'Video call setup', 'Special meal request', 'Reading time', 'Music therapy'].map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionTag}
                  onPress={() => setTaskTitle(suggestion)}
                >
                  <Text style={styles.suggestionTagText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitRequestBtn} onPress={handleSubmit}>
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.submitRequestBtnText}>Send Request</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ============================================
// FAMILY - UPDATES TAB
// ============================================
const FamilyUpdatesScreen = () => {
  const getUpdateIcon = (type) => {
    switch (type) {
      case 'task_completed': return 'checkmark-circle';
      case 'vitals_recorded': return 'pulse';
      case 'note_added': return 'document-text';
      case 'incident': return 'warning';
      default: return 'information-circle';
    }
  };

  const getUpdateColor = (type) => {
    switch (type) {
      case 'task_completed': return COLORS.success;
      case 'vitals_recorded': return COLORS.info;
      case 'note_added': return COLORS.warning;
      case 'incident': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Care Updates</Text>
          <View style={styles.filterBtn}>
            <Ionicons name="filter" size={18} color={COLORS.primary} />
            <Text style={styles.filterBtnText}>Filter</Text>
          </View>
        </View>

        {/* Today's Updates */}
        <View style={styles.updatesSection}>
          <Text style={styles.updatesSectionTitle}>Today</Text>
          {MOCK_UPDATES.map((update) => (
            <View key={update.id} style={styles.updateCard}>
              <View style={[
                styles.updateIconContainer,
                { backgroundColor: `${getUpdateColor(update.type)}15` }
              ]}>
                <Ionicons 
                  name={getUpdateIcon(update.type)} 
                  size={20} 
                  color={getUpdateColor(update.type)} 
                />
              </View>
              <View style={styles.updateContent}>
                <Text style={styles.updateTitle}>{update.title}</Text>
                <Text style={styles.updateDescription}>{update.description}</Text>
                {update.data && (
                  <View style={styles.updateDataContainer}>
                    {Object.entries(update.data).map(([key, value]) => (
                      <View key={key} style={styles.updateDataItem}>
                        <Text style={styles.updateDataLabel}>{key}:</Text>
                        <Text style={styles.updateDataValue}>{value}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.updateMeta}>
                  <Text style={styles.updateTime}>{update.timestamp}</Text>
                  <Text style={styles.updateCaregiver}>by {update.caregiver}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Earlier */}
        <View style={styles.updatesSection}>
          <Text style={styles.updatesSectionTitle}>Yesterday</Text>
          <View style={styles.updateCard}>
            <View style={[styles.updateIconContainer, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            </View>
            <View style={styles.updateContent}>
              <Text style={styles.updateTitle}>Daily Summary</Text>
              <Text style={styles.updateDescription}>
                All 8 scheduled tasks were completed. No incidents reported. Vitals stable throughout the day.
              </Text>
              <View style={styles.updateMeta}>
                <Text style={styles.updateTime}>Jan 14, 2024 at 8:00 PM</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// ============================================
// FAMILY - INCIDENTS TAB
// ============================================
const FamilyIncidentsScreen = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return COLORS.critical;
      case 'high': return COLORS.error;
      case 'moderate': return COLORS.warning;
      case 'low': return COLORS.info;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Incident History</Text>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.infoBannerText}>
            You'll be notified immediately of any incidents involving your loved one.
          </Text>
        </View>

        {/* Incidents List */}
        {MOCK_INCIDENTS.map((incident) => (
          <TouchableOpacity 
            key={incident.id}
            style={styles.familyIncidentCard}
            onPress={() => setSelectedIncident(incident)}
          >
            <View style={styles.familyIncidentHeader}>
              <View style={[
                styles.familyIncidentSeverity,
                { backgroundColor: getSeverityColor(incident.severity) }
              ]}>
                <Text style={styles.familyIncidentSeverityText}>
                  {incident.severity.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.familyIncidentDate}>{incident.date}</Text>
            </View>
            <Text style={styles.familyIncidentTitle}>{incident.title}</Text>
            <Text style={styles.familyIncidentType}>{incident.type}</Text>
            <Text style={styles.familyIncidentDescription} numberOfLines={2}>
              {incident.description}
            </Text>
            <View style={styles.familyIncidentFooter}>
              <View style={[
                styles.familyIncidentStatus,
                { backgroundColor: incident.status === 'resolved' ? '#dcfce7' : '#fef3c7' }
              ]}>
                <Text style={[
                  styles.familyIncidentStatusText,
                  { color: incident.status === 'resolved' ? COLORS.success : COLORS.warning }
                ]}>
                  {incident.status === 'under_review' ? 'Under Review' : 'Resolved'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Incident Detail Modal */}
      <Modal 
        visible={selectedIncident !== null} 
        animationType="slide" 
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setSelectedIncident(null)} 
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Incident Details</Text>
            <View style={{ width: 40 }} />
          </View>

          {selectedIncident && (
            <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 20 }}>
              <View style={styles.incidentDetailHeader}>
                <View style={[
                  styles.incidentDetailSeverity,
                  { backgroundColor: getSeverityColor(selectedIncident.severity) }
                ]}>
                  <Text style={styles.incidentDetailSeverityText}>
                    {selectedIncident.severity.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.incidentDetailTitle}>{selectedIncident.title}</Text>
                <Text style={styles.incidentDetailType}>{selectedIncident.type}</Text>
              </View>

              <View style={styles.incidentDetailSection}>
                <Text style={styles.incidentDetailLabel}>Date & Time</Text>
                <Text style={styles.incidentDetailValue}>
                  {selectedIncident.date} at {selectedIncident.time}
                </Text>
              </View>

              <View style={styles.incidentDetailSection}>
                <Text style={styles.incidentDetailLabel}>Location</Text>
                <Text style={styles.incidentDetailValue}>{selectedIncident.location}</Text>
              </View>

              <View style={styles.incidentDetailSection}>
                <Text style={styles.incidentDetailLabel}>What Happened</Text>
                <Text style={styles.incidentDetailValue}>{selectedIncident.description}</Text>
              </View>

              <View style={styles.incidentDetailSection}>
                <Text style={styles.incidentDetailLabel}>Actions Taken</Text>
                {selectedIncident.actionsTaken.map((action, index) => (
                  <View key={index} style={styles.actionItem}>
                    <View style={styles.actionDot} />
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
              </View>

              {selectedIncident.followUp && (
                <View style={styles.incidentDetailSection}>
                  <Text style={styles.incidentDetailLabel}>Follow-up Plan</Text>
                  <Text style={styles.incidentDetailValue}>{selectedIncident.followUp}</Text>
                </View>
              )}

              <View style={styles.incidentDetailSection}>
                <Text style={styles.incidentDetailLabel}>Reported By</Text>
                <View style={styles.reporterInfo}>
                  <Image 
                    source={{ uri: MOCK_USERS.caregiver.avatar }} 
                    style={styles.reporterAvatar} 
                  />
                  <Text style={styles.reporterName}>{selectedIncident.reportedBy}</Text>
                </View>
              </View>

              {/* Contact Caregiver Button */}
              <TouchableOpacity style={styles.contactCaregiverBtn}>
                <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                <Text style={styles.contactCaregiverBtnText}>Message Caregiver</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

// ============================================
// FAMILY - MESSAGES TAB
// ============================================
const FamilyMessagesScreen = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef(null);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: `m${messages.length + 1}`,
      sender: user.name,
      senderRole: user.role,
      content: newMessage,
      timestamp: new Date().toLocaleString(),
      read: true,
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.screenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.chatHeader}>
        <View style={styles.chatHeaderInfo}>
          <Image 
            source={{ uri: MOCK_USERS.caregiver.avatar }} 
            style={styles.chatAvatar} 
          />
          <View>
            <Text style={styles.chatName}>{MOCK_USERS.caregiver.name}</Text>
            <Text style={styles.chatRelation}>Caregiver • {MOCK_USERS.caregiver.certification}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.chatHeaderBtn}>
          <Ionicons name="call" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View 
            key={message.id}
            style={[
              styles.messageBubble,
              message.senderRole === user.role ? styles.messageBubbleSent : styles.messageBubbleReceived
            ]}
          >
            <Text style={[
              styles.messageText,
              message.senderRole === user.role ? styles.messageTextSent : styles.messageTextReceived
            ]}>
              {message.content}
            </Text>
            <Text style={[
              styles.messageTime,
              message.senderRole === user.role ? styles.messageTimeSent : styles.messageTimeReceived
            ]}>
              {message.timestamp.split(' ')[1]} {message.timestamp.split(' ')[2]}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.chatInputContainer}>
        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="attach" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={styles.chatInput}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textLight}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !newMessage.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color={newMessage.trim() ? '#fff' : COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ============================================
// FAMILY - PROFILE TAB
// ============================================
const FamilyProfileScreen = () => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => Alert.alert('Edit Profile') },
    { icon: 'notifications-outline', label: 'Notifications', toggle: true, value: notificationsEnabled, onToggle: setNotificationsEnabled },
    { icon: 'people-outline', label: 'Family Members', onPress: () => Alert.alert('Family Members') },
    { icon: 'card-outline', label: 'Billing & Subscription', onPress: () => Alert.alert('Billing') },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => Alert.alert('Support') },
    { icon: 'document-text-outline', label: 'Care Agreement', onPress: () => Alert.alert('Agreement') },
  ];

  return (
    <View style={styles.screenContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileScreenHeader}>
          <Image source={{ uri: user?.avatar }} style={styles.profileScreenAvatar} />
          <Text style={styles.profileScreenName}>{user?.name}</Text>
          <Text style={styles.profileScreenRole}>{user?.relationship} of {MOCK_PATIENT.name}</Text>
        </View>

        {/* Patient Info Card */}
        <View style={styles.familyPatientInfoCard}>
          <View style={styles.familyPatientInfoHeader}>
            <Image source={{ uri: MOCK_PATIENT.photo }} style={styles.familyPatientInfoPhoto} />
            <View>
              <Text style={styles.familyPatientInfoName}>{MOCK_PATIENT.name}</Text>
              <Text style={styles.familyPatientInfoDetails}>
                Room {MOCK_PATIENT.room} • Under your care
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.profileMenu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.profileMenuItem}
              onPress={item.onPress}
              disabled={item.toggle}
            >
              <View style={styles.profileMenuItemLeft}>
                <View style={styles.profileMenuIcon}>
                  <Ionicons name={item.icon} size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.profileMenuLabel}>{item.label}</Text>
              </View>
              {item.toggle ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// ============================================
// NAVIGATION - CAREGIVER TABS
// ============================================
const CaregiverTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Incidents':
              iconName = focused ? 'warning' : 'warning-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'AICopilot':
              iconName = focused ? 'sparkles' : 'sparkles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={CaregiverHomeScreen} />
      <Tab.Screen name="Incidents" component={CaregiverIncidentsScreen} />
      <Tab.Screen name="Messages" component={CaregiverMessagesScreen} />
      <Tab.Screen name="AICopilot" component={AICopilotScreen} options={{ tabBarLabel: 'AI Help' }} />
      <Tab.Screen name="Profile" component={CaregiverProfileScreen} />
    </Tab.Navigator>
  );
};

// ============================================
// NAVIGATION - FAMILY TABS
// ============================================
const FamilyTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Updates':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Incidents':
              iconName = focused ? 'alert-circle' : 'alert-circle-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={FamilyHomeScreen} />
      <Tab.Screen name="Updates" component={FamilyUpdatesScreen} />
      <Tab.Screen name="Incidents" component={FamilyIncidentsScreen} />
      <Tab.Screen name="Messages" component={FamilyMessagesScreen} />
      <Tab.Screen name="Profile" component={FamilyProfileScreen} />
    </Tab.Navigator>
  );
};

// ============================================
// MAIN APP NAVIGATOR
// ============================================
const AppNavigator = () => {
  const { user } = useAuth();

  if (!user) {
    return <AuthScreen />;
  }

  return user.role === 'caregiver' ? <CaregiverTabs /> : <FamilyTabs />;
};

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  // Auth Styles
  authContainer: {
    flex: 1,
  },
  authGradient: {
    flex: 1,
  },
  authScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  authLogoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  authLogoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  authSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  authCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  authCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  authCardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  roleSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  demoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  demoInfoText: {
    fontSize: 12,
    color: COLORS.info,
  },

  // Screen Container
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Dashboard Header
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerLeft: {},
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  // Shift Card
  shiftCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shiftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shiftLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  shiftTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  shiftProgressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 12,
  },
  shiftProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  shiftStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  shiftStatItem: {
    alignItems: 'center',
  },
  shiftStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  shiftStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Patient Card
  patientCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  patientPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  patientDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  patientTags: {
    flexDirection: 'row',
    gap: 8,
  },
  patientTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  patientTagText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '500',
  },
  patientTagWarning: {
    backgroundColor: '#fef3c7',
  },
  patientTagTextWarning: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: '500',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Section
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sectionLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },

  // Vitals Row
  vitalsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  vitalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: 85,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  vitalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  vitalUnit: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  vitalLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Task Card
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskCardCompleted: {
    opacity: 0.7,
  },
  taskStatusIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
    minHeight: 60,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskCategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  taskTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  taskDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  taskCompletedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  taskCompletedText: {
    fontSize: 12,
    color: COLORS.success,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // Proposed Task Card
  proposedTaskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.info,
    borderStyle: 'dashed',
  },
  proposedTaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  proposedTaskIcon: {
    marginRight: 12,
  },
  proposedTaskInfo: {
    flex: 1,
  },
  proposedTaskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  proposedTaskRequester: {
    fontSize: 12,
    color: COLORS.info,
  },
  proposedTaskTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  proposedTaskDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  proposedTaskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
    gap: 4,
  },
  declineButtonText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '500',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    gap: 4,
  },
  acceptButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },

  // Tab Bar
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 85,
    paddingTop: 8,
    paddingBottom: 25,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Profile Modal Styles
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  profileTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  profileTabActive: {
    borderBottomColor: COLORS.primary,
  },
  profileTabText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  profileTabTextActive: {
    color: COLORS.primary,
  },
  profileContent: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  profileInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  profileInfoItem: {
    width: '50%',
    marginBottom: 16,
  },
  profileInfoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  profileInfoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  preferenceValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  alertSection: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  allergyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  allergyTagText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '500',
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  conditionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  medicationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  medicationDetails: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  medicationTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  careReqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  careReqContent: {
    flex: 1,
  },
  careReqLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  careReqValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.warning,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  contactRelation: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  contactPhone: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Calendar Styles
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDaySelected: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 14,
    color: COLORS.text,
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  historyContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  historySummary: {
    gap: 10,
  },
  historySummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historySummaryText: {
    fontSize: 14,
    color: COLORS.text,
  },

  // Vitals Modal Styles
  vitalsTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  vitalsTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  vitalsTabActive: {
    borderBottomColor: COLORS.primary,
  },
  vitalsTabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  vitalsTabTextActive: {
    color: COLORS.primary,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  vitalDetailCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  vitalDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vitalDetailIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vitalStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  vitalDetailValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  vitalDetailUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  vitalDetailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  vitalDetailTime: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 8,
  },
  addVitalHeaderBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addVitalContainer: {
    padding: 20,
  },
  addVitalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  addVitalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  vitalTypeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  vitalTypeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  vitalTypeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  vitalTypeBtnText: {
    fontSize: 13,
    color: COLORS.text,
  },
  vitalTypeBtnTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  vitalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  vitalInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 18,
    color: COLORS.text,
  },
  vitalInputUnit: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  addVitalActions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  cancelVitalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelVitalBtnText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  saveVitalBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveVitalBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  vitalsHistoryContainer: {
    padding: 16,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 120,
    justifyContent: 'flex-end',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  chartBarContainer: {
    alignItems: 'center',
  },
  chartBar: {
    width: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  historyTable: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  historyTableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  historyTableHeaderCell: {
    fontWeight: 'bold',
  },
  historyTableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyTableCell: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
  },

  // Task Detail Styles
  taskDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginBottom: 0,
  },
  taskDetailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskDetailIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  taskDetailInfo: {
    flex: 1,
  },
  taskDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  taskDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskDetailTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  taskDetailDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  completionForm: {
    padding: 20,
  },
  completionFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  photoPreview: {
    position: 'relative',
    marginBottom: 16,
  },
  photoPreviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginBottom: 16,
    gap: 10,
  },
  addPhotoBtnText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  completeTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  completeTaskBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  completedInfo: {
    padding: 20,
    alignItems: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
    marginBottom: 12,
  },
  completedBadgeText: {
    fontSize: 16,
    color: COLORS.success,
    fontWeight: '600',
  },
  completedTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  completedNotes: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  completedNotesLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  completedNotesText: {
    fontSize: 14,
    color: COLORS.text,
  },
  completedPhoto: {
    width: '100%',
  },
  completedPhotoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  completedPhotoImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },

  // Incident Report Styles
  incidentStepContent: {
    flex: 1,
    padding: 20,
  },
  incidentStepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  incidentStepSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  incidentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  incidentTypeCard: {
    width: (SCREEN_WIDTH - 64) / 3,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  incidentTypeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  incidentTypeText: {
    fontSize: 11,
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
  incidentTypeTextSelected: {
    color: '#fff',
  },
  severitySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  severityBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  severityBtnText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  severityBtnTextSelected: {
    color: '#fff',
  },
  formInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateTimeField: {
    flex: 1,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  dateTimeText: {
    fontSize: 14,
    color: COLORS.text,
  },
  photoDocSection: {
    flexDirection: 'row',
    gap: 12,
  },
  addPhotoDocBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addPhotoDocText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 8,
  },
  incidentSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  summarySeverityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  summarySeverityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  summaryDescRow: {
    paddingVertical: 10,
  },
  summaryDescText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 6,
    lineHeight: 20,
  },
  notificationSettings: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationText: {
    fontSize: 14,
    color: COLORS.text,
  },
  stepsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: '#fff',
  },
  stepIndicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotCurrent: {
    borderWidth: 3,
    borderColor: '#dcfce7',
  },
  stepDotText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  stepDotTextActive: {
    color: '#fff',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepContentContainer: {
    flex: 1,
  },
  stepNavigation: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stepBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 6,
  },
  stepBackBtnText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  stepNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 6,
  },
  stepNextBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  stepSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  stepSubmitBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },

  // Incident List Styles
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  newIncidentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  newIncidentBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  incidentStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  incidentStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  incidentStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  incidentStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  incidentsList: {
    paddingHorizontal: 20,
  },
  incidentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  incidentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  incidentSeverityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  incidentCardTitle: {
    flex: 1,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  incidentType: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  incidentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  incidentStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  incidentDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  incidentMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  incidentMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  incidentDetailHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  incidentDetailSeverity: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  incidentDetailSeverityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  incidentDetailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  incidentDetailType: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  incidentDetailSection: {
    marginBottom: 20,
  },
  incidentDetailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  incidentDetailValue: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },

  // Chat/Messages Styles
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  chatRelation: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chatHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 100,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  messageBubbleSent: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageBubbleReceived: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextSent: {
    color: '#fff',
  },
  messageTextReceived: {
    color: COLORS.text,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 6,
  },
  messageTimeSent: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  messageTimeReceived: {
    color: COLORS.textSecondary,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  attachBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.border,
  },

  // AI Copilot Styles
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  aiHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  aiHeaderSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  aiMessagesContainer: {
    flex: 1,
  },
  aiMessagesContent: {
    padding: 20,
  },
  aiMessageBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  aiUserMessage: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiAssistantMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  aiMessageIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  aiMessageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  aiUserMessageText: {
    color: '#fff',
  },
  aiAssistantMessageText: {
    color: COLORS.text,
  },
  aiLoadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  aiLoadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  quickPromptsContainer: {
    marginTop: 20,
  },
  quickPromptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  quickPromptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickPromptBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickPromptText: {
    fontSize: 13,
    color: COLORS.text,
  },
  aiInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  aiInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    maxHeight: 100,
  },
  aiSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSendBtnDisabled: {
    backgroundColor: COLORS.border,
  },

  // Profile Screen Styles
  profileScreenHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  profileScreenAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  profileScreenName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileScreenRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  profileScreenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  profileScreenBadgeText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '500',
  },
  profileStats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  profileStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  profileStatDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  profileMenu: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 8,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  profileMenuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMenuLabel: {
    fontSize: 15,
    color: COLORS.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
  },
  logoutBtnText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '600',
  },

  // Family Dashboard Specific Styles
  familyPatientCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  familyPatientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  familyPatientPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 14,
  },
  familyPatientInfo: {
    flex: 1,
  },
  familyPatientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  familyPatientRelation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  familyPatientStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '500',
  },
  familyPatientCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  caregiverOnDuty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  caregiverMiniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  caregiverOnDutyLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  caregiverOnDutyName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  messageCaregiverBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyQuickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  familyQuickActionBtn: {
    alignItems: 'center',
  },
  familyQuickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  familyQuickActionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  progressSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  familyVitalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    width: 90,
    marginRight: 10,
  },
  familyVitalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  familyVitalLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Timeline Styles
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLine: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    zIndex: 1,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: -2,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  timelineTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  timelineStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timelineStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  timelineDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  timelinePhotoContainer: {
    marginTop: 10,
  },
  timelinePhoto: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  timelinePhotoCaption: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  timelineNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    gap: 8,
  },
  timelineNotesText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Request Task Modal Styles
  requestModalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  prioritySelectorBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  prioritySelectorText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  suggestionContainer: {
    marginBottom: 20,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  suggestionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionTag: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionTagText: {
    fontSize: 13,
    color: COLORS.text,
  },
  submitRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  submitRequestBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },

  // Updates Screen Styles
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterBtnText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  updatesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  updatesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  updateCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  updateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  updateDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  updateDataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
  },
  updateDataItem: {
    flexDirection: 'row',
    gap: 4,
  },
  updateDataLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  updateDataValue: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  updateMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  updateTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  updateCaregiver: {
    fontSize: 11,
    color: COLORS.primary,
  },

  // Family Incidents Screen
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#dbeafe',
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.info,
    lineHeight: 18,
  },
  familyIncidentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  familyIncidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  familyIncidentSeverity: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  familyIncidentSeverityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  familyIncidentDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  familyIncidentTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  familyIncidentType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  familyIncidentDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  familyIncidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  familyIncidentStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  familyIncidentStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reporterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reporterName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  contactCaregiverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    gap: 10,
  },
  contactCaregiverBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },

  // Family Profile Screen
  familyPatientInfoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  familyPatientInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  familyPatientInfoPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  familyPatientInfoName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  familyPatientInfoDetails: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
