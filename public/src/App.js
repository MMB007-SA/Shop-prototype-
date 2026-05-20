import React, { useState, useEffect, useRef } from "react";

/* ─── DATA ─────────────────────────────────────────────── */
const products = [
  { id:1, name:"Adriatic",  sub:"One-Piece",    price:295, tag:"SIGNATURE",   emoji:"🩱", color:"#0ea5e9", glow:"rgba(14,165,233,0.5)"  },
  { id:2, name:"Santorini", sub:"Bikini Set",   price:345, tag:"BESTSELLER",  emoji:"👙", color:"#f59e0b", glow:"rgba(245,158,11,0.5)"  },
  { id:3, name:"Bosphorus", sub:"High-Cut",     price:275, tag:"NEW ARRIVAL", emoji:"🌿", color:"#10b981", glow:"rgba(16,185,129,0.5)"  },
  { id:4, name:"Capri",     sub:"Triangle Set", price:320, tag:"LIMITED",     emoji:"🪸", color:"#f43f5e", glow:"rgba(244,63,94,0.5)"   },
  { id:5, name:"Amalfi",    sub:"Bandeau",      price:260, tag:"CLASSIC",     emoji:"🌊", color:"#6366f1", glow:"rgba(99,102,241,0.5)"  },
  { id:6, name:"Mykonos",   sub:"Cover-Up",     price:480, tag:"COUTURE",     emoji:"☀️", color:"#e879f9", glow:"rgba(232,121,249,0.5)" },
];

/* ─── FLOATING PARTICLE ────────────────────────────────── */
function Particle({ x, size, duration, delay, type }) {
  const style = {
    position:"absolute", left:`${x}%`, bottom:"-10%",
    width:size, height:size,
    animation:`floatUp ${duration}s ease-in ${delay}s infinite`,
    pointerEvents:"none",
  };
  if (type === "bubble") return (
    <div style={{
      ...style,
      borderRadius:"50%",
      background:"radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), rgba(255,255,255,0.05))",
      border:"1px solid rgba(255,255,255,0.25)",
      backdropFilter:"blur(2px)",
    }}/>
  );
  if (type === "star") return (
    <div style={{ ...style, fontSize:size*0.8, opacity:0.6, bottom:`${10+Math.random()*60}%` }}>✦</div>
  );
  return (
    <div style={{
      ...style,
      borderRadius:"50%",
      background:`radial-gradient(circle, rgba(56,189,248,0.4), transparent)`,
      filter:"blur(4px)",
    }}/>
  );
}

/* ─── WAVE SVG ─────────────────────────────────────────── */
function Waves({ opacity=0.07 }) {
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, overflow:"hidden", lineHeight:0 }}>
      <div style={{ display:"flex", width:"200%", animation:"waveMove 10s linear infinite" }}>
        <svg viewBox="0 0 800 60" style={{ width:"50%", flexShrink:0 }} preserveAspectRatio="none">
          <path d="M0,30 C100,0 200,60 300,30 C400,0 500,60 600,30 C700,0 750,45 800,30 L800,60 L0,60Z"
            fill={`rgba(56,189,248,${opacity})`}/>
        </svg>
        <svg viewBox="0 0 800 60" style={{ width:"50%", flexShrink:0 }} preserveAspectRatio="none">
          <path d="M0,30 C100,0 200,60 300,30 C400,0 500,60 600,30 C700,0 750,45 800,30 L800,60 L0,60Z"
            fill={`rgba(56,189,248,${opacity})`}/>
        </svg>
      </div>
      <div style={{ display:"flex", width:"200%", animation:"waveMove 16s linear infinite reverse", marginTop:-30 }}>
        <svg viewBox="0 0 800 60" style={{ width:"50%", flexShrink:0 }} preserveAspectRatio="none">
          <path d="M0,40 C120,10 240,60 360,35 C480,10 600,55 720,35 C760,25 790,45 800,40 L800,60 L0,60Z"
            fill={`rgba(99,102,241,${opacity*0.6})`}/>
        </svg>
        <svg viewBox="0 0 800 60" style={{ width:"50%", flexShrink:0 }} preserveAspectRatio="none">
          <path d="M0,40 C120,10 240,60 360,35 C480,10 600,55 720,35 C760,25 790,45 800,40 L800,60 L0,60Z"
            fill={`rgba(99,102,241,${opacity*0.6})`}/>
        </svg>
      </div>
    </div>
  );
}

