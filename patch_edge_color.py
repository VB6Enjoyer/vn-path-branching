import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Add pathColor CSS variable
css_replacement = """          --outcome-bad-color: ${activeTheme.outcomeBadColor || '#ef4444'};
          --outcome-neutral-color: ${activeTheme.outcomeNeutralColor || '#a855f7'};
          --path-highlight-color: ${activeTheme.pathHighlightColor || '#06b6d4'};
          --path-color: ${activeTheme.pathColor || (isDarkMode ? '#4b5563' : '#94a3b8')};
        }`}"""
content = re.sub(r'          --outcome-bad-color: \$\{activeTheme\.outcomeBadColor \|\| \'#ef4444\'\};\n          --outcome-neutral-color: \$\{activeTheme\.outcomeNeutralColor \|\| \'#a855f7\'\};\n          --path-highlight-color: \$\{activeTheme\.pathHighlightColor \|\| \'#06b6d4\'\};\n        \}`\}', css_replacement, content)

# Add SettingRow for Path Color
setting_injection = """                <SettingRow label="Text Color" settingKey="textColor" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <SettingRow label="Path Default" settingKey="pathColor" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <SettingRow label="Path Glow" settingKey="pathHighlightColor" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />"""
content = content.replace("""                <SettingRow label="Text Color" settingKey="textColor" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <SettingRow label="Path Glow" settingKey="pathHighlightColor" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />""", setting_injection)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
