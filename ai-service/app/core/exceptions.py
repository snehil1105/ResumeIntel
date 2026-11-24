class ResumeIntelException(Exception):
    """Base exception for ResumeIntel AI."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class ImmutableFieldViolationException(ResumeIntelException):
    """Raised when an agent or proposal attempts to modify an immutable protected field."""
    def __init__(self, field_name: str, message: str = "Attempted to modify a protected immutable field."):
        super().__init__(f"{message} Field: {field_name}", status_code=422)
        self.field_name = field_name

class FactualIntegrityViolationException(ResumeIntelException):
    """Raised when an agent attempts to insert unsubstantiated or hallucinated facts."""
    def __init__(self, detail: str):
        super().__init__(f"Factual integrity violation: {detail}", status_code=422)

class ProviderUnavailableException(ResumeIntelException):
    """Raised when an external API provider is unavailable and no fallback succeeded."""
    def __init__(self, provider: str, error: str):
        super().__init__(f"Provider '{provider}' unavailable: {error}", status_code=503)

class DocumentParsingException(ResumeIntelException):
    """Raised when document parsing fails."""
    def __init__(self, detail: str):
        super().__init__(f"Failed to parse document: {detail}", status_code=400)

class HitlApprovalRequiredException(ResumeIntelException):
    """Raised when an action requires human review before proceeding."""
    def __init__(self, pending_proposals_count: int):
        super().__init__(f"Workflow paused: {pending_proposals_count} proposed change(s) require human review.", status_code=409)
