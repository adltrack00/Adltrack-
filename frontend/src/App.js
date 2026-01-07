import React, { useState } from "react";
import "@/App.css";
import { UserRole } from "./types";
import { LandingPage } from "./components/LandingPage";
import { FamilyDashboard } from "./components/FamilyDashboard";
import { CaregiverDashboard } from "./components/CaregiverDashboard";
import { EnterpriseDashboard } from "./components/EnterpriseDashboard";
import { FAQPage } from "./components/FAQPage";

function App() {
  const [currentRole, setCurrentRole] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'faq'

  const handleSelectRole = (role) => {
    setCurrentRole(role);
    setCurrentPage('landing');
  };

  const handleBack = () => {
    setCurrentRole(null);
    setCurrentPage('landing');
  };

  const handleNavigateToFAQ = () => {
    setCurrentPage('faq');
    setCurrentRole(null);
  };

  // Render the appropriate view based on current role/page
  const renderView = () => {
    // If FAQ page is requested
    if (currentPage === 'faq') {
      return <FAQPage onBack={handleBack} />;
    }
    
    // Dashboard views
    switch (currentRole) {
      case UserRole.FAMILY:
        return <FamilyDashboard onBack={handleBack} />;
      case UserRole.CAREGIVER:
        return <CaregiverDashboard onBack={handleBack} />;
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
