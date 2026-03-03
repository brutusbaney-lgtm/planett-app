import { useState, useEffect, useRef } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:"#111214", surface:"#1A1B1E", card:"#222428", cardAlt:"#2A2B30",
  border:"#2E3035", accent:"#F5C842", accentGlow:"#F5C84230",
  red:"#FF4D4D", green:"#3DD68C", blue:"#4A9EFF",
  orange:"#FB923C", purple:"#C084FC",
  text:"#FFFFFF", textSoft:"#C8CAD0", muted:"#6B7A8D",
};

const AFL_POS_COLOR = {
  FF:C.orange, CHF:C.orange, HFF:C.orange,
  C:C.accent, W:C.accent,
  RK:C.purple, RR:C.purple,
  HBF:C.blue, CHB:C.blue, FB:C.blue, INT:C.muted,
};

const SCORING_MAP = [
  { key:"goals",        pts:6,  label:"Goals"         },
  { key:"behinds",      pts:1,  label:"Behinds"       },
  { key:"kicks",        pts:3,  label:"Kicks"         },
  { key:"handballs",    pts:2,  label:"Handballs"     },
  { key:"marks",        pts:3,  label:"Marks"         },
  { key:"tackles",      pts:4,  label:"Tackles"       },
  { key:"hitouts",      pts:1,  label:"Hitouts"       },
  { key:"freesFor",     pts:1,  label:"Frees For"     },
  { key:"freesAgainst", pts:-3, label:"Frees Against" },
];

const ROUNDS     = ["Practice Match","Round 1","Round 2","Round 3","Round 4","Round 5","Round 6","Round 7","Round 8","Round 9","Round 10","Round 11","Round 12","Round 13","Round 14","Final","Semi Final","Preliminary Final","Grand Final"];
const VENUES     = ["Home","Away","Neutral Venue"];
const POSITIONS  = ["FF","CHF","HFF","C","W","RK","RR","HBF","CHB","FB","INT"];
const GENDERS    = ["Male","Female","Non-binary","Prefer not to say"];
const AGE_GROUPS = ["Under 8s","Under 9s","Under 10s","Under 11s","Under 12s","Under 13s","Under 14s","Under 15s","Under 16s","Under 17s","Under 18s","Under 19s","Senior","Masters","Open Age"];
const DIVISIONS  = ["Division 1","Division 2","Division 3","Division 4","Premier Division","State League"];

const DEFAULT_PLAYER = { name:"", number:"", position:"", dob:"", age:"", gender:"", club:"", league:"", ageGroup:"", division:"" };

