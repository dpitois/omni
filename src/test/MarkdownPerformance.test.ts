import { describe, test, expect } from 'vitest';
import { parseMarkdown } from '../utils/markdown';
import { measurePerformance } from './perfUtils';

describe('Markdown Parsing Correctness', () => {
  test('should parse various formats correctly', () => {
    const text = 'Normal **bold** *italic* ~~strike~~ __under__ ***both*** #tag';
    const result = parseMarkdown(text);

    expect(result.find((s) => s.text === 'bold')?.bold).toBe(true);
    expect(result.find((s) => s.text === 'italic')?.italic).toBe(true);
    expect(result.find((s) => s.text === 'strike')?.strikethrough).toBe(true);
    expect(result.find((s) => s.text === 'under')?.underline).toBe(true);
    const both = result.find((s) => s.text === 'both');
    expect(both?.bold).toBe(true);
    expect(both?.italic).toBe(true);
    expect(result.find((s) => s.text === '#tag')?.isTag).toBe(true);
  });

  test('should handle nested-like structures via recursion', () => {
    const text = '**bold with *italic* inside**';
    const result = parseMarkdown(text);

    // The parser is recursive:
    // [**, bold with , *, italic, *,  inside, **]
    expect(result.some((s) => s.text === 'italic' && s.italic && s.bold)).toBe(true);
  });
});

describe('Markdown Parsing Performance', () => {
  test('Parsing 1000 standard nodes', async () => {
    const texts = Array.from(
      { length: 1000 },
      (_, i) =>
        `This is node ${i} with **bold**, *italic*, and a #tag${i % 10}. Also some ~~strikethrough~~.`
    );

    await measurePerformance('Parse 1000 unique markdown strings', async () => {
      texts.forEach((t) => parseMarkdown(t));
    });
  });

  test('Parsing 1000 repetitive nodes (Cache potential)', async () => {
    const uniqueTexts = [
      'Normal text without formatting',
      '**Bold text** with #tag',
      '*Italic text* and __underline__',
      '~~Strikethrough~~ and ***BoldItalic***',
      'A very long text with multiple #tags and **formatting** spread throughout the entire string to see how the recursive parser behaves.'
    ];
    const texts = Array.from({ length: 1000 }, (_, i) => uniqueTexts[i % uniqueTexts.length]);

    await measurePerformance('Parse 1000 repetitive markdown strings', async () => {
      texts.forEach((t) => parseMarkdown(t));
    });
  });
});
