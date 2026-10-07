import os
import sys
import unittest
from unittest.mock import patch, MagicMock

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.infrastructure.llm_service import LLMService

class TestAIIntegration(unittest.TestCase):
    
    @patch('google.generativeai.GenerativeModel.generate_content')
    def test_successful_analysis(self, mock_generate):
        # Mock Gemini response
        mock_response = MagicMock()
        mock_response.text = '''```json
        {
            "category": "Network",
            "subcategory": "Wi-Fi",
            "summary": "Wi-Fi not working",
            "severity": "High",
            "urgency": "High",
            "suggested_department": "IT Support",
            "keywords": ["wifi", "network"],
            "missing_information": [],
            "recommended_action": "Check router",
            "confidence": 0.95
        }
        ```'''
        mock_generate.return_value = mock_response

        # Set fake API key for test
        os.environ['GEMINI_API_KEY'] = 'fake_key'
        LLMService._initialized = False # Force re-init

        result = LLMService.analyze_issue("Wi-Fi is not working.")
        
        self.assertIsNotNone(result)
        self.assertEqual(result['category'], 'Network')
        self.assertEqual(result['severity'], 'High')
        self.assertEqual(result['confidence'], 0.95)
        
    @patch('google.generativeai.GenerativeModel.generate_content')
    def test_pydantic_validation_failure(self, mock_generate):
        # Mock Gemini response with invalid confidence type (string instead of float)
        mock_response = MagicMock()
        mock_response.text = '''```json
        {
            "category": "Network",
            "confidence": "should_fail"
        }
        ```'''
        mock_generate.return_value = mock_response

        os.environ['GEMINI_API_KEY'] = 'fake_key'
        LLMService._initialized = False

        result = LLMService.analyze_issue("Wi-Fi is not working.")
        
        # Pydantic should fail validation and return None
        self.assertIsNone(result)

    def test_missing_api_key(self):
        # Temporarily remove API key
        if 'GEMINI_API_KEY' in os.environ:
            del os.environ['GEMINI_API_KEY']
            
        LLMService._initialized = False
        result = LLMService.analyze_issue("Wi-Fi is not working.")
        
        self.assertIsNone(result)

if __name__ == '__main__':
    unittest.main()
