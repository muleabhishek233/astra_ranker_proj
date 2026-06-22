# backend/services/ranking_service.py
import math
from typing import Dict, Any
from backend.models.candidate import Candidate
from backend.models.ranking import ParsedJobDescription, ScoreBreakdown

class HybridRankingEngine:
    def __init__(self):
        pass

    def calculate_scores(self, candidate: Candidate, jd: ParsedJobDescription, semantic_score: float) -> ScoreBreakdown:
        skill_score = self._calculate_skill_score(candidate, jd)
        experience_score = self._calculate_experience_score(candidate, jd)
        quality_score = self._calculate_quality_score(candidate)
        availability_score = self._calculate_availability_score(candidate)

        # Unified aggregate:
        final_score = (
            0.35 * skill_score +
            0.20 * experience_score +
            0.20 * semantic_score +
            0.15 * quality_score +
            0.10 * availability_score
        )

        return ScoreBreakdown(
            skill_score=round(skill_score, 1),
            experience_score=round(experience_score, 1),
            semantic_score=round(semantic_score, 1),
            quality_score=round(quality_score, 1),
            availability_score=round(availability_score, 1),
            final_score=round(final_score, 1)
        )

    def _calculate_skill_score(self, candidate: Candidate, jd: ParsedJobDescription) -> float:
        req_skills = jd.required_skills
        pref_skills = jd.preferred_skills
        if not req_skills:
            return 75.0

        proficiency_map = {
            "beginner": 25.0,
            "intermediate": 50.0,
            "advanced": 75.0,
            "expert": 100.0
        }

        matched_sum = 0.0
        match_count = 0
        cand_dict_skills = {s.name.lower(): s for s in candidate.skills}

        for req in req_skills:
            req_lower = req.lower()
            if req_lower in cand_dict_skills:
                cs = cand_dict_skills[req_lower]
                prof_val = proficiency_map.get(cs.proficiency, 50.0)
                # Durations and endorsements scaling:
                endorse_bonus = min(1.15, 1.0 + (cs.endorsements / 200.0))
                duration_bonus = min(1.10, 1.0 + (cs.duration_months / 120.0))
                matched_sum += min(100.0, prof_val * endorse_bonus * duration_bonus)
                match_count += 1
        
        base_req_score = (matched_sum / len(req_skills)) if len(req_skills) > 0 else 0.0

        # Preference matching bonus
        pref_bonus = sum(5.0 for pref in pref_skills if pref.lower() in cand_dict_skills)
        return min(100.0, base_req_score + pref_bonus)

    def _calculate_experience_score(self, candidate: Candidate, jd: ParsedJobDescription) -> float:
        candidate_years = candidate.profile.years_of_experience
        
        # Parse target years from text
        target_years = 0.0
        try:
            import re
            nums = re.findall(r"\d+", jd.experience_required)
            if nums:
                target_years = float(nums[0])
        except Exception:
            pass

        if target_years > 0:
            if candidate_years >= target_years:
                exp_score = min(100.0, 85.0 + ((candidate_years - target_years) * 3.0))
            else:
                exp_score = (candidate_years / target_years) * 85.0
        else:
            exp_score = min(100.0, 60.0 + (candidate_years * 4.0))

        # Title / Industry relevance parameters
        bonus = 0.0
        if jd.industry.lower() == candidate.profile.current_industry.lower():
            bonus += 10.0
        
        if any(word in candidate.profile.current_title.lower() for word in jd.role.lower().split()):
            bonus += 15.0

        return min(100.0, exp_score + bonus)

    def _calculate_quality_score(self, candidate: Candidate) -> float:
        sigs = candidate.redrob_signals
        gh = 65.0 if sigs.github_activity_score == -1 else sigs.github_activity_score
        
        assessments = list(sigs.skill_assessment_scores.values())
        avg_assess = (sum(assessments) / len(assessments)) if assessments else 75.0
        
        saves_score = min(100.0, sigs.saved_by_recruiters_30d * 4.0)
        iv_rate = sigs.interview_completion_rate * 100.0
        offer_rate = 80.0 if sigs.offer_acceptance_rate == -1 else (sigs.offer_acceptance_rate * 100.0)

        # Quality weights
        quality = (0.20 * gh) + (0.35 * avg_assess) + (0.15 * saves_score) + (0.15 * iv_rate) + (0.15 * offer_rate)
        return min(100.0, quality)

    def _calculate_availability_score(self, candidate: Candidate) -> float:
        sigs = candidate.redrob_signals
        open_score = 100.0 if sigs.open_to_work_flag else 50.0

        notice_score = 40.0
        if sigs.notice_period_days == 0: notice_score = 100.0
        elif sigs.notice_period_days <= 15: notice_score = 90.0
        elif sigs.notice_period_days <= 30: notice_score = 80.0
        elif sigs.notice_period_days <= 60: notice_score = 60.0

        resp_rate = sigs.recruiter_response_rate * 100.0

        time_score = 40.0
        if sigs.avg_response_time_hours <= 1: time_score = 100.0
        elif sigs.avg_response_time_hours <= 4: time_score = 90.0
        elif sigs.avg_response_time_hours <= 12: time_score = 80.0
        elif sigs.avg_response_time_hours <= 24: time_score = 60.0

        availability = (0.30 * open_score) + (0.30 * notice_score) + (0.20 * resp_rate) + (0.20 * time_score)
        return min(100.0, availability)
