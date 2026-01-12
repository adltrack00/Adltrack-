import React, { useState } from "react";
import "@/App.css";
import { UserRole, TaskStatus } from "./types";
import { LandingPage } from "./components/LandingPage";
import { FamilyDashboard } from "./components/FamilyDashboard";
import { CaregiverDashboard } from "./components/CaregiverDashboard";
import { EnterpriseDashboard } from "./components/EnterpriseDashboard";
import { FAQPage } from "./components/FAQPage";
import { SignInPage } from "./components/SignInPage";
import { INITIAL_TASKS, PROPOSED_TASKS, INITIAL_VITALS, PATIENT_PROFILE } from "./services/mockData";

function App() {
  const [currentRole, setCurrentRole] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'faq', 'signin'
  
  // State for tasks
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [proposedTasks, setProposedTasks] = useState(PROPOSED_TASKS);
  
  // State for vitals
  const [vitalsData, setVitalsData] = useState(INITIAL_VITALS);
  
  // State for patient
  const [patient, setPatient] = useState(PATIENT_PROFILE);

  const handleSelectRole = (role) => {
    setCurrentRole(role);
    setCurrentPage('dashboard');
  };

  const handleBack = () => {
    setCurrentRole(null);
    setCurrentPage('landing');
  };

  const handleSignOut = () => {
    setCurrentRole(null);
    setCurrentPage('signin');
  };

  const handleNavigateToFAQ = () => {
    setCurrentPage('faq');
    setCurrentRole(null);
  };

  const handleNavigateToSignIn = () => {
    setCurrentPage('signin');
  };

  // Task handlers
  const handleUpdateTask = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const handleAcceptTask = (task) => {
    // Move from proposed to active tasks
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
    // In a real app, you'd send the decline reason to the backend
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

  // Render the appropriate view based on current role/page
  const renderView = () => {
    // If FAQ page is requested
    if (currentPage === 'faq') {
      return <FAQPage onBack={handleBack} />;
    }
    
    // If sign-in page is requested
    if (currentPage === 'signin') {
      return <SignInPage onSelectRole={handleSelectRole} />;
    }
    
    // Dashboard views
    switch (currentRole) {
      case UserRole.FAMILY:
        return (
          <FamilyDashboard 
            onBack={handleBack}
            onSignOut={handleSignOut}
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
            tasks={tasks}
            proposedTasks={proposedTasks}
            patient={patient}
            vitalsData={vitalsData}
            onUpdateTask={handleUpdateTask}
            onAcceptTask={handleAcceptTask}
            onDeclineTask={handleDeclineTask}
            onAddVital={handleAddVital}
            onUpdatePatientPhoto={handleUpdatePatientPhoto}
          />
        );
      case UserRole.ENTERPRISE:
        return <EnterpriseDashboard onBack={handleBack} />;
      default:
        return <LandingPage onSelectRole={handleSelectRole} onNavigateToFAQ={handleNavigateToFAQ} />;
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;
