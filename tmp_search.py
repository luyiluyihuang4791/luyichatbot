import re, glob
patterns = [
    'Estimated cost for 1 Year of Study',
    'Tuition and fees',
    'Housing and living Costs',
    'Health Insurance',
    'Excellent Student Scholarship in Entrance Examination',
    'Excellent Foreign Students Scholarship',
    'For undergraduate program:',
    'For graduate programs:',
    'International students are defined as',
    'International students who graduated from a high school',
    'Tuition & Miscellaneous Fees',
    'US $ 2700/yr ~ US $ 3000/yr',
    'US $ 670/yr ~ US $ 700/yr',
    'The roots of Ling Tung University go back to the early',
    'Ling Tung University has four schools',
    'In National College Evaluations by the Ministry of Education',
    'Colleges and universities in America',
    'Department of Fashion Business and Merchandising',
    'Department of Information Technology',
    'Office of Academic Affairs',
    'Student Affairs Office',
    'Library Office',
    'General Affairs Office',
]
for fn in sorted([f for f in glob.glob('*.html') if f not in ('index.html','page.html','tmp_extract.py','tmp_keyword_extract.py','tmp_keyword_extract2.py','tmp_search.py')]):
    print('FILE:', fn)
    txt = open(fn, encoding='utf-8', errors='ignore').read()
    for pat in patterns:
        if pat in txt:
            idx = txt.index(pat)
            start = max(0, idx-300)
            end = min(len(txt), idx+400)
            seg = txt[start:end]
            seg = re.sub(r'\s+', ' ', seg)
            seg = re.sub(r'<[^>]+>', ' ', seg)
            print('---', pat, '---')
            print(seg)
    print('===')
