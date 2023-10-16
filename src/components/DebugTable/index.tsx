import {EstimatedCallType} from "../../utils/entur_types.ts";
import "./index.css";

export default function BusTable(props: {
    departures: EstimatedCallType[];
    departureFetchTime: Date;
}) {
    return <>
        <h1 style={{color: "white"}}>Data fetched at {props.departureFetchTime.toLocaleTimeString()}</h1>
        <table className="debug-table">
        <thead>
            <tr>
                <th>Rute</th>
                <th>Sekunder</th>
                <th>Minutter</th>
                <th>Tid</th>
            </tr>
        </thead>
        <tbody>
            {props
                .departures
                .map((departure, index) => {
                    const departureTime = departure.expectedArrivalTime;

                    return <tr key={index} className={"debug-line " + (departureTime === "Nå" ? "debug-line-now" : "")}>
                        <td>
                            {departure.serviceJourney?.journeyPattern?.line?.publicCode ?? "N/A"}
                        </td>
                        <td>
                            {departureTime ? Math.floor((new Date(departureTime).getTime() - props.departureFetchTime.getTime()) / 1000) : ""}
                        </td>
                        <td>
                            {departureTime ? Math.floor((new Date(departureTime).getTime() - props.departureFetchTime.getTime()) / 1000 / 60) : ""}
                        </td>
                        <td>
                            {departureTime ? new Date(departureTime).toLocaleTimeString() : ""}
                        </td>
                    </tr>;
                })}
            </tbody>
        </table>
    </>;
}
