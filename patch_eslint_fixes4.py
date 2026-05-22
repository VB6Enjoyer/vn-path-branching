import re

# 1. Fix Editor.tsx (ImageIcon not used because the context menu might not be rendering it)
with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Remove ImageIcon from imports entirely if it's complaining
content = content.replace("Image as ImageIcon } from 'lucide-react'", "} from 'lucide-react'")
content = content.replace("<ImageIcon size={14} className=\"text-gray-400\" /> ", "")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)

# 2. Fix DecorativeNode.tsx (Remove useEffect, just derive state directly from data)
with open('src/components/nodes/DecorativeNode.tsx', 'r') as f:
    content = f.read()

replacement = """  const mediaUrl = (data.mediaUrl as string) || '';
  const [showInput, setShowInput] = useState<boolean>(!data.mediaUrl);
  const [tempUrl, setTempUrl] = useState<string>((data.mediaUrl as string) || '');
  const { setNodes } = useReactFlow();

  const updateNodeData = (newUrl: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, mediaUrl: newUrl },
          };
        }
        return node;
      })
    );
  };

  const handleSaveUrl = () => {
    updateNodeData(tempUrl);
    if (tempUrl.trim() !== '') {
      setShowInput(false);
    }
  };"""

content = re.sub(r'  const \[mediaUrl, setMediaUrl\] = useState<string>\(\(data.mediaUrl as string\) \|\| \'\'\);[\s\S]+?  const handleSaveUrl = \(\) => \{[\s\S]+?  \};', replacement, content)

# update error handler on image
content = content.replace("setMediaUrl('');", "updateNodeData('');")

with open('src/components/nodes/DecorativeNode.tsx', 'w') as f:
    f.write(content)
