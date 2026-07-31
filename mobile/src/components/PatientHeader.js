import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PatientHeader({ patient, onPress, theme }) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.photoWrapper}>
        <Image source={{ uri: patient.photo }} style={styles.photo} />
        {/* Online indicator */}
        <View
          style={[
            styles.onlineDot,
            { backgroundColor: theme.primary, shadowColor: theme.primary },
          ]}
        />
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>{patient.name}</Text>
        <Text style={[styles.details, { color: theme.textSecondary }]}>
          {patient.age} yrs · {patient.conditions[0]}
        </Text>
      </View>

      <View
        style={[
          styles.chevronBox,
          { backgroundColor: `${theme.primary}14`, borderColor: `${theme.primary}22` },
        ]}
      >
        <Ionicons name="chevron-forward" size={16} color={theme.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 22,
    marginTop: 16,
    borderWidth: 1,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 54,
    height: 54,
    borderRadius: 16,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  details: {
    fontSize: 13,
    fontWeight: '500',
  },
  chevronBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
