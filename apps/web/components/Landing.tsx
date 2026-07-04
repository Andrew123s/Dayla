import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Check,
  CloudSun,
  Compass,
  FileText,
  Heart,
  LayoutGrid,
  Leaf,
  MapPin,
  MessageCircle,
  MousePointer2,
  Plus,
  Repeat2,
  Smile,
  Sprout,
  Star,
  Users,
  Wallet,
} from 'lucide-react';
import './landing.css';

type TabId = 'plan' | 'community' | 'chat' | 'packing';

const STARS = (
  <span className="ld-stars" aria-label="5 out of 5 stars">
    {[0, 1, 2, 3, 4].map((i) => (
      <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
    ))}
  </span>
);

const CheckItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li>
    <span className="ld-check">
      <Check size={13} strokeWidth={3} />
    </span>
    {children}
  </li>
);

const PILLARS = [
  {
    icon: <LayoutGrid size={26} />,
    title: 'Everything in one canvas',
    copy: 'Notes, dates, budget, weather and packing live together on a flexible board — no more scattered chats and spreadsheets.',
  },
  {
    icon: <Users size={26} />,
    title: 'Plan together, in real time',
    copy: "Invite friends to your trip and watch ideas appear live. See who's online and build the plan as a group.",
  },
  {
    icon: <Sprout size={26} />,
    title: 'Made for mindful explorers',
    copy: 'Dayla is eco-conscious by design, helping you plan greener trips and explore the outdoors responsibly.',
  },
];

const FEATURES = [
  {
    icon: <FileText size={24} />,
    title: 'Visual planning canvas',
    copy: 'Drop sticky notes, photos and voice memos onto an infinite canvas. Drag, arrange and shape your trip your way.',
  },
  {
    icon: <Users size={24} />,
    title: 'Real-time collaboration',
    copy: 'Invite your crew by email and plan together live. See active collaborators and changes the moment they happen.',
  },
  {
    icon: <Wallet size={24} />,
    title: 'Budget tracking',
    copy: 'Track accommodation, transport, food and activities so everyone knows the cost — no surprises, no awkward math.',
  },
  {
    icon: <Briefcase size={24} />,
    title: 'Smart packing with Ntelipak',
    copy: 'AI-generated packing lists tailored to your destination, weather and activities, organized by luggage and category.',
  },
  {
    icon: <CloudSun size={24} />,
    title: 'Weather insights',
    copy: 'Built-in forecasts help you plan around the conditions and pack for exactly what the days ahead will bring.',
  },
  {
    icon: <Compass size={24} />,
    title: 'Community & discovery',
    copy: 'Share your adventures, discover new destinations and connect with friends through a social explore feed and chat.',
  },
];

// Feedback gathered from the Dayla early-access beta group.
const TESTIMONIALS = [
  {
    quote:
      '“We planned an entire group hiking weekend in one afternoon. Everyone dropped their ideas on the canvas and the budget added itself up. Zero group-chat chaos.”',
    name: 'Dave Diwuor',
    role: 'Beta tester · group trips',
    initials: 'DD',
    color: 'var(--brand)',
  },
  {
    quote:
      '“Coordinating a study trip used to be a nightmare. With Dayla we planned it live together, and the weather insights saved us from a very rainy day.”',
    name: 'Prince Emmanuel',
    role: 'Beta tester · study trips',
    initials: 'PE',
    color: '#0ea5e9',
  },
  {
    quote:
      "“Ntelipak's smart packing list meant I didn't forget a single thing for two weeks of camping. It's now the first app I open before any trip.”",
    name: 'Sarah Thomannh',
    role: 'Beta tester · backpacking',
    initials: 'ST',
    color: '#f59e0b',
  },
];

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'plan', label: 'Plan', icon: <LayoutGrid size={16} /> },
  { id: 'community', label: 'Community', icon: <Smile size={16} /> },
  { id: 'chat', label: 'Chat', icon: <MessageCircle size={16} /> },
  { id: 'packing', label: 'Ntelipak', icon: <Briefcase size={16} /> },
];

