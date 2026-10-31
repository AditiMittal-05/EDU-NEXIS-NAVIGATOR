import React, { useState } from 'react';
import { Link } from 'react-router';
import './GovtExplorer.css';

const GOVT_DATA = [
  {
    id: 'isro-sc',
    title: 'ISRO Scientist / Engineer SC',
    type: 'Job',
    department: 'Space Commission / DOS',
    eligibility: 'B.E / B.Tech (First Class, min 65% or 6.84 CGPA)',
    ageLimit: '18 - 28 Years',
    examDate: 'December 2026',
    applicationStatus: 'Open',
    salary: 'Rs 56,100 - Rs 1,77,500 (Level 10)',
    description: 'Technical entry into satellite systems and payload software design teams via ICRB screening.'
  },
  {
    id: 'ssc-cgl',
    title: 'SSC CGL (Combined Graduate Level)',
    type: 'Exam',
    department: 'Staff Selection Commission',
    eligibility: 'Any Bachelors Degree from a recognized university',
    ageLimit: '18 - 30 Years (Post specific)',
    examDate: 'September 2026',
    applicationStatus: 'Upcoming',
    salary: 'Pay Level 4 to Level 8 (Rs 25,500 - Rs 1,51,100)',
    description: 'Recruitment to Group B and Group C officers in Central Ministries, GST, Income Tax, and CBI.'
  },
  {
    id: 'drdo-rac',
    title: 'DRDO Scientist B Recruitment',
    type: 'Job',
    department: 'Ministry of Defence',
    eligibility: 'B.Tech with valid GATE Score (CSE/ECE/EE/ME)',
    ageLimit: 'Up to 28 Years',
    examDate: 'January 2027',
    applicationStatus: 'Open',
    salary: 'Rs 56,100 (Level 10) + allowances',
    description: 'Core research in embedded software, aerospace telemetry, and defense tech systems.'
  },
  {
    id: 'upsc-ese',
    title: 'UPSC Engineering Services Exam (ESE)',
    type: 'Exam',
    department: 'Union Public Service Commission',
    eligibility: 'Degree in Civil, Mechanical, Electrical, or Electronics and Telecommunication',
    ageLimit: '21 - 30 Years',
    examDate: 'February 2027',
    applicationStatus: 'Upcoming',
    salary: 'Class-1 Gazetted Officer Pay',
    description: 'Entry to Indian Railway Service of Engineers, Central Power Engineering, and Indian Naval Armament.'
  }
];

export default function GovtExplorer() {
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = GOVT_DATA.filter((item) => {
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="govt-page-wrapper">
      <div className="govt-container">
        {/* Navigation Bar */}
        <nav className="sub-navbar">
          <Link to="/" className="nav-back">Back to Dashboard</Link>
          <div className="nav-links">
            <Link to="/" className="nav-item">Dashboard</Link>
            <Link to="/government" className="nav-item active">Govt. Hub</Link>
            <Link to="/register" className="nav-item">Account</Link>
          </div>
        </nav>

        {/* Page Header */}
        <header className="page-header">
          <div className="badge">Public Sector Gateway</div>
          <h1>Government Jobs and Examinations</h1>
          <p>
            Curated Central and State opportunities with explicit degree eligibility, age bounds, syllabus details, and salary grades.
          </p>
        </header>

        {/* Filter Controls */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by role, agency, or department (e.g. ISRO, SSC, DRDO)..."
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
              All ({GOVT_DATA.length})
            </button>
            <button
              type="button"
              className={`toggle-btn ${filterType === 'Job' ? 'active' : ''}`}
              onClick={() => setFilterType('Job')}
            >
              Jobs (Direct)
            </button>
            <button
              type="button"
              className={`toggle-btn ${filterType === 'Exam' ? 'active' : ''}`}
              onClick={() => setFilterType('Exam')}
            >
              Exams
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="cards-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="govt-card">
              <div className="card-top">
                <span className={`type-tag ${item.type.toLowerCase()}`}>{item.type}</span>
                <span className={`status-tag ${item.applicationStatus.toLowerCase()}`}>
                  {item.applicationStatus}
                </span>
              </div>
              <h3>{item.title}</h3>
              <p className="dept-name">{item.department}</p>

              <div className="specs-list">
                <div className="spec-item">
                  <span className="spec-label">Eligibility:</span>
                  <span className="spec-val">{item.eligibility}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Age Limit:</span>
                  <span className="spec-val">{item.ageLimit}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Timeline:</span>
                  <span className="spec-val">{item.examDate}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Scale:</span>
                  <span className="spec-val">{item.salary}</span>
                </div>
              </div>

              <p className="desc">{item.description}</p>

              <div className="card-actions">
                <button type="button" className="primary-link-btn">Syllabus and Past Cutoffs</button>
                <button type="button" className="secondary-link-btn">Official Portal</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}