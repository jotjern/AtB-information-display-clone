import './BusTable.css';

import { useEffect, useState } from "react";
import createEnturClient from '@entur/sdk';

import BusRoute, { BusRouteProps } from '../BusRoute';
import BusRouteHeader from '../BusRouteHeader';
import HeaderInfo from '../HeaderInfo';

const minutes = 60 * 1000;

const enturClient = createEnturClient({
    clientName: "my-awesome-app",
});


export default function BusTable(props: { style: any }) {
  const [busRoutes, setBusRoutes] = useState<BusRouteProps[]>([]);

  function updateBusRoutes() {
    enturClient.getDeparturesFromQuays(["NSR:Quay:73975"]).then(departures => {
      const departure = departures[0];
      if (!departure) return;
        const bus_routes = Array.from(departure.departures).map(departure => (
          {
            departure: new Date(departure.aimedArrivalTime),
            destination: departure["destinationDisplay"]["frontText"],
            line: departure["serviceJourney"]["journeyPattern"] ? departure["serviceJourney"]["journeyPattern"]["line"]["publicCode"] : "",
          } as BusRouteProps
        ));
        setBusRoutes(bus_routes.sort((a, b) => {
          const time_diff = Math.floor((a.departure.getTime() - b.departure.getTime()) / 1000 / 60);

          if (time_diff === 0) {
            if (a.line < b.line) return -1;
            if (a.line > b.line) return 1;
            return 0;
          }

          return time_diff;
        }));
    });
  }

  useEffect(() => {
    setInterval(updateBusRoutes, 5000);
    updateBusRoutes();
  }, []);

  return (
    <div className="bus-table" style={props.style || {}}>
      <HeaderInfo/>        
      <table>
        <thead>
          <BusRouteHeader />
        </thead>
        <tbody>
          {busRoutes.map((bus_route, index) => <BusRoute key={index} {...bus_route} />)}
        </tbody>
      </table>
    </div>
  );
}
