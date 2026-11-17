import React, { useState } from 'react';
import { Link } from 'react-router';
import './HigherEdExplorer.css';

const HIGHER_ED_DATA = [
  {
    id: 'gate-cse',
    title: 'GATE CS & IT (M.Tech / Direct PhD)',
    category: 'India',
    institution: 'IISc Bangalore & Top IITs / NITs',
    examRequired: 'GATE 2027 (Computer Science)',
    eligibility: 'B.E / B.Tech in CS/IT or allied branches (Final Year Eligible)',
    timeline: 'Exam: Feb 2027 | Counseling: May 2027',
    stipendOrCost: 'Rs 12,400 / month AICTE Stipend',
    description: 'Premier postgraduate engineering gateway in India with teaching assistantship stipend and Maharatna PSU recruitment access.'
  },
  {
    id: 'cat-mba',
    title: 'CAT (MBA / PGDM in Management & Analytics)',
    category: 'India',
    institution: 'IIM Ahmedabad, Bangalore, Calcutta & FMS',
    examRequired: 'CAT 2026',
    eligibility: 'Bachelor Degree with min 50% marks or equivalent CGPA',
    timeline: 'Exam: Nov 2026 | Interviews: Feb - Apr 2027',
    stipendOrCost: 'Average Placement: Rs 25 - 32 LPA',
    description: 'Flagship management and business analytics programs suited for engineers transitioning into product management and strategy.'
  },
  {
    id: 'ms-cs-usa',
    title: 'MS in Computer Science & AI (Fall 2027)',
    category: 'Abroad',
    institution: 'US Public & Ivy Universities (Georgia Tech, UIUC, UCSD)',
    examRequired: 'GRE (Optional/Waived at select schools) + TOEFL / IELTS',
    eligibility: '4-Year B.Tech Degree, 8.0+ CGPA, 2-3 LORs & SOP',
    timeline: 'Deadlines: Dec 2026 - Jan 2027',
    stipendOrCost: 'Tuition: USD 35,000 - 55,000 (RA/TA waivers available)',
    description: 'Research and thesis-driven Master of Science programs specializing in Distributed Systems, Machine Learning, and Cloud Computing.'
  },
  {
    id: 'tu9-germany',
    title: 'M.Sc. Informatics & Data Engineering (Public Universities)',
    category: 'Abroad',
    institution: 'TU9 Universities Germany (TUM, RWTH Aachen)',
    examRequired: 'IELTS (6.5+) / TOEFL + APS Certificate',
    eligibility: 'B.Tech CS/IT with strong theoretical CS & math credits',
    timeline: 'Winter Intake Deadline: May 2027',
    stipendOrCost: 'Zero Tuition Fee (Approx. EUR 300/sem contribution)',
    description: 'Tuition-free English-taught postgraduate engineering degrees in Europe with strong automotive and enterprise R&D links.'
  }
];

export default function HigherEdExplorer() {
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrograms = HIGHER_ED_DATA.filter((item) => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.institution.toLowerCase().includes(query) ||
      item.examRequired.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="highered-page-wrapper">
      <div className="highered-container">
        {/* Navigation Bar */}
        <nav className="sub-navbar">
          <Link to="/" className="nav-back">Back to Dashboard</Link>
          <div className="nav-links">
            <Link to="/" className="nav-item">Dashboard</Link>
            <Link to="/government" className="nav-item">Govt. Hub</Link>
            <Link to="/private-jobs" className="nav-item">Private Roles</Link>
            <Link to="/higher-education" className="nav-item active">Higher Ed & Abroad</Link>
          </div>
        </nav>

        {/* Page Header */}
        <header className="page-header">
          <div className="badge">Postgraduate & Global Track</div>
          <h1>Higher Education & Study Abroad</h1>
          <p>
            Compare domestic postgraduate entrances (GATE, CAT) and international MS programs with exact CGPA cutoffs, exam requirements, and funding details.
          </p>
        </header>

        {/* Filter Controls */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by exam, degree, or university (e.g. GATE, Germany, MS CS)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${filterCategory === 'All' ? 'active' : ''}`}
              onClick={() => setFilterCategory('All')}
            >
              All ({HIGHER_ED_DATA.length})
            </button>
            <button
              type="button"
              className={`toggle-btn ${filterCategory === 'India' ? 'active' : ''}`}
              onClick={() => setFilterCategory('India')}
            >
              Higher Ed (India)
            </button>
            <button
              type="button"
              className={`toggle-btn ${filterCategory === 'Abroad' ? 'active' : ''}`}
              onClick={() => setFilterCategory('Abroad')}
            >
              Study Abroad
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="cards-grid">
          {filteredPrograms.map((item) => (
            <div key={item.id} className="highered-card">
              <div className="card-top">
                <span className={`cat-tag ${item.category.toLowerCase()}`}>
                  {item.category === 'India' ? 'Domestic PG' : 'Study Abroad'}
                </span>
                <span className="exam-badge">{item.examRequired}</span>
              </div>

              <h3>{item.title}</h3>
              <p className="inst-name">{item.institution}</p>

              <div className="specs-list">
                <div className="spec-item">
                  <span className="spec-label">Eligibility:</span>
                  <span className="spec-val">{item.eligibility}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Timeline:</span>
                  <span className="spec-val">{item.timeline}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Financials:</span>
                  <span className="spec-val">{item.stipendOrCost}</span>
                </div>
              </div>

              <p className="desc">{item.description}</p>

              <div className="card-actions">
                <button type="button" className="primary-link-btn">Admission Checklist</button>
                <button type="button" className="secondary-link-btn">Official Brochure</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}