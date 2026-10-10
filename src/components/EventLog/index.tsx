import { useState } from "react";
import { clearLog, LogEntry, readLog } from "../../utils/event_log";
import "./index.css";

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("nb-NO");
}

function formatDetails(entry: LogEntry) {
  switch (entry.type) {
    case "stop-change":
      return `${entry.from} → ${entry.to}`;
    case "failure":
      return `${entry.quayId} ${entry.reason}${entry.status ? ` ${entry.status}` : ""}`;
    default:
      return entry.quayId;
  }
}

export default function EventLog() {
  const [entries, setEntries] = useState<LogEntry[]>(() => readLog().reverse());

  const totals = entries.reduce<Record<string, number>>((totals, entry) => {
    totals[entry.type] = (totals[entry.type] ?? 0) + entry.count;
    return totals;
  }, {});

  return (
    <div className="event-log">
      <div className="event-log-header">
        <h1>Hendelseslogg</h1>
        <div className="event-log-actions">
          <button onClick={() => setEntries(readLog().reverse())}>Oppdater</button>
          <button onClick={() => { clearLog(); setEntries([]); }}>Tøm</button>
        </div>
      </div>

      <div className="event-log-totals">
        {Object.entries(totals).map(([type, count]) => (
          <span key={type} className={`event-log-${type}`}>{type}: {count}</span>
        ))}
      </div>

      <table>
        <thead>
          <tr>
            <th>Fra</th>
            <th>Til</th>
            <th>Hendelse</th>
            <th>Antall</th>
            <th>Snitt ms</th>
            <th>Maks ms</th>
            <th>Detaljer</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={`${entry.first}-${entry.type}`} className={`event-log-${entry.type}`}>
              <td>{formatTime(entry.first)}</td>
              <td>{entry.count > 1 ? formatTime(entry.last) : ""}</td>
              <td>{entry.type}</td>
              <td>{entry.count}</td>
              <td>{entry.durationMs ? Math.round(entry.durationMs.total / entry.count) : ""}</td>
              <td>{entry.durationMs?.max ?? ""}</td>
              <td>{formatDetails(entry)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {entries.length === 0 && <p>Loggen er tom</p>}
    </div>
  );
}
