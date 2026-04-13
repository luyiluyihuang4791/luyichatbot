import re, glob
files = sorted([f for f in glob.glob('*.html') if f not in ('index.html','page.html','tmp_extract.py')])
for fn in files:
    print('FILE:', fn)
    txt = open(fn, encoding='utf-8', errors='ignore').read()
    txt = re.sub(r'(?is)<(script|style).*?>.*?</\1>', '', txt)
    txt = re.sub(r'<!--.*?-->', '', txt)
    txt = re.sub(r'<[^>]+>', ' ', txt)
    txt = re.sub(r'\s+', ' ', txt).strip()
    # Print first 2000 chars plus search for specific patterns in file
    print(txt[:2000])
    for pat in ['International', 'Admission', 'Scholarship', 'Fee', 'Exchange', 'Overview', 'Department', 'Office', 'Academic Affairs', 'Application', 'Fee Info', 'Terms', 'Procedure', 'Tuition', 'Scholarships', 'Campus', 'Contact']:
        if pat in txt:
            pass
    print('---\n')
