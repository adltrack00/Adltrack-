import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { mockPatient, mockTasks, mockVitals, mockRequests } from '../../data/mockData';
import TaskCard from '../../components/TaskCard';
import VitalsCard from '../../components/VitalsCard';
import PatientHeader from '../../components/PatientHeader';
import AICopilotButton from '../../components/AICopilotButton';

const VITALS_CONFIG = [
  { icon: 'heart',        label: 'Blood Pressure', accentColor: '#f472b6', accentRgb: '244,114,182', key: 'bp',   getValue: v => `${v?.systolic}/${v?.diastolic}`, unit: 'mmHg', vitalType: 'bp'   },
  { icon: 'pulse',        label: 'Heart Rate',     accentColor: '#fb923c', accentRgb: '251,146,60',  key: 'hr',   getValue: v => `${v?.value}`,                   unit: 'bpm',  vitalType: 'hr'   },
  { icon: 'thermometer',  label: 'Temperature',    accentColor: '#60a5fa', accentRgb: '96,165,250',  key: 'temp', getValue: v => `${v?.value}`,                   unit: '°F',   vitalType: 'temp' },
  { icon: 'fitness',      label: 'Pain Level',     accentColor: '#a78bfa', accentRgb: '167,139,250', key: 'pain', getValue: v => `${v?.value}`,                   unit: '/10',  vitalType: 'pain' },
];

export default function CaregiverHomeScreen({ navigation }) {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState(mockTasks);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleVitalPress = (vitalType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('VitalsModal', { vitalType });
  };

  const handlePatientPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('PatientProfile');
  };

  const latestVitals = {
    bp:   mockVitals.bloodPressure[0],
    hr:   mockVitals.heartRate[0],
    temp: mockVitals.temperature[0],
    pain: mockVitals.pain[0],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Patient Header */}
        <PatientHeader
          patient={mockPatient}
          onPress={handlePatientPress}
          theme={theme}
        />

        {/* Vitals Grid */}
        <View style={styles.vitalsGrid}>
          {VITALS_CONFIG.map((cfg) => (
            <VitalsCard
              key={cfg.key}
              icon={cfg.icon}
              label={cfg.label}
              value={cfg.getValue(latestVitals[cfg.key])}
              unit={cfg.unit}
              theme={theme}
              accentColor={cfg.accentColor}
              accentRgb={cfg.accentRgb}
              onPress={() => handleVitalPress(cfg.vitalType)}
            />
          ))}
        </View>

        {/* Progress Card */}
        <View
          style={[
            styles.progressContainer,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.text }]}>Today's Progress</Text>
            <Text style={[styles.progressCount, { color: theme.textSecondary }]}>
              {completedTasks}/{totalTasks} tasks
            </Text>
          </View>
          {/* Track */}
          <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressPercent, { color: theme.primary }]}>
            {Math.round(progressPercent)}% complete
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {[
            { key: 'tasks',    label: "Today's Tasks" },
            { key: 'requests', label: 'Requests' },
          ].map(({ key, label }) => {
            const active = activeTab === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.tab,
                  active && styles.tabActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab(key);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: active ? '#ffffff' : theme.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List */}
        <View style={styles.listContainer}>
          {activeTab === 'tasks' ? (
            tasks.map((task) => (
              <TaskCard
                key={task.task_id}
                task={task}
                theme={theme}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('TaskDetail', { task });
                }}
              />
            ))
          ) : (
            mockRequests.map((request) => {
              const priorityColor =
                request.priority === 'critical' ? '#ff4757' :
                request.priority === 'standard' ? '#00c896' :
                theme.border;
              const priorityRgb =
                request.priority === 'critical' ? '255,71,87' :
                request.priority === 'standard' ? '0,200,150' :
                '255,255,255';
              return (
                <View
                  key={request.id}
                  style={[
                    styles.requestCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.requestHeader}>
                    <View style={[styles.priorityBadge, { backgroundColor: `rgba(${priorityRgb},0.14)` }]}>
                      <Text style={[styles.priorityText, { color: priorityColor }]}>
                        {request.priority.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.requestTime, { color: theme.textSecondary }]}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.requestTitle, { color: theme.text }]}>
                    {request.title}
                  </Text>
                  <Text style={[styles.requestDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                    {request.description}
                  </Text>
                  <Text style={[styles.requestBy, { color: theme.textSecondary }]}>
                    From: {request.createdBy}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <AICopilotButton navigation={navigation} theme={theme} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    marginHorizontal: -6,
  },
  progressContainer: {
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#00c896',
    shadowColor: '#00c896',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginTop: 20,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#00c896',
    shadowColor: '#00c896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContainer: {
    marginTop: 16,
    gap: 10,
  },
  requestCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  requestTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  requestTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
    letterSpacing: -0.1,
  },
  requestDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  requestBy: {
    fontSize: 12,
    fontWeight: '500',
  },
});
