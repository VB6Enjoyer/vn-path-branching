import re

with open('src/app/api/flows/route.ts', 'r') as f:
    content = f.read()

replacement = """        let canvasBg = null;
        let logoUrl = null;

        if (data.metadata) {
          if (data.metadata.title) title = data.metadata.title;
          if (data.metadata.author) author = data.metadata.author;
          if (data.metadata.timestamp) timestamp = data.metadata.timestamp;
        }

        if (data.settings && data.settings.light) {
          canvasBg = data.settings.light.canvasBg || null;
          logoUrl = data.settings.light.logoUrl || null;
        }

        if (!logoUrl && data.settings && data.settings.dark) {
          logoUrl = data.settings.dark.logoUrl || null;
        }

        return {
          filename: file,
          title,
          author,
          timestamp,
          nodeCount,
          canvasBg,
          logoUrl
        };"""

content = re.sub(r'        let canvasBg = null;\n\n        if \(data\.metadata\) \{[\s\S]+?        \};', replacement, content)

with open('src/app/api/flows/route.ts', 'w') as f:
    f.write(content)
