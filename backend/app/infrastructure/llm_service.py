import os
import json
import logging
from pydantic import ValidationError
import google.generativeai as genai
from app.infrastructure.prompt_service import PromptService
from app.schemas.pydantic_schemas import (
    ComplaintAnalysisSchema,
    DuplicateDetectionSchema,
    ReportQualitySchema,
    SummarySchema,
    ResolutionSuggestionsSchema
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMService:
    _initialized = False
    _model = None

    @classmethod
    def _initialize(cls):
        if not cls._initialized:
            api_key = os.environ.get('GEMINI_API_KEY')
            if api_key:
                genai.configure(api_key=api_key)
                # Use a reliable model
                cls._model = genai.GenerativeModel('gemini-3.6-flash')
                logger.info("Gemini AI initialized successfully.")
            else:
                cls._model = None
                logger.warning("GEMINI_API_KEY is not set. AI features will be unavailable.")
            cls._initialized = True

    @classmethod
    def _parse_and_validate(cls, response_text, schema_model):
        try:
            text = response_text.strip()
            if text.startswith('```json'):
                text = text[7:]
            elif text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
            
            parsed_json = json.loads(text.strip())
            
            # Validate using Pydantic
            if schema_model:
                validated_data = schema_model(**parsed_json)
                return validated_data.model_dump()
            return parsed_json
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            return None
        except ValidationError as e:
            logger.error(f"Pydantic validation error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during parsing: {e}")
            return None

    @classmethod
    def analyze_issue(cls, description):
        cls._initialize()
        if not cls._model:
            return None
        
        prompt = PromptService.get_issue_classification_prompt() + "\n\nIssue Description:\n" + description
        try:
            response = cls._model.generate_content(prompt)
            result = cls._parse_and_validate(response.text, ComplaintAnalysisSchema)
            logger.info("AI: Successfully analyzed issue.")
            return result
        except Exception as e:
            logger.error(f"LLM Analysis Error: {e}")
            return None

    @classmethod
    def chat(cls, messages, context=None):
        cls._initialize()
        if not cls._model:
            return "AI assistance is temporarily unavailable (Missing API Key)."
        
        try:
            # We use gemini-3.6-flash since 2.5 does not exist and caused 404s
            model = genai.GenerativeModel('gemini-3.6-flash')
            
            system_prompt = PromptService.get_chatbot_system_prompt()
            if context:
                system_prompt += f"\n\nContext for current query:\n{context}"
            
            # Format the entire conversation as a single robust prompt
            # This avoids Gemini API's strict alternating-role errors.
            prompt = system_prompt + "\n\n--- CONVERSATION HISTORY ---\n"
            for msg in messages[:-1]:
                role_name = "Assistant" if msg['role'] == "model" else "Student"
                prompt += f"{role_name}: {msg['content']}\n"
            
            prompt += f"\nStudent: {messages[-1]['content']}\nAssistant: "
            
            response = model.generate_content(prompt)
            logger.info("AI: Chat response generated.")
            return {"success": True, "response": response.text.strip()}
        except Exception as e:
            logger.error(f"LLM Chat Error: {e}")
            return {"success": False, "error": f"AI Error: {str(e)}"}

    @classmethod
    def check_duplicate(cls, new_description, existing_issues):
        cls._initialize()
        if not cls._model or not existing_issues:
            return {'is_duplicate': False}
            
        issues_text = "\n".join([f"ID: {i.id} | Title: {i.title} | Desc: {i.description}" for i in existing_issues])
        prompt = PromptService.get_duplicate_detection_prompt() + f"\n\nExisting Issues:\n{issues_text}\n\nNew Issue:\n{new_description}"
        
        try:
            response = cls._model.generate_content(prompt)
            result = cls._parse_and_validate(response.text, DuplicateDetectionSchema)
            logger.info("AI: Duplicate check completed.")
            return result if result else {'is_duplicate': False}
        except Exception as e:
            logger.error(f"LLM Duplicate Error: {e}")
            return {'is_duplicate': False}

    @classmethod
    def analyze_report_quality(cls, description):
        cls._initialize()
        if not cls._model:
            return {'status': 'Valid', 'reason': 'LLM unavailable.', 'confidence': 1.0}
            
        prompt = PromptService.get_report_quality_prompt() + "\n\nReport:\n" + description
        try:
            response = cls._model.generate_content(prompt)
            result = cls._parse_and_validate(response.text, ReportQualitySchema)
            logger.info("AI: Report quality analyzed.")
            return result if result else {'status': 'Valid', 'reason': 'Parsing failed.', 'confidence': 1.0}
        except Exception as e:
            logger.error(f"LLM Quality Error: {e}")
            return {'status': 'Valid', 'reason': 'LLM Error.', 'confidence': 1.0}

    @classmethod
    def summarize_issue(cls, description, category, priority):
        cls._initialize()
        if not cls._model:
            return None
            
        prompt = PromptService.get_summary_prompt() + f"\n\nCategory: {category}\nPriority: {priority}\nDescription:\n{description}"
        try:
            response = cls._model.generate_content(prompt)
            result = cls._parse_and_validate(response.text, SummarySchema)
            logger.info("AI: Issue summarized.")
            return result
        except Exception as e:
            logger.error(f"LLM Summary Error: {e}")
            return None

    @classmethod
    def get_resolution_suggestions(cls, description, category):
        cls._initialize()
        if not cls._model:
            return None
            
        prompt = PromptService.get_resolution_prompt() + f"\n\nCategory: {category}\nDescription:\n{description}"
        try:
            response = cls._model.generate_content(prompt)
            result = cls._parse_and_validate(response.text, ResolutionSuggestionsSchema)
            logger.info("AI: Resolution suggestions generated.")
            return result
        except Exception as e:
            logger.error(f"LLM Resolution Error: {e}")
            return None

    @classmethod
    def explain_status(cls, issue_details, current_status):
        cls._initialize()
        if not cls._model:
            return "Status explanation unavailable."
            
        prompt = PromptService.get_status_explanation_prompt() + f"\n\nIssue Details:\n{issue_details}\n\nCurrent Status: {current_status}"
        try:
            response = cls._model.generate_content(prompt)
            logger.info("AI: Status explained.")
            return response.text.strip()
        except Exception as e:
            logger.error(f"LLM Status Error: {e}")
            return "An error occurred fetching the status explanation."
