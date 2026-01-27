export interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  isTag?: boolean;
  isMarker?: boolean;
}

/**
 * Applies or removes a Markdown format around a selection
 */
export function applyFormat(text: string, start: number, end: number, symbol: string): { text: string; newStart: number; newEnd: number } {
  const selection = text.substring(start, end);
  const isWrapped = text.substring(start - symbol.length, start) === symbol && 
                    text.substring(end, end + symbol.length) === symbol;

  if (isWrapped) {
    const newText = text.substring(0, start - symbol.length) + selection + text.substring(end + symbol.length);
    return { text: newText, newStart: start - symbol.length, newEnd: end - symbol.length };
  } else {
    const newText = text.substring(0, start) + symbol + selection + symbol + text.substring(end);
    return { text: newText, newStart: start + symbol.length, newEnd: end + symbol.length };
  }
}

interface MarkdownRule {
  id: string;
  symbol: string;
  regex: RegExp;
}

/**
 * Optimized recursive Markdown parser
 */
export function parseMarkdown(text: string, styles: Partial<TextSegment> = {}): TextSegment[] {
  if (!text) return [];

  // Rules ordered by decreasing specificity
  const rules: MarkdownRule[] = [
    { id: 'tag', symbol: '', regex: /#[\w\u00C0-\u00FF-]+/ },
    { id: 'bolditalic', symbol: '***', regex: /\*\*\*(.*?)\*\*\*/ },
    { id: 'bold', symbol: '**', regex: /\*\*(.*?)\*\*/ },
    { id: 'underline', symbol: '__', regex: /__(.*?)__/ },
    { id: 'strikethrough', symbol: '~~', regex: /~~(.*?)~~/ },
    { id: 'italic', symbol: '*', regex: /\*(.*?)\*/ },
  ];

  let earliestMatch: RegExpExecArray | null = null;
  let activeRule: MarkdownRule | null = null;

  for (const rule of rules) {
    const m = rule.regex.exec(text);
    if (m) {
      if (!earliestMatch || m.index < earliestMatch.index) {
        earliestMatch = m;
        activeRule = rule;
      } 
      else if (m.index === earliestMatch.index && m[0].length > earliestMatch[0].length) {
        earliestMatch = m;
        activeRule = rule;
      }
    }
  }

  if (!earliestMatch || !activeRule) {
    return [{ ...styles, text }];
  }

  const startIndex = earliestMatch.index;
  const fullMatch = earliestMatch[0];
  const content = earliestMatch[1] || "";
  const result: TextSegment[] = [];

  if (startIndex > 0) {
    result.push(...parseMarkdown(text.substring(0, startIndex), styles));
  }

  if (activeRule.id === 'tag') {
    result.push({ ...styles, text: fullMatch, isTag: true });
  } else {
    const symbol = activeRule.symbol;
    let newStyles = { ...styles };
    
    if (activeRule.id === 'bolditalic') { newStyles.bold = true; newStyles.italic = true; }
    else if (activeRule.id === 'bold') { newStyles.bold = true; }
    else if (activeRule.id === 'italic') { newStyles.italic = true; }
    else if (activeRule.id === 'underline') { newStyles.underline = true; }
    else if (activeRule.id === 'strikethrough') { newStyles.strikethrough = true; }

    result.push({ ...styles, text: symbol, isMarker: true });
    result.push(...parseMarkdown(content, newStyles));
    result.push({ ...styles, text: symbol, isMarker: true });
  }

  const nextIndex = startIndex + fullMatch.length;
  if (nextIndex < text.length) {
    result.push(...parseMarkdown(text.substring(nextIndex), styles));
  }

  return result;
}
