import type { Node } from '../types';

/**
 * Exports nodes as a standard JSON file for backup and restoration.
 */
export function exportToJSON(nodes: Node[]) {
  const data = JSON.stringify(nodes, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  downloadBlob(blob, 'json');
}

/**
 * Exports nodes as a hierarchical Markdown file.
 */
export function exportToMarkdown(nodes: Node[]) {
  let markdown = '# Outline Export\n\n';

  nodes.forEach((node) => {
    const indent = '  '.repeat(node.level);
    const checkbox = node.checked ? '[x]' : '[ ]';
    markdown += `${indent}- ${checkbox} ${node.text}`;

    if (node.metadata && Object.keys(node.metadata).length > 0) {
      const metaStrings = Object.entries(node.metadata)
        .filter(([_, v]) => v !== null && v !== '')
        .map(([k, v]) => `*${k}*: ${v}`);

      if (metaStrings.length > 0) {
        markdown += ` (${metaStrings.join(', ')})`;
      }
    }
    markdown += '\n';
  });

  const blob = new Blob([markdown], { type: 'text/markdown' });
  downloadBlob(blob, 'md');
}

/**
 * Exports nodes to a standard OPML file.
 */
export function exportToOPML(nodes: Node[]) {
  const doc = document.implementation.createDocument(null, 'opml', null);
  const opml = doc.documentElement;
  opml.setAttribute('version', '2.0');

  const head = doc.createElement('head');
  const title = doc.createElement('title');
  title.textContent = 'MVO Outline Export';
  head.appendChild(title);
  opml.appendChild(head);

  const body = doc.createElement('body');
  opml.appendChild(body);

  const stack: Element[] = [body];
  let currentLevel = -1;

  nodes.forEach((node) => {
    const outline = doc.createElement('outline');
    outline.setAttribute('text', node.text);
    if (node.checked) outline.setAttribute('_checked', 'true');
    if (node.collapsed) outline.setAttribute('_collapsed', 'true');

    if (node.level > currentLevel) {
      stack[stack.length - 1].appendChild(outline);
      stack.push(outline);
    } else if (node.level === currentLevel) {
      stack.pop();
      stack[stack.length - 1].appendChild(outline);
      stack.push(outline);
    } else {
      while (stack.length > node.level + 2) stack.pop();
      stack.pop();
      stack[stack.length - 1].appendChild(outline);
      stack.push(outline);
    }
    currentLevel = node.level;
  });

  const serializer = new XMLSerializer();
  const xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(doc);
  const blob = new Blob([xmlString], { type: 'text/xml' });
  downloadBlob(blob, 'opml');
}

/**
 * Parses an OPML string into an array of Nodes.
 */
export function parseOPML(opmlString: string): Node[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(opmlString, 'text/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) throw new Error('Invalid OPML format');

  const nodes: Node[] = [];
  const body = doc.querySelector('body');
  if (!body) return [];

  function traverse(element: Element, level: number) {
    const outlines = Array.from(element.children).filter(
      (el) => el.tagName.toLowerCase() === 'outline'
    );
    outlines.forEach((outline) => {
      const text = outline.getAttribute('text') || outline.getAttribute('title') || '';
      const checked = outline.getAttribute('_checked') === 'true';
      const collapsed =
        outline.getAttribute('_collapsed') === 'true' || outline.getAttribute('state') === 'closed';

      nodes.push({
        id: self.crypto.randomUUID(),
        text,
        level,
        rank: 0,
        checked,
        collapsed,
        parentId: null,
        updatedAt: Date.now(),
        docId: 'default',
        metadata: {}
      });
      traverse(outline, level + 1);
    });
  }

  traverse(body, 0);
  return nodes;
}

/**
 * Helper to trigger a file download.
 */
function downloadBlob(blob: Blob, extension: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `omni-export-${date}.${extension}`;
  a.click();
  URL.revokeObjectURL(url);
}
