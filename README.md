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

## Deployment instructions for Render

1. Go to your Render Dashboard
2. Select your `vn-path-branching` Web Service
3. Go to **Settings**
4. Change **Build Command** to: `npm install && npm run build`
5. Change **Start Command** to: `npm run start`
6. Click **Save Changes** and manually trigger a new deploy.

## Getting Started Locally

1. Run \`npm install\` to install dependencies.
2. Run \`npm run dev\` to start the Next.js development server.
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

Happy Mapping!
