import { memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { getTagColor } from '../utils/colors';
import { parseMarkdown } from '../utils/markdown';

interface RichTextRendererProps {
  text: string;
  checked: boolean;
  colorMode: boolean;
  fontSize: string;
  fontWeight: string;
  lineHeight?: string;
  letterSpacing?: string;
}

export const RichTextRenderer = memo(function RichTextRenderer({
  text,
  checked,
  colorMode,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing
}: RichTextRendererProps) {
  const richTextSegments = useMemo(() => parseMarkdown(text), [text]);

  if (!text) {
    return (
      <div
        className={`w-full whitespace-pre-wrap break-words cursor-text ${fontSize} ${fontWeight} ${lineHeight || ''} ${letterSpacing || ''}`}
      >
        <span className="text-text-dim/30 italic">Empty node...</span>
      </div>
    );
  }

  return (
    <div
      className={`w-full whitespace-pre-wrap break-words cursor-text ${fontSize} ${fontWeight} ${lineHeight || ''} ${letterSpacing || ''}`}
    >
      {richTextSegments.map((seg, i) => {
        if (seg.isTag) {
          const colors = getTagColor(seg.text);
          return (
            <span
              key={i}
              className={`px-1 rounded -mx-1 font-medium transition-colors cursor-default inline ${
                colorMode ? `${colors.bg} ${colors.text}` : 'text-blue-500 bg-blue-500/10'
              }`}
            >
              {seg.text}
            </span>
          );
        }
        if (seg.isMarker) return null;

        const decorations = [];
        if (seg.underline) decorations.push('underline');
        if (checked || seg.strikethrough) decorations.push('line-through');

        const styles = [
          seg.bold ? 'font-bold' : '',
          seg.italic ? 'italic' : '',
          checked ? 'text-text-dim' : 'text-text-main'
        ].join(' ');

        return (
          <span
            key={i}
            className={styles}
            style={{
              textDecorationLine: decorations.join(' '),
              textDecorationThickness: '2px',
              textUnderlineOffset: '2px'
            }}
          >
            {seg.text}
          </span>
        );
      })}
    </div>
  );
});
