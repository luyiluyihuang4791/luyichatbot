import re, glob
keywords = ['application', 'admission', 'scholarship', 'fee', 'tuition', 'exchange', 'overview', 'department', 'office', 'academic affairs', 'international', 'cost', 'study', 'living', 'insurance', 'program', 'sister', 'partner']
for fn in sorted([f for f in glob.glob('*.html') if f not in ('index.html','page.html','tmp_extract.py','tmp_keyword_extract.py','tmp_keyword_extract2.py','tmp_search.py','tmp_sentences.py')]):
    print('FILE:', fn)
    txt = open(fn, encoding='utf-8', errors='ignore').read()
    txt = re.sub(r'(?is)<(script|style).*?>.*?</\\1>', '', txt)
    txt = re.sub(r'<!--.*?-->', '', txt)
    txt = re.sub(r'<[^>]+>', ' ', txt)
    txt = re.sub(r'\s+', ' ', txt).strip()
    sents = re.split(r'(?<=[.!?]) +', txt)
    for sent in sents:
        low = sent.lower()
        if any(kw in low for kw in keywords):
            print(sent.strip())
    print('===')
