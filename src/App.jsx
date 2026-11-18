import { useEffect, useMemo, useRef, useState } from 'react';
import Scene from './Scene.jsx';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Download, ExternalLink, FileText, FlaskConical, Heart, HeartHandshake, Info, Layers3, Menu, MessageCircle, Microscope, MousePointer2, Pause, Pill, Play, Plus, RotateCcw, Search, Shield, ShieldCheck, Stethoscope, TestTube2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { chapters, glossary, lifecycle, preventionOptions, quizQuestions, sources, testTypes, transmissionFacts, virusLayers } from './data.js';

const storageKey = 'hiv-atlas-progress-v1';

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(saved) ? saved.filter((id) => chapters.some((chapter) => chapter.id === id)) : [];
  } catch {
    return [];
  }
}

function Brand() {
  return <a className="brand" href="#top" aria-label="HIV Atlas home">
    <span className="brand-mark" aria-hidden="true"><span>H</span><i /></span>
    <span>HIV<span className="brand-atlas">Atlas</span><small>KNOWLEDGE IS POWER</small></span>
  </a>;
}

function SectionHeading({ eyebrow, title, text, align = 'left' }) {
  return <div className={`section-heading ${align}`}>
    <p className="eyebrow"><span />{eyebrow}</p>
    <h2>{title}</h2>
    {text && <p className="section-intro">{text}</p>}
  </div>;
}

function SourceLink({ href, children = 'View source', className = '' }) {
  return <a className={`source-link ${className}`} href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={14} aria-hidden="true" /></a>;
}

function EmergencyDialog({ onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const focusable = document.querySelectorAll('.emergency-dialog button, .emergency-dialog a');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; previousFocus?.focus(); };
  }, [onClose]);
  return <div className="modal-backdrop" onClick={onClose}>
    <section className="emergency-dialog" role="dialog" aria-modal="true" aria-labelledby="emergency-title" onClick={(event) => event.stopPropagation()}>
      <button className="icon-button dialog-close" aria-label="Close urgent care guide" onClick={onClose} ref={closeRef}><X /></button>
      <span className="dialog-icon"><Clock3 /></span>
      <p className="eyebrow">Time-sensitive care</p>
      <h2 id="emergency-title">A possible exposure in the last 72 hours?</h2>
      <p>PEP can prevent HIV after a possible exposure. Every hour matters. Start as soon as possible, ideally within 24 hours.</p>
      <ol className="emergency-steps">
        <li><span>1</span><div><strong>Go to urgent or emergency care now.</strong><p>A hospital emergency department, urgent care clinic, or licensed healthcare provider can assess you.</p></div></li>
        <li><span>2</span><div><strong>Say you need HIV PEP.</strong><p>Mention when the possible exposure happened. Do not wait for symptoms or a partner’s test result.</p></div></li>
        <li><span>3</span><div><strong>Follow the prescribed 28-day course.</strong><p>Your care team will arrange testing and follow-up. Ask about PrEP if exposure may happen again.</p></div></li>
      </ol>
      <a className="button button-primary button-full" href={sources.locator} target="_blank" rel="noreferrer">Find U.S. testing & care<ArrowUpRight size={18} /></a>
      <p className="dialog-note">Outside the U.S., contact your nearest emergency service, sexual health clinic, or HIV service. This guide does not replace medical care.</p>
      <SourceLink href={sources.pep}>Read CDC PEP guidance</SourceLink>
    </section>
  </div>;
}

function Hero() {
  return <section className="hero" id="top">
    <div className="hero-orbit orbit-one" aria-hidden="true" />
    <div className="hero-orbit orbit-two" aria-hidden="true" />
    <div className="container hero-grid">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow"><span />SCIENCE, MADE HUMAN</p>
        <h1>Clarity changes<br /><em>everything.</em></h1>
        <p className="hero-lead">HIV is manageable. Knowledge is powerful.<br className="desktop-break" /> Explore the science, prevention, and care—<br className="desktop-break" /> without fear or judgment.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#learn">Start exploring<ArrowRight size={18} /></a>
          <a className="button button-text" href="#lab"><span className="play-icon"><Play size={13} fill="currentColor" /></span>Enter the 3D lab</a>
        </div>
        <div className="hero-trust"><ShieldCheck size={17} /><span>Evidence-based. Plain language. Zero stigma.</span></div>
      </div>
      <div className="hero-visual">
        <div className="hero-scene-label"><span className="live-dot" />INTERACTIVE 3D MODEL</div>
        <Scene />
        <div className="model-label label-envelope"><span>01</span><div><strong>Envelope + Env</strong><small>Bilayer and sparse trimers</small></div></div>
        <div className="model-label label-rna"><span>02</span><div><strong>p24 capsid</strong><small>Closed conical RNA core</small></div></div>
        <div className="hero-scene-hint"><MousePointer2 size={14} />Drag to explore</div>
      </div>
    </div>
    <div className="container hero-bottom">
      <a href="#learn" className="scroll-cue"><ArrowDown size={17} />SCROLL TO LEARN</a>
      <div className="hero-stat"><strong>41.0<span>million</span></strong><p>people were living with HIV<br />worldwide at the end of 2025.</p><SourceLink href={sources.who}>WHO, 2026</SourceLink></div>
      <div className="hero-stat"><strong>U<span>=</span>U</strong><p>Undetectable = untransmittable.<br />Treatment prevents sexual transmission.</p><SourceLink href={sources.uu}>The science is clear</SourceLink></div>
    </div>
  </section>;
}

