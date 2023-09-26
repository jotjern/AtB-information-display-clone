import "./App.css";
import { getDeparturesForQuay } from "../../utils/entur";
import { useQuery } from "react-query";
import BusTable from "../BusTable";
import { FiWifiOff } from "react-icons/fi";

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
      refetchInterval: 2_000,
      refetchIntervalInBackground: true,
      staleTime: 10_000,
      retryDelay: 10_000,
      retry: 1_000_000,
    },
  );

  console.log(query);

  return (
    <div className="App">
      {query.isStale ||
      query.data === undefined ||
        !query.data.departures ?
        <div className="offline-container">
          <FiWifiOff color="white" size="50vw" className="offline-icon" />
        </div>
       : (
        <BusTable
          departures={query.data.departures}
          departureFetchTime={query.data.departureFetchTime}
        />
        )}
    </div>
  );
}
