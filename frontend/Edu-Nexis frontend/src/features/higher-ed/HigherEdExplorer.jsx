import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import './HigherEdExplorer.css';

const AI_API_BASE = 'http://127.0.0.1:8000';

export default function HigherEdExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'All';

  const [filterCategory, setFilterCategory] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'India' || tabParam === 'Abroad') {
      setFilterCategory(tabParam);
    } else {
      setFilterCategory('All');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchHigherEdPrograms = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${AI_API_BASE}/api/v1/ai/opportunities`);
        const data = await res.json();
        const relevant = (data.items || []).filter(
          (item) => item.domain_id === 'higher_ed' || item.domain_id === 'study_abroad'
        );

        const mapped = relevant.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.domain_id === 'higher_ed' ? 'India' : 'Abroad',
          institution: item.organization,
          minCgpa: `${item.min_cgpa}+ CGPA`,
          eligibility: item.criteria_summary,
          timeline: item.deadline,
          description: item.description
        }));

        setPrograms(mapped);
      } catch (err) {
        console.error('Failed to fetch Higher Ed programs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHigherEdPrograms();
  }, []);

  const handleTabChange = (tab) => {
    setFilterCategory(tab);
    if (tab === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const filteredPrograms = programs.filter((item) => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.institution.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const pageTitle =
    filterCategory === 'India'
      ? 'Higher Education in India (M.Tech / M.Sc. / MBA / B.Ed.)'
      : filterCategory === 'Abroad'
      ? 'Study Abroad & Global MS Programs'
      : 'Higher Education & Study Abroad';

  return (
    <div className="highered-page-wrapper">
      <div className="highered-container">
        <nav className="sub-navbar">
          <Link to="/" className="nav-back">Back to Dashboard</Link>
          <div className="nav-links">
            <Link to="/" className="nav-item">Dashboard</Link>
            <Link to="/government" className="nav-item">Govt. Hub</Link>
            <Link to="/private-jobs" className="nav-item">Private Roles</Link>
            <Link to="/higher-education" className="nav-item active">Higher Ed & Abroad</Link>
            <Link to="/scholarships-courses" className="nav-item">Grants & Courses</Link>
          </div>
        </nav>

        <header className="page-header">
          <div className="badge">
            {filterCategory === 'Abroad' ? 'Global Universities Track' : 'Postgraduate & Global Track'}
          </div>
          <h1>{pageTitle}</h1>
          <p>
            Live domestic postgraduate entrances (GATE, IIT JAM, CAT, CUET-PG) and international MS programs synced from EDU-NEXIS AI.
          </p>
        </header>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by exam, degree, or university (e.g. GATE, JAM, Germany, MS CS)..."
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
              All ({programs.length})
            </button>
            <button
              type="button"
              className={`toggle-btn ${filterCategory === 'India' ? 'active' : ''}`}
              onClick={() => handleTabChange('India')}
            >
              Higher Ed (India)
            </button>
            <button
              type="button"
              className={`toggle-btn ${filterCategory === 'Abroad' ? 'active' : ''}`}
              onClick={() => handleTabChange('Abroad')}
            >
              Study Abroad
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading live postgraduate & global programs from FastAPI...</p>
        ) : (
          <div className="cards-grid">
            {filteredPrograms.map((item) => (
              <div key={item.id} className="highered-card">
                <div className="card-top">
                  <span className={`cat-tag ${item.category.toLowerCase()}`}>
                    {item.category === 'India' ? 'Domestic PG' : 'Study Abroad'}
                  </span>
                  <span className="exam-badge">{item.minCgpa}</span>
                </div>

                <h3>{item.title}</h3>
                <p className="inst-name">{item.institution}</p>

                <div className="specs-list">
                  <div className="spec-item">
                    <span className="spec-label">Criteria:</span>
                    <span className="spec-val">{item.eligibility}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Timeline:</span>
                    <span className="spec-val">{item.timeline}</span>
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
        )}
      </div>
    </div>
  );
}