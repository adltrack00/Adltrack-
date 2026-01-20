import React, { useState } from "react";
import "@/App.css";
import { UserRole, TaskStatus } from "./types";
import { LandingPage } from "./components/LandingPage";
import { FamilyDashboard } from "./components/FamilyDashboard";
import { CaregiverDashboard } from "./components/CaregiverDashboard";
import { EnterpriseDashboard } from "./components/EnterpriseDashboard";
import { FAQPage } from "./components/FAQPage";
import { RoleSelectionPage } from "./components/RoleSelectionPage";
import { AuthPage } from "./components/AuthPage";
import { ThemeProvider } from "./context/ThemeContext";
import { INITIAL_TASKS, PROPOSED_TASKS, INITIAL_VITALS, PATIENT_PROFILE, CAREGIVER_PROFILE } from "./services/mockData";

function App() {
  // Mock user state (no real auth)
  const [mockUser, setMockUser] = useState(null);
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState('landing');
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [selectedRole, setSelectedRole] = useState(null);
  
  // State for tasks (shared across all roles)
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [proposedTasks, setProposedTasks] = useState(PROPOSED_TASKS);
  
  // State for vitals (shared across all roles)
  const [vitalsData, setVitalsData] = useState(INITIAL_VITALS);
  
  // State for patient
  const [patient, setPatient] = useState(PATIENT_PROFILE);

  // State for incidents (shared across all roles)
  const [incidents, setIncidents] = useState([]);

  // Handle role switch (same user, different view)
  const handleRoleSwitch = (newRole) => {
    setSelectedRole(newRole);
    if (mockUser) {
      setMockUser({ ...mockUser, role: newRole });
    }
  };

  // Handle navigation from landing page login/signup buttons
  const handleNavigateToAuth = (mode = 'signin') => {
    setAuthMode(mode);
    setCurrentPage('role-selection');
  };

  // Handle role selection from role selection page
  const handleRoleSelect = (role, switchMode = false) => {
    if (switchMode !== false) {
      // User clicked switch mode link
      setAuthMode(switchMode ? 'signup' : 'signin');
      return;
    }
    setSelectedRole(role);
    setCurrentPage('auth');
  };

  // Handle auth mode switch (signin <-> signup)
  const handleSwitchAuthMode = () => {
    setAuthMode(prev => prev === 'signin' ? 'signup' : 'signin');
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentPage === 'auth') {
      setCurrentPage('role-selection');
      setSelectedRole(null);
    } else if (currentPage === 'role-selection') {
      setCurrentPage('landing');
    } else if (currentPage === 'faq') {
      setCurrentPage('landing');
    } else if (currentPage === 'dashboard') {
      setCurrentPage('landing');
    } else {
      setCurrentPage('landing');
    }
  };

  // Handle mock auth success (just navigate to dashboard)
  const handleAuthSuccess = (userData) => {
    setMockUser(userData);
    setSelectedRole(userData.role);
    setCurrentPage('dashboard');
  };

  // Handle sign out
  const handleSignOut = () => {
    setMockUser(null);
    setSelectedRole(null);
    setCurrentPage('landing');
  };

  // Handle FAQ navigation
  const handleNavigateToFAQ = () => {
    setCurrentPage('faq');
  };

  // Task handlers
  const handleUpdateTask = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const handleAcceptTask = (task) => {
    const acceptedTask = {
      ...task,
      status: TaskStatus.PENDING,
      acceptedAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, acceptedTask]);
    setProposedTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const handleDeclineTask = (taskId, reason) => {
    setProposedTasks(prev => prev.filter(t => t.id !== taskId));
    console.log(`Task ${taskId} declined with reason: ${reason}`);
  };

  // Vitals handlers
  const handleAddVital = (vitalType, vitalEntry) => {
    setVitalsData(prev => {
      const typeMap = {
        'bp': 'bloodPressure',
        'hr': 'heartRate',
        'temp': 'temperature',
        'pain': 'pain'
      };
      const key = typeMap[vitalType];
      return {
        ...prev,
        [key]: [...(prev[key] || []), vitalEntry]
      };
    });
  };

  // Patient handlers
  const handleUpdatePatientPhoto = (photoUrl) => {
    setPatient(prev => ({
      ...prev,
      photo: photoUrl
    }));
  };

  // Incident handlers
  const handleAddIncident = (incident) => {
    const newIncident = {
      ...incident,
      id: Date.now(),
      createdAt: new Date().toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
      }),
      createdBy: CAREGIVER_PROFILE,
      status: 'new',
      familyNotified: incident.notifyFamily
    };
    setIncidents(prev => [newIncident, ...prev]);
  };

  // Render the appropriate view
  const renderView = () => {
    // FAQ page
    if (currentPage === 'faq') {
      return <FAQPage onBack={handleBack} />;
    }

    // Role selection page (after clicking login/signup from landing)
    if (currentPage === 'role-selection') {
      return (
        <RoleSelectionPage 
          mode={authMode}
          onSelectRole={handleRoleSelect}
          onBack={handleBack}
        />
      );
    }

    // Auth page (sign in / sign up with selected role)
    if (currentPage === 'auth') {
      return (
        <AuthPage
          mode={authMode}
          selectedRole={selectedRole}
          onBack={handleBack}
          onSwitchMode={handleSwitchAuthMode}
          onAuthSuccess={handleAuthSuccess}
        />
      );
    }

    // Dashboard views
    if (currentPage === 'dashboard' && selectedRole) {
      const role = mockUser?.role || selectedRole;
      
      switch (role) {
        case UserRole.FAMILY:
          return (
            <FamilyDashboard 
              onBack={handleBack}
              onSignOut={handleSignOut}
              onRoleSwitch={handleRoleSwitch}
              currentRole={role}
              tasks={tasks}
              patient={patient}
              vitalsData={vitalsData}
              incidents={incidents}
            />
          );
        case UserRole.CAREGIVER:
          return (
            <CaregiverDashboard 
              onBack={handleBack}
              onSignOut={handleSignOut}
              onRoleSwitch={handleRoleSwitch}
              currentRole={role}
              tasks={tasks}
              proposedTasks={proposedTasks}
              patient={patient}
              vitalsData={vitalsData}
              onUpdateTask={handleUpdateTask}
              onAcceptTask={handleAcceptTask}
              onDeclineTask={handleDeclineTask}
              onAddVital={handleAddVital}
              onUpdatePatientPhoto={handleUpdatePatientPhoto}
              incidents={incidents}
              onAddIncident={handleAddIncident}
              skipStartShift={true}
            />
          );
        case UserRole.ENTERPRISE:
          return (
            <EnterpriseDashboard 
              onBack={handleBack} 
              onSignOut={handleSignOut}
              onRoleSwitch={handleRoleSwitch}
              currentRole={role}
            />
          );
        default:
          break;
      }
    }

    // Default: Landing page
    return (
      <LandingPage 
        onNavigateToAuth={handleNavigateToAuth}
        onNavigateToFAQ={handleNavigateToFAQ}
      />
    );
  };

  return (
    <ThemeProvider>
      <div className="App">
        {renderView()}
      </div>
    </ThemeProvider>
  );
}

export default App;
