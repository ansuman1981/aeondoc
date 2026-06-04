import { useState, useRef, useEffect, useCallback } from "react";

// ─── Supabase Config ─────────────────────────────────────────────
const SUPABASE_URL  = "https://izjjhnfwhzioxbpvuizf.supabase.co";
const SUPABASE_KEY  = "sb_publishable_L9nUyZMSqeeftdPfACyZ_g_j_m84RSK";

// ─── Supabase client (loaded dynamically) ────────────────────────
let _sb = null;
async function sb() {
  if (_sb) return _sb;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  _sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  return _sb;
}

// ─── Palette ─────────────────────────────────────────────────────
const C = {
  bg:"#F5F2ED", chrome:"#FDFCFA", border:"#E2DDD7", borderLight:"#EDE9E3",
  canvas:"#FFFFFF", uiText:"#3D3A36", sub:"#6B6560", muted:"#A09C97",
  accent:"#6B8F71", accentLight:"rgba(107,143,113,0.12)", accentDark:"#4A6B4F",
  rose:"#C0826A", roseLight:"rgba(192,130,106,0.12)",
  sky:"#7B9BAD", skyLight:"rgba(123,155,173,0.12)",
  amber:"#C9924A", amberLight:"rgba(201,146,74,0.12)",
  saved:"#7AAB82", offline:"#E07B39",
  red:"#E05252", redLight:"rgba(224,82,82,0.10)",
};

const FONTS = [
  { label:"DM Sans",   value:"'DM Sans', system-ui, sans-serif" },
  { label:"Serif",     value:"'DM Serif Display', Georgia, serif" },
  { label:"Mono",      value:"'Courier New', Courier, monospace" },
  { label:"Georgia",   value:"Georgia, 'Times New Roman', serif" },
  { label:"Trebuchet", value:"'Trebuchet MS', sans-serif" },
];
const SIZES   = [10,11,12,13,14,15,16,18,20,22,24,28,32,36,48];
const PALETTE = [
  "#1A1A1A","#555","#888","#BBB","#FFF",
  "#C0392B","#E74C3C","#D35400","#E67E22","#F39C12","#F1C40F",
  "#27AE60","#6B8F71","#1ABC9C","#2980B9","#3498DB",
  "#8E44AD","#9B59B6","#C0826A","#7B9BAD","#C9924A",
];

const uid  = () => Math.random().toString(36).slice(2,10);
const ago  = d => { if(!d) return ""; const s=Math.floor((Date.now()-new Date(d).getTime())/1000); if(s<60)return"just now";if(s<3600)return`${Math.floor(s/60)}m ago`;if(s<86400)return`${Math.floor(s/3600)}h ago`;return`${Math.floor(s/86400)}d ago`; };
const SEP  = () => <div style={{width:1,height:20,background:C.borderLight,margin:"0 4px",flexShrink:0}}/>;

