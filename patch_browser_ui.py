import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Update FlowItem interface
interface_replacement = """  type FlowItem = {
    filename: string;
    title: string;
    author: string;
    timestamp: string | null;
    nodeCount: number;
    canvasBg: string | null;
    logoUrl: string | null;
  };"""

content = content.replace("  type FlowItem = {\n    filename: string;\n    title: string;\n    author: string;\n    timestamp: string | null;\n    nodeCount: number;\n    canvasBg: string | null;\n  };", interface_replacement)

# Update the rendered card to show the image if it exists
card_replacement = """                        <div
                          key={i}
                          className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col"
                          onClick={() => loadFlowFromUrl(flow.filename)}
                        >
                          <div
                            className="h-32 w-full border-b border-gray-100 dark:border-gray-700 transition-colors flex items-center justify-center relative overflow-hidden"
                            style={{ backgroundColor: flow.canvasBg || '#f3f4f6' }}
                          >
                            {flow.logoUrl && (
                               <img
                                 src={flow.logoUrl}
                                 alt="Flow Logo"
                                 className="max-h-24 max-w-[80%] object-contain drop-shadow-md z-10"
                                 onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                               />
                            )}
                          </div>"""

content = re.sub(r'                        <div \n                          key=\{i\} \n                          className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col"\n                          onClick=\{\(\) => loadFlowFromUrl\(flow.filename\)\}\n                        >\n                          <div \n                            className="h-32 w-full border-b border-gray-100 dark:border-gray-700 transition-colors"\n                            style=\{\{ backgroundColor: flow.canvasBg \|\| \'#f3f4f6\' \}\}\n                          ></div>', card_replacement, content)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
