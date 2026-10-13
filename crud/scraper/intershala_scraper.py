import requests
from bs4 import BeautifulSoup

def get_mock_jobs(career):
    return [
        {
            "title": f"Junior {career} Analyst",
            "company": "TechStart Inc.",
            "location": "Remote",
            "stipend": "₹15,000 - 20,000 /month",
            "link": "#",
            "source": "Mock Data"
        },
        {
            "title": f"{career} Associate",
            "company": "Innovate Solutions",
            "location": "Bangalore",
            "stipend": "₹25,000 /month",
            "link": "#",
            "source": "Mock Data"
        },
        {
            "title": f"{career} Developer Intern",
            "company": "Future Labs",
            "location": "Mumbai",
            "stipend": "₹10,000 /month",
            "link": "#",
            "source": "Mock Data"
        }
    ]

def scrape_internshala_jobs(career):
    if not career:
        return []
    query = career.replace(" ", "-").lower()
    url = f"https://internshala.com/internships/keywords-{query}/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')

        job_cards = soup.find_all('div', class_='individual_internship')        
        if not job_cards:
            print(f"[⚠️] No internships found for {career}.")
            return get_mock_jobs(career)

        results = []
        for card in job_cards[:5]:  # Get top 5 jobs
            try:
                # Title
                title_tag = card.find('a', class_='job-title-href')
                title = title_tag.get_text(strip=True) if title_tag else "Title not available"

                # Link
                relative_link = title_tag['href'] if title_tag and title_tag.has_attr('href') else "#"
                full_link = f"https://internshala.com{relative_link}"

                # Company Name
                company_tag = card.find('p', class_='company-name')
                company = company_tag.get_text(strip=True) if company_tag else "Company not available"

                # Location
                location_tag = card.find('div', class_='locations')
                location = location_tag.get_text(strip=True) if location_tag else "Location not specified"

                # Stipend
                stipend_tag = card.find('span', class_='stipend')
                stipend = stipend_tag.get_text(strip=True) if stipend_tag else "Stipend not available"

                # Duration
                duration_tag = card.find('div', class_='row-1-item', text=None)
                duration = duration_tag.find_next_sibling('div').get_text(strip=True) if duration_tag else "Duration not available"

                results.append({
                    "title": title,
                    "company": company,
                    "location": location,
                    "stipend": stipend,
                    "link": full_link,
                    "source": "Internshala"
                })
            except Exception as e:
                print("[⚠️] Error parsing job card:", e)

        return results

    except Exception as e:
        print(f"[❌] Error scraping Internshala for {career}: {e}")
        return get_mock_jobs(career)
