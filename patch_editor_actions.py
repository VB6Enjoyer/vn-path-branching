import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Disable Visual Settings button
content = content.replace("""                <button
                  onClick={() => { setShowSettings(!showSettings); setShowEndings(false); }}
                  className={`p-1 rounded-full transition ${showSettings ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700'}`}
                  title="Visual Settings"
                >""", """                <button
                  onClick={() => { setShowSettings(!showSettings); setShowEndings(false); }}
                  disabled={isLocked}
                  className={`p-1 rounded-full transition ${showSettings ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isLocked ? "Unlock Canvas to Edit Settings" : "Visual Settings"}
                >""")

# Make sure if we lock while settings is open, we close it
content = content.replace("onClick={() => setIsLocked(!isLocked)}",
                          "onClick={() => { setIsLocked(!isLocked); setShowSettings(false); }}")


# The auto layout button was partially patched but maybe it's not looking disabled correctly. Let's make sure it has disabled:opacity-50
content = content.replace("""<button onClick={() => onLayout('TB')} disabled={isLocked} className="w-full px-3 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition">Auto Layout Tree</button>""",
                          """<button onClick={() => onLayout('TB')} disabled={isLocked} className="w-full px-3 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed">Auto Layout Tree</button>""")

# If it wasn't replaced properly before (e.g. without disabled={isLocked}), let's replace the raw one just in case
content = content.replace("""<button onClick={() => onLayout('TB')} className="w-full px-3 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition">Auto Layout Tree</button>""",
                          """<button onClick={() => onLayout('TB')} disabled={isLocked} className="w-full px-3 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed">Auto Layout Tree</button>""")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
