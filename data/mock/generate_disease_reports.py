import csv
import random
from datetime import datetime, timedelta

# Configuration
counties = [
    "Mombasa", "Nairobi", "Kisumu", "Nakuru", "Kiambu",
    "Machakos", "Uasin Gishu", "Kakamega", "Kilifi", "Meru"
]

sub_counties = {
    "Mombasa": ["Changamwe", "Jomvu", "Kisauni", "Likoni", "Mvita", "Nyali"],
    "Nairobi": ["Westlands", "Dagoretti", "Langata", "Kibra", "Kasarani", "Embakasi"],
    "Kisumu": ["Kisumu Central", "Kisumu East", "Kisumu West", "Seme", "Muhoroni"],
    "Nakuru": ["Nakuru Town", "Naivasha", "Gilgil", "Molo", "Njoro"],
    "Kiambu": ["Kiambu Town", "Thika", "Ruiru", "Kikuyu", "Limuru"],
    "Machakos": ["Machakos Town", "Athi River", "Kangundo", "Matungulu"],
    "Uasin Gishu": ["Eldoret East", "Eldoret West", "Kapseret", "Kesses"],
    "Kakamega": ["Kakamega Central", "Butere", "Mumias", "Lugari"],
    "Kilifi": ["Kilifi North", "Kilifi South", "Malindi", "Kaloleni"],
    "Meru": ["Meru Central", "Imenti North", "Imenti South", "Tigania"]
}

diseases = ["malaria", "cholera", "typhoid"]

# Date range
start_date = datetime(2026, 1, 1)
end_date = datetime(2026, 4, 30)

# Generate CSV in same directory as script
output_file = "disease_reports.csv"

with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['county', 'sub_county', 'disease', 'cases', 'report_date']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader()
    
    for _ in range(200):
        county = random.choice(counties)
        sub_county = random.choice(sub_counties[county])
        disease = random.choice(diseases)
        cases = random.randint(1, 500)
        
        # Random date between start and end
        days_between = (end_date - start_date).days
        random_days = random.randint(0, days_between)
        report_date = start_date + timedelta(days=random_days)
        
        writer.writerow({
            'county': county,
            'sub_county': sub_county,
            'disease': disease,
            'cases': cases,
            'report_date': report_date.strftime('%Y-%m-%d')
        })

print(f"[OK] Generated {output_file} with 200 disease reports")
print(f"Counties: {len(counties)}")
print(f"Diseases: {', '.join(diseases)}")
print(f"Date range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")

# Made with Bob
