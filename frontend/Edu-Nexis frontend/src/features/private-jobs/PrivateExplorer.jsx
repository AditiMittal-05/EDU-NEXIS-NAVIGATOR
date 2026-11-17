import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import './PrivateExplorer.css';

const AI_API_BASE = 'http://127.0.0.1:8000';

export default function PrivateExplorer() {
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivateRoles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${AI_API_BASE}/api/v1/ai/opportunities?domain_id=private_roles`);
        const data = await res.json();
        const mapped = (data.items || []).map((item) => ({
          id: item.id,
          title: item.title,
          company: item.organization,
          eligibility: item.criteria_summary,
          minCgpa: `${item.min_cgpa}+ CGPA`,
          timeline: item.deadline,
          description: item.description,
          skills: item.required_skills || []
        }));
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
                  <button type="button" className="primary-link-btn">View Skill Checklist</button>
                  <button type="button" className="secondary-link-btn">Apply Track</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}