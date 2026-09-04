import io
from docx import Document
from typing import Any

def render_document(summary_json: dict[str, Any]) -> bytes:
    """
    Renders an ExecutiveSummarySchema JSON object into a DOCX file.
    Returns the binary bytes of the DOCX file.
    """
    doc = Document()
    
    # Title
    title = summary_json.get("title", "Executive Summary")
    doc.add_heading(title, 0)
    
    # Audience
    audience = summary_json.get("target_audience", "General")
    doc.add_paragraph(f"Prepared for: {audience}")
    
    # Takeaway
    takeaway = summary_json.get("executive_takeaway")
    if takeaway:
        doc.add_heading('Executive Takeaway', level=1)
        doc.add_paragraph(takeaway)
        
    # Metrics
    metrics = summary_json.get("key_metrics", [])
    if metrics:
        doc.add_heading('Key Metrics', level=1)
        for metric in metrics:
            doc.add_paragraph(metric, style='List Bullet')
            
    # Sections
    sections = summary_json.get("sections", [])
    for section in sections:
        doc.add_heading(section.get("heading", ""), level=1)
        doc.add_paragraph(section.get("content", ""))
        
    # Recommendations
    recommendations = summary_json.get("recommendations", [])
    if recommendations:
        doc.add_heading('Recommendations', level=1)
        for rec in recommendations:
            doc.add_paragraph(rec, style='List Number')

    # Save to binary IO
    output = io.BytesIO()
    doc.save(output)
    output.seek(0)
    return output.read()
