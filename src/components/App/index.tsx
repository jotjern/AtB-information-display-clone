import "./App.css";
import { getDeparturesForQuay } from "../../utils/entur";
import { getCookie, setCookie } from "../../utils/cookies";
import { useQuery } from "@tanstack/react-query";
import BusTable from "../BusTable";
import DebugTable from "../DebugTable";
import StopPicker from "../StopPicker";
import { FiWifiOff } from "react-icons/fi";
import {useState} from "react";

const QUAY_COOKIE = "quayId";
const OFFLINE_AFTER_MS = 90_000;
const RETRY_DELAY_MS = 1_000;

function getSavedQuayId(): string | null {
  const quayId = getCookie(QUAY_COOKIE);
  return quayId && /^NSR:Quay:\d+$/.test(quayId) ? quayId : null;
}

export default function App(props: { defaultQuayId: string }) {
  const [quayId, setQuayId] = useState(() => getSavedQuayId() ?? props.defaultQuayId);
  const [pickerOpen, setPickerOpen] = useState(false);

  const query = useQuery({
    queryKey: ["bus-routes", quayId],
    queryFn: async () => {
      const quay = await getDeparturesForQuay(quayId);
      if (!quay) {
        throw new Error(`No departure data for ${quayId}`);
      }
      return {
        quay,
        departureFetchTime: new Date(),
      };
    },
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
    staleTime: OFFLINE_AFTER_MS,
    retryDelay: RETRY_DELAY_MS,
    retry: OFFLINE_AFTER_MS / RETRY_DELAY_MS,
    refetchOnReconnect: true
  });

  const [debug] = useState(new URLSearchParams(window.location.search).get("debug") === "true");

  const selectQuay = (newQuayId: string) => {
    setCookie(QUAY_COOKIE, newQuayId);
    setQuayId(newQuayId);
    setPickerOpen(false);
  };

  const offline = query.isError || (query.data !== undefined && query.isStale);

  if (pickerOpen) {
    return <StopPicker onSelect={selectQuay} onClose={() => setPickerOpen(false)} />;
  }

  return (
    <div className="App">
      {offline ?
        <div className="offline-container">
          <FiWifiOff color="white" size="50vw" className="offline-icon" />
        </div>
       : query.data === undefined ? null
       : ( debug ?
                  <DebugTable
                    departures={query.data.quay.departures}
                    departureFetchTime={query.data.departureFetchTime}
                    />
                :
        <BusTable
          stopName={query.data.quay.name}
          platform={query.data.quay.publicCode}
          departures={query.data.quay.departures}
          departureFetchTime={query.data.departureFetchTime}
          onTitleClick={() => setPickerOpen(true)}
        />
        )}
    </div>
  );
}
