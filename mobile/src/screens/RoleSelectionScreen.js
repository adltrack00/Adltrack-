import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

const ROLES = [
  {
    id: 'caregiver',
    title: 'Caregiver',
    description: 'Manage shifts, tasks & documentation',
    icon: 'heart-circle',
    accent: '#00c896',
    accentRgb: '0,200,150',
    gradientFrom: '#00c896',
    gradientTo: '#00a87a',
    darkMode: true,
  },
  {
    id: 'family',
    title: 'Family Member',
    description: 'Monitor care & stay connected',
    icon: 'people',
    accent: '#a78bfa',
    accentRgb: '167,139,250',
    gradientFrom: '#7c6ef5',
    gradientTo: '#a78bfa',
    darkMode: true,
  },
  {
    id: 'agency',
    title: 'Care Agency',
    description: 'Manage staff & compliance',
    icon: 'business',
    accent: '#38bdf8',
    accentRgb: '56,189,248',
    gradientFrom: '#38bdf8',
    gradientTo: '#0284c7',
    darkMode: true,
  },
];

export default function RoleSelectionScreen({ navigation }) {
  const { setDarkMode } = useTheme();
  const [hoveredRole, setHoveredRole] = useState(null);

  const handleRoleSelect = async (role) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setDarkMode(role.darkMode);
    navigation.navigate('Auth', { role: role.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Ambient glows */}
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottomLeft} pointerEvents="none" />

      <View style={styles.content}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.60)" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Welcome back</Text>
          <Text style={styles.title}>Continue as</Text>
          <Text style={styles.subtitle}>Choose your account type to sign in</Text>
        </View>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {ROLES.map((role) => {
            const active = hoveredRole === role.id;
            return (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  {
                    backgroundColor: active
                      ? `rgba(${role.accentRgb},0.09)`
                      : 'rgba(255,255,255,0.04)',
                    borderColor: active
                      ? `rgba(${role.accentRgb},0.30)`
                      : 'rgba(255,255,255,0.07)',
                  },
                ]}
                onPress={() => handleRoleSelect(role)}
                onPressIn={() => setHoveredRole(role.id)}
                onPressOut={() => setHoveredRole(null)}
                activeOpacity={0.85}
              >
                {/* Icon orb */}
                <View
                  style={[
                    styles.iconOrb,
                    {
                      backgroundColor: `rgba(${role.accentRgb},0.14)`,
                      borderColor: `rgba(${role.accentRgb},0.20)`,
                    },
                  ]}
                >
                  <Ionicons name={role.icon} size={26} color={role.accent} />
                </View>

                {/* Text */}
                <View style={styles.roleText}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleDesc}>{role.description}</Text>
                </View>

                {/* Arrow */}
                <View
                  style={[
                    styles.arrowBox,
                    active
                      ? { backgroundColor: role.gradientFrom }
                      : { backgroundColor: 'rgba(255,255,255,0.07)' },
                  ]}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={active ? '#ffffff' : 'rgba(255,255,255,0.30)'}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text style={styles.footerLink}>Sign up free</Text>
          </Text>
        </View>
      </View>
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
    top: -80,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0,200,150,0.06)',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(111,94,245,0.05)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
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
  header: {
    marginTop: 28,
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00c896',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
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
  rolesContainer: {
    gap: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  iconOrb: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  roleText: {
    flex: 1,
    minWidth: 0,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  roleDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.38)',
  },
  arrowBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 28,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.32)',
  },
  footerLink: {
    color: '#00c896',
    fontWeight: '700',
  },
});