// ─── AUTH SCREEN ─────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
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
    await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif",padding:24}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes popUp{from{opacity:0;transform:scale(0.97) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        input:focus{outline:none;border-color:${C.accent}!important}
        *{box-sizing:border-box}
      `}</style>
      <div style={{background:C.chrome,border:`1px solid ${C.border}`,borderRadius:20,padding:"40px",width:"min(420px,100%)",boxShadow:"0 16px 56px rgba(44,40,37,0.12)",animation:"popUp 0.25s cubic-bezier(0.16,1,0.3,1)"}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32}}>
          <div style={{width:36,height:36,borderRadius:9,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M3 9h9M3 13h11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </div>
          <span style={{fontSize:18,fontWeight:600,color:C.accentDark,letterSpacing:"0.03em"}}>Aeondoc</span>
        </div>
        <h1 style={{fontSize:22,fontWeight:400,color:C.uiText,fontFamily:"'DM Serif Display',Georgia,serif",marginBottom:4}}>
          {mode==="login"?"Welcome back":"Create your account"}
        </h1>
        <p style={{fontSize:13,color:C.muted,marginBottom:28}}>
          {mode==="login"?"Sign in to your documents":"Start writing for free — no credit card"}
        </p>

        {/* Google */}
        <button onClick={googleSignIn} disabled={loading}
          style={{width:"100%",background:C.chrome,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px",fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:18,color:C.uiText,fontFamily:"inherit",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.background=C.accentLight}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.chrome}}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
          <div style={{flex:1,height:1,background:C.borderLight}}/><span style={{fontSize:11,color:C.muted,fontWeight:500}}>or</span><div style={{flex:1,height:1,background:C.borderLight}}/>
        </div>

        <form onSubmit={submit}>
          {mode==="signup"&&(
            <div style={{marginBottom:12}}>
              <label style={{fontSize:12,fontWeight:500,color:C.sub,display:"block",marginBottom:5}}>Full name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Anshuman Jaiswal" required
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",fontSize:14,color:C.uiText,fontFamily:"inherit",background:C.bg,transition:"border-color 0.15s"}}/>
            </div>
          )}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,fontWeight:500,color:C.sub,display:"block",marginBottom:5}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required
              style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",fontSize:14,color:C.uiText,fontFamily:"inherit",background:C.bg,transition:"border-color 0.15s"}}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,fontWeight:500,color:C.sub,display:"block",marginBottom:5}}>Password</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" required minLength={6}
              style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",fontSize:14,color:C.uiText,fontFamily:"inherit",background:C.bg,transition:"border-color 0.15s"}}/>
          </div>
          {error&&(
            <div style={{background:C.redLight,border:`1px solid ${C.red}44`,borderRadius:8,padding:"9px 12px",fontSize:12,color:C.red,marginBottom:16,lineHeight:1.5}}>{error}</div>
          )}
          <button type="submit" disabled={loading}
            style={{width:"100%",background:loading?C.muted:C.accent,border:"none",color:"#fff",borderRadius:10,padding:"12px",fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",transition:"all 0.18s"}}
            onMouseEnter={e=>{if(!loading)e.currentTarget.style.background=C.accentDark}}
            onMouseLeave={e=>{if(!loading)e.currentTarget.style.background=C.accent}}>
            {loading?"Please wait…":mode==="login"?"Sign in →":"Create account →"}
          </button>
        </form>
        <p style={{textAlign:"center",fontSize:13,color:C.muted,marginTop:20}}>
          {mode==="login"?"No account? ":"Already have one? "}
          <button onClick={()=>{setMode(m=>m==="login"?"signup":"login");setError("");}}
            style={{background:"none",border:"none",color:C.accentDark,fontWeight:600,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>
            {mode==="login"?"Sign up free":"Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── DOCUMENT LIST ────────────────────────────────────────────────
function DocList({ user, onOpen, onNew, onSignOut }) {
  const [docs,    setDocs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [deleting,setDeleting]= useState(null);

  const fetchDocs = useCallback(async () => {
    const client = await sb();
    const { data } = await client
      .from("documents")
      .select("id,title,preview,words,starred,updated_at,folder")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setDocs(data || []);
    setLoading(false);
  }, [user.id]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  // realtime subscription
  useEffect(() => {
    let channel;
    sb().then(client => {
      channel = client
        .channel("docs-changes")
        .on("postgres_changes", { event:"*", schema:"public", table:"documents", filter:`user_id=eq.${user.id}` },
          () => fetchDocs()
        )
        .subscribe();
    });
    return () => { sb().then(c => c.removeChannel(channel)); };
  }, [user.id, fetchDocs]);

  const deleteDoc = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    setDeleting(id);
    const client = await sb();
    await client.from("documents").delete().eq("id", id);
    setDeleting(null);
  };

  const toggleStar = async (doc, e) => {
    e.stopPropagation();
    const client = await sb();
    await client.from("documents").update({ starred: !doc.starred }).eq("id", doc.id);
    fetchDocs();
  };

  const filtered = docs.filter(d =>
    !search || d.title?.toLowerCase().includes(search.toLowerCase())
  );

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const avatar      = user.user_metadata?.avatar_url;

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        .doc-card:hover{border-color:${C.accent}66!important;box-shadow:0 4px 20px rgba(107,143,113,0.10)!important;transform:translateY(-2px)!important}
        .doc-card:hover .del-btn{opacity:1!important}
        .doc-card:hover .star-btn{opacity:1!important}
      `}</style>

      {/* Nav */}
      <div style={{background:C.chrome,borderBottom:`1px solid ${C.border}`,padding:"12px 28px",display:"flex",alignItems:"center",gap:14,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:28,height:28,borderRadius:7,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M2 7h7M2 10h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span style={{fontSize:14,fontWeight:600,color:C.accentDark}}>Aeondoc</span>
        </div>

        <div style={{flex:1,maxWidth:380,position:"relative",marginLeft:16}}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.muted,pointerEvents:"none"}}>
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents…"
            style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 12px 8px 30px",fontSize:13,color:C.uiText,outline:"none",fontFamily:"inherit",transition:"border-color 0.15s"}}
            onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
        </div>

        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {avatar
              ? <img src={avatar} style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${C.border}`}}/>
              : <div style={{width:28,height:28,borderRadius:"50%",background:C.accentLight,border:`1px solid ${C.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.accentDark}}>{displayName[0].toUpperCase()}</div>
            }
            <span style={{fontSize:13,color:C.sub,fontWeight:500,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{displayName}</span>
          </div>
          <button onClick={onSignOut}
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.rose;e.currentTarget.style.color=C.rose}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted}}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{maxWidth:920,margin:"0 auto",padding:"36px 28px 80px"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:32}}>
          <div>
            <h1 style={{fontSize:26,fontWeight:400,color:C.uiText,fontFamily:"'DM Serif Display',Georgia,serif",marginBottom:4}}>
              Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, <em style={{color:C.accentDark}}>{displayName.split(" ")[0]}</em>
            </h1>
            <p style={{fontSize:13,color:C.muted}}>
              {filtered.length} document{filtered.length!==1?"s":""} · synced to Supabase ☁️
            </p>
          </div>
          <button onClick={onNew}
            style={{background:C.accent,border:"none",color:"#fff",borderRadius:10,padding:"11px 22px",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"inherit",transition:"all 0.18s",boxShadow:`0 4px 14px ${C.accent}44`,flexShrink:0}}
            onMouseEnter={e=>{e.currentTarget.style.background=C.accentDark;e.currentTarget.style.transform="translateY(-1px)"}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.accent;e.currentTarget.style.transform="none"}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            New Document
          </button>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:32}}>
          {[
            {label:"Total docs",  val:docs.length,                       color:C.accent},
            {label:"Starred",     val:docs.filter(d=>d.starred).length,  color:C.amber},
            {label:"This week",   val:docs.filter(d=>{ const w=7*24*3600*1000; return Date.now()-new Date(d.updated_at).getTime()<w; }).length, color:C.sky},
          ].map(s=>(
            <div key={s.label} style={{background:C.chrome,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 20px"}}>
              <div style={{fontSize:24,fontWeight:600,color:s.color,fontFamily:"'DM Serif Display',serif",marginBottom:2}}>{s.val}</div>
              <div style={{fontSize:12,color:C.muted}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Docs grid */}
        {loading ? (
          <div style={{display:"flex",alignItems:"center",gap:12,color:C.muted,padding:"40px 0"}}>
            <div style={{width:18,height:18,border:`2px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite",flexShrink:0}}/>
            Loading your documents…
          </div>
        ) : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"60px 0"}}>
            <div style={{fontSize:52,marginBottom:16}}>📄</div>
            <div style={{fontSize:18,color:C.sub,fontWeight:500,marginBottom:8}}>{search?"No results found":"No documents yet"}</div>
            <div style={{fontSize:14,color:C.muted,marginBottom:24}}>{search?`Nothing matched "${search}"`:"Your documents will appear here"}</div>
            {!search&&<button onClick={onNew} style={{background:C.accent,border:"none",color:"#fff",borderRadius:10,padding:"11px 24px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ New Document</button>}
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
            {filtered.map((doc,i)=>(
              <div key={doc.id} className="doc-card" onClick={()=>onOpen(doc)}
                style={{background:C.chrome,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"all 0.2s",animation:`fadeUp 0.4s ${i*0.04}s both`,position:"relative"}}>
                {/* Preview */}
                <div style={{padding:"20px 18px 14px",background:C.bg,borderBottom:`1px solid ${C.borderLight}`,minHeight:90}}>
                  <div style={{height:12,width:"55%",borderRadius:4,background:"rgba(44,40,37,0.15)",marginBottom:8}}/>
                  <div style={{height:7,width:"90%",borderRadius:3,background:"rgba(44,40,37,0.07)",marginBottom:5}}/>
                  <div style={{height:7,width:"70%",borderRadius:3,background:"rgba(44,40,37,0.07)",marginBottom:5}}/>
                  <div style={{height:7,width:"85%",borderRadius:3,background:"rgba(44,40,37,0.07)"}}/>
                </div>
                {/* Footer */}
                <div style={{padding:"12px 16px"}}>
                  <div style={{fontSize:14,fontWeight:600,color:C.uiText,marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.title||"Untitled"}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:11,color:C.muted}}>{ago(doc.updated_at)}</span>
                    <span style={{fontSize:11,color:C.muted}}>{doc.words||0} words</span>
                  </div>
                </div>
                {/* Star btn */}
                <button className="star-btn" onClick={e=>toggleStar(doc,e)}
                  style={{position:"absolute",top:8,left:8,width:26,height:26,borderRadius:7,background:doc.starred?"rgba(201,146,74,0.15)":C.chrome,border:`1px solid ${doc.starred?C.amber:C.border}`,color:doc.starred?C.amber:C.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:doc.starred?1:0,transition:"all 0.15s",fontSize:12}}>
                  {doc.starred?"★":"☆"}
                </button>
                {/* Delete btn */}
                <button className="del-btn" onClick={e=>deleteDoc(doc.id,e)}
                  disabled={deleting===doc.id}
                  style={{position:"absolute",top:8,right:8,width:26,height:26,borderRadius:7,background:C.chrome,border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"all 0.15s",fontSize:12}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.rose;e.currentTarget.style.color=C.rose;e.currentTarget.style.background=C.roseLight}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;e.currentTarget.style.background=C.chrome}}>
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EDITOR ──────────────────────────────────────────────────────
function Editor({ user, doc: initialDoc, onBack }) {
  const [title,      setTitle]      = useState(initialDoc?.title || "");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [wordCount,  setWordCount]  = useState(initialDoc?.words || 0);
  const [aiMode,     setAiMode]     = useState(null);
  const [aiResult,   setAiResult]   = useState("");
  const [aiLoading,  setAiLoading]  = useState(false);
  const [fontSize,   setFontSize]   = useState(15);
  const [fontFamily, setFontFamily] = useState(FONTS[0].value);
  const [showColorPicker,setShowColorPicker] = useState(null);
  const [showFontMenu,   setShowFontMenu]    = useState(false);
  const [showSizeMenu,   setShowSizeMenu]    = useState(false);
  const [isOnline,   setIsOnline]   = useState(navigator.onLine);

  const editorRef    = useRef(null);
  const saveTimer    = useRef(null);
  const docId        = useRef(initialDoc?.id || uid());
  const isNew        = useRef(!initialDoc?.id);
  const fileInputRef = useRef(null);

  useEffect(()=>{
    const on=()=>setIsOnline(true), off=()=>setIsOnline(false);
    window.addEventListener("online",on); window.addEventListener("offline",off);
    return ()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off)};
  },[]);

  useEffect(()=>{
    if(editorRef.current && initialDoc?.content) {
      editorRef.current.innerHTML = initialDoc.content;
      setWordCount(initialDoc.words || 0);
    }
  },[]);

  useEffect(()=>{
    const h=e=>{ if(!e.target.closest(".ae-popup")&&!e.target.closest(".ae-popup-trigger")){setShowColorPicker(null);setShowFontMenu(false);setShowSizeMenu(false);} };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  // ── Supabase save ────────────────────────────────────────────
  const saveToSupabase = useCallback(async (html, titleVal) => {
    if (!isOnline) return;
    setSaveStatus("saving");
    try {
      const client = await sb();
      const text   = html.replace(/<[^>]+>/g, "");
      const words  = text.trim().split(/\s+/).filter(Boolean).length;
      const payload = {
        id:         docId.current,
        user_id:    user.id,
        title:      titleVal || "Untitled",
        content:    html,
        preview:    text.slice(0, 140),
        words,
        updated_at: new Date().toISOString(),
      };
      if (isNew.current) {
        payload.created_at = new Date().toISOString();
        const { error } = await client.from("documents").insert(payload);
        if (!error) isNew.current = false;
        if (error) throw error;
      } else {
        const { error } = await client.from("documents").update(payload).eq("id", docId.current);
        if (error) throw error;
      }
      setSaveStatus("saved");
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("error");
    }
  }, [user.id, isOnline]);

  const handleInput = () => {
    setSaveStatus("unsaved");
    clearTimeout(saveTimer.current);
    const t = editorRef.current?.innerText || "";
    setWordCount(t.trim() ? t.trim().split(/\s+/).length : 0);
    saveTimer.current = setTimeout(() => saveToSupabase(editorRef.current?.innerHTML || "", title), 1200);
  };

  useEffect(() => {
    if (title !== (initialDoc?.title || "")) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveToSupabase(editorRef.current?.innerHTML || "", title), 800);
    }
  }, [title]);

  const fmt=(cmd,val)=>{editorRef.current?.focus();document.execCommand(cmd,false,val||null);};
  const applyFont=(val)=>{setFontFamily(val);setShowFontMenu(false);editorRef.current?.focus();document.execCommand("fontName",false,val);};
  const applySize=(sz)=>{setFontSize(sz);setShowSizeMenu(false);editorRef.current?.focus();const sel=window.getSelection();if(sel&&sel.rangeCount&&!sel.isCollapsed){const r=sel.getRangeAt(0);const span=document.createElement("span");span.style.fontSize=sz+"px";try{r.surroundContents(span);}catch{}}};
  const applyColor=(color,type)=>{editorRef.current?.focus();if(type==="text")document.execCommand("foreColor",false,color);else document.execCommand("hiliteColor",false,color);setShowColorPicker(null);};
  const insertImage=(e)=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{editorRef.current?.focus();const img=document.createElement("img");img.src=ev.target.result;img.style.cssText="max-width:100%;width:360px;display:block;margin:12px 0;border-radius:6px;";const sel=window.getSelection();if(sel&&sel.rangeCount){const r=sel.getRangeAt(0);r.collapse(false);r.insertNode(img);r.setStartAfter(img);sel.removeAllRanges();sel.addRange(r);}else editorRef.current.appendChild(img);handleInput();};reader.readAsDataURL(file);e.target.value="";};

  const runAI=async(mode)=>{
    const text=editorRef.current?.innerText?.trim()||"";
    setAiMode(mode);setAiResult("");setAiLoading(true);
    if(!text){setAiLoading(false);setAiResult("Write something first.");return;}
    if(!isOnline){setAiLoading(false);setAiResult("AI requires internet.");return;}
    const prompts={
      summary:`Summarize into 5-7 crisp bullet points. Be specific:\n\n${text}`,
      suggest:`Direct writing coach — 3-5 blunt suggestions to strengthen this:\n\n${text}`,
      structure:`Reorganize into a clean document. ONLY output: # H1, ## H2, - bullets. No commentary:\n\n${text}`,
    };
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompts[mode]}]})});
      const d=await res.json();
      setAiResult((d.content||[]).filter(c=>c.type==="text").map(c=>c.text).join("")||"No response.");
    }catch{setAiResult("Connection error.");}
    setAiLoading(false);
  };

  const applyStructure=()=>{if(!editorRef.current||!aiResult)return;const lines=aiResult.split("\n");let html="";let inList=false;for(const line of lines){if(/^[-*] /.test(line)){if(!inList){html+="<ul>";inList=true;}html+=`<li>${line.slice(2)}</li>`;}else{if(inList){html+="</ul>";inList=false;}if(line.startsWith("# "))html+=`<h1>${line.slice(2)}</h1>`;else if(line.startsWith("## "))html+=`<h2>${line.slice(3)}</h2>`;else if(line.trim())html+=`<p>${line}</p>`;}}if(inList)html+="</ul>";editorRef.current.innerHTML=html;handleInput();setAiMode(null);setAiResult("");};
  const exportPDF=()=>{if(!window.html2pdf){alert("Loading…");return;}window.html2pdf().set({margin:14,filename:`${title||"document"}.pdf`,html2canvas:{scale:2},jsPDF:{unit:"mm",format:"a4"}}).from(document.getElementById("doc-canvas")).save();};

  const statusColor=saveStatus==="saved"?C.saved:saveStatus==="saving"?C.amber:saveStatus==="error"?C.red:C.muted;
  const statusText=!isOnline?"Offline":saveStatus==="saved"?"Saved ☁":saveStatus==="saving"?"Saving…":saveStatus==="error"?"Error — retrying":"Unsaved";

  const IconBtn=({tip,onMouseDown,onClick,children,active})=>(
    <button title={tip} onMouseDown={onMouseDown} onClick={onClick}
      style={{background:active?C.accentLight:"transparent",border:`1px solid ${active?C.accent:C.border}`,color:active?C.accentDark:C.uiText,borderRadius:5,padding:"3px 8px",fontSize:13,fontWeight:500,cursor:"pointer",transition:"all 0.12s",lineHeight:1.5,display:"flex",alignItems:"center",gap:3,flexShrink:0}}
      onMouseEnter={e=>{if(!active)e.currentTarget.style.background="#F0EDE8"}}
      onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent"}}
    >{children}</button>
  );

  const ColorGrid=({type})=>(
    <div className="ae-popup" style={{position:"absolute",top:"100%",left:0,zIndex:100,marginTop:4,background:C.chrome,border:`1px solid ${C.border}`,borderRadius:8,padding:10,boxShadow:"0 4px 20px rgba(0,0,0,0.12)",display:"grid",gridTemplateColumns:"repeat(7,24px)",gap:4,width:210}}>
      <div style={{gridColumn:"1/-1",fontSize:10,color:C.muted,marginBottom:4,fontWeight:500,letterSpacing:"0.06em"}}>{type==="text"?"TEXT COLOR":"HIGHLIGHT"}</div>
      {PALETTE.map(col=>(
        <div key={col} onMouseDown={e=>{e.preventDefault();applyColor(col,type);}}
          style={{width:24,height:24,borderRadius:5,background:col,cursor:"pointer",border:col==="#FFF"?`1px solid ${C.border}`:"none",transition:"transform 0.1s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.2)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
      ))}
      <div style={{gridColumn:"1/-1",marginTop:6,display:"flex",gap:6,alignItems:"center"}}>
        <span style={{fontSize:10,color:C.muted,fontWeight:500}}>CUSTOM</span>
        <input type="color" defaultValue="#000000" style={{width:28,height:22,border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer",padding:1}} onMouseDown={e=>e.stopPropagation()} onChange={e=>applyColor(e.target.value,type)}/>
      </div>
    </div>
  );

  const aiModes=[
    {mode:"summary",  label:"Summarise", color:C.accent, lightColor:C.accentLight},
    {mode:"suggest",  label:"Suggest",   color:C.rose,   lightColor:C.roseLight},
    {mode:"structure",label:"Structure", color:C.sky,    lightColor:C.skyLight},
  ];

  return (
    <div style={{background:C.bg,height:"100vh",display:"flex",flexDirection:"column",fontFamily:"'DM Sans',system-ui,sans-serif",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Serif+Display:ital@0;1&display=swap');
        *{box-sizing:border-box}
        #ae-editor{outline:none;font-size:${fontSize}px;font-family:${fontFamily}}
        #ae-editor:empty:before{content:'Begin writing...';color:#C4BFB9;font-style:italic;font-size:15px}
        #ae-editor h1{font-size:2em;font-weight:400;line-height:1.25;margin:1.4rem 0 0.5rem;letter-spacing:-0.01em;color:#1E1C19}
        #ae-editor h2{font-size:1.45em;font-weight:400;margin:1.1rem 0 0.4rem;color:#2C2825}
        #ae-editor h3{font-size:1.15em;font-weight:500;margin:0.9rem 0 0.3rem;color:#2C2825}
        #ae-editor p,#ae-editor div{margin:0 0 0.7rem;line-height:1.85;color:#3D3A36}
        #ae-editor ul,#ae-editor ol{padding-left:1.5rem;margin:0 0 0.7rem}
        #ae-editor li{margin-bottom:0.25rem;line-height:1.75;color:#3D3A36}
        #ae-editor b,#ae-editor strong{color:#1E1C19}
        #ae-editor img{max-width:100%;border-radius:6px;display:block;margin:10px 0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeSlide{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{from{opacity:0;transform:scale(0.96) translateY(-4px)}to{opacity:1;transform:scale(1) translateY(0)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:10px}
        ::selection{background:rgba(107,143,113,0.18)}
        input::placeholder{color:#C4BFB9}
      `}</style>

      {/* Top bar */}
      <div style={{background:C.chrome,borderBottom:`1px solid ${C.border}`,padding:"10px 20px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <button onClick={onBack}
          style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,flexShrink:0,fontFamily:"inherit",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accentDark}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted}}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          My Docs
        </button>
        <div style={{width:1,height:18,background:C.border}}/>
        <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect width="18" height="18" rx="4" fill={C.accent} opacity="0.9"/><path d="M4 6h10M4 9h7M4 12h8" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <span style={{color:C.accentDark,fontWeight:500,fontSize:12}}>Aeondoc</span>
        </div>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Untitled document"
          style={{background:"transparent",border:"none",outline:"none",color:C.uiText,fontSize:13.5,fontWeight:500,flex:1,minWidth:0,maxWidth:340}}/>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            {saveStatus==="saving"&&<div style={{width:12,height:12,border:`2px solid ${C.border}`,borderTopColor:C.amber,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>}
            {saveStatus!=="saving"&&<div style={{width:6,height:6,borderRadius:"50%",background:statusColor,transition:"background 0.4s"}}/>}
            <span style={{fontSize:12,color:statusColor,fontWeight:500}}>{statusText}</span>
          </div>
          <span style={{fontSize:12,color:C.muted}}>{wordCount}w</span>
          <button onClick={exportPDF}
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.uiText,borderRadius:6,padding:"5px 14px",fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all 0.15s",fontFamily:"inherit"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accentDark}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.uiText}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 6l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Offline banner */}
      {!isOnline&&(
        <div style={{background:"rgba(224,123,57,0.1)",borderBottom:`1px solid ${C.offline}44`,padding:"8px 20px",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:C.offline,flexShrink:0}}/>
          <span style={{fontSize:12,color:C.offline,fontWeight:500}}>You're offline — changes will sync when connection returns</span>
        </div>
      )}

      {/* Toolbar */}
      <div style={{background:C.chrome,borderBottom:`1px solid ${C.borderLight}`,padding:"6px 20px",display:"flex",alignItems:"center",gap:4,flexShrink:0,flexWrap:"wrap",rowGap:6}}>
        <IconBtn tip="H1" onMouseDown={e=>{e.preventDefault();fmt("formatBlock","h1")}}>H1</IconBtn>
        <IconBtn tip="H2" onMouseDown={e=>{e.preventDefault();fmt("formatBlock","h2")}}>H2</IconBtn>
        <IconBtn tip="H3" onMouseDown={e=>{e.preventDefault();fmt("formatBlock","h3")}}>H3</IconBtn>
        <SEP/>
        <IconBtn tip="Bold"      onMouseDown={e=>{e.preventDefault();fmt("bold")}}><b>B</b></IconBtn>
        <IconBtn tip="Italic"    onMouseDown={e=>{e.preventDefault();fmt("italic")}}><i>I</i></IconBtn>
        <IconBtn tip="Underline" onMouseDown={e=>{e.preventDefault();fmt("underline")}}><u>U</u></IconBtn>
        <IconBtn tip="Strike"    onMouseDown={e=>{e.preventDefault();fmt("strikeThrough")}}><s>S</s></IconBtn>
        <SEP/>
        <IconBtn tip="Bullets"  onMouseDown={e=>{e.preventDefault();fmt("insertUnorderedList")}}>• List</IconBtn>
        <IconBtn tip="Numbers"  onMouseDown={e=>{e.preventDefault();fmt("insertOrderedList")}}>1. List</IconBtn>
        <IconBtn tip="Left"     onMouseDown={e=>{e.preventDefault();fmt("justifyLeft")}}>≡L</IconBtn>
        <IconBtn tip="Center"   onMouseDown={e=>{e.preventDefault();fmt("justifyCenter")}}>≡C</IconBtn>
        <IconBtn tip="Right"    onMouseDown={e=>{e.preventDefault();fmt("justifyRight")}}>≡R</IconBtn>
        <SEP/>
        {/* Font family */}
        <div style={{position:"relative"}}>
          <button className="ae-popup-trigger" onClick={()=>{setShowFontMenu(v=>!v);setShowSizeMenu(false);setShowColorPicker(null);}}
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.uiText,borderRadius:5,padding:"3px 10px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:fontFamily,minWidth:90}}>
            <span style={{flex:1,overflow:"hidden",whiteSpace:"nowrap",maxWidth:76}}>{FONTS.find(f=>f.value===fontFamily)?.label||"Font"}</span>
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1l3 3 3-3" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
          {showFontMenu&&(
            <div className="ae-popup" style={{position:"absolute",top:"100%",left:0,zIndex:100,marginTop:4,background:C.chrome,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.12)",minWidth:140,animation:"popIn 0.15s ease"}}>
              {FONTS.map(f=>(<div key={f.value} onMouseDown={()=>applyFont(f.value)} style={{padding:"8px 14px",fontSize:13,fontFamily:f.value,cursor:"pointer",background:fontFamily===f.value?C.accentLight:"transparent",color:fontFamily===f.value?C.accentDark:C.uiText}} onMouseEnter={e=>{if(fontFamily!==f.value)e.currentTarget.style.background="#F0EDE8"}} onMouseLeave={e=>{if(fontFamily!==f.value)e.currentTarget.style.background="transparent"}}>{f.label}</div>))}
            </div>
          )}
        </div>
        {/* Font size */}
        <div style={{position:"relative"}}>
          <button className="ae-popup-trigger" onClick={()=>{setShowSizeMenu(v=>!v);setShowFontMenu(false);setShowColorPicker(null);}}
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.uiText,borderRadius:5,padding:"3px 8px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4,minWidth:50}}>
            <span>{fontSize}</span>
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1l3 3 3-3" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
          {showSizeMenu&&(
            <div className="ae-popup" style={{position:"absolute",top:"100%",left:0,zIndex:100,marginTop:4,background:C.chrome,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.12)",maxHeight:180,overflowY:"auto",animation:"popIn 0.15s ease"}}>
              {SIZES.map(sz=>(<div key={sz} onMouseDown={()=>applySize(sz)} style={{padding:"6px 16px",fontSize:13,cursor:"pointer",background:fontSize===sz?C.accentLight:"transparent",color:fontSize===sz?C.accentDark:C.uiText,whiteSpace:"nowrap"}} onMouseEnter={e=>{if(fontSize!==sz)e.currentTarget.style.background="#F0EDE8"}} onMouseLeave={e=>{if(fontSize!==sz)e.currentTarget.style.background="transparent"}}>{sz}px</div>))}
            </div>
          )}
        </div>
        <SEP/>
        {/* Text colour */}
        <div style={{position:"relative"}}>
          <button className="ae-popup-trigger" title="Text colour" onClick={()=>{setShowColorPicker(v=>v==="text"?null:"text");setShowFontMenu(false);setShowSizeMenu(false);}}
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.uiText,borderRadius:5,padding:"3px 8px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontWeight:700,borderBottom:"2.5px solid #C0392B",lineHeight:1.3}}>A</span>
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1l3 3 3-3" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
          {showColorPicker==="text"&&<ColorGrid type="text"/>}
        </div>
        {/* Highlight */}
        <div style={{position:"relative"}}>
          <button className="ae-popup-trigger" title="Highlight" onClick={()=>{setShowColorPicker(v=>v==="bg"?null:"bg");setShowFontMenu(false);setShowSizeMenu(false);}}
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.uiText,borderRadius:5,padding:"3px 8px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontWeight:600,background:"#F1C40F",padding:"0 3px",borderRadius:2}}>H</span>
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1l3 3 3-3" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
          {showColorPicker==="bg"&&<ColorGrid type="bg"/>}
        </div>
        <SEP/>
        <IconBtn tip="Insert image" onClick={()=>fileInputRef.current?.click()}>
          <svg width="13" height="11" viewBox="0 0 13 11" fill="none"><rect x="0.5" y="0.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/><circle cx="3.5" cy="3.5" r="1.2" fill="currentColor"/><path d="M0.5 7l3-2.5 2.5 2.5 2-1.5 4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{fontSize:11}}>Image</span>
        </IconBtn>
        <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={insertImage}/>
        <SEP/>
        <span style={{color:C.muted,fontSize:10,fontWeight:600,letterSpacing:"0.1em",marginRight:4}}>AI</span>
        {aiModes.map(({mode,label,color,lightColor})=>(
          <button key={mode} onClick={()=>runAI(mode)}
            style={{background:aiMode===mode?lightColor:"transparent",border:`1px solid ${aiMode===mode?color:C.border}`,color:aiMode===mode?color:C.muted,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.15s"}}
            onMouseEnter={e=>{if(aiMode!==mode){e.currentTarget.style.borderColor=color;e.currentTarget.style.color=color}}}
            onMouseLeave={e=>{if(aiMode!==mode){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted}}}
          >{label}</button>
        ))}
        {aiMode&&(<button onClick={()=>{setAiMode(null);setAiResult("");}} style={{marginLeft:"auto",background:"transparent",border:"none",color:C.muted,fontSize:12,cursor:"pointer",padding:"3px 8px"}} onMouseEnter={e=>e.currentTarget.style.color=C.uiText} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>✕ Close</button>)}
      </div>

      {/* Body */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:"36px 20px",background:C.bg}}>
          <div id="doc-canvas" style={{maxWidth:680,margin:"0 auto",background:C.canvas,border:`1px solid ${C.border}`,borderRadius:10,padding:"52px 60px",minHeight:560,boxShadow:"0 2px 24px rgba(100,90,80,0.07)"}}>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Document title"
              style={{display:"block",width:"100%",border:"none",outline:"none",background:"transparent",fontSize:28,fontWeight:400,color:"#1E1C19",fontFamily:"'DM Serif Display',Georgia,serif",lineHeight:1.25,marginBottom:title?8:28,letterSpacing:"-0.01em"}}/>
            {title&&<div style={{width:36,height:2,background:C.accent,borderRadius:2,marginBottom:28,opacity:0.7}}/>}
            <div id="ae-editor" ref={editorRef} contentEditable suppressContentEditableWarning onInput={handleInput} style={{minHeight:340,outline:"none"}}/>
          </div>
        </div>
        {/* AI Panel */}
        {aiMode&&(
          <div style={{width:296,background:C.chrome,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",animation:"fadeSlide 0.2s ease",flexShrink:0}}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.borderLight}`,display:"flex",alignItems:"center",gap:8}}>
              {(()=>{const m=aiModes.find(x=>x.mode===aiMode);return(<><div style={{width:7,height:7,borderRadius:"50%",background:m?.color}}/><span style={{color:C.uiText,fontSize:13,fontWeight:500}}>{m?.label}</span></>);})()}
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
              {aiLoading?(
                <div style={{display:"flex",flexDirection:"column",gap:16,alignItems:"center",paddingTop:24}}>
                  <div style={{width:18,height:18,border:`2px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                  <p style={{color:C.muted,fontSize:13,margin:0,textAlign:"center",lineHeight:1.6}}>Reading your document…</p>
                </div>
              ):(
                <p style={{color:C.sub,fontSize:13.5,lineHeight:1.8,whiteSpace:"pre-wrap",margin:0,animation:"fadeIn 0.3s ease"}}>{aiResult}</p>
              )}
            </div>
            {aiMode==="structure"&&aiResult&&!aiLoading&&(
              <div style={{padding:"12px 18px",borderTop:`1px solid ${C.borderLight}`}}>
                <button onClick={applyStructure} style={{width:"100%",background:C.sky,border:"none",color:"#1A2D38",borderRadius:7,padding:"9px",fontSize:13,fontWeight:500,cursor:"pointer"}}>Apply to document</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────
export default function App() {
  const [user,       setUser]       = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [screen,     setScreen]     = useState("list");
  const [activeDoc,  setActiveDoc]  = useState(null);

  useEffect(()=>{
    sb().then(client=>{
      // check existing session
      client.auth.getSession().then(({data:{session}})=>{
        setUser(session?.user || null);
        setAuthLoaded(true);
      });
      // listen for auth changes
      client.auth.onAuthStateChange((_event, session)=>{
        setUser(session?.user || null);
      });
    });
  },[]);

  const handleSignOut = async () => {
    const client = await sb();
    await client.auth.signOut();
    setUser(null); setScreen("list"); setActiveDoc(null);
  };

  if (!authLoaded) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
        <div style={{width:36,height:36,borderRadius:9,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M3 9h9M3 13h11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </div>
        <div style={{width:18,height:18,border:`2px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!user) return <AuthScreen onAuth={setUser}/>;

  if (screen==="editor") return (
    <Editor user={user} doc={activeDoc} onBack={()=>{setActiveDoc(null);setScreen("list");}}/>
  );

  return (
    <DocList
      user={user}
      onOpen={doc=>{setActiveDoc(doc);setScreen("editor");}}
      onNew={()=>{setActiveDoc(null);setScreen("editor");}}
      onSignOut={handleSignOut}
    />
  );
}
