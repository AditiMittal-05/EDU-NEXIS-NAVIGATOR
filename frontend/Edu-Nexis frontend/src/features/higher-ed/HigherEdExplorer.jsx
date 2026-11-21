import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import './HigherEdExplorer.css';

const AI_API_BASE = 'http://127.0.0.1:8000';

const HIGHERED_DETAILS = {
  'gate-cs-2027': {
    url: 'https://www.iisc.ac.in/admissions/',
    format: '65 Questions (100 Marks, 3 Hours): 15 Marks General Aptitude + 13 Marks Engineering Maths + 72 Marks Core CS/IT.',
    checklist: 'Valid GATE Scorecard -> COAP Portal Registration (for IIT M.Tech) & CCMT Portal (for NITs) + PSU separate applications.'
  },
  'iit-jam-msc-2027': {
    url: 'https://jam.iitm.ac.in/',
    format: '60 Questions (100 Marks, 3 Hours): Section A (30 MCQs), Section B (10 MSQs), Section C (20 NATs).',
    checklist: 'Bachelor’s Degree Marksheets + JOAPS Portal Registration -> Centralized Admission Portal for IITs & IISc.'
  },
  'cat-2026-mba': {
    url: 'https://iimcat.ac.in/',
    format: '3 Timed Sections (40 mins each, 120 mins total): VARC, DILR, and Quantitative Ability.',
    checklist: 'CAT Percentile (95-99+ for IIMs) -> Written Ability Test (WAT) & Personal Interview (PI) + Academic/Work-Ex Profile.'
  },
  'bed-integrated-med': {
    url: 'https://exams.nta.ac.in/CUET-PG/',
    format: 'CUET-PG Domain Paper (75 Domain-Specific MCQs in 105 mins covering Teaching Aptitude, Maths & Science).',
    checklist: 'Graduation Degree + CUET-PG Scorecard -> DU CSAS / BHU / NCERT RIE Common Entrance Counselling.'
  },
  'ms-cs-usa-fall27': {
    url: 'https://www.ets.org/toefl.html',
    format: 'Holistic Application Review: GPA (8.0+), TOEFL (95+) / IELTS (7.0+), Statement of Purpose, 3 LORs & Research/Projects.',
    checklist: 'Official Transcripts + 2-Page SOP + 3 Faculty/Internship LORs + Financial Bank Solvency Proof (I-20).'
  },
  'tu9-germany-msc': {
    url: 'https://www.daad.de/en/',
    format: 'ECTS Credit Matching (Theoretical CS, Maths, Algorithms) + German Grade Conversion (Bavarian Formula).',
    checklist: 'APS India Verification Certificate (Apply 3 months early) + IELTS 6.5+ + Uni-Assist / Direct University Portal.'
  },
  'msc-applied-maths-uk-eu': {
    url: 'https://www.ucas.com/',
    format: 'Academic Transcript Review (Strong Real Analysis, Linear Algebra & Probability grades) + Personal Statement.',
    checklist: 'Degree Transcripts + IELTS 6.5 (min 6.0 each band) + 2 Academic References + CAS Visa Letter.'
  }
};

export default function HigherEdExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const filterCategory = tabParam === 'India' || tabParam === 'Abroad' ? tabParam : 'All';

  const [searchQuery, setSearchQuery] = useState('');
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProgramModal, setActiveProgramModal] = useState(null);

  useEffect(() => {
    const fetchHigherEdPrograms = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${AI_API_BASE}/api/v1/ai/opportunities`);
        const data = await res.json();
        const relevant = (data.items || []).filter(
          (item) => item.domain_id === 'higher_ed' || item.domain_id === 'study_abroad'
        );

        const mapped = relevant.map((item) => {
          const extra = HIGHERED_DETAILS[item.id] || {
            url: 'https://www.education.gov.in/',
            format: 'Entrance Score / Academic Merit Screening + Counselling / Interview.',
            checklist: 'Official Degree Transcripts, Entrance Scorecard, ID Proof, and Statement of Purpose.'
          };
          return {
            id: item.id,
            title: item.title,
            category: item.domain_id === 'higher_ed' ? 'India' : 'Abroad',
            institution: item.organization,
            minCgpa: `${item.min_cgpa}+ CGPA`,
            eligibility: item.criteria_summary,
            timeline: item.deadline,
            description: item.description,
            skills: item.required_skills || [],
            portalUrl: extra.url,
            examFormat: extra.format,
            admissionChecklist: extra.checklist
          };
        });

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
                  <button
                    type="button"
                    className="primary-link-btn"
                    onClick={() => setActiveProgramModal(item)}
                  >
                    Admission Checklist
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

        {activeProgramModal && (
          <div
            onClick={() => setActiveProgramModal(null)}
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
                    {activeProgramModal.institution}
                  </span>
                  <h2 style={{ fontSize: '1.3rem', margin: '6px 0 12px' }}>{activeProgramModal.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveProgramModal(null)}
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
                  <strong style={{ color: '#93c5fd' }}>Exam / Evaluation Format:</strong>
                  <p style={{ margin: '4px 0 0', color: '#e2e8f0' }}>{activeProgramModal.examFormat}</p>
                </div>
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
                  <strong style={{ color: '#34d399' }}>Required Documents & Counselling Steps:</strong>
                  <p style={{ margin: '4px 0 0', color: '#e2e8f0' }}>{activeProgramModal.admissionChecklist}</p>
                </div>
                <div>
                  <strong style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>Core Prerequisites & Subjects:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {activeProgramModal.skills.map((skill) => (
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
                  href={activeProgramModal.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-link-btn"
                  style={{ textDecoration: 'none', padding: '10px 18px' }}
                >
                  Visit Official Admission Portal -&gt;
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}