function calcFP(stats) {
  return SCORING_MAP.reduce((sum, s) => sum + (stats[s.key] ?? 0) * s.pts, 0);
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function AFLBall({ size=24, color=C.accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <ellipse cx="50" cy="50" rx="27" ry="43" fill={color} opacity="0.95"/>
      <ellipse cx="50" cy="50" rx="27" ry="43" fill="none" stroke={C.bg} strokeWidth="3.5"/>
      <line x1="23" y1="50" x2="77" y2="50" stroke={C.bg} strokeWidth="2.5"/>
      <line x1="50" y1="31" x2="50" y2="69" stroke={C.bg} strokeWidth="2"/>
      <line x1="44" y1="37" x2="56" y2="37" stroke={C.bg} strokeWidth="2"/>
      <line x1="43" y1="44" x2="57" y2="44" stroke={C.bg} strokeWidth="2"/>
      <line x1="43" y1="56" x2="57" y2="56" stroke={C.bg} strokeWidth="2"/>
      <line x1="44" y1="63" x2="56" y2="63" stroke={C.bg} strokeWidth="2"/>
    </svg>
  );
}

function Badge({ label, color=C.accent }) {
  return <span style={{ fontSize:10, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", padding:"3px 9px", borderRadius:5, background:color+"22", color, border:"1px solid "+color+"33" }}>{label}</span>;
}

function BackBtn({ onClick }) {
  return <button onClick={onClick} style={{ width:40, height:40, borderRadius:12, background:C.card, border:"1.5px solid "+C.border, color:C.text, fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>&#8592;</button>;
}

function EmptyState({ icon, title, sub, action, onAction }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 32px", gap:18, textAlign:"center" }}>
      <div style={{ width:72, height:72, borderRadius:22, background:C.card, border:"2px dashed "+C.border, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:18, fontWeight:800, color:C.text }}>{title}</div>
        <div style={{ fontSize:13, color:C.muted, marginTop:6, lineHeight:1.6 }}>{sub}</div>
      </div>
      {action && <button onClick={onAction} style={{ padding:"14px 28px", borderRadius:14, background:C.accent, border:"none", color:C.bg, fontSize:14, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 20px "+C.accentGlow }}>{action}</button>}
    </div>
  );
}

function BottomNav({ active, onNav }) {
  const tabs = [
    { id:"home", label:"Home" },
    { id:"profile", label:"Profile" },
    { id:"eval", label:"Eval" },
    { id:"fixtures", label:"Fixtures" },
    { id:"stats", label:"Stats" },
  ];
  return (
    <div style={{ display:"flex", borderTop:"1px solid "+C.border, background:C.surface, paddingBottom:16, paddingTop:8, flexShrink:0 }}>
      {tabs.map(tab => {
        const on = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onNav(tab.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", padding:"4px 0" }}>
            <div style={{ width:32, height:32, borderRadius:10, background:on?C.accent+"1A":"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <AFLBall size={17} color={on?C.accent:C.muted}/>
            </div>
            <span style={{ fontSize:10, fontWeight:700, color:on?C.accent:C.muted }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Focus-safe input (defined at top level, never inside another component) ──
function FocusInput({ value, onChange, placeholder, type="text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ padding:"13px 16px", background:C.cardAlt, border:"1.5px solid "+(focused?C.accent:C.border), borderRadius:12, color:C.text, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", caretColor:C.accent, transition:"border-color 0.15s", width:"100%", boxSizing:"border-box", colorScheme:"dark" }}
    />
  );
}

// ─── Dropdown (top-level, never nested) ───────────────────────────────────────
function DropdownField({ label, field, value, options, openDrop, setOpenDrop, onChange }) {
  const isOpen = openDrop === field;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, position:"relative" }}>
      {label && <label style={{ fontSize:12, fontWeight:700, color:C.muted }}>{label}</label>}
      <div onClick={() => setOpenDrop(isOpen ? null : field)} style={{ padding:"13px 16px", background:C.cardAlt, border:"1.5px solid "+(isOpen?C.accent:C.border), borderRadius:12, color:value?C.text:C.muted, fontSize:14, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span>{value || (label ? "Select "+label.toLowerCase()+"..." : "Select...")}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" style={{ transform:isOpen?"rotate(180deg)":"none", transition:"0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      {isOpen && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:100, background:C.cardAlt, border:"1.5px solid "+C.border, borderRadius:12, marginTop:4, maxHeight:200, overflowY:"auto", boxShadow:"0 8px 32px #00000088" }}>
          {options.map((opt,i) => (
            <div key={i} onClick={() => { onChange(opt); setOpenDrop(null); }} style={{ padding:"12px 16px", fontSize:14, color:opt===value?C.accent:C.textSoft, fontWeight:opt===value?700:400, cursor:"pointer", borderTop:i>0?"1px solid "+C.border:"none", background:opt===value?C.accent+"12":"transparent" }}>{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────
function ShareModal({ text, title, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }
  };
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"#00000088" }}/>
      <div style={{ position:"relative", background:C.surface, borderRadius:"24px 24px 0 0", padding:"24px 22px 40px", border:"1px solid "+C.border }}>
        <div style={{ width:40, height:4, borderRadius:2, background:C.border, margin:"0 auto 20px" }}/>
        <div style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:4 }}>Share Stats Sheet</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>{title}</div>
        <textarea readOnly value={text} style={{ width:"100%", height:160, background:C.card, border:"1.5px solid "+C.border, borderRadius:12, color:C.textSoft, fontSize:11, fontFamily:"monospace", padding:12, boxSizing:"border-box", resize:"none", outline:"none", lineHeight:1.6 }}/>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:14 }}>
          <a href={"sms:?body="+encodeURIComponent(text)} style={{ textDecoration:"none" }}>
            <div style={{ width:"100%", padding:"16px", borderRadius:14, background:C.green, display:"flex", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer", boxSizing:"border-box" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span style={{ fontSize:15, fontWeight:800, color:C.bg }}>Send via Messages</span>
            </div>
          </a>
          <button onClick={copy} style={{ width:"100%", padding:"16px", borderRadius:14, background:copied?C.green:C.blue, border:"none", color:copied?C.bg:C.text, fontSize:15, fontWeight:800, cursor:"pointer", transition:"background 0.2s" }}>
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
          <button onClick={onClose} style={{ width:"100%", padding:"14px", borderRadius:14, background:"transparent", border:"1.5px solid "+C.border, color:C.muted, fontSize:15, fontWeight:700, cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SPLASH
// ══════════════════════════════════════════════════════════════════════════════
function SplashScreen({ onDone }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    setTimeout(() => setVis(true), 80);
    setTimeout(() => setVis(false), 1900);
    setTimeout(onDone, 2400);
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, background:C.bg, zIndex:999, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, transition:"opacity 0.5s", opacity:vis?1:0 }}>
      <div style={{ width:96, height:96, borderRadius:28, background:C.accent, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 60px "+C.accentGlow, transform:vis?"scale(1)":"scale(0.8)", transition:"transform 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <AFLBall size={58} color={C.bg}/>
      </div>
      <div style={{ textAlign:"center" }}>
        <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCMRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAABFagAwAEAAAAAQAAAQ8AAAAA/8AAEQgBDwRWAwERAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAQEBAQEBAgEBAgMCAgIDBQMDAwMFBgUFBQUFBgcGBgYGBgYHBwcHBwcHBwgICAgICAoKCgoKCwsLCwsLCwsLC//bAEMBAgICAwMDBQMDBQwIBggMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/dAAQAi//aAAwDAQACEQMRAD8A/wA/+gAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//Q/wA/+gAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//R/wA/+gAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//S/wA/+gAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//T/wA/+gAoAKACgAoAKALSWV5IoeOF2U9CAaAHf2df/wDP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Xd70Afjx/wAFFv8Ag8W8EXPhHUPhv/wTx8N3TahfQtCviTXVEYtyRtJitVzubHKsXx6qaAP4H/iV8QfFvxX8d6p8SPHuoz6trWtXDXV7eXDbpJZX5ZmOB+AAwBgCgDh6ACgAoAKACgAoAKACgAoAKACgAoAKACgAoAki2+YN5IHqKAP6GP8Ag3X/AOCmP7NH/BMf9p3xT8Wf2nX1VNJ1fSBZW/8AZFuLiQyAscMpdMLyOc0Af2BeN/8Ag8B/4JWweDdUm8CReLbvWhayfY4bjTVjjeXB2h389sDPU4oA/wAyb4o/ErxV8XviNrnxS8dXRvtX8Q3st/ezv955ZmLOx9yTmgDz1/vZzmgBlABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQB//1v8AP/oAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoA//1/8AP/oAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoA//0P8AP/oAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoA//2Q==" alt="Planett" style={{ width:220, display:"block", margin:"0 auto" }}/>
        <div style={{ fontSize:12, color:C.accent, letterSpacing:4, marginTop:8, fontWeight:700 }}>PlayerData: Aussie Rules</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"60px 28px 48px", background:"radial-gradient(ellipse at 50% 0%, "+C.accentGlow+" 0%, transparent 55%), "+C.bg }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:22 }}>
        <div style={{ width:110, height:110, borderRadius:32, background:C.accent, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 48px "+C.accentGlow }}>
          <AFLBall size={68} color={C.bg}/>
        </div>
        <div style={{ textAlign:"center" }}>
          <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCMRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAABFagAwAEAAAAAQAAAQ8AAAAA/8AAEQgBDwRWAwERAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAQEBAQEBAgEBAgMCAgIDBQMDAwMFBgUFBQUFBgcGBgYGBgYHBwcHBwcHBwgICAgICAoKCgoKCwsLCwsLCwsLC//bAEMBAgICAwMDBQMDBQwIBggMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/dAAQAi//aAAwDAQACEQMRAD8A/wA/+gAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//Q/wA/+gAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//R/wA/+gAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//S/wA/+gAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//T/wA/+gAoAKACgAoAKALSWV5IoeOF2U9CAaAHf2df/wDP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Xd70Afjx/wAFFv8Ag8W8EXPhHUPhv/wTx8N3TahfQtCviTXVEYtyRtJitVzubHKsXx6qaAP4H/iV8QfFvxX8d6p8SPHuoz6trWtXDXV7eXDbpJZX5ZmOB+AAwBgCgDh6ACgAoAKACgAoAKACgAoAKACgAoAKACgAoAki2+YN5IHqKAP6GP8Ag3X/AOCmP7NH/BMf9p3xT8Wf2nX1VNJ1fSBZW/8AZFuLiQyAscMpdMLyOc0Af2BeN/8Ag8B/4JWweDdUm8CReLbvWhayfY4bjTVjjeXB2h389sDPU4oA/wAyb4o/ErxV8XviNrnxS8dXRvtX8Q3st/ezv955ZmLOx9yTmgDz1/vZzmgBlABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQB//1v8AP/oAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoA//1/8AP/oAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoA//0P8AP/oAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoA//2Q==" alt="Planett" style={{ width:240, display:"block", margin:"0 auto" }}/>
          <div style={{ fontSize:13, color:C.accent, letterSpacing:4, marginTop:10, fontWeight:700 }}>PlayerData: Aussie Rules</div>
        </div>
        <div style={{ fontSize:14, color:C.muted, textAlign:"center", maxWidth:240, lineHeight:1.6 }}>The complete performance tracker for Australian Rules Football</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <button onClick={onLogin} style={{ width:"100%", padding:"18px", borderRadius:16, background:C.accent, border:"none", color:C.bg, fontSize:16, fontWeight:800, letterSpacing:1.5, cursor:"pointer", boxShadow:"0 4px 24px "+C.accentGlow }}>SIGN IN</button>
        <button onClick={onLogin} style={{ width:"100%", padding:"18px", borderRadius:16, background:"transparent", border:"1.5px solid "+C.border, color:C.textSoft, fontSize:16, fontWeight:800, letterSpacing:1.5, cursor:"pointer" }}>CREATE ACCOUNT</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HOME
// ══════════════════════════════════════════════════════════════════════════════
function HomeScreen({ player, fixtures, gameHistory, onNavigate }) {
  const nextFixture = fixtures.find(f => f.status === "upcoming");
  const wins = gameHistory.filter(g => g.result === "W").length;
  const losses = gameHistory.filter(g => g.result === "L").length;
  const hasGames = gameHistory.length > 0;
  const winRate = hasGames ? Math.round((wins / gameHistory.length) * 100) : 0;
  const latestRound = hasGames ? gameHistory[0].round : null;

  const tiles = [
    { id:"fixtures",     label:"Fixtures",      sub: nextFixture ? "Rd "+nextFixture.round+" upcoming" : "No upcoming games", color:C.blue,  badge: fixtures.filter(f=>f.status==="upcoming").length || null },
    { id:"eval",         label:"Start Game",    sub:"Record live stats",    color:C.green  },
    { id:"buildFixture", label:"Build Fixture", sub:"Create a new game",    color:C.orange },
    { id:"stats",        label:"Statistics",    sub:"AFL fantasy scoring",  color:C.accent },
  ];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflowY:"auto" }}>
      <div style={{ padding:"28px 22px 0" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
          <div>
            <div style={{ fontSize:13, color:C.muted }}>Good morning</div>
            <div style={{ fontSize:26, fontWeight:800, color:C.text, marginTop:2 }}>{player.name ? player.name.split(" ")[0] : "Athlete"}</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ width:42, height:42, borderRadius:13, background:C.card, border:"1.5px solid "+C.border, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", cursor:"pointer" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textSoft} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div onClick={() => onNavigate("profile")} style={{ width:42, height:42, borderRadius:13, background:C.accent, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:C.bg, fontSize:18, cursor:"pointer" }}>
              {player.name ? player.name[0].toUpperCase() : "?"}
            </div>
          </div>
        </div>

        {nextFixture ? (
          <div onClick={() => onNavigate("fixtures")} style={{ background:C.accent, borderRadius:20, padding:"18px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 8px 32px "+C.accentGlow, marginBottom:14, cursor:"pointer" }}>
            <div>
              <div style={{ fontSize:11, color:C.bg+"99", fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>Next &middot; {nextFixture.round}</div>
              <div style={{ fontSize:20, fontWeight:900, color:C.bg, marginTop:5 }}>{nextFixture.myTeam} vs {nextFixture.against}</div>
              <div style={{ fontSize:12, color:C.bg+"BB", marginTop:4 }}>{nextFixture.date}{nextFixture.time ? " \u00b7 "+nextFixture.time : ""}{nextFixture.location ? " \u00b7 "+nextFixture.location : ""}</div>
            </div>
            <AFLBall size={32} color={C.bg}/>
          </div>
        ) : (
          <div onClick={() => onNavigate("buildFixture")} style={{ background:C.card, border:"1.5px dashed "+C.border, borderRadius:20, padding:"18px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, cursor:"pointer" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.muted }}>No upcoming fixtures</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>Tap to build your first game</div>
            </div>
            <div style={{ fontSize:24, color:C.accent }}>+</div>
          </div>
        )}

        <div style={{ display:"flex", gap:10, marginBottom:22 }}>
          {[
            ["W"+wins+" L"+losses, "Record"],
            [hasGames ? winRate+"%" : "—", "Win Rate"],
            [latestRound ? "Rd "+latestRound : "—", "Season"],
          ].map(([val,lbl],i) => (
            <div key={i} style={{ flex:1, background:C.card, borderRadius:14, border:"1.5px solid "+C.border, padding:"13px 8px", textAlign:"center" }}>
              <div style={{ fontSize:17, fontWeight:900, color:i===1?C.accent:C.text }}>{val}</div>
              <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginTop:3 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, padding:"0 22px 28px" }}>
        {tiles.map(tile => (
          <div key={tile.id} onClick={() => onNavigate(tile.id)} style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, padding:"18px 16px", cursor:"pointer", display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ width:42, height:42, borderRadius:12, background:tile.color+"1A", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <AFLBall size={24} color={tile.color}/>
              </div>
              {tile.badge ? <div style={{ background:tile.color, color:tile.color===C.accent?C.bg:C.text, fontSize:11, fontWeight:900, minWidth:24, height:24, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 6px" }}>{tile.badge}</div> : null}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:C.text }}>{tile.label}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{tile.sub}</div>
            </div>
            <div style={{ width:28, height:3, borderRadius:3, background:tile.color }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EDIT / CREATE PLAYER
// ══════════════════════════════════════════════════════════════════════════════
function EditPlayerScreen({ player, onSave, onBack }) {
  const [form, setForm] = useState({ ...DEFAULT_PLAYER, ...player });
  const [openDrop, setOpenDrop] = useState(null);
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const posColor = AFL_POS_COLOR[form.position] || C.muted;
  const isNew = !player.name;
  const canSave = !!(form.name && form.number && form.position && form.club);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ padding:"22px 22px 16px", borderBottom:"1px solid "+C.border, flexShrink:0, display:"flex", alignItems:"center", gap:12 }}>
        <BackBtn onClick={onBack}/>
        <div>
          <div style={{ fontSize:20, fontWeight:900, color:C.text }}>{isNew ? "Create Player" : "Edit Player"}</div>
          <div style={{ fontSize:12, color:C.muted, marginTop:1 }}>Your profile details</div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"18px 22px 120px", display:"flex", flexDirection:"column", gap:14 }}>
        {/* Jersey preview */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}>
          <div style={{ width:80, height:80, borderRadius:22, background:form.position ? posColor+"22" : C.card, border:"2px solid "+(form.position ? posColor+"55" : C.border), display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            {form.number && <span style={{ fontSize:9, fontWeight:700, color:posColor||C.muted }}>NO.</span>}
            <span style={{ fontSize:form.number?28:18, fontWeight:900, color:posColor||C.muted, lineHeight:1 }}>{form.number||"?"}</span>
            {form.position && <span style={{ fontSize:9, fontWeight:700, color:posColor, marginTop:2 }}>{form.position}</span>}
          </div>
        </div>

        {/* Identity */}
        <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:18, padding:18 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Identity</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["Full Name","name","e.g. Bailey Turner"],["Jersey Number","number","e.g. 9"]].map(([lbl,key,ph]) => (
              <div key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:12, fontWeight:700, color:C.muted }}>{lbl}</label>
                <FocusInput value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph}/>
              </div>
            ))}
            <DropdownField label="Position" field="position" value={form.position} options={POSITIONS} openDrop={openDrop} setOpenDrop={setOpenDrop} onChange={v => set("position", v)}/>
            <DropdownField label="Gender"   field="gender"   value={form.gender}   options={GENDERS}   openDrop={openDrop} setOpenDrop={setOpenDrop} onChange={v => set("gender",   v)}/>
          </div>
        </div>

        {/* Club */}
        <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:18, padding:18 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Club & League</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["Club Name","club","e.g. Lions FC"],["League","league","e.g. NFNL"]].map(([lbl,key,ph]) => (
              <div key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:12, fontWeight:700, color:C.muted }}>{lbl}</label>
                <FocusInput value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph}/>
              </div>
            ))}
            <DropdownField label="Age Group" field="ageGroup" value={form.ageGroup} options={AGE_GROUPS} openDrop={openDrop} setOpenDrop={setOpenDrop} onChange={v => set("ageGroup", v)}/>
            <DropdownField label="Division"  field="division"  value={form.division}  options={DIVISIONS}  openDrop={openDrop} setOpenDrop={setOpenDrop} onChange={v => set("division",  v)}/>
          </div>
        </div>

        {/* Personal */}
        <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:18, padding:18 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Personal</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["Date of Birth","dob","e.g. 12 Mar 2007"],["Age","age","e.g. 18"]].map(([lbl,key,ph]) => (
              <div key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:12, fontWeight:700, color:C.muted }}>{lbl}</label>
                <FocusInput value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph}/>
              </div>
            ))}
          </div>
        </div>

        {!canSave && (
          <div style={{ background:C.orange+"14", border:"1.5px solid "+C.orange+"44", borderRadius:14, padding:"12px 16px", fontSize:12, color:C.orange, fontWeight:600 }}>
            Name, jersey number, position and club are required to save.
          </div>
        )}
      </div>

      <div style={{ position:"sticky", bottom:0, padding:"14px 22px 12px", background:"linear-gradient(to top, "+C.bg+" 70%, transparent)", flexShrink:0 }}>
        <button disabled={!canSave} onClick={() => onSave(form)} style={{ width:"100%", padding:"16px", borderRadius:14, background:canSave?C.accent:C.card, border:"1.5px solid "+(canSave?C.accent:C.border), color:canSave?C.bg:C.muted, fontSize:16, fontWeight:800, cursor:canSave?"pointer":"default", boxShadow:canSave?"0 4px 20px "+C.accentGlow:"none", transition:"all 0.2s" }}>
          {isNew ? "Create Player" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════════════════════
function MiniBar({ values, color=C.accent }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:32 }}>
      {values.map((v,i) => <div key={i} style={{ flex:1, borderRadius:3, background:i===0?color:color+"55", height:Math.max((v/max)*100,8)+"%" }}/>)}
    </div>
  );
}

function FPSparkline({ points }) {
  const max = Math.max(...points, 1);
  const w=200, h=48, pad=6;
  const xs = points.map((_,i) => pad+(i/(Math.max(points.length-1,1)))*(w-pad*2));
  const ys = points.map(v => h-pad-((v/max)*(h-pad*2)));
  const path = xs.map((x,i) => (i===0?"M":"L")+x+","+ys[i]).join(" ");
  const area = path+" L"+xs[xs.length-1]+","+h+" L"+xs[0]+","+h+" Z";
  return (
    <svg width="100%" height={h} viewBox={"0 0 "+w+" "+h} preserveAspectRatio="none">
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accent} stopOpacity="0.3"/><stop offset="100%" stopColor={C.accent} stopOpacity="0"/></linearGradient></defs>
      <path d={area} fill="url(#sg)"/>
      <path d={path} fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {points.length > 0 && <circle cx={xs[0]} cy={ys[0]} r="4" fill={C.accent}/>}
    </svg>
  );
}

function ScoreRing({ value, max, size=72, label, color=C.accent }) {
  const r = size/2-7, circ = 2*Math.PI*r, fill = Math.min(circ*(value/Math.max(max,1)),circ);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
      <div style={{ position:"relative", width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={5}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5} strokeDasharray={fill+" "+circ} strokeLinecap="round"/>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:size*0.24, fontWeight:900, color:C.text, lineHeight:1 }}>{value}</span>
          <span style={{ fontSize:size*0.13, color:C.muted, marginTop:1 }}>pts</span>
        </div>
      </div>
      <span style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:1 }}>{label}</span>
    </div>
  );
}

function ProfileScreen({ player, gameHistory, onEdit }) {
  const [tab, setTab] = useState("overview");
  const posColor = AFL_POS_COLOR[player.position] || C.muted;
  const hasGames = gameHistory.length > 0;

  const totals = gameHistory.reduce((acc,g) => {
    SCORING_MAP.forEach(s => { acc[s.key] = (acc[s.key]??0)+(g[s.key]??0); });
    return acc;
  }, {});
  const totalFP = hasGames ? calcFP(totals) : 0;
  const avgFP   = hasGames ? Math.round(totalFP / gameHistory.length) : 0;
  const lastFP  = hasGames ? calcFP(gameHistory[0]) : 0;
  const bestFP  = hasGames ? Math.max(...gameHistory.map(calcFP)) : 0;
  const fpHistory = hasGames ? [...gameHistory].reverse().map(calcFP) : [];

  if (!player.name) {
    return (
      <EmptyState
        icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
        title="No Player Created"
        sub="Set up your player profile to start tracking stats and performance."
        action="Create Player"
        onAction={onEdit}
      />
    );
  }

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Hero */}
      <div style={{ background:"linear-gradient(170deg, "+posColor+"22 0%, transparent 60%), "+C.surface, padding:"22px 22px 18px", borderBottom:"1px solid "+C.border, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:18, marginBottom:16 }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ width:72, height:72, borderRadius:20, background:posColor+"22", border:"2px solid "+posColor+"55", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:10, fontWeight:700, color:posColor }}>NO.</span>
              <span style={{ fontSize:26, fontWeight:900, color:posColor, lineHeight:1 }}>{player.number}</span>
            </div>
            <div style={{ position:"absolute", bottom:-8, left:"50%", transform:"translateX(-50%)", background:posColor, borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:900, color:posColor===C.accent?C.bg:C.text, letterSpacing:1, whiteSpace:"nowrap", border:"2px solid "+C.bg }}>{player.position}</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:22, fontWeight:900, color:C.text, lineHeight:1.1 }}>{player.name}</div>
            <div style={{ fontSize:13, color:C.muted, marginTop:6 }}>{player.club}</div>
            <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
              {player.ageGroup && <Badge label={player.ageGroup} color={C.blue}/>}
              {player.division && <Badge label={player.division} color={C.muted}/>}
            </div>
          </div>
          <button onClick={onEdit} style={{ width:36, height:36, borderRadius:10, background:C.card, border:"1.5px solid "+C.border, color:C.muted, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
        <div style={{ display:"flex", background:C.card, borderRadius:14, border:"1.5px solid "+C.border, overflow:"hidden" }}>
          {[{val:lastFP,lbl:"Last",color:C.orange},{val:avgFP,lbl:"Avg",color:C.accent},{val:bestFP,lbl:"Best",color:C.green},{val:totalFP,lbl:"Season",color:C.blue}].map((s,i) => (
            <div key={i} style={{ flex:1, padding:"11px 4px", textAlign:"center", borderRight:i<3?"1px solid "+C.border:"none" }}>
              <div style={{ fontSize:18, fontWeight:900, color:s.color, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginTop:3 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", background:C.surface, borderBottom:"1px solid "+C.border, flexShrink:0 }}>
        {[["overview","Overview"],["games","Game Log"],["stats","Season Stats"]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex:1, padding:"13px 0", background:"none", border:"none", fontSize:13, fontWeight:700, cursor:"pointer", color:tab===id?C.accent:C.muted, borderBottom:"2px solid "+(tab===id?C.accent:"transparent") }}>{label}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"18px 22px 28px" }}>
        {tab==="overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, padding:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:800 }}>Fantasy Points Trend</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{hasGames ? gameHistory.length+" games" : "No games yet"}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:22, fontWeight:900, color:C.accent }}>{avgFP}</div>
                  <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:1 }}>avg / game</div>
                </div>
              </div>
              {hasGames ? <FPSparkline points={fpHistory}/> : <div style={{ height:48, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, fontSize:13 }}>Record your first game to see trends</div>}
            </div>

            {hasGames && (
              <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, padding:18 }}>
                <div style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>Key Stats by Game</div>
                {[{key:"goals",label:"Goals",color:C.accent},{key:"kicks",label:"Kicks",color:C.blue},{key:"marks",label:"Marks",color:C.orange},{key:"tackles",label:"Tackles",color:C.green}].map(({ key, label, color }) => {
                  const vals = [...gameHistory].reverse().map(g => g[key]??0);
                  const avg = (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);
                  return (
                    <div key={key} style={{ marginBottom:14 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:C.textSoft }}>{label}</span>
                        <span style={{ fontSize:12, fontWeight:800, color }}>avg {avg}</span>
                      </div>
                      <MiniBar values={vals} color={color}/>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, overflow:"hidden" }}>
              <div style={{ padding:"14px 18px", borderBottom:"1px solid "+C.border, fontSize:11, fontWeight:700, color:C.muted, letterSpacing:2, textTransform:"uppercase" }}>Player Details</div>
              {[["Date of Birth",player.dob],["Age",player.age?(player.age+" years"):""],["Gender",player.gender],["Jersey","#"+player.number],["Position",player.position],["Club",player.club],["League",player.league],["Age Group",player.ageGroup],["Division",player.division]].filter(([,v])=>v).map(([k,v],i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 18px", borderTop:i>0?"1px solid "+C.border:"none" }}>
                  <span style={{ fontSize:13, color:C.muted }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="games" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {!hasGames && (
              <div style={{ textAlign:"center", padding:"40px 20px" }}>
                <AFLBall size={40} color={C.border}/>
                <div style={{ marginTop:16, fontSize:15, fontWeight:700, color:C.textSoft }}>No games recorded yet</div>
                <div style={{ marginTop:6, fontSize:13, color:C.muted }}>Use the Eval tab to record live stats</div>
              </div>
            )}
            {gameHistory.map((g,i) => {
              const fp = calcFP(g);
              return (
                <div key={i} style={{ background:i===0?C.cardAlt:C.card, border:"1.5px solid "+(i===0?C.accent+"44":C.border), borderRadius:18, padding:"16px 18px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <div style={{ background:C.muted+"18", borderRadius:7, padding:"3px 10px", fontSize:11, fontWeight:700, color:C.muted }}>{g.round||"Game "+(gameHistory.length-i)}</div>
                      {g.result && <span style={{ fontSize:12, fontWeight:800, color:g.result==="W"?C.green:C.red }}>{g.result==="W"?"WIN":"LOSS"}</span>}
                      {i===0 && <span style={{ fontSize:10, color:C.accent, fontWeight:700 }}>LATEST</span>}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:20, fontWeight:900, color:fp>=avgFP?C.accent:C.textSoft, lineHeight:1 }}>{fp}</div>
                      <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:1 }}>FP</div>
                    </div>
                  </div>
                  {g.opp && <div style={{ fontSize:13, color:C.muted, marginBottom:10 }}>vs {g.opp}</div>}
                  <div style={{ display:"flex", background:C.bg+"88", borderRadius:10, overflow:"hidden" }}>
                    {[["G",g.goals??0,C.accent],["K",g.kicks??0,C.blue],["HB",g.handballs??0,C.blue],["M",g.marks??0,C.orange],["T",g.tackles??0,C.green],["FA",g.freesAgainst??0,C.red]].map(([lbl,val,col],j) => (
                      <div key={j} style={{ flex:1, padding:"8px 4px", textAlign:"center", borderRight:j<5?"1px solid "+C.border:"none" }}>
                        <div style={{ fontSize:14, fontWeight:900, color:lbl==="FA"&&val>0?C.red:val>0?col:C.muted }}>{val}</div>
                        <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", marginTop:2 }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="stats" && (
          <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 52px 52px 52px 52px", padding:"12px 16px", background:C.cardAlt, borderBottom:"1px solid "+C.border }}>
              {[["Stat",C.muted,"left"],["Pts",C.muted,"center"],["Total",C.accent,"center"],["Avg",C.blue,"center"],["FP",C.orange,"center"]].map(([h,c,a],i) => (
                <span key={i} style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:c, textAlign:a }}>{h}</span>
              ))}
            </div>
            {!hasGames && (
              <div style={{ padding:"24px 18px", textAlign:"center", color:C.muted, fontSize:13 }}>No game data yet. Record your first game using the Eval tab.</div>
            )}
            {SCORING_MAP.map((s,i) => {
              const tot = totals[s.key]??0;
              const avg = hasGames ? (tot/gameHistory.length).toFixed(1) : "0.0";
              const fp  = tot*s.pts;
              const neg = s.pts<0;
              return (
                <div key={s.key} style={{ display:"grid", gridTemplateColumns:"1fr 52px 52px 52px 52px", padding:"13px 16px", borderTop:i>0?"1px solid "+C.border:"none", alignItems:"center", background:neg?C.red+"08":i%2===0?"transparent":C.bg+"44" }}>
                  <span style={{ fontSize:13, fontWeight:600, color:neg?C.red:C.textSoft }}>{s.label}</span>
                  <span style={{ textAlign:"center", fontSize:11, fontWeight:800, color:neg?C.red:C.green, background:(neg?C.red:C.green)+"18", padding:"2px 0", borderRadius:5 }}>{s.pts>0?"+"+s.pts:s.pts}</span>
                  <span style={{ textAlign:"center", fontSize:15, fontWeight:900, color:C.textSoft }}>{tot}</span>
                  <span style={{ textAlign:"center", fontSize:15, fontWeight:900, color:C.blue }}>{avg}</span>
                  <span style={{ textAlign:"center", fontSize:15, fontWeight:900, color:neg&&fp!==0?C.red:C.orange }}>{fp>0?"+"+fp:fp}</span>
                </div>
              );
            })}
            {hasGames && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 52px 52px 52px 52px", padding:"14px 16px", background:C.accent+"12", borderTop:"2px solid "+C.accent+"33", alignItems:"center" }}>
                <span style={{ fontSize:13, fontWeight:800, color:C.accent }}>TOTAL FP</span>
                <span/><span/>
                <span style={{ textAlign:"center", fontSize:16, fontWeight:900, color:C.blue }}>{avgFP}</span>
                <span style={{ textAlign:"center", fontSize:16, fontWeight:900, color:C.accent }}>{totalFP}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GAME EVALUATION
// ══════════════════════════════════════════════════════════════════════════════
function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [quarter, setQuarter] = useState(1);
  const [quarterStarted, setQuarterStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (running) { ref.current = setInterval(() => setSeconds(s => s+1), 1000); }
    else { clearInterval(ref.current); }
    return () => clearInterval(ref.current);
  }, [running]);
  const fmt = s => String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
  return {
    fmt: fmt(seconds), quarter, running, quarterStarted,
    startQuarter: () => { setSeconds(0); setRunning(true); setQuarterStarted(true); },
    endQuarter:   () => { setRunning(false); setQuarterStarted(false); if (quarter<4) setQuarter(q=>q+1); },
    reset:        () => { setSeconds(0); setRunning(false); setQuarter(1); setQuarterStarted(false); },
  };
}

function EvalScreen({ player, fixtures, onGameSaved }) {
  const emptyStats = () => Object.fromEntries(SCORING_MAP.map(s => [s.key, 0]));
  const [stats, setStats] = useState(emptyStats);
  const [gameOver, setGameOver] = useState(false);
  const [flash, setFlash] = useState(null);
  const [shareModal, setShareModal] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [openDrop, setOpenDrop] = useState(null);
  const timer = useTimer();

  const upcomingFixtures = fixtures.filter(f => f.status === "upcoming");
  const posColor = player.name ? (AFL_POS_COLOR[player.position] || C.muted) : C.muted;
  const fp = SCORING_MAP.reduce((sum,s) => sum + stats[s.key]*s.pts, 0);
  const aflScore = stats.goals+"."+stats.behinds;
  const matchLabel = selectedFixture ? selectedFixture.myTeam+" vs "+selectedFixture.against : (player.club ? player.club+" vs Opposition" : "My Team vs Opposition");
  const roundLabel = selectedFixture ? selectedFixture.round : "Unlinked Game";

  const showFlash = (msg, color=C.accent) => { setFlash({msg,color}); setTimeout(() => setFlash(null), 1400); };
  const increment = key => { const s=SCORING_MAP.find(x=>x.key===key); setStats(p=>({...p,[key]:p[key]+1})); showFlash((s.pts>0?"+":"")+s.pts+" pts", s.pts<0?C.red:s.pts>=4?C.accent:C.green); };
  const decrement = key => setStats(p=>({...p,[key]:Math.max(0,p[key]-1)}));

  const buildText = () => [
    "Planett - Aussie Rules Player Data",
    "--------------------",
    "Player: "+(player.name||"Unknown")+" (#"+(player.number||"?")+" - "+(player.position||"?")+")",
    "Match:  "+matchLabel,
    "Round:  "+roundLabel,
    "--------------------",
    ...SCORING_MAP.map(s => {
      const c=stats[s.key]; if(!c) return null;
      return s.label.padEnd(14)+" "+String(c).padStart(2)+"x  "+(c*s.pts>0?"+":(c*s.pts===0?"":""))+c*s.pts+" pts";
    }).filter(Boolean),
    "--------------------",
    "Fantasy Points: "+fp+" FP",
    "Points Scored:  "+aflScore,
    "",
    "Recorded via Planett",
  ].join("\n");

  const handleSaveGame = (result) => {
    const gameRecord = {
      ...stats,
      round: roundLabel,
      opp: selectedFixture ? selectedFixture.against : "",
      result,
      date: new Date().toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"}),
    };
    onGameSaved(gameRecord, selectedFixture?.id);
    setGameOver(true);
  };

  if (!player.name) {
    return (
      <EmptyState
        icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
        title="No Player Created"
        sub="Create your player profile first before recording stats."
      />
    );
  }

  if (gameOver) {
    return (
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:C.accent, padding:"28px 22px 22px", textAlign:"center", flexShrink:0 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.bg+"99", letterSpacing:2, textTransform:"uppercase" }}>Full Time &middot; {roundLabel}</div>
          <div style={{ fontSize:26, fontWeight:900, color:C.bg, marginTop:6 }}>{player.name}</div>
          <div style={{ fontSize:13, color:C.bg+"BB", marginTop:3 }}>{matchLabel}</div>
          <div style={{ marginTop:14, fontSize:52, fontWeight:900, color:C.bg, lineHeight:1 }}>{fp}</div>
          <div style={{ fontSize:13, fontWeight:700, color:C.bg+"88", marginTop:4, letterSpacing:1 }}>FANTASY POINTS</div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"20px 22px 28px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Game Breakdown</div>
          <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, overflow:"hidden" }}>
            {SCORING_MAP.map((s,i) => {
              const count=stats[s.key], contrib=count*s.pts;
              if(!count) return null;
              return (
                <div key={s.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderTop:i>0?"1px solid "+C.border:"none", background:s.pts<0?C.red+"08":"transparent" }}>
                  <span style={{ fontSize:14, fontWeight:600, color:s.pts<0?C.red:C.textSoft }}>{s.label}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <span style={{ fontSize:14, color:C.muted }}>{count}&times;</span>
                    <span style={{ fontSize:16, fontWeight:900, color:s.pts<0?C.red:C.accent, minWidth:48, textAlign:"right" }}>{contrib>0?"+"+contrib:contrib}</span>
                  </div>
                </div>
              );
            })}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", background:C.accent+"12", borderTop:"2px solid "+C.accent+"33" }}>
              <span style={{ fontSize:14, fontWeight:800, color:C.accent }}>TOTAL</span>
              <span style={{ fontSize:22, fontWeight:900, color:C.accent }}>{fp} FP</span>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:20 }}>
            <button onClick={() => setShareModal(true)} style={{ width:"100%", padding:"16px", borderRadius:14, background:C.blue, border:"none", color:C.text, fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              Share Stats Sheet
            </button>
            <button onClick={() => { setGameOver(false); setStats(emptyStats()); setSelectedFixture(null); timer.reset(); }} style={{ width:"100%", padding:"16px", borderRadius:14, background:C.accent, border:"none", color:C.bg, fontSize:15, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 20px "+C.accentGlow }}>New Game</button>
          </div>
        </div>
        {flash && <div style={{ position:"fixed", top:"45%", left:"50%", transform:"translate(-50%,-50%)", background:flash.color, borderRadius:16, padding:"14px 28px", fontSize:28, fontWeight:900, color:C.bg, pointerEvents:"none", zIndex:998 }}>{flash.msg}</div>}
        {shareModal && <ShareModal text={buildText()} title={player.name+" - "+roundLabel} onClose={() => setShareModal(false)}/>}
      </div>
    );
  }

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Match header */}
      <div style={{ background:C.surface, borderBottom:"1px solid "+C.border, padding:"14px 22px 12px", flexShrink:0 }}>
        {upcomingFixtures.length > 0 && (
          <div style={{ marginBottom:10 }}>
            <DropdownField label={null} field="fixture" value={selectedFixture ? selectedFixture.round+" - "+selectedFixture.against : null} options={upcomingFixtures.map(f => f.round+" - "+f.against)} openDrop={openDrop} setOpenDrop={setOpenDrop}
              onChange={v => { const f = upcomingFixtures.find(f2 => (f2.round+" - "+f2.against)===v); setSelectedFixture(f||null); }}/>
          </div>
        )}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <div>
            <div style={{ fontSize:11, color:C.muted, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>{roundLabel}</div>
            <div style={{ fontSize:14, fontWeight:800, color:C.text, marginTop:2 }}>{matchLabel}</div>
          </div>
          <AFLBall size={26} color={posColor}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:C.card, borderRadius:12, padding:"9px 12px", border:"1.5px solid "+C.border }}>
          <div style={{ display:"flex", gap:5 }}>
            {[1,2,3,4].map(q => (
              <div key={q} style={{ width:26, height:22, borderRadius:6, background:timer.quarter>q?C.accent:timer.quarter===q&&timer.quarterStarted?C.accent+"44":C.border, border:timer.quarter===q?"1.5px solid "+C.accent:"none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:timer.quarter>q?C.bg:timer.quarter===q?C.accent:C.muted }}>Q{q}</div>
            ))}
          </div>
          <div style={{ fontSize:20, fontWeight:900, color:C.text }}>{timer.fmt}</div>
          <div style={{ display:"flex", gap:6 }}>
            {!timer.quarterStarted
              ? <button onClick={timer.startQuarter} style={{ padding:"6px 14px", borderRadius:8, background:C.accent+"22", border:"1px solid "+C.accent+"44", color:C.accent, fontSize:12, fontWeight:700, cursor:"pointer" }}>&#9654; {timer.quarter===1?"Start Q1":"Start Q"+timer.quarter}</button>
              : <button onClick={timer.endQuarter}   style={{ padding:"6px 14px", borderRadius:8, background:C.orange+"22", border:"1px solid "+C.orange+"44", color:C.orange, fontSize:12, fontWeight:700, cursor:"pointer" }}>&#9632; End Q{timer.quarter}</button>
            }
            <button onClick={() => handleSaveGame(null)} style={{ padding:"6px 10px", borderRadius:8, background:C.muted+"18", border:"1px solid "+C.border, color:C.muted, fontSize:12, fontWeight:700, cursor:"pointer" }}>FT</button>
          </div>
        </div>
      </div>

      {/* Player card */}
      <div style={{ padding:"12px 22px 0", flexShrink:0 }}>
        <div style={{ background:C.card, border:"1.5px solid "+posColor+"33", borderRadius:16, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:posColor+"1A", border:"1.5px solid "+posColor+"44", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:8, color:posColor, fontWeight:700 }}>NO.</span>
              <span style={{ fontSize:18, fontWeight:900, color:posColor, lineHeight:1 }}>{player.number}</span>
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:800 }}>{player.name}</div>
              <Badge label={player.position} color={posColor}/>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:32, fontWeight:900, color:fp>0?C.accent:C.muted, lineHeight:1 }}>{fp}</div>
            <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginTop:1 }}>Fantasy Pts</div>
            <div style={{ marginTop:4, paddingTop:4, borderTop:"1px solid "+C.border }}>
              <div style={{ fontSize:16, fontWeight:900, color:C.muted, lineHeight:1 }}>{aflScore}</div>
              <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginTop:1 }}>Pts Scored</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat buttons */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 22px 24px", display:"flex", flexDirection:"column", gap:7 }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:2 }}>Record Stats</div>
        {SCORING_MAP.map(s => {
          const count=stats[s.key], neg=s.pts<0, ac=neg?C.red:C.accent;
          return (
            <div key={s.key} style={{ display:"flex", alignItems:"center", background:count>0?ac+"10":C.card, border:"1.5px solid "+(count>0?ac+"44":C.border), borderRadius:13, padding:"3px 5px 3px 14px", transition:"all 0.12s" }}>
              <div style={{ flex:1 }}>
                <span style={{ fontSize:14, fontWeight:700, color:count>0?(neg?C.red:C.text):C.textSoft }}>{s.label}</span>
                <span style={{ fontSize:11, fontWeight:700, color:neg?C.red:C.muted, marginLeft:7 }}>{s.pts>0?"+"+s.pts:s.pts} pts</span>
              </div>
              <button onClick={() => decrement(s.key)} disabled={count===0} style={{ width:34, height:34, borderRadius:9, background:count>0?C.cardAlt:"transparent", border:"1.5px solid "+(count>0?C.border:"transparent"), color:count>0?C.textSoft:C.border, fontSize:20, fontWeight:300, cursor:count>0?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>&minus;</button>
              <div style={{ width:38, textAlign:"center", fontSize:20, fontWeight:900, color:count>0?ac:C.muted, flexShrink:0 }}>{count}</div>
              <button onClick={() => increment(s.key)} style={{ width:42, height:42, borderRadius:11, background:ac, border:"none", color:neg?C.text:C.bg, fontSize:22, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>+</button>
            </div>
          );
        })}
      </div>
      {flash && <div style={{ position:"fixed", top:"45%", left:"50%", transform:"translate(-50%,-50%)", background:flash.color, borderRadius:16, padding:"14px 28px", fontSize:28, fontWeight:900, color:C.bg, pointerEvents:"none", zIndex:999 }}>{flash.msg}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GAME DETAIL
// ══════════════════════════════════════════════════════════════════════════════
function GameDetailScreen({ fixture, gameHistory, player, onBack }) {
  const [shareModal, setShareModal] = useState(false);
  // Find recorded game matching this fixture
  const game = gameHistory.find(g => g.fixtureId === fixture.id) || null;
  const fp = game ? calcFP(game) : null;
  const posColor = AFL_POS_COLOR[player.position] || C.muted;
  const myPts = (fixture.goalsA??0)*6+(fixture.behA??0);
  const oppPts = (fixture.goalsB??0)*6+(fixture.behB??0);
  const win = myPts > oppPts;

  const buildText = () => !game ? "" : [
    "Planett - Aussie Rules Player Data",
    "--------------------",
    "Player: "+player.name+" (#"+player.number+" - "+player.position+")",
    "Match:  "+fixture.myTeam+" vs "+fixture.against,
    "Round:  "+fixture.round+" - "+fixture.date,
    "--------------------",
    ...SCORING_MAP.map(s => {
      const c=game[s.key]??0; if(!c) return null;
      return s.label.padEnd(14)+" "+String(c).padStart(2)+"x  "+(c*s.pts>0?"+":(c*s.pts===0?"":""))+c*s.pts+" pts";
    }).filter(Boolean),
    "--------------------",
    "Fantasy Points: "+fp+" FP",
    "",
    "Recorded via Planett",
  ].join("\n");

  return (
    <>
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"22px 22px 16px", borderBottom:"1px solid "+C.border, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
            <BackBtn onClick={onBack}/>
            <div>
              <div style={{ fontSize:20, fontWeight:900, color:C.text }}>{fixture.round}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:1 }}>{fixture.date}{fixture.location ? " \u00b7 "+fixture.location : ""}</div>
            </div>
          </div>

          {/* Score card */}
          {(fixture.goalsA != null) ? (
            <div style={{ background:win?C.green+"14":C.red+"14", border:"1.5px solid "+(win?C.green+"44":C.red+"44"), borderRadius:20, padding:"16px 18px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <span style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:win?C.green:C.red }}>{win?"WIN":"LOSS"}</span>
                <span style={{ fontSize:12, color:C.muted }}>{fixture.date}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:800, color:C.text }}>{fixture.myTeam}</div>
                  <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>{fixture.goalsA}.{fixture.behA}</div>
                  <div style={{ fontSize:32, fontWeight:900, color:win?C.accent:C.text, lineHeight:1 }}>{myPts}</div>
                </div>
                <div style={{ textAlign:"center" }}><AFLBall size={28} color={C.muted}/><div style={{ fontSize:10, color:C.muted, marginTop:4, letterSpacing:2 }}>FINAL</div></div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:16, fontWeight:800, color:C.text }}>{fixture.against}</div>
                  <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>{fixture.goalsB}.{fixture.behB}</div>
                  <div style={{ fontSize:32, fontWeight:900, color:!win?C.accent:C.muted, lineHeight:1 }}>{oppPts}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, padding:"16px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:C.text }}>{fixture.myTeam} vs {fixture.against}</div>
                <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>Score not recorded</div>
              </div>
              <AFLBall size={28} color={C.muted}/>
            </div>
          )}
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"18px 22px 28px" }}>
          {game && player.name ? (
            <>
              <div style={{ background:C.card, border:"1.5px solid "+posColor+"33", borderRadius:20, padding:"16px 18px", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:46, height:46, borderRadius:12, background:posColor+"1A", border:"1.5px solid "+posColor+"44", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:8, color:posColor, fontWeight:700 }}>NO.</span>
                    <span style={{ fontSize:19, fontWeight:900, color:posColor, lineHeight:1 }}>{player.number}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:16, fontWeight:800, color:C.text }}>{player.name}</div>
                    <Badge label={player.position} color={posColor}/>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:34, fontWeight:900, color:C.accent, lineHeight:1 }}>{fp}</div>
                  <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginTop:2 }}>Fantasy Pts</div>
                  <div style={{ fontSize:14, fontWeight:900, color:C.muted, marginTop:4 }}>{game.goals??0}.{game.behinds??0}</div>
                  <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:1 }}>Pts Scored</div>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display:"flex", background:C.card, borderRadius:16, border:"1.5px solid "+C.border, overflow:"hidden", marginBottom:14 }}>
                {[["G",game.goals??0,C.accent],["K",game.kicks??0,C.blue],["HB",game.handballs??0,C.blue],["M",game.marks??0,C.orange],["T",game.tackles??0,C.green],["FA",game.freesAgainst??0,C.red]].map(([lbl,val,col],i) => (
                  <div key={i} style={{ flex:1, padding:"12px 4px", textAlign:"center", borderRight:i<5?"1px solid "+C.border:"none" }}>
                    <div style={{ fontSize:18, fontWeight:900, color:lbl==="FA"&&val>0?C.red:val>0?col:C.muted }}>{val}</div>
                    <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", marginTop:3 }}>{lbl}</div>
                  </div>
                ))}
              </div>

              {/* Full breakdown */}
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Full Breakdown</div>
              <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, overflow:"hidden" }}>
                {SCORING_MAP.map((s,i) => {
                  const count=game[s.key]??0, contrib=count*s.pts, neg=s.pts<0;
                  return (
                    <div key={s.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 18px", borderTop:i>0?"1px solid "+C.border:"none", background:neg&&count>0?C.red+"08":"transparent" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:11, fontWeight:800, color:neg?C.red:C.green, background:(neg?C.red:C.green)+"18", padding:"2px 7px", borderRadius:5 }}>{s.pts>0?"+"+s.pts:s.pts}</span>
                        <span style={{ fontSize:14, fontWeight:600, color:neg?C.red:C.textSoft }}>{s.label}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                        <span style={{ fontSize:14, color:C.muted }}>{count}&times;</span>
                        <span style={{ fontSize:16, fontWeight:900, color:neg&&contrib!==0?C.red:contrib>0?C.accent:C.muted, minWidth:44, textAlign:"right" }}>{contrib>0?"+"+contrib:contrib}</span>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", background:C.accent+"12", borderTop:"2px solid "+C.accent+"33" }}>
                  <span style={{ fontSize:14, fontWeight:800, color:C.accent }}>TOTAL</span>
                  <span style={{ fontSize:22, fontWeight:900, color:C.accent }}>{fp} FP</span>
                </div>
              </div>

              <button onClick={() => setShareModal(true)} style={{ width:"100%", padding:"16px", marginTop:16, borderRadius:14, background:C.blue, border:"none", color:C.text, fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                Share Stats Sheet
              </button>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"32px 20px", color:C.muted }}>
              <AFLBall size={36} color={C.border}/>
              <div style={{ marginTop:14, fontSize:14, fontWeight:700, color:C.textSoft }}>No stats recorded for this game</div>
              <div style={{ marginTop:6, fontSize:12 }}>Use the Eval tab to record live stats during the match</div>
            </div>
          )}
        </div>
      </div>
      {shareModal && <ShareModal text={buildText()} title={player.name+" - "+fixture.round} onClose={() => setShareModal(false)}/>}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FIXTURES
// ══════════════════════════════════════════════════════════════════════════════
function FixturesScreen({ fixtures, gameHistory, player, onBuildFixture }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return <GameDetailScreen fixture={selected} gameHistory={gameHistory} player={player} onBack={() => setSelected(null)}/>;
  }

  const upcoming  = fixtures.filter(f => f.status === "upcoming");
  const completed = fixtures.filter(f => f.status === "completed");

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ padding:"22px 22px 16px", borderBottom:"1px solid "+C.border, flexShrink:0 }}>
        <div style={{ fontSize:22, fontWeight:900, color:C.text }}>Fixtures</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Your games this season</div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"16px 22px 28px", display:"flex", flexDirection:"column", gap:10 }}>
        <button onClick={onBuildFixture} style={{ width:"100%", padding:"17px", borderRadius:16, background:C.accent, border:"none", color:C.bg, fontSize:15, fontWeight:800, letterSpacing:1, cursor:"pointer", boxShadow:"0 4px 20px "+C.accentGlow }}>+ Add New Game</button>

        {fixtures.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 20px" }}>
            <AFLBall size={40} color={C.border}/>
            <div style={{ marginTop:16, fontSize:15, fontWeight:700, color:C.textSoft }}>No fixtures yet</div>
            <div style={{ marginTop:6, fontSize:13, color:C.muted }}>Tap "Add New Game" to build your first fixture</div>
          </div>
        )}

        {upcoming.length > 0 && (
          <>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:2 }}>Upcoming</div>
            {upcoming.map((f,i) => (
              <div key={i} style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, padding:18 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ background:C.accent+"1A", border:"1px solid "+C.accent+"33", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:700, color:C.accent, textTransform:"uppercase" }}>{f.round}</div>
                  <span style={{ fontSize:12, color:C.muted }}>{f.date}{f.time?" \u00b7 "+f.time:""}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div><div style={{ fontSize:18, fontWeight:800, color:C.text }}>{f.myTeam}</div><div style={{ fontSize:11, color:C.accent, marginTop:4, fontWeight:600 }}>HOME</div></div>
                  <div style={{ textAlign:"center" }}><AFLBall size={28} color={C.muted}/><div style={{ fontSize:10, color:C.muted, marginTop:3, letterSpacing:2 }}>VS</div></div>
                  <div style={{ textAlign:"right" }}><div style={{ fontSize:18, fontWeight:800, color:C.text }}>{f.against}</div><div style={{ fontSize:11, color:C.muted, marginTop:4, fontWeight:600 }}>AWAY</div></div>
                </div>
                {f.location && <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid "+C.border, fontSize:12, color:C.muted }}>{f.location}</div>}
              </div>
            ))}
          </>
        )}

        {completed.length > 0 && (
          <>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginTop:6, marginBottom:2 }}>Results</div>
            {completed.map((f,i) => {
              const myPts=(f.goalsA??0)*6+(f.behA??0), oppPts=(f.goalsB??0)*6+(f.behB??0), win=myPts>oppPts;
              const hasScore = f.goalsA != null;
              return (
                <div key={i} onClick={() => setSelected(f)} style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, padding:18, cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <div style={{ background:C.muted+"18", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase" }}>{f.round}</div>
                      {hasScore && <span style={{ fontSize:12, fontWeight:800, color:win?C.green:C.red }}>{win?"WIN":"LOSS"}</span>}
                    </div>
                    <span style={{ fontSize:12, color:C.muted }}>{f.date}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontSize:16, fontWeight:800, color:C.text }}>{f.myTeam}</div>
                      {hasScore && <><div style={{ fontSize:13, color:C.muted, marginTop:3 }}>{f.goalsA}.{f.behA}</div><div style={{ fontSize:26, fontWeight:900, color:win?C.accent:C.text, lineHeight:1 }}>{myPts}</div></>}
                    </div>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:11, color:C.muted, letterSpacing:2 }}>FINAL</div></div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:16, fontWeight:800, color:C.text }}>{f.against}</div>
                      {hasScore && <><div style={{ fontSize:13, color:C.muted, marginTop:3 }}>{f.goalsB}.{f.behB}</div><div style={{ fontSize:26, fontWeight:900, color:!win?C.accent:C.muted, lineHeight:1 }}>{oppPts}</div></>}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BUILD FIXTURE