function LearningPath({ completed, onOpenChapter }) {
  return <section className="section learning-section" id="learn">
    <div className="container">
      <div className="learning-top"><SectionHeading eyebrow="YOUR LEARNING PATH" title={<>Six chapters.<br />One clearer picture.</>} text="Start anywhere. Each chapter builds your understanding, one useful fact at a time." /><div className="progress-summary"><div className="progress-ring" style={{ '--progress': `${(completed.length / chapters.length) * 360}deg` }}><span>{completed.length}<small>/ 6</small></span></div><div><strong>Your progress</strong><p>Saved on this device.<br />No account needed.</p>{completed.length > 0 && <span className="progress-note"><Check size={13} />Keep going</span>}</div></div></div>
      <div className="chapter-grid">
        {chapters.map((chapter) => <button className={`chapter-card chapter-${chapter.color} ${completed.includes(chapter.id) ? 'chapter-complete' : ''}`} key={chapter.id} onClick={() => onOpenChapter(chapter.id)}>
          <div className="chapter-top"><span className="chapter-number">{chapter.number}</span><span className="chapter-time"><Clock3 size={13} />{chapter.time}</span></div>
          <ChapterArt chapter={chapter.id} />
          <div className="chapter-content"><span className="chapter-eyebrow">{chapter.short}</span><h3>{chapter.title}</h3><p>{chapter.description}</p><span className="chapter-link">{completed.includes(chapter.id) ? <><CheckCircle2 size={16} />Review chapter</> : <>Explore chapter<ArrowRight size={17} /></>}</span></div>
        </button>)}
      </div>
    </div>
  </section>;
}

function ChapterArt({ chapter }) {
  if (chapter === 'basics') return <div className="chapter-art basics-art" aria-hidden="true"><div className="cell cell-one"><span /></div><div className="cell cell-two"><span /></div><div className="mini-virus"><i /><i /><i /><i /><i /><i /><span /></div><div className="art-orbit" /></div>;
  if (chapter === 'transmission') return <div className="chapter-art transmission-art" aria-hidden="true"><div className="path-line" /><span className="path-dot dot-a" /><span className="path-dot dot-b" /><span className="path-dot dot-c" /><div className="fact-symbol">?<span /></div><div className="fact-stamp"><Check size={26} /></div></div>;
  if (chapter === 'prevention') return <div className="chapter-art prevention-art" aria-hidden="true"><div className="shield-shape"><Shield size={74} strokeWidth={1.25} /><span /></div><div className="shield-orbit orbit-a" /><div className="shield-orbit orbit-b" /><Plus className="art-plus" size={24} /></div>;
  if (chapter === 'testing') return <div className="chapter-art testing-art" aria-hidden="true"><div className="test-tube"><span className="tube-cap" /><span className="tube-glass"><i /><i /><i /></span></div><div className="test-ring ring-one" /><div className="test-ring ring-two" /><span className="test-spark">+</span></div>;
  if (chapter === 'treatment') return <div className="chapter-art treatment-art" aria-hidden="true"><div className="pill-large"><span /><i /><i /><i /></div><div className="treatment-line" /><span className="treatment-dot" /><Plus className="art-plus" size={24} /></div>;
  return <div className="chapter-art living-art" aria-hidden="true"><div className="living-circle circle-left" /><div className="living-circle circle-right" /><Heart size={62} strokeWidth={1.2} /><span className="living-dot" /><div className="living-orbit" /></div>;
}

