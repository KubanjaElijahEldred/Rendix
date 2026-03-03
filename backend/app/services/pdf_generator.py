from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import io
from typing import Optional, Dict, Any
import os
from datetime import datetime

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            alignment=TA_LEFT,
            textColor=colors.darkgray
        ))
    
    async def text_to_pdf(self, text: str, title: str = "Rendix Document", author: str = "Rendix AI") -> bytes:
        """
        Convert text to PDF document
        
        Args:
            text: Text content to convert
            title: Document title
            author: Document author
            
        Returns:
            bytes: PDF file content
        """
        try:
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            
            # Build story (content)
            story = []
            
            # Title
            story.append(Paragraph(title, self.styles['CustomTitle']))
            story.append(Spacer(1, 20))
            
            # Metadata
            metadata = [
                ["Author:", author],
                ["Created:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
                ["Word Count:", str(len(text.split()))],
                ["Character Count:", str(len(text))]
            ]
            
            metadata_table = Table(metadata, colWidths=[1.5*inch, 4*inch])
            metadata_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (0, 0), (0, -1), colors.grey),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
            ]))
            
            story.append(metadata_table)
            story.append(Spacer(1, 30))
            
            # Main content
            paragraphs = text.split('\n\n')
            for para in paragraphs:
                if para.strip():
                    story.append(Paragraph(para, self.styles['Normal']))
                    story.append(Spacer(1, 12))
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            
            return buffer.getvalue()
            
        except Exception as e:
            raise Exception(f"PDF generation failed: {str(e)}")
    
    async def sign_pdf(self, pdf_content: bytes, signature_text: str, signatory_name: str = "User") -> bytes:
        """
        Add digital signature to PDF
        
        Args:
            pdf_content: Existing PDF content
            signature_text: Signature text
            signatory_name: Name of the signatory
            
        Returns:
            bytes: Signed PDF content
        """
        try:
            buffer = io.BytesIO()
            
            # Create a new canvas to add signature
            packet = io.BytesIO()
            can = canvas.Canvas(packet, pagesize=A4)
            
            # Add signature box
            can.rect(4*inch, 1*inch, 2*inch, 1*inch)
            can.setFont("Helvetica", 10)
            can.drawString(4.1*inch, 1.8*inch, "Digital Signature")
            can.drawString(4.1*inch, 1.6*inch, f"Signed by: {signatory_name}")
            can.drawString(4.1*inch, 1.4*inch, f"Date: {datetime.now().strftime('%Y-%m-%d')}")
            can.drawString(4.1*inch, 1.2*inch, signature_text)
            
            can.save()
            
            # Move to the beginning of the StringIO buffer
            packet.seek(0)
            
            # Create a new PDF with the signature
            from PyPDF2 import PdfReader, PdfWriter
            
            # Read existing PDF
            existing_pdf = io.BytesIO(pdf_content)
            pdf_reader = PdfReader(existing_pdf)
            pdf_writer = PdfWriter()
            
            # Add signature to first page
            first_page = pdf_reader.pages[0]
            signature_page = PdfReader(packet).pages[0]
            first_page.merge_page(signature_page)
            
            # Add all pages to writer
            pdf_writer.add_page(first_page)
            for page in pdf_reader.pages[1:]:
                pdf_writer.add_page(page)
            
            # Write to buffer
            pdf_writer.write(buffer)
            buffer.seek(0)
            
            return buffer.getvalue()
            
        except Exception as e:
            # Fallback: return original PDF if signing fails
            return pdf_content
    
    async def create_report_pdf(self, report_data: Dict[str, Any], title: str = "Rendix Report") -> bytes:
        """
        Create a formatted report PDF
        
        Args:
            report_data: Report data with sections
            title: Report title
            
        Returns:
            bytes: Report PDF content
        """
        try:
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            
            story = []
            
            # Title
            story.append(Paragraph(title, self.styles['CustomTitle']))
            story.append(Spacer(1, 20))
            
            # Report sections
            if isinstance(report_data, dict):
                for section_title, section_content in report_data.items():
                    if section_title and section_content:
                        story.append(Paragraph(section_title, self.styles['CustomSubtitle']))
                        
                        if isinstance(section_content, str):
                            paragraphs = section_content.split('\n\n')
                            for para in paragraphs:
                                if para.strip():
                                    story.append(Paragraph(para, self.styles['Normal']))
                                    story.append(Spacer(1, 12))
                        else:
                            story.append(Paragraph(str(section_content), self.styles['Normal']))
                        
                        story.append(Spacer(1, 20))
            else:
                # Simple text report
                story.append(Paragraph(str(report_data), self.styles['Normal']))
            
            # Footer
            story.append(Spacer(1, 30))
            story.append(Paragraph(
                f"Generated by Rendix AI Assistant on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                self.styles['Normal']
            ))
            
            doc.build(story)
            buffer.seek(0)
            
            return buffer.getvalue()
            
        except Exception as e:
            raise Exception(f"Report PDF generation failed: {str(e)}")

# Global instance
pdf_generator = PDFGenerator()
