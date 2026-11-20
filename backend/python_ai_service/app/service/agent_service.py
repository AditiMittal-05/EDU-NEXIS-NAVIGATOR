from app.repository import load_opportunities, save_opportunities


def run_discovery_agent() -> dict:
    existing_items = load_opportunities()
    existing_ids = {item["id"] for item in existing_items}

    discovered_batch = [
        {
            "id": "barc-oces-dgfs-2027",
            "domain_id": "govt_jobs",
            "domain_label": "GOVERNMENT JOBS",
            "title": "BARC Scientific Officer (OCES / DGFS-2027)",
            "organization": "Bhabha Atomic Research Centre (Dept. of Atomic Energy)",
            "min_cgpa": 6.5,
            "max_age": 26,
            "required_skills": ["c++", "python", "algorithms", "operating systems", "physics", "maths"],
            "degree_keywords": ["b.tech", "b.e", "m.sc", "computer science", "information technology", "physics", "chemistry"],
            "criteria_summary": "B.E./B.Tech or M.Sc. (60%+) | Online Exam / GATE Score + Selection Interview",
            "description": "Group 'A' Gazetted Scientific Officer role in nuclear engineering, supercomputing, and R&D centres.",
            "deadline": "Application Window: Jan - Feb 2027",
            "route": "/government?tab=Job"
        },
        {
            "id": "uppsc-lt-grade-pgt-2027",
            "domain_id": "govt_jobs",
            "domain_label": "GOVERNMENT JOBS",
            "title": "State PSC / UPPSC LT Grade & PGT Lecturer Recruitment",
            "organization": "Uttar Pradesh Public Service Commission / State Education Boards",
            "min_cgpa": 5.0,
            "max_age": 40,
            "required_skills": ["teaching", "maths", "physics", "chemistry", "pedagogy", "communication"],
            "degree_keywords": ["b.sc", "m.sc", "b.ed", "b.a", "m.a", "maths", "science", "any graduate"],
            "criteria_summary": "Bachelor's/Master's in Subject + B.Ed. | State Written Exam",
            "description": "Permanent Government Inter College & High School lecturer posts across state districts.",
            "deadline": "Upcoming Notification: Q1 2027",
            "route": "/government?tab=Job"
        },
        {
            "id": "google-step-swe-intern-2027",
            "domain_id": "private_roles",
            "domain_label": "PRIVATE SECTOR ROLES",
            "title": "Associate Software & AI Systems Engineer (University Grad)",
            "organization": "Google / Microsoft / Atlassian India R&D",
            "min_cgpa": 7.5,
            "max_age": 30,
            "required_skills": ["python", "java", "c++", "data structures", "algorithms", "git", "rest api"],
            "degree_keywords": ["b.tech", "b.e", "computer science", "information technology", "cse", "it", "mca"],
            "criteria_summary": "Strong DSA + Production Software Architecture | Coding + Design Rounds",
            "description": "Build large-scale distributed cloud services, developer tooling, and AI-assisted workflows.",
            "deadline": "University Grad Hiring Cycle: Open",
            "route": "/private-jobs"
        },
        {
            "id": "pmrf-phd-fellowship-2027",
            "domain_id": "scholarships",
            "domain_label": "SCHOLARSHIPS & GRANTS",
            "title": "Prime Minister's Research Fellowship (PMRF) Direct PhD",
            "organization": "Ministry of Education / IITs & IISc",
            "min_cgpa": 8.0,
            "max_age": 32,
            "required_skills": ["research", "python", "machine learning", "maths", "academic merit"],
            "degree_keywords": ["b.tech", "b.e", "m.sc", "m.tech", "computer science", "information technology", "science"],
            "criteria_summary": "CGPA 8.0+ | Rs 70,000 - Rs 80,000/month Fellowship + Rs 2 Lakh/yr Research Grant",
            "description": "Premier national doctoral fellowship for direct admission into PhD research at IITs and IISc.",
            "deadline": "Bi-Annual Selection Cycle",
            "route": "/scholarships-courses?tab=Scholarship"
        }
    ]

    newly_added = [item for item in discovered_batch if item["id"] not in existing_ids]

    if newly_added:
        updated_items = existing_items + newly_added
        save_opportunities(updated_items)
    else:
        updated_items = existing_items

    return {
        "agent_status": "completed",
        "newly_discovered": len(newly_added),
        "total_opportunities": len(updated_items),
        "added_titles": [item["title"] for item in newly_added],
    }