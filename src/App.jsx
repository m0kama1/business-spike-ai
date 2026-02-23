import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=Cairo:wght@300;400;600;700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0A1628;
    --navy-2: #0F1F3D;
    --navy-3: #162849;
    --blue: #1E5FD4;
    --blue-light: #3B82F6;
    --cyan: #06B6D4;
    --gold: #F59E0B;
    --gold-light: #FCD34D;
    --white: #F8FAFF;
    --text: #C8D6F0;
    --text-dim: #6B85B0;
    --success: #10B981;
    --warning: #F59E0B;
    --error: #EF4444;
    --border: rgba(59,130,246,0.2);
    --glass: rgba(15,31,61,0.7);
    --radius: 14px;
    --glow: 0 0 30px rgba(30,95,212,0.3);
  }

  html { scroll-behavior: smooth; }
  
  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--navy);
    color: var(--white);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .arabic { font-family: 'Cairo', sans-serif; direction: rtl; }
  
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--navy); }
  ::-webkit-scrollbar-thumb { background: var(--blue); border-radius: 4px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes glow-pulse {
    0%,100% { box-shadow: 0 0 20px rgba(30,95,212,0.3); }
    50% { box-shadow: 0 0 40px rgba(30,95,212,0.6), 0 0 80px rgba(30,95,212,0.2); }
  }
  @keyframes typing {
    from { width: 0; }
    to { width: 100%; }
  }
  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-16px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes messageIn {
    from { opacity: 0; transform: translateY(10px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes progress-fill {
    from { width: 0%; }
    to { width: var(--progress); }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(28px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(28px) rotate(-360deg); }
  }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const AGENTS = {
  orchestrator: { id: 'orchestrator', name: 'Study Manager', nameAr: 'مدير الدراسة', icon: '🎯', color: '#1E5FD4', badge: '#162849' },
  marketing:    { id: 'marketing',    name: 'Market Analyst', nameAr: 'محلل السوق',   icon: '📊', color: '#06B6D4', badge: '#0A2535' },
  technical:    { id: 'technical',    name: 'Ops Engineer',   nameAr: 'مهندس العمليات', icon: '🏭', color: '#F59E0B', badge: '#261A04' },
  financial:    { id: 'financial',    name: 'CFO Analyst',    nameAr: 'المحلل المالي',  icon: '💵', color: '#10B981', badge: '#042014' },
  expert:       { id: 'expert',       name: 'Expert Reviewer',nameAr: 'الخبير المراجع', icon: '🔍', color: '#8B5CF6', badge: '#1A0D35' },
};

const SECTORS = ['مطاعم وكافيه', 'تجزئة وبيع بالتجزئة', 'تكنولوجيا وتطبيقات', 'تصنيع وإنتاج', 'خدمات مهنية', 'رعاية صحية', 'تعليم وتدريب', 'عقارات', 'لوجستيات ونقل', 'أخرى'];

const STUDY_FLOW = [
  { id: 'welcome',   label: 'البداية',      icon: '✨', agent: 'orchestrator' },
  { id: 'marketing', label: 'تحليل السوق',  icon: '📊', agent: 'marketing' },
  { id: 'technical', label: 'الجانب الفني', icon: '🏭', agent: 'technical' },
  { id: 'financial', label: 'النموذج المالي',icon: '💵', agent: 'financial' },
  { id: 'review',    label: 'مراجعة الخبير',icon: '🔍', agent: 'expert' },
  { id: 'delivery',  label: 'التسليم',       icon: '🎉', agent: 'orchestrator' },
];

// Question flows per agent
const QUESTIONS = {
  welcome: [
    { id: 'project_name', text: 'مرحباً! أنا هنا لمساعدتك في بناء دراسة جدوى احترافية.\n\nما اسم مشروعك؟', type: 'text', placeholder: 'مثال: كافيه الأصالة', agent: 'orchestrator' },
    { id: 'sector', text: 'ممتاز! في أي قطاع يعمل مشروعك؟', type: 'select', options: SECTORS, agent: 'orchestrator' },
    { id: 'location', text: 'في أي مدينة ودولة ستنفذ المشروع؟', type: 'text', placeholder: 'مثال: الرياض، المملكة العربية السعودية', agent: 'orchestrator' },
  ],
  marketing: [
    { id: 'target_customer', text: 'من هو عميلك المستهدف؟ صِف شريحتك الرئيسية.', type: 'text', placeholder: 'مثال: شباب 20-35 سنة، محبو القهوة المتخصصة', agent: 'marketing' },
    { id: 'competitors', text: 'هل تعرف منافسين رئيسيين في السوق؟', type: 'text', placeholder: 'مثال: ستاربكس، قهوة البلدي', agent: 'marketing' },
    { id: 'unique_value', text: 'ما الذي يميز مشروعك عن المنافسين؟', type: 'text', placeholder: 'مثال: قهوة عربية أصيلة بتجربة فريدة', agent: 'marketing' },
    { id: 'market_size', text: 'هل لديك تقدير لحجم السوق المستهدف في منطقتك؟', type: 'select', options: ['أقل من 10 مليون ريال', '10-50 مليون ريال', '50-200 مليون ريال', 'أكثر من 200 مليون ريال', 'لا أعلم (سأترك للذكاء الاصطناعي)'], agent: 'marketing' },
  ],
  technical: [
    { id: 'team_size', text: 'كم عدد الموظفين الذين تحتاجهم للبدء؟', type: 'select', options: ['1-3 موظفين', '4-10 موظفين', '11-25 موظفاً', '26-50 موظفاً', 'أكثر من 50 موظفاً'], agent: 'technical' },
    { id: 'facility', text: 'هل تحتاج لمكان/منشأة فعلية؟', type: 'select', options: ['نعم، إيجار موقع تجاري', 'نعم، شراء عقار', 'عمل من المنزل / أونلاين', 'مستودع أو مصنع'], agent: 'technical' },
    { id: 'equipment', text: 'ما أبرز المعدات أو التقنيات التي يحتاجها مشروعك؟', type: 'text', placeholder: 'مثال: مكائن قهوة متخصصة، نظام POS، أثاث', agent: 'technical' },
    { id: 'licenses', text: 'هل تحتاج تراخيص أو شهادات خاصة؟', type: 'select', options: ['ترخيص تجاري فقط', 'ترخيص بلدية + صحة', 'اعتمادات مهنية', 'لا أعلم بعد'], agent: 'technical' },
  ],
  financial: [
    { id: 'capital', text: 'كم رأس المال المتاح لديك للاستثمار؟', type: 'select', options: ['أقل من 50,000 ريال', '50,000 - 150,000 ريال', '150,000 - 500,000 ريال', '500,000 - 2,000,000 ريال', 'أكثر من 2,000,000 ريال'], agent: 'financial' },
    { id: 'pricing', text: 'ما متوسط سعر منتجك/خدمتك الرئيسية؟', type: 'text', placeholder: 'مثال: 25 ريال للكوب الواحد', agent: 'financial' },
    { id: 'revenue_target', text: 'ما هدفك من الإيرادات خلال السنة الأولى؟', type: 'select', options: ['100,000 - 300,000 ريال', '300,000 - 700,000 ريال', '700,000 - 2,000,000 ريال', 'أكثر من 2,000,000 ريال', 'لا أعلم بعد'], agent: 'financial' },
    { id: 'break_even', text: 'في أي فترة تتوقع استرداد رأس مالك؟', type: 'select', options: ['أقل من سنة', '1-2 سنة', '2-3 سنوات', 'أكثر من 3 سنوات', 'لا أعلم'], agent: 'financial' },
  ],
};

// Simulated AI responses per section
const AI_RESPONSES = {
  marketing: {
    market_size: { TAM: '4.2 مليار ريال', SAM: '380 مليون ريال', SOM: '7.6 مليون ريال' },
    competitors_count: 8,
    swot: { strengths: 2, weaknesses: 2, opportunities: 3, threats: 2 },
    trend: 'نمو متسارع بنسبة 23% سنوياً في قطاع المشروبات المتخصصة',
    confidence: 87,
  },
  technical: {
    workflow_stages: 5,
    team_cost: '45,000 ريال شهرياً',
    facility_cost: '18,000 ريال/شهر',
    equipment_total: '85,000 ريال',
    complexity: 6,
    confidence: 91,
  },
  financial: {
    total_investment: '142,000 ريال',
    monthly_revenue: '73,500 ريال',
    irr: '34.2%',
    payback: '26 شهراً',
    breakeven_monthly: '41,176 ريال',
    roi_y1: '18.4%',
    roi_y3: '112%',
    confidence: 89,
  },
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function StarField() {
  const stars = Array.from({length: 60}, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2,
  }));
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
          width:s.size, height:s.size, borderRadius:'50%',
          background:'rgba(200,214,240,0.6)',
          animation:`pulse ${s.duration}s ${s.delay}s ease-in-out infinite`,
        }}/>
      ))}
      {/* Grid lines */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:`linear-gradient(rgba(30,95,212,0.04) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(30,95,212,0.04) 1px, transparent 1px)`,
        backgroundSize:'60px 60px',
      }}/>
    </div>
  );
}

