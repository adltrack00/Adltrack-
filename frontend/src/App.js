import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import Account from "./delivery/Account";
import { GetStarted, Join, SignIn, SignUpCompany } from "./delivery/AuthPages";
import { AuthProvider, homeFor, useAuth } from "./delivery/auth";
import Company from "./delivery/Company";
import Landing from "./delivery/Landing";
import { LiveAlerts } from "./delivery/alerts";
import Rider from "./delivery/Rider";
import Setup from "./delivery/Setup";
import Vendor from "./delivery/Vendor";
import { useWorkspace, WorkspaceProvider } from "./delivery/store";
import { AdaMark } from "./delivery/ui";

// Pages:
//   /                 landing page            /get-started   pick company, vendor or rider
//   /signin           sign in                 /signup/company   a delivery company signs up
//   /join/<code>      a vendor or rider joins with the invite their company sent
//   /company  /vendor  /rider   each person's own dashboard (signed in)
//   /setup            first-time setup for a new company      /account   profile, password, sign out

function useGo() {
  const navigate = useNavigate();
  return (to) => navigate(String(to).replace(/^#/, "") || "/");
}

function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(120%_80%_at_20%_0%,#141a5c_0%,#0a0d2e_45%,#05061a_100%)]">
      <AdaMark size={56} spin />
    </div>
  );
}

// Signed-in pages share one live workspace. Wrong role? Go to your own dashboard.
function Signed({ role, children }) {
  const { me, user, expired } = useAuth();
  const location = useLocation();
  if (me === undefined) return <Loading />;
  if (!user) return <Navigate to={`/signin?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return (
    <WorkspaceProvider key={user.id} user={user} onExpired={expired}>
      <WhenLoaded>
        <LiveAlerts />
        {children}
      </WhenLoaded>
    </WorkspaceProvider>
  );
}

function WhenLoaded({ children }) {
  const { loaded } = useWorkspace();
  return loaded ? children : <Loading />;
}

function CompanyHome() {
  const go = useGo();
  const { state, fresh } = useWorkspace();
  // A new company starts with the short setup.
  if (fresh && !state.company.setupDone && !state.vendors.length && !state.riders.length) return <Navigate to="/setup" replace />;
  return <Company go={go} />;
}

function Page({ C, ...rest }) {
  const go = useGo();
  return <C go={go} {...rest} />;
}

function VendorHome() {
  const go = useGo();
  const { user } = useAuth();
  return <Vendor vendorId={user.ref} go={go} />;
}

function RiderHome() {
  const go = useGo();
  const { user } = useAuth();
  return <Rider riderId={user.ref} go={go} />;
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollTop />
        <Toaster position="top-center" richColors closeButton />
        <Routes>
          <Route path="/" element={<Page C={Landing} />} />
          <Route path="/get-started" element={<Page C={GetStarted} />} />
          <Route path="/signin" element={<Page C={SignIn} />} />
          <Route path="/signup/company" element={<Page C={SignUpCompany} />} />
          <Route path="/join" element={<Page C={Join} />} />
          <Route path="/join/:code" element={<Page C={Join} />} />
          <Route path="/company" element={<Signed role="company"><CompanyHome /></Signed>} />
          <Route path="/setup" element={<Signed role="company"><Page C={Setup} /></Signed>} />
          <Route path="/vendor" element={<Signed role="vendor"><VendorHome /></Signed>} />
          <Route path="/rider" element={<Signed role="rider"><RiderHome /></Signed>} />
          <Route path="/account" element={<Signed><Page C={Account} /></Signed>} />
          <Route path="/app" element={<Signed><GoHome /></Signed>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function GoHome() {
  const { user } = useAuth();
  return <Navigate to={homeFor(user)} replace />;
}
