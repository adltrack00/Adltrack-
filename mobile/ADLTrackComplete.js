// ADLTrack - Exact Replica Mobile App for Expo Snack
// Dark theme with green primary (#25D366)

import React, { useState, useRef } from 'react';
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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// COLORS - Exact match to web app
// ============================================
const COLORS = {
  background: '#000000',
  card: '#1c1c1e',
  cardLight: '#2c2c2e',
  cardBorder: '#3a3a3c',
  primary: '#25D366',
  primaryDark: '#1ea952',
  white: '#ffffff',
  textPrimary: '#ffffff',
  textSecondary: '#8e8e93',
  textMuted: '#636366',
  // Priority colors
  critical: '#ef4444',
  high: '#f97316',
  standard: '#3b82f6',
  low: '#22c55e',
  // Vital colors
  vitalBP: '#be185d',
  vitalBPBg: 'rgba(190, 24, 93, 0.2)',
  vitalHeart: '#ea580c',
  vitalHeartBg: 'rgba(234, 88, 12, 0.2)',
  vitalTemp: '#2563eb',
  vitalTempBg: 'rgba(37, 99, 235, 0.2)',
  vitalPain: '#7c3aed',
  vitalPainBg: 'rgba(124, 58, 237, 0.2)',
  // Status colors
  allergyBg: 'rgba(239, 68, 68, 0.15)',
  allergyBorder: 'rgba(239, 68, 68, 0.3)',
  codeStatusBg: 'rgba(234, 179, 8, 0.15)',
  codeStatusBorder: 'rgba(234, 179, 8, 0.3)',
  mobilityBg: 'rgba(37, 99, 235, 0.15)',
  mobilityBorder: 'rgba(37, 99, 235, 0.3)',
};

