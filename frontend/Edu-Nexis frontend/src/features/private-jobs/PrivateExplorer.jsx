import React, { useState } from 'react';
import { Link } from 'react-router';
import './PrivateExplorer.css';

const PRIVATE_ROLES_DATA = [
  {
    id: 'swe-cloud-ai',
    title: 'Junior Software Engineer (Cloud & AI)',
    roleType: 'Full-Time',
    company: 'TechNova Cloud Systems',
    location: 'Bengaluru / Hybrid',
    skillsRequired: ['Python', 'FastAPI', 'React.js', 'Git'],
    ctcPackage: 'Rs 8.5 LPA - Rs 11.0 LPA',
    experience: '0 - 1 Years (2026/2027 Graduates)',
    matchScore: 92,
    description: 'Build scalable AI microservices, REST APIs, and responsive user interfaces for enterprise automation.'
  },
  {
    id: 'fullstack-intern',
    title: 'Full Stack Developer Intern',
    roleType: 'Internship',
    company: 'FinStack Digital',
    location: 'Noida / Remote',
    skillsRequired: ['JavaScript', 'React.js', 'Node.js', 'MySQL'],
    ctcPackage: 'Rs 25,000 / month (PPO up to Rs 7.5 LPA)',
    experience: 'Final Year B.Tech / MCA',
    matchScore: 89,
    description: 'Work alongside core product teams on client dashboards, database schemas, and JWT authentication workflows.'
  },
  {
    id: 'data-analyst-grad',
    title: 'Graduate Data & ML Analyst',
    roleType: 'Full-Time',
    company: 'QuantEdge Analytics',
    location: 'Gurugram',
    skillsRequired: ['Python', 'SQL', 'Pandas', 'Machine Learning'],
    ctcPackage: 'Rs 6.8 LPA - Rs 9.0 LPA',
    experience: 'Freshers (Min 7.5 CGPA)',
    matchScore: 84,
    description: 'Analyze structured datasets, build predictive pipelines, and generate automated business insights.'
  },
  {
    id: 'backend-sde1',
    title: 'Software Development Engineer - I (Backend)',
    roleType: 'Full-Time',
    company: 'NexGen Commerce',
    location: 'Hyderabad',
    skillsRequired: ['Java', 'Spring Boot', 'MySQL', 'REST APIs'],
    ctcPackage: 'Rs 10.0 LPA - Rs 13.5 LPA',
    experience: '0 - 2 Years',
    matchScore: 81,
    description: 'Design high-throughput microservices, handle database optimization, and maintain payment gateways.'
  }
];

export default function PrivateExplorer() {
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoles = PRIVATE_ROLES_DATA.filter((item) => {
    const matchesType = filterType === 'All' || item.roleType === filterType;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.company.toLowerCase().includes(query) ||
      item.skillsRequired.some((skill) => skill.toLowerCase().includes(query));
    return matchesType && matchesSearch;
  });

  return (
    <div className="private-page-wrapper">
      <div className="private-container">
        {/* Navigation Bar */}
        <nav className="sub-navbar">
          <Link to="/" className="nav-back">Back to Dashboard</Link>
          <div className="nav-links">
            <Link to="/" className="nav-item">Dashboard</Link>
            <Link to="/government" className="nav-item">Govt. Hub</Link>
            <Link to="/private-jobs" className="nav-item active">Private Roles</Link>
            <Link to="/register" className="nav-item">Account</Link>
          </div>
        </nav>

        {/* Page Header */}
        <header className="page-header">
          <div className="badge">Corporate & Startup Track</div>
          <h1>Private Sector Roles & Internships</h1>
          <p>
            Industry job openings and PPO internships matched against your technical stack, CGPA, and project experience.
          </p>
        </header>

        {/* Filter Controls */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by role, company, or skill (e.g. Python, React, SQL)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${filterType === 'All' ? 'active' : ''}`}
              onClick={() => setFilterType('All')}
            >
              All ({PRIVATE_ROLES_DATA.length})
            </button>
            <button
              type="button"
              className={`toggle-btn ${filterType === 'Full-Time' ? 'active' : ''}`}
              onClick={() => setFilterType('Full-Time')}
            >
              Full-Time
            </button>
            <button
              type="button"
              className={`toggle-btn ${filterType === 'Internship' ? 'active' : ''}`}
              onClick={() => setFilterType('Internship')}
            >
              Internships
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="cards-grid">
          {filteredRoles.map((item) => (
            <div key={item.id} className="private-card">
              <div className="card-top">
                <span className={`role-tag ${item.roleType === 'Full-Time' ? 'fulltime' : 'intern'}`}>
                  {item.roleType}
                </span>
                <span className="match-badge">{item.matchScore}% Skill Match</span>
              </div>

              <h3>{item.title}</h3>
              <p className="company-name">{item.company} | {item.location}</p>

              <div className="skills-row">
                {item.skillsRequired.map((skill) => (
                  <span key={skill} className="skill-chip">{skill}</span>
                ))}
              </div>

              <div className="specs-list">
                <div className="spec-item">
                  <span className="spec-label">Compensation:</span>
                  <span className="spec-val">{item.ctcPackage}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Eligibility:</span>
                  <span className="spec-val">{item.experience}</span>
                </div>
              </div>

              <p className="desc">{item.description}</p>

              <div className="card-actions">
                <button type="button" className="primary-link-btn">View Skill Gap Analysis</button>
                <button type="button" className="secondary-link-btn">Apply Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}