function ScienceLab() {
  const sceneRef = useRef(null);
  const [tab, setTab] = useState('anatomy');
  const [layer, setLayer] = useState('envelope');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [cutaway, setCutaway] = useState(true);
  const [viewerInteractive, setViewerInteractive] = useState(false);
  const layerData = virusLayers.find((item) => item.id === layer);
  const stepData = lifecycle[step];
  const selectTab = (next) => { setTab(next); setPlaying(false); };
  const selectLayer = (next) => { setLayer(next); setCutaway(true); setPlaying(false); };
  const resetView = () => { sceneRef.current?.resetCamera(); setPlaying(false); };
  return <section className="section lab-section" id="lab">
    <div className="container">
      <div className="lab-heading"><SectionHeading eyebrow="THE INTERACTIVE LAB" title={<>Small virus.<br />Big understanding.</>} text="Move beyond the textbook. Explore HIV’s structure and see how treatment interrupts its life cycle." /><div className="lab-badge"><FlaskConical size={18} /><span>Designed for curiosity.<br /><strong>Not to scale.</strong></span></div></div>
      <div className="lab-tabs" role="tablist" aria-label="3D laboratory views"><button role="tab" aria-selected={tab === 'anatomy'} aria-controls="anatomy-panel" id="anatomy-tab" onClick={() => selectTab('anatomy')}><Layers3 size={17} />Inside the virus</button><button role="tab" aria-selected={tab === 'lifecycle'} aria-controls="lifecycle-panel" id="lifecycle-tab" onClick={() => selectTab('lifecycle')}><Microscope size={17} />The life cycle</button></div>
      {tab === 'anatomy' ? <div className="lab-workspace" id="anatomy-panel" role="tabpanel" aria-labelledby="anatomy-tab">
        <div className="lab-viewer">
          <div className="viewer-top"><span><span className="live-dot" />MATURE HIV-1 / 3D VIEW</span><span>STRUCTURE-INFORMED</span></div>
          <div className="view-mode" role="group" aria-label="Model view"><button className={!cutaway ? 'active' : ''} aria-pressed={!cutaway} onClick={() => setCutaway(false)}>Exterior</button><button className={cutaway ? 'active' : ''} aria-pressed={cutaway} onClick={() => setCutaway(true)}>Cutaway</button></div>
          <Scene ref={sceneRef} mode="explorer" activeLayer={layer} playing={playing} cutaway={cutaway} onSelect={selectLayer} onAvailability={setViewerInteractive} />
          <div className="viewer-controls">
            <button className="icon-button" disabled={!viewerInteractive} aria-label={playing ? 'Pause model rotation' : 'Play model rotation'} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>
            <span><MousePointer2 size={14} />Drag · scroll · select</span>
            <div className="camera-controls" role="group" aria-label="Camera controls"><button className="icon-button" disabled={!viewerInteractive} aria-label="Zoom in" onClick={() => sceneRef.current?.zoomIn()}><ZoomIn size={17} /></button><button className="icon-button" disabled={!viewerInteractive} aria-label="Zoom out" onClick={() => sceneRef.current?.zoomOut()}><ZoomOut size={17} /></button><button className="icon-button" disabled={!viewerInteractive} aria-label="Reset view" onClick={resetView}><RotateCcw size={17} /></button></div>
          </div>
        </div>
        <div className="lab-info"><p className="eyebrow">EXPLORE THE STRUCTURE</p><div className="layer-buttons" role="group" aria-label="Virus components">{virusLayers.map((item, index) => <button key={item.id} className={layer === item.id ? 'active' : ''} onClick={() => selectLayer(item.id)} aria-pressed={layer === item.id}><span>{String(index + 1).padStart(2, '0')}</span>{item.label}<Plus size={16} /></button>)}</div><div className="layer-detail" key={layer} aria-live="polite"><span className="detail-tag">{layerData.tag}</span><h3>{layerData.label}</h3><p>{layerData.text}</p><div className="science-note"><Info size={17} /><p>{layerData.detail}</p></div></div><SourceLink href={sources[layerData.source]}>Read the structural research</SourceLink></div>
      </div> : <div className="lab-workspace lifecycle-workspace" id="lifecycle-panel" role="tabpanel" aria-labelledby="lifecycle-tab">
        <div className="lab-viewer"><div className="viewer-top"><span><span className="live-dot" />LIFE CYCLE / INTERACTIVE</span><span>STEP {stepData.step} / 07</span></div><Scene mode="lifecycle" activeStep={step} playing={playing} onAvailability={setViewerInteractive} /><div className="cell-stage" aria-hidden="true"><span /><span /><span /></div><div className="lifecycle-diagram" aria-hidden="true"><span className={`diagram-cell step-${step}`} /><span className={`diagram-nucleus step-${step}`} /><span className="diagram-label">{step < 2 ? 'CD4 CELL MEMBRANE' : step < 5 ? 'INSIDE THE CD4 CELL' : 'NEW VIRAL PARTICLE'}</span></div><div className="viewer-controls"><button className="icon-button" disabled={!viewerInteractive} aria-label={playing ? 'Pause model rotation' : 'Play model rotation'} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={17} /> : <Play size={17} />}</button><span>Illustrative model, not to scale</span></div></div>
        <div className="lab-info lifecycle-info"><span className="detail-tag">STEP {stepData.step} · {stepData.short}</span><h3>{stepData.title}</h3><p>{stepData.text}</p><div className="science-note"><Microscope size={17} /><p>{stepData.science}</p></div><div className="intervention-note"><Pill size={18} /><div><strong>Where treatment fits</strong><p>{stepData.intervention}</p></div></div><div className="step-controls"><button className="button button-outline" disabled={step === 0} onClick={() => setStep(step - 1)}><ChevronLeft size={17} />Previous</button><button className="button button-primary" onClick={() => setStep((step + 1) % lifecycle.length)}>{step === lifecycle.length - 1 ? 'Start again' : 'Next step'}{step === lifecycle.length - 1 ? <RotateCcw size={16} /> : <ChevronRight size={17} />}</button></div></div>
        <div className="lifecycle-steps" role="group" aria-label="HIV life cycle stages">{lifecycle.map((item, index) => <button key={item.id} className={step === index ? 'active' : step > index ? 'visited' : ''} aria-pressed={step === index} onClick={() => setStep(index)}><span>{step > index ? <Check size={13} /> : item.step}</span><strong>{item.title}</strong></button>)}</div>
      </div>}
      <p className="lab-footnote"><Info size={14} />Structure-informed, not to scale. Protein shapes, counts, and sectional views are schematic; the capsid window is an educational cutaway.</p>
    </div>
  </section>;
}

function Transmission() {
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(4);
  const visibleFacts = transmissionFacts.map((fact, index) => ({ ...fact, index })).filter((fact) => filter === 'all' || (filter === 'possible' ? fact.possible : !fact.possible));
  return <section className="section transmission-section" id="transmission">
    <div className="container transmission-grid">
      <div className="transmission-copy"><SectionHeading eyebrow="TRANSMISSION, WITHOUT THE MYTHS" title={<>Know the facts.<br /><em>Drop the fear.</em></>} text="HIV is transmitted through specific body fluids and activities—not through everyday life." /><div className="no-transmission"><HeartHandshake size={30} /><div><strong>Connection is not a risk.</strong><p>Hugging, sharing a meal, or using the same bathroom does not transmit HIV. Stigma helps no one.</p></div></div><a className="button button-outline" href="#quiz">Test what you know<ArrowRight size={17} /></a></div>
      <div className="fact-explorer"><div className="fact-filter" role="group" aria-label="Filter transmission facts"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')} aria-pressed={filter === 'all'}>All facts</button><button className={filter === 'possible' ? 'active' : ''} onClick={() => setFilter('possible')} aria-pressed={filter === 'possible'}>Transmission routes</button><button className={filter === 'none' ? 'active' : ''} onClick={() => setFilter('none')} aria-pressed={filter === 'none'}>No transmission</button></div><div className="fact-list">{visibleFacts.map((fact) => <div className={`fact-item ${open === fact.index ? 'open' : ''}`} key={fact.title}><button aria-expanded={open === fact.index} aria-controls={`fact-${fact.index}`} onClick={() => setOpen(open === fact.index ? null : fact.index)}><span className={`fact-status ${fact.possible ? 'possible' : 'none'}`}>{fact.possible ? <Info size={15} /> : <Check size={15} />}</span><strong>{fact.title}</strong><Plus size={18} /></button><div id={`fact-${fact.index}`} hidden={open !== fact.index}><p>{fact.text}</p><span>{fact.possible ? 'POSSIBLE TRANSMISSION ROUTE' : 'NO HIV TRANSMISSION'}</span></div></div>)}</div><SourceLink href={sources.who}>WHO transmission facts</SourceLink></div>
    </div>
  </section>;
}

