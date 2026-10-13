import urllib.parse

career_roadmaps = {
    "AI/ML Engineer": {
        "Week 1": ["Python programming", "Linear Algebra & Probability"],
        "Week 2": ["Supervised & Unsupervised Learning"],
        "Week 3": ["Neural Networks with TensorFlow/Keras"],
        "Week 4": ["CNN, RNN, NLP basics"],
        "Week 5": ["Model deployment (Flask/FastAPI)"],
        "Week 6": ["Project: Build an AI-based recommender system"]
    },
    "Business Analyst": {
        "Week 1": ["Excel, Google Sheets"],
        "Week 2": ["SQL basics & practice queries"],
        "Week 3": ["Power BI / Tableau for dashboards"],
        "Week 4": ["Business metrics, KPIs"],
        "Week 5": ["Storytelling with data"],
        "Week 6": ["Project: Sales or Marketing Dashboard"]
    },
    "Chartered Accountant": {
        "Week 1": ["Accounting Principles & Tally"],
        "Week 2": ["GST and Direct Tax concepts"],
        "Week 3": ["Auditing standards and methods"],
        "Week 4": ["Financial statements analysis"],
        "Week 5": ["Corporate & Income Tax Filing"],
        "Week 6": ["Mock CA Exam Papers + Case Studies"]
    },
    "Cloud Architect": {
        "Week 1": ["Cloud fundamentals (AWS/GCP/Azure)"],
        "Week 2": ["Virtualization, IAM, EC2, S3"],
        "Week 3": ["Docker + Kubernetes Basics"],
        "Week 4": ["Cloud Security & Identity"],
        "Week 5": ["CI/CD + Infrastructure as Code (Terraform)"],
        "Week 6": ["Project: Host Scalable App on Cloud"]
    },
    "Content Strategist": {
        "Week 1": ["SEO Basics & Content Types"],
        "Week 2": ["Writing for Web vs Social Media"],
        "Week 3": ["Keyword Research Tools (SEMRush, Ahrefs)"],
        "Week 4": ["Content Calendar Planning"],
        "Week 5": ["Analytics & Optimization (GA4)"],
        "Week 6": ["Project: Blog + Social Media Strategy"]
    },
    "Cybersecurity Analyst": {
        "Week 1": ["Networking & OSI Model", "Linux commands"],
        "Week 2": ["Common Attacks (Phishing, MITM, DoS)"],
        "Week 3": ["Kali Linux, Nmap, Wireshark"],
        "Week 4": ["Burp Suite, OWASP Top 10"],
        "Week 5": ["SIEM, Firewalls, IDS/IPS"],
        "Week 6": ["Project: Vulnerability Assessment of Web App"]
    },
    "Data Scientist": {
        "Week 1": ["Python, Numpy, Pandas"],
        "Week 2": ["Data Cleaning + Visualization"],
        "Week 3": ["Statistics + Hypothesis Testing"],
        "Week 4": ["ML Models with Scikit-learn"],
        "Week 5": ["Model Evaluation & Tuning"],
        "Week 6": ["Project: Predictive Analytics"]
    },
    "Financial Advisor": {
        "Week 1": ["Basics of Finance, Equity & Debt"],
        "Week 2": ["Investment instruments (SIPs, FDs, Stocks)"],
        "Week 3": ["Mutual Funds & Portfolio Theory"],
        "Week 4": ["Risk Assessment & Retirement Planning"],
        "Week 5": ["Insurance & Tax-saving Planning"],
        "Week 6": ["Project: Build a sample financial plan"]
    },
    "Historian": {
        "Week 1": ["Research Methodology", "Primary vs Secondary Sources"],
        "Week 2": ["Ancient Civilizations & Time Periods"],
        "Week 3": ["Historical Writing & Documentation"],
        "Week 4": ["Use of Archives and Oral Histories"],
        "Week 5": ["Digital History Tools (Omeka, Timeline JS)"],
        "Week 6": ["Project: Write a short research paper"]
    },
    "Investment Banker": {
        "Week 1": ["Corporate Finance Basics"],
        "Week 2": ["Equity, Bonds, and Derivatives"],
        "Week 3": ["Financial Modeling + Excel"],
        "Week 4": ["Valuation: DCF, Comparable Analysis"],
        "Week 5": ["M&A Process + IPO workflow"],
        "Week 6": ["Project: Build a sample DCF model"]
    },
    "Journalist": {
        "Week 1": ["Writing styles: News vs Opinion"],
        "Week 2": ["Interviewing & Research Skills"],
        "Week 3": ["Journalistic Ethics & Fact Checking"],
        "Week 4": ["Broadcast Journalism vs Print"],
        "Week 5": ["Digital Journalism Tools"],
        "Week 6": ["Project: Investigative News Report"]
    },
    "MBBS Doctor": {
        "Week 1": ["Human Anatomy + Physiology"],
        "Week 2": ["Biochemistry & Pathology"],
        "Week 3": ["Pharmacology Fundamentals"],
        "Week 4": ["Community Medicine & Public Health"],
        "Week 5": ["Case-based Diagnosis"],
        "Week 6": ["Mock Patient Case Practice"]
    },
    "Management Consultant": {
        "Week 1": ["Problem-solving & Guesstimates"],
        "Week 2": ["Case Interview Frameworks"],
        "Week 3": ["Industry and Market Analysis"],
        "Week 4": ["PowerPoint + Excel Skills"],
        "Week 5": ["Consulting Tools (MECE, SWOT, 4Ps)"],
        "Week 6": ["Project: Solve a Market Entry Case"]
    },
    "Ophthalmologist": {
        "Week 1": ["Eye Anatomy & Vision Science"],
        "Week 2": ["Refraction, LASIK Principles"],
        "Week 3": ["Diagnosis of Common Eye Disorders"],
        "Week 4": ["Surgical Instruments + OT Protocols"],
        "Week 5": ["Eye Pharmacology"],
        "Week 6": ["Project: Simulated Clinical Practice"]
    },
    "Orthopedic Surgeon": {
        "Week 1": ["Bone & Joint Anatomy"],
        "Week 2": ["Fractures & Bone Healing"],
        "Week 3": ["Orthopedic Surgical Procedures"],
        "Week 4": ["Radiology and Diagnosis"],
        "Week 5": ["Rehabilitation & Physio"],
        "Week 6": ["Mock Surgery Simulations"]
    },
    "Physiotherapist": {
        "Week 1": ["Musculoskeletal Basics"],
        "Week 2": ["Rehabilitation Techniques"],
        "Week 3": ["Therapeutic Exercises"],
        "Week 4": ["Neurological Disorders Therapy"],
        "Week 5": ["Electrotherapy Basics"],
        "Week 6": ["Project: Patient Recovery Plan"]
    },
    "Psychologist": {
        "Week 1": ["Psychology History & Concepts"],
        "Week 2": ["Cognitive, Behavioral & Developmental Theories"],
        "Week 3": ["Mental Health Disorders Overview"],
        "Week 4": ["Counseling Skills & Therapies"],
        "Week 5": ["Ethics & Confidentiality"],
        "Week 6": ["Case Study: Client Therapy Simulation"]
    },
    "Software Developer": {
        "Week 1": ["Programming Language (Java/Python)"],
        "Week 2": ["OOP Concepts + DS/Algo"],
        "Week 3": ["Version Control (Git/GitHub)"],
        "Week 4": ["APIs + Web Development"],
        "Week 5": ["Testing & Debugging"],
        "Week 6": ["Project: To-Do App or Mini CMS"]
    },
    "UX/UI Designer": {
        "Week 1": ["Design Thinking Process"],
        "Week 2": ["User Research + Empathy Maps"],
        "Week 3": ["Wireframing in Figma/Adobe XD"],
        "Week 4": ["Usability Testing & Feedback"],
        "Week 5": ["UI Trends & Accessibility"],
        "Week 6": ["Project: App Redesign with Prototype"]
    }
}

