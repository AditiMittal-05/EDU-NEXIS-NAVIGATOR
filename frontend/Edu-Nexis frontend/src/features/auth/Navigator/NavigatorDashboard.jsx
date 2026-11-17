import React, { useState } from 'react';
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

const INITIAL_PATHWAYS = [
  {
    id: 'isro-sc',
    domain: 'GOVERNMENT JOBS',
    matchScore: '94% Match',
    title: 'ISRO Scientist / Engineer SC',
    criteria: 'Eligible (B.Tech First Class)',
    description: 'Direct entry via ICRB written test based on core engineering syllabus.',
    deadline: 'Application closes Nov 15',
    route: '/government'
  },
  {
    id: 'swe-cloud',
    domain: 'PRIVATE SECTOR ROLES',
    matchScore: '88% Match',
    title: 'Junior Software Engineer (Cloud & AI)',
    criteria: 'Skills Match: 4/5',
    description: 'Requires Python, React fundamentals, and basic REST API understanding.',
    deadline: 'Rolling Hiring',
    route: '/private-jobs'
  },
  {
    id: 'gate-cse',
    domain: 'HIGHER EDUCATION',
    matchScore: '91% Match',
    title: 'GATE CS & IT (M.Tech / PSU Gateway)',
    criteria: 'Final Year B.Tech Eligible',
    description: 'National-level exam for IIT/NIT admissions and Maharatna PSU recruitment.',
    deadline: 'Exam Window: Feb 2027',
    route: '/higher-education'
  }
];

export default function NavigatorDashboard() {
  const navigate = useNavigate();

  const [selectedDomain, setSelectedDomain] = useState('govt_jobs');
  const [profile, setProfile] = useState({
    degree: 'B.Tech Computer Science',
    cgpa: '8.2',
    age: '21',
    skills: 'Python, JavaScript, SQL, Git',
    goal: 'Seeking a balanced technical role in public or private tech labs.'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleDomainClick = (domainId) => {
    if (domainId === 'govt_jobs' || domainId === 'govt_exams') {
      navigate('/government');
    } else if (domainId === 'private_roles') {
      navigate('/private-jobs');
    } else if (domainId === 'higher_ed' || domainId === 'study_abroad') {
      navigate('/higher-education');
    } else if (domainId === 'scholarships' || domainId === 'bridging_courses') {
      navigate('/scholarships-courses');
    } else {
      setSelectedDomain(domainId);
    }
  };
  
  const handleRunNavigator = (e) => {
    e.preventDefault();
    alert(`Profile mapped for ${profile.degree} (${profile.cgpa} CGPA). Select any opportunity domain pill to explore live pathways.`);
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
            <span className="status-dot"></span> Microservices Active
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
                    type="text"
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

              <button type="submit" className="run-btn">
                Run Opportunity Navigator
              </button>
            </form>
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

            <h2 className="section-title">Top Matched Pathways</h2>

            <div className="pathway-list">
              {INITIAL_PATHWAYS.map((item) => (
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