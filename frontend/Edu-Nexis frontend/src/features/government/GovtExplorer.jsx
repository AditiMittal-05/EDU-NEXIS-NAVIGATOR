import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import './GovtExplorer.css';

const AI_API_BASE = 'http://127.0.0.1:8000';

export default function GovtExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'All';

  const [filterType, setFilterType] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [govtItems, setGovtItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'Job' || tabParam === 'Exam') {
      setFilterType(tabParam);
    } else {
      setFilterType('All');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchGovtOpportunities = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${AI_API_BASE}/api/v1/ai/opportunities`);
        const data = await res.json();
        const filteredDomains = (data.items || []).filter(
          (item) => item.domain_id === 'govt_jobs' || item.domain_id === 'govt_exams'
        );

        const mapped = filteredDomains.map((item) => ({
          id: item.id,
          title: item.title,
          type: item.domain_id === 'govt_jobs' ? 'Job' : 'Exam',
          organization: item.organization,
          eligibility: item.criteria_summary,
          ageLimit: `Up to ${item.max_age} Years`,
          deadline: item.deadline,
          description: item.description,
          skills: item.required_skills || []
        }));

        setGovtItems(mapped);
      } catch (err) {
        console.error('Failed to fetch Govt opportunities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGovtOpportunities();
  }, []);

  const handleTabChange = (tab) => {
    setFilterType(tab);
    if (tab === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const filteredList = govtItems.filter((item) => {
    const matchesType = filterType === 'All' || item.type === filterType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.organization.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  return (
    <div className="govt-page-wrapper">
      <div className="govt-container">
        <nav className="sub-navbar">
          <Link to="/" className="nav-back">Back to Dashboard</Link>
          <div className="nav-links">
            <Link to="/" className="nav-item">Dashboard</Link>
            <Link to="/government" className="nav-item active">Govt. Hub</Link>
            <Link to="/private-jobs" className="nav-item">Private Roles</Link>
            <Link to="/higher-education" className="nav-item">Higher Ed</Link>
            <Link to="/scholarships-courses" className="nav-item">Grants & Courses</Link>
          </div>
        </nav>

        <header className="page-header">
          <div className="badge">Public Sector & Civil Services Track</div>
          <h1>
            {filterType === 'Job'
              ? 'Government Technical & Teaching Jobs'
              : filterType === 'Exam'
              ? 'National & State Government Examinations'
              : 'Government Jobs & Competitive Examinations'}
          </h1>
          <p>
            Live verified public sector openings, scientific officer posts, teaching recruitment, and national civil service exams synced from EDU-NEXIS AI.
          </p>
        </header>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search ISRO, KVS, UPSC, SSC, CTET, DRDO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${filterType === 'All' ? 'active' : ''}`}
              onClick={() => handleTabChange('All')}
            >
              All ({govtItems.length})
            </button>
            <button
              type="button"
              className={`toggle-btn ${filterType === 'Job' ? 'active' : ''}`}
              onClick={() => handleTabChange('Job')}
            >
              Govt. Jobs
            </button>
            <button
              type="button"
              className={`toggle-btn ${filterType === 'Exam' ? 'active' : ''}`}
              onClick={() => handleTabChange('Exam')}
            >
              Govt. Exams
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading live government opportunities from FastAPI...</p>
        ) : (
          <div className="cards-grid">
            {filteredList.map((item) => (
              <div key={item.id} className="govt-card">
                <div className="card-top">
                  <span className={`type-tag ${item.type.toLowerCase()}`}>
                    {item.type === 'Job' ? 'Direct Recruitment' : 'Competitive Exam'}
                  </span>
                  <span className="age-badge">{item.ageLimit}</span>
                </div>

                <h3>{item.title}</h3>
                <p className="org-name">{item.organization}</p>

                <div className="specs-list">
                  <div className="spec-item">
                    <span className="spec-label">Criteria:</span>
                    <span className="spec-val">{item.eligibility}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Schedule:</span>
                    <span className="spec-val">{item.deadline}</span>
                  </div>
                </div>

                <p className="desc">{item.description}</p>

                <div className="card-actions">
                  <button type="button" className="primary-link-btn">View Syllabus & Cutoff</button>
                  <button type="button" className="secondary-link-btn">Official Notification</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}