import "../BusRoute/BusRouteRow.css";
import "./BusRouteHeader.css";

export default function BusRouteHeader() {
    return <>
        <tr className="bus-route bus-route-header">
            <th className="bus-route-line">Linje</th>
            <th className="bus-route-destination">Til</th>
            <th className="bus-route-departure">Avgang</th>
        </tr>
        <tr>
            <td colSpan={3}>
                <hr className="bus-route-divider"/>
            </td>
        </tr>
    </>
}