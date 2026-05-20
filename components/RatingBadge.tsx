interface Props {
  label: string;
  score: string | null;
  link: string | null;
  color: string;
  icon: React.ReactNode;
}

export default function RatingBadge({ label, score, link, color, icon }: Props) {
  const inner = (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${color} transition-opacity ${!score ? "opacity-50" : ""}`}>
      <span className="w-5 h-5 shrink-0">{icon}</span>
      <div className="flex flex-col leading-tight">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-sm font-semibold text-white">{score ?? "N/A"}</span>
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
        {inner}
      </a>
    );
  }
  return <div>{inner}</div>;
}