function Prevention({ onEmergency }) {
  const [selected, setSelected] = useState('prep');
  const option = preventionOptions.find((item) => item.id === selected);
  return <section className="section prevention-section" id="prevention">
    <div className="container"><SectionHeading eyebrow="YOUR PREVENTION TOOLKIT" title="Protection is personal." text="There is no single right approach for everyone. Understand your options and build a plan with a trusted healthcare provider." align="center" />
      <div className="prevention-layout"><div className="prevention-options" role="group" aria-label="HIV prevention options">{preventionOptions.map((item) => <button key={item.id} className={selected === item.id ? 'active' : ''} onClick={() => setSelected(item.id)} aria-pressed={selected === item.id}><span className="option-number">{item.number}</span><div><strong>{item.title}</strong><small>{item.tag}</small></div><ArrowRight size={18} /></button>)}</div><div className="prevention-detail" key={selected}><div className="prevention-detail-top"><span>{option.tag}</span><ShieldCheck size={30} /></div><h3>{option.title}</h3><p>{option.text}</p><div className="prevention-action"><strong>What to know</strong><p>{option.action}</p></div><div className="prevention-detail-bottom"><span>{option.type}</span>{selected === 'pep' ? <button className="text-link" onClick={onEmergency}>Open urgent care guide<ArrowRight size={15} /></button> : <SourceLink href={selected === 'prep' ? sources.prep : selected === 'art' ? sources.uu : sources.who}>Official guidance</SourceLink>}</div></div></div>
      <div className="pep-banner"><div className="pep-icon"><Clock3 size={30} /></div><div><p className="eyebrow">POSSIBLE EXPOSURE?</p><h3>Act now. PEP works against the clock.</h3><p>Start as soon as possible, ideally within 24 hours—and no later than 72 hours.</p></div><button className="button button-light" onClick={onEmergency}>What to do now<ArrowRight size={18} /></button></div>
    </div>
  </section>;
}

function Testing() {
  const [testId, setTestId] = useState('lab');
  const [days, setDays] = useState(30);
  const test = testTypes.find((item) => item.id === testId);
  const progress = Math.min((days / 90) * 100, 100);
  const status = days < test.start ? 'This test may not detect HIV yet.' : days <= test.end ? 'This is within the test’s usual detection window.' : 'This test can usually detect HIV by this point.';
  const onDays = (value) => setDays(Math.max(0, Math.min(90, Number(value) || 0)));
  return <section className="section testing-section" id="testing">
    <div className="container"><div className="testing-heading"><SectionHeading eyebrow="TESTING & WINDOW PERIODS" title={<>A simple test.<br />A powerful answer.</>} text="Only a test can confirm HIV status. Different tests can detect HIV at different times after exposure." /><a className="button button-outline" href={sources.locator} target="_blank" rel="noreferrer">Find U.S. testing<ExternalLink size={16} /></a></div>
      <div className="testing-tool"><div className="testing-tool-top"><div><span className="tool-label"><TestTube2 size={18} />TEST WINDOW EXPLORER</span><h3>How long since a possible exposure?</h3></div><span className="private-label"><ShieldCheck size={14} />Private by design</span></div>
        <div className="test-selector" role="group" aria-label="Choose HIV test type">{testTypes.map((item) => <button key={item.id} className={testId === item.id ? 'active' : ''} onClick={() => { setTestId(item.id); setDays(30); }} aria-pressed={testId === item.id}>{item.short}<span>{item.start}–{item.end} days</span></button>)}</div>
        <div className="window-input"><label htmlFor="days-input">Days since possible exposure</label><div><input id="days-input" type="number" min="0" max="90" value={days} onChange={(event) => onDays(event.target.value)} /><span>days</span></div></div>
        <div className="timeline-wrap"><input className="timeline-range" type="range" min="0" max="90" value={days} onChange={(event) => setDays(Number(event.target.value))} aria-label="Days since possible exposure" style={{ '--range-progress': `${progress}%` }} /><div className="timeline-track" aria-hidden="true" style={{ '--range-progress': `${progress}%` }}><div className="timeline-window" style={{ left: `${(test.start / 90) * 100}%`, width: `${((test.end - test.start) / 90) * 100}%` }} /><div className="timeline-marker" style={{ left: `${progress}%` }}><span>Day {days}</span></div></div><div className="timeline-labels" aria-hidden="true"><span>Exposure</span><span style={{ position: 'absolute', left: '25.56%' }}>Day 23</span><span style={{ position: 'absolute', left: '50%' }}>Day 45</span><span style={{ position: 'absolute', right: 0 }}>Day 90</span></div></div>
        <div className="test-result"><span className={`result-icon ${days < test.start ? 'early' : ''}`}><Info size={20} /></span><div><span className="result-tag">{test.name} · usual window {test.start}–{test.end} days</span><h4>{status}</h4><p>{days < test.start ? 'A negative result now may not rule out infection. Ask a healthcare provider which test and follow-up timing are right for you.' : days <= test.end ? 'Detection becomes more reliable through the window. Follow the test instructions and your provider’s advice about retesting.' : 'If the test is negative after the window period and there has been no new exposure, HIV is ruled out by that test.'}</p></div></div>
        <div className="testing-tool-bottom"><span><strong>Sample:</strong> {test.sample}</span><span><strong>Detects:</strong> {test.detects}</span><span>{test.timing}</span></div>
      </div>
      <div className="testing-notes"><div><span>01</span><h3>A positive self-test needs confirmation.</h3><p>Follow up with a healthcare provider or testing center. In a lab, confirmatory testing often uses the original sample.</p></div><div><span>02</span><h3>Symptoms cannot diagnose HIV.</h3><p>Some people have flu-like symptoms early on. Others have none. Testing is the only way to know.</p></div><div><span>03</span><h3>Recent exposure? Do not wait.</h3><p>PEP must start within 72 hours. Seek urgent medical care rather than waiting for a window period to pass.</p></div></div>
      <p className="source-caption">Window periods shown are CDC estimates for the specific test types listed. Clinical advice may differ based on your situation. <SourceLink href={sources.testing}>CDC testing guidance</SourceLink></p>
    </div>
  </section>;
}

