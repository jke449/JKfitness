#!/usr/bin/env python3
from pathlib import Path
import json
from pypdf import PdfReader

pdf_path = Path(r"C:\temp\BWS 4-day Upper-Lower Workout Plan.pdf")
images_dir = Path("images")

exercises = [
    'Low Incline Dumbbell Press', 'Pull-Ups', 'Dumbbell Lateral Raises', 'Dumbbell Chest Supported Row', 'Banded Push-Ups',
    'Barbell Back Squat', 'Dumbbell Romanian Deadlift', 'Seated Leg Extensions', 'Standing Weighted Calf Raises', 'Palloff Press',
    'Barbell Bench Press', 'Seated Cable Row', 'Standing Barbell Overhead Press', 'Standing Mid-Chest Cable Fly', 'Behind Body Cable Curls', 'Standing Face Pulls',
    'Barbell Deadlift', 'Front Foot Elevated Reverse Lunges', 'Seated Leg Curls', 'Seated Weighted Calf Raises', 'Bird Dog'
]

reader = PdfReader(str(pdf_path))
page_texts = [p.extract_text() or "" for p in reader.pages]

mapping = {}
for ex in exercises:
    found_page = None
    for idx, text in enumerate(page_texts):
        if ex.lower() in text.lower():
            found_page = idx + 1
            break
    if found_page is None:
        # try partial match words
        words = ex.split()
        for idx, text in enumerate(page_texts):
            if all(w.lower()[:4] in text.lower() for w in words if len(w)>3):
                found_page = idx+1
                break
    if found_page:
        # find images for that page
        candidates = list(images_dir.glob(f"page{found_page}_Im*.png"))
        if candidates:
            # pick largest
            best = max(candidates, key=lambda p: p.stat().st_size)
            mapping[ex] = f"/images/{best.name}"
        else:
            mapping[ex] = ''
    else:
        mapping[ex] = ''

out = images_dir / 'images_map.json'
out.write_text(json.dumps(mapping, indent=2))
print('wrote', out)
