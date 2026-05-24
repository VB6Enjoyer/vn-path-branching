import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

# DecisionNode.tsx
patch_file('src/components/nodes/DecisionNode.tsx', [
    ('const isHighlighted = !!data.isHighlighted;', 'const isHighlighted = !!data.isHighlighted;\n  const isLocked = !!data.isLocked;'),
    ('value={prompt}', 'value={prompt} readOnly={isLocked}'),
    ('onChange={(e) => updatePrompt(e.target.value)}', 'onChange={(e) => !isLocked && updatePrompt(e.target.value)}'),
    ('<button \n          onClick={handleDelete}', '<button \n          onClick={handleDelete}\n          disabled={isLocked}\n          className={`hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? \'hidden\' : \'\'}`}'),
    ('className="hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"', ''),
    ('value={choice}', 'value={choice} readOnly={isLocked}'),
    ('onChange={(e) => updateChoice(index, e.target.value)}', 'onChange={(e) => !isLocked && updateChoice(index, e.target.value)}'),
    ('<button\n              onClick={() => removeChoice(index)}', '<button\n              onClick={() => removeChoice(index)}\n              disabled={isLocked}\n              className={`text-red-400 hover:text-red-600 transition-colors ml-1 ${isLocked ? \'hidden\' : \'\'}`}'),
    ('className="text-red-400 hover:text-red-600 transition-colors ml-1"', ''),
    ('<button \n          onClick={addChoice}', '<button \n          onClick={addChoice}\n          disabled={isLocked}\n          className={`w-full text-xs py-1 border-t transition-colors mt-2 ${isLocked ? \'hidden\' : \'hover:bg-gray-100 dark:hover:bg-gray-800\'}`}'),
    ('className="w-full text-xs py-1 hover:bg-gray-100 dark:hover:bg-gray-800 border-t transition-colors mt-2"', ''),
])

# TextNode.tsx
patch_file('src/components/nodes/TextNode.tsx', [
    ('const isHighlighted = !!data.isHighlighted;', 'const isHighlighted = !!data.isHighlighted;\n  const isLocked = !!data.isLocked;'),
    ('<button \n          onClick={handleDelete}', '<button \n          onClick={handleDelete}\n          disabled={isLocked}\n          className={`hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? \'hidden\' : \'\'}`}'),
    ('className="hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"', ''),
    ('value={content}', 'value={content} readOnly={isLocked}'),
    ('onChange={(e) => updateContent(e.target.value)}', 'onChange={(e) => !isLocked && updateContent(e.target.value)}'),
    ('<button\n              onClick={() => setShowMediaInput(true)}', '<button\n              onClick={() => setShowMediaInput(true)}\n              disabled={isLocked}\n              className={`w-full text-xs py-1 hover:bg-gray-100 dark:hover:bg-gray-800 border-t transition-colors mt-2 flex justify-center items-center gap-1 ${isLocked ? \'hidden\' : \'\'}`}'),
    ('className="w-full text-xs py-1 hover:bg-gray-100 dark:hover:bg-gray-800 border-t transition-colors mt-2 flex justify-center items-center gap-1"', ''),
    ('<button\n              onClick={() => setShowMediaInput(true)}\n              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"', '<button\n              onClick={() => setShowMediaInput(true)}\n              disabled={isLocked}\n              className={`absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? \'hidden\' : \'\'}`}')
])

# OutcomeNode.tsx
patch_file('src/components/nodes/OutcomeNode.tsx', [
    ('const isHighlighted = !!data.isHighlighted;', 'const isHighlighted = !!data.isHighlighted;\n  const isLocked = !!data.isLocked;'),
    ('<button \n          onClick={handleDelete}', '<button \n          onClick={handleDelete}\n          disabled={isLocked}\n          className={`hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? \'hidden\' : \'\'}`}'),
    ('className="hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"', ''),
    ('value={outcome}', 'value={outcome} readOnly={isLocked}'),
    ('onChange={(e) => updateOutcome(e.target.value)}', 'onChange={(e) => !isLocked && updateOutcome(e.target.value)}'),
    ('value={type}', 'value={type} disabled={isLocked}'),
    ('onChange={(e) => updateType(e.target.value)}', 'onChange={(e) => !isLocked && updateType(e.target.value)}'),
])

# DecorativeNode.tsx
patch_file('src/components/nodes/DecorativeNode.tsx', [
    ('const isBlurred = !!data.isBlurred;', 'const isBlurred = !!data.isBlurred;\n  const isLocked = !!data.isLocked;'),
    ('onDoubleClick={() => setShowInput(true)}', 'onDoubleClick={() => !isLocked && setShowInput(true)}'),
    ('<div \n        className={`absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 ${selected ? \'opacity-100\' : \'\'} transition-opacity z-10`}', '<div \n        className={`absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 ${selected ? \'opacity-100\' : \'\'} transition-opacity z-10 ${isLocked ? \'hidden\' : \'\'}`}'),
    ('<NodeResizer', '<NodeResizer\n        disabled={isLocked}')
])

# CustomEdge.tsx
patch_file('src/components/nodes/CustomEdge.tsx', [
    ('const isBlurred = !!data?.isBlurred;', 'const isBlurred = !!data?.isBlurred;\n  const isLocked = !!data?.isLocked;'),
    ('{!isBlurred && isHovered && (', '{!isBlurred && !isLocked && isHovered && (')
])
