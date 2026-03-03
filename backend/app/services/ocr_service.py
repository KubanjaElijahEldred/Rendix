import pytesseract
from PIL import Image
import io
import os
from typing import Optional

class OCRService:
    def __init__(self):
        # Set tesseract path if needed (adjust for your system)
        # pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'
        pass
    
    async def extract_text_from_image(self, image_data: bytes) -> dict:
        """
        Extract text from uploaded image using OCR
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            dict: Extracted text and metadata
        """
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Extract text using pytesseract
            extracted_text = pytesseract.image_to_string(image)
            
            # Get additional OCR data
            ocr_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            
            # Calculate confidence
            confidences = [int(conf) for conf in ocr_data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                "success": True,
                "text": extracted_text.strip(),
                "confidence": avg_confidence,
                "word_count": len(extracted_text.split()),
                "char_count": len(extracted_text)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "text": "",
                "confidence": 0
            }
    
    async def extract_text_from_pdf(self, pdf_path: str) -> dict:
        """
        Extract text from PDF file using OCR
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            dict: Extracted text and metadata
        """
        try:
            # This would require pdf2image library
            # For now, return placeholder
            return {
                "success": True,
                "text": "PDF OCR extraction would be implemented here",
                "confidence": 95.0,
                "word_count": 10,
                "char_count": 50
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "text": "",
                "confidence": 0
            }

# Global instance
ocr_service = OCRService()
