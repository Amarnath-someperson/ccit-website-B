import { Terminal, Cpu, ShieldCheck, ArrowRight, MousePointerClick, Command, Code2 } from 'lucide-react';

export default function Home() {
  return (
    <>
      {/* Main Content Container */}
      <main className="main-wrapper">
        
        {/* Hero Section */}
        <section className="hero-section">
          <div className="badge">
            <span className="badge-dot"></span>
            <span>Update?</span>
          </div>
          
          <h1 className="hero-title">
            Coding Club.
          </h1>
          
          <p className="hero-subtitle">
            Officially, the Coding Club of IISER Thiruvananthapuram (CCIT).
          </p>

          <div className="cta-group">
            <a href="#features" className="btn btn-primary">
              Projects???? <ArrowRight size={16} />
            </a>
            <a href="/timeline" rel="noopener noreferrer" className="btn btn-secondary">
              <Command size={16} /> Events
            </a>
          </div>

          <div className="interaction-tip">
            <MousePointerClick size={16} />
            <span>Try moving your cursor to interact with the background!</span>
          </div>
        </section>

        {/* Mock Terminal Showcase */}
        <section id="terminal" className="showcase-section">
          <div className="section-header">
            <div className="badge">
              <Terminal size={14} />
              <span>Developer Sandbox</span>
            </div>
            <h2 className="section-title">Real-Time Autonomous Execution</h2>
            <p className="section-subtitle">Observe how Antigravity agents spawn background tasks and verify deliverables.</p>
          </div>

          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="terminal-dot dot-red"></span>
                <span className="terminal-dot dot-yellow"></span>
                <span className="terminal-dot dot-green"></span>
              </div>
              <div className="terminal-title">agy-terminal-sandbox</div>
            </div>
            <div className="terminal-body">
              <div className="terminal-line">
                <span className="terminal-prompt">amarnathk@antigravity-macbook ~ %</span> <span className="terminal-output">agy run-task "scaffold-nextjs-site"</span>
              </div>
              <div className="terminal-line" style={{ color: '#666' }}>
                [System] Initializing Agent Conversation ID: 4b9ea178-c376-491b-879b-94d451ff7428
              </div>
              <div className="terminal-line" style={{ color: '#666' }}>
                [Planner] Creating Implementation Plan: implementation_plan.md
              </div>
              <div className="terminal-line" style={{ color: '#333' }}>
                [Subagent-1] Spawning background workspace fork for Next.js setup...
              </div>
              <div className="terminal-line">
                <span className="terminal-prompt">Executing:</span> <span className="terminal-output">npx -y create-next-app@latest ./ --ts --eslint --use-npm</span>
              </div>
              <div className="terminal-line" style={{ color: '#888' }}>
                {'>'} Installing dependencies (next, react, react-dom, typescript)...
              </div>
              <div className="terminal-line" style={{ color: '#333' }}>
                ✔ Completed Next.js project scaffolding.
              </div>
              <div className="terminal-line">
                <span className="terminal-prompt">Executing:</span> <span className="terminal-output">npm install webgl-fluid</span>
              </div>
              <div className="terminal-line" style={{ color: '#333' }}>
                ✔ Installed WebGL fluid background shaders.
              </div>
              <div className="terminal-line" style={{ color: '#555' }}>
                [Subagent-2] Starting verification: running npm run build...
              </div>
              <div className="terminal-line" style={{ color: '#333' }}>
                ✔ Compilation successful. 0 errors, 0 warnings.
              </div>
              <div className="terminal-line" style={{ color: '#1a1a1a' }}>
                amarnathk@antigravity-macbook ~ % <span className="terminal-output" style={{ fontWeight: 'bold' }}>agy status --success</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="features-section">
          <div className="section-header">
            <h2 className="section-title">Capabilities</h2>
            <p className="section-subtitle">Forget sequential wait times. Let parallel AI agents execute and test code in clean, sandboxed workspaces.</p>
          </div>

          <div className="grid">
            {/* Feature Card 1 */}
            <div className="card">
              <div className="card-icon">
                <Cpu size={24} />
              </div>
              <h3 className="card-title">Parallel Subagents</h3>
              <p className="card-description">
                Delegate CPU-heavy or asynchronous sub-tasks to child agents. Continue refining code in the editor while subagents run linting, formatting, or test suites in the background.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="card">
              <div className="card-icon">
                <ShieldCheck size={24} />
              </div>
              <h3 className="card-title">Secure Sandboxing</h3>
              <p className="card-description">
                Run server processes, compile code, and verify scripts in a sandboxed environment. Your local filesystem remains safe, clean, and isolated from experimental code changes.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="card">
              <div className="card-icon">
                <Code2 size={24} />
              </div>
              <h3 className="card-title">Interactive Artifacts</h3>
              <p className="card-description">
                Agents communicate outcomes through markdown deliverables, rendering live sitemaps, system diagrams, and interactive HTML previews inside the IDE workspace.
              </p>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}