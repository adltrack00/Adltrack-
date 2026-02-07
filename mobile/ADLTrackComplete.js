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