function Treatment() {
  return <section className="section treatment-section" id="treatment">
    <div className="container treatment-grid"><div className="treatment-visual"><div className="treatment-card"><div className="treatment-card-top"><span>THE POWER OF TREATMENT</span><Heart size={20} /></div><div className="uu-display"><span>U</span><i>=</i><span>U</span></div><div className="uu-meaning"><span>UNDETECTABLE</span><span>UNTRANSMITTABLE</span></div><div className="uu-divider" /><p>People on HIV treatment who maintain an undetectable viral load have <strong>zero risk</strong> of transmitting HIV to sexual partners.</p><SourceLink href={sources.uu}>See the evidence at CDC</SourceLink></div><div className="treatment-orbit" aria-hidden="true" /></div>
      <div className="treatment-copy"><SectionHeading eyebrow="TREATMENT & LIVING WELL" title={<>Today’s reality:<br /><em>HIV is manageable.</em></>} text="Antiretroviral therapy (ART) stops HIV from multiplying. This protects the immune system and can reduce the virus to undetectable levels." /><div className="treatment-points"><div><span><Pill size={20} /></span><div><h3>Effective, ongoing treatment</h3><p>ART is not a cure, but it helps people with HIV live long, healthy lives. Treatment is taken on an ongoing basis, often as a daily regimen. Long-acting options may also be available.</p></div></div><div><span><Stethoscope size={20} /></span><div><h3>Care beyond a prescription</h3><p>Regular viral load monitoring, medication support, mental healthcare, and respectful providers all help people stay well.</p></div></div><div><span><HeartHandshake size={20} /></span><div><h3>A diagnosis changes care—not worth</h3><p>People with HIV can work, study, have relationships, become parents, and thrive. Privacy, dignity, and support matter.</p></div></div></div><a className="text-link large" href="#living">Read the living well guide<ArrowRight size={18} /></a></div></div>
  </section>;
}

