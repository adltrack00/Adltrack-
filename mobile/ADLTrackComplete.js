// ADLTrack - Exact Replica Mobile App for Expo Snack
// Caregiver Dashboard + Patient Profile Modal

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// COLORS - Exact match from screenshots
// ============================================
const COLORS = {
  background: '#000000',
  card: '#1c1c1e',
  cardBorder: '#3a3a3c',
  primary: '#25D366',
  white: '#ffffff',
  textPrimary: '#ffffff',
  textSecondary: '#8e8e93',
  textMuted: '#636366',
  // Priority colors
  critical: '#ef4444',
  standard: '#3b82f6',
  low: '#22c55e',
  // Vital colors
  vitalBP: '#be185d',
  vitalBPBg: 'rgba(190, 24, 93, 0.25)',
  vitalHeart: '#ea580c',
  vitalHeartBg: 'rgba(234, 88, 12, 0.25)',
  vitalTemp: '#3b82f6',
  vitalTempBg: 'rgba(59, 130, 246, 0.25)',
  vitalPain: '#a855f7',
  vitalPainBg: 'rgba(168, 85, 247, 0.25)',
  // Profile specific colors
  careHistoryBg: '#166534',
  careHistoryLight: '#22c55e',
  allergyBg: 'rgba(239, 68, 68, 0.15)',
  allergyBorder: 'rgba(239, 68, 68, 0.4)',
  allergyText: '#f87171',
  allergyTagBg: 'rgba(239, 68, 68, 0.3)',
  conditionIcon: '#f472b6',
  medicationIcon: '#3b82f6',
  codeStatusBg: 'rgba(234, 179, 8, 0.15)',
  codeStatusBorder: 'rgba(234, 179, 8, 0.5)',
  codeStatusText: '#eab308',
  mobilityBg: 'rgba(59, 130, 246, 0.15)',
  mobilityBorder: 'rgba(59, 130, 246, 0.5)',
  mobilityText: '#60a5fa',
  accessIcon: '#10b981',
  emergencyIcon: '#f59e0b',
  shareBtn: '#f43f5e',
  callBtnGreen: '#22c55e',
  callBtnBlue: '#3b82f6',
  badgeRed: '#ef4444',
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
    { name: 'Mary Smith', relation: 'Daughter' },
    { name: 'Tom Smith', relation: 'Son' },
  ],
  physician: { name: 'Dr. Rebecca Johnson', facility: 'Springfield Medical Center' },
};

const VITALS = {
  bp: { systolic: 120, diastolic: 76 },
  heart: 72,
  temp: 98.6,
  pain: 1,
};

const TASKS = [
  { id: 1, title: 'Morning Medication', time: '08:00 AM', priority: 'critical', requiresPhoto: true },
  { id: 2, title: 'Breakfast Assistance', time: '08:30 AM', priority: 'standard', requiresPhoto: false },
  { id: 3, title: 'Morning Walk', time: '10:00 AM', priority: 'low', requiresPhoto: false },
  { id: 4, title: 'Blood Pressure Check', time: '10:30 AM', priority: 'critical', requiresPhoto: true },
  { id: 5, title: 'Hydration Check', time: '11:00 AM', priority: 'low', requiresPhoto: false },
  { id: 6, title: 'Lunch Preparation', time: '12:00 PM', priority: 'standard', requiresPhoto: true },
  { id: 7, title: 'Afternoon Medication', time: '12:30 PM', priority: 'critical', requiresPhoto: true },
  { id: 8, title: 'Rest Period', time: '2:00 PM', priority: 'low', requiresPhoto: false },
  { id: 9, title: 'Physical Therapy Exercises', time: '3:30 PM', priority: 'standard', requiresPhoto: false },
  { id: 10, title: 'Evening Medication', time: '5:00 PM', priority: 'critical', requiresPhoto: true },
  { id: 11, title: 'Dinner Service', time: '6:00 PM', priority: 'standard', requiresPhoto: true },
  { id: 12, title: 'Bedtime Routine', time: '8:00 PM', priority: 'low', requiresPhoto: false },
];

