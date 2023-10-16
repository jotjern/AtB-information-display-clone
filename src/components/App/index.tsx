import "./App.css";
import { getDeparturesForQuay } from "../../utils/entur";
import { useQuery } from "react-query";
import BusTable from "../BusTable";
import DebugTable from "../DebugTable";
import { FiWifiOff } from "react-icons/fi";
import {useState} from "react";

export default function App(props: { quayId: string }) {
  const query = useQuery(
    "bus-routes",
    async () => {
      return {
        departures: await getDeparturesForQuay(props.quayId),
        departureFetchTime: new Date(),
      };
    },
    {
      refetchInterval: 1_000,
      refetchIntervalInBackground: true,
      staleTime: 10_000,
      retryDelay: 10_000,
      retry: 1_000_000,
    },
  );

  const [debug, _] = useState(new URLSearchParams(window.location.search).get("debug") === "true");

  return (
    <div className="App">
      {query.isStale ||
      query.data === undefined ||
        !query.data.departures ?
        <div className="offline-container">
          <FiWifiOff color="white" size="50vw" className="offline-icon" />
        </div>
       : ( debug ?
                  <DebugTable
                    departures={query.data.departures}
                    departureFetchTime={query.data.departureFetchTime}
                    />
                :
        <BusTable
          departures={query.data.departures}
          departureFetchTime={query.data.departureFetchTime}
        />
        )}
    </div>
  );
}
