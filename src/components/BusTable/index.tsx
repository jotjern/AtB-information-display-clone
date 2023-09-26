import * as time_utils from "../../utils/time_utils";
import { EstimatedCallType } from "../../utils/entur_types";
import "./index.css";

export default function BusTable(props: {
  departures: EstimatedCallType[];
  departureFetchTime: Date;
}) {
  return (
    <div className="bus-table">
      <div className="bus-table-header-container">
        <div className="bus-table-header-title">Solsiden</div>
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
        <tbody>
          {props.departures.map((departure, index) => {
            const departureTime = time_utils.departure_time_to_string(departure.expectedArrivalTime, departure.aimedArrivalTime);
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
    </div>
  );
}