const REQUESTS_COUNT = 2;

// ============================================
// AUTH CONTEXT
// ============================================
const AuthContext = React.createContext(null);
const AuthProvider = ({ children }) => {
  const [user] = useState({ role: 'caregiver', name: 'Sarah Johnson' });
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

const Tab = createBottomTabNavigator();

// ============================================
// PATIENT PROFILE MODAL - Exact Replica
// ============================================
const PatientProfileModal = ({ visible, onClose }) => {
  const today = new Date();
  const formattedDate = `Jan ${today.getDate()}, ${today.getFullYear()}`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.profileContainer}>
        <StatusBar style="light" />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Image Section */}
          <View style={styles.profileHero}>
            <Image source={{ uri: PATIENT.photo }} style={styles.profileHeroImage} />
            
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>

            {/* Camera Button */}
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>

            {/* Patient Info Overlay */}
            <View style={styles.profileHeroOverlay}>
              <Text style={styles.profileName}>{PATIENT.name}</Text>
              <Text style={styles.profileMeta}>Age {PATIENT.age} • DOB: {PATIENT.dob}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.profileContent}>
            {/* Care History Card */}
            <TouchableOpacity style={styles.careHistoryCard}>
              <View style={styles.careHistoryIconBg}>
                <Ionicons name="calendar" size={24} color={COLORS.white} />
              </View>
              <View style={styles.careHistoryInfo}>
                <Text style={styles.careHistoryLabel}>CARE HISTORY</Text>
                <Text style={styles.careHistoryDate}>{formattedDate}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.careHistoryLight} />
            </TouchableOpacity>

            {/* Allergies Card */}
            <View style={styles.allergiesCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="warning" size={20} color={COLORS.allergyText} />
                <Text style={styles.allergiesTitle}>Allergies</Text>
              </View>
              <View style={styles.allergyTags}>
                {PATIENT.allergies.map((allergy, index) => (
                  <View key={index} style={styles.allergyTag}>
                    <Text style={styles.allergyTagText}>{allergy}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Medical Conditions Card */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="heart" size={20} color={COLORS.conditionIcon} />
                <Text style={styles.sectionTitle}>Medical Conditions</Text>
              </View>
              {PATIENT.conditions.map((condition, index) => (
                <View key={index} style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{condition}</Text>
                </View>
              ))}
            </View>

            {/* Current Medications Card */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bandage" size={20} color={COLORS.medicationIcon} />
                <Text style={styles.sectionTitle}>Current Medications</Text>
              </View>
              {PATIENT.medications.map((med, index) => (
                <View key={index} style={styles.medicationItem}>
                  <Text style={styles.medicationName}>{med.name}</Text>
                  <Text style={styles.medicationDetails}> - {med.dosage}, {med.frequency}</Text>
                </View>
              ))}
            </View>

            {/* Code Status & Mobility Row */}
            <View style={styles.statusRow}>
              {/* Code Status */}
              <View style={styles.codeStatusCard}>
                <Ionicons name="shield-outline" size={28} color={COLORS.codeStatusText} />
                <Text style={styles.codeStatusLabel}>CODE STATUS</Text>
                <Text style={styles.codeStatusValue}>{PATIENT.codeStatus}</Text>
              </View>

              {/* Mobility */}
              <View style={styles.mobilityCard}>
                <Ionicons name="pulse" size={28} color={COLORS.mobilityText} />
                <Text style={styles.mobilityLabel}>MOBILITY</Text>
                <Text style={styles.mobilityValue}>{PATIENT.mobility}</Text>
              </View>
            </View>

            {/* Access Instructions Card */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location" size={20} color={COLORS.accessIcon} />
                <Text style={styles.sectionTitle}>Access Instructions</Text>
              </View>
              <Text style={styles.accessText}>{PATIENT.accessInstructions}</Text>
            </View>

            {/* Emergency Contacts Card */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="call" size={20} color={COLORS.emergencyIcon} />
                <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              </View>
              
              {PATIENT.emergencyContacts.map((contact, index) => (
                <View key={index} style={styles.contactItem}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelation}>{contact.relation}</Text>
                  </View>
                  <TouchableOpacity style={styles.callButtonGreen}>
                    <Text style={styles.callButtonText}>Call</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Divider */}
              <View style={styles.contactDivider} />

              {/* Primary Care Physician */}
              <Text style={styles.physicianLabel}>PRIMARY CARE PHYSICIAN</Text>
              <View style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{PATIENT.physician.name}</Text>
                  <Text style={styles.contactRelation}>{PATIENT.physician.facility}</Text>
                </View>
                <TouchableOpacity style={styles.callButtonBlue}>
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Share Medical ID Button */}
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social" size={22} color={COLORS.white} />
              <Text style={styles.shareButtonText}>Share Medical ID for EMS</Text>
            </TouchableOpacity>

            {/* Bottom Spacing */}
            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ============================================
// CAREGIVER HOME SCREEN
// ============================================
const CaregiverHomeScreen = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [expandedTask, setExpandedTask] = useState(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);

  const completedCount = 0;
  const totalCount = 12;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return COLORS.critical;
      case 'standard': return COLORS.standard;
      case 'low': return COLORS.low;
      default: return COLORS.standard;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Patient Card - Clickable to open profile */}
        <TouchableOpacity 
          style={styles.patientCard} 
          activeOpacity={0.8}
          onPress={() => setShowPatientProfile(true)}
        >
          <Image source={{ uri: PATIENT.photo }} style={styles.patientImage} />
          <View style={styles.patientOverlay}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{PATIENT.name}</Text>
              <Text style={styles.patientAge}>{PATIENT.age} years old</Text>
            </View>
            <View style={styles.patientChevron}>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Vitals Grid */}
        <View style={styles.vitalsContainer}>
          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalBPBg }]}>
              <Ionicons name="heart" size={22} color={COLORS.vitalBP} />
            </View>
            <Text style={styles.vitalValue}>{VITALS.bp.systolic}/{VITALS.bp.diastolic}</Text>
            <Text style={styles.vitalLabel}>BP</Text>
          </View>
          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalHeartBg }]}>
              <Ionicons name="pulse" size={22} color={COLORS.vitalHeart} />
            </View>
            <Text style={styles.vitalValue}>{VITALS.heart}</Text>
            <Text style={styles.vitalLabel}>Heart</Text>
          </View>
          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalTempBg }]}>
              <Ionicons name="thermometer" size={22} color={COLORS.vitalTemp} />
            </View>
            <Text style={styles.vitalValue}>{VITALS.temp}°</Text>
            <Text style={styles.vitalLabel}>Temp</Text>
          </View>
          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalPainBg }]}>
              <Ionicons name="sad-outline" size={22} color={COLORS.vitalPain} />
            </View>
            <Text style={styles.vitalValue}>{VITALS.pain}/10</Text>
            <Text style={styles.vitalLabel}>Pain</Text>
          </View>
        </View>

        {/* Today's Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(completedCount / totalCount) * 100}%` }]} />
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('requests')}>
            {REQUESTS_COUNT > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{REQUESTS_COUNT}</Text>
              </View>
            )}
            <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>Requests</Text>
          </TouchableOpacity>
          <View style={styles.tabDivider} />
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('tasks')}>
            <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>Today's Tasks</Text>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        <View style={styles.taskList}>
          {TASKS.map((task) => (
            <TouchableOpacity 
              key={task.id}
              style={styles.taskCard}
              activeOpacity={0.7}
              onPress={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
            >
              <View style={[styles.taskPriorityBar, { backgroundColor: getPriorityColor(task.priority) }]} />
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
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
              <View style={styles.taskChevronContainer}>
                <View style={styles.taskChevronCircle}>
                  <Ionicons name={expandedTask === task.id ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Patient Profile Modal */}
      <PatientProfileModal 
        visible={showPatientProfile} 
        onClose={() => setShowPatientProfile(false)} 
      />
    </View>
  );
};

