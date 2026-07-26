#!/usr/bin/env python3
from pathlib import Path
import json
import re

images_dir = Path('images')
images = list(images_dir.glob('page*_Im*.png'))

# Extract page numbers and group
page_map = {}
for img in images:
    m = re.match(r'page(\d+)_', img.name)
    if not m:
        continue
    p = int(m.group(1))
    page_map.setdefault(p, []).append(img.name)

# Build exercises list in order from app.js initialWorkouts
exercises = [
    'Low Incline Dumbbell Press', 'Pull-Ups', 'Dumbbell Lateral Raises', 'Dumbbell Chest Supported Row', 'Banded Push-Ups',
    'Barbell Back Squat', 'Dumbbell Romanian Deadlift', 'Seated Leg Extensions', 'Standing Weighted Calf Raises', 'Palloff Press',
    'Barbell Bench Press', 'Seated Cable Row', 'Standing Barbell Overhead Press', 'Standing Mid-Chest Cable Fly', 'Behind Body Cable Curls', 'Standing Face Pulls',
    'Barbell Deadlift', 'Front Foot Elevated Reverse Lunges', 'Seated Leg Curls', 'Seated Weighted Calf Raises', 'Bird Dog'
]

# Base page for first exercise (as requested)
base_page = 6
mapping = {}
for i, ex in enumerate(exercises):
    page_num = base_page + i
    imgs = page_map.get(page_num, [])
    # sort by name so order is stable
    imgs_sorted = sorted(imgs)
    mapping[ex] = [f"/images/{name}" for name in imgs_sorted]

out = images_dir / 'images_map.json'
out.write_text(json.dumps(mapping, indent=2))
print('Wrote', out)
