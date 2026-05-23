import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Replace the img tag for the logo to fix the bug
logo_replacement = """                <img
                  key={activeTheme.logoUrl}
                  src={activeTheme.logoUrl}
                  alt="VN Logo"
                  className="max-h-32 object-contain drop-shadow-xl"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />"""

content = re.sub(r'                <img \n                  src=\{activeTheme\.logoUrl\} \n                  alt="VN Logo" \n                  className="max-h-32 object-contain drop-shadow-xl"\n                  onError=\{\(e\) => \{ \(e\.target as HTMLElement\)\.style\.display = \'none\'; \}\}\n                />', logo_replacement, content)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
