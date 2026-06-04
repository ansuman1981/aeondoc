import { useState } from "react";
import { sb } from "../App";

const C = { bg:"#F5F2ED",chrome:"#FDFCFA",border:"#E2DDD7",uiText:"#3D3A36",muted:"#A09C97",sub:"#6B6560",accent:"#6B8F71",accentLight:"rgba(107,143,113,0.12)",accentDark:"#4A6B4F",red:"#E05252",redLight:"rgba(224,82,82,0.10)" };

export default function Auth({ onAuth, onBack }) {
  const [mode,    setMode]    = useState("login");
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [name,    setName]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const client = await sb();
    try {
      if (mode === "login") {
        const { data, error: err } = await client.auth.signInWithPassword({ email, password: pass });
        if (err) throw err;
        onAuth(data.user);
      } else {
        const { data, error: err } = await client.auth.signUp({ email, password: pass, options: { data: { full_name: name } } });
        if (err) throw err;
        if (data.user) onAuth(data.user);
        else setError("Check your email to confirm your account, then sign in.");
      }
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const googleSignIn = async () => {
    const client = await sb();
    await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',system-ui,sans-serif", padding:24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes popUp{from{opacity:0;transform:scale(0.97) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        *{box-sizing:border-box}
        input{outline:none}
        input:focus{border-color:${C.accent}!important}
      `}</style>

      <div style={{ background:C.chrome, border:`1px solid ${C.border}`, borderRadius:20, padding:"40px", width:"min(420px,100%)", boxShadow:"0 16px 56px rgba(44,40,37,0.12)", animation:"popUp 0.25s cubic-bezier(0.16,1,0.3,1)" }}>

        {/* Back button */}
        <button onClick={onBack}
          style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:"5px 12px", fontSize:12, cursor:"pointer", fontFamily:"inherit", marginBottom:24, display:"flex", alignItems:"center", gap:5, transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accentDark}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted}}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to home
        </button>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:C.accent, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize:17, fontWeight:600, color:C.accentDark }}>Aeondoc</span>
        </div>

        <h1 style={{ fontSize:22, fontWeight:400, color:C.uiText, fontFamily:"'DM Serif Display',Georgia,serif", marginBottom:4 }}>
          {mode==="login" ? "Welcome back" : "Create your account"}
        </h1>
        <p style={{ fontSize:13, color:C.muted, marginBottom:28 }}>
          {mode==="login" ? "Sign in to your documents" : "Start writing for free"}
        </p>

        {/* Google */}
        <button onClick={googleSignIn} disabled={loading}
          style={{ width:"100%", background:C.chrome, border:`1px solid ${C.border}`, borderRadius:10, padding:"11px", fontSize:13, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:18, color:C.uiText, fontFamily:"inherit", transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.background=C.accentLight}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.chrome}}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84-.63-.47z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
          <div style={{ flex:1, height:1, background:"#EDE9E3" }}/><span style={{ fontSize:11, color:C.muted, fontWeight:500 }}>or</span><div style={{ flex:1, height:1, background:"#EDE9E3" }}/>
        </div>

        <form onSubmit={submit}>
          {mode==="signup" && (
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:500, color:C.sub, display:"block", marginBottom:5 }}>Full name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required
                style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:9, padding:"10px 14px", fontSize:14, color:C.uiText, fontFamily:"inherit", background:C.bg, transition:"border-color 0.15s" }}/>
            </div>
          )}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, fontWeight:500, color:C.sub, display:"block", marginBottom:5 }}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required
              style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:9, padding:"10px 14px", fontSize:14, color:C.uiText, fontFamily:"inherit", background:C.bg, transition:"border-color 0.15s" }}/>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:12, fontWeight:500, color:C.sub, display:"block", marginBottom:5 }}>Password</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" required minLength={6}
              style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:9, padding:"10px 14px", fontSize:14, color:C.uiText, fontFamily:"inherit", background:C.bg, transition:"border-color 0.15s" }}/>
          </div>
          {error && <div style={{ background:C.redLight, border:`1px solid ${C.red}44`, borderRadius:8, padding:"9px 12px", fontSize:12, color:C.red, marginBottom:16, lineHeight:1.5 }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width:"100%", background:loading?C.muted:C.accent, border:"none", color:"#fff", borderRadius:10, padding:"12px", fontSize:14, fontWeight:600, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit", transition:"all 0.18s" }}
            onMouseEnter={e=>{if(!loading)e.currentTarget.style.background=C.accentDark}}
            onMouseLeave={e=>{if(!loading)e.currentTarget.style.background=C.accent}}>
            {loading ? "Please wait…" : mode==="login" ? "Sign in →" : "Create account →"}
          </button>
        </form>

        <p style={{ textAlign:"center", fontSize:13, color:C.muted, marginTop:20 }}>
          {mode==="login" ? "No account? " : "Already have one? "}
          <button onClick={()=>{setMode(m=>m==="login"?"signup":"login");setError("");}}
            style={{ background:"none", border:"none", color:C.accentDark, fontWeight:600, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
            {mode==="login" ? "Sign up free" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
