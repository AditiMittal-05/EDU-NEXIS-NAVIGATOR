import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import './GovtExplorer.css';

const AI_API_BASE = 'http://127.0.0.1:8000';

const GOVT_PORTAL_DETAILS = {
  'isro-sc-2026': {
    url: 'https://www.isro.gov.in/Careers.html',
    pattern: 'Written Test (80 MCQs in 90 mins: Core CS/IT) + Technical Interview (Min 60% in Interview).',
    cutoff: 'Typical Written Cutoff: 55% - 62% (General Category).'
  },
  'nic-scientist-b': {
    url: 'https://www.calicut.nielit.in/nic/',
    pattern: '120 Objective Questions in 3 Hours (65% Technical CS/IT + 35% Generic Aptitude) + Interview.',
    cutoff: 'Typical Written Cutoff: 62% - 68%.'
  },
  'kvs-tgt-pgt-teacher': {
    url: 'https://kvsangathan.nic.in/announcement/',
    pattern: '180 Marks CBT (General English/Hindi, Reasoning, Computer Literacy, Pedagogy & Subject) + 60 Marks Demo Teaching & Interview.',
    cutoff: 'Typical Final Merit Cutoff: 72% - 78%.'
  },
  'drdo-ceptam-sta': {
    url: 'https://www.drdo.gov.in/drdo/ceptam-notice-board',
    pattern: 'Tier-I CBT (Screening: Quant, Reasoning, GA, English) + Tier-II CBT (Subject-Specific Technical Paper).',
    cutoff: 'Tier-I Normalized Percentile: 85+.'
  },
  'upsc-cse-2027': {
    url: 'https://upsc.gov.in/',
    pattern: 'Prelims (GS Paper-I + CSAT Qualifying) -> Mains (9 Descriptive Papers) -> Personality Test (275 Marks).',
    cutoff: 'Prelims GS-I Cutoff: ~88 - 95 / 200 Marks.'
  },
  'ssc-cgl-2026': {
    url: 'https://ssc.gov.in/',
    pattern: 'Tier-I Qualifying CBT -> Tier-II Paper-I (Maths, Reasoning, English, General Awareness, Computer Knowledge).',
    cutoff: 'ASO / Inspector Tier-II Cutoff: ~310 - 325 / 390 Marks.'
  },
  'ctet-ugc-net-teaching': {
    url: 'https://ugcnet.nta.ac.in/',
    pattern: 'Paper-I (Teaching & Research Aptitude - 50 Qs) + Paper-II (Subject Mastery - 100 Qs), No Negative Marking.',
    cutoff: 'Assistant Professor Cutoff: ~58% - 64% Aggregate.'
  },
  'ibps-po-rbi-grade-b': {
    url: 'https://www.ibps.in/',
    pattern: 'Prelims (100 Marks) -> Mains (200 Marks + Descriptive English) -> Group Exercise & Interview.',
    cutoff: 'Mains Cutoff: ~75 - 85 / 225 Marks.'
  }
};

export default function GovtExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'All';

  const [filterType, setFilterType] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [govtItems, setGovtItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalItem, setActiveModalItem] = useState(null);

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

        const mapped = filteredDomains.map((item) => {
          const extra = GOVT_PORTAL_DETAILS[item.id] || {
            url: 'https://www.ncs.gov.in/',
            pattern: 'Computer-Based Objective Test + Document Verification / Interview.',
            cutoff: 'Check official notification PDF for category-wise cutoffs.'
          };
          return {
            id: item.id,
            title: item.title,
            type: item.domain_id === 'govt_jobs' ? 'Job' : 'Exam',
            organization: item.organization,
            eligibility: item.criteria_summary,
            ageLimit: `Up to ${item.max_age} Years`,
            deadline: item.deadline,
            description: item.description,
            skills: item.required_skills || [],
            portalUrl: extra.url,
            examPattern: extra.pattern,
            cutoffInfo: extra.cutoff
          };
        });

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
                  <button
                    type="button"
                    className="primary-link-btn"
                    onClick={() => setActiveModalItem(item)}
                  >
                    View Syllabus & Cutoff
                  </button>
                  <a
                    href={item.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="secondary-link-btn"
                    style={{ textAlign: 'center', textDecoration: 'none' }}
                  >
                    Official Portal
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeModalItem && (
          <div
            onClick={() => setActiveModalItem(null)}
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
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                    {activeModalItem.organization}
                  </span>
                  <h2 style={{ fontSize: '1.3rem', margin: '6px 0 12px' }}>{activeModalItem.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
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
                  <strong style={{ color: '#93c5fd' }}>Selection Pattern:</strong>
                  <p style={{ margin: '4px 0 0', color: '#e2e8f0' }}>{activeModalItem.examPattern}</p>
                </div>
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
                  <strong style={{ color: '#34d399' }}>Benchmark Cutoff:</strong>
                  <p style={{ margin: '4px 0 0', color: '#e2e8f0' }}>{activeModalItem.cutoffInfo}</p>
                </div>
                <div>
                  <strong style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>Key Syllabus & Skill Areas:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {activeModalItem.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: '0.78rem',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(56, 189, 248, 0.14)',
                          color: '#38bdf8',
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
                  href={activeModalItem.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-link-btn"
                  style={{ textDecoration: 'none', padding: '10px 18px' }}
                >
                  Open Official Website -&gt;
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}