// Placeholder Screens
const PlaceholderScreen = ({ icon, title }) => (
  <View style={styles.placeholderScreen}>
    <Ionicons name={icon} size={48} color={COLORS.textSecondary} />
    <Text style={styles.placeholderText}>{title}</Text>
  </View>
);

const IncidentScreen = () => <PlaceholderScreen icon="alert-circle-outline" title="Incident Reports" />;
const MessageScreen = () => <PlaceholderScreen icon="chatbubble-outline" title="Messages" />;
const ShiftsScreen = () => <PlaceholderScreen icon="time-outline" title="Shifts" />;
const MenuScreen = () => <PlaceholderScreen icon="settings-outline" title="Menu" />;

// Shifts Icon with Dot
const ShiftsTabIcon = ({ focused, color }) => (
  <View style={styles.shiftsIconContainer}>
    <Ionicons name={focused ? "time" : "time-outline"} size={24} color={color} />
    <View style={styles.shiftsDot} />
  </View>
);

// Tab Navigator
const CaregiverTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textSecondary,
      tabBarLabelStyle: styles.tabBarLabel,
    }}
  >
    <Tab.Screen name="Home" component={CaregiverHomeScreen}
      options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} /> }} />
    <Tab.Screen name="Incident" component={IncidentScreen}
      options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? "warning" : "warning-outline"} size={24} color={color} /> }} />
    <Tab.Screen name="Message" component={MessageScreen}
      options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={24} color={color} /> }} />
    <Tab.Screen name="Shifts" component={ShiftsScreen}
      options={{ tabBarIcon: ({ focused, color }) => <ShiftsTabIcon focused={focused} color={color} /> }} />
    <Tab.Screen name="Menu" component={MenuScreen}
      options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} /> }} />
  </Tab.Navigator>
);