function LivingWell() {
  const tips = [
    { icon: MessageCircle, title: 'Listen without judgment', text: 'Let the person choose what to share. You do not need a perfect speech—presence and respect go a long way.' },
    { icon: Shield, title: 'Protect confidentiality', text: 'HIV status is private health information. Never disclose it without permission, except where a legal duty applies.' },
    { icon: Heart, title: 'Keep everyday connection', text: 'Share meals, hug, work together, and make plans. Ordinary contact is safe. Inclusion supports wellbeing.' },
    { icon: BookOpen, title: 'Use accurate language', text: 'Say “person living with HIV,” not labels that define someone by a diagnosis. Share U=U and correct misinformation.' },
  ];
  return <section className="section living-section" id="living"><div className="container"><div className="living-heading"><SectionHeading eyebrow="ENDING STIGMA STARTS WITH US" title="Support looks like this." text="Science tells us how HIV works. Compassion shapes how people live." /><div className="living-quote"><MessageCircle size={23} /><blockquote>“You are not your diagnosis.<br />You deserve care, respect, and a full life.”</blockquote></div></div><div className="support-grid">{tips.map(({ icon: Icon, title, text }, index) => <article key={title}><span className="support-icon"><Icon size={24} /></span><span className="support-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div><div className="living-note"><Info size={20} /><p><strong>Pregnancy and parenting:</strong> Timely ART and specialist care can greatly reduce HIV transmission to a child. Discuss conception, pregnancy, delivery, and infant feeding with an HIV care team so advice matches your circumstances and local guidance.</p><SourceLink href={sources.who}>WHO guidance</SourceLink></div></div></section>;
}

function Quiz({ onComplete }) {
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const current = quizQuestions[index];
  const selected = answers[index];
  const score = Object.entries(answers).filter(([key, value]) => quizQuestions[Number(key)].answer === value).length;
  const next = () => { if (index === quizQuestions.length - 1) { setFinished(true); onComplete(); } else setIndex(index + 1); };
  const restart = () => { setAnswers({}); setIndex(0); setFinished(false); };
  return <section className="section quiz-section" id="quiz"><div className="container quiz-container"><SectionHeading eyebrow="THE KNOWLEDGE CHECK" title="Six questions. Zero pressure." text="A private quiz to reinforce what matters. No answers leave your device." align="center" />
    <div className="quiz-card">{!finished ? <><div className="quiz-top"><span>QUESTION {String(index + 1).padStart(2, '0')} <i>/ 06</i></span><span>{score} correct so far</span></div><div className="quiz-progress" aria-hidden="true"><span style={{ width: `${((index + 1) / quizQuestions.length) * 100}%` }} /></div><div className="quiz-body"><span className="quiz-topic">{['TRANSMISSION', 'TREATMENT', 'PREVENTION', 'TESTING', 'PREVENTION', 'STIGMA'][index]}</span><h3>{current.question}</h3><div className="quiz-options" role="group" aria-label="Answer choices">{current.options.map((option, optionIndex) => { const isCorrect = selected !== undefined && optionIndex === current.answer; const isWrong = selected === optionIndex && optionIndex !== current.answer; return <button key={option} disabled={selected !== undefined} className={`${selected === optionIndex ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`} onClick={() => setAnswers({ ...answers, [index]: optionIndex })}><span>{String.fromCharCode(65 + optionIndex)}</span><strong>{option}</strong>{isCorrect && <CheckCircle2 size={20} />}{isWrong && <X size={20} />}</button>; })}</div>{selected !== undefined && <div className={`quiz-explanation ${selected === current.answer ? 'correct' : ''}`} role="status"><Info size={20} /><div><strong>{selected === current.answer ? 'That’s right.' : 'Not quite—here’s the fact.'}</strong><p>{current.explanation}</p></div></div>}<div className="quiz-actions"><button className="button button-text" onClick={restart}><RotateCcw size={15} />Restart</button><button className="button button-primary" disabled={selected === undefined} onClick={next}>{index === quizQuestions.length - 1 ? 'See my result' : 'Next question'}<ArrowRight size={17} /></button></div></div></> : <div className="quiz-finish"><span className="finish-icon"><CheckCircle2 size={42} /></span><p className="eyebrow">KNOWLEDGE CHECK COMPLETE</p><h3>You got {score} out of 6.</h3><p>{score === 6 ? 'Excellent. You know the facts that protect health and challenge stigma.' : score >= 4 ? 'Strong work. Review the explanations, then keep exploring the topics you want to strengthen.' : 'A useful start. Explore the learning path and try again—every fact builds confidence.'}</p><div className="score-dots" aria-label={`${score} out of 6 correct`}>{quizQuestions.map((_, itemIndex) => <span key={itemIndex} className={answers[itemIndex] === quizQuestions[itemIndex].answer ? 'correct' : ''}>{answers[itemIndex] === quizQuestions[itemIndex].answer ? <Check size={17} /> : itemIndex + 1}</span>)}</div><div className="finish-actions"><button className="button button-outline" onClick={restart}><RotateCcw size={16} />Try again</button><a className="button button-primary" href="#resources">Keep learning<ArrowRight size={17} /></a></div></div>}</div>
  </div></section>;
}

function Resources() {
  const [query, setQuery] = useState('');
  const matches = glossary.filter((item) => `${item.term} ${item.definition}`.toLowerCase().includes(query.toLowerCase()));
  const downloadSummary = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    doc.setFillColor(248, 246, 241); doc.rect(0, 0, width, height, 'F');
    doc.setTextColor(199, 76, 57); doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text('HIV ATLAS', 48, 60);
    doc.setTextColor(36, 58, 48); doc.setFontSize(32); doc.text('The facts worth knowing.', 48, 115);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(80, 87, 80);
    const sections = [
      ['HIV is manageable', 'Antiretroviral therapy (ART) stops HIV from multiplying. With effective treatment and care, people with HIV can live long, healthy lives. HIV is not the same as AIDS.'],
      ['Know how HIV spreads', 'HIV can spread through specific body fluids during sex, shared injection equipment, unscreened blood or unsterile procedures, and during pregnancy, birth, or breastfeeding.'],
      ['Everyday contact is safe', 'HIV does not spread through hugs, handshakes, kissing, food, water, dishes, toilets, coughs, sneezes, sweat, tears, or insect bites.'],
      ['Prevention options', 'Condoms, PrEP, sterile injection equipment, and treatment as prevention are effective options. A healthcare provider can help build a plan that fits your needs.'],
      ['U=U: Undetectable = Untransmittable', 'A person on treatment who maintains an undetectable viral load has zero risk of transmitting HIV to sexual partners. Ongoing treatment and follow-up matter.'],
      ['Testing', 'Only a test can determine HIV status. Window periods vary: NAT 10-33 days; laboratory antigen/antibody 18-45 days; rapid antigen/antibody 18-90 days; antibody tests 23-90 days. A positive self-test needs confirmation.'],
      ['Possible exposure? Act now', 'PEP is emergency prevention. Start as soon as possible, ideally within 24 hours and no later than 72 hours. Go to urgent or emergency care. A standard course lasts 28 days.'],
      ['Replace stigma with support', 'Listen, protect confidentiality, maintain everyday connection, and use respectful language. A diagnosis never changes a person\'s worth.'],
    ];
    let y = 165;
    sections.forEach(([title, text]) => {
      const lines = doc.splitTextToSize(text, width - 96);
      const sectionHeight = 53 + lines.length * 13;
      if (y + sectionHeight > height - 120) {
        doc.addPage();
        doc.setFillColor(248, 246, 241); doc.rect(0, 0, width, height, 'F');
        doc.setTextColor(199, 76, 57); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('HIV ATLAS / THE FACTS WORTH KNOWING', 48, 48);
        y = 82;
      }
      doc.setTextColor(36, 58, 48); doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(title, 48, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(75, 81, 75);
      doc.text(lines, 48, y + 22);
      y += sectionHeight;
    });
    doc.setDrawColor(199, 76, 57); doc.line(48, height - 100, width - 48, height - 100);
    doc.setFontSize(9); doc.setTextColor(85, 85, 85); doc.text('Educational information only. Not a diagnosis or a substitute for professional medical care.', 48, height - 78);
    doc.text('Sources reviewed 17 Nov 2026: WHO HIV fact sheet; CDC testing, PrEP, PEP, and U=U guidance.', 48, height - 61);
    doc.setTextColor(199, 76, 57); doc.textWithLink('Find U.S. testing: gettested.cdc.gov', 48, height - 40, { url: sources.locator });
    doc.save('HIV-Atlas-fact-sheet.pdf');
  };
  return <section className="section resources-section" id="resources"><div className="container"><SectionHeading eyebrow="KEEP THE FACTS CLOSE" title="Learn. Save. Share." text="Trusted resources for your next step—and a plain-language glossary for the terms you meet along the way." />
    <div className="resource-grid"><div className="download-card"><span className="download-icon"><FileText size={32} /></span><span className="download-tag">PRINTABLE FACT SHEET</span><h3>The essentials,<br />on one page.</h3><p>Key facts about transmission, prevention, testing, U=U, and urgent PEP care.</p><button className="button button-primary" onClick={downloadSummary}><Download size={17} />Download PDF</button><small>Generated on your device. No sign-up.</small></div><div className="official-resources"><a href={sources.who} target="_blank" rel="noreferrer"><span className="resource-icon"><BookOpen /></span><div><small>GLOBAL HEALTH OVERVIEW</small><h3>WHO HIV fact sheet</h3><p>Symptoms, transmission, prevention, treatment, and global data.</p></div><ArrowUpRight /></a><a href={sources.testing} target="_blank" rel="noreferrer"><span className="resource-icon"><TestTube2 /></span><div><small>TESTING & NEXT STEPS</small><h3>CDC HIV testing guide</h3><p>Test types, window periods, and understanding results.</p></div><ArrowUpRight /></a><a href={sources.prep} target="_blank" rel="noreferrer"><span className="resource-icon"><ShieldCheck /></span><div><small>PREVENTION MEDICINE</small><h3>CDC PrEP & PEP guidance</h3><p>How preventive medicines work and when to seek care.</p></div><ArrowUpRight /></a><a href={sources.locator} target="_blank" rel="noreferrer"><span className="resource-icon"><Search /></span><div><small>U.S. SERVICE LOCATOR</small><h3>Find testing near you</h3><p>Search for local HIV testing, including free or low-cost services.</p></div><ArrowUpRight /></a></div></div>
    <div className="glossary"><div className="glossary-heading"><div><p className="eyebrow">PLAIN-LANGUAGE GLOSSARY</p><h3>Terms, made clear.</h3></div><label className="glossary-search"><Search size={17} /><span className="sr-only">Search glossary</span><input type="search" placeholder="Search a term…" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button aria-label="Clear glossary search" onClick={() => setQuery('')}><X size={15} /></button>}</label></div><div className="glossary-list">{matches.length > 0 ? matches.map((item) => <details key={item.term}><summary>{item.term}<Plus size={18} /></summary><p>{item.definition}</p></details>) : <p className="no-results">No matching term. Try “testing,” “ART,” or “viral load.”</p>}</div></div>
  </div></section>;
}

function ChapterDialog({ chapterId, onClose, onComplete, completed }) {
  const chapter = chapters.find((item) => item.id === chapterId);
  const closeRef = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const focusable = document.querySelectorAll('.chapter-dialog button, .chapter-dialog a');
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; previousFocus?.focus(); };
  }, [onClose]);
  const content = {
    basics: { intro: 'HIV stands for human immunodeficiency virus. It targets CD4 white blood cells, which help the immune system respond to infections.', blocks: [['HIV and AIDS are not the same', 'HIV is the virus. AIDS is the most advanced stage of untreated HIV infection. A positive HIV diagnosis does not mean a person has AIDS. Effective treatment can prevent progression.'], ['Symptoms are not a diagnosis', 'Some people develop a flu-like illness in the first few weeks. Others have no symptoms. Without treatment, HIV can gradually weaken immune defenses over years.'], ['The current reality', 'There is no widely available cure, but ART makes HIV a manageable chronic health condition. Testing and treatment open the door to long, healthy lives.']] },
    transmission: { intro: 'HIV needs specific conditions to pass from one person to another. Understanding those conditions makes prevention practical and everyday fear unnecessary.', blocks: [['The fluids involved', 'HIV can be transmitted through blood, semen, vaginal fluids, rectal fluids, and breast milk. Transmission requires a route for the virus to enter the body.'], ['The main routes', 'These include certain sexual activity, shared injection equipment, unsafe blood or medical procedures, and transmission during pregnancy, birth, or breastfeeding.'], ['Everyday contact is safe', 'Hugging, kissing, sharing food or water, toilets, coughs, sneezes, sweat, tears, and insect bites do not transmit HIV. You cannot acquire HIV through ordinary social contact.']] },
    prevention: { intro: 'Prevention works best when it fits real life. Different tools can be combined, and a healthcare provider can help you choose.', blocks: [['Before and during sex', 'External or internal condoms reduce HIV risk. PrEP is medicine for people without HIV that greatly reduces risk when taken as prescribed. Neither PrEP nor U=U prevents other STIs.'], ['After a possible exposure', 'PEP is an emergency option. Seek care immediately: start as soon as possible, ideally within 24 hours and no later than 72 hours.'], ['Treatment and harm reduction', 'Maintaining an undetectable viral load prevents sexual transmission. New sterile injection equipment prevents blood-to-blood transmission. Specialist care during pregnancy greatly reduces risk to a child.']] },
    testing: { intro: 'The only way to know HIV status is to test. Testing is a normal part of looking after your health.', blocks: [['Choose the right test', 'Antibody tests, antigen/antibody tests, and nucleic acid tests detect different markers. Their window periods and sample types differ.'], ['Respect the window period', 'No test detects HIV immediately. A negative result too early may need a follow-up test after the window period. A clinician can interpret timing based on the test and any new exposure.'], ['A positive result is a starting point', 'An initial positive antibody or self-test needs confirmation. After confirmation, connect with HIV care and begin treatment as soon as possible. Support is available.']] },
    treatment: { intro: 'ART uses medicines that interrupt different stages of the HIV life cycle. Combination treatment stops the virus from multiplying effectively.', blocks: [['Protect the immune system', 'Lower viral levels allow the immune system to recover and function. Ongoing care also monitors general health and prevents or treats other conditions.'], ['Undetectable means untransmittable', 'A person on ART who maintains an undetectable viral load has zero risk of sexual HIV transmission. Undetectable does not mean cured, so treatment and monitoring continue.'], ['Build sustainable care', 'Take medicines as prescribed and discuss side effects or barriers with the care team. Long-acting treatment may suit some people. Mental health and social support matter too.']] },
    living: { intro: 'An HIV diagnosis does not change someone’s right to love, work, learn, parent, or plan a future.', blocks: [['Put the person before the diagnosis', 'Use respectful language such as “person living with HIV.” Avoid assumptions about how someone acquired HIV or what their life looks like.'], ['Listen and protect privacy', 'Let each person decide when and with whom to share their status. Never disclose someone’s status without permission unless a specific legal duty applies.'], ['Stay connected', 'Everyday contact is safe. Share meals, offer practical support, and encourage care without pressure. Correct myths with evidence, not shame.']] },
  }[chapterId];
  return <div className="modal-backdrop chapter-backdrop" onClick={onClose}><article className="chapter-dialog" role="dialog" aria-modal="true" aria-labelledby="chapter-title" onClick={(event) => event.stopPropagation()}><div className={`chapter-dialog-hero chapter-${chapter.color}`}><button className="icon-button" onClick={onClose} aria-label="Close chapter" ref={closeRef}><X /></button><span className="chapter-dialog-number">{chapter.number}</span><p className="eyebrow">{chapter.short} · {chapter.time} READ</p><h2 id="chapter-title">{chapter.title}</h2><ChapterArt chapter={chapterId} /></div><div className="chapter-dialog-body"><p className="chapter-lead">{content.intro}</p>{content.blocks.map(([title, text], index) => <section key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></section>)}<div className="chapter-dialog-actions"><button className="button button-outline" onClick={onClose}>Close</button><button className="button button-primary" onClick={() => { onComplete(chapterId); onClose(); }}>{completed.includes(chapterId) ? <><Check size={17} />Chapter reviewed</> : <>Mark as learned<Check size={17} /></>}</button></div></div></article></div>;
}

