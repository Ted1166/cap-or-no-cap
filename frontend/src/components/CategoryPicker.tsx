import type { Category } from "../types";

const CATEGORIES: { key: Category; label: string }[] = [
    { key: "crypto", label: "Crypto" },
    { key: "derivatives", label: "Derivatives" },
    { key: "dex", label: "DEX" },
    { key: "rwa", label: "RWAs" },
];

interface Props {
    selected: Category;
    onSelect: (c: Category) => void;
    onStart: () => void;
}

export function CategoryPicker({ selected, onSelect, onStart }: Props) {
    return (
        <section className="panel">
            <p className="lede">Two real assets. One CMC stat. You call it - higher, or no cap (lower).</p>
            <div className="category-row">
                {CATEGORIES.map((c) => (
                    <button
                        key={c.key}
                        className={`chip ${selected === c.key ? "active" : ""}`}
                        onClick={() => onSelect(c.key)}
                    >
                        {c.label}
                    </button>
                ))}
            </div>
            <button className="cta" onClick={onStart}>
                Start round
            </button>
        </section>
    );
}
