import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Fix 1: Record<string, any> -> Record<string, unknown> or specific interface
interface_def = """  type FlowItem = {
    filename: string;
    title: string;
    author: string;
    timestamp: string | null;
    nodeCount: number;
    canvasBg: string | null;
  };
  const [flowsList, setFlowsList] = useState<FlowItem[]>([]);"""

content = content.replace("const [flowsList, setFlowsList] = useState<Record<string, any>[]>([]);", interface_def)

content = content.replace("  // eslint-disable-next-line react-hooks/exhaustive-deps\n", "")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
