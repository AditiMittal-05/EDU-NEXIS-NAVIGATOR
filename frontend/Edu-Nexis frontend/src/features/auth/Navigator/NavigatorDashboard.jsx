import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    degree: '',
    cgpa: '',
    age: '',
    skills: '',
    goal: ''
  });

  // Account Profile State
  const [userAccount, setUserAccount] = useState({
    username: localStorage.getItem('username') || 'Guest Citizen',
    email: '',
    registered_at: '',
    last_login_at: ''
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [pathways, setPathways] = useState(FALLBACK_PATHWAYS);
  const [overallSkillGaps, setOverallSkillGaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('Connecting...');
  const [syncingAgent, setSyncingAgent] = useState(false);
  const [agentMessage, setAgentMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setProfileError('Not signed in. Please log in to view your verified profile.');
      return;
    }

    setLoadingProfile(true);
    setProfileError('');
    try {
      const res = await fetch(`${AI_API_BASE}/api/v1/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Unable to load profile');
      }

      setUserAccount({
        username: data.username,
        email: data.email,
        registered_at: data.registered_at || '',
        last_login_at: data.last_login_at || ''
      });
      localStorage.setItem('username', data.username);
    } catch (err) {
      setProfileError(err.message || 'Failed to fetch user profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleOpenProfile = () => {
    setShowProfileModal(true);
    fetchUserProfile();
  };

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

  // Replace useEffect (around line 146)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let isMounted = true;

    (async () => {
      try {
        const res = await fetch(`${AI_API_BASE}/api/v1/auth/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) return;

        const data = await res.json();
        if (isMounted) {
          setUserAccount({
            username: data.username,
            email: data.email,
            registered_at: data.registered_at || '',
            last_login_at: data.last_login_at || '',
          });
          localStorage.setItem('username', data.username);
        }
      } catch {
        // Ignore silent background sync error on initial mount
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRunDiscoveryAgent = async () => {
    setSyncingAgent(true);
    setAgentMessage('');
    try {
      const res = await fetch(`${AI_API_BASE}/api/v1/ai/agent/refresh`, { method: 'POST' });
      const data = await res.json();
      setAiStatus(`AI Engine Online (${data.total_opportunities} Opportunities)`);
      setAgentMessage(
        data.newly_discovered > 0
          ? `AI Agent added ${data.newly_discovered} new opportunities!`
          : `Feeds checked: ${data.total_opportunities} total opportunities up to date.`
      );
      if (typeof fetchMatchedPathways === 'function') {
        await fetchMatchedPathways(profile);
      }
    } catch{
      setAgentMessage('AI Discovery Agent offline.');
    } finally {
      setSyncingAgent(false);
    }
  };

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

  const isLoggedIn = Boolean(localStorage.getItem('token'));

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="status-pill">
              <span className="status-dot"></span> {aiStatus}
              <button
                type="button"
                onClick={handleRunDiscoveryAgent}
                disabled={syncingAgent}
                style={{
                  marginLeft: '10px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid #0284c7',
                  cursor: 'pointer'
                }}
              >
                {syncingAgent ? 'Syncing Agent...' : 'Sync AI Discovery Agent'}
              </button>
              {agentMessage && (
                <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#a5b4fc' }}>
                  {agentMessage}
                </span>
              )}
            </div>

            {/* Citizen Profile Trigger Button */}
            <button
              type="button"
              onClick={handleOpenProfile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(20, 184, 166, 0.15)',
                border: '1px solid rgba(20, 184, 166, 0.45)',
                color: '#5eead4',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#0d9488',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                {(userAccount.username || 'G').charAt(0).toUpperCase()}
              </span>
              <span>{isLoggedIn ? userAccount.username : 'Profile'}</span>
            </button>
          </div>
        </header>

        {/* User Profile Modal */}
        {showProfileModal && (
          <div
            onClick={() => setShowProfileModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(2, 6, 23, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '16px'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '420px',
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                padding: '24px',
                color: '#f8fafc',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', color: '#2dd4bf', fontWeight: 700 }}>
                    VERIFIED CITIZEN REGISTRY
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem' }}>User Profile</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '1.25rem',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>

              {loadingProfile ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Fetching profile from UserService...</p>
              ) : profileError ? (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#f87171', fontSize: '0.88rem', marginBottom: '14px' }}>{profileError}</p>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: '#0d9488',
                      color: '#fff',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Sign In to Account
                  </button>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>USERNAME</div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f1f5f9', marginTop: '2px' }}>
                        {userAccount.username}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>EMAIL ADDRESS</div>
                      <div style={{ fontSize: '0.95rem', color: '#38bdf8', marginTop: '2px' }}>
                        {userAccount.email || 'Not available'}
                      </div>
                    </div>

                    {userAccount.last_login_at && (
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>LAST AUTHENTICATED</div>
                        <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '2px' }}>
                          {new Date(userAccount.last_login_at).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(false)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        background: '#1e293b',
                        color: '#e2e8f0',
                        fontWeight: 600,
                        border: '1px solid #334155',
                        cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileModal(false);
                        navigate('/logout');
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.16)',
                        color: '#f87171',
                        fontWeight: 600,
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        cursor: 'pointer'
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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