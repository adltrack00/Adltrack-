import React, { useEffect, useState } from "react";
import Company from "./delivery/Company";
import Home from "./delivery/Home";
import Rider from "./delivery/Rider";
import Vendor from "./delivery/Vendor";
import { WorkspaceProvider } from "./delivery/store";

// Routes live in the URL hash, so each dashboard can be opened in its own tab (or on a rider's phone):
//   #/company   #/vendor/<vendor id>   #/rider/<rider id>
function useHash() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const on = () => { setHash(window.location.hash || "#/"); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash;
}

function Routes() {
  const hash = useHash();
  const go = (to) => { window.location.hash = to; };
  const [, section, id] = hash.replace(/^#/, "").split("/");
  if (section === "company") return <Company go={go} />;
  if (section === "vendor") return <Vendor vendorId={id} go={go} />;
  if (section === "rider") return <Rider riderId={id} go={go} />;
  return <Home go={go} />;
}

export default function App() {
  return (
    <WorkspaceProvider>
      <Routes />
    </WorkspaceProvider>
  );
}