const PackedItem: React.FC<{ done?: boolean; children: React.ReactNode }> = ({ done, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f6f9f4', borderRadius: 12, padding: '10px 12px' }}>
    {done ? (
      <span style={{ width: 18, height: 18, borderRadius: 6, background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={11} strokeWidth={3.5} />
      </span>
    ) : (
      <span style={{ width: 18, height: 18, borderRadius: 6, border: '1.5px solid #d6d3d1', background: '#fff' }} />
    )}
    <span style={{ fontSize: 13, fontWeight: 600, color: done ? '#a8a29e' : '#44403c', textDecoration: done ? 'line-through' : 'none' }}>
      {children}
    </span>
  </div>
);

const Landing: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('plan');

  // Nav elevation follows the landing scroll container (body is overflow:hidden).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 24);
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-reveal with a small stagger; prefers-reduced-motion handled in CSS.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    els.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 90}ms`;
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollToId = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    rootRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="ld-root" ref={rootRef}>
      {/* NAV */}
      <nav className={`ld-nav${scrolled ? ' is-scrolled' : ''}`} aria-label="Main">
        <div className="ld-nav-inner">
          <a href="#top" onClick={scrollToId('top')} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }} aria-label="Dayla home">
            <img
              src="/icons/Daylap_Logo_Green.png"
              alt="Dayla"
              width={46}
              height={46}
              style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', display: 'block', boxShadow: '0 4px 12px -5px rgba(44,70,49,.5)' }}
            />
          </a>
          <div className="ld-nav-links">
            <a href="#how-it-works" onClick={scrollToId('how-it-works')}>How it works</a>
            <a href="#showcase" onClick={scrollToId('showcase')}>Product</a>
            <a href="#features" onClick={scrollToId('features')}>Features</a>
            <a href="#testimonials" onClick={scrollToId('testimonials')}>Stories</a>
          </div>
          <a href="/auth" className="ld-btn ld-btn-primary ld-btn-sm">
            Get Started
            <ArrowRight size={16} strokeWidth={2.2} />
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header className="ld-hero" id="top">
        <div className="ld-hero-glow" style={{ top: -120, left: -120, width: 420, height: 420, background: 'radial-gradient(circle,rgba(63,97,71,.18),transparent 70%)' }} aria-hidden="true" />
        <div className="ld-hero-glow" style={{ top: 60, right: -80, width: 420, height: 420, background: 'radial-gradient(circle,rgba(2,132,199,.12),transparent 70%)' }} aria-hidden="true" />

        <div className="ld-hero-grid">
          <div>
            <span className="ld-badge">
              <Leaf size={14} />
              Eco-conscious trip planning
            </span>

            <h1>
              Plan trips together,
              <br />
              <span className="ld-accent">effortlessly.</span>
            </h1>

            <p className="ld-hero-copy">
              Dayla brings real-time collaboration, budgeting, weather insights and smart packing
              onto one calm, shared canvas &mdash; so a weekend hangout, a study trip, or a full
              adventure all come together in one place.
            </p>

            <div className="ld-hero-ctas">
              <a href="/auth" className="ld-btn ld-btn-primary">
                Start planning free
                <ArrowRight size={18} strokeWidth={2.2} />
              </a>
              <a href="#showcase" onClick={scrollToId('showcase')} className="ld-btn ld-btn-secondary">
                See it in action
              </a>
            </div>

            <div className="ld-hero-proof">
              <div className="ld-proof-item">
                <Users size={18} color="#2c4631" />
                <span>Plan live with your whole crew</span>
              </div>
              <div className="ld-proof-item">
                {STARS}
                <span>Loved by our beta community</span>
              </div>
            </div>
          </div>

          {/* Animated phone + floating cards */}
          <div className="ld-hero-stage" aria-hidden="true">
            <div className="ld-phone">
              <div className="ld-phone-notch" />
              <div className="ld-phone-screen">
                <div className="ld-phone-header">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 16, color: '#1c1917' }}>Banff Crew Trip</p>
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: '#a8a29e', fontWeight: 600 }}>3 collaborators &middot; planning</p>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <span className="ld-avatar" style={{ background: '#3f6147' }}>AO</span>
                      <span className="ld-avatar" style={{ background: '#0ea5e9', marginLeft: -8 }}>MK</span>
                      <span className="ld-avatar" style={{ background: '#f59e0b', marginLeft: -8 }}>JD</span>
                    </div>
                  </div>
                </div>
                <div className="ld-phone-canvas">
                  <div className="ld-sticky" style={{ transform: 'rotate(-1.5deg)', background: '#fff' }}>
                    <div className="ld-sticky-label" style={{ color: '#2c4631' }}>
                      <MapPin size={13} />
                      <span>Destination</span>
                    </div>
                    <p className="ld-sticky-value">Banff, Canada</p>
                  </div>
                  <div className="ld-sticky" style={{ transform: 'rotate(1deg)', background: 'var(--amber-soft)' }}>
                    <div className="ld-sticky-label" style={{ color: 'var(--amber)' }}>
                      <Calendar size={13} />
                      <span>Dates</span>
                    </div>
                    <p className="ld-sticky-value">Jul 12 &ndash; 18</p>
                  </div>
                  <div style={{ overflow: 'hidden', borderRadius: 15, background: '#fff', boxShadow: '0 4px 12px -4px rgba(0,0,0,.1)' }}>
                    <div style={{ height: 62, background: 'linear-gradient(120deg,#3f6147,#0ea5e9)', display: 'flex', alignItems: 'flex-end', padding: '9px 11px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Sunrise summit hike</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 11px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--sky)', fontSize: 11, fontWeight: 700 }}>
                        <CloudSun size={13} />
                        Sunny &middot; 21&deg;C
                      </span>
                      <span style={{ background: 'var(--brand-soft)', color: 'var(--brand)', fontSize: 9.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>Day 2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather card */}
            <div className="ld-float-card pos-weather" data-float style={{ top: 34, left: -6, transform: 'rotate(-7deg)', background: 'var(--sky-soft)', borderColor: '#cfe9fb', animation: 'ld-float-b 6s ease-in-out infinite' }}>
              <div className="ld-float-label" style={{ color: 'var(--sky)' }}>
                <CloudSun size={15} />
                <span style={{ color: 'var(--text)' }}>Weather</span>
              </div>
              <p className="ld-float-value">21&deg;C</p>
              <p className="ld-float-sub">Clear all weekend</p>
            </div>

            {/* Budget card */}
            <div className="ld-float-card pos-budget" data-float style={{ bottom: 54, left: -14, transform: 'rotate(5deg)', animation: 'ld-float-a 6.8s ease-in-out infinite .6s' }}>
              <div className="ld-float-label" style={{ color: 'var(--brand)' }}>
                <Wallet size={15} />
                <span style={{ color: 'var(--text)' }}>Budget</span>
              </div>
              <p className="ld-float-value">$1,240</p>
              <p className="ld-float-sub">per person &middot; on track</p>
            </div>

            {/* Smart packing card */}
            <div className="ld-float-card pos-packing" data-float style={{ top: 130, right: -18, transform: 'rotate(6deg)', width: 158, animation: 'ld-float-b 7.4s ease-in-out infinite .3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Smart packing</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)' }}>68%</span>
              </div>
              <div className="ld-progress-track" style={{ marginTop: 8 }}>
                <div className="ld-progress-fill" style={{ width: '68%' }} />
              </div>
              <p className="ld-float-sub" style={{ marginTop: 9 }}>Boots, jacket, filter&hellip;</p>
            </div>

            {/* Live cursors */}
            <div data-cursor style={{ position: 'absolute', top: 96, right: 64, zIndex: 6, animation: 'ld-cursor-drift 5s ease-in-out infinite' }}>
              <MousePointer2 size={20} fill="#0ea5e9" color="#fff" strokeWidth={1.5} style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.25))' }} />
              <span className="ld-cursor-tag" style={{ background: '#0ea5e9' }}>Maya</span>
            </div>
            <div data-cursor style={{ position: 'absolute', bottom: 150, left: 60, zIndex: 6, animation: 'ld-cursor-drift 6.5s ease-in-out infinite 1.2s' }}>
              <MousePointer2 size={20} fill="#f59e0b" color="#fff" strokeWidth={1.5} style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.25))' }} />
              <span className="ld-cursor-tag" style={{ background: '#f59e0b', boxShadow: '0 4px 10px rgba(70,40,2,.2)' }}>Sam</span>
            </div>
          </div>
        </div>
      </header>

      {/* WHAT DAYLA DOES */}
      <section className="ld-section" id="how-it-works" style={{ background: '#fff' }}>
        <div className="ld-section-head" data-reveal>
          <span className="ld-eyebrow">What Dayla does</span>
          <h2 className="ld-section-title">Group planning that feels natural and stress-free</h2>
          <p className="ld-section-sub">Dayla pulls collaboration, budgeting, location discovery and community sharing into one simple, clean interface.</p>
        </div>

        <div className="ld-grid-3">
          {PILLARS.map((p) => (
            <div className="ld-pillar" data-reveal key={p.title}>
              <div className="ld-icon-tile">{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="ld-section" id="showcase" style={{ background: 'linear-gradient(180deg,#f6f9f4,#eef4ec)' }}>
        <div className="ld-section-head" data-reveal>
          <span className="ld-eyebrow">A look inside</span>
          <h2 className="ld-section-title">One app, the whole adventure</h2>
          <p className="ld-section-sub">Switch between the tools your trip runs on &mdash; planning, community, chat and smart packing.</p>
        </div>

        <div className="ld-tabs" role="tablist" aria-label="Product areas" data-reveal>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className="ld-tab"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ld-panel-wrap">
          <div className="ld-panel" id="panel-plan" role="tabpanel" aria-labelledby="tab-plan" hidden={activeTab !== 'plan'}>
            <div>
              <span className="ld-panel-chip">Plan Dashboard</span>
              <h3>A canvas that thinks like your trip</h3>
              <p className="ld-panel-copy">
                Drop sticky notes, photos and voice memos onto an infinite board. Drag, arrange and
                shape the plan your way &mdash; with budget and weather baked right in.
              </p>
              <ul className="ld-check-list">
                <CheckItem>Sticky notes, calendar &amp; budget in one place</CheckItem>
                <CheckItem>Drag-and-drop with grid snapping</CheckItem>
                <CheckItem>Invite collaborators by email</CheckItem>
              </ul>
            </div>
            <div className="ld-panel-visual is-dotted">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                <div className="ld-sticky" style={{ transform: 'rotate(-1.5deg)', background: '#fff' }}>
                  <div className="ld-sticky-label" style={{ color: 'var(--brand)' }}>
                    <MapPin size={14} />
                    <span>Destination</span>
                  </div>
                  <p className="ld-sticky-value" style={{ fontSize: 14 }}>Banff, Canada</p>
                </div>
                <div className="ld-sticky" style={{ transform: 'rotate(1.5deg)', background: 'var(--amber-soft)' }}>
                  <div className="ld-sticky-label" style={{ color: 'var(--amber)' }}>
                    <Calendar size={14} />
                    <span>Dates</span>
                  </div>
                  <p className="ld-sticky-value" style={{ fontSize: 14 }}>Jul 12 &ndash; 18</p>
                </div>
                <div style={{ gridColumn: 'span 2', overflow: 'hidden', borderRadius: 16, background: '#fff', boxShadow: '0 6px 16px -6px rgba(0,0,0,.12)' }}>
                  <div style={{ height: 74, background: 'linear-gradient(120deg,#3f6147,#0ea5e9)', display: 'flex', alignItems: 'flex-end', padding: '11px 13px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Sunrise summit hike</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--sky)', fontSize: 12, fontWeight: 700 }}>
                      <CloudSun size={14} />
                      Sunny &middot; 21&deg;C
                    </span>
                    <span style={{ background: 'var(--brand-soft)', color: 'var(--brand)', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>Day 2</span>
                  </div>
                </div>
                <div className="ld-sticky" style={{ transform: 'rotate(-1deg)', background: 'var(--sky-soft)' }}>
                  <div className="ld-sticky-label" style={{ color: 'var(--sky)' }}>
                    <Wallet size={14} />
                    <span>Budget</span>
                  </div>
                  <p className="ld-sticky-value" style={{ fontSize: 14 }}>$1,240 / person</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #d6d3d1', borderRadius: 16, color: '#a8a29e', minHeight: 64 }}>
                  <Plus size={22} />
                </div>
              </div>
            </div>
          </div>

          <div className="ld-panel" id="panel-community" role="tabpanel" aria-labelledby="tab-community" hidden={activeTab !== 'community'}>
            <div>
              <span className="ld-panel-chip">Explore</span>
              <h3>Share the journey, find the next one</h3>
              <p className="ld-panel-copy">
                Post your adventures, like and comment on others, and discover destinations through a
                social feed built for explorers.
              </p>
              <ul className="ld-check-list">
                <CheckItem>Posts with photos, location &amp; reposts</CheckItem>
                <CheckItem>Likes, comments &amp; live notifications</CheckItem>
                <CheckItem>Discover places from the community</CheckItem>
              </ul>
            </div>
            <div className="ld-panel-visual">
              <div className="ld-mini-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--brand)', color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: '38px', textAlign: 'center', flex: 'none' }}>MK</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#292524' }}>Maya K.</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#a8a29e', fontWeight: 600 }}>Banff, Canada &middot; 2h</p>
                  </div>
                </div>
                <p style={{ margin: '13px 0 0', fontSize: 14, lineHeight: 1.55, color: '#44403c' }}>Caught the sunrise from the summit &mdash; worth every early alarm.</p>
                <div style={{ marginTop: 12, height: 150, borderRadius: 14, background: 'linear-gradient(130deg,#3f6147,#0ea5e9 70%,#38bdf8)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 13, color: '#78716c' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#ef4444' }}>
                    <Heart size={17} fill="currentColor" strokeWidth={0} />
                    128
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                    <MessageCircle size={17} />
                    24
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                    <Repeat2 size={17} />
                    Repost
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="ld-panel" id="panel-chat" role="tabpanel" aria-labelledby="tab-chat" hidden={activeTab !== 'chat'}>
            <div>
              <span className="ld-panel-chip">Chat</span>
              <h3>Keep the crew on the same page</h3>
              <p className="ld-panel-copy">
                Real-time 1-to-1 and group messaging with typing indicators and file sharing &mdash;
                the conversation lives right next to the plan.
              </p>
              <ul className="ld-check-list">
                <CheckItem>Instant delivery, live presence</CheckItem>
                <CheckItem>Group chats with invite links</CheckItem>
                <CheckItem>Tap a friend to chat instantly</CheckItem>
              </ul>
            </div>
            <div className="ld-panel-visual">
              <div className="ld-mini-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingBottom: 12, borderBottom: '1px solid #f0efed' }}>
                  <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#0ea5e9', color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: '32px', textAlign: 'center', flex: 'none' }}>BC</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#292524' }}>Banff Crew</p>
                    <p style={{ margin: '2px 0 0', fontSize: 10.5, color: 'var(--brand)', fontWeight: 700 }}>3 online</p>
                  </div>
                </div>
                <div style={{ alignSelf: 'flex-start', maxWidth: '78%', background: '#f1f5f1', borderRadius: '15px 15px 15px 4px', padding: '9px 13px' }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#292524', lineHeight: 1.45 }}>Who's driving up Friday?</p>
                </div>
                <div style={{ alignSelf: 'flex-end', maxWidth: '78%', background: 'var(--brand)', borderRadius: '15px 15px 4px 15px', padding: '9px 13px' }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#fff', lineHeight: 1.45 }}>I've got room for 3 &mdash; adding it to the board now</p>
                </div>
                <div style={{ alignSelf: 'flex-start', maxWidth: '78%', background: '#f1f5f1', borderRadius: '15px 15px 15px 4px', padding: '9px 13px' }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#292524', lineHeight: 1.45 }}>Amazing, see you all there!</p>
                </div>
                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px', background: '#f1f5f1', borderRadius: 999 }}>
                  {[0, 0.2, 0.4].map((delay) => (
                    <span key={delay} style={{ width: 6, height: 6, borderRadius: '50%', background: '#a8a29e', animation: `ld-pulse-dot 1.2s ease-in-out infinite ${delay}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="ld-panel" id="panel-packing" role="tabpanel" aria-labelledby="tab-packing" hidden={activeTab !== 'packing'}>
            <div>
              <span className="ld-panel-chip">Ntelipak &middot; AI</span>
              <h3>Pack smart, forget nothing</h3>
              <p className="ld-panel-copy">
                Ntelipak builds packing lists from your destination, activities, duration and weather
                &mdash; organized by luggage and category, with duplicate checks.
              </p>
              <ul className="ld-check-list">
                <CheckItem>AI lists from weather &amp; activities</CheckItem>
                <CheckItem>Organize by luggage &amp; category</CheckItem>
                <CheckItem>Reusable templates for every trip</CheckItem>
              </ul>
            </div>
            <div className="ld-panel-visual">
              <div className="ld-mini-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#292524' }}>Backpack &middot; 7 days</p>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)' }}>68% packed</span>
                </div>
                <div className="ld-progress-track" style={{ marginTop: 10, height: 7 }}>
                  <div className="ld-progress-fill" style={{ width: '68%' }} />
                </div>
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <PackedItem done>Hiking boots</PackedItem>
                  <PackedItem done>Rain jacket</PackedItem>
                  <PackedItem>Water filter</PackedItem>
                  <PackedItem done>Headlamp</PackedItem>
                  <PackedItem>First-aid kit</PackedItem>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="ld-section" id="features" style={{ background: '#fff' }}>
        <div className="ld-section-head" data-reveal>
          <span className="ld-eyebrow">Features</span>
          <h2 className="ld-section-title">Everything you need to plan the perfect trip</h2>
          <p className="ld-section-sub">Powerful tools that make planning trips, activities and group experiences simple, social and genuinely enjoyable.</p>
        </div>

        <div className="ld-grid-3" style={{ gap: 24 }}>
          {FEATURES.map((f) => (
            <div className="ld-feature-card" data-reveal key={f.title}>
              <div className="ld-icon-tile">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="ld-section" id="testimonials" style={{ background: 'var(--cream)' }}>
        <div className="ld-section-head" data-reveal>
          <span className="ld-eyebrow">From our beta community</span>
          <h2 className="ld-section-title">Loved by planners and adventurers</h2>
          <p className="ld-section-sub">Real feedback from the early-access group helping us shape Dayla, trip by trip.</p>
        </div>

        <div className="ld-grid-3" style={{ gap: 24 }}>
          {TESTIMONIALS.map((t) => (
            <div className="ld-quote-card" data-reveal key={t.name}>
              {STARS}
              <blockquote>{t.quote}</blockquote>
              <div className="ld-quote-person">
                <span className="ld-quote-avatar" style={{ background: t.color }}>{t.initials}</span>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="ld-section" id="cta" style={{ paddingTop: 40, background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }} data-reveal>
          <div className="ld-cta-card">
            <div aria-hidden="true" style={{ position: 'absolute', top: -80, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,.1)', filter: 'blur(10px)' }} />
            <div aria-hidden="true" style={{ position: 'absolute', bottom: -100, left: -40, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,.08)', filter: 'blur(10px)' }} />
            <h2>Start planning your next adventure</h2>
            <p>Gather your crew, map out the trip and travel smarter together. Get started with Dayla in minutes &mdash; it's free.</p>
            <div style={{ position: 'relative', marginTop: 34, display: 'flex', justifyContent: 'center' }}>
              <a href="/auth" className="ld-btn ld-btn-invert">
                Get Started
                <ArrowRight size={18} strokeWidth={2.2} />
              </a>
            </div>
            <p style={{ margin: '18px 0 0', fontSize: 13.5, color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>Free to start &bull; No credit card needed</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ld-footer">
        <div className="ld-footer-inner">
          <a href="#top" onClick={scrollToId('top')} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }} aria-label="Back to top">
            <img
              src="/icons/Daylap_Logo_Green.png"
              alt="Dayla"
              width={44}
              height={44}
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
            />
          </a>
          <nav className="ld-footer-nav" aria-label="Legal">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </nav>
          <p style={{ margin: 0, fontSize: 14, color: '#a8a29e' }}>&copy; {new Date().getFullYear()} Dayla. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
