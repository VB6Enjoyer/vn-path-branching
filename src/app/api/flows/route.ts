import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const flowsDir = path.join(process.cwd(), 'public', 'flows');

    // Check if directory exists
    if (!fs.existsSync(flowsDir)) {
      return NextResponse.json({ flows: [] });
    }

    const files = fs.readdirSync(flowsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const flows = jsonFiles.map(file => {
      try {
        const filePath = path.join(flowsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        const nodeCount = Array.isArray(data.nodes) ? data.nodes.length : 0;

        let title = 'Untitled Flow';
        let author = 'Anonymous';
        let timestamp = null;
        let canvasBg = null;
        let logoUrl = null;

        if (data.metadata) {
          if (data.metadata.title) title = data.metadata.title;
          if (data.metadata.author) author = data.metadata.author;
          if (data.metadata.timestamp) timestamp = data.metadata.timestamp;
        }

        if (data.settings && data.settings.light) {
          canvasBg = data.settings.light.canvasBg || null;
          logoUrl = data.settings.light.logoUrl || null;
        }

        if (!logoUrl && data.settings && data.settings.dark) {
          logoUrl = data.settings.dark.logoUrl || null;
        }

        return {
          filename: file,
          title,
          author,
          timestamp,
          nodeCount,
          canvasBg,
          logoUrl
        };
      } catch (err) {
        console.error(`Error parsing flow file ${file}:`, err);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({ flows });
  } catch (error) {
    console.error('Error reading flows directory:', error);
    return NextResponse.json({ error: 'Failed to read flows directory' }, { status: 500 });
  }
}
