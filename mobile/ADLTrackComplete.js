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
