import re

# 1. Fix Editor.tsx (List is not defined)
with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Make sure List is actually imported properly.
# We had a typo or issue with patch_endings_state.py maybe
if "List" not in content[:1000]:
    content = content.replace("Image as ImageIcon } from 'lucide-react';", "Image as ImageIcon, List } from 'lucide-react';")
    content = content.replace("Waypoints, EyeClosed } from 'lucide-react';", "Waypoints, EyeClosed, List } from 'lucide-react';")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)

# 2. Fix DecorativeNode.tsx (useEffect unused)
with open('src/components/nodes/DecorativeNode.tsx', 'r') as f:
    content = f.read()

content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState } from 'react';")

with open('src/components/nodes/DecorativeNode.tsx', 'w') as f:
    f.write(content)
