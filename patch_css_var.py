import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

css_replacement = """          --outcome-bad-color: ${activeTheme.outcomeBadColor};
          --outcome-neutral-color: ${activeTheme.outcomeNeutralColor};
          --path-highlight-color: ${activeTheme.pathHighlightColor || '#22d3ee'};
          --path-color: ${activeTheme.pathColor || (isDarkMode ? '#4b5563' : '#94a3b8')};
        }"""

content = content.replace("""          --outcome-bad-color: ${activeTheme.outcomeBadColor};
          --outcome-neutral-color: ${activeTheme.outcomeNeutralColor};
          --path-highlight-color: ${activeTheme.pathHighlightColor || '#22d3ee'};
        }""", css_replacement)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
