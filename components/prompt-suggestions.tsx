interface PromptSuggestionsProps {
  label: string;
  onSelect: (text: string) => void;
  suggestions: string[];
}

export function PromptSuggestions({
  label,
  onSelect,
  suggestions,
}: PromptSuggestionsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-2xl font-bold">{label}</h2>
      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:gap-6">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelect(suggestion)}
            className="h-max flex-1 rounded-xl border border-border bg-background p-4 text-left hover:bg-muted"
          >
            <p>{suggestion}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
