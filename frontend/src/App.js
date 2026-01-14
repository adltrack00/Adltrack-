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
import { AuthCallback } from "./components/AuthCallback";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { INITIAL_TASKS, PROPOSED_TASKS, INITIAL_VITALS, PATIENT_PROFILE } from "./services/mockData";

// Inner App component that uses auth context
function AppContent() {
  const { user, isAuthenticated, isLoading, logout, checkAuth } = useAuth();
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState('landing');
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [selectedRole, setSelectedRole] = useState(null);
  
  // State for tasks (will be replaced with API data)
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [proposedTasks, setProposedTasks] = useState(PROPOSED_TASKS);
  
  // State for vitals
  const [vitalsData, setVitalsData] = useState(INITIAL_VITALS);
  
  // State for patient
  const [patient, setPatient] = useState(PATIENT_PROFILE);

  // Check URL for auth callback - detect synchronously before first render decision
  const hasSessionIdInHash = window.location.hash?.includes('session_id=');

  // Handle role switch (same user, different view)
  const handleRoleSwitch = (newRole) => {
    setSelectedRole(newRole);
    // Refresh auth to get updated role
    checkAuth();
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

  // Handle auth callback completion
  const handleAuthComplete = (userData, error) => {
    if (error) {
      console.error('Auth error:', error);
      setCurrentPage('role-selection');
      return;
    }
    
    if (userData) {
      setSelectedRole(userData.role || selectedRole || UserRole.FAMILY);
      setCurrentPage('dashboard');
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    await logout();
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

  // Show loading while checking auth
  if (isLoading && currentPage !== 'landing' && currentPage !== 'faq') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate view
  const renderView = () => {
    // Handle auth callback (session_id in URL) - check synchronously
    if (hasSessionIdInHash) {
      return <AuthCallback onAuthComplete={handleAuthComplete} />;
    }

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
        />
      );
    }

    // Dashboard views (authenticated)
    if (currentPage === 'dashboard' && selectedRole) {
      const role = user?.role || selectedRole;
      
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
    <div className="App">
      {renderView()}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
