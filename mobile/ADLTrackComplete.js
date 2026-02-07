// ADLTrack - Exact Replica Mobile App for Expo Snack
// Caregiver Dashboard + Patient Profile + Care History + Requests + Vital Signs

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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// COLORS
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
  critical: '#ef4444',
  standard: '#3b82f6',
  low: '#22c55e',
  completed: '#f59e0b',
  vitalBP: '#be185d',
  vitalBPBg: 'rgba(190, 24, 93, 0.25)',
  vitalHeart: '#ea580c',
  vitalHeartBg: 'rgba(234, 88, 12, 0.25)',
  vitalTemp: '#3b82f6',
  vitalTempBg: 'rgba(59, 130, 246, 0.25)',
  vitalPain: '#a855f7',
  vitalPainBg: 'rgba(168, 85, 247, 0.25)',
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
  historyBannerBg: 'rgba(180, 130, 20, 0.2)',
  historyBannerBorder: 'rgba(234, 179, 8, 0.6)',
  historyIconBg: 'rgba(234, 179, 8, 0.3)',
  historyText: '#eab308',
  historyButtonBg: '#f59e0b',
  requestBorder: '#6366f1',
  acceptBtn: '#22c55e',
  declineBtn: '#3a3a3c',
  declineReasonBg: '#2c2c2e',
  declineReasonSelected: 'rgba(239, 68, 68, 0.2)',
  declineReasonSelectedBorder: '#ef4444',
  declineReasonText: '#ef4444',
  confirmBtn: '#f43f5e',
  confirmBtnDisabled: '#4a4a4c',
  fabBg: '#3a3a3c',
  // Vital Signs colors
  vitalCardBg: '#4a1525',
  vitalCardBgDark: '#3d1120',
  chartBg: '#2c2c2e',
  chartLine: '#3a3a3c',
  systolicColor: '#f43f5e',
  diastolicColor: '#f59e0b',
  inputBg: '#3a3a3c',
  // Heart Rate colors
  heartCardBg: '#5c3d1e',
  heartColor: '#ea580c',
  // Temperature colors
  tempCardBg: '#1e3a5f',
  tempColor: '#3b82f6',
  // Pain colors
  painCardBg: '#3d2963',
  painColor: '#a855f7',
};

