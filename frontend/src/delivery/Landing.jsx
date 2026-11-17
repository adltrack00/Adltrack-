// Production serves the approved marketing document directly through FastAPI.
// This bridge also supports React navigation and the standalone development server.
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
export default function Landing() {
  const { pathname, search, hash } = useLocation();
  const target = process.env.NODE_ENV === "production" ? pathname : "/marketing" + (pathname === "/" ? "" : pathname) + "/index.html";
  useEffect(() => { window.location.replace(target + search + hash); }, [target, search, hash]);
  return <main style={{padding:32, background:"#f8f7f2", minHeight:"100vh"}}><a href={target + search + hash}>Continue to Ada</a></main>;
}
