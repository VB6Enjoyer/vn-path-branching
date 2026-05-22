import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

replacement = """                  nodes.filter(n => n.type === 'outcome').map((node) => {
                    const outcomeType = node.data.type as 'good' | 'bad' | 'neutral' || 'neutral';
                    const isRevealed = revealedNodeIds.has(node.id);
                    const isBlurred = isSpoilerMode && !isRevealed;

                    let bgClass = 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200';
                    if (!isBlurred) {
                      if (outcomeType === 'good') bgClass = 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
                      if (outcomeType === 'bad') bgClass = 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
                    }

                    const outcomeText = node.data.outcome as string;
                    let displayName = outcomeText;
                    if (!displayName || displayName === 'Ending Name') {
                      if (outcomeType === 'good') displayName = 'Good Ending';
                      else if (outcomeType === 'bad') displayName = 'Bad Ending';
                      else displayName = 'Neutral Ending';
                    }

                    return (
                      <div key={node.id} className={`flex flex-col gap-2 p-2 rounded border ${bgClass}`}>
                        <div className="flex items-center justify-between">
                           <span className={`text-sm font-semibold truncate flex-1 ${isBlurred ? 'blur-sm select-none' : ''}`}>
                             {displayName}
                           </span>"""

content = re.sub(r'                  nodes\.filter\(n => n\.type === \'outcome\'\)\.map\(\(node\) => \{[\s\S]+?                           <span className=\{`text-sm font-semibold truncate flex-1 \$\{isBlurred \? \'blur-sm select-none\' : \'\'\}`\}>\n                             \{node\.data\.label as string \|\| \'Unnamed Outcome\'\}\n                           </span>', replacement, content)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