// ============================================
// MOCK DATA
// ============================================
const PATIENT = {
  name: 'David Smith',
  age: 78,
  dob: '1946-03-15',
  photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
  allergies: ['Penicillin', 'Shellfish'],
  conditions: ['Type 2 Diabetes', 'Hypertension', 'Mild Cognitive Impairment'],
  medications: [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
    { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
  ],
  codeStatus: 'Full Code',
  mobility: 'Uses walker for ambulation',
  accessInstructions: 'Key under flower pot by front door. Alarm code: 1234.',
  emergencyContacts: [
    { name: 'Mary Smith', relation: 'Daughter', phone: '(555) 123-4567' },
    { name: 'Tom Smith', relation: 'Son', phone: '(555) 987-6543' },
  ],
  physician: { name: 'Dr. Rebecca Johnson', facility: 'Springfield Medical Center' },
};

const VITALS = {
  bp: { systolic: 120, diastolic: 76 },
  heart: 72,
  temp: 98.6,
  pain: 1,
};

const VITALS_HISTORY = [
  { day: 'Sun', time: '10:30 AM', systolic: 120, diastolic: 76 },
  { day: 'Sat', time: '10:35 AM', systolic: 121, diastolic: 78 },
  { day: 'Fri', time: '10:20 AM', systolic: 119, diastolic: 75 },
  { day: 'Thu', time: '10:30 AM', systolic: 120, diastolic: 77 },
  { day: 'Wed', time: '10:45 AM', systolic: 125, diastolic: 80 },
];

const TASKS = [
  { id: 1, title: 'Morning Medication', time: '08:00 AM', priority: 'critical', requiresPhoto: true, instructions: 'Give 2 tablets of Metformin with food. Ensure patient drinks full glass of water.', timeWindow: '7:30 AM - 9:00 AM', status: 'pending' },
  { id: 2, title: 'Breakfast Assistance', time: '08:30 AM', priority: 'standard', requiresPhoto: false, instructions: 'Assist with breakfast preparation and eating.', status: 'pending' },
  { id: 3, title: 'Morning Walk', time: '10:00 AM', priority: 'low', requiresPhoto: false, instructions: 'Accompany patient on 15-minute walk around the house.', status: 'pending' },
  { id: 4, title: 'Blood Pressure Check', time: '10:30 AM', priority: 'critical', requiresPhoto: true, instructions: 'Take BP reading and log in vitals.', status: 'pending' },
  { id: 5, title: 'Hydration Check', time: '11:00 AM', priority: 'critical', requiresPhoto: false, instructions: 'Ensure patient has had at least 2 glasses of water.', status: 'pending' },
  { id: 6, title: 'Lunch Preparation', time: '12:00 PM', priority: 'standard', requiresPhoto: true, instructions: 'Prepare diabetic-friendly lunch.', status: 'pending' },
  { id: 7, title: 'Afternoon Medication', time: '12:30 PM', priority: 'critical', requiresPhoto: true, instructions: 'Administer noon medications.', status: 'pending' },
  { id: 8, title: 'Rest Period', time: '2:00 PM', priority: 'low', requiresPhoto: false, instructions: 'Ensure comfortable rest environment.', status: 'pending' },
  { id: 9, title: 'Physical Therapy Exercises', time: '3:30 PM', priority: 'standard', requiresPhoto: false, instructions: 'Guide through prescribed PT exercises.', status: 'pending' },
  { id: 10, title: 'Evening Medication', time: '5:00 PM', priority: 'critical', requiresPhoto: true, instructions: 'Evening medication administration.', status: 'pending' },
  { id: 11, title: 'Dinner Service', time: '6:00 PM', priority: 'standard', requiresPhoto: true, instructions: 'Serve dinner and assist as needed.', status: 'pending' },
  { id: 12, title: 'Bedtime Routine', time: '8:00 PM', priority: 'low', requiresPhoto: false, instructions: 'Help with evening hygiene and bed preparation.', status: 'pending' },
];

const REQUESTS = [
  { id: 'r1', title: 'Extra Walking Session', from: 'Mary (Daughter)', time: '2:30 PM' },
  { id: 'r2', title: 'Video Call with Grandkids', from: 'Tom (Son)', time: '3:00 PM' },
];

// ============================================
// AUTH CONTEXT
// ============================================
const AuthContext = React.createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (role) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUser({ role, name: role === 'caregiver' ? 'Sarah Johnson' : 'Mary Smith' });
    setIsLoading(false);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

// ============================================
// ROLE SELECTION SCREEN
// ============================================
const RoleSelectionScreen = ({ navigation }) => {
  const { login, isLoading } = useAuth();

  const roles = [
    { id: 'caregiver', icon: 'heart', color: '#25D366', title: "I'm a Caregiver", subtitle: 'Manage shifts, tasks & documentation' },
    { id: 'family', icon: 'people', color: '#f43f5e', title: "I'm a Family Member", subtitle: 'Monitor care & stay connected' },
    { id: 'agency', icon: 'business', color: '#6366f1', title: "I'm an Agency", subtitle: 'Manage staff & compliance' },
  ];

  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (selectedRole) {
      navigation.navigate('SignUp', { role: selectedRole });
    }
  };

  return (
    <View style={styles.authContainer}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.authHeader}>
        <View style={styles.logoContainer}>
          <Ionicons name="pulse" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.logoText}>Adltrack</Text>
      </View>

      <View style={styles.authDivider} />

      {/* Content */}
      <View style={styles.authContent}>
        <Text style={styles.authTitle}>Create your account</Text>
        <Text style={styles.authSubtitle}>Select your account type to get started</Text>

        {/* Role Cards */}
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              selectedRole === role.id && { borderColor: role.color, borderWidth: 2 }
            ]}
            onPress={() => setSelectedRole(role.id)}
          >
            <View style={[styles.roleIconContainer, { backgroundColor: `${role.color}20` }]}>
              <Ionicons name={role.icon} size={24} color={role.color} />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => login('caregiver')}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.authFooter}>
        <Text style={styles.footerText}>© 2026 Adltrack. Secure care coordination.</Text>
      </View>
    </View>
  );
};

// ============================================
// SIGN UP SCREEN
// ============================================
const SignUpScreen = ({ route, navigation }) => {
  const { login, isLoading } = useAuth();
  const role = route?.params?.role || 'caregiver';
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const roleLabels = {
    caregiver: 'Caregiver Account',
    family: 'Family Account',
    agency: 'Agency Account',
  };

  const handleCreateAccount = () => {
    login(role);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.authContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.authHeader}>
          <View style={styles.logoContainer}>
            <Ionicons name="pulse" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.logoText}>Adltrack</Text>
        </View>

        <View style={styles.authDivider} />

        {/* Content */}
        <View style={styles.authContent}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{roleLabels[role]}</Text>
          </View>

          <Text style={styles.authTitle}>Create your account</Text>
          <Text style={styles.authSubtitle}>Manage shifts, tasks & care documentation</Text>

          {/* Social Buttons */}
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.socialButtonText}>Sign up with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={20} color="#000" />
            <Text style={styles.socialButtonText}>Sign up with Apple</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.orDivider}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or continue with email</Text>
            <View style={styles.orLine} />
          </View>

          {/* Form */}
          <Text style={styles.inputLabel}>Full Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleCreateAccount}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => login(role)}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ============================================
// NAVIGATION SETUP
// ============================================
const Tab = createBottomTabNavigator();
const Stack = require('@react-navigation/stack').createStackNavigator();

// ============================================
// AUTH NAVIGATOR
// ============================================
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

