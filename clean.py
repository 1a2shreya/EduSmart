import os

def clean(p, t):
    with open(p, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    idx = None
    for i, line in enumerate(lines):
        if t in line:
            if 'React' in t and not line.strip().startswith('//') and 'import' in line:
                idx = i
                break
            elif 'React' not in t and not line.strip().startswith('#'):
                idx = i
                break
                
    if idx is not None:
        with open(p, 'w', encoding='utf-8') as f:
            f.writelines(lines[idx:])
        print(f"Cleaned {p} from line {idx+1}")
    else:
        print(f"Not found in {p}")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
clean(os.path.join(BASE_DIR, 'frontend/src/StudyPlanPage.js'), 'import React, { useEffect, useRef, useState } from')
clean(os.path.join(BASE_DIR, 'crud/api/models.py'), 'import uuid')
clean(os.path.join(BASE_DIR, 'crud/api/urls.py'), 'from django.urls import path')
clean(os.path.join(BASE_DIR, 'crud/crud/settings.py'), 'import os')
