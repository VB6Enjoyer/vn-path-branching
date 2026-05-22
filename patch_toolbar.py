import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

replacement = """              <div className="flex gap-1">
                <button
                  onClick={() => { setShowEndings(!showEndings); setShowSettings(false); }}
                  className={`p-1 rounded-full transition ${showEndings ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700'}`}
                  title="View Endings"
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => { setShowSettings(!showSettings); setShowEndings(false); }}
                  className={`p-1 rounded-full transition ${showSettings ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700'}`}
                  title="Visual Settings"
                >"""

content = content.replace("""              <div className="flex gap-1">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1 rounded-full transition ${showSettings ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700'}`}
                  title="Visual Settings"
                >""", replacement)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