// ============================================
// CAREGIVER HOME SCREEN
// ============================================
const CaregiverHomeScreen = () => {
  const [tasks, setTasks] = useState(TASKS);
  const [activeTab, setActiveTab] = useState('tasks'); // 'requests' or 'tasks'
  const [expandedTask, setExpandedTask] = useState(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return COLORS.critical;
      case 'high': return COLORS.high;
      case 'standard': return COLORS.standard;
      case 'low': return COLORS.low;
      default: return COLORS.standard;
    }
  };

  const handleTaskPress = (task) => {
    if (expandedTask === task.id) {
      setExpandedTask(null);
    } else {
      setExpandedTask(task.id);
    }
  };

  const handleStartTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCompleteTask = () => {
    if (selectedTask) {
      setTasks(tasks.map(t => 
        t.id === selectedTask.id ? { ...t, status: 'completed' } : t
      ));
      setShowTaskModal(false);
      setExpandedTask(null);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Patient Card with Photo */}
        <TouchableOpacity 
          style={styles.patientHeroCard}
          onPress={() => setShowPatientProfile(true)}
        >
          <Image source={{ uri: PATIENT.photo }} style={styles.patientHeroImage} />
          <View style={styles.patientHeroOverlay}>
            <View style={styles.patientHeroInfo}>
              <Text style={styles.patientHeroName}>{PATIENT.name}</Text>
              <Text style={styles.patientHeroAge}>{PATIENT.age} years old</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Vitals Grid */}
        <TouchableOpacity onPress={() => setShowVitalsModal(true)}>
          <View style={styles.vitalsGrid}>
            <View style={styles.vitalCard}>
              <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalBPBg }]}>
                <Ionicons name="heart" size={20} color={COLORS.vitalBP} />
              </View>
              <Text style={styles.vitalValue}>{VITALS.bp.systolic}/{VITALS.bp.diastolic}</Text>
              <Text style={styles.vitalLabel}>BP</Text>
            </View>
            <View style={styles.vitalCard}>
              <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalHeartBg }]}>
                <Ionicons name="pulse" size={20} color={COLORS.vitalHeart} />
              </View>
              <Text style={styles.vitalValue}>{VITALS.heart}</Text>
              <Text style={styles.vitalLabel}>Heart</Text>
            </View>
            <View style={styles.vitalCard}>
              <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalTempBg }]}>
                <Ionicons name="thermometer" size={20} color={COLORS.vitalTemp} />
              </View>
              <Text style={styles.vitalValue}>{VITALS.temp}°</Text>
              <Text style={styles.vitalLabel}>Temp</Text>
            </View>
            <View style={styles.vitalCard}>
              <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalPainBg }]}>
                <Ionicons name="sad-outline" size={20} color={COLORS.vitalPain} />
              </View>
              <Text style={styles.vitalValue}>{VITALS.pain}/10</Text>
              <Text style={styles.vitalLabel}>Pain</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* History Banner (when viewing past) */}
        {viewingHistory && (
          <View style={styles.historyBanner}>
            <View style={styles.historyBannerLeft}>
              <View style={styles.historyIconBg}>
                <Ionicons name="time" size={20} color="#f59e0b" />
              </View>
              <View>
                <Text style={styles.historyBannerLabel}>VIEWING HISTORY</Text>
                <Text style={styles.historyBannerDate}>{viewingHistory}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.backToTodayBtn}
              onPress={() => setViewingHistory(null)}
            >
              <Text style={styles.backToTodayText}>Back to Today</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedCount / totalCount) * 100}%` }]} />
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity 
            style={styles.tabButton}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
              Requests
            </Text>
            {REQUESTS.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{REQUESTS.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.tabDivider} />
          <TouchableOpacity 
            style={styles.tabButton}
            onPress={() => setActiveTab('tasks')}
          >
            <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
              Today's Tasks
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        {activeTab === 'tasks' && (
          <View style={styles.taskList}>
            {tasks.map((task) => (
              <View key={task.id}>
                <TouchableOpacity 
                  style={styles.taskCard}
                  onPress={() => handleTaskPress(task)}
                >
                  <View style={[styles.taskPriorityBar, { backgroundColor: getPriorityColor(task.priority) }]} />
                  <View style={styles.taskContent}>
                    <View style={styles.taskHeader}>
                      <Text style={[
                        styles.taskTitle,
                        task.status === 'completed' && styles.taskTitleCompleted
                      ]}>
                        {task.title}
                      </Text>
                      {task.status === 'completed' && task.photo && (
                        <Image source={{ uri: task.photo }} style={styles.taskThumb} />
                      )}
                    </View>
                    <View style={styles.taskMeta}>
                      <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.taskTime}>{task.time}</Text>
                      {task.requiresPhoto && (
                        <View style={styles.photoBadge}>
                          <Ionicons name="camera-outline" size={12} color={COLORS.textSecondary} />
                          <Text style={styles.photoBadgeText}>Photo</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.taskExpandBtn}
                    onPress={() => handleTaskPress(task)}
                  >
                    <Ionicons 
                      name={expandedTask === task.id ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={COLORS.textSecondary} 
                    />
                  </TouchableOpacity>
                </TouchableOpacity>

                {/* Expanded Task Details */}
                {expandedTask === task.id && task.status !== 'completed' && (
                  <View style={styles.taskExpanded}>
                    <View style={styles.taskInstructionsCard}>
                      <Text style={styles.taskInstructionsLabel}>INSTRUCTIONS</Text>
                      <Text style={styles.taskInstructionsText}>{task.instructions}</Text>
                    </View>
                    {task.timeWindow && (
                      <View style={styles.taskTimeWindow}>
                        <Text style={styles.taskTimeWindowLabel}>TIME WINDOW</Text>
                        <Text style={styles.taskTimeWindowText}>{task.timeWindow}</Text>
                      </View>
                    )}
                    <TouchableOpacity 
                      style={styles.startTaskBtn}
                      onPress={() => handleStartTask(task)}
                    >
                      <Text style={styles.startTaskBtnText}>Start Task</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Requests */}
        {activeTab === 'requests' && (
          <View style={styles.taskList}>
            {REQUESTS.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestContent}>
                  <Text style={styles.requestTitle}>{request.title}</Text>
                  <Text style={styles.requestFrom}>From: {request.from}</Text>
                  <Text style={styles.requestTime}>Requested for: {request.time}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity style={styles.requestDeclineBtn}>
                    <Ionicons name="close" size={20} color={COLORS.critical} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.requestAcceptBtn}>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB for AI Copilot */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="sparkles" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modals */}
      <PatientProfileModal 
        visible={showPatientProfile} 
        onClose={() => setShowPatientProfile(false)}
      />
      <VitalsModal 
        visible={showVitalsModal} 
        onClose={() => setShowVitalsModal(false)}
      />
      <TaskCompletionModal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        task={selectedTask}
        onComplete={handleCompleteTask}
      />
    </View>
  );
};

// ============================================
// PATIENT PROFILE MODAL - Exact Replica
// ============================================
const PatientProfileModal = ({ visible, onClose }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const today = new Date();
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const isPast = new Date(year, month, day) < today;
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isToday && styles.calendarDayToday,
          ]}
          onPress={() => {
            if (isPast || isToday) {
              setShowCalendar(false);
              // Would navigate to historical view
            }
          }}
        >
          <Text style={[
            styles.calendarDayText,
            isToday && styles.calendarDayTextToday,
            !isPast && !isToday && styles.calendarDayTextFuture,
          ]}>{day}</Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.profileModalContainer}>
        <StatusBar style="light" />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Image */}
          <View style={styles.profileHero}>
            <Image source={{ uri: PATIENT.photo }} style={styles.profileHeroImage} />
            <TouchableOpacity style={styles.profileCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.profileHeroOverlay}>
              <Text style={styles.profileHeroName}>{PATIENT.name}</Text>
              <View style={styles.profileHeroMeta}>
                <Text style={styles.profileHeroAge}>{PATIENT.age} Years Old</Text>
                <View style={styles.profileDot} />
                <Text style={styles.profileHeroDob}>DOB: {PATIENT.dob}</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileContent}>
            {/* Care History Card */}
            <TouchableOpacity 
              style={styles.careHistoryCard}
              onPress={() => setShowCalendar(true)}
            >
              <View style={styles.careHistoryIcon}>
                <Ionicons name="calendar" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.careHistoryInfo}>
                <Text style={styles.careHistoryLabel}>CARE HISTORY</Text>
                <Text style={styles.careHistoryDate}>
                  {monthNames[today.getMonth()]} {today.getDate()}, {today.getFullYear()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Allergies */}
            <View style={styles.allergiesCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="alert-circle" size={20} color={COLORS.critical} />
                <Text style={styles.sectionTitle}>Allergies</Text>
              </View>
              <View style={styles.allergyTags}>
                {PATIENT.allergies.map((allergy, index) => (
                  <View key={index} style={styles.allergyTag}>
                    <Text style={styles.allergyTagText}>{allergy}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Medical Conditions */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Medical Conditions</Text>
              {PATIENT.conditions.map((condition, index) => (
                <View key={index} style={styles.conditionItem}>
                  <View style={styles.conditionDot} />
                  <Text style={styles.conditionText}>{condition}</Text>
                </View>
              ))}
            </View>

            {/* Current Medications */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Current Medications</Text>
              {PATIENT.medications.map((med, index) => (
                <View key={index} style={styles.medicationItem}>
                  <View style={styles.medicationIconBg}>
                    <Ionicons name="medical" size={16} color={COLORS.primary} />
                  </View>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{med.name}</Text>
                    <Text style={styles.medicationDosage}>{med.dosage} - {med.frequency}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Code Status & Mobility */}
            <View style={styles.statusRow}>
              <View style={[styles.statusCard, { borderColor: COLORS.codeStatusBorder, backgroundColor: COLORS.codeStatusBg }]}>
                <Text style={styles.statusLabel}>CODE STATUS</Text>
                <Text style={styles.statusValue}>{PATIENT.codeStatus}</Text>
              </View>
              <View style={[styles.statusCard, { borderColor: COLORS.mobilityBorder, backgroundColor: COLORS.mobilityBg }]}>
                <Text style={styles.statusLabel}>MOBILITY</Text>
                <Text style={styles.statusValue}>{PATIENT.mobility}</Text>
              </View>
            </View>

            {/* Access Instructions */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="key" size={20} color={COLORS.textSecondary} />
                <Text style={styles.sectionTitle}>Access Instructions</Text>
              </View>
              <Text style={styles.accessText}>{PATIENT.accessInstructions}</Text>
            </View>

            {/* Physician */}
            <View style={styles.physicianCard}>
              <View style={styles.physicianIcon}>
                <Ionicons name="person" size={20} color="#fff" />
              </View>
              <View style={styles.physicianInfo}>
                <Text style={styles.physicianName}>{PATIENT.physician.name}</Text>
                <Text style={styles.physicianFacility}>{PATIENT.physician.facility}</Text>
              </View>
              <TouchableOpacity style={styles.callBtn}>
                <Ionicons name="call" size={18} color={COLORS.primary} />
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
            </View>

            {/* Emergency Contacts */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              {PATIENT.emergencyContacts.map((contact, index) => (
                <View key={index} style={styles.contactItem}>
                  <View style={styles.contactIcon}>
                    <Text style={styles.contactInitial}>{contact.name[0]}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelation}>{contact.relation}</Text>
                  </View>
                  <TouchableOpacity style={styles.contactCallBtn}>
                    <Ionicons name="call" size={18} color={COLORS.primary} />
                    <Text style={styles.contactCallText}>Call</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Share Medical ID */}
            <TouchableOpacity style={styles.shareEmsBtn}>
              <Ionicons name="share-social" size={20} color="#fff" />
              <Text style={styles.shareEmsBtnText}>Share Medical ID for EMS</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>

        {/* Calendar Modal */}
        <Modal visible={showCalendar} transparent animationType="fade">
          <TouchableOpacity 
            style={styles.calendarOverlay}
            activeOpacity={1}
            onPress={() => setShowCalendar(false)}
          >
            <View style={styles.calendarModal}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => setSelectedDate(new Date(year, month - 1, 1))}>
                  <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.calendarMonthYear}>
                  {monthNames[month]} {year}
                </Text>
                <TouchableOpacity onPress={() => setSelectedDate(new Date(year, month + 1, 1))}>
                  <Ionicons name="chevron-forward" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              <View style={styles.calendarWeekdays}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <Text key={day} style={styles.calendarWeekday}>{day}</Text>
                ))}
              </View>
              <View style={styles.calendarDays}>
                {renderCalendar()}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
};

// ============================================
// VITALS MODAL - With Chart
// ============================================
const VitalsModal = ({ visible, onClose }) => {
  const [activeVital, setActiveVital] = useState('bp');

  const vitals = [
    { id: 'bp', label: 'Blood Pressure' },
    { id: 'heart', label: 'Heart Rate' },
    { id: 'temp', label: 'Temperature' },
  ];

  // Simple bar chart visualization
  const renderChart = () => {
    const maxSystolic = 140;
    const minSystolic = 100;
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartYAxis}>
          <Text style={styles.chartYLabel}>140</Text>
          <Text style={styles.chartYLabel}>120</Text>
          <Text style={styles.chartYLabel}>100</Text>
        </View>
        <View style={styles.chartBars}>
          {VITALS_HISTORY.map((entry, index) => {
            const systolicHeight = ((entry.systolic - minSystolic) / (maxSystolic - minSystolic)) * 100;
            const diastolicHeight = ((entry.diastolic - 60) / (40)) * 100;
            
            return (
              <View key={index} style={styles.chartBarGroup}>
                <View style={styles.chartBarContainer}>
                  <View style={[styles.chartBarSystolic, { height: `${systolicHeight}%` }]} />
                </View>
                <Text style={styles.chartBarLabel}>{entry.day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.vitalsModalContainer}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.vitalsModalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.vitalsCloseBtn}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.vitalsModalTitle}>Vitals</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Vital Type Tabs */}
          <View style={styles.vitalsTabs}>
            {vitals.map(vital => (
              <TouchableOpacity
                key={vital.id}
                style={[
                  styles.vitalsTab,
                  activeVital === vital.id && styles.vitalsTabActive
                ]}
                onPress={() => setActiveVital(vital.id)}
              >
                <Text style={[
                  styles.vitalsTabText,
                  activeVital === vital.id && styles.vitalsTabTextActive
                ]}>
                  {vital.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Current Reading */}
          <View style={styles.currentReadingCard}>
            <View style={[styles.currentReadingIcon, { backgroundColor: COLORS.vitalBPBg }]}>
              <Ionicons name="heart" size={32} color={COLORS.vitalBP} />
            </View>
            <View style={styles.currentReadingInfo}>
              <Text style={styles.currentReadingValue}>
                {VITALS.bp.systolic}/{VITALS.bp.diastolic}
              </Text>
              <Text style={styles.currentReadingUnit}>mmHg</Text>
              <View style={styles.currentReadingStatus}>
                <View style={styles.statusDotGreen} />
                <Text style={styles.statusText}>Normal</Text>
              </View>
            </View>
          </View>

          {/* Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Weekly Trend</Text>
            {renderChart()}
            <View style={styles.chartLegend}>
              <View style={styles.chartLegendItem}>
                <View style={[styles.chartLegendDot, { backgroundColor: COLORS.vitalBP }]} />
                <Text style={styles.chartLegendText}>Systolic</Text>
              </View>
              <View style={styles.chartLegendItem}>
                <View style={[styles.chartLegendDot, { backgroundColor: '#60a5fa' }]} />
                <Text style={styles.chartLegendText}>Diastolic</Text>
              </View>
            </View>
          </View>

          {/* Log New Reading Button */}
          <TouchableOpacity style={styles.logReadingBtn}>
            <Ionicons name="add" size={20} color={COLORS.primary} />
            <Text style={styles.logReadingBtnText}>Log New Reading</Text>
          </TouchableOpacity>

          {/* Recent History */}
          <View style={styles.recentHistorySection}>
            <Text style={styles.recentHistoryTitle}>RECENT HISTORY</Text>
            {VITALS_HISTORY.map((entry, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyItemLeft}>
                  <Text style={styles.historyItemDay}>{entry.day}</Text>
                  <Text style={styles.historyItemTime}>{entry.time}</Text>
                </View>
                <View style={styles.historyItemRight}>
                  <Text style={styles.historyItemValue}>{entry.systolic}/{entry.diastolic}</Text>
                  <Text style={styles.historyItemUnit}>mmHg</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

// ============================================
// TASK COMPLETION MODAL
// ============================================
const TaskCompletionModal = ({ visible, onClose, task, onComplete }) => {
  const [completionType, setCompletionType] = useState('complete');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  if (!task) return null;

  const handlePhotoSelect = (option) => {
    // Simulate photo selection
    setPhoto('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400');
    setShowPhotoOptions(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.taskModalContainer}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.taskModalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.taskModalTitle}>{task.title}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.taskModalContent} showsVerticalScrollIndicator={false}>
          {/* Completion Type Toggle */}
          <View style={styles.completionToggle}>
            <TouchableOpacity
              style={[
                styles.completionToggleBtn,
                completionType === 'complete' && styles.completionToggleBtnActive
              ]}
              onPress={() => setCompletionType('complete')}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={completionType === 'complete' ? '#fff' : COLORS.textSecondary} 
              />
              <Text style={[
                styles.completionToggleText,
                completionType === 'complete' && styles.completionToggleTextActive
              ]}>Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.completionToggleBtn,
                completionType === 'cant' && styles.completionToggleBtnCant
              ]}
              onPress={() => setCompletionType('cant')}
            >
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={completionType === 'cant' ? '#fff' : COLORS.textSecondary} 
              />
              <Text style={[
                styles.completionToggleText,
                completionType === 'cant' && styles.completionToggleTextActive
              ]}>Can't Complete</Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsLabel}>INSTRUCTIONS</Text>
            <Text style={styles.instructionsText}>{task.instructions}</Text>
          </View>

          {/* Photo Evidence */}
          {task.requiresPhoto && (
            <View style={styles.photoSection}>
              <Text style={styles.photoSectionTitle}>PHOTO EVIDENCE (REQUIRED)</Text>
              
              {photo ? (
                <View style={styles.photoPreview}>
                  <Image source={{ uri: photo }} style={styles.photoPreviewImage} />
                  <TouchableOpacity 
                    style={styles.photoRemoveBtn}
                    onPress={() => setPhoto(null)}
                  >
                    <Ionicons name="close-circle" size={28} color={COLORS.critical} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.photoUploadBtn}
                  onPress={() => setShowPhotoOptions(true)}
                >
                  <Ionicons name="camera" size={32} color={COLORS.textSecondary} />
                  <Text style={styles.photoUploadText}>Tap to add photo</Text>
                </TouchableOpacity>
              )}

              {/* Photo Options Dropdown */}
              {showPhotoOptions && (
                <View style={styles.photoOptionsDropdown}>
                  <TouchableOpacity 
                    style={styles.photoOption}
                    onPress={() => handlePhotoSelect('library')}
                  >
                    <Ionicons name="images" size={20} color={COLORS.textPrimary} />
                    <Text style={styles.photoOptionText}>Photo Library</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.photoOption}
                    onPress={() => handlePhotoSelect('camera')}
                  >
                    <Ionicons name="camera" size={20} color={COLORS.textPrimary} />
                    <Text style={styles.photoOptionText}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.photoOption}
                    onPress={() => handlePhotoSelect('file')}
                  >
                    <Ionicons name="document" size={20} color={COLORS.textPrimary} />
                    <Text style={styles.photoOptionText}>Choose File</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.notesSectionTitle}>NOTES (OPTIONAL)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes about this task..."
              placeholderTextColor={COLORS.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Complete Button */}
          <TouchableOpacity 
            style={[
              styles.completeBtn,
              (!photo && task.requiresPhoto) && styles.completeBtnDisabled
            ]}
            onPress={onComplete}
            disabled={!photo && task.requiresPhoto}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.completeBtnText}>Mark as Complete</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ============================================
// PLACEHOLDER SCREENS
// ============================================
const IncidentScreen = () => (
  <View style={styles.screenContainer}>
    <View style={styles.placeholderContainer}>
      <Ionicons name="alert-circle-outline" size={48} color={COLORS.textSecondary} />
      <Text style={styles.placeholderText}>Incident Reports</Text>
    </View>
  </View>
);

const MessageScreen = () => (
  <View style={styles.screenContainer}>
    <View style={styles.placeholderContainer}>
      <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textSecondary} />
      <Text style={styles.placeholderText}>Messages</Text>
    </View>
  </View>
);

const ShiftsScreen = () => (
  <View style={styles.screenContainer}>
    <View style={styles.placeholderContainer}>
      <Ionicons name="time-outline" size={48} color={COLORS.textSecondary} />
      <Text style={styles.placeholderText}>Shifts</Text>
    </View>
  </View>
);

const MenuScreen = () => {
  const { logout } = useAuth();
  
  return (
    <View style={styles.screenContainer}>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color={COLORS.textPrimary} />
          <Text style={styles.menuItemText}>Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
          <Text style={styles.menuItemText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color={COLORS.textPrimary} />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.menuItemLogout]} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.critical} />
          <Text style={[styles.menuItemText, { color: COLORS.critical }]}>Sign Out</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.critical} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================
// CAREGIVER TAB NAVIGATOR
// ============================================
const CaregiverTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Incident') iconName = focused ? 'alert-circle' : 'alert-circle-outline';
          else if (route.name === 'Message') iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          else if (route.name === 'Shifts') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'Menu') iconName = focused ? 'menu' : 'menu-outline';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={CaregiverHomeScreen} />
      <Tab.Screen name="Incident" component={IncidentScreen} />
      <Tab.Screen name="Message" component={MessageScreen} />
      <Tab.Screen name="Shifts" component={ShiftsScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
    </Tab.Navigator>
  );
};

// ============================================
// MAIN APP
// ============================================
const AppContent = () => {
  const { user } = useAuth();

  if (!user) {
    return <AuthNavigator />;
  }

  return <CaregiverTabs />;
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}

// ============================================
// STYLES - Dark Theme Exact Match
// ============================================
const styles = StyleSheet.create({
  // Auth Screens - Light Theme (as shown in screenshots)
  authContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  authHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 8,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  authDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  authContent: {
    padding: 20,
    flex: 1,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 20,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  roleSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285f4',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9ca3af',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 10,
    fontSize: 16,
    color: '#1f2937',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signInText: {
    fontSize: 14,
    color: '#6b7280',
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  termsText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
  },
  authFooter: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },

  // Main Screen Container - Dark Theme
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Patient Hero Card
  patientHeroCard: {
    marginHorizontal: 16,
    marginTop: 60,
    borderRadius: 20,
    overflow: 'hidden',
    height: 160,
  },
  patientHeroImage: {
    width: '100%',
    height: '100%',
  },
  patientHeroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  patientHeroInfo: {},
  patientHeroName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  patientHeroAge: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Vitals Grid
  vitalsGrid: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  vitalIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  vitalLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // History Banner
  historyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  historyBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBannerLabel: {
    fontSize: 10,
    color: '#f59e0b',
    fontWeight: '600',
  },
  historyBannerDate: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  backToTodayBtn: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backToTodayText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Progress Section
  progressSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  progressCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.card,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },

  // Tab Switcher
  tabSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  tabBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  tabDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.cardBorder,
    marginHorizontal: 16,
  },

  // Task List
  taskList: {
    paddingHorizontal: 16,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  taskPriorityBar: {
    width: 4,
  },
  taskContent: {
    flex: 1,
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  taskThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginLeft: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  taskTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
    gap: 4,
  },
  photoBadgeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  taskExpandBtn: {
    padding: 16,
    justifyContent: 'center',
  },

  // Task Expanded
  taskExpanded: {
    backgroundColor: COLORS.cardLight,
    marginHorizontal: 16,
    marginTop: -12,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  taskInstructionsCard: {
    marginBottom: 12,
  },
  taskInstructionsLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  taskInstructionsText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  taskTimeWindow: {
    marginBottom: 16,
  },
  taskTimeWindowLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskTimeWindowText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  startTaskBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  startTaskBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Request Card
  requestCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  requestContent: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  requestFrom: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  requestTime: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  requestDeclineBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestAcceptBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Tab Bar
  tabBar: {
    backgroundColor: COLORS.card,
    borderTopWidth: 0,
    height: 85,
    paddingBottom: 25,
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Profile Modal
  profileModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHero: {
    height: 300,
    position: 'relative',
  },
  profileHeroImage: {
    width: '100%',
    height: '100%',
  },
  profileCloseBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  },
  profileHeroName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileHeroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  profileHeroAge: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  profileDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  profileHeroDob: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  profileContent: {
    padding: 16,
  },

  // Care History Card
  careHistoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  careHistoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  careHistoryInfo: {
    flex: 1,
  },
  careHistoryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  careHistoryDate: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginTop: 2,
  },

  // Allergies Card
  allergiesCard: {
    backgroundColor: COLORS.allergyBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.allergyBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  allergyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  allergyTagText: {
    fontSize: 13,
    color: '#f87171',
    fontWeight: '500',
  },

  // Section Card
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  conditionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  // Medication Item
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  medicationIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  medicationDosage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Status Row
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statusCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  statusLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  accessText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },

  // Physician Card
  physicianCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  physicianIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  physicianInfo: {
    flex: 1,
  },
  physicianName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  physicianFacility: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  callBtnText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Contact Item
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  contactRelation: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  contactCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  contactCallText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Share EMS Button
  shareEmsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#be185d',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    marginTop: 8,
  },
  shareEmsBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Calendar Modal
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    width: SCREEN_WIDTH - 40,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarMonthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  calendarWeekdays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  calendarWeekday: {
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
    width: `${100/7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayToday: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  calendarDayTextToday: {
    color: '#fff',
    fontWeight: 'bold',
  },
  calendarDayTextFuture: {
    color: COLORS.textMuted,
  },

  // Vitals Modal
  vitalsModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  vitalsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  vitalsCloseBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalsModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  vitalsTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  vitalsTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  vitalsTabActive: {
    backgroundColor: COLORS.primary,
  },
  vitalsTabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  vitalsTabTextActive: {
    color: '#fff',
  },

  // Current Reading Card
  currentReadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
  },
  currentReadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  currentReadingInfo: {},
  currentReadingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  currentReadingUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  currentReadingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  statusDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.low,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.low,
    fontWeight: '500',
  },

  // Chart Card
  chartCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
  },
  chartTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 150,
  },
  chartYAxis: {
    width: 30,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  chartYLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  chartBarGroup: {
    alignItems: 'center',
  },
  chartBarContainer: {
    width: 24,
    height: 100,
    justifyContent: 'flex-end',
  },
  chartBarSystolic: {
    width: '100%',
    backgroundColor: COLORS.vitalBP,
    borderRadius: 4,
  },
  chartBarLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 20,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chartLegendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Log Reading Button
  logReadingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.cardBorder,
    gap: 8,
  },
  logReadingBtnText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Recent History
  recentHistorySection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  recentHistoryTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  historyItemLeft: {},
  historyItemDay: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  historyItemTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyItemValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  historyItemUnit: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Task Modal
  taskModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  taskModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  taskModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  taskModalContent: {
    padding: 16,
  },

  // Completion Toggle
  completionToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  completionToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  completionToggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  completionToggleBtnCant: {
    backgroundColor: COLORS.critical,
  },
  completionToggleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  completionToggleTextActive: {
    color: '#fff',
  },

  // Instructions Card in Modal
  instructionsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionsLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },

  // Photo Section
  photoSection: {
    marginBottom: 20,
  },
  photoSectionTitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 12,
  },
  photoPreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoPreviewImage: {
    width: '100%',
    height: 200,
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  photoUploadBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.cardBorder,
  },
  photoUploadText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  photoOptionsDropdown: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 12,
  },
  photoOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  // Notes Section
  notesSection: {
    marginBottom: 20,
  },
  notesSectionTitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Complete Button
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  completeBtnDisabled: {
    backgroundColor: COLORS.cardLight,
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Placeholder Container
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 12,
  },

  // Menu
  menuContainer: {
    paddingTop: 80,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLogout: {
    marginTop: 20,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 14,
  },
});
