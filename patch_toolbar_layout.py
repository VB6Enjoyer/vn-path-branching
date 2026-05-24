import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Replace the layout
old_layout = """          <Panel position="top-right" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col gap-2 w-48 transition-colors">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">Add Nodes</h3>
              <div className="flex gap-1">"""

new_layout = """          <Panel position="top-right" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col gap-2 w-48 transition-colors">
            <div className="flex justify-center items-center mb-2 w-full">
              <div className="flex gap-1">"""

content = content.replace(old_layout, new_layout)

# Insert the Add Nodes title after the flex container
# We need to find the end of the flex container for the buttons
# The block ends after the toggleTheme button

old_theme_button = """                <button
                  onClick={toggleTheme}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700 transition"
                  title="Toggle Dark Mode"
                >
                  {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              </div>
            </div>"""

new_theme_button = """                <button
                  onClick={toggleTheme}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700 transition"
                  title="Toggle Dark Mode"
                >
                  {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              </div>
            </div>

            <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-1 mt-1">Add Nodes</h3>"""

content = content.replace(old_theme_button, new_theme_button)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
