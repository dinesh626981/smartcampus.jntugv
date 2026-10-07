from pydantic import BaseModel, Field
from typing import List, Optional

class ComplaintAnalysisSchema(BaseModel):
    category: str = Field(..., description="The category of the issue")
    subcategory: Optional[str] = Field(None, description="The subcategory of the issue")
    summary: Optional[str] = Field(None, description="A brief summary of the issue")
    severity: Optional[str] = Field(None, description="The severity of the issue (e.g., Low, Medium, High)")
    urgency: Optional[str] = Field(None, description="The urgency of the issue (e.g., Low, Medium, High)")
    suggested_department: Optional[str] = Field(None, description="The department responsible for resolving the issue")
    keywords: List[str] = Field(default_factory=list, description="List of keywords related to the issue")
    missing_information: List[str] = Field(default_factory=list, description="List of missing information from the report")
    recommended_action: Optional[str] = Field(None, description="Recommended initial action")
    confidence: float = Field(0.0, description="Confidence score between 0.0 and 1.0", ge=0.0, le=1.0)

class DuplicateDetectionSchema(BaseModel):
    is_duplicate: bool = Field(..., description="True if it is a duplicate, False otherwise")
    duplicate_of: Optional[int] = Field(None, description="The ID of the existing issue if duplicate")
    reason: Optional[str] = Field(None, description="Reasoning for marking as duplicate")

class ReportQualitySchema(BaseModel):
    status: str = Field(..., description="The quality status (e.g., Valid, Low Quality, Potentially Suspicious)")
    reason: Optional[str] = Field(None, description="Reason for the given status")
    confidence: float = Field(1.0, description="Confidence score between 0.0 and 1.0", ge=0.0, le=1.0)

class SummarySchema(BaseModel):
    summary: str = Field(..., description="The summary of the issue")

class ResolutionSuggestionsSchema(BaseModel):
    suggestions: List[str] = Field(..., description="List of resolution suggestions")
