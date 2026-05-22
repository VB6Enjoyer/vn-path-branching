import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Download, Upload, LocateFixed, Moon, Sun, Settings, X as XIcon, RotateCcw, Undo2, Redo2, FilePlus, Plus, EyeOff, Trash2, Waypoints, EyeClosed, } from 'lucide-react';", "import { Download, Upload, LocateFixed, Moon, Sun, Settings, X as XIcon, RotateCcw, Undo2, Redo2, FilePlus, Plus, EyeOff, Trash2, Waypoints, EyeClosed, List } from 'lucide-react';")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
