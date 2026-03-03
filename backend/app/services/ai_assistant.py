import openai
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class AIAssistant:
    def __init__(self):
        self.client = openai.OpenAI(
            api_key=os.getenv("OPENAI_API_KEY", "dummy-key-for-testing")
        )
    
    async def explain_text(self, text: str, context: Optional[str] = None) -> Dict[str, Any]:
        """
        Provide detailed explanation of the given text
        
        Args:
            text: Text to explain
            context: Optional context for better explanation
            
        Returns:
            dict: Explanation and metadata
        """
        try:
            prompt = f"""
            Please provide a clear, detailed explanation of the following text.
            Make it easy to understand and break down complex concepts.
            
            Text to explain: {text}
            
            {f'Additional context: {context}' if context else ''}
            
            Provide the explanation in a structured way with:
            1. Main points summary
            2. Detailed explanation
            3. Key concepts defined
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant that explains complex topics in simple terms."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            explanation = response.choices[0].message.content
            
            return {
                "success": True,
                "explanation": explanation,
                "tokens_used": response.usage.total_tokens,
                "model": "gpt-3.5-turbo"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "explanation": ""
            }
    
    async def translate_text(self, text: str, target_language: str = "English") -> Dict[str, Any]:
        """
        Translate text to target language
        
        Args:
            text: Text to translate
            target_language: Target language for translation
            
        Returns:
            dict: Translation and metadata
        """
        try:
            prompt = f"""
            Translate the following text to {target_language}.
            Maintain the original meaning and tone.
            
            Text to translate: {text}
            
            Provide only the translation without additional commentary.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": f"You are a professional translator specializing in {target_language}."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            translation = response.choices[0].message.content
            
            return {
                "success": True,
                "translation": translation,
                "source_language": "Auto-detected",
                "target_language": target_language,
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "translation": ""
            }
    
    async def generate_report(self, data: str, report_type: str = "summary") -> Dict[str, Any]:
        """
        Generate a report based on provided data
        
        Args:
            data: Data to analyze for report
            report_type: Type of report to generate
            
        Returns:
            dict: Generated report and metadata
        """
        try:
            prompt = f"""
            Generate a {report_type} report based on the following data.
            Make it professional, well-structured, and insightful.
            
            Data: {data}
            
            Structure the report with:
            1. Executive Summary
            2. Key Findings
            3. Analysis
            4. Recommendations (if applicable)
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional analyst creating detailed reports."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.5
            )
            
            report = response.choices[0].message.content
            
            return {
                "success": True,
                "report": report,
                "report_type": report_type,
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "report": ""
            }

# Global instance
ai_assistant = AIAssistant()