/* ─── MAIN ─────────────────────────────────────────────── */
export default function App() {
  const [scrollY,      setScrollY]      = useState(0);
  const [cart,         setCart]         = useState([]);
  const [cartOpen,     setCartOpen]     = useState(false);
  const [modal,        setModal]        = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [step,         setStep]         = useState("cart");
  const [payMethod,    setPayMethod]    = useState("");
  const [addedId,      setAddedId]      = useState(null);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [tilt,         setTilt]         = useState({ x:0, y:0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Gyroscope / mouse tilt for hero card
  useEffect(() => {
    const onMove = (e) => {
      const { beta, gamma } = e;
      setTilt({ x: (gamma||0)/20, y: (beta||0)/20 });
    };
    const onMouse = (e) => {
      const cx = window.innerWidth/2, cy = window.innerHeight/2;
      setTilt({ x:(e.clientX-cx)/cx*8, y:(e.clientY-cy)/cy*8 });
    };
    window.addEventListener("deviceorientation", onMove);
    window.addEventListener("mousemove", onMouse);
    return () => { window.removeEventListener("deviceorientation", onMove); window.removeEventListener("mousemove", onMouse); };
  }, []);

  const addToCart = (p, size) => {
    setCart(c => {
      const ex = c.find(i => i.id===p.id && i.size===size);
      if (ex) return c.map(i => i.id===p.id && i.size===size ? {...i,qty:i.qty+1} : i);
      return [...c, {...p, size, qty:1}];
    });
    setAddedId(p.id); setTimeout(() => setAddedId(null), 900);
    setModal(null); setSelectedSize("");
  };
  const removeItem = (id,size) => setCart(c => c.filter(i => !(i.id===id && i.size===size)));
  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  const total     = cart.reduce((s,i)=>s+i.price*i.qty,0);

  // Pre-generate stable particles
  const bubbles = useRef([...Array(18)].map((_,i)=>({
    x: (i*5.5+7)%95,
    size: 6+((i*7)%22),
    duration: 5+((i*3)%7),
    delay: (i*0.9)%6,
    type: i%4===0?"star": i%5===0?"glow":"bubble",
  }))).current;

  return (
    <div style={{ minHeight:"100vh", background:"#020c1b", color:"#fff", fontFamily:"'Montserrat',sans-serif", overflowX:"hidden" }}>

      {/* ── GLOBAL CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{width:2px;}
        ::-webkit-scrollbar-thumb{background:#0ea5e9;}

        @keyframes floatUp{
          0%{transform:translateY(0) scale(1);opacity:0.8;}
          80%{opacity:0.5;}
          100%{transform:translateY(-110vh) scale(1.3);opacity:0;}
        }
        @keyframes waveMove{
          from{transform:translateX(0);}
          to{transform:translateX(-50%);}
        }
        @keyframes shimmer{
          0%{background-position:-400px 0;}
          100%{background-position:400px 0;}
        }
        @keyframes fadeUp{
          from{opacity:0;transform:translateY(28px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes pulse{
          0%,100%{transform:scale(1);}
          50%{transform:scale(1.08);}
        }
        @keyframes glow{
          0%,100%{box-shadow:0 0 20px rgba(14,165,233,0.3);}
          50%{box-shadow:0 0 50px rgba(14,165,233,0.7),0 0 80px rgba(14,165,233,0.3);}
        }
        @keyframes slideUp{
          from{transform:translateY(100%);}
          to{transform:translateY(0);}
        }
        @keyframes slideRight{
          from{transform:translateX(100%);}
          to{transform:translateX(0);}
        }
        @keyframes marqueeSlow{
          from{transform:translateX(0);}
          to{transform:translateX(-50%);}
        }
        @keyframes spinSlow{
          from{transform:rotate(0deg);}
          to{transform:rotate(360deg);}
        }
        @keyframes successBounce{
          0%{transform:scale(0.7);opacity:0;}
          60%{transform:scale(1.1);}
          100%{transform:scale(1);opacity:1;}
        }
        @keyframes grain{
          0%,100%{transform:translate(0,0);}
          25%{transform:translate(2px,-2px);}
          50%{transform:translate(-2px,2px);}
          75%{transform:translate(2px,2px);}
        }
        @keyframes float1{
          0%,100%{transform:translateY(0);}
          50%{transform:translateY(-16px);}
        }
        @keyframes float2{
          0%,100%{transform:translateY(0) rotate(0deg);}
          50%{transform:translateY(-20px) rotate(5deg);}
        }
        @keyframes ripplePulse{
          0%{box-shadow:0 0 0 0 rgba(14,165,233,0.5);}
          100%{box-shadow:0 0 0 14px rgba(14,165,233,0);}
        }

        .card-shine{
          position:absolute;inset:0;
          background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.06) 50%,transparent 60%);
          background-size:200% 100%;
          transition:background-position 0.6s ease;
        }
        .product-card:active .card-shine{background-position:-100% 0;}

        .btn-primary{
          background:linear-gradient(135deg,#0ea5e9,#6366f1);
          color:#fff;border:none;cursor:pointer;
          font-family:'Montserrat',sans-serif;font-weight:600;
          font-size:11px;letter-spacing:3px;
          padding:15px 28px;
          transition:all 0.3s;
          -webkit-tap-highlight-color:transparent;
          position:relative;overflow:hidden;
        }
        .btn-primary::after{
          content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent);
          opacity:0;transition:opacity 0.3s;
        }
        .btn-primary:active{transform:scale(0.97);}
        .btn-primary:active::after{opacity:1;}

        .btn-ghost{
          background:rgba(255,255,255,0.05);
          color:rgba(255,255,255,0.7);
          border:1px solid rgba(255,255,255,0.15);
          cursor:pointer;font-family:'Montserrat',sans-serif;
          font-weight:400;font-size:11px;letter-spacing:3px;
          padding:15px 28px;transition:all 0.3s;
          -webkit-tap-highlight-color:transparent;
          backdrop-filter:blur(10px);
        }
        .btn-ghost:active{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.3);}

        .size-pill{
          padding:8px 16px;border-radius:40px;
          border:1px solid rgba(255,255,255,0.15);
          background:transparent;color:rgba(255,255,255,0.5);
          font-family:'Montserrat';font-size:12px;cursor:pointer;
          transition:all 0.2s;-webkit-tap-highlight-color:transparent;
        }
        .size-pill.active{
          border-color:#0ea5e9;color:#38bdf8;
          background:rgba(14,165,233,0.12);
        }

        .pay-btn{
          border:1px solid rgba(255,255,255,0.12);
          background:rgba(255,255,255,0.04);
          color:#fff;cursor:pointer;padding:14px 8px;
          font-family:'Montserrat';font-size:10px;letter-spacing:2px;
          display:flex;flex-direction:column;align-items:center;gap:6px;
          transition:all 0.25s;-webkit-tap-highlight-color:transparent;
          border-radius:12px;
        }
        .pay-btn.active{border-color:#0ea5e9;background:rgba(14,165,233,0.1);}
        .pay-btn:active{transform:scale(0.96);}

        .nav-link{color:rgba(255,255,255,0.55);font-size:10px;letter-spacing:3px;cursor:pointer;transition:color 0.2s;}
        .nav-link:active{color:#38bdf8;}

        input{outline:none;font-family:'Montserrat',sans-serif;background:transparent;-webkit-appearance:none;border-radius:0;}
        input::placeholder{color:rgba(255,255,255,0.2);}
      `}</style>

      {/* ── GRAIN OVERLAY ── */}
      <div style={{
        position:"fixed",inset:"-100%",width:"300%",height:"300%",
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
        opacity:0.03,pointerEvents:"none",zIndex:9000,animation:"grain 0.5s steps(2) infinite",
      }}/>

      {/* ── NAV ── */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:800,
        height:58,padding:"0 18px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        background: scrollY>50 ? "rgba(2,12,27,0.95)" : "transparent",
        backdropFilter: scrollY>50 ? "blur(20px)" : "none",
        borderBottom: scrollY>50 ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition:"all 0.4s ease",
      }}>
        {/* Hamburger */}
        <button onClick={()=>setMenuOpen(v=>!v)} style={{ background:"none",border:"none",cursor:"pointer",padding:6,display:"flex",flexDirection:"column",gap:5,zIndex:2 }}>
          {[0,1,2].map(i=>(
            <span key={i} style={{
              display:"block",width:20,height:1.5,background:"rgba(255,255,255,0.7)",
              borderRadius:2,transition:"all 0.3s",
              transform: menuOpen?(i===0?"rotate(45deg) translate(4.5px,4.5px)":i===2?"rotate(-45deg) translate(4.5px,-4.5px)":"scaleX(0)"):"none",
              opacity: menuOpen&&i===1?0:1,
            }}/>
          ))}
        </button>

        {/* Brand */}
        <div style={{ position:"absolute",left:"50%",transform:"translateX(-50%)",textAlign:"center" }}>
          <div style={{
            fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:300,letterSpacing:10,
            background:"linear-gradient(90deg,#38bdf8,#fff,#38bdf8)",backgroundSize:"200%",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            animation:"shimmer 4s linear infinite",
          }}>MAREA</div>
          <div style={{ fontSize:6,letterSpacing:5,color:"rgba(14,165,233,0.7)",marginTop:-2 }}>SWIM COUTURE</div>
        </div>

        {/* Cart */}
        <div onClick={()=>{setCartOpen(true);setStep("cart");}} style={{ position:"relative",cursor:"pointer",padding:6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {cartCount>0&&(
            <span style={{
              position:"absolute",top:-4,right:-4,
              width:17,height:17,borderRadius:"50%",
              background:"linear-gradient(135deg,#0ea5e9,#6366f1)",
              fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",
              fontWeight:700,animation:"ripplePulse 1.5s ease-out infinite",
            }}>{cartCount}</span>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen&&(
        <div style={{
          position:"fixed",inset:0,zIndex:700,
          background:"rgba(2,12,27,0.98)",backdropFilter:"blur(20px)",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:32,
          animation:"fadeIn 0.25s ease both",
        }}>
          {["COLLECTION","LOOKBOOK","ATELIER","STORY","CONTACT"].map(l=>(
            <span key={l} onClick={()=>setMenuOpen(false)} style={{
              fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:300,
              letterSpacing:6,color:"rgba(255,255,255,0.85)",cursor:"pointer",
              animation:"fadeUp 0.5s ease both",
            }}>{l}</span>
          ))}
          <div style={{ width:1,height:40,background:"rgba(56,189,248,0.3)",margin:"8px 0" }}/>
          <span style={{ fontSize:9,letterSpacing:5,color:"rgba(56,189,248,0.5)" }}>MILAN · MYKONOS · MIAMI</span>
        </div>
      )}

      {/* ── HERO ── */}
      <section ref={heroRef} style={{
        minHeight:"100svh",position:"relative",
        overflow:"hidden",
        background:"radial-gradient(ellipse at 50% 30%,#0c2a45 0%,#020c1b 65%)",
        display:"flex",flexDirection:"column",
      }}>
        {/* Deep ocean background layers */}
        <div style={{ position:"absolute",inset:0,
          background:"radial-gradient(ellipse at 30% 70%,rgba(14,165,233,0.08),transparent 60%)",pointerEvents:"none" }}/>
        <div style={{ position:"absolute",inset:0,
          background:"radial-gradient(ellipse at 80% 20%,rgba(99,102,241,0.07),transparent 50%)",pointerEvents:"none" }}/>

        {/* Floating particles */}
        {bubbles.map((b,i)=><Particle key={i} {...b}/>)}

        {/* Animated stars */}
        {[...Array(22)].map((_,i)=>(
          <div key={i} style={{
            position:"absolute",
            width:1+(i%2),height:1+(i%2),
            borderRadius:"50%",background:"#fff",
            opacity:0.1+((i*13)%7)*0.05,
            left:`${(i*4.3+2)%98}%`,top:`${(i*3.7+5)%65}%`,
            animation:`pulse ${2+(i%3)}s ease-in-out ${i*0.3}s infinite`,
          }}/>
        ))}

        {/* Waves at bottom */}
        <Waves opacity={0.09}/>

        {/* Hero content */}
        <div style={{
          flex:1,display:"flex",flexDirection:"column",
          justifyContent:"center",padding:"88px 24px 80px",
          position:"relative",zIndex:2,
        }}>
          <p style={{ fontSize:9,letterSpacing:6,color:"#38bdf8",marginBottom:20,fontWeight:500,
            animation:"fadeUp 0.8s ease 0.2s both",opacity:0 }}>
            ✦ SUMMER COLLECTION 2026 ✦
          </p>

          <h1 style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:"clamp(60px,17vw,110px)",
            fontWeight:300,lineHeight:0.88,letterSpacing:-1,
            marginBottom:28,
            animation:"fadeUp 0.9s ease 0.4s both",opacity:0,
          }}>
            <em style={{ display:"block",fontStyle:"italic",color:"rgba(255,255,255,0.9)" }}>Dive</em>
            <span style={{ display:"block",color:"rgba(255,255,255,0.9)" }}>into</span>
            <span style={{
              display:"block",
              background:"linear-gradient(90deg,#38bdf8,#818cf8,#e879f9,#38bdf8)",
              backgroundSize:"200%",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              animation:"shimmer 3.5s linear infinite",
            }}>luxury.</span>
          </h1>

          <p style={{
            fontSize:13,lineHeight:1.85,color:"rgba(255,255,255,0.45)",
            fontWeight:300,marginBottom:36,maxWidth:300,
            animation:"fadeUp 0.9s ease 0.7s both",opacity:0,
          }}>
            Handcrafted in Milan. Worn on the world's most beautiful shores. Each piece a testament to artisanal perfection.
          </p>

          <div style={{ display:"flex",flexDirection:"column",gap:12,animation:"fadeUp 0.9s ease 0.9s both",opacity:0 }}>
            <button className="btn-primary" onClick={()=>document.getElementById("collection").scrollIntoView({behavior:"smooth"})}
              style={{ width:"100%",borderRadius:60,fontSize:11,letterSpacing:3 }}>
              EXPLORE COLLECTION
            </button>
            <button className="btn-ghost" style={{ width:"100%",borderRadius:60 }}>
              WATCH THE FILM
            </button>
          </div>

          {/* Floating hero card - tilts with gyro/mouse */}
          <div style={{
            marginTop:48,
            background:"linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
            border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:24,padding:"20px",backdropFilter:"blur(20px)",
            transform:`perspective(600px) rotateX(${-tilt.y*0.5}deg) rotateY(${tilt.x*0.5}deg)`,
            transition:"transform 0.1s ease",
            animation:"glow 4s ease-in-out infinite",
            position:"relative",overflow:"hidden",
          }}>
            <div style={{ display:"flex",alignItems:"center",gap:16 }}>
              <div style={{
                width:64,height:64,borderRadius:16,
                background:"linear-gradient(135deg,#0ea5e9,#6366f1)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:32,flexShrink:0,
                animation:"float1 3s ease-in-out infinite",
              }}>🩱</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15,fontWeight:600,marginBottom:4 }}>Adriatic One-Piece</div>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.45)",marginBottom:10 }}>Italian Econyl® · UV50+</div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <span style={{ fontSize:20,fontFamily:"'Cormorant Garamond',serif",fontWeight:300 }}>$295</span>
                  <button className="btn-primary" onClick={()=>setModal(products[0])} style={{ borderRadius:40,padding:"8px 18px",fontSize:10,letterSpacing:2 }}>
                    SHOP
                  </button>
                </div>
              </div>
            </div>
            {/* Card shine */}
            <div style={{
              position:"absolute",top:-50,left:-50,width:120,height:120,
              background:"radial-gradient(circle,rgba(56,189,248,0.15),transparent 70%)",
              pointerEvents:"none",
            }}/>
          </div>

          {/* Scroll cue */}
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",marginTop:36,gap:8,opacity:0.35 }}>
            <div style={{ width:1,height:40,background:"linear-gradient(180deg,transparent,#38bdf8)",animation:"float1 2s ease-in-out infinite" }}/>
            <span style={{ fontSize:8,letterSpacing:4 }}>SCROLL</span>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ background:"linear-gradient(90deg,#0ea5e9,#6366f1,#e879f9,#0ea5e9)",backgroundSize:"200%",animation:"shimmer 5s linear infinite",padding:"13px 0",overflow:"hidden" }}>
        <div style={{ display:"flex",animation:"marqueeSlow 20s linear infinite",whiteSpace:"nowrap" }}>
          {[...Array(5)].map((_,i)=>(
            <span key={i} style={{ fontSize:9,letterSpacing:4,color:"rgba(255,255,255,0.85)",padding:"0 36px",fontWeight:500 }}>
              🌊 FREE SHIPPING OVER $150 &nbsp;✦&nbsp; ITALIAN FABRICS &nbsp;✦&nbsp; UV50+ PROTECTION &nbsp;✦&nbsp; SUSTAINABLE &nbsp;✦&nbsp; 30-DAY RETURNS
            </span>
          ))}
        </div>
      </div>

      {/* ── COLLECTION ── */}
      <section id="collection" style={{ padding:"72px 0 80px",background:"#020c1b",position:"relative",overflow:"hidden" }}>
        {/* background glow orbs */}
        <div style={{ position:"absolute",top:"10%",left:"-20%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(14,165,233,0.06),transparent 70%)",pointerEvents:"none" }}/>
        <div style={{ position:"absolute",bottom:"10%",right:"-10%",width:250,height:250,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.06),transparent 70%)",pointerEvents:"none" }}/>

        <div style={{ padding:"0 20px 40px",marginBottom:2 }}>
          <p style={{ fontSize:9,letterSpacing:6,color:"#38bdf8",marginBottom:14,fontWeight:500 }}>SS 2026</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(40px,11vw,64px)",fontWeight:300,lineHeight:1 }}>
            The Collection
          </h2>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:2 }}>
          {products.map((p,idx)=>(
            <div key={p.id} className="product-card" onClick={()=>{setModal(p);setSelectedSize("");}}
              style={{
                background:`linear-gradient(160deg,${p.color}0d,rgba(2,12,27,0.8))`,
                border:"1px solid rgba(255,255,255,0.05)",
                cursor:"pointer",position:"relative",overflow:"hidden",
                animation:`fadeUp 0.6s ease ${idx*0.1}s both`,
              }}>
              <div className="card-shine"/>

              {/* Product image area */}
              <div style={{ height:200,display:"flex",alignItems:"center",justifyContent:"center",position:"relative" }}>
                <div style={{
                  fontSize:80,
                  filter:`drop-shadow(0 12px 30px ${p.glow})`,
                  animation:`float${idx%2+1} ${3+idx%2}s ease-in-out infinite`,
                  animationDelay:`${idx*0.4}s`,
                }}>
                  {p.emoji}
                </div>
                {addedId===p.id&&(
                  <div style={{
                    position:"absolute",inset:0,
                    background:"rgba(14,165,233,0.2)",backdropFilter:"blur(4px)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                  }}>
                    <span style={{ fontSize:11,letterSpacing:3,color:"#38bdf8" }}>✓ ADDED</span>
                  </div>
                )}
                {/* Tag */}
                <span style={{
                  position:"absolute",top:12,left:12,
                  fontSize:7,letterSpacing:2,padding:"4px 10px",borderRadius:20,
                  background:`linear-gradient(135deg,${p.color},${p.color}88)`,
                  fontWeight:600,boxShadow:`0 4px 16px ${p.glow}`,
                }}>{p.tag}</span>
              </div>

              {/* Info */}
              <div style={{ padding:"14px 16px 18px",borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:15,fontWeight:600,marginBottom:2 }}>{p.name}</div>
                    <div style={{ fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.4)" }}>{p.sub}</div>
                  </div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:300,color:"#38bdf8" }}>${p.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EDITORIAL STRIP ── */}
      <section style={{
        padding:"64px 24px",position:"relative",overflow:"hidden",
        background:"radial-gradient(ellipse at 50% 0%,#0c2a45,#020c1b)",
      }}>
        <Waves opacity={0.06}/>
        {bubbles.slice(0,8).map((b,i)=><Particle key={i} {...b} size={b.size*0.6}/>)}

        <div style={{ position:"relative",zIndex:2 }}>
          <p style={{ fontSize:9,letterSpacing:6,color:"#38bdf8",marginBottom:16,fontWeight:500 }}>AS SEEN IN</p>
          <h2 style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:"clamp(28px,8vw,52px)",
            fontWeight:300,lineHeight:1.15,marginBottom:20,
          }}>
            <em>"The swimwear that makes the ocean feel underdressed."</em>
          </h2>
          <div style={{ fontSize:9,letterSpacing:4,color:"rgba(255,255,255,0.3)",marginBottom:36 }}>
            — VOGUE ITALIA, JUNE 2026
          </div>

          {/* Featured product card */}
          <div style={{
            background:"linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
            border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:20,padding:"24px",backdropFilter:"blur(16px)",
            marginBottom:28,position:"relative",overflow:"hidden",
          }}>
            <div style={{ display:"flex",gap:20,alignItems:"center" }}>
              <div style={{
                fontSize:70,filter:"drop-shadow(0 8px 24px rgba(245,158,11,0.5))",
                animation:"float2 4s ease-in-out infinite",flexShrink:0,
              }}>👙</div>
              <div>
                <div style={{ fontSize:9,letterSpacing:4,color:"#f59e0b",marginBottom:8 }}>BESTSELLER</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,marginBottom:4 }}>Santorini</div>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:12 }}>Bikini Set · Italian Lycra</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#38bdf8" }}>$345</div>
              </div>
            </div>
            <div style={{ position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,158,11,0.12),transparent 70%)" }}/>
          </div>

          <button className="btn-primary" onClick={()=>{setModal(products[1]);setSelectedSize("");}}
            style={{ width:"100%",borderRadius:60,padding:"16px" }}>
            SHOP THE SANTORINI
          </button>
        </div>
      </section>

      {/* ── STATS ── */}
      <div style={{ background:"#020c1b",padding:"48px 24px",borderTop:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
          {[
            {n:"14h",  l:"artisanal work per piece", icon:"✦"},
            {n:"50+",  l:"countries shipped to",     icon:"🌊"},
            {n:"100%", l:"sustainable materials",    icon:"♻️"},
            {n:"8yrs", l:"of craft mastery",         icon:"🏆"},
          ].map(s=>(
            <div key={s.n} style={{
              padding:"24px 18px",
              background:"linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))",
              border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,
              borderTop:"2px solid rgba(14,165,233,0.4)",
            }}>
              <div style={{ fontSize:18,marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:300,color:"#38bdf8",lineHeight:1 }}>{s.n}</div>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:8,lineHeight:1.5,letterSpacing:1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ padding:"52px 24px 40px",background:"#010810",borderTop:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ marginBottom:36 }}>
          <div style={{
            fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,
            letterSpacing:8,marginBottom:6,
            background:"linear-gradient(90deg,#38bdf8,#fff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          }}>🌊 MAREA</div>
          <div style={{ fontSize:7,letterSpacing:5,color:"rgba(14,165,233,0.6)",marginBottom:16 }}>SWIM COUTURE</div>
          <p style={{ fontSize:12,lineHeight:1.9,color:"rgba(255,255,255,0.3)",fontWeight:300,maxWidth:260 }}>
            Where the ocean meets elegance. Sustainable luxury for the modern voyager.
          </p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:28,marginBottom:36 }}>
          {[
            {title:"MAISON",     links:["Our Story","Atelier","Sustainability","Press"]},
            {title:"CLIENT",     links:["Size Guide","Returns","Shipping","Contact"]},
          ].map(col=>(
            <div key={col.title}>
              <div style={{ fontSize:8,letterSpacing:4,color:"#38bdf8",marginBottom:14 }}>{col.title}</div>
              {col.links.map(l=>(
                <div key={l} style={{ fontSize:12,color:"rgba(255,255,255,0.3)",marginBottom:10,fontWeight:300 }}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:24 }}>
          <div style={{ display:"flex",gap:24,marginBottom:12 }}>
            {["Instagram","TikTok","Pinterest"].map(s=>(
              <span key={s} style={{ fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.25)" }}>{s}</span>
            ))}
          </div>
          <span style={{ fontSize:10,color:"rgba(255,255,255,0.15)" }}>© 2026 Marea Swim Couture</span>
        </div>
      </footer>

      {/* ── PRODUCT MODAL (bottom sheet) ── */}
      {modal&&(
        <div onClick={()=>setModal(null)} style={{ position:"fixed",inset:0,zIndex:900,background:"rgba(2,12,27,0.8)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end" }}>
          <div onClick={e=>e.stopPropagation()} style={{
            width:"100%",maxHeight:"88svh",overflowY:"auto",
            background:"linear-gradient(180deg,#071a2e,#020c1b)",
            borderRadius:"22px 22px 0 0",
            border:"1px solid rgba(255,255,255,0.08)",
            borderBottom:"none",
            animation:"slideUp 0.38s cubic-bezier(0.23,1,0.32,1) both",
          }}>
            {/* Drag handle */}
            <div style={{ width:36,height:4,background:"rgba(255,255,255,0.15)",borderRadius:2,margin:"14px auto 0" }}/>

            {/* Product visual */}
            <div style={{
              minHeight:220,display:"flex",alignItems:"center",justifyContent:"center",
              position:"relative",overflow:"hidden",
              background:`radial-gradient(ellipse at 50% 60%,${modal.color}18,transparent 70%)`,
              margin:"16px 16px 0",borderRadius:16,
            }}>
              {bubbles.slice(0,6).map((b,i)=><Particle key={i} {...b} size={b.size*0.5}/>)}
              <div style={{
                fontSize:110,
                filter:`drop-shadow(0 20px 50px ${modal.glow})`,
                animation:"float2 4s ease-in-out infinite",
                position:"relative",zIndex:1,
              }}>{modal.emoji}</div>
              <span style={{
                position:"absolute",top:14,left:14,
                fontSize:8,letterSpacing:2,padding:"5px 12px",borderRadius:20,
                background:`linear-gradient(135deg,${modal.color},${modal.color}88)`,
                fontWeight:600,zIndex:2,
              }}>{modal.tag}</span>
            </div>

            {/* Details */}
            <div style={{ padding:"24px 24px 40px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                <div>
                  <p style={{ fontSize:9,letterSpacing:5,color:modal.color,marginBottom:6 }}>THE {modal.name.toUpperCase()}</p>
                  <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:300 }}>{modal.name}</h2>
                  <p style={{ fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.4)",marginTop:2 }}>{modal.sub}</p>
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:300,color:"#38bdf8" }}>${modal.price}</div>
              </div>

              <div style={{ width:28,height:1,background:modal.color,margin:"16px 0" }}/>
              <p style={{ fontSize:13,lineHeight:1.9,color:"rgba(255,255,255,0.45)",fontWeight:300,marginBottom:28 }}>
                {modal.id===1?"Italian Econyl® regenerated nylon with UV50+ protection. Hand-finished seams. Each piece crafted over 14 hours.":
                 modal.id===2?"Terracotta-toned luxe lycra with adjustable 18k gold-plated hardware. Structured for all-day elegance.":
                 modal.id===3?"Deep emerald with hand-embroidered trim. Limited to 50 pieces worldwide. Certificate of authenticity included.":
                 modal.id===4?"Dusty rose silk-touch fabric with ruched detailing. Tie closure allows perfect custom fit.":
                 modal.id===5?"Navy with silver lurex threading. Architectural boning for sculpted silhouette and all-day support.":
                 "Hand-woven cotton gauze with fringe detail. As seen in Vogue Italia. The ultimate resort statement."}
              </p>

              <p style={{ fontSize:9,letterSpacing:4,color:"rgba(255,255,255,0.4)",marginBottom:12 }}>SELECT SIZE</p>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:32 }}>
                {["XS","S","M","L","XL"].slice(0,modal.id===6?3:modal.id===3?4:5).map(s=>(
                  <button key={s} className={`size-pill ${selectedSize===s?"active":""}`} onClick={()=>setSelectedSize(s)}>{s}</button>
                ))}
              </div>

              <button className="btn-primary" onClick={()=>selectedSize&&addToCart(modal,selectedSize)}
                style={{
                  width:"100%",borderRadius:60,padding:"17px",fontSize:11,letterSpacing:3,
                  opacity:selectedSize?1:0.4,
                  boxShadow:selectedSize?`0 12px 40px ${modal.glow}`:"none",
                  transition:"all 0.3s",
                }}>
                {selectedSize?"ADD TO BAG ✦":"SELECT A SIZE FIRST"}
              </button>
              <p style={{ fontSize:10,color:"rgba(255,255,255,0.25)",textAlign:"center",marginTop:12,letterSpacing:1 }}>
                🚚 Complimentary shipping · Free returns
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── CART / CHECKOUT ── */}
      {cartOpen&&(
        <div style={{ position:"fixed",inset:0,zIndex:950,display:"flex" }}>
          <div onClick={()=>setCartOpen(false)} style={{ flex:1,background:"rgba(2,12,27,0.6)",backdropFilter:"blur(6px)" }}/>
          <div style={{
            width:"min(420px,100vw)",background:"linear-gradient(180deg,#071a2e,#020c1b)",
            height:"100dvh",overflowY:"auto",
            border:"1px solid rgba(255,255,255,0.06)",borderRight:"none",
            animation:"slideRight 0.38s cubic-bezier(0.23,1,0.32,1) both",
            display:"flex",flexDirection:"column",
          }}>

            {/* CART STEP */}
            {step==="cart"&&<>
              <div style={{ padding:"20px 22px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0 }}>
                <div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:300 }}>Your Bag</div>
                  <div style={{ fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:2 }}>{cartCount} {cartCount===1?"PIECE":"PIECES"}</div>
                </div>
                <button onClick={()=>setCartOpen(false)} style={{ background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:20,cursor:"pointer" }}>✕</button>
              </div>

              <div style={{ flex:1,padding:"20px 22px",overflowY:"auto" }}>
                {cart.length===0?(
                  <div style={{ textAlign:"center",padding:"80px 0" }}>
                    <div style={{ fontSize:48,marginBottom:16 }}>🛍️</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontStyle:"italic",color:"rgba(255,255,255,0.3)" }}>Your bag is empty.</div>
                  </div>
                ):cart.map(item=>(
                  <div key={`${item.id}-${item.size}`} style={{ display:"flex",gap:14,marginBottom:22,paddingBottom:22,borderBottom:"1px solid rgba(255,255,255,0.05)",alignItems:"center" }}>
                    <div style={{
                      width:64,height:64,borderRadius:14,flexShrink:0,
                      background:`radial-gradient(ellipse,${item.color}22,transparent)`,
                      border:"1px solid rgba(255,255,255,0.07)",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,
                    }}>{item.emoji}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontWeight:600,fontSize:14,marginBottom:3 }}>{item.name}</div>
                      <div style={{ fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:7,letterSpacing:1 }}>{item.sub} · {item.size} · ×{item.qty}</div>
                      <button onClick={()=>removeItem(item.id,item.size)} style={{ background:"none",border:"none",fontSize:9,letterSpacing:2,color:"rgba(255,80,80,0.5)",cursor:"pointer",padding:0 }}>REMOVE</button>
                    </div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"#38bdf8",flexShrink:0 }}>${item.price*item.qty}</div>
                  </div>
                ))}
              </div>

              {cart.length>0&&(
                <div style={{ padding:"16px 22px 36px",borderTop:"1px solid rgba(255,255,255,0.06)",flexShrink:0 }}>
                  {[["Subtotal",`$${total}`],["Shipping","FREE"]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:12,color:"rgba(255,255,255,0.4)" }}>
                      <span>{k}</span><span style={k==="Shipping"?{color:"#4ade80"}:{}}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex",justifyContent:"space-between",margin:"16px 0 20px",paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:20 }}>Total</span>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#38bdf8" }}>${total}</span>
                  </div>
                  <button className="btn-primary" onClick={()=>setStep("payment")} style={{ width:"100%",borderRadius:60,padding:"16px",fontSize:11,letterSpacing:3 }}>
                    PROCEED TO PAYMENT
                  </button>
                </div>
              )}
            </>}

            {/* PAYMENT STEP */}
            {step==="payment"&&<>
              <div style={{ padding:"20px 22px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0 }}>
                <div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22 }}>Payment</div>
                  <div style={{ fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:2 }}>🔒 256-BIT ENCRYPTED</div>
                </div>
                <button onClick={()=>setStep("cart")} style={{ background:"none",border:"none",fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.35)",cursor:"pointer" }}>← BACK</button>
              </div>

              <div style={{ flex:1,padding:"24px 22px",overflowY:"auto" }}>
                <p style={{ fontSize:9,letterSpacing:5,color:"rgba(255,255,255,0.35)",marginBottom:14 }}>QUICK PAY</p>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:28 }}>
                  {[{icon:"🍎",label:"Apple Pay"},{icon:"G",label:"G Pay"},{icon:"🅿️",label:"PayPal"}].map(m=>(
                    <button key={m.label} className={`pay-btn ${payMethod===m.label?"active":""}`} onClick={()=>setPayMethod(m.label)}>
                      <span style={{ fontSize:22 }}>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24 }}>
                  <div style={{ flex:1,height:1,background:"rgba(255,255,255,0.07)" }}/>
                  <span style={{ fontSize:9,letterSpacing:3,color:"rgba(255,255,255,0.25)" }}>OR CARD</span>
                  <div style={{ flex:1,height:1,background:"rgba(255,255,255,0.07)" }}/>
                </div>

                {[{label:"CARDHOLDER NAME",ph:"Jane Ocean"},{label:"CARD NUMBER",ph:"4242 4242 4242 4242"},{label:"EMAIL",ph:"your@email.com"}].map(f=>(
                  <div key={f.label} style={{ marginBottom:20 }}>
                    <p style={{ fontSize:9,letterSpacing:4,color:"rgba(255,255,255,0.3)",marginBottom:8 }}>{f.label}</p>
                    <input placeholder={f.ph} style={{
                      width:"100%",padding:"12px 0",
                      borderBottom:"1px solid rgba(255,255,255,0.1)",
                      color:"#fff",fontSize:14,fontWeight:300,letterSpacing:1,
                    }}/>
                  </div>
                ))}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                  {[{label:"EXPIRY",ph:"MM/YY"},{label:"CVV",ph:"•••"}].map(f=>(
                    <div key={f.label}>
                      <p style={{ fontSize:9,letterSpacing:4,color:"rgba(255,255,255,0.3)",marginBottom:8 }}>{f.label}</p>
                      <input placeholder={f.ph} style={{
                        width:"100%",padding:"12px 0",
                        borderBottom:"1px solid rgba(255,255,255,0.1)",
                        color:"#fff",fontSize:14,fontWeight:300,
                      }}/>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding:"16px 22px 40px",borderTop:"1px solid rgba(255,255,255,0.06)",flexShrink:0 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:16 }}>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:18 }}>Total Due</span>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"#38bdf8" }}>${total}</span>
                </div>
                <button className="btn-primary" onClick={()=>setStep("success")} style={{ width:"100%",borderRadius:60,padding:"16px",fontSize:11,letterSpacing:3,boxShadow:"0 8px 32px rgba(14,165,233,0.3)" }}>
                  🔒 CONFIRM — ${total}
                </button>
              </div>
            </>}

            {/* SUCCESS */}
            {step==="success"&&(
              <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px",textAlign:"center",animation:"successBounce 0.5s ease both" }}>
                <div style={{
                  width:80,height:80,borderRadius:"50%",
                  background:"linear-gradient(135deg,rgba(14,165,233,0.2),rgba(99,102,241,0.2))",
                  border:"1px solid rgba(14,165,233,0.4)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  marginBottom:28,fontSize:36,
                  animation:"glow 2s ease-in-out infinite",
                }}>🌊</div>
                <p style={{ fontSize:9,letterSpacing:6,color:"#38bdf8",marginBottom:16 }}>ORDER CONFIRMED</p>
                <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:300,marginBottom:16,lineHeight:1.1 }}>
                  <em>Thank you.</em>
                </h2>
                <div style={{ width:28,height:1,background:"linear-gradient(90deg,#38bdf8,#6366f1)",margin:"0 auto 20px" }}/>
                <p style={{ fontSize:12,lineHeight:1.9,color:"rgba(255,255,255,0.35)",fontWeight:300,maxWidth:260,marginBottom:40 }}>
                  Your pieces are being handcrafted in our Milan atelier. Delivery in 7–10 days. Confirmation sent to your email.
                </p>
                <button className="btn-ghost" onClick={()=>{setCartOpen(false);setCart([]);setStep("cart");}} style={{ width:"100%",borderRadius:60,padding:"15px" }}>
                  CONTINUE SHOPPING
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
