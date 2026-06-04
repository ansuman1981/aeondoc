import { useState, useEffect, useCallback } from "react";
import { sb } from "../App";

const C = { bg:"#F5F2ED",chrome:"#FDFCFA",border:"#E2DDD7",borderLight:"#EDE9E3",canvas:"#FFFFFF",uiText:"#3D3A36",sub:"#6B6560",muted:"#A09C97",accent:"#6B8F71",accentLight:"rgba(107,143,113,0.12)",accentDark:"#4A6B4F",rose:"#C0826A",roseLight:"rgba(192,130,106,0.12)",amber:"#C9924A",sky:"#7B9BAD" };
const ago = d => { if(!d)return""; const s=Math.floor((Date.now()-new Date(d).getTime())/1000); if(s<60)return"just now";if(s<3600)return`${Math.floor(s/60)}m ago`;if(s<86400)return`${Math.floor(s/3600)}h ago`;return`${Math.floor(s/86400)}d ago`; };

export default function Dashboard({ user, onOpen, onNew, onSignOut }) {
  const [docs,    setDocs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [deleting,setDeleting]= useState(null);

  const fetchDocs = useCallback(async () => {
    const client = await sb();
    const { data } = await client.from("documents").select("id,title,preview,words,starred,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false });
    setDocs(data || []);
    setLoading(false);
  }, [user.id]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  useEffect(() => {
    let channel;
    sb().then(client => {
      channel = client.channel("docs").on("postgres_changes", { event:"*", schema:"public", table:"documents", filter:`user_id=eq.${user.id}` }, () => fetchDocs()).subscribe();
    });
    return () => { sb().then(c => c.removeChannel(channel)); };
  }, [user.id, fetchDocs]);

  const deleteDoc = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this document?")) return;
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

  const filtered = docs.filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()));
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const avatar      = user.user_metadata?.avatar_url;
  const hour        = new Date().getHours();
  const greeting    = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        .doc-card:hover{border-color:${C.accent}66!important;box-shadow:0 4px 20px rgba(107,143,113,0.10)!important;transform:translateY(-2px)!important}
        .doc-card:hover .del-btn,.doc-card:hover .star-btn{opacity:1!important}
      `}</style>

      {/* Nav */}
      <div style={{ background:C.chrome, borderBottom:`1px solid ${C.border}`, padding:"12px 28px", display:"flex", alignItems:"center", gap:14, position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:C.accent, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M2 7h7M2 10h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize:14, fontWeight:600, color:C.accentDark }}>Aeondoc</span>
        </div>
        <div style={{ flex:1, maxWidth:380, position:"relative", marginLeft:16 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.muted, pointerEvents:"none" }}>
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents…"
            style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:9, padding:"8px 12px 8px 30px", fontSize:13, color:C.uiText, outline:"none", fontFamily:"inherit", transition:"border-color 0.15s" }}
            onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {avatar
              ? <img src={avatar} style={{ width:28, height:28, borderRadius:"50%", border:`1px solid ${C.border}` }}/>
              : <div style={{ width:28, height:28, borderRadius:"50%", background:C.accentLight, border:`1px solid ${C.accent}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:C.accentDark }}>{displayName[0].toUpperCase()}</div>
            }
            <span style={{ fontSize:13, color:C.sub, fontWeight:500, maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayName}</span>
          </div>
          <button onClick={onSignOut}
            style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.rose;e.currentTarget.style.color=C.rose}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted}}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"36px 28px 80px" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:400, color:C.uiText, fontFamily:"'DM Serif Display',Georgia,serif", marginBottom:4 }}>
              {greeting}, <em style={{ color:C.accentDark, fontStyle:"italic" }}>{displayName.split(" ")[0]}</em>
            </h1>
            <p style={{ fontSize:13, color:C.muted }}>{filtered.length} document{filtered.length!==1?"s":""} · synced to cloud ☁️</p>
          </div>
          <button onClick={onNew}
            style={{ background:C.accent, border:"none", color:"#fff", borderRadius:10, padding:"11px 22px", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"inherit", transition:"all 0.18s", boxShadow:`0 4px 14px ${C.accent}44`, flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.background=C.accentDark;e.currentTarget.style.transform="translateY(-1px)"}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.accent;e.currentTarget.style.transform="none"}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            New Document
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:32 }}>
          {[
            { label:"Total docs",  val:docs.length,                                                                                          color:C.accent },
            { label:"Starred",     val:docs.filter(d=>d.starred).length,                                                                     color:C.amber  },
            { label:"This week",   val:docs.filter(d=>Date.now()-new Date(d.updated_at).getTime()<7*24*3600*1000).length,                    color:C.sky    },
          ].map(s=>(
            <div key={s.label} style={{ background:C.chrome, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 20px" }}>
              <div style={{ fontSize:24, fontWeight:600, color:s.color, fontFamily:"'DM Serif Display',serif", marginBottom:2 }}>{s.val}</div>
              <div style={{ fontSize:12, color:C.muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Docs */}
        {loading ? (
          <div style={{ display:"flex", alignItems:"center", gap:12, color:C.muted, padding:"40px 0" }}>
            <div style={{ width:18, height:18, border:`2px solid ${C.border}`, borderTopColor:C.accent, borderRadius:"50%", animation:"spin 0.8s linear infinite", flexShrink:0 }}/>
            Loading your documents…
          </div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ fontSize:52, marginBottom:16 }}>📄</div>
            <div style={{ fontSize:18, color:C.sub, fontWeight:500, marginBottom:8 }}>{search?"No results":"No documents yet"}</div>
            <div style={{ fontSize:14, color:C.muted, marginBottom:24 }}>{search?`Nothing matched "${search}"`:"Create your first document"}</div>
            {!search&&<button onClick={onNew} style={{ background:C.accent, border:"none", color:"#fff", borderRadius:10, padding:"11px 24px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>+ New Document</button>}
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:14 }}>
            {filtered.map((doc,i)=>(
              <div key={doc.id} className="doc-card" onClick={()=>onOpen(doc)}
                style={{ background:C.chrome, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", cursor:"pointer", transition:"all 0.2s", animation:`fadeUp 0.4s ${i*0.04}s both`, position:"relative" }}>
                <div style={{ padding:"20px 18px 14px", background:C.bg, borderBottom:`1px solid ${C.borderLight}`, minHeight:90 }}>
                  <div style={{ height:12, width:"55%", borderRadius:4, background:"rgba(44,40,37,0.15)", marginBottom:8 }}/>
                  <div style={{ height:7, width:"88%", borderRadius:3, background:"rgba(44,40,37,0.07)", marginBottom:5 }}/>
                  <div style={{ height:7, width:"70%", borderRadius:3, background:"rgba(44,40,37,0.07)", marginBottom:5 }}/>
                  <div style={{ height:7, width:"82%", borderRadius:3, background:"rgba(44,40,37,0.07)" }}/>
                </div>
                <div style={{ padding:"12px 16px" }}>
                  <div style={{ fontSize:14, fontWeight:600, color:C.uiText, marginBottom:5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{doc.title||"Untitled"}</div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:11, color:C.muted }}>{ago(doc.updated_at)}</span>
                    <span style={{ fontSize:11, color:C.muted }}>{doc.words||0} words</span>
                  </div>
                </div>
                <button className="star-btn" onClick={e=>toggleStar(doc,e)}
                  style={{ position:"absolute", top:8, left:8, width:26, height:26, borderRadius:7, background:doc.starred?"rgba(201,146,74,0.15)":C.chrome, border:`1px solid ${doc.starred?C.amber:C.border}`, color:doc.starred?C.amber:C.muted, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:doc.starred?1:0, transition:"all 0.15s", fontSize:13 }}>
                  {doc.starred?"★":"☆"}
                </button>
                <button className="del-btn" onClick={e=>deleteDoc(doc.id,e)} disabled={deleting===doc.id}
                  style={{ position:"absolute", top:8, right:8, width:26, height:26, borderRadius:7, background:C.chrome, border:`1px solid ${C.border}`, color:C.muted, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"all 0.15s", fontSize:12 }}
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
