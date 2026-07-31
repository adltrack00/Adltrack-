import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VitalsCard({ icon, label, value, unit, theme, onPress, accentColor, accentRgb }) {
  const accent = accentColor || theme.primary;
  const rgb = accentRgb || '0,200,150';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: `rgba(${rgb},0.12)`,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: `rgba(${rgb},0.12)`,
            borderColor: `rgba(${rgb},0.18)`,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={[styles.value, { color: theme.text }]}>
        {value}
        <Text style={[styles.unit, { color: theme.textSecondary }]}> {unit}</Text>
      </Text>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    margin: '1%',
    borderWidth: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  unit: {
    fontSize: 13,
    fontWeight: '400',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
