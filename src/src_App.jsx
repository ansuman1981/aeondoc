import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";

// ─── Supabase ────────────────────────────────────────────────────
const SUPABASE_URL = "https://izjjhnfwhzioxbpvuizf.supabase.co";
const SUPABASE_KEY = "sb_publishable_L9nUyZMSqeeftdPfACyZ_g_j_m84RSK";

let _sb = null;
export async function sb() {
  if (_sb) return _sb;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  _sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  return _sb;
}

// ─── App Shell ───────────────────────────────────────────────────
export default function App() {
  const [user,       setUser]       = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [screen,     setScreen]     = useState("landing"); // landing | auth | dashboard | editor
  const [activeDoc,  setActiveDoc]  = useState(null);

  useEffect(() => {
    sb().then(client => {
      client.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
        setAuthLoaded(true);
        // if already logged in skip landing
        if (session?.user) setScreen("dashboard");
      });
      client.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        if (session?.user) setScreen("dashboard");
      });
    });
  }, []);

  const handleSignOut = async () => {
    const client = await sb();
    await client.auth.signOut();
    setUser(null);
    setScreen("landing");
    setActiveDoc(null);
  };

  // Loading spinner
  if (!authLoaded) return (
    <div style={{ minHeight:"100vh", background:"#F5F2ED", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ width:36, height:36, borderRadius:9, background:"#6B8F71", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M3 9h9M3 13h11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </div>
        <div style={{ width:18, height:18, border:"2px solid #E2DDD7", borderTopColor:"#6B8F71", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (screen === "landing")   return <Landing   onGetStarted={() => setScreen("auth")} />;
  if (screen === "auth")      return <Auth      onAuth={setUser} onBack={() => setScreen("landing")} />;
  if (screen === "editor")    return <Editor    user={user} doc={activeDoc} onBack={() => { setActiveDoc(null); setScreen("dashboard"); }} />;
  return (
    <Dashboard
      user={user}
      onOpen={doc  => { setActiveDoc(doc);  setScreen("editor");    }}
      onNew={()    => { setActiveDoc(null); setScreen("editor");    }}
      onSignOut={handleSignOut}
    />
  );
}
