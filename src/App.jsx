import { useState } from 'react';
import PlanView from './PlanView.jsx';
import TempleScene from './TempleScene.jsx';

const zones = {
  approach: {
    title: 'Processional approach',
    short: 'The causeway',
    level: 'EAST · VALLEY APPROACH',
    number: '00',
    description: 'A long, ceremonial approach leads from the valley toward the temple. The central axis continues through each terrace and into the cliff sanctuary.',
    facts: [['DIRECTION', 'East → West'], ['SEQUENCE', 'Entry axis'], ['LANDSCAPE', 'Desert plain']],
  },
  lower: {
    title: 'Lower terrace',
    short: 'Portico & court',
    level: 'LEVEL 01 · LOWER TERRACE',
    number: '01',
    description: 'The first broad platform establishes the temple’s measured rhythm. A portico frames the open court and begins the ascent toward the mountain.',
    facts: [['ROLE', 'Arrival court'], ['ELEMENT', 'Columned portico'], ['NEXT', 'Central stair']],
  },
  middle: {
    title: 'Middle terrace',
    short: 'Relief portico',
    level: 'LEVEL 02 · MIDDLE TERRACE',
    number: '02',
    description: 'The long colonnade and relief walls tell the temple’s ceremonial story. The terrace opens onto the central ramp and continues the processional route.',
    facts: [['ROLE', 'Ritual terrace'], ['PROGRAM', 'Relief portico'], ['NEXT', 'Upper court']],
  },
  upper: {
    title: 'Upper terrace',
    short: 'Solar court',
    level: 'LEVEL 03 · UPPER TERRACE',
    number: '03',
    description: 'The upper court sits against the limestone cliffs. Its colonnaded edge, axial approach, and chapels bring the sequence to its most sacred threshold.',
    facts: [['ROLE', 'Cult terrace'], ['EDGE', 'Cliff face'], ['NEXT', 'Rock-cut shrines']],
  },
  sanctuary: {
    title: 'Amun-Re sanctuary',
    short: 'Rock-cut sanctuary',
    level: 'WEST · CLIFF SANCTUARY',
    number: '04',
    description: 'At the end of the axis, the sanctuary is cut into the cliff itself. The architecture shifts from open terraces to enclosed sacred rooms.',
    facts: [['SETTING', 'Rock-cut'], ['DEDICATION', 'Amun-Re'], ['POSITION', 'Temple axis']],
  },
  hathor: {
    title: 'Hathor chapel',
    short: 'Southern chapel',
    level: 'UPPER TERRACE · SOUTH',
    number: '03A',
    description: 'A side chapel on the upper terrace. The source plan identifies the Hathor chapel as part of the temple’s associated sacred spaces.',
    facts: [['POSITION', 'Upper terrace'], ['TYPE', 'Side chapel'], ['PLAN', 'Approximate zone']],
  },
  anubis: {
    title: 'Anubis chapel',
    short: 'Northern chapel',
    level: 'UPPER TERRACE · NORTH',
    number: '03B',
    description: 'A second side chapel adjoins the upper terrace. Its position here follows the provided schematic orientation plan.',
    facts: [['POSITION', 'Upper terrace'], ['TYPE', 'Side chapel'], ['PLAN', 'Approximate zone']],
  },
};

const views = [
  { id: 'overview', name: 'Overview', label: '01', icon: 'overview' },
  { id: 'plan', name: 'Plan', label: '02', icon: 'plan' },
  { id: 'model', name: '3D model', label: '03', icon: 'model' },
  { id: 'interior', name: 'Interior', label: '04', icon: 'interior' },
  { id: 'walk', name: 'Walkthrough', label: '05', icon: 'walk' },
];

function Glyph({ name }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.55, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const shapes = {
    overview: <><path d="M3 14.5 12 6l9 8.5" /><path d="M5.5 13v7h13v-7M9 20v-4h6v4" /></>,
    plan: <><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M4 11h8V4m0 7v9m0-6h8" /></>,
    model: <><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z" /><path d="m3 8 9 5 9-5M12 13v8M7.5 5.5l9 5" /></>,
    interior: <><path d="M4 20V7l8-4 8 4v13" /><path d="M8 20v-7h8v7M4 8h16" /></>,
    walk: <><circle cx="12" cy="5" r="2" /><path d="m10 21 1-6-3-3 2-4 4 2 2 4-3 2 1 5m-4-9-3 2m7-4 3 1" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    reset: <><path d="M3 11a9 9 0 1 1 2.2 6" /><path d="M3 4v7h7" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>{shapes[name] ?? null}</svg>;
}

function WalkPad() {
  const send = (eventName, key) => window.dispatchEvent(new CustomEvent(eventName, { detail: { key } }));
  const button = (key, glyph, label) => (
    <button
      key={key}
      aria-label={label}
      onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); send('temple:move-down', key); }}
      onPointerUp={() => send('temple:move-up', key)}
      onPointerCancel={() => send('temple:move-up', key)}
      onLostPointerCapture={() => send('temple:move-up', key)}
    >{glyph}</button>
  );
  return (
    <div className="walk-pad" role="group" aria-label="Touch movement controls">
      <span>MOVE</span>
      <div className="walk-pad-grid">
        {button('KeyW', '↑', 'Move forward')}
        {button('KeyA', '←', 'Move left')}
        {button('KeyS', '↓', 'Move backward')}
        {button('KeyD', '→', 'Move right')}
      </div>
      <small>DRAG TO LOOK</small>
    </div>
  );
}

