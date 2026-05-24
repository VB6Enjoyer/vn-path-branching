import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

load_replacement = """        if (flow && flow.settings) {
          if (flow.settings.light) setTimeout(() => setLightTheme({ ...defaultLightTheme, ...flow.settings.light }), 0);
          if (flow.settings.dark) setTimeout(() => setDarkTheme({ ...defaultDarkTheme, ...flow.settings.dark }), 0);
        }
        if (flow && flow.metadata) {
          setTimeout(() => {
            setFlowTitle(flow.metadata.title || '');
            setFlowAuthor(flow.metadata.author || '');
          }, 0);
        }"""

content = content.replace("""        if (flow && flow.settings) {
          if (flow.settings.light) setTimeout(() => setLightTheme({ ...defaultLightTheme, ...flow.settings.light }), 0);
          if (flow.settings.dark) setTimeout(() => setDarkTheme({ ...defaultDarkTheme, ...flow.settings.dark }), 0);
        }""", load_replacement)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
