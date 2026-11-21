import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import './PrivateExplorer.css';

const AI_API_BASE = 'http://127.0.0.1:8000';

const PRIVATE_ROLE_DETAILS = {
  'swe-ai-cloud': {
    url: 'https://www.linkedin.com/jobs/search/?keywords=Software%20Development%20Engineer%20AI%20Python',
    rounds: 'Online DSA Assessment (2 Medium-Hard LeetCode) -> System Design & API Architecture -> Bar Raiser / Culture Fit.',
    checklist: 'Build 1 end-to-end RAG/FastAPI microservice + deploy with Docker + 150+ DSA problems.'
  },
  'sde-fullstack-java': {
    url: 'https://www.naukri.com/java-spring-boot-react-jobs',
    rounds: 'Java/SQL Coding Round -> Spring Boot REST API & JWT Live Coding -> Frontend React State Review.',
    checklist: 'Implement JWT role-based auth, MySQL indexing, and modular React components on GitHub.'
  },
  'data-analyst-quant': {
    url: 'https://www.linkedin.com/jobs/search/?keywords=Quantitative%20Data%20Analyst%20SQL%20Python',
    rounds: 'Aptitude & Probability Screening -> Live SQL Window Functions & Case Study -> Business Guesstimate Interview.',
    checklist: 'Master SQL joins/CTEs, Python Pandas/NumPy statistical modeling, and KPI dashboard storytelling.'
  },
  'edtech-academic-mentor': {
    url: 'https://www.naukri.com/stem-faculty-academic-mentor-jobs',
    rounds: 'Subject Depth Written Test -> 15-Minute Live Demo Lecture -> Curriculum Design Discussion.',
    checklist: 'Prepare a structured 15-min concept walkthrough with visual examples and assessment questions.'
  }
};

export default function PrivateExplorer() {
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeRoleModal, setActiveRoleModal] = useState(null);

  useEffect(() => {
    const fetchPrivateRoles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${AI_API_BASE}/api/v1/ai/opportunities?domain_id=private_roles`);
        const data = await res.json();
        const mapped = (data.items || []).map((item) => {
          const extra = PRIVATE_ROLE_DETAILS[item.id] || {
            url: 'https://www.linkedin.com/jobs/',
            rounds: 'Technical Screening -> Domain Problem Solving -> Managerial Round.',
            checklist: 'Highlight verifiable GitHub repositories and core domain fundamentals.'
          };
          return {
            id: item.id,
            title: item.title,
            company: item.organization,
            eligibility: item.criteria_summary,
            minCgpa: `${item.min_cgpa}+ CGPA`,
            timeline: item.deadline,
            description: item.description,
            skills: item.required_skills || [],
            portalUrl: extra.url,
            interviewRounds: extra.rounds,
            prepChecklist: extra.checklist
          };
        });
        setRoles(mapped);
      } catch (err) {
        console.error('Failed to fetch Private roles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivateRoles();
  }, []);

  const filteredRoles = roles.filter((role) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      role.title.toLowerCase().includes(q) ||
      role.company.toLowerCase().includes(q) ||
      role.description.toLowerCase().includes(q) ||
      role.skills.some((s) => s.toLowerCase().includes(q));

    const matchesSkill =
      selectedSkill === 'All' ||
      role.skills.some((s) => s.toLowerCase().includes(selectedSkill.toLowerCase()));

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="private-page-wrapper">
      <div className="private-container">
        <nav className="sub-navbar">
          <Link to="/" className="nav-back">Back to Dashboard</Link>
          <div className="nav-links">
            <Link to="/" className="nav-item">Dashboard</Link>
            <Link to="/government" className="nav-item">Govt. Hub</Link>
            <Link to="/private-jobs" className="nav-item active">Private Roles</Link>
            <Link to="/higher-education" className="nav-item">Higher Ed</Link>
            <Link to="/scholarships-courses" className="nav-item">Grants & Courses</Link>
          </div>
        </nav>

        <header className="page-header">
          <div className="badge">Corporate, Product & Analytics Track</div>
          <h1>Private Sector Roles & Industry Hiring</h1>
          <p>
            Live software engineering, full-stack development, quantitative analytics, and STEM curriculum roles synced from EDU-NEXIS AI.
          </p>
        </header>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by role, tech stack, or domain (e.g. Python, React, Analyst, STEM)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="toggle-group">
            {['All', 'Python', 'Java', 'Maths', 'Teaching'].map((tag) => (
              <button
                key={tag}
                type="button"
                className={`toggle-btn ${selectedSkill === tag ? 'active' : ''}`}
                onClick={() => setSelectedSkill(tag)}
              >
                {tag === 'All' ? `All (${roles.length})` : tag}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading live private sector roles from FastAPI...</p>
        ) : (
          <div className="cards-grid">
            {filteredRoles.map((role) => (
              <div key={role.id} className="private-card">
                <div className="card-top">
                  <span className="role-tag">Private Sector</span>
                  <span className="cgpa-badge">{role.minCgpa}</span>
                </div>

                <h3>{role.title}</h3>
                <p className="company-name">{role.company}</p>

                <div className="specs-list">
                  <div className="spec-item">
                    <span className="spec-label">Requirement:</span>
                    <span className="spec-val">{role.eligibility}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Hiring Status:</span>
                    <span className="spec-val">{role.timeline}</span>
                  </div>
                </div>

                <p className="desc">{role.description}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {role.skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(99, 102, 241, 0.14)',
                        color: '#a5b4fc',
                        textTransform: 'capitalize'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="card-actions">
                  <button
                    type="button"
                    className="primary-link-btn"
                    onClick={() => setActiveRoleModal(role)}
                  >
                    View Skill Checklist
                  </button>
                  <a
                    href={role.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="secondary-link-btn"
                    style={{ textAlign: 'center', textDecoration: 'none' }}
                  >
                    Apply Track
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeRoleModal && (
          <div
            onClick={() => setActiveRoleModal(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(2, 6, 23, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 1000
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '16px',
                maxWidth: '580px',
                width: '100%',
                padding: '28px',
                color: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>
                    {activeRoleModal.company}
                  </span>
                  <h2 style={{ fontSize: '1.3rem', margin: '6px 0 12px' }}>{activeRoleModal.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRoleModal(null)}
                  style={{
                    background: '#1e293b',
                    border: 'none',
                    color: '#cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>

              <div style={{ display: 'grid', gap: '12px', fontSize: '0.9rem', marginTop: '8px' }}>
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
                  <strong style={{ color: '#a5b4fc' }}>Typical Hiring Rounds:</strong>
                  <p style={{ margin: '4px 0 0', color: '#e2e8f0' }}>{activeRoleModal.interviewRounds}</p>
                </div>
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
                  <strong style={{ color: '#34d399' }}>Portfolio & Readiness Checklist:</strong>
                  <p style={{ margin: '4px 0 0', color: '#e2e8f0' }}>{activeRoleModal.prepChecklist}</p>
                </div>
                <div>
                  <strong style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>Required Tech & Domain Stack:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {activeRoleModal.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: '0.78rem',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(99, 102, 241, 0.16)',
                          color: '#a5b4fc',
                          textTransform: 'capitalize'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <a
                  href={activeRoleModal.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-link-btn"
                  style={{ textDecoration: 'none', padding: '10px 18px' }}
                >
                  Browse Open Roles -&gt;
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}