// ══════════════════════════════════════════════════════════════════════════════
function BuildFixtureScreen({ player, squadPlayers, onSave, onBack }) {
  const STEPS = ["Details","Players","Review"];
  const [step, setStep]       = useState(0);
  const [done, setDone]       = useState(false);
  const [form, setForm]       = useState({ myTeam: player.club||"", opposition:"", date:"", time:"", round:"", location:"" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch]   = useState("");
  const [openDrop, setOpenDrop] = useState(null);

  const canNext = () => {
    if (step===0) return !!(form.myTeam && form.opposition && form.round);
    if (step===1) return true; // players optional
    return true;
  };

  const toggle = id => setSelectedIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);
  const filtered = squadPlayers.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.position.toLowerCase().includes(search.toLowerCase()));

  const groups = [
    { label:"Forwards",    positions:["FF","CHF","HFF"] },
    { label:"Midfielders", positions:["C","W","RK","RR"] },
    { label:"Defenders",   positions:["HBF","CHB","FB"] },
    { label:"Interchange", positions:["INT"] },
  ];

  if (done) {
    return (
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 32px", gap:24, textAlign:"center" }}>
        <div style={{ width:80, height:80, borderRadius:24, background:C.accent, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 48px "+C.accentGlow }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <div style={{ fontSize:24, fontWeight:900, color:C.text }}>Fixture Created!</div>
          <div style={{ fontSize:14, color:C.muted, marginTop:8, lineHeight:1.6 }}>{form.myTeam} vs {form.opposition}<br/>{form.round}{form.location?" \u00b7 "+form.location:""}</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, width:"100%" }}>
          <button onClick={() => { setDone(false); setStep(0); setForm({myTeam:player.club||"",opposition:"",date:"",time:"",round:"",location:""}); setSelectedIds([]); }} style={{ width:"100%", padding:"16px", borderRadius:14, background:C.accent, border:"none", color:C.bg, fontSize:15, fontWeight:800, cursor:"pointer" }}>Build Another</button>
          <button onClick={onBack} style={{ width:"100%", padding:"16px", borderRadius:14, background:"transparent", border:"1.5px solid "+C.border, color:C.textSoft, fontSize:15, fontWeight:700, cursor:"pointer" }}>Back to Fixtures</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"18px 22px 16px", borderBottom:"1px solid "+C.border, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <BackBtn onClick={onBack}/>
          <div><div style={{ fontSize:20, fontWeight:900, color:C.text }}>Build Fixture</div><div style={{ fontSize:12, color:C.muted, marginTop:1 }}>Create a new AFL match</div></div>
        </div>
        {/* Step bar */}
        <div style={{ display:"flex", alignItems:"center" }}>
          {STEPS.map((label,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", flex:i<STEPS.length-1?1:"none" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:i<step?C.accent:i===step?C.accent+"22":C.card, border:"2px solid "+(i<=step?C.accent:C.border), display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {i<step ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <span style={{ fontSize:11, fontWeight:800, color:i===step?C.accent:C.muted }}>{i+1}</span>}
                </div>
                <span style={{ fontSize:9, fontWeight:700, color:i===step?C.accent:i<step?C.textSoft:C.muted, whiteSpace:"nowrap" }}>{label}</span>
              </div>
              {i<STEPS.length-1 && <div style={{ flex:1, height:2, background:i<step?C.accent:C.border, margin:"0 5px", marginBottom:14 }}/>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"18px 22px 100px" }}>
        {/* Step 0: Details */}
        {step===0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:18, padding:18 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Teams</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[["My Team","myTeam","e.g. Lions FC"],["Opposition","opposition","e.g. Sharks FC"]].map(([lbl,key,ph]) => (
                  <div key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={{ fontSize:12, fontWeight:700, color:C.muted }}>{lbl}</label>
                    <FocusInput value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph}/>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:18, padding:18 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Date & Time</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[["Match Date","date","date"],["Kick-off Time","time","time"]].map(([lbl,key,type]) => (
                  <div key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={{ fontSize:12, fontWeight:700, color:C.muted }}>{lbl}</label>
                    <FocusInput type={type} value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))}/>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:18, padding:18 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Round & Venue</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <DropdownField label="Round"    field="round"    value={form.round}    options={ROUNDS} openDrop={openDrop} setOpenDrop={setOpenDrop} onChange={v => setForm(f=>({...f,round:v}))}/>
                <DropdownField label="Location" field="location" value={form.location} options={VENUES}  openDrop={openDrop} setOpenDrop={setOpenDrop} onChange={v => setForm(f=>({...f,location:v}))}/>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Players */}
        {step===1 && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {squadPlayers.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 20px" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                <div style={{ marginTop:14, fontSize:14, fontWeight:700, color:C.textSoft }}>No teammates added yet</div>
                <div style={{ marginTop:6, fontSize:12, color:C.muted }}>Your created player will be added automatically</div>
              </div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ fontSize:13, color:C.muted }}>Select squad members</div>
                  <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:10, padding:"5px 12px", fontSize:13, fontWeight:800, color:C.text }}>{selectedIds.length} selected</div>
                </div>
                <div style={{ position:"relative" }}>
                  <svg style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search players..." style={{ width:"100%", padding:"11px 16px 11px 38px", boxSizing:"border-box", background:C.card, border:"1.5px solid "+C.border, borderRadius:12, color:C.text, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none" }}/>
                </div>
                {(search ? [{label:"Results",positions:[]}] : groups).map(group => {
                  const gPlayers = search ? filtered : squadPlayers.filter(p=>group.positions.includes(p.position));
                  if(!gPlayers.length) return null;
                  return (
                    <div key={group.label}>
                      {!search && <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>{group.label}</div>}
                      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                        {gPlayers.map(p => {
                          const pc=AFL_POS_COLOR[p.position]||C.muted, sel=selectedIds.includes(p.id);
                          return (
                            <div key={p.id} onClick={() => toggle(p.id)} style={{ display:"flex", alignItems:"center", gap:11, background:sel?pc+"12":C.card, border:"1.5px solid "+(sel?pc+"55":C.border), borderRadius:13, padding:"11px 13px", cursor:"pointer" }}>
                              <div style={{ width:36, height:36, borderRadius:9, flexShrink:0, background:pc+"1A", border:"1px solid "+pc+"33", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <span style={{ fontSize:13, fontWeight:900, color:pc }}>#{p.number}</span>
                              </div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{p.name}</div>
                                <Badge label={p.position} color={pc}/>
                              </div>
                              <div style={{ width:22, height:22, borderRadius:6, border:"2px solid "+(sel?C.accent:C.border), background:sel?C.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                {sel && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Step 2: Review */}
        {step===2 && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:C.accent, borderRadius:20, padding:"18px 20px", boxShadow:"0 8px 32px "+C.accentGlow }}>
              <div style={{ fontSize:11, color:C.bg+"99", fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginBottom:8 }}>{form.round||"Round TBC"}</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontSize:18, fontWeight:900, color:C.bg }}>{form.myTeam}</div>
                <AFLBall size={26} color={C.bg}/>
                <div style={{ fontSize:18, fontWeight:900, color:C.bg }}>{form.opposition}</div>
              </div>
              <div style={{ height:1, background:C.bg+"22", marginBottom:10 }}/>
              <div style={{ fontSize:12, color:C.bg+"BB" }}>
                {form.date ? new Date(form.date).toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"}) : "Date TBC"}
                {form.time ? " \u00b7 "+form.time : ""}
                {form.location ? " \u00b7 "+form.location : ""}
              </div>
            </div>
            {selectedIds.length > 0 && (
              <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, overflow:"hidden" }}>
                <div style={{ padding:"14px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between" }}>
                  <div style={{ fontSize:15, fontWeight:800 }}>Squad</div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.accent }}>{selectedIds.length} selected</div>
                </div>
                {squadPlayers.filter(p=>selectedIds.includes(p.id)).map((p,i) => {
                  const pc=AFL_POS_COLOR[p.position]||C.muted;
                  return (
                    <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 18px", borderTop:"1px solid "+C.border }}>
                      <span style={{ fontSize:13, fontWeight:900, color:pc, width:28 }}>#{p.number}</span>
                      <span style={{ flex:1, fontSize:13, fontWeight:600, color:C.textSoft }}>{p.name}</span>
                      <Badge label={p.position} color={pc}/>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div style={{ position:"sticky", bottom:0, padding:"14px 22px 24px", background:"linear-gradient(to top, "+C.bg+" 70%, transparent)", display:"flex", gap:10, flexShrink:0 }}>
        {step>0 && <button onClick={() => setStep(s=>s-1)} style={{ flex:1, padding:"15px", borderRadius:14, background:"transparent", border:"1.5px solid "+C.border, color:C.textSoft, fontSize:15, fontWeight:700, cursor:"pointer" }}>Back</button>}
        <button disabled={!canNext()} onClick={() => {
          if (step<STEPS.length-1) { setStep(s=>s+1); }
          else {
            const newFixture = { id: Date.now().toString(), myTeam:form.myTeam, against:form.opposition, date:form.date, time:form.time, location:form.location, round:form.round, status:"upcoming" };
            onSave(newFixture);
            setDone(true);
          }
        }} style={{ flex:2, padding:"15px", borderRadius:14, background:canNext()?C.accent:C.card, border:"1.5px solid "+(canNext()?C.accent:C.border), color:canNext()?C.bg:C.muted, fontSize:15, fontWeight:800, cursor:canNext()?"pointer":"default", boxShadow:canNext()?"0 4px 20px "+C.accentGlow:"none", transition:"all 0.2s" }}>
          {step===STEPS.length-1 ? "Create Fixture" : "Continue to "+STEPS[step+1]}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STATISTICS
// ══════════════════════════════════════════════════════════════════════════════
function StatisticsScreen({ player, gameHistory }) {
  const [view, setView] = useState("stats");
  const hasGames = gameHistory.length > 0;
  const lastGame = hasGames ? gameHistory[0] : null;

  const totals = gameHistory.reduce((acc,g) => {
    SCORING_MAP.forEach(s => { acc[s.key] = (acc[s.key]??0)+(g[s.key]??0); });
    return acc;
  }, {});
  const totalFP = hasGames ? calcFP(totals) : 0;
  const avgFP   = hasGames ? Math.round(totalFP / gameHistory.length) : 0;
  const lastFP  = lastGame ? calcFP(lastGame) : 0;

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ padding:"22px 22px 14px", borderBottom:"1px solid "+C.border, flexShrink:0 }}>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:22, fontWeight:900, color:C.text }}>Statistics</div>
          <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>AFL Fantasy Scoring &middot; 2026</div>
        </div>
        <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, padding:18, display:"flex", alignItems:"center", justifyContent:"space-around", marginBottom:14 }}>
          <ScoreRing value={lastFP}  max={200} size={74} label="Last Game"  color={C.orange}/>
          <div style={{ width:1, height:60, background:C.border }}/>
          <ScoreRing value={avgFP}   max={200} size={84} label="Season Avg" color={C.accent}/>
          <div style={{ width:1, height:60, background:C.border }}/>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:26, fontWeight:900, color:C.blue, lineHeight:1 }}>{totalFP}</div>
            <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginTop:6 }}>Season</div>
          </div>
        </div>
        <div style={{ display:"flex", background:C.card, border:"1.5px solid "+C.border, borderRadius:12, padding:4 }}>
          {[["stats","Breakdown"],["scoring","Scoring Guide"]].map(([v,l]) => (
            <button key={v} onClick={() => setView(v)} style={{ flex:1, padding:"9px", borderRadius:9, border:"none", background:view===v?C.accent:"transparent", color:view===v?C.bg:C.muted, fontSize:13, fontWeight:700, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"14px 22px 28px" }}>
        {view==="stats" && (
          <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 52px 52px 52px 52px", padding:"11px 16px", background:C.cardAlt, borderBottom:"1px solid "+C.border }}>
              {[["Stat",C.muted,"left"],["Last",C.textSoft,"center"],["Avg",C.blue,"center"],["Last FP",C.accent,"center"],["Avg FP",C.orange,"center"]].map(([h,c,a],i) => (
                <span key={i} style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:c, textAlign:a }}>{h}</span>
              ))}
            </div>
            {!hasGames && <div style={{ padding:"24px 18px", textAlign:"center", color:C.muted, fontSize:13 }}>No game data yet. Record your first game using the Eval tab.</div>}
            {SCORING_MAP.map((s,i) => {
              const last = lastGame ? (lastGame[s.key]??0) : 0;
              const tot  = totals[s.key]??0;
              const seasonAvg = hasGames ? (tot/gameHistory.length).toFixed(1) : "0.0";
              const rowLastFP = last*s.pts;
              const seasonAvgFP = hasGames ? (tot*s.pts/gameHistory.length).toFixed(1) : "0.0";
              const neg = s.pts<0;
              return (
                <div key={s.key} style={{ display:"grid", gridTemplateColumns:"1fr 52px 52px 52px 52px", padding:"13px 16px", borderTop:i>0?"1px solid "+C.border:"none", alignItems:"center", background:neg?C.red+"08":i%2===0?"transparent":C.bg+"44" }}>
                  <span style={{ fontSize:13, fontWeight:600, color:neg?C.red:C.textSoft }}>{s.label}</span>
                  <span style={{ textAlign:"center", fontSize:15, fontWeight:900, color:C.textSoft }}>{last}</span>
                  <span style={{ textAlign:"center", fontSize:15, fontWeight:900, color:C.blue }}>{seasonAvg}</span>
                  <span style={{ textAlign:"center", fontSize:15, fontWeight:900, color:neg&&rowLastFP!==0?C.red:C.accent }}>{rowLastFP>0?"+"+rowLastFP:rowLastFP}</span>
                  <span style={{ textAlign:"center", fontSize:14, fontWeight:900, color:neg?C.red:C.orange }}>{parseFloat(seasonAvgFP)>0?"+"+seasonAvgFP:seasonAvgFP}</span>
                </div>
              );
            })}
            {hasGames && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 52px 52px 52px 52px", padding:"14px 16px", background:C.accent+"12", borderTop:"2px solid "+C.accent+"33", alignItems:"center" }}>
                <span style={{ fontSize:13, fontWeight:800, color:C.accent }}>TOTAL</span>
                <span/><span/>
                <span style={{ textAlign:"center", fontSize:17, fontWeight:900, color:C.accent }}>{lastFP}</span>
                <span style={{ textAlign:"center", fontSize:17, fontWeight:900, color:C.orange }}>{avgFP}</span>
              </div>
            )}
          </div>
        )}

        {view==="scoring" && (
          <div style={{ background:C.card, border:"1.5px solid "+C.border, borderRadius:20, overflow:"hidden" }}>
            <div style={{ padding:"14px 18px", background:C.cardAlt, borderBottom:"1px solid "+C.border }}>
              <div style={{ fontSize:13, fontWeight:800, color:C.text }}>AFL Fantasy Scoring System</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>2026 season &middot; Points per action</div>
            </div>
            {SCORING_MAP.map((s,i) => (
              <div key={s.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"15px 18px", borderTop:i>0?"1px solid "+C.border:"none", background:s.pts<0?C.red+"08":"transparent" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:s.pts<0?C.red:s.pts>=4?C.accent:C.green }}/>
                  <span style={{ fontSize:14, fontWeight:600, color:s.pts<0?C.red:C.textSoft }}>{s.label}</span>
                </div>
                <div style={{ fontSize:15, fontWeight:900, color:s.pts<0?C.red:C.accent, background:(s.pts<0?C.red:C.accent)+"18", padding:"4px 12px", borderRadius:8 }}>
                  {s.pts>0?"+"+s.pts:s.pts} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [phase, setPhase]       = useState("splash");
  const [screen, setScreen]     = useState("home");
  const [player, setPlayerState]     = useState(DEFAULT_PLAYER);
  const [editingPlayer, setEditingPlayer] = useState(false);
  const [fixtures, setFixturesState] = useState([]);
  const [gameHistory, setGameHistoryState] = useState([]);
  const [storageReady, setStorageReady] = useState(false);

  // ── Persist helpers ────────────────────────────────────────────────────────
  const savePlayer   = async (p)  => { try { await window.storage.set("planett:player",   JSON.stringify(p));  } catch(e){} };
  const saveFixtures = async (fx) => { try { await window.storage.set("planett:fixtures",  JSON.stringify(fx)); } catch(e){} };
  const saveHistory  = async (gh) => { try { await window.storage.set("planett:history",   JSON.stringify(gh)); } catch(e){} };

  const setPlayer = (p)  => { setPlayerState(p);      savePlayer(p);   };
  const setFixtures = (fn) => { setFixturesState(prev => { const next = typeof fn==="function"?fn(prev):fn; saveFixtures(next); return next; }); };
  const setGameHistory = (fn) => { setGameHistoryState(prev => { const next = typeof fn==="function"?fn(prev):fn; saveHistory(next); return next; }); };

  // ── Load persisted data on mount ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const pr = await window.storage.get("planett:player");
        if (pr?.value) setPlayerState(JSON.parse(pr.value));
      } catch(e){}
      try {
        const fr = await window.storage.get("planett:fixtures");
        if (fr?.value) setFixturesState(JSON.parse(fr.value));
      } catch(e){}
      try {
        const hr = await window.storage.get("planett:history");
        if (hr?.value) setGameHistoryState(JSON.parse(hr.value));
      } catch(e){}
      setStorageReady(true);
    };
    load();
  }, []);

  // squadPlayers = just the one created player for now (can expand to teammates later)
  const squadPlayers = player.name
    ? [{ id:"main", name:player.name, number:player.number, position:player.position }]
    : [];

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800;9..40,900&display=swap";
    document.head.appendChild(link);
  }, []);

  const navigate = (dest) => { setEditingPlayer(false); setScreen(dest); };

  const handleGameSaved = (gameRecord, fixtureId) => {
    setGameHistory(prev => [{ ...gameRecord, fixtureId }, ...prev]);
    // Mark the fixture as completed if linked
    if (fixtureId) {
      setFixtures(prev => prev.map(f => f.id === fixtureId ? { ...f, status:"completed" } : f));
    }
  };

  const handleFixtureSaved = (fixture) => {
    setFixtures(prev => [...prev, fixture]);
  };

  const shell = (children, showNav=true) => (
    <div style={{ fontFamily:"'DM Sans', sans-serif", background:C.bg, height:"100vh", color:C.text, display:"flex", flexDirection:"column", maxWidth:430, margin:"0 auto", overflow:"hidden" }}>
      {children}
      {showNav && <BottomNav active={screen} onNav={navigate}/>}
    </div>
  );

  if (!storageReady) return (
    <div style={{ fontFamily:"'DM Sans', sans-serif", background:C.bg, height:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <AFLBall size={48} color={C.accent}/>
    </div>
  );

  if (phase==="splash") return shell(<SplashScreen onDone={() => { if (player.name) setPhase("app"); else setPhase("login"); }}/>, false);
  if (phase==="login")  return shell(<LoginScreen  onLogin={() => { setPhase("app"); if (!player.name) setEditingPlayer(true); }}/>, false);

  if (editingPlayer) return shell(
    <EditPlayerScreen
      player={player}
      onSave={p => { setPlayer(p); setEditingPlayer(false); setScreen("profile"); }}
      onBack={() => { setEditingPlayer(false); setScreen("profile"); }}
    />, true
  );

  if (screen==="buildFixture") return shell(
    <BuildFixtureScreen player={player} squadPlayers={squadPlayers} onSave={handleFixtureSaved} onBack={() => setScreen("fixtures")}/>,
    true
  );

  const renderScreen = () => {
    switch(screen) {
      case "home":     return <HomeScreen player={player} fixtures={fixtures} gameHistory={gameHistory} onNavigate={navigate}/>;
      case "profile":  return <ProfileScreen player={player} gameHistory={gameHistory} onEdit={() => setEditingPlayer(true)}/>;
      case "eval":     return <EvalScreen player={player} fixtures={fixtures} onGameSaved={handleGameSaved}/>;
      case "fixtures": return <FixturesScreen fixtures={fixtures} gameHistory={gameHistory} player={player} onBuildFixture={() => setScreen("buildFixture")}/>;
      case "stats":    return <StatisticsScreen player={player} gameHistory={gameHistory}/>;
      default:         return <HomeScreen player={player} fixtures={fixtures} gameHistory={gameHistory} onNavigate={navigate}/>;
    }
  };

  return shell(renderScreen());
}
