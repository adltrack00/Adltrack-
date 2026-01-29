// ADLTrack - Complete Expo Snack Version
// EXACT REPLICA of Web App
// Copy this entire file to: https://snack.expo.dev

import React, { useState, createContext, useContext, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
  Dimensions,
  Animated,
  Switch,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// ============ THEME CONTEXT ============
const ThemeContext = createContext();

const colors = {
  dark: {
    background: '#0c0a09',
    card: '#1c1917',
    cardHover: '#292524',
    text: '#ffffff',
    textSecondary: '#a8a29e',
    textMuted: '#78716c',
    border: '#44403c',
    primary: '#25D366',
    primaryHover: '#20bd5a',
    danger: '#f43f5e',
    dangerLight: '#2d1f1f',
    orange: '#f97316',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    amber: '#f59e0b',
  },
  light: {
    background: '#ffffff',
    card: '#ffffff',
    cardHover: '#f5f5f4',
    text: '#1c1917',
    textSecondary: '#78716c',
    textMuted: '#a8a29e',
    border: '#e7e5e4',
    primary: '#25D366',
    primaryHover: '#20bd5a',
    danger: '#f43f5e',
    dangerLight: '#fef2f2',
    orange: '#f97316',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    amber: '#f59e0b',
  },
};

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? colors.dark : colors.light;
  const toggleTheme = () => setIsDark(!isDark);
  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// ============ AUTH CONTEXT ============
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };
  
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ============ COMPREHENSIVE MOCK DATA ============
const PATIENT = {
  id: 'patient-1',
  name: 'David Smith',
  age: 78,
  photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
  conditions: ['Type 2 Diabetes', 'Hypertension', 'Mild Cognitive Impairment'],
  allergies: ['Penicillin', 'Shellfish'],
  medications: [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
    { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
  ],
  emergencyContact: {
    name: 'Mary Smith',
    relationship: 'Daughter',
    phone: '(555) 234-5678',
  },
  dietaryRestrictions: ['Low sodium', 'Diabetic diet'],
  mobilityStatus: 'Uses walker for ambulation',
};

const CAREGIVER = {
  id: 'caregiver-1',
  name: 'Julia Martinez',
  role: 'Certified Nursing Assistant',
  photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop',
  certifications: ['CNA', 'CPR/First Aid', 'Dementia Care'],
  rating: 4.9,
  shiftsCompleted: 234,
};

// Full task list matching web app
const TASKS = [
  {
    id: '1',
    title: 'Morning Medication',
    description: 'Administer prescribed medications with breakfast',
    instructions: 'Give 2 tablets of Metformin with food. Ensure patient drinks full glass of water.',
    scheduledTime: '08:00 AM',
    timeWindow: '7:30 AM - 9:00 AM',
    priority: 'critical',
    status: 'pending',
    requiresPhoto: true,
  },
  {
    id: '2',
    title: 'Breakfast Assistance',
    description: 'Help with breakfast preparation and eating',
    instructions: 'Prepare oatmeal with fruit. Assist with eating if needed. Monitor food intake.',
    scheduledTime: '08:30 AM',
    timeWindow: '8:00 AM - 9:30 AM',
    priority: 'standard',
    status: 'pending',
    requiresPhoto: false,
  },
  {
    id: '3',
    title: 'Morning Walk',
    description: '15-minute assisted walk around the house',
    instructions: 'Use walker for support. Take breaks as needed. Watch for signs of fatigue.',
    scheduledTime: '10:00 AM',
    timeWindow: '9:30 AM - 11:00 AM',
    priority: 'quality',
    status: 'pending',
    requiresPhoto: false,
  },
  {
    id: '4',
    title: 'Blood Pressure Check',
    description: 'Take and record blood pressure reading',
    instructions: 'Patient should be seated and rested for 5 minutes before taking reading.',
    scheduledTime: '10:30 AM',
    timeWindow: '10:00 AM - 11:30 AM',
    priority: 'critical',
    status: 'pending',
    requiresPhoto: true,
  },
  {
    id: '5',
    title: 'Hydration Check',
    description: 'Ensure patient drinks water',
    instructions: 'Offer 8oz glass of water. Track fluid intake.',
    scheduledTime: '11:00 AM',
    timeWindow: '10:30 AM - 12:00 PM',
    priority: 'standard',
    status: 'pending',
    requiresPhoto: false,
  },
  {
    id: '6',
    title: 'Lunch Preparation',
    description: 'Prepare and serve lunch',
    instructions: 'Follow dietary restrictions. Ensure soft foods for easier eating.',
    scheduledTime: '12:00 PM',
    timeWindow: '11:30 AM - 1:00 PM',
    priority: 'standard',
    status: 'pending',
    requiresPhoto: true,
  },
  {
    id: '7',
    title: 'Afternoon Medication',
    description: 'Administer afternoon medications',
    instructions: 'Give blood pressure medication with lunch. Check for any adverse reactions.',
    scheduledTime: '12:30 PM',
    timeWindow: '12:00 PM - 1:30 PM',
    priority: 'critical',
    status: 'pending',
    requiresPhoto: true,
  },
  {
    id: '8',
    title: 'Rest Period',
    description: 'Assist with afternoon rest',
    instructions: 'Help patient to bed for afternoon nap. Ensure comfortable position.',
    scheduledTime: '2:00 PM',
    timeWindow: '1:30 PM - 3:00 PM',
    priority: 'quality',
    status: 'pending',
    requiresPhoto: false,
  },
  {
    id: '9',
    title: 'Physical Therapy Exercises',
    description: 'Guide through prescribed exercises',
    instructions: 'Follow PT protocol sheet. 10 reps of each exercise. Stop if patient reports pain.',
    scheduledTime: '3:30 PM',
    timeWindow: '3:00 PM - 4:30 PM',
    priority: 'standard',
    status: 'pending',
    requiresPhoto: false,
  },
  {
    id: '10',
    title: 'Evening Medication',
    description: 'Administer evening medications',
    instructions: 'Give heart medication and vitamins. Ensure taken with food.',
    scheduledTime: '5:00 PM',
    timeWindow: '4:30 PM - 6:00 PM',
    priority: 'critical',
    status: 'pending',
    requiresPhoto: true,
  },
  {
    id: '11',
    title: 'Dinner Service',
    description: 'Prepare and serve dinner',
    instructions: 'Prepare balanced meal according to dietary plan. Assist with eating as needed.',
    scheduledTime: '6:00 PM',
    timeWindow: '5:30 PM - 7:00 PM',
    priority: 'standard',
    status: 'pending',
    requiresPhoto: true,
  },
  {
    id: '12',
    title: 'Bedtime Routine',
    description: 'Assist with bedtime preparation',
    instructions: 'Help with brushing teeth, changing into pajamas. Ensure bedroom is comfortable.',
    scheduledTime: '8:00 PM',
    timeWindow: '7:30 PM - 9:00 PM',
    priority: 'standard',
    status: 'pending',
    requiresPhoto: false,
  },
];

// Proposed tasks from family
const PROPOSED_TASKS = [
  {
    id: 'p1',
    title: 'Extra Walk in Garden',
    description: 'Take a short walk in the backyard garden',
    instructions: 'Weather permitting, help David walk to see the flowers. He enjoys this.',
    scheduledTime: '4:00 PM',
    priority: 'quality',
    status: 'proposed',
    requiresPhoto: true,
    proposedBy: 'Mary Smith (Daughter)',
  },
  {
    id: 'p2',
    title: 'Video Call with Grandchildren',
    description: 'Help set up tablet for video call',
    instructions: 'The grandkids want to say hi! Help David use the tablet to video call.',
    scheduledTime: '5:30 PM',
    priority: 'quality',
    status: 'proposed',
    requiresPhoto: false,
    proposedBy: 'Tom Smith (Son)',
  },
];

const VITALS = {
  bloodPressure: [
    { date: 'Mon', systolic: 122, diastolic: 78, time: '10:30 AM' },
    { date: 'Tue', systolic: 118, diastolic: 76, time: '10:15 AM' },
    { date: 'Wed', systolic: 125, diastolic: 80, time: '10:45 AM' },
    { date: 'Thu', systolic: 120, diastolic: 77, time: '10:30 AM' },
    { date: 'Fri', systolic: 119, diastolic: 75, time: '10:20 AM' },
    { date: 'Sat', systolic: 121, diastolic: 78, time: '10:35 AM' },
    { date: 'Sun', systolic: 120, diastolic: 76, time: '10:30 AM' },
  ],
  heartRate: [
    { date: 'Mon', value: 72, time: '10:30 AM' },
    { date: 'Tue', value: 68, time: '10:15 AM' },
    { date: 'Wed', value: 75, time: '10:45 AM' },
    { date: 'Thu', value: 70, time: '10:30 AM' },
    { date: 'Fri', value: 71, time: '10:20 AM' },
    { date: 'Sat', value: 69, time: '10:35 AM' },
    { date: 'Sun', value: 72, time: '10:30 AM' },
  ],
  temperature: [
    { date: 'Mon', value: 98.4, time: '10:30 AM' },
    { date: 'Tue', value: 98.6, time: '10:15 AM' },
    { date: 'Wed', value: 98.2, time: '10:45 AM' },
    { date: 'Thu', value: 98.5, time: '10:30 AM' },
    { date: 'Fri', value: 98.7, time: '10:20 AM' },
    { date: 'Sat', value: 98.4, time: '10:35 AM' },
    { date: 'Sun', value: 98.6, time: '10:30 AM' },
  ],
  pain: [
    { date: 'Mon', value: 2, time: '10:30 AM' },
    { date: 'Tue', value: 3, time: '10:15 AM' },
    { date: 'Wed', value: 2, time: '10:45 AM' },
    { date: 'Thu', value: 1, time: '10:30 AM' },
    { date: 'Fri', value: 2, time: '10:20 AM' },
    { date: 'Sat', value: 2, time: '10:35 AM' },
    { date: 'Sun', value: 1, time: '10:30 AM' },
  ],
};

const INCIDENTS = [
  {
    id: 1,
    type: 'fall',
    severity: 'low',
    title: 'Minor Fall in Bathroom',
    description: 'Patient slipped while getting out of shower. No visible injuries.',
    actionsTaken: 'Helped patient up, checked for injuries, monitored for 30 minutes.',
    photos: [],
    status: 'resolved',
    createdAt: '2025-01-15T14:30:00Z',
    createdBy: 'Julia Martinez',
    notifyFamily: true,
  },
  {
    id: 2,
    type: 'behavioral',
    severity: 'medium',
    title: 'Increased Confusion Episode',
    description: 'Patient showed signs of confusion about time and location this afternoon.',
    actionsTaken: 'Reoriented patient, stayed calm, documented episode duration.',
    photos: [],
    status: 'open',
    createdAt: '2025-01-16T16:45:00Z',
    createdBy: 'Julia Martinez',
    notifyFamily: true,
  },
];

const INCIDENT_TYPES = [
  { id: 'fall', label: 'Fall', icon: 'alert-circle', color: '#f43f5e' },
  { id: 'medication', label: 'Medication Issue', icon: 'medical', color: '#f97316' },
  { id: 'behavioral', label: 'Behavioral Change', icon: 'brain', color: '#8b5cf6' },
  { id: 'injury', label: 'Injury', icon: 'bandage', color: '#ef4444' },
  { id: 'vital', label: 'Vital Sign Concern', icon: 'thermometer', color: '#3b82f6' },
  { id: 'other', label: 'Other', icon: 'help-circle', color: '#78716c' },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Low', color: '#22c55e' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'high', label: 'High', color: '#f97316' },
  { id: 'critical', label: 'Critical', color: '#f43f5e' },
];

// ============ LANDING SCREEN ============
const LandingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.landingContainer}>
      <LinearGradient colors={['#ffffff', '#f0fdf4', '#dcfce7']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.landingHeader}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="pulse" size={24} color="#ffffff" />
            </View>
            <Text style={styles.logoText}>ADLTrack</Text>
          </View>
          <TouchableOpacity style={styles.signInBtn}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.tagline}>Simple. Secure.</Text>
          <Text style={styles.taglineAccent}>Reliable Care.</Text>
          <Text style={styles.heroDesc}>
            The caregiving coordination app that brings families, caregivers, and agencies together.
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('RoleSelection')}
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresRow}>
          {[
            { icon: 'checkmark-circle', title: 'Task Management', desc: 'Track daily care' },
            { icon: 'heart', title: 'Vitals Monitoring', desc: 'Health data' },
            { icon: 'chatbubbles', title: 'Communication', desc: 'Stay connected' },
          ].map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={24} color="#25D366" />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* Trust Badge */}
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={20} color="#25D366" />
          <Text style={styles.trustText}>HIPAA Compliant & Secure</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