// ============================================
// MOCK DATA
// ============================================
const PATIENT = {
  name: 'David Smith',
  age: 78,
  dob: '1946-03-15',
  photo: 'https://customer-assets.emergentagent.com/job_adlcare-expo/artifacts/0kd0031g_IMG_9932.jpeg',
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

const INITIAL_TASKS = [
  { id: 1, title: 'Morning Medication', time: '08:00 AM', priority: 'critical', requiresPhoto: true, instructions: 'Give 2 tablets of Metformin with food. Ensure patient drinks full glass of water.', timeWindow: '7:30 AM - 9:00 AM' },
  { id: 2, title: 'Breakfast Assistance', time: '08:30 AM', priority: 'standard', requiresPhoto: false, instructions: 'Assist patient with breakfast. Ensure balanced meal with protein and fiber.', timeWindow: '8:00 AM - 9:30 AM' },
  { id: 3, title: 'Morning Walk', time: '10:00 AM', priority: 'low', requiresPhoto: false, instructions: 'Take patient for a 15-minute walk around the house or garden.', timeWindow: '9:30 AM - 11:00 AM' },
  { id: 4, title: 'Blood Pressure Check', time: '10:30 AM', priority: 'critical', requiresPhoto: true, instructions: 'Check blood pressure using the arm cuff. Record systolic and diastolic values.', timeWindow: '10:00 AM - 11:30 AM' },
  { id: 5, title: 'Hydration Check', time: '11:00 AM', priority: 'low', requiresPhoto: false, instructions: 'Ensure patient has consumed at least 2 glasses of water since morning.', timeWindow: '10:30 AM - 12:00 PM' },
  { id: 6, title: 'Lunch Preparation', time: '12:00 PM', priority: 'standard', requiresPhoto: true, instructions: 'Prepare a balanced lunch. Include vegetables and lean protein.', timeWindow: '11:30 AM - 1:00 PM' },
  { id: 7, title: 'Afternoon Medication', time: '12:30 PM', priority: 'critical', requiresPhoto: true, instructions: 'Give afternoon dose of Lisinopril with lunch.', timeWindow: '12:00 PM - 1:30 PM' },
  { id: 8, title: 'Rest Period', time: '2:00 PM', priority: 'low', requiresPhoto: false, instructions: 'Ensure patient rests comfortably. Check on them every 30 minutes.', timeWindow: '1:30 PM - 3:00 PM' },
  { id: 9, title: 'Physical Therapy Exercises', time: '3:30 PM', priority: 'standard', requiresPhoto: false, instructions: 'Guide patient through prescribed physical therapy exercises.', timeWindow: '3:00 PM - 4:30 PM' },
  { id: 10, title: 'Evening Medication', time: '5:00 PM', priority: 'critical', requiresPhoto: true, instructions: 'Give evening dose of Aspirin with a snack.', timeWindow: '4:30 PM - 6:00 PM' },
  { id: 11, title: 'Dinner Service', time: '6:00 PM', priority: 'standard', requiresPhoto: true, instructions: 'Serve dinner and assist patient as needed.', timeWindow: '5:30 PM - 7:00 PM' },
  { id: 12, title: 'Bedtime Routine', time: '8:00 PM', priority: 'low', requiresPhoto: false, instructions: 'Help patient prepare for bed. Ensure comfortable sleeping environment.', timeWindow: '7:30 PM - 9:00 PM' },
];

const CANT_COMPLETE_REASONS = [
  'Schedule Conflict',
  'Patient Refused',
  'Not Certified for This Task',
  'Safety Concern',
  'Need More Information',
  'Other',
];

const INITIAL_REQUESTS = [
  { 
    id: 101, 
    title: 'Extra Walk in Garden', 
    time: '4:00 PM', 
    requester: 'Mary Smith',
    relation: 'Daughter',
    description: 'Take a short walk in the backyard garden',
  },
  { 
    id: 102, 
    title: 'Video Call with Grandchildren', 
    time: '5:30 PM', 
    requester: 'Tom Smith',
    relation: 'Son',
    description: 'Help set up tablet for video call',
  },
];

const DECLINE_REASONS = [
  'Schedule Conflict',
  'Patient Refused',
  'Not Certified for This Task',
  'Safety Concern',
  'Need More Information',
  'Other',
];

const INITIAL_BP_HISTORY = [
  { id: 1, day: 'Sun', time: '10:30 AM', systolic: 120, diastolic: 76 },
  { id: 2, day: 'Sat', time: '10:35 AM', systolic: 121, diastolic: 78 },
  { id: 3, day: 'Fri', time: '10:20 AM', systolic: 119, diastolic: 75 },
  { id: 4, day: 'Thu', time: '10:30 AM', systolic: 120, diastolic: 77 },
  { id: 5, day: 'Wed', time: '10:45 AM', systolic: 125, diastolic: 80 },
  { id: 6, day: 'Tue', time: '10:30 AM', systolic: 122, diastolic: 79 },
  { id: 7, day: 'Mon', time: '10:15 AM', systolic: 118, diastolic: 76 },
];

const INITIAL_HEART_HISTORY = [
  { id: 1, day: 'Sun', time: '10:30 AM', value: 72 },
  { id: 2, day: 'Sat', time: '10:35 AM', value: 69 },
  { id: 3, day: 'Fri', time: '10:20 AM', value: 71 },
  { id: 4, day: 'Thu', time: '10:30 AM', value: 70 },
  { id: 5, day: 'Wed', time: '10:45 AM', value: 75 },
  { id: 6, day: 'Tue', time: '10:30 AM', value: 73 },
  { id: 7, day: 'Mon', time: '10:15 AM', value: 74 },
];

const INITIAL_TEMP_HISTORY = [
  { id: 1, day: 'Sun', time: '10:30 AM', value: 98.6 },
  { id: 2, day: 'Sat', time: '10:35 AM', value: 98.4 },
  { id: 3, day: 'Fri', time: '10:20 AM', value: 98.7 },
  { id: 4, day: 'Thu', time: '10:30 AM', value: 98.5 },
  { id: 5, day: 'Wed', time: '10:45 AM', value: 98.2 },
  { id: 6, day: 'Tue', time: '10:30 AM', value: 98.3 },
  { id: 7, day: 'Mon', time: '10:15 AM', value: 98.4 },
];

const INITIAL_PAIN_HISTORY = [
  { id: 1, day: 'Sun', time: '10:30 AM', value: 1 },
  { id: 2, day: 'Sat', time: '10:35 AM', value: 2 },
  { id: 3, day: 'Fri', time: '10:20 AM', value: 2 },
  { id: 4, day: 'Thu', time: '10:30 AM', value: 1 },
  { id: 5, day: 'Wed', time: '10:45 AM', value: 2 },
  { id: 6, day: 'Tue', time: '10:30 AM', value: 3 },
  { id: 7, day: 'Mon', time: '10:15 AM', value: 2 },
];

const HISTORY_TASKS = {
  '2026-01-16': [
    { id: 1, title: 'Morning Medication', completedTime: '8:15 AM', notes: 'Took all medications with breakfast', photo: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=200' },
    { id: 2, title: 'Breakfast Assistance', completedTime: '8:45 AM', notes: 'Had oatmeal and fruit', photo: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200' },
    { id: 3, title: 'Blood Pressure Check', completedTime: '10:30 AM', notes: 'BP: 128/82', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200' },
  ],
  '2026-01-15': [
    { id: 1, title: 'Morning Medication', completedTime: '8:00 AM', notes: 'All meds taken', photo: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=200' },
    { id: 2, title: 'Lunch Preparation', completedTime: '12:00 PM', notes: 'Chicken salad', photo: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200' },
  ],
  '2026-01-14': [
    { id: 1, title: 'Morning Medication', completedTime: '8:10 AM', notes: 'Completed with juice', photo: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=200' },
  ],
  '2026-01-13': [
    { id: 1, title: 'Blood Pressure Check', completedTime: '10:00 AM', notes: 'BP: 125/80', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200' },
    { id: 2, title: 'Evening Medication', completedTime: '5:30 PM', notes: 'All evening meds', photo: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=200' },
  ],
  '2026-01-10': [
    { id: 1, title: 'Morning Walk', completedTime: '10:00 AM', notes: '15 min walk completed', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200' },
  ],
};

const CARE_ACTIVITY_DATES = [10, 13, 14, 15, 16];

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
// BLOOD PRESSURE CHART COMPONENT
// ============================================
const BPChart = ({ data, selectedDay, onSelectDay }) => {
  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = 180;
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const yLabels = [160, 135, 110, 85, 60];
  const minY = 60;
  const maxY = 160;
  
  const getY = (value) => {
    const ratio = (value - minY) / (maxY - minY);
    return paddingTop + graphHeight - (ratio * graphHeight);
  };
  
  const getX = (index) => {
    return paddingLeft + (index * (graphWidth / 6));
  };

  // Get data for each day
  const getDataForDay = (day) => {
    const reading = data.find(d => d.day === day);
    return reading || null;
  };

  return (
    <View style={styles.chartContainer}>
      {/* Y-axis labels */}
      {yLabels.map((label, index) => (
        <Text key={label} style={[styles.yAxisLabel, { top: getY(label) - 8 }]}>
          {label}
        </Text>
      ))}
      
      {/* Grid lines */}
      <View style={styles.chartGrid}>
        {yLabels.map((label, index) => (
          <View 
            key={label} 
            style={[styles.gridLine, { top: getY(label) - paddingTop }]} 
          />
        ))}
        {days.map((day, index) => (
          <View 
            key={day} 
            style={[styles.verticalGridLine, { left: getX(index) - paddingLeft }]} 
          />
        ))}
      </View>

      {/* Chart area */}
      <View style={[styles.chartArea, { marginLeft: paddingLeft }]}>
        {/* Systolic line (pink) */}
        <View style={styles.lineContainer}>
          {days.map((day, index) => {
            const reading = getDataForDay(day);
            if (!reading) return null;
            const nextDay = days[index + 1];
            const nextReading = getDataForDay(nextDay);
            
            if (nextReading) {
              const x1 = getX(index) - paddingLeft;
              const y1 = getY(reading.systolic) - paddingTop;
              const x2 = getX(index + 1) - paddingLeft;
              const y2 = getY(nextReading.systolic) - paddingTop;
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              
              return (
                <View
                  key={`systolic-line-${index}`}
                  style={[
                    styles.chartLine,
                    {
                      width: length,
                      left: x1,
                      top: y1,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: COLORS.systolicColor,
                    },
                  ]}
                />
              );
            }
            return null;
          })}
        </View>

        {/* Diastolic line (orange) */}
        <View style={styles.lineContainer}>
          {days.map((day, index) => {
            const reading = getDataForDay(day);
            if (!reading) return null;
            const nextDay = days[index + 1];
            const nextReading = getDataForDay(nextDay);
            
            if (nextReading) {
              const x1 = getX(index) - paddingLeft;
              const y1 = getY(reading.diastolic) - paddingTop;
              const x2 = getX(index + 1) - paddingLeft;
              const y2 = getY(nextReading.diastolic) - paddingTop;
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              
              return (
                <View
                  key={`diastolic-line-${index}`}
                  style={[
                    styles.chartLine,
                    {
                      width: length,
                      left: x1,
                      top: y1,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: COLORS.diastolicColor,
                    },
                  ]}
                />
              );
            }
            return null;
          })}
        </View>

        {/* Data points */}
        {days.map((day, index) => {
          const reading = getDataForDay(day);
          if (!reading) return null;
          
          const isSelected = selectedDay === day;
          
          return (
            <TouchableOpacity
              key={`point-${day}`}
              style={[styles.dataPointTouchable, { left: getX(index) - paddingLeft - 15, top: 0, height: graphHeight }]}
              onPress={() => onSelectDay(day)}
            >
              {/* Systolic point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    backgroundColor: isSelected ? COLORS.background : COLORS.systolicColor,
                    borderColor: COLORS.systolicColor,
                    borderWidth: isSelected ? 2 : 0,
                    top: getY(reading.systolic) - paddingTop - 5,
                    left: 10,
                  },
                ]}
              />
              {/* Diastolic point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    backgroundColor: isSelected ? COLORS.background : COLORS.diastolicColor,
                    borderColor: COLORS.diastolicColor,
                    borderWidth: isSelected ? 2 : 0,
                    top: getY(reading.diastolic) - paddingTop - 5,
                    left: 10,
                  },
                ]}
              />
              
              {/* Tooltip */}
              {isSelected && (
                <View style={[styles.tooltip, { top: getY(reading.systolic) - paddingTop - 70 }]}>
                  <View style={styles.tooltipVerticalLine} />
                  <View style={styles.tooltipContent}>
                    <Text style={styles.tooltipDay}>{day}</Text>
                    <Text style={styles.tooltipDiastolic}>diastolic : {reading.diastolic}</Text>
                    <Text style={styles.tooltipSystolic}>systolic : {reading.systolic}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisContainer}>
        {days.map((day, index) => (
          <Text key={day} style={[styles.xAxisLabel, { left: getX(index) - 12 }]}>
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
};

// ============================================
// VITAL SIGNS MODAL (Blood Pressure)
// ============================================
const VitalSignsModal = ({ visible, onClose, vitals, onUpdateVitals }) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [systolicInput, setSystolicInput] = useState('');
  const [diastolicInput, setDiastolicInput] = useState('');
  const [bpHistory, setBpHistory] = useState(INITIAL_BP_HISTORY);
  const [selectedDay, setSelectedDay] = useState('Fri');

  const handleSave = () => {
    if (systolicInput && diastolicInput) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayStr = days[now.getDay()];
      
      const newReading = {
        id: Date.now(),
        day: dayStr,
        time: timeStr,
        systolic: parseInt(systolicInput),
        diastolic: parseInt(diastolicInput),
      };
      
      setBpHistory([newReading, ...bpHistory]);
      onUpdateVitals({
        ...vitals,
        bp: { systolic: parseInt(systolicInput), diastolic: parseInt(diastolicInput) }
      });
      
      setSystolicInput('');
      setDiastolicInput('');
      setShowLogForm(false);
    }
  };

  const handleCancel = () => {
    setSystolicInput('');
    setDiastolicInput('');
    setShowLogForm(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.vitalModalContainer}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.vitalModalHeader}>
          <Text style={styles.vitalModalTitle}>Vital Signs</Text>
          <TouchableOpacity onPress={onClose} style={styles.vitalModalClose}>
            <Ionicons name="close" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Reading Card */}
          <View style={styles.currentReadingCard}>
            <View style={styles.currentReadingIconBg}>
              <Ionicons name="heart-outline" size={32} color={COLORS.vitalBP} />
            </View>
            <Text style={styles.currentReadingValue}>
              {vitals.bp.systolic}/{vitals.bp.diastolic}
            </Text>
            <Text style={styles.currentReadingLabel}>Current Reading</Text>
          </View>

          {/* Weekly Trend Chart */}
          <View style={styles.chartWrapper}>
            <BPChart 
              data={bpHistory} 
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </View>
          <Text style={styles.weeklyTrendLabel}>Weekly trend</Text>

          {/* Log New Reading Button/Form */}
          {!showLogForm ? (
            <TouchableOpacity 
              style={styles.logNewReadingBtn}
              onPress={() => setShowLogForm(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.textSecondary} />
              <Text style={styles.logNewReadingText}>Log New Reading</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logFormContainer}>
              <Text style={styles.logFormTitle}>Log New Reading</Text>
              <View style={styles.logFormInputs}>
                <TextInput
                  style={styles.logFormInput}
                  placeholder="Systolic"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={systolicInput}
                  onChangeText={setSystolicInput}
                />
                <TextInput
                  style={styles.logFormInput}
                  placeholder="Diastolic"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={diastolicInput}
                  onChangeText={setDiastolicInput}
                />
              </View>
              <View style={styles.logFormButtons}>
                <TouchableOpacity style={styles.logFormCancelBtn} onPress={handleCancel}>
                  <Text style={styles.logFormCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logFormSaveBtn} onPress={handleSave}>
                  <Text style={styles.logFormSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recent History */}
          <Text style={styles.recentHistoryTitle}>RECENT HISTORY</Text>
          <View style={styles.recentHistoryList}>
            {bpHistory.slice(0, 5).map((reading) => (
              <View key={reading.id} style={styles.historyItem}>
                <Text style={styles.historyItemTime}>{reading.day} at {reading.time}</Text>
                <Text style={styles.historyItemValue}>{reading.systolic}/{reading.diastolic}</Text>
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
// HEART RATE CHART COMPONENT
// ============================================
const HeartRateChart = ({ data, selectedDay, onSelectDay }) => {
  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = 180;
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const yLabels = [80, 60, 40, 20, 0];
  const minY = 0;
  const maxY = 80;
  
  const getY = (value) => {
    const ratio = (value - minY) / (maxY - minY);
    return paddingTop + graphHeight - (ratio * graphHeight);
  };
  
  const getX = (index) => {
    return paddingLeft + (index * (graphWidth / 6));
  };

  const getDataForDay = (day) => {
    const reading = data.find(d => d.day === day);
    return reading || null;
  };

  return (
    <View style={styles.chartContainer}>
      {/* Y-axis labels */}
      {yLabels.map((label) => (
        <Text key={label} style={[styles.yAxisLabel, { top: getY(label) - 8 }]}>
          {label}
        </Text>
      ))}
      
      {/* Grid lines */}
      <View style={styles.chartGrid}>
        {yLabels.map((label) => (
          <View 
            key={label} 
            style={[styles.gridLine, { top: getY(label) - paddingTop }]} 
          />
        ))}
        {days.map((day, index) => (
          <View 
            key={day} 
            style={[styles.verticalGridLine, { left: getX(index) - paddingLeft }]} 
          />
        ))}
      </View>

      {/* Chart area */}
      <View style={[styles.chartArea, { marginLeft: paddingLeft }]}>
        {/* Heart rate line (orange) */}
        <View style={styles.lineContainer}>
          {days.map((day, index) => {
            const reading = getDataForDay(day);
            if (!reading) return null;
            const nextDay = days[index + 1];
            const nextReading = getDataForDay(nextDay);
            
            if (nextReading) {
              const x1 = getX(index) - paddingLeft;
              const y1 = getY(reading.value) - paddingTop;
              const x2 = getX(index + 1) - paddingLeft;
              const y2 = getY(nextReading.value) - paddingTop;
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              
              return (
                <View
                  key={`heart-line-${index}`}
                  style={[
                    styles.chartLine,
                    {
                      width: length,
                      left: x1,
                      top: y1,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: COLORS.heartColor,
                    },
                  ]}
                />
              );
            }
            return null;
          })}
        </View>

        {/* Data points */}
        {days.map((day, index) => {
          const reading = getDataForDay(day);
          if (!reading) return null;
          
          const isSelected = selectedDay === day;
          
          return (
            <TouchableOpacity
              key={`point-${day}`}
              style={[styles.dataPointTouchable, { left: getX(index) - paddingLeft - 15, top: 0, height: graphHeight }]}
              onPress={() => onSelectDay(day)}
            >
              {/* Heart rate point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    backgroundColor: isSelected ? COLORS.background : COLORS.heartColor,
                    borderColor: COLORS.heartColor,
                    borderWidth: isSelected ? 2 : 0,
                    top: getY(reading.value) - paddingTop - 5,
                    left: 10,
                  },
                ]}
              />
              
              {/* Tooltip */}
              {isSelected && (
                <View style={[styles.tooltip, { top: getY(reading.value) - paddingTop - 70 }]}>
                  <View style={styles.tooltipVerticalLine} />
                  <View style={styles.tooltipContent}>
                    <Text style={styles.tooltipDay}>{day}</Text>
                    <Text style={[styles.tooltipSystolic, { color: COLORS.heartColor }]}>value : {reading.value}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisContainer}>
        {days.map((day, index) => (
          <Text key={day} style={[styles.xAxisLabel, { left: getX(index) - 12 }]}>
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
};

// ============================================
// HEART RATE MODAL
// ============================================
const HeartRateModal = ({ visible, onClose, vitals, onUpdateVitals }) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [heartInput, setHeartInput] = useState('');
  const [heartHistory, setHeartHistory] = useState(INITIAL_HEART_HISTORY);
  const [selectedDay, setSelectedDay] = useState('Thu');

  const handleSave = () => {
    if (heartInput) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayStr = days[now.getDay()];
      
      const newReading = {
        id: Date.now(),
        day: dayStr,
        time: timeStr,
        value: parseInt(heartInput),
      };
      
      setHeartHistory([newReading, ...heartHistory]);
      onUpdateVitals({
        ...vitals,
        heart: parseInt(heartInput)
      });
      
      setHeartInput('');
      setShowLogForm(false);
    }
  };

  const handleCancel = () => {
    setHeartInput('');
    setShowLogForm(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.vitalModalContainer}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.vitalModalHeader}>
          <Text style={styles.vitalModalTitle}>Vital Signs</Text>
          <TouchableOpacity onPress={onClose} style={styles.vitalModalClose}>
            <Ionicons name="close" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Reading Card */}
          <View style={[styles.currentReadingCard, { backgroundColor: COLORS.heartCardBg }]}>
            <View style={[styles.currentReadingIconBg, { backgroundColor: 'rgba(234, 88, 12, 0.4)' }]}>
              <Ionicons name="pulse" size={32} color={COLORS.heartColor} />
            </View>
            <Text style={styles.currentReadingValue}>
              {vitals.heart} bpm
            </Text>
            <Text style={styles.currentReadingLabel}>Current Reading</Text>
          </View>

          {/* Weekly Trend Chart */}
          <View style={styles.chartWrapper}>
            <HeartRateChart 
              data={heartHistory} 
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </View>
          <Text style={styles.weeklyTrendLabel}>Weekly trend</Text>

          {/* Log New Reading Button/Form */}
          {!showLogForm ? (
            <TouchableOpacity 
              style={styles.logNewReadingBtn}
              onPress={() => setShowLogForm(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.textSecondary} />
              <Text style={styles.logNewReadingText}>Log New Reading</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logFormContainer}>
              <Text style={styles.logFormTitle}>Log New Reading</Text>
              <TextInput
                style={[styles.logFormInput, { marginBottom: 16 }]}
                placeholder="Heart Rate (BPM)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={heartInput}
                onChangeText={setHeartInput}
              />
              <View style={styles.logFormButtons}>
                <TouchableOpacity style={styles.logFormCancelBtn} onPress={handleCancel}>
                  <Text style={styles.logFormCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logFormSaveBtn} onPress={handleSave}>
                  <Text style={styles.logFormSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recent History */}
          <Text style={styles.recentHistoryTitle}>RECENT HISTORY</Text>
          <View style={styles.recentHistoryList}>
            {heartHistory.slice(0, 5).map((reading) => (
              <View key={reading.id} style={styles.historyItem}>
                <Text style={styles.historyItemTime}>{reading.day} at {reading.time}</Text>
                <Text style={styles.historyItemValue}>{reading.value}</Text>
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
// TEMPERATURE CHART COMPONENT
// ============================================
const TemperatureChart = ({ data, selectedDay, onSelectDay }) => {
  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = 180;
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const yLabels = [100, 75, 50, 25, 0];
  const minY = 0;
  const maxY = 100;
  
  const getY = (value) => {
    const ratio = (value - minY) / (maxY - minY);
    return paddingTop + graphHeight - (ratio * graphHeight);
  };
  
  const getX = (index) => {
    return paddingLeft + (index * (graphWidth / 6));
  };

  const getDataForDay = (day) => {
    const reading = data.find(d => d.day === day);
    return reading || null;
  };

  return (
    <View style={styles.chartContainer}>
      {/* Y-axis labels */}
      {yLabels.map((label) => (
        <Text key={label} style={[styles.yAxisLabel, { top: getY(label) - 8 }]}>
          {label}
        </Text>
      ))}
      
      {/* Grid lines */}
      <View style={styles.chartGrid}>
        {yLabels.map((label) => (
          <View 
            key={label} 
            style={[styles.gridLine, { top: getY(label) - paddingTop }]} 
          />
        ))}
        {days.map((day, index) => (
          <View 
            key={day} 
            style={[styles.verticalGridLine, { left: getX(index) - paddingLeft }]} 
          />
        ))}
      </View>

      {/* Chart area */}
      <View style={[styles.chartArea, { marginLeft: paddingLeft }]}>
        {/* Temperature line (blue) */}
        <View style={styles.lineContainer}>
          {days.map((day, index) => {
            const reading = getDataForDay(day);
            if (!reading) return null;
            const nextDay = days[index + 1];
            const nextReading = getDataForDay(nextDay);
            
            if (nextReading) {
              const x1 = getX(index) - paddingLeft;
              const y1 = getY(reading.value) - paddingTop;
              const x2 = getX(index + 1) - paddingLeft;
              const y2 = getY(nextReading.value) - paddingTop;
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              
              return (
                <View
                  key={`temp-line-${index}`}
                  style={[
                    styles.chartLine,
                    {
                      width: length,
                      left: x1,
                      top: y1,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: COLORS.tempColor,
                    },
                  ]}
                />
              );
            }
            return null;
          })}
        </View>

        {/* Data points */}
        {days.map((day, index) => {
          const reading = getDataForDay(day);
          if (!reading) return null;
          
          const isSelected = selectedDay === day;
          
          return (
            <TouchableOpacity
              key={`point-${day}`}
              style={[styles.dataPointTouchable, { left: getX(index) - paddingLeft - 15, top: 0, height: graphHeight }]}
              onPress={() => onSelectDay(day)}
            >
              {/* Temperature point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    backgroundColor: isSelected ? COLORS.background : COLORS.tempColor,
                    borderColor: COLORS.tempColor,
                    borderWidth: isSelected ? 2 : 0,
                    top: getY(reading.value) - paddingTop - 5,
                    left: 10,
                  },
                ]}
              />
              
              {/* Tooltip */}
              {isSelected && (
                <View style={[styles.tooltip, { top: getY(reading.value) - paddingTop - 70 }]}>
                  <View style={styles.tooltipVerticalLine} />
                  <View style={styles.tooltipContent}>
                    <Text style={styles.tooltipDay}>{day}</Text>
                    <Text style={[styles.tooltipSystolic, { color: COLORS.tempColor }]}>value : {reading.value}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisContainer}>
        {days.map((day, index) => (
          <Text key={day} style={[styles.xAxisLabel, { left: getX(index) - 12 }]}>
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
};

// ============================================
// TEMPERATURE MODAL
// ============================================
const TemperatureModal = ({ visible, onClose, vitals, onUpdateVitals }) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [tempInput, setTempInput] = useState('');
  const [tempHistory, setTempHistory] = useState(INITIAL_TEMP_HISTORY);
  const [selectedDay, setSelectedDay] = useState('Sat');

  const handleSave = () => {
    if (tempInput) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayStr = days[now.getDay()];
      
      const newReading = {
        id: Date.now(),
        day: dayStr,
        time: timeStr,
        value: parseFloat(tempInput),
      };
      
      setTempHistory([newReading, ...tempHistory]);
      onUpdateVitals({
        ...vitals,
        temp: parseFloat(tempInput)
      });
      
      setTempInput('');
      setShowLogForm(false);
    }
  };

  const handleCancel = () => {
    setTempInput('');
    setShowLogForm(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.vitalModalContainer}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.vitalModalHeader}>
          <Text style={styles.vitalModalTitle}>Vital Signs</Text>
          <TouchableOpacity onPress={onClose} style={styles.vitalModalClose}>
            <Ionicons name="close" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Reading Card */}
          <View style={[styles.currentReadingCard, { backgroundColor: COLORS.tempCardBg }]}>
            <View style={[styles.currentReadingIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.4)' }]}>
              <Ionicons name="thermometer" size={32} color={COLORS.tempColor} />
            </View>
            <Text style={styles.currentReadingValue}>
              {vitals.temp}°F
            </Text>
            <Text style={styles.currentReadingLabel}>Current Reading</Text>
          </View>

          {/* Weekly Trend Chart */}
          <View style={styles.chartWrapper}>
            <TemperatureChart 
              data={tempHistory} 
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </View>
          <Text style={styles.weeklyTrendLabel}>Weekly trend</Text>

          {/* Log New Reading Button/Form */}
          {!showLogForm ? (
            <TouchableOpacity 
              style={styles.logNewReadingBtn}
              onPress={() => setShowLogForm(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.textSecondary} />
              <Text style={styles.logNewReadingText}>Log New Reading</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logFormContainer}>
              <Text style={styles.logFormTitle}>Log New Reading</Text>
              <TextInput
                style={[styles.logFormInput, { marginBottom: 16 }]}
                placeholder="Temperature (°F)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                value={tempInput}
                onChangeText={setTempInput}
              />
              <View style={styles.logFormButtons}>
                <TouchableOpacity style={styles.logFormCancelBtn} onPress={handleCancel}>
                  <Text style={styles.logFormCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logFormSaveBtn} onPress={handleSave}>
                  <Text style={styles.logFormSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recent History */}
          <Text style={styles.recentHistoryTitle}>RECENT HISTORY</Text>
          <View style={styles.recentHistoryList}>
            {tempHistory.slice(0, 5).map((reading) => (
              <View key={reading.id} style={styles.historyItem}>
                <Text style={styles.historyItemTime}>{reading.day} at {reading.time}</Text>
                <Text style={styles.historyItemValue}>{reading.value}°F</Text>
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
// PAIN CHART COMPONENT
// ============================================
const PainChart = ({ data, selectedDay, onSelectDay }) => {
  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = 180;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const yLabels = [3, 2.25, 1.5, 0.75, 0];
  const minY = 0;
  const maxY = 3;
  
  const getY = (value) => {
    const ratio = (value - minY) / (maxY - minY);
    return paddingTop + graphHeight - (ratio * graphHeight);
  };
  
  const getX = (index) => {
    return paddingLeft + (index * (graphWidth / 6));
  };

  const getDataForDay = (day) => {
    const reading = data.find(d => d.day === day);
    return reading || null;
  };

  return (
    <View style={styles.chartContainer}>
      {/* Y-axis labels */}
      {yLabels.map((label) => (
        <Text key={label} style={[styles.yAxisLabel, { top: getY(label) - 8 }]}>
          {label}
        </Text>
      ))}
      
      {/* Grid lines */}
      <View style={[styles.chartGrid, { left: paddingLeft }]}>
        {yLabels.map((label) => (
          <View 
            key={label} 
            style={[styles.gridLine, { top: getY(label) - paddingTop }]} 
          />
        ))}
        {days.map((day, index) => (
          <View 
            key={day} 
            style={[styles.verticalGridLine, { left: getX(index) - paddingLeft }]} 
          />
        ))}
      </View>

      {/* Chart area */}
      <View style={[styles.chartArea, { marginLeft: paddingLeft }]}>
        {/* Pain line (purple) */}
        <View style={styles.lineContainer}>
          {days.map((day, index) => {
            const reading = getDataForDay(day);
            if (!reading) return null;
            const nextDay = days[index + 1];
            const nextReading = getDataForDay(nextDay);
            
            if (nextReading) {
              const x1 = getX(index) - paddingLeft;
              const y1 = getY(reading.value) - paddingTop;
              const x2 = getX(index + 1) - paddingLeft;
              const y2 = getY(nextReading.value) - paddingTop;
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              
              return (
                <View
                  key={`pain-line-${index}`}
                  style={[
                    styles.chartLine,
                    {
                      width: length,
                      left: x1,
                      top: y1,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: COLORS.painColor,
                    },
                  ]}
                />
              );
            }
            return null;
          })}
        </View>

        {/* Data points */}
        {days.map((day, index) => {
          const reading = getDataForDay(day);
          if (!reading) return null;
          
          const isSelected = selectedDay === day;
          
          return (
            <TouchableOpacity
              key={`point-${day}`}
              style={[styles.dataPointTouchable, { left: getX(index) - paddingLeft - 15, top: 0, height: graphHeight }]}
              onPress={() => onSelectDay(day)}
            >
              {/* Pain point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    backgroundColor: isSelected ? COLORS.background : COLORS.painColor,
                    borderColor: COLORS.painColor,
                    borderWidth: isSelected ? 2 : 0,
                    top: getY(reading.value) - paddingTop - 5,
                    left: 10,
                  },
                ]}
              />
              
              {/* Tooltip */}
              {isSelected && (
                <View style={[styles.tooltip, { top: getY(reading.value) - paddingTop - 70 }]}>
                  <View style={styles.tooltipVerticalLine} />
                  <View style={styles.tooltipContent}>
                    <Text style={styles.tooltipDay}>{day}</Text>
                    <Text style={[styles.tooltipSystolic, { color: COLORS.painColor }]}>value : {reading.value}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisContainer}>
        {days.map((day, index) => (
          <Text key={day} style={[styles.xAxisLabel, { left: getX(index) - 12 }]}>
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
};

// ============================================
// PAIN MODAL
// ============================================
const PainModal = ({ visible, onClose, vitals, onUpdateVitals }) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [painInput, setPainInput] = useState('');
  const [painHistory, setPainHistory] = useState(INITIAL_PAIN_HISTORY);
  const [selectedDay, setSelectedDay] = useState('Sat');

  const handleSave = () => {
    if (painInput) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayStr = days[now.getDay()];
      
      const newReading = {
        id: Date.now(),
        day: dayStr,
        time: timeStr,
        value: parseInt(painInput),
      };
      
      setPainHistory([newReading, ...painHistory]);
      onUpdateVitals({
        ...vitals,
        pain: parseInt(painInput)
      });
      
      setPainInput('');
      setShowLogForm(false);
    }
  };

  const handleCancel = () => {
    setPainInput('');
    setShowLogForm(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.vitalModalContainer}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.vitalModalHeader}>
          <Text style={styles.vitalModalTitle}>Vital Signs</Text>
          <TouchableOpacity onPress={onClose} style={styles.vitalModalClose}>
            <Ionicons name="close" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Reading Card */}
          <View style={[styles.currentReadingCard, { backgroundColor: COLORS.painCardBg }]}>
            <View style={[styles.currentReadingIconBg, { backgroundColor: 'rgba(168, 85, 247, 0.4)' }]}>
              <Ionicons name="sad-outline" size={32} color={COLORS.painColor} />
            </View>
            <Text style={styles.currentReadingValue}>
              {vitals.pain}/10
            </Text>
            <Text style={styles.currentReadingLabel}>Current Reading</Text>
          </View>

          {/* Weekly Trend Chart */}
          <View style={styles.chartWrapper}>
            <PainChart 
              data={painHistory} 
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </View>
          <Text style={styles.weeklyTrendLabel}>Weekly trend</Text>

          {/* Log New Reading Button/Form */}
          {!showLogForm ? (
            <TouchableOpacity 
              style={styles.logNewReadingBtn}
              onPress={() => setShowLogForm(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.textSecondary} />
              <Text style={styles.logNewReadingText}>Log New Reading</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logFormContainer}>
              <Text style={styles.logFormTitle}>Log New Reading</Text>
              <TextInput
                style={[styles.logFormInput, { marginBottom: 16 }]}
                placeholder="Pain Level (0-10)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={painInput}
                onChangeText={setPainInput}
              />
              <View style={styles.logFormButtons}>
                <TouchableOpacity style={styles.logFormCancelBtn} onPress={handleCancel}>
                  <Text style={styles.logFormCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logFormSaveBtn} onPress={handleSave}>
                  <Text style={styles.logFormSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recent History */}
          <Text style={styles.recentHistoryTitle}>RECENT HISTORY</Text>
          <View style={styles.recentHistoryList}>
            {painHistory.slice(0, 5).map((reading) => (
              <View key={reading.id} style={styles.historyItem}>
                <Text style={styles.historyItemTime}>{reading.day} at {reading.time}</Text>
                <Text style={styles.historyItemValue}>{reading.value}/10</Text>
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
// TASK DETAIL MODAL
// ============================================
const TaskDetailModal = ({ visible, onClose, task, onComplete, onCantComplete }) => {
  const [mode, setMode] = useState('complete'); // 'complete' or 'cantComplete'
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);

  const handleTakePhoto = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera access to take photos for task documentation.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Launch camera (no library access - camera only)
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
  };

  const handleComplete = () => {
    if (task) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const completedTime = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      
      onComplete(task.id, {
        completedTime,
        notes: notes || 'Task completed successfully',
        photo: photo,
      });
      
      // Reset state
      setNotes('');
      setPhoto(null);
      setMode('complete');
      onClose();
    }
  };

  const handleCantComplete = () => {
    if (task && selectedReason) {
      onCantComplete(task.id, {
        reason: selectedReason,
        notes,
        photo,
      });
      
      // Reset state
      setNotes('');
      setPhoto(null);
      setSelectedReason(null);
      setMode('complete');
      onClose();
    }
  };

  const handleClose = () => {
    setNotes('');
    setPhoto(null);
    setSelectedReason(null);
    setMode('complete');
    onClose();
  };

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <KeyboardAvoidingView 
        style={styles.taskModalContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.taskModalHeader}>
          <Text style={styles.taskModalTitle}>{task.title}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.taskModalClose}>
            <Ionicons name="close" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Mode Toggle */}
          <View style={styles.modeToggleContainer}>
            <TouchableOpacity
              style={[
                styles.modeToggleBtn,
                mode === 'complete' && styles.modeToggleBtnActive,
              ]}
              onPress={() => setMode('complete')}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={mode === 'complete' ? COLORS.white : COLORS.textSecondary} 
              />
              <Text style={[
                styles.modeToggleText,
                mode === 'complete' && styles.modeToggleTextActive,
              ]}>Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeToggleBtn,
                mode === 'cantComplete' && styles.modeToggleBtnCantComplete,
              ]}
              onPress={() => setMode('cantComplete')}
            >
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={mode === 'cantComplete' ? COLORS.white : COLORS.textSecondary} 
              />
              <Text style={[
                styles.modeToggleText,
                mode === 'cantComplete' && styles.modeToggleTextActive,
              ]}>Can't Complete</Text>
            </TouchableOpacity>
          </View>

          {/* Instructions Card */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsLabel}>INSTRUCTIONS</Text>
            <Text style={styles.instructionsText}>{task.instructions}</Text>
          </View>

          {/* Photo Evidence Section */}
          <View style={styles.photoEvidenceSection}>
            <Text style={styles.photoEvidenceLabel}>
              PHOTO EVIDENCE {task.requiresPhoto ? '(REQUIRED)' : '(OPTIONAL)'}
            </Text>
            {!photo ? (
              <TouchableOpacity style={styles.photoUploadBox} onPress={handleTakePhoto}>
                <Ionicons name="camera" size={40} color={COLORS.textMuted} />
                <Text style={styles.photoUploadText}>Tap to add photo</Text>
                <Text style={styles.photoUploadSubtext}>Take a photo for documentation</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photo }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.photoRemoveBtn} onPress={handleRemovePhoto}>
                  <Ionicons name="close" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Notes Section */}
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>NOTES</Text>
            <TextInput
              style={[
                styles.notesInput,
                mode === 'cantComplete' && styles.notesInputCantComplete,
              ]}
              placeholder="Add any relevant notes here..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          {/* Can't Complete Reason Section */}
          {mode === 'cantComplete' && (
            <View style={styles.cantCompleteSection}>
              <View style={styles.cantCompleteHeader}>
                <Ionicons name="warning" size={20} color={COLORS.confirmBtn} />
                <Text style={styles.cantCompleteLabel}>REASON FOR NOT COMPLETING</Text>
              </View>
              {CANT_COMPLETE_REASONS.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.cantCompleteOption,
                    selectedReason === reason && styles.cantCompleteOptionSelected,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Text style={[
                    styles.cantCompleteOptionText,
                    selectedReason === reason && styles.cantCompleteOptionTextSelected,
                  ]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.taskModalBottom}>
          {mode === 'complete' ? (
            <TouchableOpacity 
              style={[
                styles.completeTaskBtn,
                (!photo && task.requiresPhoto) && styles.completeTaskBtnDisabled,
              ]} 
              onPress={handleComplete}
              disabled={!photo && task.requiresPhoto}
            >
              <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
              <Text style={styles.completeTaskBtnText}>Mark as Complete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[
                styles.submitReportBtn,
                !selectedReason && styles.submitReportBtnDisabled,
              ]} 
              onPress={handleCantComplete}
              disabled={!selectedReason}
            >
              <Text style={[
                styles.submitReportBtnText,
                !selectedReason && styles.submitReportBtnTextDisabled,
              ]}>Submit Report</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const CareHistoryModal = ({ visible, onClose, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 17));
  const today = 17;
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const renderCalendarDays = () => {
    const days = [];
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(
        <View key={`prev-${i}`} style={styles.calendarDay}>
          <Text style={styles.calendarDayTextMuted}>{daysInPrevMonth - i}</Text>
        </View>
      );
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today && month === 0 && year === 2026;
      const hasActivity = CARE_ACTIVITY_DATES.includes(day);
      const isFuture = day > today;
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.calendarDay, isToday && styles.calendarDayToday]}
          onPress={() => {
            if (!isFuture) {
              const dateStr = `2026-01-${day.toString().padStart(2, '0')}`;
              onSelectDate(dateStr, day);
              onClose();
            }
          }}
        >
          <Text style={[
            styles.calendarDayText,
            isToday && styles.calendarDayTextToday,
            isFuture && styles.calendarDayTextFuture,
          ]}>{day}</Text>
          {hasActivity && !isToday && (
            <View style={styles.activityDot} />
          )}
        </TouchableOpacity>
      );
    }
    
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    const remainingDays = totalCells - (firstDayOfMonth + daysInMonth);
    for (let i = 1; i <= remainingDays; i++) {
      days.push(
        <View key={`next-${i}`} style={styles.calendarDay}>
          <Text style={styles.calendarDayTextMuted}>{i}</Text>
        </View>
      );
    }
    
    return days;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.calendarOverlay}>
        <View style={styles.calendarModal}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Care History</Text>
            <TouchableOpacity onPress={onClose} style={styles.calendarCloseBtn}>
              <Ionicons name="close" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.calendarSubtitle}>Select a date to view all care activities</Text>
          
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={prevMonth} style={styles.monthNavBtn}>
              <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>{monthNames[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.monthNavBtn}>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.calendarDivider} />
          
          <View style={styles.weekdayRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>
          
          <View style={styles.calendarGrid}>
            {renderCalendarDays()}
          </View>
          
          <Text style={styles.calendarFooter}>Tap a date to view that day's care timeline</Text>
        </View>
      </View>
    </Modal>
  );
};

// ============================================
// PATIENT PROFILE MODAL
// ============================================
const PatientProfileModal = ({ visible, onClose, onOpenCareHistory }) => {
  const today = new Date();
  const formattedDate = `Jan ${today.getDate()}, ${today.getFullYear()}`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.profileContainer}>
        <StatusBar style="light" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileHero}>
            <Image source={{ uri: PATIENT.photo }} style={styles.profileHeroImage} />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.profileHeroOverlay}>
              <Text style={styles.profileName}>{PATIENT.name}</Text>
              <Text style={styles.profileMeta}>Age {PATIENT.age} • DOB: {PATIENT.dob}</Text>
            </View>
          </View>

          <View style={styles.profileContent}>
            <TouchableOpacity style={styles.careHistoryCard} onPress={onOpenCareHistory}>
              <View style={styles.careHistoryIconBg}>
                <Ionicons name="calendar" size={24} color={COLORS.white} />
              </View>
              <View style={styles.careHistoryInfo}>
                <Text style={styles.careHistoryLabel}>CARE HISTORY</Text>
                <Text style={styles.careHistoryDate}>{formattedDate}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.careHistoryLight} />
            </TouchableOpacity>

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

            <View style={styles.statusRow}>
              <View style={styles.codeStatusCard}>
                <Ionicons name="shield-outline" size={28} color={COLORS.codeStatusText} />
                <Text style={styles.codeStatusLabel}>CODE STATUS</Text>
                <Text style={styles.codeStatusValue}>{PATIENT.codeStatus}</Text>
              </View>
              <View style={styles.mobilityCard}>
                <Ionicons name="pulse" size={28} color={COLORS.mobilityText} />
                <Text style={styles.mobilityLabel}>MOBILITY</Text>
                <Text style={styles.mobilityValue}>{PATIENT.mobility}</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location" size={20} color={COLORS.accessIcon} />
                <Text style={styles.sectionTitle}>Access Instructions</Text>
              </View>
              <Text style={styles.accessText}>{PATIENT.accessInstructions}</Text>
            </View>

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
              <View style={styles.contactDivider} />
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

            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social" size={22} color={COLORS.white} />
              <Text style={styles.shareButtonText}>Share Medical ID for EMS</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ============================================
// REQUEST CARD COMPONENT
// ============================================
const RequestCard = ({ request, onAccept, onDecline }) => {
  const [showDeclineReasons, setShowDeclineReasons] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);

  const handleDeclinePress = () => {
    setShowDeclineReasons(true);
  };

  const handleCancelDecline = () => {
    setShowDeclineReasons(false);
    setSelectedReason(null);
  };

  const handleConfirmDecline = () => {
    if (selectedReason) {
      onDecline(request.id, selectedReason);
      setShowDeclineReasons(false);
      setSelectedReason(null);
    }
  };

  const handleAccept = () => {
    onAccept(request);
  };

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestBorder} />
      <View style={styles.requestContent}>
        <Text style={styles.requestTitle}>{request.title}</Text>
        <View style={styles.requestMeta}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.requestTime}>{request.time}</Text>
          <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} style={{ marginLeft: 16 }} />
          <Text style={styles.requestRequester}>{request.requester} ({request.relation})</Text>
        </View>
        <Text style={styles.requestDescription}>{request.description}</Text>

        {!showDeclineReasons ? (
          <View style={styles.requestButtons}>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Ionicons name="checkmark" size={20} color={COLORS.white} />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineButton} onPress={handleDeclinePress}>
              <Ionicons name="close" size={20} color={COLORS.white} />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.declineReasonsContainer}>
            <Text style={styles.selectReasonLabel}>SELECT REASON:</Text>
            {DECLINE_REASONS.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.declineReasonOption,
                  selectedReason === reason && styles.declineReasonSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text style={[
                  styles.declineReasonText,
                  selectedReason === reason && styles.declineReasonTextSelected,
                ]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.declineActionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelDecline}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.confirmButton,
                  !selectedReason && styles.confirmButtonDisabled,
                ]} 
                onPress={handleConfirmDecline}
                disabled={!selectedReason}
              >
                <Text style={[
                  styles.confirmButtonText,
                  !selectedReason && styles.confirmButtonTextDisabled,
                ]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

// ============================================
// CAREGIVER HOME SCREEN
// ============================================
const CaregiverHomeScreen = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [expandedTask, setExpandedTask] = useState(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showCareHistory, setShowCareHistory] = useState(false);
  const [showVitalSigns, setShowVitalSigns] = useState(false);
  const [showHeartRate, setShowHeartRate] = useState(false);
  const [showTemperature, setShowTemperature] = useState(false);
  const [showPain, setShowPain] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [vitals, setVitals] = useState({ bp: { systolic: 120, diastolic: 76 }, heart: 72, temp: 98.6, pain: 1 });

  const completedTasks = tasks.filter(t => t.completed || t.cantComplete);
  const completedCount = viewingHistory ? (HISTORY_TASKS[viewingHistory]?.length || 0) : completedTasks.length;
  const totalCount = viewingHistory ? (HISTORY_TASKS[viewingHistory]?.length || 0) : tasks.length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return COLORS.critical;
      case 'standard': return COLORS.standard;
      case 'low': return COLORS.low;
      default: return COLORS.standard;
    }
  };

  const formatHistoryDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  };

  const handleSelectDate = (dateStr, day) => {
    if (day === 17) {
      setViewingHistory(null);
    } else {
      setViewingHistory(dateStr);
    }
  };

  const handleBackToToday = () => {
    setViewingHistory(null);
  };

  const handleStartTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleCompleteTask = (taskId, data) => {
    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, completed: true, ...data }
        : t
    ));
  };

  const handleCantCompleteTask = (taskId, data) => {
    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, cantComplete: true, cantCompleteReason: data.reason, ...data }
        : t
    ));
  };

  const handleOpenCareHistory = () => {
    setShowPatientProfile(false);
    setShowCareHistory(true);
  };

  const handleAcceptRequest = (request) => {
    const newTask = {
      id: request.id,
      title: request.title,
      time: request.time,
      priority: 'standard',
      requiresPhoto: false,
      fromRequest: true,
    };
    setTasks([...tasks, newTask]);
    setRequests(requests.filter(r => r.id !== request.id));
    if (requests.length === 1) {
      setActiveTab('tasks');
    }
  };

  const handleDeclineRequest = (requestId, reason) => {
    setRequests(requests.filter(r => r.id !== requestId));
    if (requests.length === 1) {
      setActiveTab('tasks');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Patient Card */}
        <TouchableOpacity style={styles.patientCard} activeOpacity={0.8} onPress={() => setShowPatientProfile(true)}>
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
          <TouchableOpacity style={styles.vitalCard} onPress={() => setShowVitalSigns(true)}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalBPBg }]}>
              <Ionicons name="heart" size={22} color={COLORS.vitalBP} />
            </View>
            <Text style={styles.vitalValue}>{vitals.bp.systolic}/{vitals.bp.diastolic}</Text>
            <Text style={styles.vitalLabel}>BP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vitalCard} onPress={() => setShowHeartRate(true)}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalHeartBg }]}>
              <Ionicons name="pulse" size={22} color={COLORS.vitalHeart} />
            </View>
            <Text style={styles.vitalValue}>{vitals.heart}</Text>
            <Text style={styles.vitalLabel}>Heart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vitalCard} onPress={() => setShowTemperature(true)}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalTempBg }]}>
              <Ionicons name="thermometer" size={22} color={COLORS.vitalTemp} />
            </View>
            <Text style={styles.vitalValue}>{vitals.temp}°</Text>
            <Text style={styles.vitalLabel}>Temp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vitalCard} onPress={() => setShowPain(true)}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalPainBg }]}>
              <Ionicons name="sad-outline" size={22} color={COLORS.vitalPain} />
            </View>
            <Text style={styles.vitalValue}>{vitals.pain}/10</Text>
            <Text style={styles.vitalLabel}>Pain</Text>
          </TouchableOpacity>
        </View>

        {/* Viewing History Banner */}
        {viewingHistory && (
          <View style={styles.historyBanner}>
            <View style={styles.historyBannerLeft}>
              <View style={styles.historyIconCircle}>
                <Ionicons name="time-outline" size={24} color={COLORS.historyText} />
              </View>
              <View>
                <Text style={styles.historyBannerLabel}>VIEWING HISTORY</Text>
                <Text style={styles.historyBannerDate}>{formatHistoryDate(viewingHistory)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.backToTodayBtn} onPress={handleBackToToday}>
              <Text style={styles.backToTodayText}>Back to Today</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              {viewingHistory ? `${formatHistoryDate(viewingHistory)}'s Progress` : "Today's Progress"}
            </Text>
            <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: viewingHistory ? '100%' : '0%' }]} />
          </View>
        </View>

        {/* Tab Switcher or Completed Tasks Header */}
        {viewingHistory ? (
          <View style={styles.completedTasksHeader}>
            <Text style={styles.completedTasksTitle}>Completed Tasks</Text>
          </View>
        ) : (
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={styles.tabItem} 
              onPress={() => setActiveTab('requests')}
              activeOpacity={0.6}
            >
              {requests.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{requests.length}</Text>
                </View>
              )}
              <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>Requests</Text>
            </TouchableOpacity>
            <View style={styles.tabDivider} />
            <TouchableOpacity 
              style={styles.tabItem} 
              onPress={() => setActiveTab('tasks')}
              activeOpacity={0.6}
            >
              <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>Today's Tasks</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content List */}
        <View style={styles.taskList}>
          {viewingHistory ? (
            (HISTORY_TASKS[viewingHistory] || []).map((task) => (
              <View key={task.id} style={styles.completedTaskCard}>
                <View style={styles.completedTaskBar} />
                <View style={styles.completedTaskContent}>
                  <Text style={styles.completedTaskTitle}>{task.title}</Text>
                  <View style={styles.completedTaskMeta}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.completedTaskTime}>{task.completedTime}</Text>
                  </View>
                  <Text style={styles.completedTaskNotes}>"{task.notes}"</Text>
                </View>
                <View style={styles.completedTaskPhotoContainer}>
                  <Image source={{ uri: task.photo }} style={styles.completedTaskPhoto} />
                  <TouchableOpacity style={styles.galleryIconBtn}>
                    <Ionicons name="albums-outline" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : activeTab === 'requests' ? (
            requests.length > 0 ? (
              requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyStateText}>No pending requests</Text>
              </View>
            )
          ) : (
            tasks.map((task) => (
              <View key={task.id}>
                {/* Completed Task */}
                {task.completed ? (
                  <View style={styles.taskCardCompleted}>
                    <View style={[styles.taskPriorityBar, { backgroundColor: COLORS.primary }]} />
                    <View style={styles.taskContentCompleted}>
                      <Text style={styles.taskTitleCompleted}>{task.title}</Text>
                      <View style={styles.taskMeta}>
                        <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.taskTime}>{task.completedTime}</Text>
                      </View>
                      <Text style={styles.taskNotesPreview}>"{task.notes}"</Text>
                    </View>
                    <View style={styles.completedPhotoContainer}>
                      <Image source={{ uri: task.photo }} style={styles.completedPhotoThumb} />
                      <View style={styles.completedPhotoOverlay}>
                        <Ionicons name="images" size={14} color={COLORS.white} />
                      </View>
                    </View>
                  </View>
                ) : task.cantComplete ? (
                  /* Can't Complete Task */
                  <View style={styles.taskCardCantComplete}>
                    <View style={[styles.taskPriorityBar, { backgroundColor: COLORS.critical }]} />
                    <View style={styles.taskContentCantComplete}>
                      <Text style={styles.taskTitleCantComplete}>{task.title}</Text>
                      <View style={styles.cantCompleteReasonRow}>
                        <Ionicons name="warning" size={16} color={COLORS.critical} />
                        <Text style={styles.cantCompleteReasonText}>{task.cantCompleteReason}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.cantCompleteCloseBtn}>
                      <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Regular Task */
                  <TouchableOpacity 
                    style={[styles.taskCard, expandedTask === task.id && styles.taskCardExpanded]}
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
                      
                      {/* Expanded Content */}
                      {expandedTask === task.id && (
                        <View style={styles.taskExpandedContent}>
                          <View style={styles.taskInstructionsBox}>
                            <Text style={styles.taskInstructionsLabel}>INSTRUCTIONS</Text>
                            <Text style={styles.taskInstructionsText}>{task.instructions}</Text>
                          </View>
                          <View style={styles.taskTimeWindowRow}>
                            <Ionicons name="time" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.taskTimeWindowLabel}>TIME WINDOW</Text>
                            <Text style={styles.taskTimeWindowValue}>{task.timeWindow}</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.startTaskBtn}
                            onPress={() => handleStartTask(task)}
                          >
                            <Text style={styles.startTaskBtnText}>Start Task</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    {expandedTask !== task.id && (
                      <View style={styles.taskChevronContainer}>
                        <View style={styles.taskChevronCircle}>
                          <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Calendar FAB */}
      <TouchableOpacity 
        style={styles.calendarFab} 
        onPress={() => setShowCareHistory(true)}
      >
        <Ionicons name="calendar-outline" size={24} color={COLORS.white} />
      </TouchableOpacity>

      {/* Modals */}
      <PatientProfileModal 
        visible={showPatientProfile} 
        onClose={() => setShowPatientProfile(false)}
        onOpenCareHistory={handleOpenCareHistory}
      />
      <CareHistoryModal
        visible={showCareHistory}
        onClose={() => setShowCareHistory(false)}
        onSelectDate={handleSelectDate}
      />
      <VitalSignsModal
        visible={showVitalSigns}
        onClose={() => setShowVitalSigns(false)}
        vitals={vitals}
        onUpdateVitals={setVitals}
      />
      <HeartRateModal
        visible={showHeartRate}
        onClose={() => setShowHeartRate(false)}
        vitals={vitals}
        onUpdateVitals={setVitals}
      />
      <TemperatureModal
        visible={showTemperature}
        onClose={() => setShowTemperature(false)}
        vitals={vitals}
        onUpdateVitals={setVitals}
      />
      <PainModal
        visible={showPain}
        onClose={() => setShowPain(false)}
        vitals={vitals}
        onUpdateVitals={setVitals}
      />
      <TaskDetailModal
        visible={showTaskDetail}
        onClose={() => setShowTaskDetail(false)}
        task={selectedTask}
        onComplete={handleCompleteTask}
        onCantComplete={handleCantCompleteTask}
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

const ShiftsTabIcon = ({ focused, color }) => (
  <View style={styles.shiftsIconContainer}>
    <Ionicons name={focused ? "time" : "time-outline"} size={24} color={color} />
    <View style={styles.shiftsDot} />
  </View>
);

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

  // Patient Card
  patientCard: { marginHorizontal: 16, marginTop: 50, height: 200, borderRadius: 20, overflow: 'hidden', backgroundColor: COLORS.card },
  patientImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  patientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 60 },
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

  // History Banner
  historyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.historyBannerBg,
    borderWidth: 1,
    borderColor: COLORS.historyBannerBorder,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
  },
  historyBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.historyIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBannerLabel: { fontSize: 12, fontWeight: '600', color: COLORS.historyText, letterSpacing: 0.5 },
  historyBannerDate: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginTop: 2 },
  backToTodayBtn: {
    backgroundColor: COLORS.historyButtonBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backToTodayText: { fontSize: 15, fontWeight: '600', color: COLORS.background },

  // Progress
  progressSection: { marginHorizontal: 16, marginTop: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { fontSize: 18, fontWeight: '500', color: COLORS.white },
  progressCount: { fontSize: 16, color: COLORS.textSecondary },
  progressBarBg: { height: 6, backgroundColor: COLORS.card, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },

  // Completed Tasks Header
  completedTasksHeader: { marginHorizontal: 16, marginTop: 28, marginBottom: 16 },
  completedTasksTitle: { fontSize: 20, fontWeight: '600', color: COLORS.white },

  // Tab Container
  tabContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 28, marginBottom: 16 },
  tabItem: { position: 'relative', paddingVertical: 8, paddingHorizontal: 4 },
  tabBadge: { position: 'absolute', top: -14, right: -5, backgroundColor: COLORS.badgeRed, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  tabBadgeText: { fontSize: 10, fontWeight: 'bold', color: COLORS.white },
  tabText: { fontSize: 18, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white, fontWeight: '600' },
  tabDivider: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder, marginHorizontal: 16 },

  // Task List
  taskList: { paddingHorizontal: 16 },
  taskCard: { backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 10, overflow: 'hidden', flexDirection: 'row' },
  taskCardExpanded: { flexDirection: 'column' },
  taskPriorityBar: { width: 5, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  taskContent: { flex: 1, paddingVertical: 18, paddingLeft: 16, paddingRight: 8 },
  taskTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginBottom: 6 },
  taskMeta: { flexDirection: 'row', alignItems: 'center' },
  taskTime: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 4 },
  photoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 12 },
  photoBadgeText: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 4 },
  taskChevronContainer: { justifyContent: 'center', paddingRight: 12 },
  taskChevronCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  // Task Expanded Content
  taskExpandedContent: { marginTop: 16 },
  taskInstructionsBox: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, marginBottom: 12 },
  taskInstructionsLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, letterSpacing: 0.5 },
  taskInstructionsText: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  taskTimeWindowRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  taskTimeWindowLabel: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 8 },
  taskTimeWindowValue: { fontSize: 13, fontWeight: '600', color: COLORS.white, marginLeft: 8 },
  startTaskBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  startTaskBtnText: { fontSize: 17, fontWeight: '600', color: COLORS.white },

  // Completed Task on Dashboard
  taskCardCompleted: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 10, overflow: 'hidden' },
  taskContentCompleted: { flex: 1, paddingVertical: 18, paddingLeft: 16, paddingRight: 8 },
  taskTitleCompleted: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, textDecorationLine: 'line-through', marginBottom: 6 },
  taskNotesPreview: { fontSize: 14, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 6 },
  completedPhotoContainer: { justifyContent: 'center', paddingRight: 12, position: 'relative' },
  completedPhotoThumb: { width: 60, height: 60, borderRadius: 10 },
  completedPhotoOverlay: { position: 'absolute', bottom: 4, right: 16, width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(60, 60, 60, 0.9)', alignItems: 'center', justifyContent: 'center' },

  // Can't Complete Task on Dashboard
  taskCardCantComplete: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 10, overflow: 'hidden' },
  taskContentCantComplete: { flex: 1, paddingVertical: 18, paddingLeft: 16, paddingRight: 8 },
  taskTitleCantComplete: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  cantCompleteReasonRow: { flexDirection: 'row', alignItems: 'center' },
  cantCompleteReasonText: { fontSize: 14, color: COLORS.critical, marginLeft: 6 },
  cantCompleteCloseBtn: { justifyContent: 'center', paddingRight: 16 },

  // Task Detail Modal
  taskModalContainer: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  taskModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  taskModalTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, flex: 1 },
  taskModalClose: { padding: 4 },

  // Mode Toggle
  modeToggleContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 20, gap: 12 },
  modeToggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.card, paddingVertical: 14, borderRadius: 12, gap: 8 },
  modeToggleBtnActive: { backgroundColor: COLORS.primary },
  modeToggleBtnCantComplete: { backgroundColor: COLORS.confirmBtn },
  modeToggleText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  modeToggleTextActive: { color: COLORS.white },

  // Instructions Card in Modal
  instructionsCard: { backgroundColor: COLORS.card, marginHorizontal: 16, borderRadius: 16, padding: 18, marginBottom: 20 },
  instructionsLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 10, letterSpacing: 0.5 },
  instructionsText: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24 },

  // Photo Evidence Section
  photoEvidenceSection: { marginHorizontal: 16, marginBottom: 20 },
  photoEvidenceLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 12, letterSpacing: 0.5 },
  photoUploadBox: { borderWidth: 2, borderColor: COLORS.cardBorder, borderStyle: 'dashed', borderRadius: 16, paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  photoUploadText: { fontSize: 17, color: COLORS.textSecondary, marginTop: 12 },
  photoUploadSubtext: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  photoPreviewContainer: { position: 'relative' },
  photoPreview: { width: '100%', height: 200, borderRadius: 16 },
  photoRemoveBtn: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0, 0, 0, 0.7)', alignItems: 'center', justifyContent: 'center' },

  // Notes Section
  notesSection: { marginHorizontal: 16, marginBottom: 20 },
  notesLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 12, letterSpacing: 0.5 },
  notesInput: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, fontSize: 16, color: COLORS.white, minHeight: 100, borderWidth: 2, borderColor: 'transparent' },
  notesInputCantComplete: { borderColor: COLORS.primary },

  // Can't Complete Section
  cantCompleteSection: { marginHorizontal: 16, marginBottom: 20 },
  cantCompleteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cantCompleteLabel: { fontSize: 12, fontWeight: '600', color: COLORS.confirmBtn, marginLeft: 8, letterSpacing: 0.5 },
  cantCompleteOption: { backgroundColor: COLORS.card, paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  cantCompleteOptionSelected: { backgroundColor: 'rgba(244, 63, 94, 0.15)', borderColor: COLORS.confirmBtn },
  cantCompleteOptionText: { fontSize: 16, color: COLORS.textSecondary },
  cantCompleteOptionTextSelected: { color: COLORS.confirmBtn, fontWeight: '500' },

  // Task Modal Bottom
  taskModalBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 34, backgroundColor: COLORS.background },
  completeTaskBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 14, gap: 10 },
  completeTaskBtnDisabled: { backgroundColor: COLORS.cardBorder },
  completeTaskBtnText: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  submitReportBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.cardBorder, paddingVertical: 18, borderRadius: 14 },
  submitReportBtnDisabled: { backgroundColor: COLORS.cardBorder },
  submitReportBtnText: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  submitReportBtnTextDisabled: { color: COLORS.textMuted },

  // Completed Task Card
  completedTaskCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  completedTaskBar: { width: 5, backgroundColor: COLORS.primary, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  completedTaskContent: { flex: 1, paddingVertical: 18, paddingLeft: 16, paddingRight: 8 },
  completedTaskTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, textDecorationLine: 'line-through', marginBottom: 6 },
  completedTaskMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  completedTaskTime: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 4 },
  completedTaskNotes: { fontSize: 15, color: COLORS.textSecondary, fontStyle: 'italic' },
  completedTaskPhotoContainer: { justifyContent: 'center', paddingRight: 12, position: 'relative' },
  completedTaskPhoto: { width: 70, height: 70, borderRadius: 12 },
  galleryIconBtn: {
    position: 'absolute',
    bottom: 20,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(60, 60, 60, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Request Card
  requestCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  requestBorder: {
    width: 5,
    backgroundColor: COLORS.requestBorder,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  requestContent: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  requestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestTime: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  requestRequester: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  requestDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 18,
    lineHeight: 22,
  },
  requestButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.acceptBtn,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  acceptButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.declineBtn,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  declineButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Decline Reasons
  declineReasonsContainer: {
    marginTop: 4,
  },
  selectReasonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  declineReasonOption: {
    backgroundColor: COLORS.declineReasonBg,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  declineReasonSelected: {
    backgroundColor: COLORS.declineReasonSelected,
    borderColor: COLORS.declineReasonSelectedBorder,
  },
  declineReasonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  declineReasonTextSelected: {
    color: COLORS.declineReasonText,
    fontWeight: '500',
  },
  declineActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.declineBtn,
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.confirmBtn,
    paddingVertical: 16,
    borderRadius: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.confirmBtnDisabled,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },
  confirmButtonTextDisabled: {
    color: COLORS.textMuted,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 12,
  },

  // Calendar FAB
  calendarFab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.fabBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Tab Bar
  tabBar: { backgroundColor: COLORS.card, borderTopWidth: 0, height: 88, paddingTop: 8, paddingBottom: 28 },
  tabBarLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  shiftsIconContainer: { position: 'relative' },
  shiftsDot: { position: 'absolute', top: -2, right: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },

  // Placeholder
  placeholderScreen: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 18, color: COLORS.textSecondary, marginTop: 12 },

  // ===== VITAL SIGNS MODAL =====
  vitalModalContainer: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  vitalModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  vitalModalTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  vitalModalClose: { padding: 4 },

  currentReadingCard: {
    backgroundColor: COLORS.vitalCardBg,
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  currentReadingIconBg: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(190, 24, 93, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  currentReadingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  currentReadingLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // Chart
  chartWrapper: {
    backgroundColor: COLORS.chartBg,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
  },
  chartContainer: {
    height: 220,
    position: 'relative',
  },
  yAxisLabel: {
    position: 'absolute',
    left: 0,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  chartGrid: {
    position: 'absolute',
    top: 20,
    left: 35,
    right: 10,
    bottom: 30,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.chartLine,
    borderStyle: 'dashed',
  },
  verticalGridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    borderWidth: 1,
    borderColor: COLORS.chartLine,
    borderStyle: 'dashed',
  },
  chartArea: {
    position: 'absolute',
    top: 20,
    right: 10,
    bottom: 30,
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  dataPointTouchable: {
    position: 'absolute',
    width: 30,
  },
  dataPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tooltip: {
    position: 'absolute',
    left: -40,
    alignItems: 'center',
  },
  tooltipVerticalLine: {
    position: 'absolute',
    width: 1,
    height: 200,
    backgroundColor: COLORS.white,
    opacity: 0.3,
    top: 60,
  },
  tooltipContent: {
    backgroundColor: 'rgba(60, 60, 60, 0.95)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tooltipDay: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  tooltipDiastolic: {
    fontSize: 13,
    color: COLORS.diastolicColor,
    marginBottom: 2,
  },
  tooltipSystolic: {
    fontSize: 13,
    color: COLORS.systolicColor,
  },
  xAxisContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  xAxisLabel: {
    position: 'absolute',
    bottom: 0,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  weeklyTrendLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },

  // Log New Reading
  logNewReadingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
    gap: 8,
  },
  logNewReadingText: {
    fontSize: 17,
    color: COLORS.textSecondary,
  },
  logFormContainer: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
  },
  logFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 16,
  },
  logFormInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  logFormInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.white,
  },
  logFormButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  logFormCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.declineBtn,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logFormCancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },
  logFormSaveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.acceptBtn,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logFormSaveText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Recent History
  recentHistoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginHorizontal: 16,
    marginTop: 28,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  recentHistoryList: {
    marginHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  historyItemTime: {
    fontSize: 16,
    color: COLORS.white,
  },
  historyItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },

  // ===== PATIENT PROFILE MODAL =====
  profileContainer: { flex: 1, backgroundColor: COLORS.background },
  profileHero: { height: 280, position: 'relative' },
  profileHeroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  closeButton: { position: 'absolute', top: 50, right: 16, width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(60, 60, 60, 0.9)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  cameraButton: { position: 'absolute', top: 50, right: 66, width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(60, 60, 60, 0.9)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  profileHeroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 20, paddingTop: 40, zIndex: 5 },
  profileName: { fontSize: 32, fontWeight: 'bold', color: COLORS.white },
  profileMeta: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  profileContent: { paddingHorizontal: 16, paddingTop: 16, backgroundColor: COLORS.background },
  careHistoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.careHistoryBg, borderRadius: 16, padding: 16, marginBottom: 16 },
  careHistoryIconBg: { width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(34, 197, 94, 0.4)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  careHistoryInfo: { flex: 1 },
  careHistoryLabel: { fontSize: 13, fontWeight: '600', color: COLORS.careHistoryLight, marginBottom: 2 },
  careHistoryDate: { fontSize: 20, fontWeight: '600', color: COLORS.white },
  allergiesCard: { backgroundColor: COLORS.allergyBg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.allergyBorder, padding: 18, marginBottom: 16 },
  allergiesTitle: { fontSize: 18, fontWeight: '600', color: COLORS.allergyText, marginLeft: 10 },
  allergyTags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 10 },
  allergyTag: { backgroundColor: COLORS.allergyTagBg, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  allergyTagText: { fontSize: 15, fontWeight: '500', color: COLORS.allergyText },
  sectionCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 18, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginLeft: 10 },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bulletDot: { fontSize: 18, color: COLORS.textSecondary, marginRight: 10, lineHeight: 22 },
  bulletText: { fontSize: 16, color: COLORS.textSecondary, flex: 1, lineHeight: 22 },
  medicationItem: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  medicationName: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  medicationDetails: { fontSize: 16, color: COLORS.textSecondary },
  statusRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  codeStatusCard: { flex: 1, backgroundColor: COLORS.codeStatusBg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.codeStatusBorder, padding: 18, alignItems: 'center' },
  codeStatusLabel: { fontSize: 12, fontWeight: '600', color: COLORS.codeStatusText, marginTop: 10, letterSpacing: 0.5 },
  codeStatusValue: { fontSize: 17, fontWeight: '600', color: COLORS.white, marginTop: 4, textAlign: 'center' },
  mobilityCard: { flex: 1, backgroundColor: COLORS.mobilityBg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.mobilityBorder, padding: 18, alignItems: 'center' },
  mobilityLabel: { fontSize: 12, fontWeight: '600', color: COLORS.mobilityText, marginTop: 10, letterSpacing: 0.5 },
  mobilityValue: { fontSize: 17, fontWeight: '600', color: COLORS.white, marginTop: 4, textAlign: 'center' },
  accessText: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  contactRelation: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  callButtonGreen: { backgroundColor: COLORS.callBtnGreen, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12 },
  callButtonBlue: { backgroundColor: COLORS.callBtnBlue, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12 },
  callButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  contactDivider: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: 16 },
  physicianLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 12, letterSpacing: 0.5 },
  shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.shareBtn, borderRadius: 14, paddingVertical: 18, gap: 10 },
  shareButtonText: { fontSize: 17, fontWeight: '600', color: COLORS.white },

  // ===== CARE HISTORY CALENDAR MODAL =====
  calendarOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  calendarModal: { backgroundColor: COLORS.card, borderRadius: 24, padding: 24, width: SCREEN_WIDTH - 32, maxHeight: '85%' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  calendarTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white },
  calendarCloseBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  calendarSubtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 24 },
  monthNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  monthNavBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  monthYearText: { fontSize: 20, fontWeight: '600', color: COLORS.white },
  calendarDivider: { height: 1, backgroundColor: COLORS.cardBorder, marginBottom: 16 },
  weekdayRow: { flexDirection: 'row', marginBottom: 8 },
  weekdayText: { flex: 1, textAlign: 'center', fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDay: { width: `${100/7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  calendarDayToday: { backgroundColor: COLORS.primary, borderRadius: 12 },
  calendarDayText: { fontSize: 17, color: COLORS.white },
  calendarDayTextToday: { color: COLORS.white, fontWeight: 'bold' },
  calendarDayTextMuted: { fontSize: 17, color: COLORS.textMuted },
  calendarDayTextFuture: { color: COLORS.textMuted },
  activityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, position: 'absolute', bottom: 6 },
  calendarFooter: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 20 },
});
