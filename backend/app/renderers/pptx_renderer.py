import io
# pyrefly: ignore [missing-import]
from pptx import Presentation
from typing import Any

def render_presentation(presentation_json: dict[str, Any]) -> bytes:
    """
    Renders a PresentationSchema JSON object into a PPTX file.
    Returns the binary bytes of the PPTX file.
    """
    prs = Presentation()
    
    # Extract title slide info if provided
    title = presentation_json.get("title", "Presentation")
    
    # Title Slide
    title_slide_layout = prs.slide_layouts[0]
    slide = prs.slides.add_slide(title_slide_layout)
    title_shape = slide.shapes.title
    subtitle = slide.placeholders[1]
    
    title_shape.text = title
    subtitle.text = f"Target Audience: {presentation_json.get('target_audience', 'General')}"

    # Content Slides
    slides = presentation_json.get("slides", [])
    bullet_slide_layout = prs.slide_layouts[1]
    
    for slide_data in slides:
        slide = prs.slides.add_slide(bullet_slide_layout)
        shapes = slide.shapes
        
        # Title
        title_shape = shapes.title
        title_shape.text = slide_data.get("title", "")
        
        # Body / Bullets
        body_shape = shapes.placeholders[1]
        tf = body_shape.text_frame
        tf.text = slide_data.get("key_message", "")
        
        for bullet in slide_data.get("body", []):
            p = tf.add_paragraph()
            p.text = bullet
            p.level = 1
            
        # Add speaker notes
        notes_slide = slide.notes_slide
        text_frame = notes_slide.notes_text_frame
        text_frame.text = slide_data.get("speaker_notes", "")

    # Save to binary IO
    output = io.BytesIO()
    prs.save(output)
    output.seek(0)
    return output.read()
