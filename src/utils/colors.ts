// Deterministic color generator based on string hash

const PASTEL_PALETTE = [
  { text: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { text: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/20' },
  { text: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  { text: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
  { text: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
  { text: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
  { text: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-400/20' },
  { text: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' },
];

export function getTagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % PASTEL_PALETTE.length;
  return PASTEL_PALETTE[index];
}
