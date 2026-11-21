import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import './ScholarshipsCoursesExplorer.css';

const AI_API_BASE = 'http://127.0.0.1:8000';

const GRANTS_COURSES_DETAILS = {
  'aicte-pragati-saksham': {
    url: 'https://scholarships.gov.in/',
    benefit: 'Rs 50,000 per annum lump-sum grant towards college tuition, laptop/hardware, and books (up to 4 years).',
    checklist: 'Family Annual Income Certificate (< Rs 8 Lakh) + AICTE Institute Bonafide Certificate + Aadhaar & Bank Mandate on NSP.'
  },
  'daad-wise-fellowship': {
    url: 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/',
    benefit: 'EUR 934/month living stipend + EUR 1,050 airfare subsidy + German health/accident insurance for 2-3 months.',
    checklist: 'CGPA 8.5+ Transcripts + Official Invitation Letter from a German Professor + No Objection Certificate (NOC) from Home Institute.'
  },
  'inspire-she-fellowship': {
    url: 'https://online-inspire.gov.in/',
    benefit: 'Rs 60,000 annual cash scholarship + Rs 20,000 summer research project mentorship grant (Rs 80,000/year total).',
    checklist: 'Top 1% Class XII Board Merit / JEE-NEET Rank + Enrollment in B.Sc./Integrated M.Sc. Basic & Natural Sciences.'
  },
  'nptel-ml-nlp-bridge': {
    url: 'https://swayam.gov.in/nc_details/NPTEL',
    benefit: 'Free video lectures & weekly assignments from IIT faculty; optional Rs 1,000 proctored exam for credit-transfer certificate.',
    checklist: 'Weekly Python/Colab coding assignments (min 40% assignment score + 40% proctored exam score for IIT certificate).'
  },
  'microservices-react-bridge': {
    url: 'https://training.linuxfoundation.org/',
    benefit: 'Hands-on architecture labs covering FastAPI async APIs, Spring Boot JWT security, React hooks, and Docker Compose.',
    checklist: 'Build and containerize a multi-service REST application with automated health checks and CORS security.'
  },
  'swayam-pedagogy-ict-bridge': {
    url: 'https://swayam.gov.in/',
    benefit: 'Zero-cost Govt. of India teaching certification covering Bloom’s Taxonomy, digital rubrics, and AI classroom tools.',
    checklist: 'Complete 8 weekly modules + lesson plan peer review + online assessment for NCERT/SWAYAM certificate.'
  }
};

export default function ScholarshipsCoursesExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const filterCategory = tabParam === 'Scholarship' || tabParam === 'Course' ? tabParam : 'All';

  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeItemModal, setActiveItemModal] = useState(null);

  useEffect(() => {
    const fetchGrantsAndCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${AI_API_BASE}/api/v1/ai/opportunities`);
        const data = await res.json();
        const relevant = (data.items || []).filter(
          (item) => item.domain_id === 'scholarships' || item.domain_id === 'bridging_courses'
        );

        const mapped = relevant.map((item) => {
          const extra = GRANTS_COURSES_DETAILS[item.id] || {
            url: 'https://scholarships.gov.in/',
            benefit: 'Financial grant or verified skill certification upon successful completion.',
            checklist: 'Academic transcripts, valid student ID, and online portal registration.'
          };
          return {
            id: item.id,
            title: item.title,
            category: item.domain_id === 'scholarships' ? 'Scholarship' : 'Course',
            provider: item.organization,
            eligibility: item.criteria_summary,
            timeline: item.deadline,
            description: item.description,
            skills: item.required_skills || [],
            portalUrl: extra.url,
            benefitDetails: extra.benefit,
            actionChecklist: extra.checklist
          };
        });

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
                  <button
                    type="button"
                    className="primary-link-btn"
                    onClick={() => setActiveItemModal(item)}
                  >
                    {item.category === 'Scholarship' ? 'Check Grant Criteria' : 'Start Learning Track'}
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

        {activeItemModal && (
          <div
            onClick={() => setActiveItemModal(null)}
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
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                    {activeItemModal.provider}
                  </span>
                  <h2 style={{ fontSize: '1.3rem', margin: '6px 0 12px' }}>{activeItemModal.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveItemModal(null)}
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
                  <strong style={{ color: '#34d399' }}>
                    {activeItemModal.category === 'Scholarship' ? 'Financial Grant & Stipend:' : 'Course Structure & Certification:'}
                  </strong>
                  <p style={{ margin: '4px 0 0', color: '#e2e8f0' }}>{activeItemModal.benefitDetails}</p>
                </div>
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
                  <strong style={{ color: '#93c5fd' }}>
                    {activeItemModal.category === 'Scholarship' ? 'Documents Required:' : 'Completion & Assessment Milestones:'}
                  </strong>
                  <p style={{ margin: '4px 0 0', color: '#e2e8f0' }}>{activeItemModal.actionChecklist}</p>
                </div>
                <div>
                  <strong style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>Associated Skills & Prerequisites:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {activeItemModal.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: '0.78rem',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(52, 211, 153, 0.14)',
                          color: '#34d399',
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
                  href={activeItemModal.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-link-btn"
                  style={{ textDecoration: 'none', padding: '10px 18px' }}
                >
                  Open Official Portal -&gt;
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}