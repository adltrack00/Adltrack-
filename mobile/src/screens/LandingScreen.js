import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FEATURES = [
  { icon: 'checkmark-circle', title: 'Task Management',      description: 'Track daily care activities' },
  { icon: 'heart',            title: 'Vitals Monitoring',    description: 'Record & view health data' },
  { icon: 'chatbubbles',      title: 'Care Communication',   description: 'Stay connected with family' },
];

export default function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0f', '#000000']}
        style={styles.gradient}
      >
        {/* Ambient glow */}
        <View style={styles.glowTop} pointerEvents="none" />
        <View style={styles.glowBottom} pointerEvents="none" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <LinearGradient
              colors={['#00c896', '#00a87a']}
              style={styles.logoIcon}
            >
              <Ionicons name="pulse" size={20} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.logoText}>ADLTrack</Text>
          </View>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('RoleSelection')}
            activeOpacity={0.8}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.badge}>Care Coordination, Reimagined</Text>
          <Text style={styles.tagline}>Simple.{'\n'}Secure.{'\n'}
            <Text style={styles.taglineAccent}>Reliable Care.</Text>
          </Text>
          <Text style={styles.description}>
            The caregiving app that brings families, caregivers, and agencies together — beautifully.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('RoleSelection')}
          >
            <LinearGradient
              colors={['#00c896', '#00a87a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresRow}>
          {FEATURES.map((f, i) => (
            <View
              key={i}
              style={styles.featureCard}
            >
              <View style={styles.featureIconBox}>
                <Ionicons name={f.icon} size={20} color="#00c896" />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.description}</Text>
            </View>
          ))}
        </View>

        {/* Trust Badge */}
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#00c896" />
          <Text style={styles.trustText}>HIPAA Compliant &amp; Secure</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
  },
  glowTop: {
    position: 'absolute',
    top: -60,
    left: width / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0,200,150,0.06)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 0,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(111,94,245,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00c896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00c896',
    letterSpacing: -0.3,
  },
  signInButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(0,200,150,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,150,0.18)',
  },
  signInText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00c896',
  },
  hero: {
    paddingTop: 32,
    paddingBottom: 36,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00c896',
    letterSpacing: 0.18 * 11,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 38,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 46,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  taglineAccent: {
    color: '#00c896',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 24,
    marginBottom: 28,
    fontWeight: '400',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 8,
    shadowColor: '#00c896',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  featureCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0,200,150,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,150,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    textAlign: 'center',
    lineHeight: 16,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 16,
    gap: 8,
  },
  trustText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.30)',
    letterSpacing: 0.3,
  },
});
