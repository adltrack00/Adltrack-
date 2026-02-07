// ADLTrack - Exact Replica Mobile App for Expo Snack
// Caregiver Dashboard - Pixel Perfect Recreation

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
  // Priority border colors (exact from screenshots)
  critical: '#ef4444',    // Red
  standard: '#3b82f6',    // Blue
  low: '#22c55e',         // Green
  // Vital icon background colors (exact from screenshots)
  vitalBP: '#be185d',
  vitalBPBg: 'rgba(190, 24, 93, 0.25)',
  vitalHeart: '#ea580c',
  vitalHeartBg: 'rgba(234, 88, 12, 0.25)',
  vitalTemp: '#3b82f6',
  vitalTempBg: 'rgba(59, 130, 246, 0.25)',
  vitalPain: '#a855f7',
  vitalPainBg: 'rgba(168, 85, 247, 0.25)',
  // Badge
  badgeRed: '#ef4444',
};

// ============================================
// MOCK DATA - Exact from screenshots
// ============================================
const PATIENT = {
  name: 'David Smith',
  age: 78,
  photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
};

const VITALS = {
  bp: { systolic: 120, diastolic: 76 },
  heart: 72,
  temp: 98.6,
  pain: 1,
};

// Tasks exactly as shown in screenshots with correct priority colors
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
// AUTH CONTEXT (Simple for demo)
// ============================================
const AuthContext = React.createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ role: 'caregiver', name: 'Sarah Johnson' }); // Auto logged in for testing
  const login = () => setUser({ role: 'caregiver', name: 'Sarah Johnson' });
  const logout = () => setUser(null);
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

// ============================================
// TAB NAVIGATOR
// ============================================
const Tab = createBottomTabNavigator();

// ============================================
// CAREGIVER HOME SCREEN - Exact Replica
// ============================================
const CaregiverHomeScreen = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [expandedTask, setExpandedTask] = useState(null);

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
        {/* Patient Card with Photo */}
        <TouchableOpacity style={styles.patientCard} activeOpacity={0.8}>
          <Image 
            source={{ uri: PATIENT.photo }} 
            style={styles.patientImage}
          />
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

        {/* Vitals Grid - 4 cards in a row */}
        <View style={styles.vitalsContainer}>
          {/* BP */}
          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalBPBg }]}>
              <Ionicons name="heart" size={22} color={COLORS.vitalBP} />
            </View>
            <Text style={styles.vitalValue}>{VITALS.bp.systolic}/{VITALS.bp.diastolic}</Text>
            <Text style={styles.vitalLabel}>BP</Text>
          </View>

          {/* Heart */}
          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalHeartBg }]}>
              <Ionicons name="pulse" size={22} color={COLORS.vitalHeart} />
            </View>
            <Text style={styles.vitalValue}>{VITALS.heart}</Text>
            <Text style={styles.vitalLabel}>Heart</Text>
          </View>

          {/* Temp */}
          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalTempBg }]}>
              <Ionicons name="thermometer" size={22} color={COLORS.vitalTemp} />
            </View>
            <Text style={styles.vitalValue}>{VITALS.temp}°</Text>
            <Text style={styles.vitalLabel}>Temp</Text>
          </View>

          {/* Pain */}
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
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => setActiveTab('requests')}
          >
            {/* Badge positioned above text */}
            {REQUESTS_COUNT > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{REQUESTS_COUNT}</Text>
              </View>
            )}
            <Text style={[
              styles.tabText,
              activeTab === 'requests' && styles.tabTextActive
            ]}>Requests</Text>
          </TouchableOpacity>

          <View style={styles.tabDivider} />

          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => setActiveTab('tasks')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'tasks' && styles.tabTextActive
            ]}>Today's Tasks</Text>
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
              {/* Priority Color Bar */}
              <View style={[styles.taskPriorityBar, { backgroundColor: getPriorityColor(task.priority) }]} />
              
              {/* Task Content */}
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

              {/* Chevron Button */}
              <View style={styles.taskChevronContainer}>
                <View style={styles.taskChevronCircle}>
                  <Ionicons 
                    name={expandedTask === task.id ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={COLORS.textSecondary} 
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// ============================================
// PLACEHOLDER SCREENS
// ============================================
const IncidentScreen = () => (
  <View style={styles.placeholderScreen}>
    <Ionicons name="alert-circle-outline" size={48} color={COLORS.textSecondary} />
    <Text style={styles.placeholderText}>Incident Reports</Text>
  </View>
);

const MessageScreen = () => (
  <View style={styles.placeholderScreen}>
    <Ionicons name="chatbubble-outline" size={48} color={COLORS.textSecondary} />
    <Text style={styles.placeholderText}>Messages</Text>
  </View>
);

const ShiftsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Ionicons name="time-outline" size={48} color={COLORS.textSecondary} />
    <Text style={styles.placeholderText}>Shifts</Text>
  </View>
);

const MenuScreen = () => (
  <View style={styles.placeholderScreen}>
    <Ionicons name="settings-outline" size={48} color={COLORS.textSecondary} />
    <Text style={styles.placeholderText}>Menu</Text>
  </View>
);

// ============================================
// CUSTOM TAB BAR ICON WITH DOT
// ============================================
const ShiftsTabIcon = ({ focused, color }) => (
  <View style={styles.shiftsIconContainer}>
    <Ionicons name={focused ? "time" : "time-outline"} size={24} color={color} />
    <View style={styles.shiftsDot} />
  </View>
);

// ============================================
// TAB NAVIGATOR
// ============================================
const CaregiverTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={CaregiverHomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Incident" 
        component={IncidentScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "warning" : "warning-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Message" 
        component={MessageScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Shifts" 
        component={ShiftsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <ShiftsTabIcon focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Menu" 
        component={MenuScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ============================================
// MAIN APP
// ============================================
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
// STYLES - Pixel Perfect
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Patient Card
  patientCard: {
    marginHorizontal: 16,
    marginTop: 50,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  patientImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
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
    backgroundColor: 'transparent',
  },
  patientInfo: {},
  patientName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 2,
  },
  patientAge: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
  },
  patientChevron: {
    marginBottom: 8,
  },

  // Vitals Container
  vitalsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  vitalIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  vitalLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Progress Section
  progressSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.white,
  },
  progressCount: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.card,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },

  // Tab Container
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 28,
    marginBottom: 16,
  },
  tabItem: {
    position: 'relative',
  },
  tabBadge: {
    position: 'absolute',
    top: -14,
    left: '50%',
    marginLeft: -11,
    backgroundColor: COLORS.badgeRed,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  tabText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  tabDivider: {
    flex: 1,
    height: 1,
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
    marginBottom: 10,
    overflow: 'hidden',
  },
  taskPriorityBar: {
    width: 5,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  taskContent: {
    flex: 1,
    paddingVertical: 18,
    paddingLeft: 16,
    paddingRight: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  photoBadgeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  taskChevronContainer: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  taskChevronCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // Tab Bar
  tabBar: {
    backgroundColor: COLORS.card,
    borderTopWidth: 0,
    height: 88,
    paddingTop: 8,
    paddingBottom: 28,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },

  // Shifts Icon with Dot
  shiftsIconContainer: {
    position: 'relative',
  },
  shiftsDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  // Placeholder Screens
  placeholderScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});