// ============ ROLE SELECTION ============
const RoleSelectionScreen = ({ navigation }) => {
  const { setIsDark } = useTheme();
  
  const roles = [
    { id: 'caregiver', title: 'Caregiver', desc: 'Professional caregivers managing patient care', icon: 'heart-circle', color: '#25D366', dark: true },
    { id: 'family', title: 'Family Member', desc: 'Family guardians monitoring loved ones', icon: 'people', color: '#3b82f6', dark: false },
    { id: 'agency', title: 'Agency', desc: 'Healthcare agencies managing staff', icon: 'business', color: '#8b5cf6', dark: false },
  ];

  const selectRole = (role) => {
    setIsDark(role.dark);
    navigation.navigate('Auth', { role: role.id });
  };

  return (
    <SafeAreaView style={styles.roleContainer}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#1c1917" />
      </TouchableOpacity>
      <Text style={styles.roleTitle}>Choose Your Role</Text>
      <Text style={styles.roleSubtitle}>Select how you'll be using ADLTrack</Text>
      
      <View style={styles.rolesContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={styles.roleCard}
            onPress={() => selectRole(role)}
          >
            <View style={[styles.roleIcon, { backgroundColor: `${role.color}15` }]}>
              <Ionicons name={role.icon} size={32} color={role.color} />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleCardTitle}>{role.title}</Text>
              <Text style={styles.roleCardDesc}>{role.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#a8a29e" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.roleFooter}>
        <Text style={styles.roleFooterText}>You can switch roles anytime from settings</Text>
      </View>
    </SafeAreaView>
  );
};

// ============ AUTH SCREEN ============
const AuthScreen = ({ navigation, route }) => {
  const { login } = useAuth();
  const { setIsDark } = useTheme();
  const role = route.params?.role || 'caregiver';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const roleConfig = {
    caregiver: { title: 'Caregiver', color: '#25D366' },
    family: { title: 'Family Member', color: '#3b82f6' },
    agency: { title: 'Agency', color: '#8b5cf6' },
  };

  const config = roleConfig[role];

  const handleLogin = () => {
    setIsDark(role === 'caregiver');
    login({ name: 'Julia Martinez', role, photo: CAREGIVER.photo });
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1c1917" />
        </TouchableOpacity>
        
        <View style={[styles.roleTag, { backgroundColor: `${config.color}15` }]}>
          <Text style={[styles.roleTagText, { color: config.color }]}>{config.title}</Text>
        </View>
        
        <Text style={styles.authTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
        <Text style={styles.authSubtitle}>{isSignUp ? 'Sign up to start managing care' : 'Sign in to continue'}</Text>

        <TouchableOpacity style={styles.socialBtn} onPress={handleLogin}>
          <Ionicons name="logo-google" size={20} color="#1c1917" />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} onPress={handleLogin}>
          <Ionicons name="logo-apple" size={20} color="#1c1917" />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#a8a29e"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#a8a29e"
        />

        <TouchableOpacity style={[styles.loginBtn, { backgroundColor: config.color }]} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
        </TouchableOpacity>

        <View style={styles.toggleAuth}>
          <Text style={styles.toggleAuthText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={[styles.toggleAuthLink, { color: config.color }]}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ TASK CARD COMPONENT ============
const TaskCard = ({ task, onToggle, onStart, isExpanded, theme }) => {
  const isCompleted = task.status === 'completed';
  
  const priorityColors = {
    critical: '#f43f5e',
    standard: '#3b82f6',
    quality: '#25D366',
    low: '#78716c',
  };
  
  const stripeColor = isCompleted ? '#25D366' : (priorityColors[task.priority] || '#3b82f6');

  return (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => !isCompleted && onToggle && onToggle(task.id)}
      activeOpacity={0.7}
    >
      {/* Priority Stripe */}
      <View style={[styles.taskStripe, { backgroundColor: stripeColor }]} />
      
      <View style={styles.taskContent}>
        <View style={styles.taskMain}>
          <View style={styles.taskHeader}>
            <Text style={[
              styles.taskTitle, 
              { color: theme.text },
              isCompleted && styles.taskTitleCompleted
            ]}>
              {task.title}
            </Text>
          </View>
          
          <View style={styles.taskMeta}>
            <View style={styles.taskTimeRow}>
              <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
              <Text style={[styles.taskTime, { color: theme.textSecondary }]}>
                {task.scheduledTime}
              </Text>
            </View>
            {task.requiresPhoto && !isCompleted && (
              <View style={[styles.photoBadge, { backgroundColor: theme.cardHover }]}>
                <Ionicons name="camera" size={12} color={theme.textSecondary} />
                <Text style={[styles.photoBadgeText, { color: theme.textSecondary }]}>Photo</Text>
              </View>
            )}
          </View>
          
          {isCompleted && task.completionNote && (
            <Text style={[styles.taskNote, { color: theme.textMuted }]}>
              "{task.completionNote}"
            </Text>
          )}
        </View>
        
        <View style={styles.taskRight}>
          {task.evidenceUrl && (
            <Image source={{ uri: task.evidenceUrl }} style={styles.taskPhoto} />
          )}
          {!isCompleted && (
            <View style={[styles.taskExpandIcon, { borderColor: theme.border }]}>
              <Ionicons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color={theme.textMuted} 
              />
            </View>
          )}
        </View>
      </View>

      {/* Expanded Content */}
      {isExpanded && !isCompleted && (
        <View style={[styles.taskExpanded, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
          <View style={styles.taskExpandedSection}>
            <Text style={[styles.taskExpandedLabel, { color: theme.textMuted }]}>INSTRUCTIONS</Text>
            <Text style={[styles.taskExpandedText, { color: theme.textSecondary }]}>
              {task.instructions || task.description}
            </Text>
          </View>
          
          <View style={styles.taskExpandedSection}>
            <Text style={[styles.taskExpandedLabel, { color: theme.textMuted }]}>TIME WINDOW</Text>
            <Text style={[styles.taskExpandedText, { color: theme.textSecondary }]}>
              {task.timeWindow}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.startTaskBtn}
            onPress={() => onStart && onStart(task)}
          >
            <Text style={styles.startTaskBtnText}>Start Task</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ============ TASK REQUEST CARD ============
const TaskRequestCard = ({ task, onAccept, onDecline, theme }) => (
  <View style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <View style={[styles.requestStripe, { backgroundColor: '#25D366' }]} />
    
    <View style={styles.requestContent}>
      <View style={styles.requestHeader}>
        <View style={[styles.requestBadge, { backgroundColor: `${theme.primary}20` }]}>
          <Text style={[styles.requestBadgeText, { color: theme.primary }]}>REQUEST</Text>
        </View>
        <Text style={[styles.requestTime, { color: theme.textSecondary }]}>{task.scheduledTime}</Text>
      </View>
      
      <Text style={[styles.requestTitle, { color: theme.text }]}>{task.title}</Text>
      <Text style={[styles.requestDesc, { color: theme.textSecondary }]}>{task.description}</Text>
      <Text style={[styles.requestBy, { color: theme.textMuted }]}>From: {task.proposedBy}</Text>
      
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.requestDeclineBtn, { borderColor: theme.border }]}
          onPress={() => onDecline && onDecline(task.id)}
        >
          <Text style={[styles.requestDeclineText, { color: theme.textSecondary }]}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.requestAcceptBtn}
          onPress={() => onAccept && onAccept(task.id)}
        >
          <Text style={styles.requestAcceptText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ============ HOME SCREEN - CAREGIVER ============
const HomeScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [tasks, setTasks] = useState(TASKS);
  const [proposedTasks, setProposedTasks] = useState(PROPOSED_TASKS);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const latestBP = VITALS.bloodPressure[VITALS.bloodPressure.length - 1];
  const latestHR = VITALS.heartRate[VITALS.heartRate.length - 1];
  const latestTemp = VITALS.temperature[VITALS.temperature.length - 1];
  const latestPain = VITALS.pain[VITALS.pain.length - 1];

  const startShift = () => {
    setIsShiftActive(true);
    setShiftStartTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
  };

  const toggleTask = (id) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const handleStartTask = (task) => {
    setSelectedTask(task);
  };

  const handleCompleteTask = (note) => {
    if (selectedTask) {
      setTasks(tasks.map(t => 
        t.id === selectedTask.id 
          ? { ...t, status: 'completed', completionNote: note, completedAt: new Date().toLocaleTimeString() }
          : t
      ));
      setSelectedTask(null);
      setExpandedTaskId(null);
    }
  };

  const handleAcceptRequest = (id) => {
    const request = proposedTasks.find(t => t.id === id);
    if (request) {
      setTasks([...tasks, { ...request, status: 'pending' }]);
      setProposedTasks(proposedTasks.filter(t => t.id !== id));
    }
  };

  const handleDeclineRequest = (id) => {
    setProposedTasks(proposedTasks.filter(t => t.id !== id));
  };

  // Offline State - Start Shift Screen
  if (!isShiftActive) {
    return (
      <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
        <View style={styles.offlineContainer}>
          {/* Caregiver Header */}
          <View style={styles.offlineHeader}>
            <Image source={{ uri: CAREGIVER.photo }} style={styles.caregiverPhoto} />
            <View>
              <Text style={[styles.greeting, { color: theme.textMuted }]}>Good morning,</Text>
              <Text style={[styles.caregiverName, { color: theme.text }]}>Julia</Text>
            </View>
          </View>

          {/* Patient Card */}
          <TouchableOpacity 
            style={[styles.patientCardOffline, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setShowPatientProfile(true)}
          >
            <Text style={[styles.patientCardLabel, { color: theme.textMuted }]}>Ready to care for</Text>
            <View style={styles.patientCardRow}>
              <Image source={{ uri: PATIENT.photo }} style={styles.patientPhotoLarge} />
              <View style={styles.patientCardInfo}>
                <Text style={[styles.patientName, { color: theme.text }]}>{PATIENT.name}</Text>
                <Text style={[styles.patientAge, { color: theme.textSecondary }]}>{PATIENT.age} years old</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.textMuted} />
            </View>
          </TouchableOpacity>

          {/* Start Shift Section */}
          <View style={styles.startShiftSection}>
            <Text style={[styles.offlineText, { color: theme.textMuted }]}>You're offline</Text>
            <Text style={[styles.startShiftTitle, { color: theme.text }]}>Tap to start your shift</Text>
            
            <TouchableOpacity style={styles.goButton} onPress={startShift}>
              <View style={styles.goButtonPulse} />
              <LinearGradient
                colors={['#f43f5e', '#e11d48']}
                style={styles.goButtonInner}
              >
                <Ionicons name="play" size={48} color="#ffffff" style={{ marginLeft: 4 }} />
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={[styles.tasksScheduled, { color: theme.textMuted }]}>
              {tasks.length} tasks scheduled for today
            </Text>
          </View>
        </View>

        {/* Patient Profile Modal */}
        <PatientProfileModal 
          visible={showPatientProfile} 
          onClose={() => setShowPatientProfile(false)} 
          theme={theme}
        />
      </SafeAreaView>
    );
  }

  // Online State - Full Dashboard
  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Patient Photo Header with Vitals */}
        <View style={styles.patientHeaderContainer}>
          <Image source={{ uri: PATIENT.photo }} style={styles.patientHeaderPhoto} />
          <LinearGradient
            colors={['transparent', 'rgba(12,10,9,0.6)', 'rgba(12,10,9,0.95)']}
            style={styles.patientHeaderGradient}
          />
          
          <TouchableOpacity 
            style={styles.patientHeaderInfo}
            onPress={() => setShowPatientProfile(true)}
          >
            <View>
              <Text style={styles.patientHeaderName}>{PATIENT.name}</Text>
              <Text style={styles.patientHeaderAge}>{PATIENT.age} years old</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Vitals Grid - Overlapping */}
        <View style={styles.vitalsContainer}>
          <View style={styles.vitalsGrid}>
            <TouchableOpacity 
              style={[styles.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowVitals(true)}
            >
              <View style={[styles.vitalIcon, { backgroundColor: 'rgba(244,63,94,0.2)' }]}>
                <Ionicons name="heart" size={18} color="#f43f5e" />
              </View>
              <Text style={[styles.vitalValue, { color: theme.text }]}>
                {latestBP.systolic}/{latestBP.diastolic}
              </Text>
              <Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>BP</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowVitals(true)}
            >
              <View style={[styles.vitalIcon, { backgroundColor: 'rgba(249,115,22,0.2)' }]}>
                <Ionicons name="pulse" size={18} color="#f97316" />
              </View>
              <Text style={[styles.vitalValue, { color: theme.text }]}>{latestHR.value}</Text>
              <Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>Heart</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowVitals(true)}
            >
              <View style={[styles.vitalIcon, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
                <Ionicons name="thermometer" size={18} color="#3b82f6" />
              </View>
              <Text style={[styles.vitalValue, { color: theme.text }]}>{latestTemp.value}°</Text>
              <Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>Temp</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowVitals(true)}
            >
              <View style={[styles.vitalIcon, { backgroundColor: 'rgba(139,92,246,0.2)' }]}>
                <Ionicons name="sad-outline" size={18} color="#8b5cf6" />
              </View>
              <Text style={[styles.vitalValue, { color: theme.text }]}>{latestPain.value}/10</Text>
              <Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>Pain</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>Today's Progress</Text>
            <Text style={[styles.progressCount, { color: theme.text }]}>{completedCount}/{tasks.length}</Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: theme.cardHover }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }
              ]} 
            />
          </View>
        </View>

        {/* Task Tabs */}
        <View style={styles.taskTabs}>
          <TouchableOpacity onPress={() => setActiveTab('requests')}>
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'requests' ? theme.text : theme.textMuted }
            ]}>
              Requests
              {proposedTasks.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{proposedTasks.length}</Text>
                </View>
              )}
            </Text>
          </TouchableOpacity>
          <View style={[styles.tabDivider, { backgroundColor: theme.border }]} />
          <TouchableOpacity onPress={() => setActiveTab('tasks')}>
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'tasks' ? theme.text : theme.textMuted }
            ]}>
              Today's Tasks
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        <View style={styles.taskList}>
          {activeTab === 'tasks' ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                theme={theme}
                isExpanded={expandedTaskId === task.id}
                onToggle={toggleTask}
                onStart={handleStartTask}
              />
            ))
          ) : (
            proposedTasks.length > 0 ? (
              proposedTasks.map((task) => (
                <TaskRequestCard
                  key={task.id}
                  task={task}
                  theme={theme}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                />
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="sparkles" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>No pending requests</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>

      {/* AI Copilot FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AICopilot')}
      >
        <Ionicons name="sparkles" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        visible={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onComplete={handleCompleteTask}
        theme={theme}
      />

      {/* Patient Profile Modal */}
      <PatientProfileModal 
        visible={showPatientProfile} 
        onClose={() => setShowPatientProfile(false)} 
        theme={theme}
      />

      {/* Vitals Modal */}
      <VitalsModal
        visible={showVitals}
        onClose={() => setShowVitals(false)}
        theme={theme}
      />
    </SafeAreaView>
  );
};

// ============ TASK COMPLETION MODAL ============
const TaskCompletionModal = ({ visible, task, onClose, onComplete, theme }) => {
  const [note, setNote] = useState('');

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Complete Task</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={[styles.taskSummary, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.taskSummaryTitle, { color: theme.text }]}>{task.title}</Text>
            <Text style={[styles.taskSummaryDesc, { color: theme.textSecondary }]}>{task.description}</Text>
          </View>

          {task.requiresPhoto && (
            <View style={styles.photoSection}>
              <Text style={[styles.photoLabel, { color: theme.text }]}>Photo Evidence (Required)</Text>
              <TouchableOpacity style={[styles.photoCapture, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="camera" size={40} color={theme.primary} />
                <Text style={[styles.photoCaptureText, { color: theme.text }]}>Tap to Take Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.noteSection}>
            <Text style={[styles.noteLabel, { color: theme.text }]}>Completion Note</Text>
            <TextInput
              style={[styles.noteInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              placeholder="Add notes about task completion..."
              placeholderTextColor={theme.textMuted}
              multiline
              textAlignVertical="top"
              value={note}
              onChangeText={setNote}
            />
          </View>

          <TouchableOpacity 
            style={styles.completeBtn}
            onPress={() => onComplete(note)}
          >
            <Ionicons name="checkmark-circle" size={22} color="#ffffff" />
            <Text style={styles.completeBtnText}>Mark as Complete</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ============ PATIENT PROFILE MODAL ============
const PatientProfileModal = ({ visible, onClose, theme }) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: theme.text }]}>Patient Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.modalContent}>
        {/* Patient Info Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <Image source={{ uri: PATIENT.photo }} style={styles.profilePhoto} />
          <Text style={[styles.profileName, { color: theme.text }]}>{PATIENT.name}</Text>
          <Text style={[styles.profileAge, { color: theme.textSecondary }]}>{PATIENT.age} years old</Text>
        </View>

        {/* Conditions */}
        <View style={styles.profileSection}>
          <Text style={[styles.profileSectionTitle, { color: theme.text }]}>Medical Conditions</Text>
          <View style={[styles.profileSectionCard, { backgroundColor: theme.card }]}>
            {PATIENT.conditions.map((condition, i) => (
              <View key={i} style={[styles.profileItem, i < PATIENT.conditions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                <Ionicons name="medical" size={18} color={theme.primary} />
                <Text style={[styles.profileItemText, { color: theme.text }]}>{condition}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Allergies */}
        <View style={styles.profileSection}>
          <Text style={[styles.profileSectionTitle, { color: theme.text }]}>Allergies</Text>
          <View style={[styles.profileSectionCard, { backgroundColor: theme.card }]}>
            {PATIENT.allergies.map((allergy, i) => (
              <View key={i} style={[styles.profileItem, i < PATIENT.allergies.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                <Ionicons name="warning" size={18} color={theme.danger} />
                <Text style={[styles.profileItemText, { color: theme.text }]}>{allergy}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Medications */}
        <View style={styles.profileSection}>
          <Text style={[styles.profileSectionTitle, { color: theme.text }]}>Current Medications</Text>
          <View style={[styles.profileSectionCard, { backgroundColor: theme.card }]}>
            {PATIENT.medications.map((med, i) => (
              <View key={i} style={[styles.profileItem, styles.profileItemColumn, i < PATIENT.medications.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                <View style={styles.profileItemHeader}>
                  <Ionicons name="medkit" size={18} color={theme.blue} />
                  <Text style={[styles.profileItemText, { color: theme.text }]}>{med.name}</Text>
                </View>
                <Text style={[styles.profileItemSub, { color: theme.textSecondary }]}>
                  {med.dosage} - {med.frequency}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.profileSection}>
          <Text style={[styles.profileSectionTitle, { color: theme.text }]}>Emergency Contact</Text>
          <View style={[styles.emergencyCard, { backgroundColor: `${theme.danger}15` }]}>
            <View style={styles.emergencyHeader}>
              <Ionicons name="call" size={20} color={theme.danger} />
              <Text style={[styles.emergencyName, { color: theme.text }]}>
                {PATIENT.emergencyContact.name}
              </Text>
            </View>
            <Text style={[styles.emergencyRelation, { color: theme.textSecondary }]}>
              {PATIENT.emergencyContact.relationship}
            </Text>
            <TouchableOpacity style={[styles.callButton, { backgroundColor: theme.danger }]}>
              <Ionicons name="call" size={18} color="#ffffff" />
              <Text style={styles.callButtonText}>{PATIENT.emergencyContact.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  </Modal>
);

// ============ VITALS MODAL ============
const VitalsModal = ({ visible, onClose, theme }) => {
  const [activeVital, setActiveVital] = useState('bp');

  const vitalTabs = [
    { id: 'bp', label: 'BP', icon: 'heart', color: '#f43f5e' },
    { id: 'hr', label: 'Heart', icon: 'pulse', color: '#f97316' },
    { id: 'temp', label: 'Temp', icon: 'thermometer', color: '#3b82f6' },
    { id: 'pain', label: 'Pain', icon: 'sad-outline', color: '#8b5cf6' },
  ];

  const getVitalData = () => {
    switch (activeVital) {
      case 'bp': return VITALS.bloodPressure;
      case 'hr': return VITALS.heartRate;
      case 'temp': return VITALS.temperature;
      case 'pain': return VITALS.pain;
      default: return [];
    }
  };

  const formatValue = (item) => {
    if (activeVital === 'bp') return `${item.systolic}/${item.diastolic}`;
    return item.value;
  };

  const getUnit = () => {
    switch (activeVital) {
      case 'bp': return 'mmHg';
      case 'hr': return 'bpm';
      case 'temp': return '°F';
      case 'pain': return '/10';
      default: return '';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Vitals History</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Vital Tabs */}
        <View style={[styles.vitalTabs, { borderBottomColor: theme.border }]}>
          {vitalTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.vitalTab,
                activeVital === tab.id && { backgroundColor: `${tab.color}20` }
              ]}
              onPress={() => setActiveVital(tab.id)}
            >
              <Ionicons name={tab.icon} size={20} color={activeVital === tab.id ? tab.color : theme.textMuted} />
              <Text style={[
                styles.vitalTabText,
                { color: activeVital === tab.id ? tab.color : theme.textMuted }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Current Value */}
          <View style={[styles.vitalCurrentCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.vitalCurrentLabel, { color: theme.textSecondary }]}>Latest Reading</Text>
            <Text style={[styles.vitalCurrentValue, { color: theme.text }]}>
              {formatValue(getVitalData()[getVitalData().length - 1])}
              <Text style={[styles.vitalCurrentUnit, { color: theme.textSecondary }]}> {getUnit()}</Text>
            </Text>
            <Text style={[styles.vitalCurrentTime, { color: theme.textMuted }]}>
              {getVitalData()[getVitalData().length - 1].time}
            </Text>
          </View>

          {/* History List */}
          <Text style={[styles.vitalHistoryTitle, { color: theme.text }]}>7-Day History</Text>
          <View style={[styles.vitalHistoryCard, { backgroundColor: theme.card }]}>
            {getVitalData().map((item, i) => (
              <View key={i} style={[
                styles.vitalHistoryItem,
                i < getVitalData().length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
              ]}>
                <Text style={[styles.vitalHistoryDate, { color: theme.textSecondary }]}>{item.date}</Text>
                <Text style={[styles.vitalHistoryValue, { color: theme.text }]}>
                  {formatValue(item)} {getUnit()}
                </Text>
                <Text style={[styles.vitalHistoryTime, { color: theme.textMuted }]}>{item.time}</Text>
              </View>
            ))}
          </View>

          {/* Record New Button */}
          <TouchableOpacity style={styles.recordVitalBtn}>
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.recordVitalBtnText}>Record New</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// Continue in next part...
// ============ INCIDENT SCREEN ============
const IncidentScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [incidents, setIncidents] = useState(INCIDENTS);
  const [showNewIncident, setShowNewIncident] = useState(false);
  const [step, setStep] = useState(1);
  const [incidentType, setIncidentType] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [description, setDescription] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [notifyFamily, setNotifyFamily] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const openIncidents = incidents.filter(i => i.status === 'open').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;

  const resetForm = () => {
    setStep(1);
    setIncidentType(null);
    setSeverity(null);
    setDescription('');
    setActionsTaken('');
    setNotifyFamily(true);
    setSubmitted(false);
    setShowNewIncident(false);
  };

  const handleSubmit = () => {
    const newIncident = {
      id: Date.now(),
      type: incidentType,
      severity,
      title: INCIDENT_TYPES.find(t => t.id === incidentType)?.label + ' Incident',
      description,
      actionsTaken,
      photos: [],
      status: 'open',
      createdAt: new Date().toISOString(),
      createdBy: CAREGIVER.name,
      notifyFamily,
    };
    setIncidents([newIncident, ...incidents]);
    setSubmitted(true);
  };

  const getTypeIcon = (type) => {
    const found = INCIDENT_TYPES.find(t => t.id === type);
    return found?.icon || 'alert-circle';
  };

  const getTypeColor = (type) => {
    const found = INCIDENT_TYPES.find(t => t.id === type);
    return found?.color || '#f43f5e';
  };

  const getSeverityColor = (sev) => {
    const found = SEVERITY_LEVELS.find(s => s.id === sev);
    return found?.color || '#f43f5e';
  };

  // Success screen
  if (submitted) {
    return (
      <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successCard, { backgroundColor: theme.card }]}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={48} color={theme.primary} />
            </View>
            <Text style={[styles.successTitle, { color: theme.text }]}>Report Submitted</Text>
            <Text style={[styles.successDesc, { color: theme.textSecondary }]}>
              {notifyFamily 
                ? "Incident documented and family has been notified."
                : "Incident documented successfully."}
            </Text>
            <TouchableOpacity style={styles.successBtn} onPress={resetForm}>
              <Text style={styles.successBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // New Incident Form
  if (showNewIncident) {
    return (
      <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.incidentFormHeader, { borderBottomColor: theme.border }]}>
          <View style={styles.incidentFormHeaderLeft}>
            <View style={styles.incidentFormIcon}>
              <Ionicons name="alert-triangle" size={20} color="#f43f5e" />
            </View>
            <View>
              <Text style={[styles.incidentFormTitle, { color: theme.text }]}>New Incident Report</Text>
              <Text style={[styles.incidentFormStep, { color: theme.textMuted }]}>Step {step} of 4</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.cancelBtn, { backgroundColor: theme.cardHover }]}
            onPress={() => setShowNewIncident(false)}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.stepProgress}>
          {[1, 2, 3, 4].map((s) => (
            <View 
              key={s} 
              style={[
                styles.stepDot, 
                { backgroundColor: s <= step ? '#f43f5e' : theme.border }
              ]} 
            />
          ))}
        </View>

        <ScrollView style={styles.incidentFormContent}>
          {/* Step 1: Incident Type */}
          {step === 1 && (
            <>
              <Text style={[styles.stepTitle, { color: theme.text }]}>What type of incident?</Text>
              <View style={styles.typeGrid}>
                {INCIDENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeCard,
                      { backgroundColor: theme.card, borderColor: incidentType === type.id ? type.color : theme.border },
                      incidentType === type.id && { borderWidth: 2 }
                    ]}
                    onPress={() => setIncidentType(type.id)}
                  >
                    <View style={[styles.typeIconContainer, { backgroundColor: `${type.color}20` }]}>
                      <Ionicons name={type.icon} size={28} color={type.color} />
                    </View>
                    <Text style={[styles.typeLabel, { color: theme.text }]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {incidentType && (
                <TouchableOpacity 
                  style={styles.nextBtn}
                  onPress={() => setStep(2)}
                >
                  <Text style={styles.nextBtnText}>Continue</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Step 2: Severity */}
          {step === 2 && (
            <>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Severity level?</Text>
              <View style={styles.severityList}>
                {SEVERITY_LEVELS.map((sev) => (
                  <TouchableOpacity
                    key={sev.id}
                    style={[
                      styles.severityCard,
                      { backgroundColor: theme.card, borderColor: severity === sev.id ? sev.color : theme.border },
                      severity === sev.id && { borderWidth: 2 }
                    ]}
                    onPress={() => setSeverity(sev.id)}
                  >
                    <View style={[styles.severityDot, { backgroundColor: sev.color }]} />
                    <Text style={[styles.severityLabel, { color: theme.text }]}>{sev.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.stepNav}>
                <TouchableOpacity style={[styles.backStepBtn, { borderColor: theme.border }]} onPress={() => setStep(1)}>
                  <Text style={[styles.backStepBtnText, { color: theme.textSecondary }]}>Back</Text>
                </TouchableOpacity>
                {severity && (
                  <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(3)}>
                    <Text style={styles.nextBtnText}>Continue</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Describe what happened</Text>
              
              <Text style={[styles.inputLabel, { color: theme.text }]}>Description</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="What happened? Be specific..."
                placeholderTextColor={theme.textMuted}
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />

              <Text style={[styles.inputLabel, { color: theme.text }]}>Actions Taken</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="What actions did you take?"
                placeholderTextColor={theme.textMuted}
                multiline
                textAlignVertical="top"
                value={actionsTaken}
                onChangeText={setActionsTaken}
              />

              <View style={styles.stepNav}>
                <TouchableOpacity style={[styles.backStepBtn, { borderColor: theme.border }]} onPress={() => setStep(2)}>
                  <Text style={[styles.backStepBtnText, { color: theme.textSecondary }]}>Back</Text>
                </TouchableOpacity>
                {description.trim() && (
                  <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(4)}>
                    <Text style={styles.nextBtnText}>Continue</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Review & Submit</Text>
              
              {/* Summary Card */}
              <View style={[styles.reviewCard, { backgroundColor: theme.card }]}>
                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Type</Text>
                  <View style={styles.reviewValue}>
                    <Ionicons name={getTypeIcon(incidentType)} size={16} color={getTypeColor(incidentType)} />
                    <Text style={[styles.reviewValueText, { color: theme.text }]}>
                      {INCIDENT_TYPES.find(t => t.id === incidentType)?.label}
                    </Text>
                  </View>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Severity</Text>
                  <View style={[styles.severityBadge, { backgroundColor: `${getSeverityColor(severity)}20` }]}>
                    <Text style={[styles.severityBadgeText, { color: getSeverityColor(severity) }]}>
                      {SEVERITY_LEVELS.find(s => s.id === severity)?.label}
                    </Text>
                  </View>
                </View>
                <View style={styles.reviewRowFull}>
                  <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Description</Text>
                  <Text style={[styles.reviewDesc, { color: theme.text }]}>{description}</Text>
                </View>
                {actionsTaken && (
                  <View style={styles.reviewRowFull}>
                    <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Actions Taken</Text>
                    <Text style={[styles.reviewDesc, { color: theme.text }]}>{actionsTaken}</Text>
                  </View>
                )}
              </View>

              {/* Notify Family Toggle */}
              <View style={[styles.toggleCard, { backgroundColor: theme.card }]}>
                <View style={styles.toggleContent}>
                  <Ionicons name="people" size={24} color={theme.primary} />
                  <View style={styles.toggleText}>
                    <Text style={[styles.toggleTitle, { color: theme.text }]}>Notify Family</Text>
                    <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>
                      Send alert to {PATIENT.emergencyContact.name}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notifyFamily}
                  onValueChange={setNotifyFamily}
                  trackColor={{ false: theme.border, true: `${theme.primary}50` }}
                  thumbColor={notifyFamily ? theme.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.stepNav}>
                <TouchableOpacity style={[styles.backStepBtn, { borderColor: theme.border }]} onPress={() => setStep(3)}>
                  <Text style={[styles.backStepBtnText, { color: theme.textSecondary }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Text style={styles.submitBtnText}>Submit Report</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Incident History View
  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.incidentScroll}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Incidents</Text>
        <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
          Report and track incidents for {PATIENT.name}
        </Text>

        {/* New Incident Button */}
        <TouchableOpacity
          style={styles.newIncidentBtn}
          onPress={() => setShowNewIncident(true)}
        >
          <View style={styles.newIncidentContent}>
            <View style={styles.newIncidentIcon}>
              <Ionicons name="add-circle" size={28} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.newIncidentTitle}>New Incident Report</Text>
              <Text style={styles.newIncidentSubtitle}>Document and report an incident</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ffffff" />
        </TouchableOpacity>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryNum, { color: theme.text }]}>{incidents.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryNum, { color: theme.danger }]}>{openIncidents}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Open</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryNum, { color: theme.primary }]}>{resolvedIncidents}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Resolved</Text>
          </View>
        </View>

        {/* Incidents List */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Past Reports</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{incidents.length}</Text>
          </View>
        </View>

        {incidents.map((incident) => (
          <View key={incident.id} style={[styles.incidentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.incidentCardHeader}>
              <View style={styles.incidentCardLeft}>
                <View style={[styles.incidentTypeIcon, { backgroundColor: `${getTypeColor(incident.type)}20` }]}>
                  <Ionicons name={getTypeIcon(incident.type)} size={20} color={getTypeColor(incident.type)} />
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: incident.status === 'open' ? theme.danger : theme.primary }
                ]}>
                  <Text style={styles.statusBadgeText}>{incident.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={[styles.incidentDate, { color: theme.textSecondary }]}>
                {new Date(incident.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[styles.incidentCardTitle, { color: theme.text }]}>{incident.title}</Text>
            <Text style={[styles.incidentCardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
              {incident.description}
            </Text>
            <Text style={[styles.incidentCardBy, { color: theme.textMuted }]}>
              Reported by {incident.createdBy}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ MESSAGE SCREEN ============
const MessageScreen = () => {
  const { theme } = useTheme();
  
  const conversations = [
    { id: '1', name: 'Mary Smith', role: 'Family Guardian (Daughter)', message: 'Thank you for the update on dad!', time: '10:30 AM', unread: 2, avatar: 'MS' },
    { id: '2', name: 'Dr. Rebecca Johnson', role: 'Primary Care Physician', message: 'Please monitor the blood pressure closely', time: 'Yesterday', unread: 0, avatar: 'RJ' },
    { id: '3', name: 'Tom Smith', role: 'Family Member (Son)', message: 'Can you help dad video call us today?', time: 'Yesterday', unread: 1, avatar: 'TS' },
    { id: '4', name: 'CareFirst Agency', role: 'Agency', message: 'Your schedule for next week is ready', time: 'Jan 15', unread: 0, avatar: 'CF' },
  ];

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <View style={styles.messageHeader}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Messages</Text>
        <TouchableOpacity style={[styles.newMessageBtn, { backgroundColor: theme.primary }]}>
          <Ionicons name="create-outline" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Patient Context */}
      <View style={[styles.patientContext, { backgroundColor: theme.card }]}>
        <Ionicons name="person" size={16} color={theme.textSecondary} />
        <Text style={[styles.patientContextText, { color: theme.textSecondary }]}>
          Messages regarding {PATIENT.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.messageList}>
        {conversations.map((conv) => (
          <TouchableOpacity
            key={conv.id}
            style={[styles.conversationCard, { backgroundColor: theme.card }]}
          >
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>{conv.avatar}</Text>
            </View>
            <View style={styles.conversationInfo}>
              <View style={styles.conversationHeader}>
                <Text style={[styles.conversationName, { color: theme.text }]}>{conv.name}</Text>
                <Text style={[styles.conversationTime, { color: theme.textSecondary }]}>{conv.time}</Text>
              </View>
              <Text style={[styles.conversationRole, { color: theme.textMuted }]}>{conv.role}</Text>
              <Text style={[styles.conversationMessage, { color: theme.textSecondary }]} numberOfLines={1}>
                {conv.message}
              </Text>
            </View>
            {conv.unread > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.unreadText}>{conv.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ SHIFTS SCREEN ============
const ShiftsScreen = () => {
  const { theme } = useTheme();
  const [isActive, setIsActive] = useState(true);
  const [startTime] = useState('8:00 AM');

  const recentShifts = [
    { date: 'Today', hours: '4.5h', status: 'In Progress', earnings: '$67.50' },
    { date: 'Yesterday', hours: '8h', status: 'Completed', earnings: '$120.00' },
    { date: 'Jan 15', hours: '6h', status: 'Completed', earnings: '$90.00' },
    { date: 'Jan 14', hours: '8h', status: 'Completed', earnings: '$120.00' },
    { date: 'Jan 13', hours: '7.5h', status: 'Completed', earnings: '$112.50' },
  ];

  const quickActions = [
    { id: 'earnings', label: 'View Earnings', icon: 'cash', color: theme.primary },
    { id: 'history', label: 'Shift History', icon: 'time', color: theme.blue },
    { id: 'schedule', label: 'My Schedule', icon: 'calendar', color: theme.purple },
  ];

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.shiftScroll}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Shifts</Text>
        <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
          Manage your work schedule
        </Text>

        {/* Current Shift Card */}
        <View style={[
          styles.shiftCard, 
          { backgroundColor: isActive ? theme.primary : theme.card, borderColor: isActive ? theme.primaryHover : theme.border }
        ]}>
          <View style={styles.shiftCardHeader}>
            <View style={styles.shiftStatus}>
              <View style={[styles.statusDot, { backgroundColor: isActive ? '#ffffff' : theme.textSecondary }]} />
              <Text style={[styles.shiftStatusText, { color: isActive ? '#ffffff' : theme.text }]}>
                {isActive ? 'Shift Active' : 'No Active Shift'}
              </Text>
            </View>
            {isActive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveIndicator} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>

          {isActive && (
            <View style={styles.shiftDetails}>
              <View style={styles.shiftDetailRow}>
                <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.7)" />
                <View style={styles.shiftDetailText}>
                  <Text style={styles.shiftDetailLabel}>Started at</Text>
                  <Text style={styles.shiftDetailValue}>{startTime}</Text>
                </View>
              </View>
              <View style={styles.shiftDetailRow}>
                <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.7)" />
                <View style={styles.shiftDetailText}>
                  <Text style={styles.shiftDetailLabel}>Patient</Text>
                  <Text style={styles.shiftDetailValue}>{PATIENT.name}</Text>
                </View>
              </View>
              <View style={styles.shiftDetailRow}>
                <Ionicons name="checkmark-circle-outline" size={18} color="rgba(255,255,255,0.7)" />
                <View style={styles.shiftDetailText}>
                  <Text style={styles.shiftDetailLabel}>Tasks Done</Text>
                  <Text style={styles.shiftDetailValue}>3/12</Text>
                </View>
              </View>
              <View style={styles.shiftDetailRow}>
                <Ionicons name="hourglass-outline" size={18} color="rgba(255,255,255,0.7)" />
                <View style={styles.shiftDetailText}>
                  <Text style={styles.shiftDetailLabel}>Elapsed</Text>
                  <Text style={styles.shiftDetailValue}>4h 30m</Text>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.shiftToggleBtn,
              { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : theme.danger }
            ]}
            onPress={() => setIsActive(!isActive)}
          >
            <Ionicons name={isActive ? 'stop' : 'play'} size={20} color="#ffffff" />
            <Text style={styles.shiftToggleBtnText}>
              {isActive ? 'End Shift' : 'Start Shift'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionCard, { backgroundColor: theme.card }]}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: theme.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Shifts */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Recent Shifts</Text>
        <View style={[styles.recentShiftsCard, { backgroundColor: theme.card }]}>
          {recentShifts.map((shift, index) => (
            <View
              key={index}
              style={[
                styles.shiftRow,
                index < recentShifts.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
              ]}
            >
              <View>
                <Text style={[styles.shiftDate, { color: theme.text }]}>{shift.date}</Text>
                <Text style={[styles.shiftHours, { color: theme.textSecondary }]}>
                  {shift.hours} • {shift.status}
                </Text>
              </View>
              <Text style={[styles.shiftEarnings, { color: theme.primary }]}>{shift.earnings}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Earnings */}
        <View style={[styles.earningsCard, { backgroundColor: theme.card }]}>
          <View style={styles.earningsHeader}>
            <Ionicons name="wallet" size={24} color={theme.primary} />
            <Text style={[styles.earningsTitle, { color: theme.text }]}>This Week</Text>
          </View>
          <Text style={[styles.earningsAmount, { color: theme.primary }]}>$510.00</Text>
          <Text style={[styles.earningsSubtext, { color: theme.textSecondary }]}>34 hours worked</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ MENU SCREEN ============
const MenuScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'earnings', label: 'Earnings', icon: 'cash-outline', color: theme.primary },
    { id: 'history', label: 'Shift History', icon: 'time-outline', color: theme.blue },
    { id: 'settings', label: 'Settings', icon: 'settings-outline', color: theme.purple },
    { id: 'support', label: 'Support', icon: 'help-circle-outline', color: theme.amber },
  ];

  const handleSignOut = () => {
    logout();
  };

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.menuScroll}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Menu</Text>

        {/* Profile Card */}
        <TouchableOpacity style={[styles.profileCardMenu, { backgroundColor: theme.card }]}>
          <Image source={{ uri: CAREGIVER.photo }} style={styles.profilePhotoMenu} />
          <View style={styles.profileInfoMenu}>
            <Text style={[styles.profileNameMenu, { color: theme.text }]}>{CAREGIVER.name}</Text>
            <Text style={[styles.profileRoleMenu, { color: theme.textSecondary }]}>{CAREGIVER.role}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Theme Toggle */}
        <View style={[styles.themeToggle, { backgroundColor: theme.card }]}>
          <View style={styles.themeToggleLeft}>
            <View style={[styles.themeIcon, { backgroundColor: `${theme.primary}20` }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.themeLabel, { color: theme.text }]}>Appearance</Text>
              <Text style={[styles.themeValue, { color: theme.textSecondary }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: `${theme.primary}50` }}
            thumbColor={isDark ? theme.primary : '#f4f3f4'}
          />
        </View>

        {/* Menu Items */}
        <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: `${theme.danger}15` }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.danger} />
          <Text style={[styles.signOutText, { color: theme.danger }]}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.appVersion, { color: theme.textMuted }]}>ADLTrack v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ AI COPILOT SCREEN ============
const AICopilotScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: "Hello Julia! I'm your AI Care Assistant. I can help you with:\n\n• Task guidance and instructions\n• Medication information\n• Vital signs interpretation\n• Care plan questions\n• Documentation help\n\nHow can I assist you today?" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestions = [
    'Log vital signs',
    'View care plan',
    'Report concern',
    'Medication help',
  ];

  const sendMessage = (text) => {
    if (!text.trim()) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand you need help with that. Based on David's care plan, here's what I recommend:\n\n1. Check the scheduled time for this task\n2. Review any special instructions\n3. Document completion with notes\n\nWould you like me to provide more specific guidance?",
        "That's a great question! For medication administration, always verify:\n\n• Right patient\n• Right medication\n• Right dose\n• Right time\n• Right route\n\nDavid's current medications are listed in his profile. Need me to pull those up?",
        "I'm here to help! For vital signs, David's normal ranges are:\n\n• BP: 110-130/70-85 mmHg\n• Heart Rate: 60-80 bpm\n• Temperature: 97.8-99.1°F\n\nIf readings are outside these ranges, please document and notify the family.",
      ];
      
      const aiMsg = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: responses[Math.floor(Math.random() * responses.length)]
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.copilotContainer, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.copilotHeader, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.copilotBackBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.copilotHeaderTitle}>
          <View style={styles.copilotIcon}>
            <Ionicons name="sparkles" size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={[styles.copilotTitle, { color: theme.text }]}>AI Care Assistant</Text>
            <Text style={[styles.copilotSubtitle, { color: theme.textSecondary }]}>Always here to help</Text>
          </View>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.role === 'user' 
              ? [styles.userBubble, { backgroundColor: theme.primary }]
              : [styles.aiBubble, { backgroundColor: theme.card }]
          ]}>
            {item.role === 'assistant' && (
              <View style={styles.aiAvatarSmall}>
                <Ionicons name="sparkles" size={12} color="#ffffff" />
              </View>
            )}
            <Text style={[styles.messageText, { color: item.role === 'user' ? '#ffffff' : theme.text }]}>
              {item.content}
            </Text>
          </View>
        )}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={[styles.loadingBubble, { backgroundColor: theme.card }]}>
          <View style={styles.loadingDots}>
            <View style={[styles.loadingDot, { backgroundColor: theme.textMuted }]} />
            <View style={[styles.loadingDot, { backgroundColor: theme.textMuted }]} />
            <View style={[styles.loadingDot, { backgroundColor: theme.textMuted }]} />
          </View>
        </View>
      )}

      {/* Suggestions */}
      <View style={styles.suggestionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsList}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.suggestionChip, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => sendMessage(suggestion)}
            >
              <Text style={[styles.suggestionText, { color: theme.text }]}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input */}
      <View style={[styles.inputBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TextInput
          style={[styles.chatInput, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="Ask me anything about caregiving..."
          placeholderTextColor={theme.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, { backgroundColor: input.trim() ? theme.primary : theme.border }]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
        >
          <Ionicons name="send" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ============ NAVIGATION ============
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CaregiverTabs = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: route.name === 'Incident' ? theme.danger : theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Incident: focused ? 'alert-circle' : 'alert-circle-outline',
            Message: focused ? 'chatbubble' : 'chatbubble-outline',
            Shifts: focused ? 'time' : 'time-outline',
            Menu: focused ? 'menu' : 'menu-outline',
          };
          return <Ionicons name={icons[route.name]} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Incident" component={IncidentScreen} />
      <Tab.Screen name="Message" component={MessageScreen} />
      <Tab.Screen name="Shifts" component={ShiftsScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={CaregiverTabs} />
            <Stack.Screen name="AICopilot" component={AICopilotScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ============ COMPLETE STYLES ============
const styles = StyleSheet.create({
  // Landing
  landingContainer: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: 24 },
  landingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 24, fontWeight: '700', color: '#1c1917', marginLeft: 12 },
  signInBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(37,211,102,0.1)' },
  signInText: { fontSize: 16, fontWeight: '600', color: '#25D366' },
  heroSection: { paddingTop: 40 },
  tagline: { fontSize: 36, fontWeight: '700', color: '#1c1917', lineHeight: 44 },
  taglineAccent: { fontSize: 36, fontWeight: '700', color: '#25D366', lineHeight: 44, marginBottom: 16 },
  heroDesc: { fontSize: 18, color: '#57534e', lineHeight: 28, marginBottom: 32 },
  ctaButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#25D366', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, alignSelf: 'flex-start' },
  ctaText: { fontSize: 18, fontWeight: '600', color: '#ffffff', marginRight: 8 },
  featuresRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 },
  featureCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginHorizontal: 4, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  featureIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(37,211,102,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  featureTitle: { fontSize: 13, fontWeight: '600', color: '#1c1917', textAlign: 'center' },
  featureDesc: { fontSize: 11, color: '#78716c', textAlign: 'center', marginTop: 2 },
  trustBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 'auto', marginBottom: 24, paddingVertical: 12 },
  trustText: { fontSize: 14, fontWeight: '600', color: '#57534e', marginLeft: 8, letterSpacing: 0.5 },

  // Role Selection
  roleContainer: { flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 24 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f5f5f4', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  roleTitle: { fontSize: 32, fontWeight: '700', color: '#1c1917', marginTop: 32 },
  roleSubtitle: { fontSize: 18, color: '#78716c', marginTop: 8, marginBottom: 32 },
  rolesContainer: { gap: 16 },
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e7e5e4', marginBottom: 16 },
  roleIcon: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  roleTextContainer: { flex: 1, marginLeft: 16 },
  roleCardTitle: { fontSize: 20, fontWeight: '600', color: '#1c1917', marginBottom: 4 },
  roleCardDesc: { fontSize: 14, color: '#78716c', lineHeight: 20 },
  roleFooter: { marginTop: 'auto', marginBottom: 32, alignItems: 'center' },
  roleFooterText: { fontSize: 14, color: '#a8a29e' },

  // Auth
  authContainer: { flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 24 },
  roleTag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 24, marginBottom: 16 },
  roleTagText: { fontSize: 14, fontWeight: '600' },
  authTitle: { fontSize: 32, fontWeight: '700', color: '#1c1917' },
  authSubtitle: { fontSize: 16, color: '#78716c', marginTop: 8, marginBottom: 32 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e7e5e4', borderRadius: 12, paddingVertical: 14, marginBottom: 12 },
  socialText: { fontSize: 16, fontWeight: '500', color: '#1c1917', marginLeft: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e7e5e4' },
  dividerText: { marginHorizontal: 16, fontSize: 14, color: '#a8a29e' },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#57534e', marginBottom: 8 },
  input: { backgroundColor: '#f5f5f4', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 16 },
  loginBtn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  loginBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  toggleAuth: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 4 },
  toggleAuthText: { fontSize: 14, color: '#78716c' },
  toggleAuthLink: { fontSize: 14, fontWeight: '600' },

  // Home Container
  homeContainer: { flex: 1 },
  
  // Offline State
  offlineContainer: { flex: 1, padding: 24 },
  offlineHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  caregiverPhoto: { width: 56, height: 56, borderRadius: 16, marginRight: 16 },
  greeting: { fontSize: 14, marginBottom: 2 },
  caregiverName: { fontSize: 24, fontWeight: '700' },
  patientCardOffline: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 40 },
  patientCardLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  patientCardRow: { flexDirection: 'row', alignItems: 'center' },
  patientPhotoLarge: { width: 64, height: 64, borderRadius: 18 },
  patientCardInfo: { flex: 1, marginLeft: 16 },
  patientName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  patientAge: { fontSize: 14 },
  startShiftSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  offlineText: { fontSize: 14, marginBottom: 8 },
  startShiftTitle: { fontSize: 20, fontWeight: '600', marginBottom: 32 },
  goButton: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  goButtonPulse: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(244,63,94,0.2)' },
  goButtonInner: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center' },
  tasksScheduled: { fontSize: 14 },

  // Patient Header (Online)
  patientHeaderContainer: { position: 'relative', height: 180 },
  patientHeaderPhoto: { position: 'absolute', width: '100%', height: '100%', resizeMode: 'cover' },
  patientHeaderGradient: { position: 'absolute', width: '100%', height: '100%' },
  patientHeaderInfo: { position: 'absolute', bottom: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patientHeaderName: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  patientHeaderAge: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },

  // Vitals
  vitalsContainer: { paddingHorizontal: 20, marginTop: -24, zIndex: 10 },
  vitalsGrid: { flexDirection: 'row', gap: 8 },
  vitalCard: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  vitalIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  vitalValue: { fontSize: 16, fontWeight: '700' },
  vitalLabel: { fontSize: 10, marginTop: 2 },

  // Progress
  progressSection: { paddingHorizontal: 20, paddingVertical: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontSize: 14, fontWeight: '500' },
  progressCount: { fontSize: 14, fontWeight: '700' },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#25D366', borderRadius: 4 },

  // Task Tabs
  taskTabs: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16, gap: 16 },
  tabText: { fontSize: 14, fontWeight: '600' },
  tabBadge: { position: 'absolute', top: -8, right: -12, width: 16, height: 16, borderRadius: 8, backgroundColor: '#f43f5e', justifyContent: 'center', alignItems: 'center' },
  tabBadgeText: { fontSize: 10, fontWeight: '700', color: '#ffffff' },
  tabDivider: { flex: 1, height: 1 },

  // Task List
  taskList: { paddingHorizontal: 20, paddingBottom: 100 },
  
  // Task Card
  taskCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1 },
  taskStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  taskContent: { flexDirection: 'row', paddingLeft: 16, paddingRight: 16, paddingVertical: 16 },
  taskMain: { flex: 1 },
  taskHeader: { marginBottom: 6 },
  taskTitle: { fontSize: 16, fontWeight: '600' },
  taskTitleCompleted: { textDecorationLine: 'line-through', opacity: 0.6 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  taskTime: { fontSize: 13 },
  photoBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  photoBadgeText: { fontSize: 11, fontWeight: '500' },
  taskNote: { fontSize: 13, fontStyle: 'italic', marginTop: 8 },
  taskRight: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 10 },
  taskPhoto: { width: 48, height: 48, borderRadius: 12 },
  taskExpandIcon: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  taskExpanded: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 16, borderTopWidth: 1 },
  taskExpandedSection: { marginBottom: 16 },
  taskExpandedLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  taskExpandedText: { fontSize: 14, lineHeight: 22 },
  startTaskBtn: { backgroundColor: '#25D366', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  startTaskBtnText: { fontSize: 15, fontWeight: '600', color: '#ffffff' },

  // Request Card
  requestCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1 },
  requestStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  requestContent: { paddingLeft: 16, paddingRight: 16, paddingVertical: 16 },
  requestHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  requestBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  requestBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  requestTime: { fontSize: 13 },
  requestTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  requestDesc: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  requestBy: { fontSize: 12, fontStyle: 'italic', marginBottom: 16 },
  requestActions: { flexDirection: 'row', gap: 12 },
  requestDeclineBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  requestDeclineText: { fontSize: 14, fontWeight: '600' },
  requestAcceptBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#25D366', alignItems: 'center' },
  requestAcceptText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },

  // Empty State
  emptyState: { padding: 40, borderRadius: 24, alignItems: 'center', borderWidth: 1 },
  emptyStateText: { fontSize: 14, marginTop: 12 },

  // FAB
  fab: { position: 'absolute', right: 20, bottom: 100, width: 60, height: 60, borderRadius: 30, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', shadowColor: '#25D366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },

  // Modal
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalContent: { flex: 1, padding: 20 },

  // Task Completion Modal
  taskSummary: { padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1 },
  taskSummaryTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  taskSummaryDesc: { fontSize: 14, lineHeight: 20 },
  photoSection: { marginBottom: 20 },
  photoLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  photoCapture: { height: 160, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 12 },
  photoCaptureText: { fontSize: 16, fontWeight: '500' },
  noteSection: { marginBottom: 20 },
  noteLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  noteInput: { height: 120, borderRadius: 16, padding: 16, fontSize: 15, borderWidth: 1 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#25D366', paddingVertical: 16, borderRadius: 16, gap: 10 },
  completeBtnText: { fontSize: 17, fontWeight: '600', color: '#ffffff' },

  // Profile Modal
  profileCard: { alignItems: 'center', padding: 24, borderRadius: 20, marginBottom: 20 },
  profilePhoto: { width: 100, height: 100, borderRadius: 28, marginBottom: 16 },
  profileName: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  profileAge: { fontSize: 16 },
  profileSection: { marginBottom: 20 },
  profileSectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  profileSectionCard: { borderRadius: 16, overflow: 'hidden' },
  profileItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  profileItemColumn: { flexDirection: 'column', alignItems: 'flex-start' },
  profileItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileItemText: { fontSize: 15, flex: 1 },
  profileItemSub: { fontSize: 13, marginTop: 4, marginLeft: 30 },
  emergencyCard: { borderRadius: 16, padding: 16 },
  emergencyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  emergencyName: { fontSize: 17, fontWeight: '600' },
  emergencyRelation: { fontSize: 14, marginLeft: 30, marginBottom: 14 },
  callButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 10 },
  callButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },

  // Vitals Modal
  vitalTabs: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 8 },
  vitalTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 8 },
  vitalTabText: { fontSize: 14, fontWeight: '600' },
  vitalCurrentCard: { alignItems: 'center', padding: 24, borderRadius: 20, marginBottom: 24 },
  vitalCurrentLabel: { fontSize: 14, marginBottom: 8 },
  vitalCurrentValue: { fontSize: 48, fontWeight: '700' },
  vitalCurrentUnit: { fontSize: 20, fontWeight: '400' },
  vitalCurrentTime: { fontSize: 14, marginTop: 8 },
  vitalHistoryTitle: { fontSize: 18, fontWeight: '600', marginBottom: 14 },
  vitalHistoryCard: { borderRadius: 16, overflow: 'hidden' },
  vitalHistoryItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  vitalHistoryDate: { fontSize: 14, width: 50 },
  vitalHistoryValue: { fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },
  vitalHistoryTime: { fontSize: 13, width: 80, textAlign: 'right' },
  recordVitalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#25D366', paddingVertical: 16, borderRadius: 16, marginTop: 24, gap: 8 },
  recordVitalBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },

  // Incident Screen
  incidentScroll: { paddingHorizontal: 20, paddingBottom: 100 },
  screenTitle: { fontSize: 28, fontWeight: '700', marginTop: 16 },
  screenSubtitle: { fontSize: 15, marginTop: 4, marginBottom: 20 },
  newIncidentBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f43f5e', padding: 20, borderRadius: 20, marginBottom: 20 },
  newIncidentContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  newIncidentIcon: { width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  newIncidentTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  newIncidentSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  summaryNum: { fontSize: 28, fontWeight: '700' },
  summaryLabel: { fontSize: 13, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  countBadge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: '#f43f5e' },
  countBadgeText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  incidentCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  incidentCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  incidentCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  incidentTypeIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },
  incidentDate: { fontSize: 13 },
  incidentCardTitle: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  incidentCardDesc: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  incidentCardBy: { fontSize: 12, fontStyle: 'italic' },

  // Incident Form
  incidentFormHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  incidentFormHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  incidentFormIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(244,63,94,0.2)', justifyContent: 'center', alignItems: 'center' },
  incidentFormTitle: { fontSize: 18, fontWeight: '600' },
  incidentFormStep: { fontSize: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  cancelBtnText: { fontSize: 14, fontWeight: '500' },
  stepProgress: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 6 },
  stepDot: { flex: 1, height: 4, borderRadius: 2 },
  incidentFormContent: { flex: 1, padding: 20 },
  stepTitle: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeCard: { width: '47%', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  typeIconContainer: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  typeLabel: { fontSize: 15, fontWeight: '500' },
  severityList: { gap: 12 },
  severityCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1, gap: 14 },
  severityDot: { width: 12, height: 12, borderRadius: 6 },
  severityLabel: { fontSize: 16, fontWeight: '500' },
  stepNav: { flexDirection: 'row', gap: 12, marginTop: 24 },
  backStepBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  backStepBtnText: { fontSize: 16, fontWeight: '600' },
  nextBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: '#f43f5e', alignItems: 'center' },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  textArea: { height: 120, borderRadius: 16, padding: 16, fontSize: 15, borderWidth: 1, marginBottom: 20 },
  reviewCard: { borderRadius: 16, padding: 16, marginBottom: 20 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reviewRowFull: { marginBottom: 16 },
  reviewLabel: { fontSize: 14 },
  reviewValue: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewValueText: { fontSize: 15, fontWeight: '500' },
  reviewDesc: { fontSize: 15, lineHeight: 22, marginTop: 6 },
  severityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  severityBadgeText: { fontSize: 13, fontWeight: '600' },
  toggleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, marginBottom: 20 },
  toggleContent: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  toggleText: { flex: 1 },
  toggleTitle: { fontSize: 16, fontWeight: '500' },
  toggleDesc: { fontSize: 13, marginTop: 2 },
  submitBtn: { flex: 2, paddingVertical: 16, borderRadius: 16, backgroundColor: '#f43f5e', alignItems: 'center' },
  submitBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successCard: { width: '100%', maxWidth: 320, padding: 32, borderRadius: 24, alignItems: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(37,211,102,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  successDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  successBtn: { width: '100%', paddingVertical: 16, borderRadius: 16, backgroundColor: '#25D366', alignItems: 'center' },
  successBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },

  // Messages
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  newMessageBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  patientContext: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, gap: 8, marginBottom: 16 },
  patientContextText: { fontSize: 13 },
  messageList: { paddingHorizontal: 20, paddingBottom: 100 },
  conversationCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  conversationInfo: { flex: 1, marginLeft: 14 },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  conversationName: { fontSize: 16, fontWeight: '600' },
  conversationTime: { fontSize: 12 },
  conversationRole: { fontSize: 11, marginTop: 2 },
  conversationMessage: { fontSize: 14, marginTop: 6 },
  unreadBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  unreadText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },

  // Shifts
  shiftScroll: { paddingHorizontal: 20, paddingBottom: 100 },
  shiftCard: { borderRadius: 24, padding: 20, marginTop: 20, borderWidth: 1 },
  shiftCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  shiftStatus: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  shiftStatusText: { fontSize: 17, fontWeight: '600' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffffff' },
  liveText: { fontSize: 11, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },
  shiftDetails: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  shiftDetailRow: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  shiftDetailText: {},
  shiftDetailLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  shiftDetailValue: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  shiftToggleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 10 },
  shiftToggleBtnText: { fontSize: 17, fontWeight: '600', color: '#ffffff' },
  quickActionsGrid: { flexDirection: 'row', gap: 12, marginTop: 12 },
  quickActionCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  quickActionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickActionLabel: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  recentShiftsCard: { borderRadius: 16, overflow: 'hidden', marginTop: 12 },
  shiftRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  shiftDate: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  shiftHours: { fontSize: 13 },
  shiftEarnings: { fontSize: 16, fontWeight: '600' },
  earningsCard: { borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 24 },
  earningsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  earningsTitle: { fontSize: 16, fontWeight: '600' },
  earningsAmount: { fontSize: 36, fontWeight: '700' },
  earningsSubtext: { fontSize: 14, marginTop: 4 },

  // Menu
  menuScroll: { paddingHorizontal: 20, paddingBottom: 40 },
  profileCardMenu: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginTop: 20, marginBottom: 16 },
  profilePhotoMenu: { width: 60, height: 60, borderRadius: 16 },
  profileInfoMenu: { flex: 1, marginLeft: 16 },
  profileNameMenu: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  profileRoleMenu: { fontSize: 14 },
  themeToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, marginBottom: 16 },
  themeToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  themeIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  themeLabel: { fontSize: 16, fontWeight: '500' },
  themeValue: { fontSize: 13, marginTop: 2 },
  menuContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 16, fontWeight: '500' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 10 },
  signOutText: { fontSize: 16, fontWeight: '600' },
  appVersion: { textAlign: 'center', fontSize: 13, marginTop: 24 },

  // AI Copilot
  copilotContainer: { flex: 1 },
  copilotHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  copilotBackBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  copilotHeaderTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 8, gap: 12 },
  copilotIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center' },
  copilotTitle: { fontSize: 17, fontWeight: '600' },
  copilotSubtitle: { fontSize: 13 },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 18, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, flexDirection: 'row', alignItems: 'flex-start' },
  aiAvatarSmall: { width: 24, height: 24, borderRadius: 8, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 2 },
  messageText: { fontSize: 15, lineHeight: 22, flex: 1 },
  loadingBubble: { alignSelf: 'flex-start', marginLeft: 16, marginBottom: 12, padding: 14, borderRadius: 18 },
  loadingDots: { flexDirection: 'row', gap: 6 },
  loadingDot: { width: 8, height: 8, borderRadius: 4 },
  suggestionsContainer: { paddingVertical: 8 },
  suggestionsList: { paddingHorizontal: 16, gap: 8 },
  suggestionChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  suggestionText: { fontSize: 14, fontWeight: '500' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, gap: 10 },
  chatInput: { flex: 1, minHeight: 44, maxHeight: 100, borderRadius: 22, paddingHorizontal: 18, paddingVertical: 12, fontSize: 16 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});

// ============ APP ENTRY ============
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
