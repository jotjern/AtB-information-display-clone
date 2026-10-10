import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQuaysForStopPlace, searchStops, StopSearchResult } from "../../utils/entur";
import "./index.css";

export default function StopPicker(props: {
  onSelect: (quayId: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [stop, setStop] = useState<StopSearchResult | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedText(text.trim()), 250);
    return () => clearTimeout(timeout);
  }, [text]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [props]);

  const searchQuery = useQuery({
    queryKey: ["stop-search", debouncedText],
    queryFn: () => searchStops(debouncedText),
    enabled: debouncedText.length >= 2,
  });

  const quaysQuery = useQuery({
    queryKey: ["stop-quays", stop?.id],
    queryFn: () => getQuaysForStopPlace(stop!.id),
    enabled: stop !== null,
  });

  return (
    <div className="stop-picker">
      <div className="stop-picker-header">
        {stop === null ? (
          <input
            className="stop-picker-input"
            autoFocus
            placeholder="Søk etter holdeplass"
            value={text}
            onChange={event => setText(event.target.value)}
          />
        ) : (
          <button className="stop-picker-back" onClick={() => setStop(null)}>
            ‹ {stop.name}
          </button>
        )}
        <button className="stop-picker-close" onClick={props.onClose} aria-label="Lukk">
          ✕
        </button>
      </div>

      <ul className="stop-picker-list">
        {stop === null
          ? searchQuery.data?.map(result => (
              <li key={result.id}>
                <button onClick={() => setStop(result)}>
                  <span>{result.name}</span>
                  <span className="stop-picker-secondary">{result.locality}</span>
                </button>
              </li>
            ))
          : quaysQuery.data?.map(quay => (
              <li key={quay.id}>
                <button onClick={() => props.onSelect(quay.id)}>
                  <span>
                    {quay.publicCode ? `Plattform ${quay.publicCode}` : "Plattform"}
                    {quay.description && (
                      <span className="stop-picker-secondary"> · {quay.description}</span>
                    )}
                  </span>
                  <span className="stop-picker-lines">{quay.lines.join(" ")}</span>
                </button>
              </li>
            ))}
      </ul>

      {stop !== null && quaysQuery.data?.length === 0 && (
        <div className="stop-picker-empty">Fant ingen plattformer</div>
      )}
      {stop === null && debouncedText.length >= 2 && searchQuery.data?.length === 0 && (
        <div className="stop-picker-empty">Ingen treff</div>
      )}
    </div>
  );
}
