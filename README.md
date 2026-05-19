# Brain Map Decision Chart Editor

A visually appealing "brain map" style decision chart editor, designed primarily for visual novel game developers. This tool helps map out choices, consequences, and branching story paths!

## Features

- **Interactive Canvas:** Build flowcharts visually with pan and zoom capability.
- **Custom Nodes:**
  - **Decision:** Adds multiple choices to branch out the paths.
  - **Note/Event:** Contextual middle-branch notes for unlocks, triggers, etc.
  - **Outcome:** Finalize a path with categorized endings (Good, Neutral, Bad).
- **Auto-Layout:** Automatically arrange nodes in a neat top-to-bottom hierarchy using `dagre`.
- **Import / Export JSON:** Easily save and load your current chart layout and node configurations.
- **Styled by Tailwind CSS:** Distinct visual styles making path navigation straightforward.

## Tech Stack
- **Framework:** Next.js & React
- **Canvas / Mapping:** `@xyflow/react` (React Flow)
- **Auto-Layout Algorithm:** `dagre`
- **Styling:** Tailwind CSS

## Getting Started

1. Run \`npm install\` to install dependencies.
2. Run \`npm run dev\` to start the Next.js development server.
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

Happy Mapping!
