import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import './NavigatorDashboard.css';

const DOMAINS = [
  { id: 'govt_jobs', name: 'Government Jobs' },
  { id: 'govt_exams', name: 'Govt. Examinations' },
  { id: 'private_roles', name: 'Private Sector Roles' },
  { id: 'higher_ed', name: 'Higher Education' },
  { id: 'study_abroad', name: 'Study Abroad' },
  { id: 'scholarships', name: 'Scholarships & Grants' },
  { id: 'bridging_courses', name: 'Skill Bridging Courses' }
];

const FALLBACK_PATHWAYS = [
  {
    id: 'isro-sc',
    domain: 'GOVERNMENT JOBS',
    matchScore: '94% Match',
    title: 'ISRO Scientist / Engineer SC',
    criteria: 'Eligible (B.Tech First Class)',
    description: 'Direct entry via ICRB written test based on core engineering syllabus.',
    deadline: 'Application closes Nov 15',
    route: '/government?tab=Job',
    matched_skills: ['Python'],
    missing_skills: ['C++', 'Algorithms'],
    ai_roadmap_tip: 'Start FastAPI backend on port 8000 to compute live personalized rankings.'
  }
];

const AI_API_BASE = 'http://127.0.0.1:8000';

export default function NavigatorDashboard() {
  const navigate = useNavigate();

  const [selectedDomain, setSelectedDomain] = useState('govt_jobs');
  const [profile, setProfile] = useState({
    degree: 'B.Tech Information Technology',
    cgpa: '8.2',
    age: '21',
    skills: 'Python, React, JavaScript, SQL, Git',
    goal: 'Seeking an AI engineering or technical officer role in public or private labs.'
  });

  const [pathways, setPathways] = useState(FALLBACK_PATHWAYS);
  const [overallSkillGaps, setOverallSkillGaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('Connecting...');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMatchedPathways = async (currentProfile) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const skillsArray = currentProfile.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const response = await fetch(`${AI_API_BASE}/api/v1/ai/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          degree: currentProfile.degree,
          cgpa: parseFloat(currentProfile.cgpa) || 0,
          age: parseInt(currentProfile.age, 10) || 21,
          skills: skillsArray,
          goal: currentProfile.goal
        })
      });

      if (!response.ok) {
        throw new Error(`AI Service returned status ${response.status}`);
      }

      const data = await response.json();
      setPathways(data.top_matches || []);
      setOverallSkillGaps(data.overall_skill_gaps || []);
      setAiStatus('AI Engine Online');
    } catch (err) {
      console.error('AI Match Error:', err);
      setAiStatus('Offline (Fallback Mode)');
      setErrorMsg('Could not reach FastAPI on port 8000. Showing cached pathways.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchedPathways(profile);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleDomainClick = (domainId) => {
    if (domainId === 'govt_jobs') {
      navigate('/government?tab=Job');
    } else if (domainId === 'govt_exams') {
      navigate('/government?tab=Exam');
    } else if (domainId === 'private_roles') {
      navigate('/private-jobs');
    } else if (domainId === 'higher_ed') {
      navigate('/higher-education?tab=India');
    } else if (domainId === 'study_abroad') {
      navigate('/higher-education?tab=Abroad');
    } else if (domainId === 'scholarships') {
      navigate('/scholarships-courses?tab=Scholarship');
    } else if (domainId === 'bridging_courses') {
      navigate('/scholarships-courses?tab=Course');
    } else {
      setSelectedDomain(domainId);
    }
  };

  const handleRunNavigator = (e) => {
    e.preventDefault();
    fetchMatchedPathways(profile);
  };

  return (
    <div className="navigator-wrapper">
      <div className="navigator-container">
        <header className="nav-header">
          <div className="brand-box">
            <div className="brand-logo">EN</div>
            <div>
              <h1>EDU-NEXIS Navigator</h1>
              <p>AI Multi-Agent Career & Opportunity Discovery</p>
            </div>
          </div>
          <div className="status-pill">
            <span className="status-dot"></span> {aiStatus}
          </div>
        </header>

        <div className="dashboard-grid">
          <aside className="intake-panel">
            <h2>Student Profile Intake</h2>
            <p className="panel-subtitle">
              Provide your credentials to map against all 7 opportunity streams.
            </p>

            <form onSubmit={handleRunNavigator} className="intake-form">
              <div className="form-group">
                <label>DEGREE & MAJOR</label>
                <input
                  type="text"
                  name="degree"
                  value={profile.degree}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CGPA / PERCENTAGE</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cgpa"
                    value={profile.cgpa}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>AGE</label>
                  <input
                    type="number"
                    name="age"
                    value={profile.age}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>SKILLS (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  name="skills"
                  value={profile.skills}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>CAREER GOAL / TARGET</label>
                <textarea
                  name="goal"
                  rows="3"
                  value={profile.goal}
                  onChange={handleInputChange}
                />
              </div>

              <button type="submit" className="run-btn" disabled={loading}>
                {loading ? 'Analyzing Profile...' : 'Run Opportunity Navigator'}
              </button>
            </form>

            {overallSkillGaps.length > 0 && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                  TOP DETECTED SKILL GAPS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {overallSkillGaps.map((gap) => (
                    <span
                      key={gap}
                      style={{
                        fontSize: '0.75rem',
                        padding: '3px 9px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(245, 158, 11, 0.14)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      + {gap}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <main className="results-panel">
            <div className="domain-bar">
              {DOMAINS.map((domain) => (
                <button
                  key={domain.id}
                  type="button"
                  className={`domain-pill ${selectedDomain === domain.id ? 'active' : ''}`}
                  onClick={() => handleDomainClick(domain.id)}
                >
                  {domain.name}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="section-title" style={{ margin: 0 }}>
                Top AI-Matched Pathways ({pathways.length})
              </h2>
              {errorMsg && (
                <span style={{ fontSize: '0.8rem', color: '#f87171' }}>{errorMsg}</span>
              )}
            </div>

            <div className="pathway-list">
              {pathways.map((item) => (
                <div key={item.id} className="pathway-card">
                  <div className="pathway-top">
                    <span className="pathway-domain">{item.domain}</span>
                    <span className="pathway-match">{item.matchScore}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p className="pathway-criteria">
                    <strong>Criteria:</strong> {item.criteria}
                  </p>
                  <p className="pathway-desc">{item.description}</p>

                  {item.ai_roadmap_tip && (
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.08)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        marginBottom: '14px'
                      }}
                    >
                      <strong>AI Guidance:</strong> {item.ai_roadmap_tip}
                    </p>
                  )}

                  <div className="pathway-footer">
                    <span className="pathway-deadline">{item.deadline}</span>
                    <button
                      type="button"
                      className="explore-link"
                      onClick={() => navigate(item.route)}
                    >
                      Explore Pathway -&gt;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}