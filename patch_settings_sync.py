import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Add syncSharedSettings state
state_injection = """  const [flowAuthor, setFlowAuthor] = useState<string>('');
  const [syncSharedSettings, setSyncSharedSettings] = useState(true);"""
content = content.replace("  const [flowAuthor, setFlowAuthor] = useState<string>('');", state_injection)

# Update updateActiveTheme
update_replacement = """  const updateActiveTheme = (key: keyof ThemeSettings, value: string) => {
    if (syncSharedSettings && (key === 'logoUrl' || key === 'fontFamily')) {
      setLightTheme(prev => ({ ...prev, [key]: value }));
      setDarkTheme(prev => ({ ...prev, [key]: value }));
    } else {
      if (isDarkMode) setDarkTheme(prev => ({ ...prev, [key]: value }));
      else setLightTheme(prev => ({ ...prev, [key]: value }));
    }
  };"""
content = re.sub(r'  const updateActiveTheme = \(key: keyof ThemeSettings, value: string\) => \{[\s\S]+?  \};', update_replacement, content)

# Update resetSetting
reset_replacement = """  const resetSetting = (key: keyof ThemeSettings) => {
    if (syncSharedSettings && (key === 'logoUrl' || key === 'fontFamily')) {
      setLightTheme(prev => ({ ...prev, [key]: defaultLightTheme[key] }));
      setDarkTheme(prev => ({ ...prev, [key]: defaultDarkTheme[key] }));
    } else {
      if (isDarkMode) setDarkTheme(prev => ({ ...prev, [key]: defaultDarkTheme[key] }));
      else setLightTheme(prev => ({ ...prev, [key]: defaultLightTheme[key] }));
    }
  };"""
content = re.sub(r'  const resetSetting = \(key: keyof ThemeSettings\) => \{[\s\S]+?  \};', reset_replacement, content)

# Add checkbox to visual settings UI
ui_injection = """              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <input
                    type="checkbox"
                    id="syncSettings"
                    checked={syncSharedSettings}
                    onChange={(e) => setSyncSharedSettings(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="syncSettings" className="text-xs text-gray-600 dark:text-gray-300 select-none cursor-pointer">
                    Sync Logo & Font between themes
                  </label>
                </div>
                <SettingRow label="Logo URL" settingKey="logoUrl" type="text" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />"""
content = content.replace("""              <div className="flex flex-col gap-1">
                <SettingRow label="Logo URL" settingKey="logoUrl" type="text" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />""", ui_injection)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
