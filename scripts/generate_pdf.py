#!/usr/bin/env python3
"""
Generates an exact, pixel-perfect 1-page PDF of Koushik Goteti's resume matching the original layout,
typography, blue section dividers, bullet points, right-aligned dates, and clickable hyperlinks.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
import os

def build_pdf(filename="Koushik_Goteti_Resume.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=34,
        rightMargin=34,
        topMargin=30,
        bottomMargin=26
    )

    PRIMARY_BLUE = colors.HexColor("#1e3a8a")
    LINK_BLUE = colors.HexColor("#1d4ed8")
    TEXT_DARK = colors.HexColor("#111827")
    TEXT_MUTED = colors.HexColor("#374151")
    LINE_BLUE = colors.HexColor("#1e3a8a")

    styles = getSampleStyleSheet()

    # Base text style
    style_normal = ParagraphStyle(
        'NormalText',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.2,
        textColor=TEXT_DARK
    )

    style_title = ParagraphStyle(
        'NameTitle',
        fontName='Helvetica-Bold',
        fontSize=21,
        leading=23,
        textColor=PRIMARY_BLUE
    )

    style_contact_left = ParagraphStyle(
        'ContactLeft',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        alignment=TA_LEFT,
        textColor=TEXT_DARK
    )

    style_contact_right = ParagraphStyle(
        'ContactRight',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        alignment=TA_RIGHT,
        textColor=TEXT_DARK
    )

    style_section_title = ParagraphStyle(
        'SectionTitle',
        fontName='Helvetica-Bold',
        fontSize=9.8,
        leading=12,
        textColor=PRIMARY_BLUE
    )

    style_bullet = ParagraphStyle(
        'BulletText',
        fontName='Helvetica',
        fontSize=8.2,
        leading=10.6,
        textColor=TEXT_MUTED
    )

    story = []

    # --- HEADER ---
    story.append(Paragraph("Koushik Goteti", style_title))
    story.append(Spacer(1, 3))

    contact_data = [
        [
            Paragraph('<b>LinkedIn:</b> <a href="https://www.linkedin.com/in/koushik-goteti/" color="#1d4ed8"><u>koushik-goteti</u></a>', style_contact_left),
            Paragraph('<b>Email:</b> <a href="mailto:koushik.goteti17@gmail.com" color="#1d4ed8"><u>koushik.goteti17@gmail.com</u></a>', style_contact_right)
        ],
        [
            Paragraph('<b>GitHub:</b> <a href="https://github.com/Gkoushik17" color="#1d4ed8"><u>Gkoushik17</u></a>', style_contact_left),
            Paragraph('<b>Mobile:</b> +91 6300495869', style_contact_right)
        ]
    ]

    t_contact = Table(contact_data, colWidths=[270, 274])
    t_contact.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_contact)
    story.append(Spacer(1, 6))

    def make_section_header(title):
        t = Table(
            [[Paragraph(title, style_section_title)]],
            colWidths=[544]
        )
        t.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 1.2, LINE_BLUE),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        return t

    # --- SKILLS ---
    story.append(make_section_header("SKILLS"))
    story.append(Spacer(1, 3))

    skills_data = [
        [Paragraph("<b>Languages:</b>", style_normal), Paragraph("Python, TypeScript, JavaScript, Golang, C, C++, SQL", style_normal)],
        [Paragraph("<b>Web Technologies:</b>", style_normal), Paragraph("React Native, React, HTML, CSS, JavaScript, Tailwind CSS, Node.js", style_normal)],
        [Paragraph("<b>Tools and platforms:</b>", style_normal), Paragraph("Git, GitHub, Docker, Linux, Redis, VS Code, Postman, Power BI", style_normal)],
        [Paragraph("<b>Libraries:</b>", style_normal), Paragraph("FastAPI, NumPy, Pandas, Scikit-Learn, React Query, ReactFlow", style_normal)],
        [Paragraph("<b>Soft Skills:</b>", style_normal), Paragraph("Problem Solving, Time Management, Adaptability, Leadership", style_normal)],
    ]
    t_skills = Table(skills_data, colWidths=[120, 424])
    t_skills.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_skills)
    story.append(Spacer(1, 6))

    # --- PROJECTS ---
    story.append(make_section_header("PROJECTS"))
    story.append(Spacer(1, 3))

    def make_project_header(title, link_text, link_url, date_str):
        p_left = Paragraph(f"<b>{title}</b> | <a href='{link_url}' color='#1d4ed8'><u>{link_text}</u></a>", style_normal)
        p_right = Paragraph(f"<b>{date_str}</b>", style_contact_right)
        t = Table([[p_left, p_right]], colWidths=[460, 84])
        t.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))
        return t

    # 1. VaultGuard
    story.append(make_project_header("VaultGuard: Real-Time Payment Gateway & AI Fraud Engine", "GitHub", "https://github.com/Gkoushik17/vaultguard", "Sep '26"))
    vg_bullets = [
        "Built cross-platform mobile wallet in <b>React Native (Expo)</b> featuring biometric auth, dynamic QR code payments, offline caching, and real-time push alerts.",
        "Developed Risk Operations web dashboard in <b>React 18 & Tailwind CSS</b> with live WebSocket transaction feeds and one-click fraud triage controls.",
        "Integrated <b>Python (FastAPI)</b> AI fraud engine scoring risk (0–100) via velocity & geo-anomalies, and <b>Golang</b> core with <b>PostgreSQL</b> double-entry ledger.",
        "<b>Tech Stack:</b> React Native, React, Python (FastAPI), Node.js, Golang, PostgreSQL, Redis, Docker, Linux, WebSockets."
    ]
    for b in vg_bullets:
        story.append(Paragraph(f"&bull;&nbsp;&nbsp;{b}", style_bullet))
    story.append(Spacer(1, 3))

    # 2. Automated Deadlock Detection System
    story.append(make_project_header("Automated Deadlock Detection System", "GitHub", "https://github.com/Gkoushik17", "Apr '25"))
    dd_bullets = [
        "Built interactive Deadlock Detection System with React, Python, Tailwind CSS, for real-time resource allocation visualization.",
        "Implemented Banker's Algorithm in TypeScript/Python to detect deadlocks, circular waits, and safe sequences with execution traces.",
        "Created interactive Resource Allocation Graph visualizer with custom nodes, animated edges, and dynamic deadlock highlighting.",
        "<b>Tech Stack:</b> React, TypeScript, Python, Tailwind CSS, ReactFlow, React Query, Banker’s Algorithm."
    ]
    for b in dd_bullets:
        story.append(Paragraph(f"&bull;&nbsp;&nbsp;{b}", style_bullet))
    story.append(Spacer(1, 3))

    # 3. Astro ChatBot
    story.append(make_project_header("Astro ChatBot", "GitHub", "https://github.com/Gkoushik17", "Mar '25"))
    astro_bullets = [
        "Built an interactive Astronomy Chat Bot with React and Tailwind CSS, delivering a visually immersive space-themed interface with real-time AI responses.",
        "Integrated the Gemini API to power intelligent conversations and image analysis, featuring a custom voice assistant for seamless hands-free interaction.",
        "Implemented secure, persistent authentication using Supabase and Google OAuth, coupled with React Query for efficient state management and history tracking.",
        "<b>Tech Stack:</b> Python, React, Tailwind, OAuth, Supabase, Google Generative AI (Gemini)."
    ]
    for b in astro_bullets:
        story.append(Paragraph(f"&bull;&nbsp;&nbsp;{b}", style_bullet))
    story.append(Spacer(1, 6))

    # --- CERTIFICATIONS & CERTIFICATES ---
    story.append(make_section_header("CERTIFICATIONS & CERTIFICATES"))
    story.append(Spacer(1, 2))
    certs = [
        ("Cloud Computing – NPTEL", "Apr '25"),
        ("Unrevealing Python towards ML/AI – CSE Pathshala", "Mar '24"),
        ("Microlearning in Data Science – BoardInfinity", "Feb '24"),
    ]
    t_certs = Table([[Paragraph(c[0], style_normal), Paragraph(f"<b>{c[1]}</b>", style_contact_right)] for c in certs], colWidths=[460, 84])
    t_certs.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_certs)
    story.append(Spacer(1, 5))

    # --- EXTRA CURRICULAR ACTIVITIES ---
    story.append(make_section_header("EXTRA CURRICULAR ACTIVITIES"))
    story.append(Spacer(1, 2))
    extras = [
        ("Competed in the 24-hour Code-A-Hunt Hackathon organized by Coding Blocks", "Mar '24"),
        ("GATE 2026 Qualified (Computer Science & Information Technology)", "Mar '26"),
        ("Secured 1st place in 7-day cybersecurity v/s ethical hacking workshop organized by Secuneus", "Nov '23"),
    ]
    t_extras = Table([[Paragraph(e[0], style_normal), Paragraph(f"<b>{e[1]}</b>", style_contact_right)] for e in extras], colWidths=[460, 84])
    t_extras.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_extras)
    story.append(Spacer(1, 5))

    # --- EDUCATION ---
    story.append(make_section_header("EDUCATION"))
    story.append(Spacer(1, 2))

    edu_data = [
        [
            Paragraph("<b>Lovely Professional University</b><br/>Bachelor of Technology<br/><font color='#4b5563'>Computer Science and Engineering; CGPA: 7.98</font>", style_normal),
            Paragraph("Phagwara, Punjab<br/><b>Aug '23 – Present</b><br/>", style_contact_right)
        ],
        [
            Paragraph("<b>Bhashyam Junior College</b><br/>Intermediate<br/><font color='#4b5563'>PCM; Percentage: 91</font>", style_normal),
            Paragraph("Guntur, Andhra Pradesh<br/><b>Jun '21 – Apr '23</b><br/>", style_contact_right)
        ],
        [
            Paragraph("<b>Bhashyam High School</b><br/>Matriculation<br/><font color='#4b5563'>Percentage: 100</font>", style_normal),
            Paragraph("Tanuku, Andhra Pradesh<br/><b>Jul '20 – May '21</b><br/>", style_contact_right)
        ]
    ]
    t_edu = Table(edu_data, colWidths=[380, 164])
    t_edu.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_edu)

    doc.build(story)
    print(f"[Success] PDF generated cleanly: {filename}")

if __name__ == "__main__":
    build_pdf()
