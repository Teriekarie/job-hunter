import { ringClass } from '@/lib/format';

// Round score badge that fills up with the score (0–100).
export default function Score({ score, band, large = false }: { score: number | null; band?: string | null; large?: boolean }) {
  const p = Math.max(0, Math.min(100, score ?? 0));
  return (
    <div className="score" style={large ? { width: 84 } : undefined}>
      <div className={`ring ${ringClass(score)} ${large ? 'lg' : ''}`} style={{ ['--p' as string]: p }} role="img" aria-label={`Match score ${score ?? 'not scored'} out of 100${band ? `, ${band}` : ''}`}>
        <b>{score ?? '–'}</b>
      </div>
      {band && <small>{band}</small>}
    </div>
  );
}
