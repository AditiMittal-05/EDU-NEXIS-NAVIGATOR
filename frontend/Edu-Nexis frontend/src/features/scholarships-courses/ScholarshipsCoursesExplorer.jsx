import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import './ScholarshipsCoursesExplorer.css';

const AI_API_BASE = 'http://127.0.0.1:8000';

export default function ScholarshipsCoursesExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'All';

  const [filterCategory, setFilterCategory] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'Scholarship' || tabParam === 'Course') {
      setFilterCategory(tabParam);
    } else {
      setFilterCategory('All');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchGrantsAndCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${AI_API_BASE}/api/v1/ai/opportunities`);
        const data = await res.json();
        const relevant = (data.items || []).filter(
          (item) => item.domain_id === 'scholarships' || item.domain_id === 'bridging_courses'
        );

        const mapped = relevant.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.domain_id === 'scholarships' ? 'Scholarship' : 'Course',
          provider: item.organization,
          eligibility: item.criteria_summary,
          timeline: item.deadline,
          description: item.description,
          skills: item.required_skills || []
        }));

        setItems(mapped);
      } catch (err) {
        console.error('Failed to fetch Scholarships & Courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrantsAndCourses();
  }, []);

  const handleTabChange = (tab) => {
    setFilterCategory(tab);
    if (tab === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const filteredItems = items.filter((item) => {
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
            Live merit-cum-means fellowships and targeted technical certifications synced from EDU-NEXIS AI.
          </p>
        </header>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by scholarship, course, or skill (e.g. AICTE, INSPIRE, DAAD, NLP, Pedagogy)..."
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
              All ({items.length})
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

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading live scholarships & bridging courses from FastAPI...</p>
        ) : (
          <div className="cards-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="sc-card">
                <div className="card-top">
                  <span className={`cat-tag ${item.category.toLowerCase()}`}>
                    {item.category === 'Scholarship' ? 'Grant / Fellowship' : 'Skill Course'}
                  </span>
                  <span className="meta-badge">{item.timeline}</span>
                </div>

                <h3>{item.title}</h3>
                <p className="provider-name">{item.provider}</p>

                <div className="specs-list">
                  <div className="spec-item">
                    <span className="spec-label">Criteria & Scope:</span>
                    <span className="spec-val">{item.eligibility}</span>
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
        )}
      </div>
    </div>
  );
}