career_salaries = {
    "Data Scientist": "₹8-25 LPA",
    "AI/ML Engineer": "₹9-30 LPA",
    "Software Developer": "₹5-15 LPA",
    "Cloud Architect": "₹15-40 LPA",
    "Business Analyst": "₹6-12 LPA",
    "Chartered Accountant": "₹7-14 LPA",
    "Cybersecurity Analyst": "₹6-18 LPA",
    "Financial Advisor": "₹3-10 LPA",
    "Journalist": "₹3-8 LPA",
    "Investment Banker": "₹12-30 LPA",
    "MBBS Doctor": "₹6-20 LPA",
    "Management Consultant": "₹10-35 LPA",
    "Ophthalmologist": "₹10-25 LPA",
    "Orthopedic Surgeon": "₹12-40 LPA",
    "Physiotherapist": "₹3-7 LPA",
    "Psychologist": "₹4-9 LPA",
    "UX/UI Designer": "₹6-16 LPA",
    "Content Strategist": "₹5-12 LPA",
    "Historian": "₹3-7 LPA"
}


import urllib.parse

def get_learning_resources(topic) -> dict:
    """Generate dynamic learning resource links for YouTube, Coursera, and edX."""
    if not isinstance(topic, str):  
        topic = str(topic)  # ✅ ensure safe conversion
    
    encoded_topic = urllib.parse.quote(topic)
    return {
        "YouTube": f"https://www.youtube.com/results?search_query={encoded_topic}",
        "Coursera": f"https://www.coursera.org/search?query={encoded_topic}",
        "edX": f"https://www.edx.org/search?q={encoded_topic}"
    }



def get_roadmap(career_name: str) -> dict:
    """Returns structured roadmap with topics + resource links."""
    normalized = career_name.strip().lower()

    for key, roadmap in career_roadmaps.items():
        if key.lower() == normalized:
            return {
                week: [
                    {"topic": topic, "resources": get_learning_resources(topic)}
                    for topic in topics
                ]
                for week, topics in roadmap.items()
            }

    # Default fallback roadmap
    return {
        "Week 1": [{"topic": "Explore basic skills", "resources": get_learning_resources("Introduction to career")}],
        "Week 2": [{"topic": "Talk to a professional", "resources": get_learning_resources("career interview")}],
        "Week 3": [{"topic": "Watch industry videos", "resources": get_learning_resources("career videos")}],
        "Week 4": [{"topic": "Read blogs or whitepapers", "resources": get_learning_resources("career whitepaper")}]
    }


def get_salary(career_name: str) -> str:
    """Fetch salary for a given career name."""
    normalized = career_name.strip().lower()
    for key, salary in career_salaries.items():
        if key.lower() == normalized:
            return salary
    return "Not Available"
