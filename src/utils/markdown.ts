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
export function applyFormat(
  text: string,
  start: number,
  end: number,
  symbol: string
): { text: string; newStart: number; newEnd: number } {
  const selection = text.substring(start, end);
  const isWrapped =
    text.substring(start - symbol.length, start) === symbol &&
    text.substring(end, end + symbol.length) === symbol;

  if (isWrapped) {
    const newText =
      text.substring(0, start - symbol.length) + selection + text.substring(end + symbol.length);
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

const RULES: MarkdownRule[] = [
  { id: 'tag', symbol: '', regex: /#[\w\u00C0-\u00FF-]+/ },
  { id: 'bolditalic', symbol: '***', regex: /\*\*\*(.*?)\*\*\*/ },
  { id: 'bold', symbol: '**', regex: /\*\*(.*?)\*\*/ },
  { id: 'underline', symbol: '__', regex: /__(.*?)__/ },
  { id: 'strikethrough', symbol: '~~', regex: /~~(.*?)~~/ },
  { id: 'italic', symbol: '*', regex: /\*(.*?)\*/ }
];

const PARSE_CACHE = new Map<string, TextSegment[]>();
const MAX_CACHE_SIZE = 1000;

function _parseMarkdown(text: string, styles: Partial<TextSegment> = {}): TextSegment[] {
  if (!text) return [];

  let earliestMatch: RegExpExecArray | null = null;
  let activeRule: MarkdownRule | null = null;

  for (const rule of RULES) {
    const m = rule.regex.exec(text);
    if (m) {
      if (!earliestMatch || m.index < earliestMatch.index) {
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
  const content = earliestMatch[1] || '';
  const result: TextSegment[] = [];

  if (startIndex > 0) {
    result.push(..._parseMarkdown(text.substring(0, startIndex), styles));
  }

  if (activeRule.id === 'tag') {
    result.push({ ...styles, text: fullMatch, isTag: true });
  } else {
    const symbol = activeRule.symbol;
    const newStyles = { ...styles };

    if (activeRule.id === 'bolditalic') {
      newStyles.bold = true;
      newStyles.italic = true;
    } else if (activeRule.id === 'bold') {
      newStyles.bold = true;
    } else if (activeRule.id === 'italic') {
      newStyles.italic = true;
    } else if (activeRule.id === 'underline') {
      newStyles.underline = true;
    } else if (activeRule.id === 'strikethrough') {
      newStyles.strikethrough = true;
    }

    result.push({ ...styles, text: symbol, isMarker: true });
    result.push(..._parseMarkdown(content, newStyles));
    result.push({ ...styles, text: symbol, isMarker: true });
  }

  const nextIndex = startIndex + fullMatch.length;
  if (nextIndex < text.length) {
    result.push(..._parseMarkdown(text.substring(nextIndex), styles));
  }

  return result;
}

export function parseMarkdown(text: string, styles: Partial<TextSegment> = {}): TextSegment[] {
  const isTopLevel = Object.keys(styles).length === 0;
  if (isTopLevel) {
    const cached = PARSE_CACHE.get(text);
    if (cached) return cached;
  }
  const result = _parseMarkdown(text, styles);
  if (isTopLevel) {
    if (PARSE_CACHE.size >= MAX_CACHE_SIZE) {
      const firstKey = PARSE_CACHE.keys().next().value;
      if (firstKey !== undefined) PARSE_CACHE.delete(firstKey);
    }
    PARSE_CACHE.set(text, result);
  }
  return result;
}
