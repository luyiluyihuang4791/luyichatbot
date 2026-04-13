import re, glob
patterns = [
    'Application', 'Admission', 'Scholarship', 'Fee', 'Tuition', 'Exchange', 'Overview',
    'Department', 'Office', 'Academic Affairs', 'International', 'Cost', 'Study', 'Living',
    'Insurance', 'Schedule', 'Program', 'Campus', 'Contact', 'Tel', 'Fax', 'E-Mail', 'English Site',
    'Mandarin Program', 'Program Taught in English', 'Title', 'Degree', 'Undergraduate', 'Graduate'
]
with open('keyword_extract_output.txt', 'w', encoding='utf-8') as out:
    for fn in sorted([f for f in glob.glob('*.html') if f not in ('index.html','page.html','tmp_extract.py','tmp_keyword_extract.py','tmp_keyword_extract2.py')]):
        out.write(f'FILE: {fn}\n')
        txt = open(fn, encoding='utf-8', errors='ignore').read()
        txt = re.sub(r'(?is)<(script|style).*?>.*?</\\1>', '', txt)
        txt = re.sub(r'<!--.*?-->', '', txt)
        txt = re.sub(r'<[^>]+>', ' ', txt)
        txt = re.sub(r'\\s+', ' ', txt).strip()
        for pat in patterns:
            if pat in txt:
                out.write(f'PATTERN: {pat}\n')
                start = txt.index(pat)
                out.write(txt[max(0, start-200):start+400] + '\n---\n')
        out.write('===\n')
