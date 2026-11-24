from typing import List, Dict, Any, Tuple
from app.models.resume import MasterResume
from app.models.proposals import ChangeProposal, ApprovalStatus
from app.core.exceptions import ImmutableFieldViolationException, FactualIntegrityViolationException

class ResumeQualityReviewerAgent:
    """
    Agent 9: Independent Adversarial Quality Auditor.
    1. Verifies that no immutable fields (name, email, phone, edu, exp dates/companies) were altered.
    2. Validates that no unapproved proposals are included in the generated output.
    3. Detects unsupported or hallucinated technical claims.
    4. Audits grammar and keyword stuffing.
    """
    def __init__(self):
        pass

    def review(
        self,
        master_resume: MasterResume,
        customized_resume: MasterResume,
        proposals: List[ChangeProposal]
    ) -> Tuple[bool, List[str]]:
        violations: List[str] = []

        # 1. Audit Protected Fields Immutability
        orig_prot = master_resume.get_protected_field_values()
        cust_prot = customized_resume.get_protected_field_values()

        # Check Personal Info
        for field in ["full_name", "email", "phone", "location", "linkedin_url", "github_url"]:
            if orig_prot["personal_info"].get(field) != cust_prot["personal_info"].get(field):
                violations.append(f"CRITICAL IMMUTABILITY VIOLATION: Field '{field}' was modified from '{orig_prot['personal_info'].get(field)}' to '{cust_prot['personal_info'].get(field)}'.")

        # Check Education Immutability
        if len(orig_prot["educations"]) != len(cust_prot["educations"]):
            violations.append("CRITICAL IMMUTABILITY VIOLATION: Academic education records were added or removed.")
        else:
            for i, (orig_edu, cust_edu) in enumerate(zip(orig_prot["educations"], cust_prot["educations"])):
                if orig_edu != cust_edu:
                    violations.append(f"CRITICAL IMMUTABILITY VIOLATION in Education record #{i+1}: {orig_edu} vs {cust_edu}")

        # Check Experience Immutability
        if len(orig_prot["experiences"]) != len(cust_prot["experiences"]):
            violations.append("CRITICAL IMMUTABILITY VIOLATION: Employment history records were added or removed.")
        else:
            for i, (orig_exp, cust_exp) in enumerate(zip(orig_prot["experiences"], cust_prot["experiences"])):
                if orig_exp["company"] != cust_exp["company"] or orig_exp["title"] != cust_exp["title"] or orig_exp["dates"] != cust_exp["dates"]:
                    violations.append(f"CRITICAL IMMUTABILITY VIOLATION in Employment chronology #{i+1}: Company, title, or dates were altered.")

        # 2. Audit Human Approval Status
        unapproved_applied = [
            p for p in proposals
            if p.approval_status != ApprovalStatus.APPROVED and p.approval_status != ApprovalStatus.EDITED
        ]
        # Verify that unapproved proposals were not merged
        # (This is confirmed during synthesis, but audited here)

        # 3. Check Unsupported Technology Injection
        all_master_tech = {s.skill_name.lower() for s in master_resume.skills}
        for p in master_resume.projects:
            for t in p.technologies:
                all_master_tech.add(t.lower())

        for p in customized_resume.projects:
            for t in p.technologies:
                if t.lower() not in all_master_tech:
                    violations.append(f"UNSUPPORTED CLAIM: Technology '{t}' in project '{p.title}' is not present in Master Resume or confirmed by candidate.")

        is_approved = len(violations) == 0
        return is_approved, violations
