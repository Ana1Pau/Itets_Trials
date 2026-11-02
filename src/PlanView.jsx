import { useEffect, useState } from 'react';

const zoneNames = {
  approach: 'Processional approach',
  lower: 'Lower terrace',
  middle: 'Middle terrace',
  upper: 'Upper terrace',
  sanctuary: 'Amun-Re sanctuary',
  hathor: 'Hathor chapel',
  anubis: 'Anubis chapel',
};

const zoneLevels = {
  approach: 'lower',
  lower: 'lower',
  middle: 'middle',
  upper: 'upper',
  sanctuary: 'upper',
  hathor: 'upper',
  anubis: 'upper',
};

function Zone({ id, selected, onSelect, className = '', dimmed = false, children, ...props }) {
  return (
    <g
      {...props}
      className={`plan-zone ${className} ${dimmed ? 'is-muted' : ''} ${selected === id ? 'is-selected' : ''}`}
      role="button"
      tabIndex="0"
      aria-label={`Select ${zoneNames[id]}`}
      aria-pressed={selected === id}
      onClick={() => onSelect(id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(id);
        }
      }}
    >
      {children}
    </g>
  );
}

export default function PlanView({ selectedZone, onSelect }) {
  const [activeLevel, setActiveLevel] = useState('all');
  useEffect(() => {
    setActiveLevel(zoneLevels[selectedZone] ?? 'all');
  }, [selectedZone]);
  const chooseZone = (id) => {
    setActiveLevel(zoneLevels[id] ?? 'all');
    onSelect(id);
  };
  const dimmed = (id) => activeLevel !== 'all' && zoneLevels[id] !== activeLevel;
  const levels = [
    { id: 'all', label: 'Full plan', zone: null },
    { id: 'lower', label: 'Lower', zone: 'lower' },
    { id: 'middle', label: 'Middle', zone: 'middle' },
    { id: 'upper', label: 'Upper', zone: 'upper' },
  ];
  return (
    <div className="plan-wrap">
      <div className="plan-toolbar">
        <span>FOCUS TERRACE</span>
        <div role="group" aria-label="Focus a temple terrace">
          {levels.map((level) => (
            <button
              key={level.id}
              className={activeLevel === level.id ? 'active' : ''}
              aria-pressed={activeLevel === level.id}
              onClick={() => {
                setActiveLevel(level.id);
                if (level.zone) onSelect(level.zone);
              }}
            >{level.label}</button>
          ))}
        </div>
        <small>Tap a labeled space</small>
      </div>
      <svg className="temple-plan" viewBox="0 0 1000 660" role="group" aria-labelledby="plan-title plan-desc">
        <title id="plan-title">Schematic architectural plan of Djeser-Djeseru</title>
        <desc id="plan-desc">An interactive east-to-west plan showing the processional approach, three terraces, chapels, and rock-cut sanctuary.</desc>
        <defs>
          <pattern id="plan-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M 26 0 L 0 0 0 26" fill="none" stroke="#9db9b4" strokeOpacity=".07" strokeWidth="1" />
          </pattern>
          <linearGradient id="plan-cliff" x1="0" x2="1">
            <stop offset="0" stopColor="#d6c4a2" stopOpacity=".16" />
            <stop offset="1" stopColor="#d6c4a2" stopOpacity=".03" />
          </linearGradient>
          <filter id="plan-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width="1000" height="660" rx="18" fill="#172326" />
        <rect width="1000" height="660" rx="18" fill="url(#plan-grid)" />
        <g className="plan-frame-labels" aria-hidden="true">
          <text x="40" y="46">WEST · THEBAN CLIFF</text>
          <text x="40" y="626">EAST · NILE APPROACH</text>
          <text x="930" y="324" transform="rotate(90 930 324)">PROCESSIONAL AXIS</text>
        </g>
        <path d="M144 102 Q280 48 464 82 L827 82 L827 151 L144 151Z" fill="url(#plan-cliff)" stroke="#cbb58b" strokeOpacity=".45" strokeWidth="1.5" />
        <path d="M176 148H820" stroke="#d8c6a1" strokeOpacity=".42" strokeDasharray="5 7" />
        <text className="plan-cliff-title" x="499" y="119" textAnchor="middle">LIMESTONE CLIFF · ROCK-CUT SANCTUARY</text>

        <Zone id="sanctuary" selected={selectedZone} onSelect={chooseZone} className="zone-sanctuary" dimmed={dimmed('sanctuary')}>
          <rect x="418" y="165" width="164" height="64" rx="4" />
          <path d="M430 178H570M430 216H570M446 178V216M554 178V216" />
          <text x="500" y="202" textAnchor="middle">AMUN-RE</text>
          <text className="plan-small" x="500" y="249" textAnchor="middle">ROCK-CUT SANCTUARY</text>
        </Zone>

        <Zone id="upper" selected={selectedZone} onSelect={chooseZone} className="zone-terrace" dimmed={dimmed('upper')}>
          <rect x="250" y="268" width="500" height="99" rx="4" />
          <path d="M268 286H732M268 350H732M290 286V350M330 286V350M370 286V350M410 286V350M450 286V350M490 286V350M530 286V350M570 286V350M610 286V350M650 286V350M690 286V350M730 286V350" />
          <text x="500" y="327" textAnchor="middle">UPPER TERRACE · SOLAR COURT</text>
        </Zone>
        <Zone id="hathor" selected={selectedZone} onSelect={chooseZone} className="zone-chapel" dimmed={dimmed('hathor')}>
          <rect x="164" y="279" width="68" height="71" rx="3" />
          <path d="M176 292H220V337H176Z" />
          <text className="plan-small" x="198" y="370" textAnchor="middle">HATHOR</text>
        </Zone>
        <Zone id="anubis" selected={selectedZone} onSelect={chooseZone} className="zone-chapel" dimmed={dimmed('anubis')}>
          <rect x="768" y="279" width="68" height="71" rx="3" />
          <path d="M780 292H824V337H780Z" />
          <text className="plan-small" x="802" y="370" textAnchor="middle">ANUBIS</text>
        </Zone>

        <Zone id="middle" selected={selectedZone} onSelect={chooseZone} className="zone-terrace" dimmed={dimmed('middle')}>
          <rect x="205" y="401" width="590" height="92" rx="4" />
          <path d="M224 419H776M224 476H776M245 419V476M285 419V476M325 419V476M365 419V476M405 419V476M445 419V476M485 419V476M525 419V476M565 419V476M605 419V476M645 419V476M685 419V476M725 419V476M765 419V476" />
          <text x="500" y="458" textAnchor="middle">MIDDLE TERRACE · RELIEF PORTICO</text>
        </Zone>

        <Zone id="lower" selected={selectedZone} onSelect={chooseZone} className="zone-terrace" dimmed={dimmed('lower')}>
          <rect x="250" y="528" width="500" height="67" rx="4" />
          <path d="M270 545H730M270 579H730M294 545V579M334 545V579M374 545V579M414 545V579M454 545V579M494 545V579M534 545V579M574 545V579M614 545V579M654 545V579M694 545V579M734 545V579" />
          <text x="500" y="570" textAnchor="middle">LOWER TERRACE · PORTICO &amp; COURT</text>
        </Zone>

        <Zone id="approach" selected={selectedZone} onSelect={chooseZone} className="zone-approach" dimmed={dimmed('approach')}>
          <path d="M460 595V630H540V595" />
          <path d="M474 600V625M488 600V625M502 600V625M516 600V625M530 600V625" />
          <text x="500" y="650" textAnchor="middle">CAUSEWAY / VALLEY APPROACH</text>
        </Zone>
        <path className="axis-line" d="M500 235V620" aria-hidden="true" />
        <circle className="axis-dot" cx="500" cy="248" r="4" aria-hidden="true" />

        <g className="north-marker" transform="translate(900 205)" aria-hidden="true">
          <text x="0" y="-22" textAnchor="middle">N</text>
          <path d="M0 -12L8 11L0 5L-8 11Z" />
          <circle cx="0" cy="0" r="26" />
        </g>
        <text className="drawing-note" x="850" y="602" textAnchor="end">SCHEMATIC · NOT TO SCALE</text>
      </svg>
      <div className="plan-caption">
        <span><i className="plan-caption-dot" />Select a space to link it to the model</span>
        <span>East → West · ascent toward the cliff</span>
      </div>
    </div>
  );
}