function App() {
  const [view, setView] = useState('overview');
  const [selectedZone, setSelectedZone] = useState('middle');
  const [cutaway, setCutaway] = useState(false);
  const [showWalkHelp, setShowWalkHelp] = useState(false);
  const zone = zones[selectedZone];

  const changeView = (nextView) => {
    setView(nextView);
    if (nextView === 'walk') setShowWalkHelp(true);
  };

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Djeser-Djeseru home">
          <span className="brand-monogram">DD</span>
          <span className="brand-copy"><strong>Djeser-Djeseru</strong><small>ARCHITECTURAL FIELD STUDY</small></span>
        </a>
        <nav className="top-links" aria-label="Main navigation">
          <a className="top-link active" href="#experience">Experience</a>
          <a className="top-link" href="#architecture">Architecture</a>
          <a className="top-link" href="#notes">Study notes</a>
        </nav>
        <div className="top-meta"><span className="status-dot" />DEIR EL-BAHARI <span className="meta-divider">/</span> THEBES</div>
      </header>

      <main id="top">
        <section className="intro" id="architecture">
          <div className="intro-copy">
            <p className="eyebrow"><span>MONUMENT 01</span><i /> NEW KINGDOM · 18TH DYNASTY</p>
            <h1>The temple that<br /><em>climbs the mountain.</em></h1>
            <p className="intro-text">Explore the architecture of Hatshepsut’s Djeser-Djeseru through its terraces, sacred rooms, and central processional axis.</p>
          </div>
          <div className="intro-aside">
            <div className="intro-aside-rule" />
            <p>DJESER-DJESERU</p>
            <span>“Holy of Holies”</span>
            <small>Deir el-Bahari · West bank of the Nile</small>
          </div>
        </section>

        <section className="explorer" id="experience" aria-label="Interactive temple explorer">
          <div className="explorer-main">
            <div className="view-tabs" role="group" aria-label="Choose an architectural view">
              {views.map((item) => (
                <button
                  className={`view-tab ${view === item.id ? 'active' : ''}`}
                  key={item.id}
                  aria-pressed={view === item.id}
                  onClick={() => changeView(item.id)}
                >
                  <Glyph name={item.icon} /><span>{item.name}</span><small>{item.label}</small>
                </button>
              ))}
            </div>

            <div className={`stage stage-${view}`}>
              <div className="stage-topline">
                <div className="stage-location"><span className="stage-index">{zone.number}</span><span>{zone.level}</span></div>
                <div className="stage-actions">
                  {(view === 'model' || view === 'overview' || view === 'interior') && (
                    <button className={`icon-button ${cutaway ? 'selected' : ''}`} onClick={() => setCutaway((value) => !value)} aria-pressed={cutaway} title="Toggle cutaway view">
                      <Glyph name="layers" /><span>{cutaway ? 'Cutaway on' : 'Cutaway'}</span>
                    </button>
                  )}
                  {view !== 'plan' && view !== 'walk' && (
                    <button className="icon-button" onClick={() => window.dispatchEvent(new Event('temple:reset-view'))} title="Reset view"><Glyph name="reset" /><span>Reset</span></button>
                  )}
                </div>
              </div>

              <div className="stage-content">
                {view === 'plan' ? (
                  <PlanView selectedZone={selectedZone} onSelect={setSelectedZone} />
                ) : (
                  <TempleScene
                    view={view}
                    selectedZone={selectedZone}
                    cutaway={cutaway || view === 'interior' || view === 'walk'}
                    onSelectZone={setSelectedZone}
                    onWalkReady={() => setShowWalkHelp(false)}
                  />
                )}
                {view === 'overview' && (
                  <div className="scene-caption"><span className="caption-pulse" />SCHEMATIC AXONOMETRIC <i /> DRAG TO ORBIT</div>
                )}
                {view === 'interior' && (
                  <div className="interior-caption"><span>INTERIOR STUDY</span><strong>{zone.short}</strong><small>Interpretive reconstruction · select another space to focus</small></div>
                )}
                {view === 'walk' && <WalkPad />}
                {view === 'walk' && showWalkHelp && (
                  <div className="walk-overlay">
                    <button className="overlay-dismiss" onClick={() => setShowWalkHelp(false)} aria-label="Dismiss walkthrough instructions"><Glyph name="close" /></button>
                    <span className="walk-kicker">FIRST-PERSON VIEW</span>
                    <strong>Step into the temple.</strong>
                    <p>On desktop, move with <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> and use your mouse to look. On touch screens, drag to look and use the direction pad. Press <kbd>Esc</kbd> to exit pointer lock.</p>
                    <button className="walk-start" onClick={() => window.dispatchEvent(new Event('temple:start-walk'))}>Begin walkthrough <Glyph name="arrow" /></button>
                  </div>
                )}
              </div>
              <div className="stage-bottomline">
                <div className="orientation"><Glyph name="compass" /><span>AXIS ORIENTATION</span><strong>EAST → WEST</strong></div>
                <div className="scale-note">SCHEMATIC · NOT TO SCALE</div>
              </div>
            </div>

            <div className="sequence" aria-label="Architectural sequence">
              <div className="sequence-label"><span>PROCESSIONAL SEQUENCE</span><small>Follow the axis</small></div>
              <div className="sequence-track">
                {['approach', 'lower', 'middle', 'upper', 'sanctuary'].map((id, index) => (
                  <button key={id} className={`sequence-step ${selectedZone === id ? 'active' : ''}`} onClick={() => setSelectedZone(id)}>
                    <span className="sequence-number">0{index + 1}</span><span className="sequence-name">{zones[id].short}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="inspector" aria-live="polite">
            <div className="inspector-head"><span>SPACE SELECTED</span><span className="inspector-code">{zone.number} / 07</span></div>
            <div className="inspector-content">
              <p className="zone-level">{zone.level}</p>
              <h2>{zone.title}</h2>
              <p className="zone-description">{zone.description}</p>
              <div className="inspector-divider" />
              <div className="facts-list">
                {zone.facts.map(([label, value]) => <div className="fact-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}
              </div>
              <div className="linked-views">
                <span>CONTINUE EXPLORING</span>
                <button onClick={() => changeView('plan')}><Glyph name="plan" />Locate on plan <Glyph name="arrow" /></button>
                <button onClick={() => changeView('model')}><Glyph name="model" />View in 3D <Glyph name="arrow" /></button>
                <button onClick={() => changeView('walk')}><Glyph name="walk" />Enter this space <Glyph name="arrow" /></button>
              </div>
              <p className="selection-hint"><span className="hint-mark">↗</span> Select a space in any view to update this panel.</p>
            </div>
            <div className="inspector-bottom"><span>SPATIAL INDEX</span><span>{String(Object.keys(zones).indexOf(selectedZone) + 1).padStart(2, '0')} — 07</span></div>
          </aside>
        </section>

        <section className="room-index" aria-label="Temple spaces">
          <div className="room-index-intro"><p className="eyebrow">ARCHITECTURAL INDEX</p><h2>Seven spaces.<br /><em>One sacred axis.</em></h2><p>Choose a point of interest to bring it into focus across the plan and model.</p></div>
          <div className="room-list">
            {Object.entries(zones).map(([id, item]) => (
              <button key={id} className={`room-item ${selectedZone === id ? 'active' : ''}`} onClick={() => setSelectedZone(id)}>
                <span className="room-number">{item.number}</span><span className="room-title">{item.title}<small>{item.level}</small></span><Glyph name="arrow" />
              </button>
            ))}
          </div>
        </section>

        <section className="study-note" id="notes">
          <div className="note-symbol">✳</div>
          <div>
            <p className="eyebrow">A NOTE ON THE MODEL</p>
            <p>This single-page experience brings the temple’s elevations, interior, plan, 3D structure, and walkthrough together as one explorable world. Its terraces can also serve as a game hub: each level opens toward new spaces, encounters, and stories. The geometry is a schematic interpretation, not a measured reconstruction.</p>
            <div className="source-links" aria-label="Explore every study on this page">
              <span>EXPLORE ON THIS PAGE</span>
              <button onClick={() => { changeView('overview'); document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }); }}>Elevation &amp; 3D overview ↗</button>
              <button onClick={() => { changeView('interior'); document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }); }}>Interior study ↗</button>
              <button onClick={() => { changeView('walk'); document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }); }}>Room walkthrough ↗</button>
              <button onClick={() => { changeView('plan'); document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }); }}>Architectural plan ↗</button>
              <button onClick={() => { changeView('model'); document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }); }}>3D blueprint ↗</button>
            </div>
          </div>
          <a href="#experience" className="back-to-top">BACK TO EXPERIENCE <span>↑</span></a>
        </section>
      </main>

      <footer className="footer"><span>DJESER-DJESERU · DEIR EL-BAHARI</span><span>AN INTERACTIVE ARCHITECTURAL STUDY</span><span>18TH DYNASTY · c. 15TH CENTURY BCE</span></footer>
    </div>
  );
}

export default App;
