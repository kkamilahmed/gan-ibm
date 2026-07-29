type Props = {
  thumbnails: { id: number; url: string }[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onShuffle: () => void;
};

export default function Gallery({ thumbnails, activeId, onSelect, onShuffle }: Props) {
  return (
    <section className="p-xl bg-surface border-t border-outline-variant">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-lg">
          <h3 className="text-label-bold font-semibold text-secondary">
            FEELING ADVENTUROUS? CHOOSE A DIFFERENT PICTURE:
          </h3>
          <button
            onClick={onShuffle}
            className="text-label-sm text-primary flex items-center gap-xs hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            New set
          </button>
        </div>
        <div className="flex gap-md overflow-x-auto pb-base custom-scrollbar snap-x">
          {thumbnails.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`flex-shrink-0 w-24 h-24 p-0.5 snap-start ${
                activeId === t.id
                  ? 'border-2 border-primary'
                  : 'border border-outline-variant opacity-70 hover:opacity-100 transition-opacity'
              }`}
            >
              <div className="w-full h-full bg-outline-variant">
                <img className="w-full h-full object-cover" src={t.url} loading="lazy" />
              </div>
            </button>
          ))}
          {thumbnails.length === 0 &&
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 h-24 border border-outline-variant bg-surface-variant animate-pulse" />
            ))}
        </div>
      </div>
    </section>
  );
}
