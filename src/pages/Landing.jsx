export default function Landing({ onGetStarted }) {
  return (
    <div style={{ background:"#07091A", minHeight:"100vh", fontFamily:"'Syne',system-ui,sans-serif", overflowX:"hidden", color:"#F8F5EF" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .btn-primary:hover{transform:translateY(-2px)!important;box-shadow:0 8px 32px rgba(107,143,113,0.4)!important}
        .btn-secondary:hover{border-color:rgba(255,255,255,0.4)!important;background:rgba(255,255,255,0.05)!important;transform:translateY(-2px)!important}
        .feat-card:hover{background:rgba(248,245,239,0.06)!important;transform:translateY(-4px)!important}
        .price-card:hover{transform:translateY(-6px)!important;border-color:rgba(107,143,113,0.35)!important}
      `}</style>

      {/* NAV */}
      <nav style={{ padding:"22px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, background:"#6B8F71", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontWeight:800, fontSize:15, color:"#F8F5EF", letterSpacing:"0.04em" }}>AEONDOC</span>
        </div>
        <div style={{ display:"flex", gap:32, alignItems:"center" }}>
          <a href="#features" style={{ color:"rgba(248,245,239,0.5)", fontSize:13, textDecoration:"none", letterSpacing:"0.06em" }}>Features</a>
          <a href="#pricing"  style={{ color:"rgba(248,245,239,0.5)", fontSize:13, textDecoration:"none", letterSpacing:"0.06em" }}>Pricing</a>
          <button onClick={onGetStarted}
            style={{ background:"#6B8F71", color:"#0A0C14", border:"none", borderRadius:8, padding:"10px 22px", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.2s" }}>
            Start Free →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:"90vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"80px 24px 120px", position:"relative" }}>
        {/* Glow */}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:300, background:"radial-gradient(ellipse,rgba(107,143,113,0.15) 0%,transparent 70%)", pointerEvents:"none" }}/>

        <div style={{ fontSize:11, letterSpacing:"0.25em", color:"#6B8F71", fontWeight:600, marginBottom:28, opacity:0, animation:"fadeUp 0.8s 0.3s forwards" }}>THE DOCUMENT THAT THINKS</div>

        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(56px,8vw,108px)", fontWeight:300, lineHeight:0.95, letterSpacing:"-0.02em", marginBottom:36, opacity:0, animation:"fadeUp 0.9s 0.5s forwards" }}>
          Write without<br/><em style={{ fontStyle:"italic", color:"#6B8F71" }}>limits.</em>
          <span style={{ display:"block", fontSize:"clamp(44px,6vw,88px)", color:"#EDE9E0", marginTop:8 }}>Think out loud.</span>
        </h1>

        <p style={{ fontSize:16, color:"rgba(248,245,239,0.55)", maxWidth:480, lineHeight:1.75, marginBottom:48, opacity:0, animation:"fadeUp 0.8s 0.7s forwards" }}>
          An AI-native document editor that structures your ideas, speaks your language, and exports beautifully. Built for the way minds actually work.
        </p>

        <div style={{ display:"flex", gap:16, justifyContent:"center", opacity:0, animation:"fadeUp 0.8s 0.9s forwards" }}>
          <button className="btn-primary" onClick={onGetStarted}
            style={{ background:"#6B8F71", color:"#0A0C14", border:"none", borderRadius:10, padding:"15px 32px", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer", transition:"all 0.25s" }}>
            Start Writing Free →
          </button>
          <button className="btn-secondary"
            style={{ background:"transparent", color:"#F8F5EF", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"15px 32px", fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:14, cursor:"pointer", transition:"all 0.25s" }}>
            See how it works
          </button>
        </div>

        {/* Floating doc preview */}
        <div style={{ marginTop:80, width:"min(680px,90vw)", animation:"float 4s ease-in-out infinite", opacity:0, animationDelay:"1.2s", animationFillMode:"forwards" }}>
          <div style={{ background:"rgba(248,245,239,0.05)", border:"1px solid rgba(248,245,239,0.1)", borderRadius:12, padding:"28px 36px", backdropFilter:"blur(20px)", position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(107,143,113,0.6),transparent)" }}/>
            <div style={{ display:"flex", gap:8, marginBottom:18, paddingBottom:14, borderBottom:"1px solid rgba(248,245,239,0.08)" }}>
              {[true,true,false,false,false,true].map((a,i)=><div key={i} style={{ width:28, height:20, borderRadius:4, background:a?"rgba(107,143,113,0.4)":"rgba(248,245,239,0.1)" }}/>)}
            </div>
            <div style={{ height:16, width:"55%", borderRadius:4, background:"rgba(248,245,239,0.2)", marginBottom:14 }}/>
            {["100%","80%","95%","65%","88%"].map((w,i)=>(
              <div key={i} style={{ height:8, width:w, borderRadius:3, background:i===3?"rgba(107,143,113,0.35)":"rgba(248,245,239,0.1)", marginBottom:8 }}/>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ padding:"48px 0", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", overflow:"hidden" }}>
        <div style={{ display:"flex", gap:48, animation:"marquee 20s linear infinite", width:"max-content" }}>
          {[0,1].map(n=>(
            <div key={n} style={{ display:"flex", gap:48, alignItems:"center", whiteSpace:"nowrap" }}>
              {["Write Freely","Think Clearly","Export Beautifully","AI Built In","Any Language","Documents that Think"].map(t=>(
                <span key={t} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, fontStyle:"italic", color:"rgba(248,245,239,0.2)" }}>
                  {t} <span style={{ fontSize:12, color:"#6B8F71", fontStyle:"normal", fontFamily:"'Syne',sans-serif", fontWeight:600 }}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding:"120px 48px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ fontSize:11, letterSpacing:"0.25em", color:"#6B8F71", fontWeight:600, marginBottom:20 }}>WHAT MAKES IT DIFFERENT</div>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(36px,5vw,68px)", fontWeight:300, lineHeight:1.05, letterSpacing:"-0.02em", marginBottom:64 }}>
          Every word has <em style={{ fontStyle:"italic", color:"#6B8F71" }}>purpose.</em>
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:2 }}>
          {[
            { n:"01", title:"AI Built In,\nNot Bolted On",     desc:"Three intelligent modes — Summarise, Suggest, Structure — that understand your full document and work with you." },
            { n:"02", title:"Rich Editing,\nZero Friction",    desc:"Full typography control — fonts, sizes, colours, highlights, images with live resize. A full creative studio." },
            { n:"03", title:"Export Without\nCompromise",      desc:"One click to a perfect A4 PDF with your images, fonts, and formatting preserved exactly as you wrote it." },
            { n:"04", title:"Structure Mode\nfor Raw Ideas",   desc:"Dump 20 rough bullet points. Structure Mode reorganises them into a clean document in seconds." },
            { n:"05", title:"Cloud Sync\nEverywhere",          desc:"Powered by Supabase. Your documents save in real time and sync across every device instantly." },
            { n:"06", title:"Works\nOffline",                  desc:"Keep writing even without internet. Changes queue up and sync automatically when you're back online." },
          ].map(f=>(
            <div key={f.n} className="feat-card"
              style={{ background:"rgba(248,245,239,0.03)", border:"1px solid rgba(255,255,255,0.06)", padding:"36px 32px", transition:"all 0.3s", cursor:"default" }}>
              <div style={{ fontSize:11, color:"#6B8F71", fontWeight:600, letterSpacing:"0.2em", marginBottom:20 }}>{f.n}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:400, lineHeight:1.2, marginBottom:12, whiteSpace:"pre-line" }}>{f.title}</div>
              <div style={{ fontSize:13, color:"rgba(248,245,239,0.45)", lineHeight:1.75 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding:"120px 48px", maxWidth:960, margin:"0 auto", textAlign:"center" }}>
        <div style={{ fontSize:11, letterSpacing:"0.25em", color:"#6B8F71", fontWeight:600, marginBottom:20 }}>SIMPLE PRICING</div>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(36px,5vw,64px)", fontWeight:300, lineHeight:1.05, letterSpacing:"-0.02em", marginBottom:64 }}>
          Start free. Grow <em style={{ fontStyle:"italic", color:"#6B8F71" }}>without limits.</em>
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:20, textAlign:"left" }}>
          {[
            { tier:"FREE",  price:"₹0",   period:"forever",            features:["5 documents","Full rich editor","PDF export"], dim:["AI modes","Cloud sync","Share links"] },
            { tier:"PRO",   price:"₹99",  period:"per month",           features:["Unlimited documents","All 3 AI modes","PDF + DOCX export","Image upload","Share links","10 GB storage"], dim:[], featured:true },
            { tier:"TEAM",  price:"₹499", period:"per month · 10 users",features:["Everything in Pro","Shared workspace","Admin controls","Indian data residency","Priority support"], dim:[] },
          ].map(p=>(
            <div key={p.tier} className="price-card"
              style={{ background:p.featured?"rgba(107,143,113,0.08)":"rgba(248,245,239,0.03)", border:`1px solid ${p.featured?"rgba(107,143,113,0.35)":"rgba(255,255,255,0.07)"}`, borderRadius:16, padding:"36px 28px", transition:"all 0.3s", position:"relative" }}>
              {p.featured&&<div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#6B8F71", color:"#0A0C14", fontSize:10, fontWeight:700, padding:"4px 14px", borderRadius:20, letterSpacing:"0.1em" }}>MOST POPULAR</div>}
              <div style={{ fontSize:11, letterSpacing:"0.18em", color:"rgba(248,245,239,0.4)", fontWeight:600, marginBottom:14 }}>{p.tier}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:52, fontWeight:300, lineHeight:1, marginBottom:6 }}>{p.price}</div>
              <div style={{ fontSize:12, color:"rgba(248,245,239,0.35)", marginBottom:24 }}>{p.period}</div>
              <div style={{ height:1, background:"rgba(255,255,255,0.07)", marginBottom:20 }}/>
              <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
                {p.features.map(f=><li key={f} style={{ fontSize:13, color:"rgba(248,245,239,0.6)", display:"flex", alignItems:"center", gap:8 }}><span style={{ width:6, height:6, borderRadius:"50%", background:"#6B8F71", flexShrink:0 }}/>{f}</li>)}
                {p.dim.map(f=><li key={f} style={{ fontSize:13, color:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", gap:8 }}><span style={{ width:6, height:6, borderRadius:"50%", background:"rgba(255,255,255,0.15)", flexShrink:0 }}/>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding:"140px 48px", textAlign:"center", position:"relative" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:500, height:250, background:"radial-gradient(ellipse,rgba(107,143,113,0.12) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(44px,7vw,92px)", fontWeight:300, lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:32 }}>
          Your next great<br/>document starts <em style={{ fontStyle:"italic", color:"#6B8F71" }}>now.</em>
        </h2>
        <p style={{ fontSize:16, color:"rgba(248,245,239,0.45)", marginBottom:44 }}>No credit card. No setup. Just open it and write.</p>
        <button className="btn-primary" onClick={onGetStarted}
          style={{ background:"#6B8F71", color:"#0A0C14", border:"none", borderRadius:10, padding:"18px 44px", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, cursor:"pointer", transition:"all 0.25s" }}>
          Start Writing Free →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:"36px 48px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontWeight:700, fontSize:14, color:"rgba(248,245,239,0.3)" }}>Æ Aeondoc</span>
        <span style={{ fontSize:12, color:"rgba(255,255,255,0.15)" }}>© 2025 Aeondoc. All rights reserved.</span>
        <div style={{ display:"flex", gap:20 }}>
          {["Privacy","Terms","Contact"].map(l=><a key={l} href="#" style={{ fontSize:12, color:"rgba(255,255,255,0.2)", textDecoration:"none" }}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
}
