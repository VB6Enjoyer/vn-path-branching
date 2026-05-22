import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# 1. Add showEndings state
state_injection = """  const [showSettings, setShowSettings] = useState(false);
  const [showEndings, setShowEndings] = useState(false);"""
content = content.replace("  const [showSettings, setShowSettings] = useState(false);", state_injection)

# 2. Add List, MapPin icons to import
if "List" not in content:
    content = content.replace("Image as ImageIcon } from 'lucide-react';", "Image as ImageIcon, List, MapPin } from 'lucide-react';")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
