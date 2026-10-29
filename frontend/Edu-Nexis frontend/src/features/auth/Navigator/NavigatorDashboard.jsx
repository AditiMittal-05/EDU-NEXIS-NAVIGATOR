import React, { useState } from 'react';
import './NavigatorDashboard.css';

const DOMAINS = [
  { id: 'govt_jobs', name: 'Government Jobs', icon: '🏛️', count: '14 Active' },
  { id: 'govt_exams', name: 'Govt. Examinations', icon: '📝', count: '6 Upcoming' },
  { id: 'private_jobs', name: 'Private Sector Roles', icon: '💼', count: '38 Listings' },
  { id: 'higher_ed', name: 'Higher Education', icon: '🎓', count: '12 Programs' },
  { id: 'study_abroad', name: 'Study Abroad', icon: '✈️', count: '9 Dest.' },
  { id: 'scholarships', name: 'Scholarships & Grants', icon: '💰', count: '21 Open' },
  { id: 'courses', name: 'Skill Bridging Courses', icon: '⚡', count: '15 Tracks' }
];

const INITIAL_RESULTS = [
  {
    domain: 'Government Jobs',
    title: 'ISRO Scientist / Engineer ‘SC’',
    match: 94,
    eligibility: 'Eligible (B.Tech First Class)',
    description: 'Direct entry via ICRB written test based on core engineering syllabus.',
    deadline: 'Application closes Nov 15'
  },
  {
    domain: 'Private Sector Roles',
    title: 'Junior Software Engineer (Cloud & AI)',
    match: 88,
    eligibility: 'Skills Match: 4/5',
    description: 'Requires Python, React fundamentals, and basic REST API understanding.',
    deadline: 'Rolling Basis'
  },
  {
    domain: 'Scholarships & Grants',
    title: 'Pre-Doctoral & Post-Grad Tech Fellowship',
    match: 82,
    eligibility: 'CGPA > 7.5 Required',
    description: 'Full tuition waiver + ₹25,000 monthly stipend for deep tech projects.',
    deadline: 'Dec 01 Deadline'
  }
];

export default function NavigatorDashboard() {
  const [formData, setFormData] = useState({
    degree: 'B.Tech Computer Science',
    cgpa: '8.2',
    age: '21',
    skills: 'Python, JavaScript, SQL, Git',
    careerGoal: 'Seeking a balanced technical role in public or private tech labs.'
  });

  const [selectedDomain, setSelectedDomain] = useState('All');
  const [results, setResults] = useState(INITIAL_RESULTS);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    alert('Profile submitted! Finding optimal career matches...');
  };

  return (
    <div className="navigator-page-wrapper">
      <div className="app-container">
        {/* Top Navbar */}
        <header className="navbar">
          <div className="brand">
            <div className="logo-badge">EN</div>
            <div>
              <h1>EDU-NEXIS Navigator</h1>
              <p className="subtitle">AI Multi-Agent Career & Opportunity Discovery</p>
            </div>
          </div>
          <div className="status-indicator">
            <span className="dot"></span> Microservices Active
          </div>
        </header>

        <main className="main-content">
          {/* Left Column: Intake Profile */}
          <section className="card form-section">
            <h2>Student Profile Intake</h2>
            <p className="section-desc">Provide your credentials to map against all 7 opportunity streams.</p>

            <form onSubmit={handleSearch} className="form-grid">
              <div className="input-group">
                <label>Degree & Major</label>
                <input type="text" name="degree" value={formData.degree} onChange={handleChange} required />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>CGPA / Percentage</label>
                  <input type="text" name="cgpa" value={formData.cgpa} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} required />
                </div>
              </div>

              <div className="input-group">
                <label>Skills (Comma-separated)</label>
                <input type="text" name="skills" value={formData.skills} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Career Goal / Target</label>
                <textarea name="careerGoal" rows="3" value={formData.careerGoal} onChange={handleChange} />
              </div>

              <button type="submit" className="submit-btn">Run Opportunity Navigator</button>
            </form>
          </section>

          {/* Right Column: Domains & Matches */}
          <section className="results-section">
            {/* Domain Badges */}
            <div className="domain-bar">
              {DOMAINS.map((domain) => (
                <button 
                  key={domain.id} 
                  type="button"
                  className={`domain-pill ${selectedDomain === domain.id ? 'active' : ''}`}
                  onClick={() => setSelectedDomain(domain.id)}
                >
                  <span>{domain.icon}</span> {domain.name}
                </button>
              ))}
            </div>

            <h2 className="results-heading">Top Matched Pathways</h2>

            <div className="results-grid">
              {results.map((item, idx) => (
                <div key={idx} className="card result-card">
                  <div className="result-header">
                    <span className="domain-tag">{item.domain}</span>
                    <span className="match-tag">{item.match}% Match</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p className="result-meta"><strong>Criteria:</strong> {item.eligibility}</p>
                  <p className="result-desc">{item.description}</p>
                  <div className="result-footer">
                    <span className="deadline-text">{item.deadline}</span>
                    <button type="button" className="action-btn">Explore Pathway →</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}