function AgentBadge({ agentId, size='sm' }) {
  const agent = AGENTS[agentId];
  const sz = size === 'sm' ? 32 : 42;
  return (
    <div style={{
      width:sz, height:sz, borderRadius:'50%',
      background:agent.badge,
      border:`2px solid ${agent.color}`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize: size === 'sm' ? 14 : 18,
      flexShrink:0,
      boxShadow:`0 0 12px ${agent.color}40`,
    }}>
      {agent.icon}
    </div>
  );
}

function ProgressBar({ value, color = '#1E5FD4', animated = false }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:99, height:6, overflow:'hidden' }}>
      <div style={{
        height:'100%', borderRadius:99,
        background:`linear-gradient(90deg, ${color}, ${color}CC)`,
        width:`${value}%`,
        transition:'width 0.6s cubic-bezier(.4,0,.2,1)',
        boxShadow:`0 0 10px ${color}60`,
      }}/>
    </div>
  );
}

function ConfidenceBadge({ score }) {
  const color = score >= 85 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      background:`${color}15`, border:`1px solid ${color}40`,
      color, borderRadius:99, padding:'2px 10px', fontSize:12, fontWeight:600,
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:color, display:'inline-block', animation:'pulse 1.5s infinite' }}/>
      ثقة {score}%
    </span>
  );
}

function Spinner({ size = 20, color = '#1E5FD4' }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      border:`2px solid ${color}30`,
      borderTop:`2px solid ${color}`,
      animation:'spin 0.8s linear infinite',
      flexShrink:0,
    }}/>
  );
}

function ChatMessage({ msg, isNew }) {
  const agent = AGENTS[msg.agent] || AGENTS.orchestrator;
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display:'flex', gap:10, justifyContent: isUser ? 'flex-end' : 'flex-start',
      animation: isNew ? 'messageIn 0.3s ease-out' : 'none',
      marginBottom:16,
    }}>
      {!isUser && <AgentBadge agentId={msg.agent || 'orchestrator'} />}
      <div style={{ maxWidth:'72%', display:'flex', flexDirection:'column', gap:4, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        {!isUser && (
          <span style={{ fontSize:11, color:agent.color, fontWeight:600, fontFamily:'Cairo,sans-serif' }}>
            {agent.nameAr}
          </span>
        )}
        <div style={{
          background: isUser
            ? 'linear-gradient(135deg, #1E5FD4, #3B82F6)'
            : 'rgba(15,31,61,0.9)',
          border: isUser ? 'none' : `1px solid rgba(59,130,246,0.2)`,
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding:'12px 16px',
          fontSize:14, lineHeight:1.6,
          color: isUser ? '#fff' : '#C8D6F0',
          fontFamily:'Cairo,sans-serif',
          whiteSpace:'pre-wrap',
          boxShadow: isUser ? '0 4px 20px rgba(30,95,212,0.3)' : '0 2px 12px rgba(0,0,0,0.3)',
          direction:'rtl',
        }}>
          {msg.content}
        </div>
        {msg.confidence && <ConfidenceBadge score={msg.confidence} />}
      </div>
      {isUser && (
        <div style={{
          width:32, height:32, borderRadius:'50%',
          background:'linear-gradient(135deg, #1E5FD4, #06B6D4)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:14, flexShrink:0,
        }}>👤</div>
      )}
    </div>
  );
}

function SelectOption({ option, onSelect }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => onSelect(option)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'rgba(30,95,212,0.2)' : 'rgba(15,31,61,0.6)',
        border:`1px solid ${hover ? '#3B82F6' : 'rgba(59,130,246,0.2)'}`,
        borderRadius:10, padding:'10px 16px',
        color:'#C8D6F0', cursor:'pointer',
        fontSize:13, fontFamily:'Cairo,sans-serif',
        transition:'all 0.2s', textAlign:'right',
        transform: hover ? 'translateX(-4px)' : 'none',
        boxShadow: hover ? '0 0 20px rgba(30,95,212,0.2)' : 'none',
      }}
    >
      {option}
    </button>
  );
}

