import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { mockCaregiver } from '../data/mockData';

const ROLE_CONFIG = {
  caregiver: {
    title: 'Caregiver',
    accent: '#00c896',
    accentRgb: '0,200,150',
    gradientFrom: '#00c896',
    gradientTo: '#00a87a',
    description: 'Manage shifts, tasks & documentation',
    darkMode: true,
  },
  family: {
    title: 'Family Member',
    accent: '#a78bfa',
    accentRgb: '167,139,250',
    gradientFrom: '#7c6ef5',
    gradientTo: '#a78bfa',
    description: 'Monitor care & stay connected',
    darkMode: true,
  },
  agency: {
    title: 'Care Agency',
    accent: '#38bdf8',
    accentRgb: '56,189,248',
    gradientFrom: '#38bdf8',
    gradientTo: '#0284c7',
    description: 'Manage staff & compliance',
    darkMode: true,
  },
};

export default function AuthScreen({ navigation, route }) {
  const { role = 'caregiver' } = route.params || {};
  const { login } = useAuth();
  const { setDarkMode } = useTheme();

  const config = ROLE_CONFIG[role] || ROLE_CONFIG.caregiver;

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleAuth = async () => {
    if (!email || !password) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userData = {
        id: `user_${Date.now()}`,
        email,
        name: name || email.split('@')[0],
        role,
        photo: mockCaregiver.photo,
      };

      await setDarkMode(config.darkMode);
      await login(userData, `mock_token_${Date.now()}`);

      const routeName =
        role === 'caregiver' ? 'CaregiverDashboard' :
        role === 'family'    ? 'FamilyDashboard'    :
        'AgencyDashboard';

      navigation.reset({ index: 0, routes: [{ name: routeName }] });
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEmail(`demo@${provider}.com`);
    setPassword('demo123');
    handleAuth();
  };

  const inputStyle = (field) => ({
    ...styles.input,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: focusedField === field
      ? `rgba(${config.accentRgb},0.55)`
      : 'rgba(255,255,255,0.09)',
    color: 'rgba(255,255,255,0.88)',
    shadowColor: focusedField === field ? config.accent : 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: focusedField === field ? 0.25 : 0,
    shadowRadius: 8,
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Ambient glow */}
      <View
        style={[
          styles.glowTop,
          { backgroundColor: `rgba(${config.accentRgb},0.07)` },
        ]}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.60)" />
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.titleContainer}>
            <View
              style={[
                styles.roleTag,
                {
                  backgroundColor: `rgba(${config.accentRgb},0.12)`,
                  borderColor: `rgba(${config.accentRgb},0.22)`,
                },
              ]}
            >
              <Text style={[styles.roleTagText, { color: config.accent }]}>
                {config.title}
              </Text>
            </View>
            <Text style={styles.title}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Sign up to start managing care' : 'Sign in to continue'}
            </Text>
          </View>

          {/* Social Buttons */}
          <View style={styles.socialContainer}>
            {[
              { provider: 'google', icon: 'logo-google', label: 'Continue with Google' },
              { provider: 'apple',  icon: 'logo-apple',  label: 'Continue with Apple'  },
            ].map(({ provider, icon, label }) => (
              <TouchableOpacity
                key={provider}
                style={styles.socialButton}
                onPress={() => handleSocialAuth(provider)}
                activeOpacity={0.8}
              >
                <Ionicons name={icon} size={19} color="rgba(255,255,255,0.80)" />
                <Text style={styles.socialButtonText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={inputStyle('name')}
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(255,255,255,0.22)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={inputStyle('email')}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.22)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.passwordRow,
                  {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: focusedField === 'password'
                      ? `rgba(${config.accentRgb},0.55)`
                      : 'rgba(255,255,255,0.09)',
                  },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: 'rgba(255,255,255,0.88)' }]}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255,255,255,0.22)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="rgba(255,255,255,0.30)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleAuth}
              disabled={isLoading}
              activeOpacity={0.85}
              style={styles.submitWrapper}
            >
              <LinearGradient
                colors={[config.gradientFrom, config.gradientTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitText}>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Toggle */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={[styles.toggleLink, { color: config.accent }]}>
                {' '}{isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    alignSelf: 'center',
    width: 360,
    height: 360,
    borderRadius: 180,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  titleContainer: {
    marginTop: 28,
    marginBottom: 28,
  },
  roleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  roleTagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.94)',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.38)',
  },
  socialContainer: {
    gap: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 10,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.25)',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 7,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.50)',
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  eyeButton: {
    padding: 14,
  },
  submitWrapper: {
    marginTop: 8,
  },
  submitButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#00c896',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.32)',
  },
  toggleLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
