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
page_texts = [ (i+1, (p.extract_text() or "").lower()) for i,p in enumerate(reader.pages) ]

mapping = {}
for ex in exercises:
    name = ex.lower()
    words = [w for w in name.replace('-', ' ').split() if len(w)>=3]
    best_page = None
    best_score = 0
    for pnum, text in page_texts:
        score = 0
        for w in words:
            if w in text:
                score += 2 if len(w) >= 5 else 1
        # bonus if full name appears
        if name in text:
            score += 5
        if score > best_score:
            best_score = score
            best_page = pnum
    # if no good match, try fuzzy by partial substrings
    if best_score == 0:
        for pnum, text in page_texts:
            cnt = 0
            for w in words:
                if text.count(w[:4])>0:
                    cnt += 1
            if cnt > best_score:
                best_score = cnt
                best_page = pnum
    chosen = ''
    if best_page:
        # look for images on that page first, then nearby pages
        candidates = []
        for p in range(best_page-1, best_page+2):
            if p < 1:
                continue
            imgs = list(images_dir.glob(f"page{p}_Im*.png"))
            candidates.extend(imgs)
        if candidates:
            best_img = max(candidates, key=lambda p: p.stat().st_size)
            chosen = f"/images/{best_img.name}"
    mapping[ex] = chosen

out = images_dir / 'images_map.json'
out.write_text(json.dumps(mapping, indent=2))
print('wrote', out)