function ProcessingPanel({ stage, inputs }) {
  const [progress, setProgress] = useState({ marketing: 0, technical: 0, financial: 0 });
  const [activeMsg, setActiveMsg] = useState(0);
  const messages = [
    'جاري تحليل بيانات السوق...',
    'استخراج الكيانات والمتغيرات...',
    'البحث في قاعدة 200 دراسة سابقة...',
    'تحليل المنافسين...',
    'بناء نموذج SWOT...',
    'حساب حجم السوق TAM/SAM/SOM...',
    'نمذجة التدفقات المالية...',
    'حساب IRR ونقطة التعادل...',
    'مراجعة الاتساق الداخلي...',
    'دمج مخرجات الوكلاء...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => ({
        marketing: Math.min(p.marketing + Math.random() * 8, 100),
        technical: Math.min(p.technical + Math.random() * 6, 100),
        financial: Math.min(p.financial + Math.random() * 7, 100),
      }));
    }, 300);
    const msgInterval = setInterval(() => {
      setActiveMsg(m => (m + 1) % messages.length);
    }, 1200);
    return () => { clearInterval(interval); clearInterval(msgInterval); };
  }, []);

  const overall = Math.round((progress.marketing + progress.technical + progress.financial) / 3);

  return (
    <div style={{
      background:'rgba(10,22,40,0.95)', backdropFilter:'blur(20px)',
      border:'1px solid rgba(59,130,246,0.25)', borderRadius:20,
      padding:32, textAlign:'center',
    }}>
      {/* Orbital animation */}
      <div style={{ position:'relative', width:100, height:100, margin:'0 auto 28px' }}>
        <div style={{
          position:'absolute', inset:0, borderRadius:'50%',
          border:'2px solid rgba(30,95,212,0.2)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:32,
          animation:'glow-pulse 2s infinite',
        }}>🤖</div>
        {['📊','🏭','💵'].map((icon, i) => (
          <div key={i} style={{
            position:'absolute', top:'50%', left:'50%',
            marginTop:-10, marginLeft:-10,
            width:20, height:20,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:14,
            animation:`orbit ${2 + i * 0.5}s ${i * 0.6}s linear infinite`,
            transformOrigin:'center',
          }}>{icon}</div>
        ))}
      </div>

      <div style={{ fontSize:22, fontWeight:700, fontFamily:'Cairo,sans-serif', marginBottom:8 }}>
        الذكاء الاصطناعي يحلل مشروعك
      </div>
      <div style={{
        fontSize:13, color:'#06B6D4', fontFamily:'Cairo,sans-serif',
        marginBottom:28, minHeight:20,
        animation:'fadeIn 0.3s ease',
        key: activeMsg,
      }}>
        {messages[activeMsg]}
      </div>

      {/* Big progress ring */}
      <div style={{ position:'relative', width:80, height:80, margin:'0 auto 28px' }}>
        <svg width={80} height={80} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={40} cy={40} r={34} fill="none" stroke="rgba(30,95,212,0.1)" strokeWidth={6}/>
          <circle cx={40} cy={40} r={34} fill="none" stroke="#1E5FD4" strokeWidth={6}
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - overall / 100)}`}
            strokeLinecap="round"
            style={{ transition:'stroke-dashoffset 0.3s ease', filter:'drop-shadow(0 0 8px #1E5FD4)' }}
          />
        </svg>
        <div style={{
          position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:18, fontWeight:700, color:'#3B82F6',
        }}>{overall}%</div>
      </div>

      {/* Per-agent bars */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {[
          { agent: 'marketing', label: 'تحليل السوق', color: '#06B6D4', val: progress.marketing },
          { agent: 'technical', label: 'الجانب الفني', color: '#F59E0B', val: progress.technical },
          { agent: 'financial', label: 'النموذج المالي', color: '#10B981', val: progress.financial },
        ].map(item => (
          <div key={item.agent}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:12, color: item.color, fontFamily:'Cairo,sans-serif', fontWeight:600 }}>
                {AGENTS[item.agent].icon} {item.label}
              </span>
              <span style={{ fontSize:11, color:'#6B85B0' }}>{Math.round(item.val)}%</span>
            </div>
            <ProgressBar value={item.val} color={item.color} />
          </div>
        ))}
      </div>

      <div style={{ marginTop:20, fontSize:12, color:'#6B85B0', fontFamily:'Cairo,sans-serif' }}>
        وقت التنفيذ المتوقع: ~8 دقائق
      </div>
    </div>
  );
}

function StudyResults({ inputs, onPublish }) {
  const [activeTab, setActiveTab] = useState('summary');
  const fin = AI_RESPONSES.financial;
  const mkt = AI_RESPONSES.marketing;
  const tec = AI_RESPONSES.technical;

  const tabs = [
    { id: 'summary',   label: 'الملخص التنفيذي', icon: '📋' },
    { id: 'marketing', label: 'تحليل السوق',      icon: '📊' },
    { id: 'financial', label: 'النموذج المالي',   icon: '💰' },
    { id: 'technical', label: 'الجانب الفني',     icon: '⚙️' },
  ];

  // Simulated chart data
  const cashflow = [
    { month: 'شهر 1', revenue: 28000, cost: 38000, profit: -10000 },
    { month: 'شهر 3', revenue: 45000, cost: 40000, profit: 5000 },
    { month: 'شهر 6', revenue: 62000, cost: 42000, profit: 20000 },
    { month: 'شهر 9', revenue: 74000, cost: 44000, profit: 30000 },
    { month: 'شهر 12', revenue: 86000, cost: 46000, profit: 40000 },
    { month: 'شهر 18', revenue: 110000, cost: 50000, profit: 60000 },
    { month: 'شهر 24', revenue: 135000, cost: 54000, profit: 81000 },
  ];

  const maxVal = 140000;

  return (
    <div style={{ animation:'fadeUp 0.4s ease' }}>
      {/* Header */}
      <div style={{
        background:'linear-gradient(135deg, rgba(30,95,212,0.15), rgba(6,182,212,0.1))',
        border:'1px solid rgba(30,95,212,0.3)', borderRadius:16,
        padding:'20px 24px', marginBottom:20,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        flexWrap:'wrap', gap:12,
      }}>
        <div>
          <div style={{ fontSize:11, color:'#6B85B0', fontFamily:'Cairo,sans-serif', marginBottom:4 }}>دراسة جدوى مكتملة</div>
          <div style={{ fontSize:20, fontWeight:700, fontFamily:'Cairo,sans-serif' }}>
            {inputs.project_name || 'مشروعك'}
          </div>
          <div style={{ fontSize:13, color:'#06B6D4', fontFamily:'Cairo,sans-serif' }}>
            {inputs.sector} · {inputs.location}
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <ConfidenceBadge score={89} />
          <button onClick={onPublish} style={{
            background:'linear-gradient(135deg, #10B981, #059669)',
            border:'none', borderRadius:10, padding:'8px 18px',
            color:'#fff', fontSize:13, fontFamily:'Cairo,sans-serif',
            cursor:'pointer', fontWeight:600,
            boxShadow:'0 4px 15px rgba(16,185,129,0.3)',
          }}>
            🏪 نشر في Business Mall
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px,1fr))', gap:12, marginBottom:20 }}>
        {[
          { label: 'إجمالي الاستثمار', value: fin.total_investment, icon: '💰', color: '#1E5FD4' },
          { label: 'معدل العائد الداخلي', value: fin.irr, icon: '📈', color: '#10B981' },
          { label: 'فترة الاسترداد', value: fin.payback, icon: '⏱', color: '#F59E0B' },
          { label: 'نقطة التعادل', value: fin.breakeven_monthly, icon: '⚖️', color: '#06B6D4' },
        ].map(m => (
          <div key={m.label} style={{
            background:'rgba(10,22,40,0.8)', border:`1px solid ${m.color}30`,
            borderRadius:14, padding:'16px', textAlign:'center',
            borderTop:`3px solid ${m.color}`,
          }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{m.icon}</div>
            <div style={{ fontSize:16, fontWeight:700, color: m.color, fontFamily:'Syne,sans-serif' }}>{m.value}</div>
            <div style={{ fontSize:11, color:'#6B85B0', fontFamily:'Cairo,sans-serif', marginTop:4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16, overflowX:'auto', paddingBottom:4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? 'rgba(30,95,212,0.25)' : 'rgba(15,31,61,0.5)',
            border: `1px solid ${activeTab === t.id ? '#3B82F6' : 'rgba(59,130,246,0.15)'}`,
            borderRadius:10, padding:'8px 14px', color: activeTab === t.id ? '#fff' : '#6B85B0',
            cursor:'pointer', fontSize:12, fontFamily:'Cairo,sans-serif',
            whiteSpace:'nowrap', transition:'all 0.2s',
            fontWeight: activeTab === t.id ? 600 : 400,
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{
        background:'rgba(10,22,40,0.7)', border:'1px solid rgba(59,130,246,0.15)',
        borderRadius:16, padding:24, minHeight:300,
        animation:'fadeIn 0.3s ease',
      }}>
        {activeTab === 'summary' && (
          <div style={{ fontFamily:'Cairo,sans-serif', direction:'rtl' }}>
            <h3 style={{ fontSize:16, marginBottom:16, color:'#C8D6F0' }}>الملخص التنفيذي</h3>
            <p style={{ fontSize:14, lineHeight:1.8, color:'#8AA0C0', marginBottom:16 }}>
              يُقدّم هذا المشروع فرصة استثمارية واعدة في قطاع <strong style={{color:'#06B6D4'}}>{inputs.sector || 'الخدمات'}</strong> بمنطقة {inputs.location || 'المنطقة المستهدفة'}. يستهدف المشروع شريحة سوقية ذات إمكانات نمو عالية، مع ميزة تنافسية واضحة تتمثل في {inputs.unique_value || 'الجودة والتميز'}.
            </p>
            <p style={{ fontSize:14, lineHeight:1.8, color:'#8AA0C0', marginBottom:20 }}>
              تُشير التحليلات إلى أن المشروع يصل لنقطة التعادل في الشهر <strong style={{color:'#10B981'}}>السابع عشر</strong>، مع عائد استثمار بنسبة <strong style={{color:'#10B981'}}>{fin.roi_y1}</strong> في السنة الأولى و<strong style={{color:'#10B981'}}>{fin.roi_y3}</strong> خلال ثلاث سنوات.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { label:'نقاط القوة', items:['تجربة مستخدم فريدة', 'موقع استراتيجي مميز'], color:'#10B981' },
                { label:'الفرص', items:['نمو السوق 23% سنوياً', 'طلب متزايد على المنتج'], color:'#06B6D4' },
                { label:'نقاط الضعف', items:['تكاليف تشغيل مرتفعة نسبياً'], color:'#F59E0B' },
                { label:'التهديدات', items:['منافسة من علامات عالمية'], color:'#EF4444' },
              ].map(s => (
                <div key={s.label} style={{ background:`${s.color}10`, border:`1px solid ${s.color}25`, borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:s.color, marginBottom:8 }}>{s.label}</div>
                  {s.items.map((item, i) => <div key={i} style={{ fontSize:12, color:'#8AA0C0', marginBottom:4 }}>• {item}</div>)}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div style={{ fontFamily:'Cairo,sans-serif', direction:'rtl' }}>
            <h3 style={{ fontSize:16, marginBottom:20, color:'#C8D6F0' }}>التحليل المالي — التدفق النقدي (24 شهراً)</h3>
            {/* Cash flow chart */}
            <div style={{ overflowX:'auto' }}>
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:160, minWidth:500, marginBottom:8 }}>
                {cashflow.map((d, i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                    <div style={{ width:'100%', display:'flex', gap:2, alignItems:'flex-end', height:140 }}>
                      <div style={{
                        flex:1, background:'rgba(30,95,212,0.5)',
                        height:`${(d.revenue / maxVal) * 140}px`,
                        borderRadius:'4px 4px 0 0', minHeight:4,
                        transition:'height 0.6s cubic-bezier(.4,0,.2,1)',
                      }}/>
                      <div style={{
                        flex:1,
                        background: d.profit >= 0 ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.5)',
                        height:`${(Math.abs(d.profit) / maxVal) * 140}px`,
                        borderRadius:'4px 4px 0 0', minHeight:4,
                        transition:'height 0.6s cubic-bezier(.4,0,.2,1)',
                      }}/>
                    </div>
                    <div style={{ fontSize:9, color:'#6B85B0', textAlign:'center' }}>{d.month}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:16, fontSize:11, color:'#6B85B0' }}>
                <span><span style={{display:'inline-block',width:10,height:10,background:'rgba(30,95,212,0.6)',borderRadius:2,marginLeft:4}}/>الإيرادات</span>
                <span><span style={{display:'inline-block',width:10,height:10,background:'rgba(16,185,129,0.6)',borderRadius:2,marginLeft:4}}/>صافي الربح</span>
              </div>
            </div>
            {/* Scenarios */}
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:12, color:'#C8D6F0' }}>تحليل السيناريوهات</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                {[
                  { label:'متشائم', irr:'14.1%', payback:'42 شهر', color:'#EF4444' },
                  { label:'قاعدي', irr:fin.irr, payback:fin.payback, color:'#3B82F6' },
                  { label:'متفائل', irr:'58.7%', payback:'19 شهر', color:'#10B981' },
                ].map(s => (
                  <div key={s.label} style={{ background:`${s.color}10`, border:`1px solid ${s.color}30`, borderRadius:10, padding:12, textAlign:'center' }}>
                    <div style={{ fontSize:11, color:s.color, fontWeight:600, marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontSize:16, fontWeight:700, color:s.color }}>{s.irr}</div>
                    <div style={{ fontSize:10, color:'#6B85B0' }}>IRR</div>
                    <div style={{ fontSize:13, color:'#C8D6F0', marginTop:6 }}>{s.payback}</div>
                    <div style={{ fontSize:10, color:'#6B85B0' }}>فترة الاسترداد</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div style={{ fontFamily:'Cairo,sans-serif', direction:'rtl' }}>
            <h3 style={{ fontSize:16, marginBottom:16, color:'#C8D6F0' }}>تحليل السوق</h3>
            {/* Market size funnel */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12, color:'#8AA0C0' }}>حجم السوق المستهدف</div>
              {[
                { label:'السوق الكلي (TAM)', value:mkt.market_size.TAM, width:'100%', color:'rgba(30,95,212,0.4)' },
                { label:'السوق القابل للخدمة (SAM)', value:mkt.market_size.SAM, width:'55%', color:'rgba(6,182,212,0.5)' },
                { label:'حصتنا المستهدفة (SOM)', value:mkt.market_size.SOM, width:'25%', color:'rgba(16,185,129,0.6)' },
              ].map(m => (
                <div key={m.label} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:12 }}>
                    <span style={{ color:'#8AA0C0' }}>{m.label}</span>
                    <span style={{ color:'#C8D6F0', fontWeight:600 }}>{m.value}</span>
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:4, height:12, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:m.width, background:m.color, borderRadius:4 }}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(6,182,212,0.08)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:12, padding:14, marginBottom:16 }}>
              <div style={{ fontSize:12, color:'#06B6D4', fontWeight:600, marginBottom:4 }}>📈 اتجاه السوق</div>
              <div style={{ fontSize:13, color:'#8AA0C0' }}>{mkt.trend}</div>
            </div>
            <div style={{ fontSize:13, color:'#8AA0C0', lineHeight:1.7 }}>
              <strong style={{color:'#C8D6F0'}}>المنافسون ({mkt.competitors_count} منافساً)</strong> — تم تحديد {mkt.competitors_count} منافسين رئيسيين في السوق المحلية. معظمهم يعتمد على استراتيجية التسعير المتوسط، مما يفتح فرصة للدخول بتجربة متميزة في الشريحة المتخصصة.
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div style={{ fontFamily:'Cairo,sans-serif', direction:'rtl' }}>
            <h3 style={{ fontSize:16, marginBottom:16, color:'#C8D6F0' }}>الدراسة الفنية والتشغيلية</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              {[
                { label:'تكلفة الفريق شهرياً', value:tec.team_cost, icon:'👥', color:'#1E5FD4' },
                { label:'تكلفة المنشأة شهرياً', value:tec.facility_cost, icon:'🏢', color:'#06B6D4' },
                { label:'تكلفة المعدات (إجمالي)', value:tec.equipment_total, icon:'⚙️', color:'#F59E0B' },
                { label:'درجة التعقيد التشغيلي', value:`${tec.complexity}/10`, icon:'📐', color:'#10B981' },
              ].map(item => (
                <div key={item.label} style={{ background:'rgba(10,22,40,0.8)', border:`1px solid ${item.color}25`, borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:20, marginBottom:8 }}>{item.icon}</div>
                  <div style={{ fontSize:16, fontWeight:700, color:item.color }}>{item.value}</div>
                  <div style={{ fontSize:11, color:'#6B85B0', marginTop:4 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(15,31,61,0.6)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12, color:'#C8D6F0' }}>مراحل التشغيل ({tec.workflow_stages} مراحل)</div>
              {['استقبال الطلب', 'التحضير والإنتاج', 'مراقبة الجودة', 'التسليم للعميل', 'تقييم الرضا'].map((s, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(30,95,212,0.3)', border:'1px solid #3B82F6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#3B82F6', flexShrink:0 }}>{i+1}</div>
                  <div style={{ fontSize:13, color:'#8AA0C0' }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:10, marginTop:16, flexWrap:'wrap' }}>
        {[
          { label:'⬇️ تحميل PDF', color:'#1E5FD4' },
          { label:'📊 Pitch Deck', color:'#8B5CF6' },
          { label:'🔗 مشاركة مع مستثمر', color:'#06B6D4' },
        ].map(btn => (
          <button key={btn.label} style={{
            background:`${btn.color}20`, border:`1px solid ${btn.color}50`,
            borderRadius:10, padding:'10px 18px',
            color: btn.color, fontSize:13, fontFamily:'Cairo,sans-serif',
            cursor:'pointer', fontWeight:600, transition:'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = `${btn.color}35`}
          onMouseLeave={e => e.currentTarget.style.background = `${btn.color}20`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BusinessMall({ onBack }) {
  const projects = [
    { name:'كافيه الأصالة', sector:'مطاعم', location:'الرياض', investment:'142,000 ريال', irr:'34.2%', payback:'26 شهر', score:91, badge:'🏆' },
    { name:'تطبيق توصيل سريع', sector:'تكنولوجيا', location:'جدة', investment:'380,000 ريال', irr:'47.8%', payback:'18 شهر', score:88, badge:'⭐' },
    { name:'عيادة طب أسنان', sector:'صحة', location:'الدمام', investment:'890,000 ريال', irr:'28.4%', payback:'31 شهر', score:94, badge:'🏆' },
    { name:'مصنع ملابس رياضية', sector:'تصنيع', location:'الرياض', investment:'2.1M ريال', irr:'22.1%', payback:'38 شهر', score:85, badge:'✨' },
    { name:'مركز تدريب لياقة', sector:'رياضة', location:'أبوظبي', investment:'520,000 ريال', irr:'39.5%', payback:'22 شهر', score:90, badge:'⭐' },
    { name:'متجر إلكتروني أزياء', sector:'تجزئة', location:'دبي', investment:'95,000 ريال', irr:'51.3%', payback:'15 شهر', score:87, badge:'🔥' },
  ];

  const [filter, setFilter] = useState('');

  return (
    <div style={{ animation:'fadeUp 0.4s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <button onClick={onBack} style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.3)', borderRadius:8, padding:'6px 12px', color:'#3B82F6', cursor:'pointer', fontSize:13, fontFamily:'Cairo,sans-serif' }}>← رجوع</button>
        <div>
          <h2 style={{ fontFamily:'Cairo,sans-serif', fontSize:20, fontWeight:700 }}>🏪 Business Mall</h2>
          <p style={{ fontSize:12, color:'#6B85B0', fontFamily:'Cairo,sans-serif' }}>استعرض المشاريع الجاهزة للاستثمار</p>
        </div>
      </div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="🔍 ابحث عن مشروع..."
        style={{
          width:'100%', background:'rgba(15,31,61,0.6)', border:'1px solid rgba(59,130,246,0.2)',
          borderRadius:12, padding:'12px 16px', color:'#C8D6F0', fontSize:13, fontFamily:'Cairo,sans-serif',
          outline:'none', marginBottom:20, direction:'rtl',
        }}
      />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:14 }}>
        {projects.filter(p => !filter || p.name.includes(filter) || p.sector.includes(filter)).map((p, i) => (
          <div key={i} style={{
            background:'rgba(10,22,40,0.8)', border:'1px solid rgba(59,130,246,0.15)',
            borderRadius:16, padding:20, transition:'all 0.2s', cursor:'pointer',
            animation:`fadeUp ${0.1 + i * 0.05}s ease`,
          }}
          onMouseEnter={e => { e.currentTarget.style.border='1px solid rgba(59,130,246,0.4)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(30,95,212,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.border='1px solid rgba(59,130,246,0.15)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, fontFamily:'Cairo,sans-serif' }}>{p.badge} {p.name}</div>
                <div style={{ fontSize:12, color:'#06B6D4', fontFamily:'Cairo,sans-serif', marginTop:2 }}>{p.sector} · {p.location}</div>
              </div>
              <ConfidenceBadge score={p.score} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
              {[
                { label:'الاستثمار', value:p.investment, color:'#1E5FD4' },
                { label:'IRR', value:p.irr, color:'#10B981' },
                { label:'الاسترداد', value:p.payback, color:'#F59E0B' },
              ].map((m, j) => (
                <div key={j} style={{ background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:m.color, fontFamily:'Syne,sans-serif' }}>{m.value}</div>
                  <div style={{ fontSize:10, color:'#6B85B0', fontFamily:'Cairo,sans-serif' }}>{m.label}</div>
                </div>
              ))}
            </div>
            <button style={{
              width:'100%', background:'rgba(30,95,212,0.15)', border:'1px solid rgba(30,95,212,0.3)',
              borderRadius:8, padding:'8px', color:'#3B82F6', fontSize:12,
              fontFamily:'Cairo,sans-serif', cursor:'pointer', fontWeight:600,
            }}>
              عرض الدراسة كاملة →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('landing'); // landing | app | mall
  const [phase, setPhase] = useState('welcome'); // welcome|marketing|technical|financial|processing|review|delivered
  const [messages, setMessages] = useState([]);
  const [inputs, setInputs] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [processingDone, setProcessingDone] = useState(false);
  const [newMsgIdx, setNewMsgIdx] = useState(-1);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentPhaseQuestions = QUESTIONS[phase] || [];
  const currentQ = currentPhaseQuestions[currentQIndex];

  // Scroll to bottom
  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
  }, [messages, isTyping]);

  // Start study
  const startStudy = useCallback(() => {
    setScreen('app');
    setTimeout(() => {
      const firstQ = QUESTIONS.welcome[0];
      setMessages([{ id:0, role:'ai', agent:'orchestrator', content: firstQ.text }]);
      setNewMsgIdx(0);
    }, 300);
  }, []);

  // Add AI message with typing delay
  const addAIMessage = useCallback((content, agent='orchestrator', delay=800, confidence=null) => {
    setIsTyping(true);
    return new Promise(resolve => setTimeout(() => {
      setIsTyping(false);
      const msg = { id: Date.now(), role:'ai', agent, content, confidence };
      setMessages(prev => {
        setNewMsgIdx(prev.length);
        return [...prev, msg];
      });
      resolve();
    }, delay));
  }, []);

  // Handle user answer
  const handleAnswer = useCallback(async (answer) => {
    if (!answer.trim() && currentQ?.type === 'text') return;
    const val = answer || inputValue;
    if (!val.trim()) return;

    // Save input
    if (currentQ) {
      setInputs(prev => ({ ...prev, [currentQ.id]: val }));
    }

    // Add user message
    const userMsg = { id: Date.now(), role:'user', agent:'user', content: val };
    setMessages(prev => {
      setNewMsgIdx(prev.length);
      return [...prev, userMsg];
    });
    setInputValue('');

    const nextIdx = currentQIndex + 1;
    const phaseQuestions = QUESTIONS[phase] || [];

    if (nextIdx < phaseQuestions.length) {
      // Next question in same phase
      setCurrentQIndex(nextIdx);
      const nextQ = phaseQuestions[nextIdx];
      await addAIMessage(nextQ.text, nextQ.agent);
    } else {
      // Phase transition
      if (phase === 'welcome') {
        await addAIMessage('ممتاز! سأنتقل الآن مع المحلل 📊 لجمع معلومات السوق.', 'orchestrator', 600);
        setPhase('marketing');
        setCurrentQIndex(0);
        await addAIMessage(QUESTIONS.marketing[0].text, 'marketing', 800);
      } else if (phase === 'marketing') {
        await addAIMessage('شكراً! المحلل المالي سيكمل معك الآن.', 'marketing', 600);
        setPhase('technical');
        setCurrentQIndex(0);
        await addAIMessage(QUESTIONS.technical[0].text, 'technical', 800);
      } else if (phase === 'technical') {
        await addAIMessage('ممتاز! وأخيراً المحلل المالي 💵 لإكمال النموذج المالي.', 'technical', 600);
        setPhase('financial');
        setCurrentQIndex(0);
        await addAIMessage(QUESTIONS.financial[0].text, 'financial', 800);
      } else if (phase === 'financial') {
        await addAIMessage('لقد جمعت جميع المعلومات اللازمة.\n\n🚀 الذكاء الاصطناعي يبدأ الآن في بناء دراستك الكاملة...', 'orchestrator', 600);
        setPhase('processing');
        setCurrentQIndex(0);
        // Simulate processing time
        setTimeout(() => {
          setProcessingDone(true);
          setPhase('review');
          addAIMessage('✅ اكتملت الدراسة بنجاح!\n\n🔍 تم إرسالها للخبير للمراجعة... (محاكاة: 3 ثوانٍ)', 'expert', 400);
          setTimeout(() => {
            addAIMessage('✅ اعتمد الخبير الدراسة مع ملاحظة واحدة:\n\n"توقعات العملاء في الشهر الأول قابلة للمراجعة — تم تعديل النموذج بناءً على بيانات السوق."', 'expert', 500);
            setTimeout(() => {
              setPhase('delivered');
            }, 800);
          }, 3000);
        }, 6000);
      }
    }
    inputRef.current?.focus();
  }, [currentQIndex, phase, inputValue, currentQ, addAIMessage]);

  // Progress calculation
  const getProgress = () => {
    const phaseOrder = ['welcome', 'marketing', 'technical', 'financial', 'processing', 'review', 'delivered'];
    const idx = phaseOrder.indexOf(phase);
    return Math.round(((idx + (currentQIndex / Math.max((QUESTIONS[phase] || []).length, 1))) / 6) * 100);
  };

  // Landing Screen
  if (screen === 'landing') {
    return (
      <>
        <style>{GLOBAL_STYLES}</style>
        <StarField />
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, position:'relative', zIndex:1 }}>
          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:48, animation:'fadeUp 0.6s ease' }}>
            <div style={{
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              width:80, height:80, borderRadius:20,
              background:'linear-gradient(135deg, #1E5FD4, #06B6D4)',
              fontSize:36, marginBottom:20,
              boxShadow:'0 0 40px rgba(30,95,212,0.4)',
              animation:'float 3s ease-in-out infinite',
            }}>⚡</div>
            <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:48, fontWeight:800, letterSpacing:-1, marginBottom:8 }}>
              Business Spike{' '}
              <span style={{ background:'linear-gradient(135deg, #06B6D4, #3B82F6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>AI</span>
            </h1>
            <p style={{ fontFamily:'Cairo,sans-serif', fontSize:18, color:'#8AA0C0', maxWidth:500, lineHeight:1.7 }}>
              منصة الذكاء الاصطناعي لدراسات الجدوى الهجينة
            </p>
            <p style={{ fontFamily:'Cairo,sans-serif', fontSize:14, color:'#6B85B0', marginTop:4 }}>
              دراسة جدوى احترافية في دقائق · بدل أسابيع
            </p>
          </div>

          {/* Feature cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:16, maxWidth:860, width:'100%', marginBottom:48, animation:'fadeUp 0.8s ease' }}>
            {[
              { icon:'📊', title:'محلل السوق', desc:'SWOT + PESTEL + حجم السوق', color:'#06B6D4' },
              { icon:'🏭', title:'مهندس العمليات', desc:'الهيكل التشغيلي والموارد', color:'#F59E0B' },
              { icon:'💵', title:'المحلل المالي', desc:'IRR + التدفق النقدي + نقطة التعادل', color:'#10B981' },
              { icon:'🔍', title:'مراجعة الخبير', desc:'دقة هجينة: AI + إنسان', color:'#8B5CF6' },
            ].map((f, i) => (
              <div key={i} style={{
                background:'rgba(10,22,40,0.8)', backdropFilter:'blur(16px)',
                border:`1px solid ${f.color}25`,
                borderRadius:16, padding:20, textAlign:'center',
                borderTop:`3px solid ${f.color}`,
                animation:`fadeUp ${0.6 + i * 0.1}s ease`,
                transition:'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform='none'}
              >
                <div style={{ fontSize:32, marginBottom:12, filter:`drop-shadow(0 0 10px ${f.color}60)` }}>{f.icon}</div>
                <div style={{ fontFamily:'Cairo,sans-serif', fontWeight:700, marginBottom:6, color:'#C8D6F0' }}>{f.title}</div>
                <div style={{ fontSize:12, color:'#6B85B0', fontFamily:'Cairo,sans-serif' }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', animation:'fadeUp 1s ease' }}>
            <button onClick={startStudy} style={{
              background:'linear-gradient(135deg, #1E5FD4, #3B82F6)',
              border:'none', borderRadius:14, padding:'16px 36px',
              color:'#fff', fontSize:16, fontFamily:'Cairo,sans-serif',
              cursor:'pointer', fontWeight:700,
              boxShadow:'0 8px 30px rgba(30,95,212,0.4)',
              transition:'all 0.2s',
              animation:'glow-pulse 2.5s infinite',
            }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform='none'}
            >
              🚀 ابدأ دراستك مجاناً
            </button>
            <button onClick={() => setScreen('mall')} style={{
              background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.4)',
              borderRadius:14, padding:'16px 28px',
              color:'#10B981', fontSize:15, fontFamily:'Cairo,sans-serif',
              cursor:'pointer', fontWeight:600, transition:'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(16,185,129,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(16,185,129,0.1)'}
            >
              🏪 Business Mall
            </button>
          </div>
          
          <div style={{ marginTop:32, fontSize:12, color:'#4A5A7A', fontFamily:'Cairo,sans-serif' }}>
            مدعوم بـ DeepSeek AI · مراجعة بشرية · 200+ دراسة تدريبية
          </div>
        </div>
      </>
    );
  }

  // Mall Screen
  if (screen === 'mall') {
    return (
      <>
        <style>{GLOBAL_STYLES}</style>
        <StarField />
        <div style={{ maxWidth:900, margin:'0 auto', padding:24, position:'relative', zIndex:1 }}>
          <BusinessMall onBack={() => setScreen('landing')} />
        </div>
      </>
    );
  }

  // App Screen — Chat Interface
  const progress = getProgress();

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <StarField />
      <div style={{ maxWidth:820, margin:'0 auto', padding:'20px 16px', position:'relative', zIndex:1, minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        
        {/* Top nav */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:20, padding:'10px 16px',
          background:'rgba(10,22,40,0.8)', backdropFilter:'blur(16px)',
          border:'1px solid rgba(59,130,246,0.15)', borderRadius:14,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={() => setScreen('landing')} style={{ background:'transparent', border:'none', color:'#6B85B0', cursor:'pointer', fontSize:18, padding:4 }}>←</button>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:'Syne,sans-serif', color:'#C8D6F0' }}>
              Business Spike <span style={{ color:'#3B82F6' }}>AI</span>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:12, color:'#6B85B0', fontFamily:'Cairo,sans-serif' }}>{progress}%</span>
            <div style={{ width:120 }}><ProgressBar value={progress} /></div>
          </div>
          <button onClick={() => setScreen('mall')} style={{
            background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)',
            borderRadius:8, padding:'5px 12px', color:'#10B981',
            fontSize:11, fontFamily:'Cairo,sans-serif', cursor:'pointer',
          }}>🏪 Mall</button>
        </div>

        {/* Phase steps */}
        <div style={{ display:'flex', gap:4, marginBottom:16, overflowX:'auto', paddingBottom:4 }}>
          {STUDY_FLOW.map((step, i) => {
            const phaseOrder = ['welcome','marketing','technical','financial','processing','review','delivered'];
            const currentIdx = phaseOrder.indexOf(phase);
            const stepIdx = phaseOrder.indexOf(step.id);
            const done = stepIdx < currentIdx;
            const active = stepIdx === currentIdx;
            const agent = AGENTS[step.agent];
            return (
              <div key={step.id} style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:5,
                  padding:'5px 10px', borderRadius:20,
                  background: done ? `${agent.color}20` : active ? `${agent.color}30` : 'rgba(255,255,255,0.04)',
                  border:`1px solid ${done || active ? agent.color + '60' : 'rgba(255,255,255,0.08)'}`,
                  fontSize:11, fontFamily:'Cairo,sans-serif',
                  color: done ? agent.color : active ? '#fff' : '#4A5A7A',
                  fontWeight: active ? 600 : 400,
                }}>
                  <span>{done ? '✓' : step.icon}</span>
                  <span>{step.label}</span>
                </div>
                {i < STUDY_FLOW.length - 1 && <div style={{ width:12, height:1, background:'rgba(59,130,246,0.2)', flexShrink:0 }}/>}
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:16 }}>
          
          {phase === 'processing' && !processingDone ? (
            <ProcessingPanel stage={phase} inputs={inputs} />
          ) : phase === 'delivered' ? (
            <StudyResults inputs={inputs} onPublish={() => setScreen('mall')} />
          ) : (
            <>
              {/* Chat area */}
              <div style={{
                flex:1, background:'rgba(8,16,32,0.6)', backdropFilter:'blur(16px)',
                border:'1px solid rgba(59,130,246,0.12)', borderRadius:18,
                padding:20, minHeight:400, maxHeight:520, overflowY:'auto',
              }}>
                {messages.map((msg, i) => (
                  <ChatMessage key={msg.id} msg={msg} isNew={i === newMsgIdx} />
                ))}
                {isTyping && (
                  <div style={{ display:'flex', gap:10, marginBottom:12, animation:'fadeIn 0.3s ease' }}>
                    <AgentBadge agentId={currentQ?.agent || 'orchestrator'} />
                    <div style={{ background:'rgba(15,31,61,0.9)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'18px 18px 18px 4px', padding:'12px 16px', display:'flex', gap:5, alignItems:'center' }}>
                      {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#3B82F6', animation:`pulse 1.2s ${i*0.2}s infinite` }}/>)}
                    </div>
                  </div>
                )}
                {phase === 'review' && !processingDone && (
                  <div style={{ display:'flex', justifyContent:'center', padding:20 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'Cairo,sans-serif', fontSize:13, color:'#6B85B0' }}>
                      <Spinner size={18} color='#8B5CF6' />
                      الخبير يراجع الدراسة...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input area */}
              {phase !== 'review' && currentQ && (
                <div style={{ background:'rgba(10,22,40,0.8)', backdropFilter:'blur(16px)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:16, padding:16 }}>
                  {currentQ?.type === 'select' ? (
                    <div>
                      <div style={{ fontSize:11, color:'#6B85B0', fontFamily:'Cairo,sans-serif', marginBottom:10, textAlign:'right' }}>اختر إجابة:</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'flex-end' }}>
                        {currentQ.options?.map((opt, i) => (
                          <SelectOption key={i} option={opt} onSelect={handleAnswer} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <button onClick={() => handleAnswer(inputValue)} style={{
                        background:'linear-gradient(135deg, #1E5FD4, #3B82F6)',
                        border:'none', borderRadius:10, width:42, height:42,
                        color:'#fff', cursor:'pointer', fontSize:18, flexShrink:0,
                        boxShadow:'0 4px 15px rgba(30,95,212,0.4)',
                        transition:'transform 0.1s',
                      }}
                      onMouseDown={e => e.currentTarget.style.transform='scale(0.95)'}
                      onMouseUp={e => e.currentTarget.style.transform='scale(1)'}
                      >↑</button>
                      <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAnswer(inputValue)}
                        placeholder={currentQ.placeholder || 'اكتب إجابتك هنا...'}
                        style={{
                          flex:1, background:'rgba(22,40,73,0.6)', border:'1px solid rgba(59,130,246,0.2)',
                          borderRadius:10, padding:'12px 16px', color:'#C8D6F0',
                          fontSize:14, fontFamily:'Cairo,sans-serif', outline:'none',
                          direction:'rtl', transition:'border-color 0.2s',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor='rgba(59,130,246,0.5)'}
                        onBlur={e => e.currentTarget.style.borderColor='rgba(59,130,246,0.2)'}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom agent indicators */}
        <div style={{ display:'flex', justifyContent:'center', gap:16, marginTop:16 }}>
          {Object.values(AGENTS).slice(0,4).map(agent => (
            <div key={agent.id} style={{ display:'flex', alignItems:'center', gap:5, opacity: phase === 'delivered' || agent.id === (currentQ?.agent || 'orchestrator') ? 1 : 0.35, transition:'opacity 0.3s' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:agent.color, animation: agent.id === (currentQ?.agent || 'orchestrator') && phase !== 'delivered' ? 'pulse 1.5s infinite' : 'none' }}/>
              <span style={{ fontSize:10, color:agent.color, fontFamily:'Cairo,sans-serif' }}>{agent.nameAr}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
