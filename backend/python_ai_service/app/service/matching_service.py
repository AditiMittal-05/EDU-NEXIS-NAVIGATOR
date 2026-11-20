from typing import Dict, List, Optional, Set
from app.schemas import MatchedOpportunity, MatchResponse, StudentProfileRequest
from app.utils import extract_goal_tokens, normalize_text


def _evaluate_single_opportunity(
    item: dict,
    profile: StudentProfileRequest,
    normalized_cgpa: float,
    is_percentage: bool,
    user_skills: Set[str],
    degree_norm: str,
    goal_tokens: Set[str],
    all_missing_counter: Dict[str, int],
) -> Optional[MatchedOpportunity]:
    if profile.domain_filter and item.get("domain_id") != profile.domain_filter:
        return None

    # 1. Hard Age Filter
    if profile.age > item.get("max_age", 40):
        return None

    # 2. Strict Degree Alignment (25 pts)
    norm_deg_keywords = [normalize_text(kw) for kw in item.get("degree_keywords", [])]
    is_open_to_all = "any graduate" in norm_deg_keywords
    if not (is_open_to_all or any(kw in degree_norm for kw in norm_deg_keywords)):
        return None

    degree_score = 25.0 if not is_open_to_all else 20.0

    # 3. Academic Score / CGPA Check (25 pts)
    min_cgpa = item.get("min_cgpa", 0.0)
    cgpa_eligible = normalized_cgpa >= min_cgpa
    if cgpa_eligible:
        margin_bonus = min(3.0, (normalized_cgpa - min_cgpa) * 1.5)
        cgpa_score = 22.0 + margin_bonus
    else:
        cgpa_score = max(0.0, 15.0 - (min_cgpa - normalized_cgpa) * 12.0)

    # 4. Skill Overlap & Gap Analysis (30 pts)
    req_skills = [s.lower() for s in item.get("required_skills", [])]
    matched = [
        s for s in req_skills
        if s in user_skills or any(s in us or us in s for us in user_skills)
    ]
    missing = [s for s in req_skills if s not in matched]

    for m in missing:
        all_missing_counter[m] = all_missing_counter.get(m, 0) + 1

    skill_ratio = (len(matched) / len(req_skills)) if req_skills else 1.0
    skill_score = skill_ratio * 30.0

    # 5. Career Goal & Domain Intent Alignment (20 pts)
    searchable_text = normalize_text(
        f"{item['title']} {item['description']} {item['domain_label']} {item['organization']}"
    )
    goal_hits = sum(1 for tok in goal_tokens if tok in searchable_text)
    goal_score = min(20.0, goal_hits * 5.0) if goal_tokens else 10.0

    raw_total = cgpa_score + degree_score + skill_score + goal_score
    total_score = int(round(min(98.0, max(40.0, raw_total))))

    # Build Criteria & Roadmap Tip
    score_display = f"{profile.cgpa}%" if is_percentage else f"{profile.cgpa} CGPA"
    if not cgpa_eligible:
        criteria_text = (
            f"Academic Cutoff Gap ({score_display} vs {min_cgpa} CGPA req) | "
            f"Skills Matched: {len(matched)}/{len(req_skills)}"
        )
        roadmap_tip = (
            f"Requires minimum {min_cgpa} CGPA ({int(min_cgpa * 10)}%). "
            f"Consider bridging {missing[0].title() if missing else 'core prerequisites'} or exploring open-cutoff pathways."
        )
    else:
        criteria_text = (
            f"Eligible ({score_display}) | {item['criteria_summary']} | "
            f"Skills Matched: {len(matched)}/{len(req_skills)}"
        )
        if missing:
            top_gaps = ", ".join(s.title() for s in missing[:2])
            roadmap_tip = f"Eligible! Build {top_gaps} to strengthen selection readiness."
        else:
            roadmap_tip = "100% skill & academic match! Focus on exam mocks and application deadlines."

    return MatchedOpportunity(
        id=item["id"],
        domain_id=item["domain_id"],
        domain=item["domain_label"],
        matchScore=f"{total_score}% Match",
        numeric_score=total_score,
        title=item["title"],
        organization=item["organization"],
        criteria=criteria_text,
        description=item["description"],
        deadline=item["deadline"],
        route=item["route"],
        matched_skills=[s.title() for s in matched],
        missing_skills=[s.title() for s in missing],
        ai_roadmap_tip=roadmap_tip,
    )


def evaluate_student_matches(
    profile: StudentProfileRequest, opportunities: List[dict]
) -> MatchResponse:
    is_percentage = profile.cgpa > 10.0
    normalized_cgpa = round(profile.cgpa / 10.0, 2) if is_percentage else profile.cgpa
    user_skills = {s.strip().lower() for s in profile.skills if s.strip()}
    degree_norm = normalize_text(profile.degree)
    goal_tokens = extract_goal_tokens(profile.goal or "")

    scored_results: List[MatchedOpportunity] = []
    all_missing_counter: Dict[str, int] = {}

    for item in opportunities:
        match = _evaluate_single_opportunity(
            item=item,
            profile=profile,
            normalized_cgpa=normalized_cgpa,
            is_percentage=is_percentage,
            user_skills=user_skills,
            degree_norm=degree_norm,
            goal_tokens=goal_tokens,
            all_missing_counter=all_missing_counter,
        )
        if match:
            scored_results.append(match)

    scored_results.sort(key=lambda x: x.numeric_score, reverse=True)
    top_gaps_overall = [
        skill.title()
        for skill, _ in sorted(all_missing_counter.items(), key=lambda kv: kv[1], reverse=True)[:5]
    ]

    return MatchResponse(
        total_evaluated=len(scored_results),
        top_matches=scored_results[:6],
        extracted_skills=sorted([s.title() for s in user_skills]),
        overall_skill_gaps=top_gaps_overall,
    )