// Main App
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <CaregiverTabs />
      </NavigationContainer>
    </AuthProvider>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Patient Card (Dashboard)
  patientCard: {
    marginHorizontal: 16,
    marginTop: 50,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  patientImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  patientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 60,
  },
  patientInfo: {},
  patientName: { fontSize: 26, fontWeight: 'bold', color: COLORS.white, marginBottom: 2 },
  patientAge: { fontSize: 15, color: 'rgba(255,255,255,0.75)' },
  patientChevron: { marginBottom: 8 },

  // Vitals
  vitalsContainer: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 8 },
  vitalCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center' },
  vitalIconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  vitalValue: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 2 },
  vitalLabel: { fontSize: 13, color: COLORS.textSecondary },

  // Progress
  progressSection: { marginHorizontal: 16, marginTop: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { fontSize: 18, fontWeight: '500', color: COLORS.white },
  progressCount: { fontSize: 16, color: COLORS.textSecondary },
  progressBarBg: { height: 6, backgroundColor: COLORS.card, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },

  // Tab Container
  tabContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 28, marginBottom: 16 },
  tabItem: { position: 'relative' },
  tabBadge: { position: 'absolute', top: -14, left: '50%', marginLeft: -11, backgroundColor: COLORS.badgeRed, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tabBadgeText: { fontSize: 12, fontWeight: 'bold', color: COLORS.white },
  tabText: { fontSize: 18, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white },
  tabDivider: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder, marginHorizontal: 16 },

  // Task List
  taskList: { paddingHorizontal: 16 },
  taskCard: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 10, overflow: 'hidden' },
  taskPriorityBar: { width: 5, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  taskContent: { flex: 1, paddingVertical: 18, paddingLeft: 16, paddingRight: 8 },
  taskTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginBottom: 6 },
  taskMeta: { flexDirection: 'row', alignItems: 'center' },
  taskTime: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 4 },
  photoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 12 },
  photoBadgeText: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 4 },
  taskChevronContainer: { justifyContent: 'center', paddingRight: 12 },
  taskChevronCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  // Tab Bar
  tabBar: { backgroundColor: COLORS.card, borderTopWidth: 0, height: 88, paddingTop: 8, paddingBottom: 28 },
  tabBarLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  shiftsIconContainer: { position: 'relative' },
  shiftsDot: { position: 'absolute', top: -2, right: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },

  // Placeholder
  placeholderScreen: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 18, color: COLORS.textSecondary, marginTop: 12 },

  // ========== PATIENT PROFILE MODAL STYLES ==========
  profileContainer: { flex: 1, backgroundColor: COLORS.background },
  
  // Hero Section
  profileHero: { height: 380, position: 'relative' },
  profileHeroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(60, 60, 60, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    top: 110,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(60, 60, 60, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 80,
  },
  profileName: { fontSize: 32, fontWeight: 'bold', color: COLORS.white },
  profileMeta: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  // Content
  profileContent: { paddingHorizontal: 16, paddingTop: 16 },

  // Care History Card
  careHistoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.careHistoryBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  careHistoryIconBg: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  careHistoryInfo: { flex: 1 },
  careHistoryLabel: { fontSize: 13, fontWeight: '600', color: COLORS.careHistoryLight, marginBottom: 2 },
  careHistoryDate: { fontSize: 20, fontWeight: '600', color: COLORS.white },

  // Allergies Card
  allergiesCard: {
    backgroundColor: COLORS.allergyBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.allergyBorder,
    padding: 18,
    marginBottom: 16,
  },
  allergiesTitle: { fontSize: 18, fontWeight: '600', color: COLORS.allergyText, marginLeft: 10 },
  allergyTags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 10 },
  allergyTag: {
    backgroundColor: COLORS.allergyTagBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  allergyTagText: { fontSize: 15, fontWeight: '500', color: COLORS.allergyText },

  // Section Card
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginLeft: 10 },

  // Bullet Items
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bulletDot: { fontSize: 18, color: COLORS.textSecondary, marginRight: 10, lineHeight: 22 },
  bulletText: { fontSize: 16, color: COLORS.textSecondary, flex: 1, lineHeight: 22 },

  // Medications
  medicationItem: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  medicationName: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  medicationDetails: { fontSize: 16, color: COLORS.textSecondary },

  // Status Row (Code Status & Mobility)
  statusRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  codeStatusCard: {
    flex: 1,
    backgroundColor: COLORS.codeStatusBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.codeStatusBorder,
    padding: 18,
    alignItems: 'center',
  },
  codeStatusLabel: { fontSize: 12, fontWeight: '600', color: COLORS.codeStatusText, marginTop: 10, letterSpacing: 0.5 },
  codeStatusValue: { fontSize: 17, fontWeight: '600', color: COLORS.white, marginTop: 4, textAlign: 'center' },
  mobilityCard: {
    flex: 1,
    backgroundColor: COLORS.mobilityBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.mobilityBorder,
    padding: 18,
    alignItems: 'center',
  },
  mobilityLabel: { fontSize: 12, fontWeight: '600', color: COLORS.mobilityText, marginTop: 10, letterSpacing: 0.5 },
  mobilityValue: { fontSize: 17, fontWeight: '600', color: COLORS.white, marginTop: 4, textAlign: 'center' },

  // Access Instructions
  accessText: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24 },

  // Emergency Contacts
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  contactRelation: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  callButtonGreen: {
    backgroundColor: COLORS.callBtnGreen,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  callButtonBlue: {
    backgroundColor: COLORS.callBtnBlue,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  callButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  contactDivider: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: 16 },
  physicianLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 12, letterSpacing: 0.5 },

  // Share Button
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.shareBtn,
    borderRadius: 14,
    paddingVertical: 18,
    gap: 10,
  },
  shareButtonText: { fontSize: 17, fontWeight: '600', color: COLORS.white },
});
