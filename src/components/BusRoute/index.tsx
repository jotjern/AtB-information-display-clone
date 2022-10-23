import * as time_utils from "../../utils/time_utils"
import "./BusRouteRow.css";

export type BusRouteProps = {
    line: String;
    destination: String;
    departure: Date
}

export default function BusRoute(props: BusRouteProps) {
    const departure_string = time_utils.departure_time_to_string(props.departure);

    return <tr className={departure_string === "Nå" ? "bus-route bus-route-now" : "bus-route"}>
        <td className="bus-route-line">{props.line}</td>
        <td className="bus-route-destination">{props.destination}</td>
        <td className="bus-route-departure">{departure_string}</td>
    </tr>
}