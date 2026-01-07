import React, { useState } from "react";
import "@/App.css";
import { UserRole } from "./types";
import { LandingPage } from "./components/LandingPage";
import { FamilyDashboard } from "./components/FamilyDashboard";
import { CaregiverDashboard } from "./components/CaregiverDashboard";
import { EnterpriseDashboard } from "./components/EnterpriseDashboard";

function App() {
  const [currentRole, setCurrentRole] = useState(null);

  const handleSelectRole = (role) => {
    setCurrentRole(role);
  };

  const handleBack = () => {
    setCurrentRole(null);
  };

  // Render the appropriate view based on current role
  const renderView = () => {
    switch (currentRole) {
      case UserRole.FAMILY:
        return <FamilyDashboard onBack={handleBack} />;
      case UserRole.CAREGIVER:
        return <CaregiverDashboard onBack={handleBack} />;
      case UserRole.ENTERPRISE:
        return <EnterpriseDashboard onBack={handleBack} />;
      default:
        return <LandingPage onSelectRole={handleSelectRole} />;
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;