function Footer({ onEmergency }) {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><div className="footer-brand"><Brand /><p>Clear science. Practical choices.<br />A world with less fear.</p><span className="footer-reviewed"><CheckCircle2 size={15} />Sources reviewed November 2026</span></div><div className="footer-links"><div><strong>Explore</strong><a href="#learn">Learning path</a><a href="#lab">Interactive lab</a><a href="#quiz">Knowledge check</a><a href="#resources">Resources</a></div><div><strong>Essential topics</strong><a href="#transmission">Transmission</a><a href="#prevention">Prevention</a><a href="#testing">Testing</a><a href="#treatment">Treatment & U=U</a></div><div><strong>Need support?</strong><button onClick={onEmergency}>Possible exposure?<ArrowUpRight size={14} /></button><a href={sources.locator} target="_blank" rel="noreferrer">Find U.S. testing<ArrowUpRight size={14} /></a><a href={sources.who} target="_blank" rel="noreferrer">WHO HIV resources<ArrowUpRight size={14} /></a><a href={sources.uu} target="_blank" rel="noreferrer">Learn about U=U<ArrowUpRight size={14} /></a></div></div></div><div className="footer-disclaimer"><Info size={18} /><p><strong>For education, not diagnosis.</strong> HIV Atlas provides general information and does not replace advice from a qualified healthcare professional. If you may have been exposed to HIV in the last 72 hours, seek urgent medical care now. Availability of medicines and services varies by location.</p></div><div className="footer-bottom"><span>© 2026 HIV Atlas. Built for understanding.</span><span>Independent educational resource · No tracking · No health data collection</span><a href="#top">Back to top<ArrowUpRight size={14} /></a></div></div></footer>;
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(null);
  const [completed, setCompleted] = useState(readProgress);
  const [activeSection, setActiveSection] = useState('learn');
  const [toast, setToast] = useState('');
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
    ['learn', 'lab', 'transmission', 'prevention', 'testing', 'treatment'].forEach((id) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timeout);
  }, [toast]);
  const completeChapter = (id) => {
    const next = [...new Set([...completed, id])];
    setCompleted(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { setToast('Chapter completed. Browser storage is unavailable, so progress will not persist.'); return; }
    setToast('Chapter complete. Progress saved on this device.');
  };
  const closeEmergency = useMemo(() => () => setEmergencyOpen(false), []);
  const closeChapter = useMemo(() => () => setChapterOpen(null), []);
  const nav = [{ id: 'learn', label: 'Learn' }, { id: 'lab', label: '3D Lab' }, { id: 'prevention', label: 'Prevention' }, { id: 'testing', label: 'Testing' }, { id: 'treatment', label: 'Treatment' }];
  return <>
    <a className="skip-link" href="#main">Skip to main content</a>
    <header className="site-header"><div className="container header-inner"><Brand /><nav className="desktop-nav" aria-label="Main navigation">{nav.map((item) => <a key={item.id} className={activeSection === item.id ? 'active' : ''} href={`#${item.id}`}>{item.label}</a>)}</nav><div className="header-actions"><button className="header-help" onClick={() => setEmergencyOpen(true)}>Need urgent help?<ArrowUpRight size={15} /></button><button className="menu-button icon-button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button></div></div>{mobileOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{nav.map((item) => <a key={item.id} href={`#${item.id}`} onClick={() => setMobileOpen(false)}>{item.label}<ArrowRight size={17} /></a>)}<button onClick={() => { setMobileOpen(false); setEmergencyOpen(true); }}>Possible exposure? Get urgent help<ArrowUpRight size={17} /></button></nav>}</header>
    <main id="main"><Hero /><LearningPath completed={completed} onOpenChapter={setChapterOpen} /><ScienceLab /><Transmission /><Prevention onEmergency={() => setEmergencyOpen(true)} /><Testing /><Treatment /><LivingWell /><Quiz onComplete={() => setToast('Knowledge check complete. Your answers stay on this device.')} /><Resources /></main>
    <Footer onEmergency={() => setEmergencyOpen(true)} />
    {emergencyOpen && <EmergencyDialog onClose={closeEmergency} />}
    {chapterOpen && <ChapterDialog chapterId={chapterOpen} onClose={closeChapter} onComplete={completeChapter} completed={completed} />}
    {toast && <div className="toast" role="status"><CheckCircle2 size={18} />{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={16} /></button></div>}
  </>;
}
