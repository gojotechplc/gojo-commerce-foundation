type Item = { id: number; label: string };

type Props = {
  items: Item[];
  onReorder: (ids: number[]) => void;
  renderItem?: (item: Item, index: number) => React.ReactNode;
};

export function SortableList({ items, onReorder, renderItem }: Props) {
  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    onReorder(next.map((i) => i.id));
  };

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={item.id}
          className="flex items-start gap-2 rounded-sm border border-border bg-card p-3"
        >
          <div className="flex flex-col gap-1 shrink-0">
            <button
              type="button"
              className="text-xs px-2 py-1 border border-border rounded-sm hover:bg-muted disabled:opacity-40"
              disabled={i === 0}
              onClick={() => move(i, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              className="text-xs px-2 py-1 border border-border rounded-sm hover:bg-muted disabled:opacity-40"
              disabled={i === items.length - 1}
              onClick={() => move(i, 1)}
            >
              ↓
            </button>
          </div>
          <div className="flex-1 min-w-0">
            {renderItem ? renderItem(item, i) : <div className="text-sm">{item.label}</div>}
          </div>
        </li>
      ))}
    </ul>
  );
}
