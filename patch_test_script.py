with open('/home/jules/verification/verify_endings_tab.py', 'r') as f:
    content = f.read()

content = content.replace('page.get_by_text("Add Outcome").first.click()', 'page.get_by_text("Outcome Node").first.click()')

with open('/home/jules/verification/verify_endings_tab.py', 'w') as f:
    f.write(content)
