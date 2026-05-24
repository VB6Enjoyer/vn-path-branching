import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/components/nodes/DecisionNode.tsx', [
    ('<button \n            onClick={handleDelete}', '<button \n            onClick={handleDelete}\n            disabled={isLocked}\n            className={`hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? \'hidden\' : \'\'}`}'),
    ('<button\n                onClick={() => removeChoice(index)}', '<button\n                onClick={() => removeChoice(index)}\n                disabled={isLocked}\n                className={`text-red-400 hover:text-red-600 transition-colors ml-1 ${isLocked ? \'hidden\' : \'\'}`}')
])

patch_file('src/components/nodes/TextNode.tsx', [
    ('<button \n            onClick={handleDelete}', '<button \n            onClick={handleDelete}\n            disabled={isLocked}\n            className={`hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? \'hidden\' : \'\'}`}'),
    ('<button\n                onClick={() => setShowMediaInput(true)}', '<button\n                onClick={() => setShowMediaInput(true)}\n                disabled={isLocked}\n                className={`w-full text-xs py-1 hover:bg-gray-100 dark:hover:bg-gray-800 border-t transition-colors mt-2 flex justify-center items-center gap-1 ${isLocked ? \'hidden\' : \'\'}`}')
])

patch_file('src/components/nodes/OutcomeNode.tsx', [
    ('<button \n          onClick={handleDelete}', '<button \n          onClick={handleDelete}\n          disabled={isLocked}\n          className={`hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? \'hidden\' : \'\'}`}')
])
