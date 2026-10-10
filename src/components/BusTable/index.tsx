import { useEffect, useLayoutEffect, useRef } from "react";
import * as time_utils from "../../utils/time_utils";
import { EstimatedCallType } from "../../utils/entur_types";
import "./index.css";

// Hide rows that would only be partially visible at the bottom of the screen
function hideOverflowingRows(tbody: HTMLTableSectionElement | null) {
  if (!tbody) return;
  const rows = Array.from(tbody.rows);
  rows.forEach(row => row.style.visibility = "");
  rows.forEach(row => {
    if (row.getBoundingClientRect().bottom > window.innerHeight) {
      row.style.visibility = "hidden";
    }
  });
}

export default function BusTable(props: {
  stopName: string;
  platform: string | null;
  departures: EstimatedCallType[];
  departureFetchTime: Date;
  onTitleClick: () => void;
}) {
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  useLayoutEffect(() => hideOverflowingRows(tbodyRef.current));

  useEffect(() => {
    const update = () => hideOverflowingRows(tbodyRef.current);
    window.addEventListener("resize", update);
    document.fonts.ready.then(update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="bus-table">
      <div className="bus-table-header-container">
        <button className="bus-table-header-title" onClick={props.onTitleClick}>
          {props.stopName}
          {props.platform && ` ${props.platform}`}
        </button>
        <div className="bus-table-header-time">
          {time_utils.format_string(props.departureFetchTime)}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th className="departure-line-id">Rute</th>
            <th className="departure-line-name">Til</th>
            <th className="departure-line-time">Avgang</th>
          </tr>
        </thead>
        <tbody ref={tbodyRef}>
          {props
              .departures
              .sort(time_utils.departure_sorter)
              .map((departure, index) => {
            const departureTime = time_utils.departure_time_to_string(departure);
            return <tr key={index} className={"departure-line " + (departureTime === "Nå" ? "departure-line-now" : "")}>
              <td className="departure-line-id">
                {departure.serviceJourney?.journeyPattern?.line?.publicCode ?? "N/A"}
              </td>
              <td className="departure-line-name">
                {departure.destinationDisplay?.frontText ?? "N/A"}
              </td>
              <td className="departure-line-time">
                {departureTime}
              </td>
            </tr>;
            })}
        </tbody>
      </table>

      <div className="bus-table-last-update">
        {props.departureFetchTime.toLocaleTimeString("nb-NO")}
      </div>
    </div>
  );
}
