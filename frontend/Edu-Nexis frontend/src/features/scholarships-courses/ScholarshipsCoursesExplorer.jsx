import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import './ScholarshipsCoursesExplorer.css';

const SCHOLARSHIPS_COURSES_DATA = [
  {
    id: 'aicte-pragati-saksham',
    title: 'AICTE Pragati & Saksham Scholarship Scheme',
    category: 'Scholarship',
    provider: 'Ministry of Education / National Scholarship Portal',
    eligibility: 'B.Tech / Diploma students (Family income below Rs 8 LPA)',
    benefitOrDuration: 'Rs 50,000 per annum towards tuition and academic expenses',
    deadlineOrLevel: 'Deadline: December 2026',
    description: 'Central government merit-cum-means financial grant supporting technical degree students across AICTE-approved institutions.'
  },
  {
    id: 'daad-wise-germany',
    title: 'DAAD WISE Research Internship & Scholarship',
    category: 'Scholarship',
    provider: 'German Academic Exchange Service (DAAD)',
    eligibility: 'Pre-final / Final year B.Tech students at Indian institutes (CGPA 8.5+)',
    benefitOrDuration: 'EUR 934 / month stipend + travel & insurance grant',
    deadlineOrLevel: 'Annual Intake Window',
    description: 'Fully funded 2-to-3 month research internship under German university professors in Computer Science and Engineering.'
  },
  {
    id: 'nptel-ai-ml',
    title: 'Applied Machine Learning & NLP Specialization',
    category: 'Course',
    provider: 'NPTEL (IIT Madras) / SWAYAM',
    eligibility: 'Basic Python & Linear Algebra familiarity',
    benefitOrDuration: '12 Weeks (Free audit | Rs 1,000 proctored exam)',
    deadlineOrLevel: 'Intermediate | Credit Transfer Eligible',
    description: 'Bridges skill gaps in transformer architectures, spaCy NLP pipelines, and scikit-learn modeling with IIT faculty certification.'
  },
  {
    id: 'fullstack-microservices-bridge',
    title: 'Production Microservices: FastAPI, Spring Boot & React',
    category: 'Course',
    provider: 'Linux Foundation / Open Source Track',
    eligibility: 'Knowledge of REST APIs and Git version control',
    benefitOrDuration: '6 Weeks Self-Paced | Verified Digital Badge',
    deadlineOrLevel: 'Hands-On | Bridges Cloud & Backend Gaps',
    description: 'Practical capstone track covering containerization, JWT security, and multi-service API orchestration for SDE-1 readiness.'
  }
];

export default function ScholarshipsCoursesExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'All';

  const [filterCategory, setFilterCategory] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'Scholarship' || tabParam === 'Course') {
      setFilterCategory(tabParam);
    } else {
      setFilterCategory('All');
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setFilterCategory(tab);
    if (tab === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const filteredItems = SCHOLARSHIPS_COURSES_DATA.filter((item) => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.provider.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const pageTitle =
    filterCategory === 'Scholarship'
      ? 'Scholarships, Fellowships & Financial Grants'
      : filterCategory === 'Course'
      ? 'Skill Bridging Courses & Certifications'
      : 'Scholarships, Grants & Skill Bridging Courses';

  return (
    <div className="sc-page-wrapper">
      <div className="sc-container">
        <nav className="sub-navbar">
          <Link to="/" className="nav-back">Back to Dashboard</Link>
          <div className="nav-links">
            <Link to="/" className="nav-item">Dashboard</Link>
            <Link to="/government" className="nav-item">Govt. Hub</Link>
            <Link to="/private-jobs" className="nav-item">Private Roles</Link>
            <Link to="/higher-education" className="nav-item">Higher Ed</Link>
            <Link to="/scholarships-courses" className="nav-item active">Grants & Courses</Link>
          </div>
        </nav>

        <header className="page-header">
          <div className="badge">
            {filterCategory === 'Scholarship'
              ? 'Financial Aid & Fellowships'
              : filterCategory === 'Course'
              ? 'Technical Upskilling Track'
              : 'Financial Aid & Upskilling Track'}
          </div>
          <h1>{pageTitle}</h1>
          <p>
            Discover merit-cum-means fellowships and targeted technical certifications designed to close skill gaps identified in your profile.
          </p>
        </header>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by scholarship, course, or skill (e.g. AICTE, DAAD, NLP, Microservices)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${filterCategory === 'All' ? 'active' : ''}`}
              onClick={() => handleTabChange('All')}
            >
              All ({SCHOLARSHIPS_COURSES_DATA.length})
            </button>
            <button
              type="button"
              className={`toggle-btn ${filterCategory === 'Scholarship' ? 'active' : ''}`}
              onClick={() => handleTabChange('Scholarship')}
            >
              Scholarships & Grants
            </button>
            <button
              type="button"
              className={`toggle-btn ${filterCategory === 'Course' ? 'active' : ''}`}
              onClick={() => handleTabChange('Course')}
            >
              Skill Bridging Courses
            </button>
          </div>
        </div>

        <div className="cards-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="sc-card">
              <div className="card-top">
                <span className={`cat-tag ${item.category.toLowerCase()}`}>
                  {item.category === 'Scholarship' ? 'Grant / Fellowship' : 'Skill Course'}
                </span>
                <span className="meta-badge">{item.deadlineOrLevel}</span>
              </div>

              <h3>{item.title}</h3>
              <p className="provider-name">{item.provider}</p>

              <div className="specs-list">
                <div className="spec-item">
                  <span className="spec-label">Eligibility:</span>
                  <span className="spec-val">{item.eligibility}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Benefit / Scope:</span>
                  <span className="spec-val">{item.benefitOrDuration}</span>
                </div>
              </div>

              <p className="desc">{item.description}</p>

              <div className="card-actions">
                <button type="button" className="primary-link-btn">
                  {item.category === 'Scholarship' ? 'Check Grant Criteria' : 'Start Learning Track'}
                </button>
                <button type="button" className="secondary-link-btn">Official Portal</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}