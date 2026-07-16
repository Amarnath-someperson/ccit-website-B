"use client";
import gsap from 'gsap';
import { useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { useState } from 'react';

interface EventData {
  day: number;
  month: number;
  year: number;
  name: string;
  description: string;
}

// Parse the CSV string into an array of EventData objects
const parseEventsCSV = (csv: string): EventData[] => {
  const lines = csv.trim().split('\n');
  // Skip header row (index 0)
  return lines.slice(1).map(line => {
    const parts = line.split(',');
    const dateStr = parts[0];
    const name = (parts[1] || '').trim();
    const description = parts.slice(2).join(',').trim();
    const [d, m, y] = dateStr.split('/').map(Number);
    return { day: d, month: m, year: y, name, description };
  });
};




export default function Timeline() {
    const availableYears = Int16Array.from({length: 31}, (_, index) => 31 - index);

    const handleClick = () => {
        gsap.to('.hero-title', { rotation: gsap.getProperty('.hero-title', 'rotation') + 180 });

    }

const [d_m_y, set_d_m_y] = useState(0); // 0 for year, 1 for month, 2 for day

    const [lineEndDay, setlineEndDay] = useState({ x: 500, y: 325 });
  const [lineEndMonth, setlineEndMonth] = useState({ x: 500, y: 325 });
  const [lineEndYear, setlineEndYear] = useState({ x: 500, y: 325 });

  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef(null);
  const initialized = useRef(false);

  // Compute angle from center for a given point
  const getAngle = (point: { x: number; y: number }): number => {
    const dX = point.x - 500;
    const dY = point.y - 500;
    return Math.atan2(dY, dX);
  };

  // The SVG textPath places "31 30 29 ... 1" clockwise around the circle,
  // centered at 50% of the path (the top). Each character, regardless of digit,
  // occupies equal space along the path (monospace). We look up the value by
  // converting the needle angle to a character position in the text string.
  const fullText = "31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1";
  const totalChars = fullText.length;

  // Get the value at a given standard math angle (α).
  // Bottom = π/2, counter-clockwise = increasing α.
  const getValueAt = (angle: number): number => {
    // Clamp angle to [0, 2π)
    let a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // Convert math angle to path fraction (0 to 1).
    // Bottom (π/2) → 0, going counter-clockwise = increasing p.
    let p = (a - Math.PI / 2) / (2 * Math.PI);
    p = ((p % 1) + 1) % 1;

    // Character position in the text string
    const charPos = p * totalChars;

    // Find the number whose center is closest to charPos
    let bestVal = 1;
    let bestDist = Infinity;
    let i = 0;
    while (i < fullText.length) {
      let j = i;
      while (j < fullText.length && fullText[j] !== ' ') j++;
      const center = i + (j - i - 1) / 2;
      const dist = Math.abs(charPos - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestVal = parseInt(fullText.substring(i, j));
      }
      i = j + 1;
    }
    return bestVal;
  };

  // Inverse: given a value (1-31), find the math angle it sits at on the circle
  const valueToAngle = (val: number): number => {
    // Find the center character index of this value in the text string
    let charIdx = 0;
    for (const v of [31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1]) {
      const s = String(v);
      if (v === val) {
        const centerIdx = charIdx + (s.length - 1) / 2;
        const p = centerIdx / totalChars;
        // getValueAt does: p = (a - π/2) / 2π, then charPos = p * totalChars
        // Inverse: a = p * 2π + π/2
        return (p * 2 * Math.PI + Math.PI / 2 + 4 * Math.PI) % (2 * Math.PI);
      }
      charIdx += s.length + 1;
    }
    return Math.PI / 2;
  };

  // Set initial needle positions to today's date on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear() % 100;
    const lineLength = 175;
    const centerX = 500;
    const centerY = 500;

    const dayAngle = valueToAngle(day);
    setlineEndDay({
      x: centerX + lineLength * Math.cos(dayAngle),
      y: centerY + lineLength * Math.sin(dayAngle)
    });

    const monthAngle = valueToAngle(month);
    setlineEndMonth({
      x: centerX + lineLength * Math.cos(monthAngle),
      y: centerY + lineLength * Math.sin(monthAngle)
    });

    const yearAngle = valueToAngle(year);
    setlineEndYear({
      x: centerX + lineLength * Math.cos(yearAngle),
      y: centerY + lineLength * Math.sin(yearAngle)
    });
  }, []);

  const dayAngle = getAngle(lineEndDay);
  const monthAngle = getAngle(lineEndMonth);
  const yearAngle = getAngle(lineEndYear);

  const selectedDay = getValueAt(dayAngle);
  const selectedMonth = getValueAt(monthAngle);
  const selectedYear = getValueAt(yearAngle);

  const updateNeedlePosition = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return;

    // 1. Map screen space coordinates to internal 1000x1000 viewBox grid
    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * 1000;
    const svgY = ((clientY - rect.top) / rect.height) * 1000;

    // 2. Vector distance from center origin (500, 500)
    const centerX = 500;
    const centerY = 500;
    const dX = svgX - centerX;
    const dY = svgY - centerY;

    // 3. Trigonometry to lock it to half-radius (175 units) along that angle
    const angle = Math.atan2(dY, dX);
    const lineLength = 175; 

    if (d_m_y === 0) {
      setlineEndDay({
        x: centerX + lineLength * Math.cos(angle),
        y: centerY + lineLength * Math.sin(angle)
      });
    } else if (d_m_y === 1) {
      setlineEndMonth({
        x: centerX + lineLength * Math.cos(angle),
        y: centerY + lineLength * Math.sin(angle)
      });
    } else if (d_m_y === 2) {
      setlineEndYear({
        x: centerX + lineLength * Math.cos(angle),
        y: centerY + lineLength * Math.sin(angle)
      });
    }
  };
  

  const handlePointerDown = (e) => {
    // Ignore pointer events from the foreignObject toggle
    if (e.target.closest('foreignObject')) return;
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId); // Locks pointer tracking to the SVG window
    updateNeedlePosition(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
        e.preventDefault()
    updateNeedlePosition(e.clientX, e.clientY);
  };

  // Fetch and parse events CSV
  const [events, setEvents] = useState<EventData[]>([]);
  useEffect(() => {
    fetch('/events.csv')
      .then(res => res.text())
      .then(csv => setEvents(parseEventsCSV(csv)))
      .catch(() => {}); // silently fail if CSV not found
  }, []);

  // Build a comparable numeric key from day/month/year values (year first, then month, then day)
  const dateKey = (d: number, m: number, y: number) => y * 10000 + m * 100 + d;
  const selectedKey = dateKey(selectedDay, selectedMonth, selectedYear);

  // Current event on the selected date
  const currentEvent = events.find(ev => dateKey(ev.day, ev.month, ev.year) === selectedKey) || null;

  // Sort events by date ascending
  const sortedEvents = [...events].sort((a, b) => dateKey(a.day, a.month, a.year) - dateKey(b.day, b.month, b.year));

  // Upcoming events (strictly after selected date) — farthest first (descending)
  const upcomingEvents = sortedEvents
    .filter(ev => dateKey(ev.day, ev.month, ev.year) > selectedKey)
    .reverse();

  // Past events (strictly before selected date) — closest first (descending, most recent first)
  const pastEvents = sortedEvents
    .filter(ev => dateKey(ev.day, ev.month, ev.year) < selectedKey)
    .reverse();

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };
  

  return (
    <>
      {/* Main Content Container */}
      <main className="main-wrapper" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        
        {/* Two-column layout: stacked on mobile, side-by-side on desktop */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '100%',
        }} className="timeline-page">

          {/* Left column — all existing content (title, subtitle, sundial) */}
          <section style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            minHeight: 'calc(100vh - var(--nav-height))',
            padding: '80px 5%',
          }}>
            <h1 className="hero-title" onClick={handleClick}>
              Timeline.
            </h1>
            
            <p className="hero-subtitle" style={{ maxWidth: '650px' }}>
              What's happened, is happening and what's to come. Drag the needles to find out! Mobile users may scroll down for now.
            </p>

            <div className="circle-container">
              <div className="center-point"></div>

              <svg 
              ref={svgRef}
                  viewBox="0 0 1000 1000" 
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  style={{ 
                    width: '70vh', 
                    height: '70vh', 
                    maxWidth: '450px',
                    maxHeight: '450px',
                    cursor: isDragging ? 'grabbing' : 'grab', 
                    userSelect: 'none',
                    touchAction: 'none'
                  }}
              >
                <defs>
                  <path 
                    id="circlePath" 
                    d="M 500, 500 m 0, 350 a 350,350 0 1,1 0,-700 a 350,350 0 1,1 0,700" 
                  />
                </defs>
                
                <text>
                  <textPath 
                    href="#circlePath" 
                    id="yearFlag" 
                    textAnchor="middle"
                    startOffset="50%"
                    style={{ 
                      fontFamily: 'Courier New',
                      fontWeight: 'bold',
                      fontSize: '35px', 
                      letterSpacing: '5px', 
                      fill: '#000' 
                    }}
                  >
                    {availableYears.join(" ")}
                  </textPath>
                </text>
                <line 
                  x1="500" y1="500" x2={lineEndDay.x} y2={lineEndDay.y} 
                  stroke="#ff47f6ff" strokeWidth="10" strokeLinecap="round"
                />
                <circle cx="500" cy="500" r="15" fill="#333" />
                <line 
                  x1="500" y1="500" x2={lineEndMonth.x} y2={lineEndMonth.y} 
                  stroke="#561155ff" strokeWidth="10" strokeLinecap="round"
                />
                <circle cx="500" cy="500" r="15" fill="#333" />
                <line 
                  x1="500" y1="500" x2={lineEndYear.x} y2={lineEndYear.y} 
                  stroke="#120312ff" strokeWidth="10" strokeLinecap="round"
                />
                <circle cx="500" cy="500" r="15" fill="#333" />

                <foreignObject x="350" y="540" width="300" height="40" onPointerDown={(e) => e.stopPropagation()}>
                  <div style={{
                    display: 'inline-flex',
                    border: '1px solid #999',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    fontFamily: 'Geneva, Helvetica Neue, Arial, sans-serif',
                    fontSize: '0.85rem',
                    boxShadow: 'inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.08)',
                    userSelect: 'none',
                    background: '#e8e8e8',
                  }}>
                    {['Day', 'Month', 'Year'].map((label, idx) => (
                      <div
                        key={label}
                        onClick={(e) => { e.stopPropagation(); set_d_m_y(idx); }}
                        style={{
                          padding: '6px 18px',
                          cursor: 'pointer',
                          background: d_m_y === idx ? '#c0c0c0' : '#e8e8e8',
                          color: d_m_y === idx ? '#1a1a1a' : '#555',
                          borderRight: idx < 2 ? '1px solid #999' : 'none',
                          boxShadow: d_m_y === idx ? 'inset 0 1px 2px rgba(0,0,0,0.15)' : 'inset 0 1px 0 #fff',
                          transition: 'background 0.1s, box-shadow 0.1s',
                          fontWeight: d_m_y === idx ? '600' : 'normal',
                        }}
                        onMouseEnter={(e) => { if (d_m_y !== idx) e.currentTarget.style.background = '#d8d8d8'; }}
                        onMouseLeave={(e) => { if (d_m_y !== idx) e.currentTarget.style.background = '#e8e8e8'; }}
                        onMouseDown={(e) => { if (d_m_y !== idx) e.currentTarget.style.background = '#b8b8b8'; }}
                        onMouseUp={(e) => { if (d_m_y !== idx) e.currentTarget.style.background = '#d8d8d8'; }}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </foreignObject>
              </svg>

              <div style={{ 
                marginTop: '20px', 
                fontFamily: 'Courier New', 
                fontSize: '24px', 
                textAlign: 'center',
                color: '#333'
              }}>
                <div>Day: {selectedDay} &nbsp; Month: {selectedMonth} &nbsp; Year: {selectedYear}</div>
                <div style={{ marginTop: '8px', fontWeight: 'bold', fontSize: '28px' }}>
                  {selectedDay}/{selectedMonth}/{selectedYear}
                </div>
              </div>
            </div>
          </section>

          {/* Right column — upcoming, selected, and past events */}
          <section style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 5%',
            minHeight: 'calc(100vh - var(--nav-height))',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}>
              {/* Top: Upcoming events */}
              <div style={{ padding: '24px 0' }}>
                <div style={{
                  fontFamily: 'Geneva, Helvetica Neue, Arial, sans-serif',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  marginBottom: '12px',
                }}>
                  Upcoming Events
                </div>
                {upcomingEvents.length > 0 ? upcomingEvents.map((ev, i) => (
                  <div key={i} style={{
                    fontFamily: 'Courier New, monospace',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    color: 'var(--text-secondary)',
                  }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{ev.day}/{ev.month}/{ev.year}</span>
                    {' — '}{ev.name}
                  </div>
                )) : (
                  <div style={{
                    fontFamily: 'Geneva, Helvetica Neue, Arial, sans-serif',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                  }}>
                    No upcoming events
                  </div>
                )}
              </div>

              {/* Middle: Selected date + matching event */}
              <div style={{ borderTop: '1px solid var(--card-border)', padding: '24px 0' }}>
                <div style={{
                  fontFamily: 'Courier New, monospace',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}>
                  {selectedDay}/{selectedMonth}/{selectedYear}
                </div>
                {currentEvent ? (
                  <>
                    <div style={{
                      fontFamily: 'Geneva, Helvetica Neue, Arial, sans-serif',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginTop: '8px',
                    }}>
                      {currentEvent.name}
                    </div>
                    <div style={{
                      fontFamily: 'Geneva, Helvetica Neue, Arial, sans-serif',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginTop: '4px',
                      lineHeight: '1.5',
                    }}>
                      {currentEvent.description}
                    </div>
                  </>
                ) : (
                  <div style={{
                    fontFamily: 'Geneva, Helvetica Neue, Arial, sans-serif',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                  }}>
                    No event on this date
                  </div>
                )}
              </div>

              {/* Bottom: Past events */}
              <div style={{ borderTop: '1px solid var(--card-border)', padding: '24px 0' }}>
                <div style={{
                  fontFamily: 'Geneva, Helvetica Neue, Arial, sans-serif',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  marginBottom: '12px',
                }}>
                  Past Events
                </div>
                {pastEvents.length > 0 ? pastEvents.map((ev, i) => (
                  <div key={i} style={{
                    fontFamily: 'Courier New, monospace',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    color: 'var(--text-secondary)',
                  }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{ev.day}/{ev.month}/{ev.year}</span>
                    {' — '}{ev.name}
                  </div>
                )) : (
                  <div style={{
                    fontFamily: 'Geneva, Helvetica Neue, Arial, sans-serif',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                  }}>
                    No past events
                  </div>
                )}
              </div>
            </div>
          </section>


        </div>

        <style>{`
          @media (min-width: 900px) {
            .timeline-page {
              flex-direction: row !important;
            }
            .timeline-page > section {
              width: 50% !important;
              min-height: 100vh !important;
            }
            .timeline-page > section:first-child {
              border-right: 1px solid var(--card-border);
            }
          }
        `}</style>

      </main>
    </>
  );
}