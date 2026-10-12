import "./App.css";
import { getDeparturesForQuay } from "../../utils/entur";
import { getCookie, setCookie } from "../../utils/cookies";
import { failureFromError, logEvent } from "../../utils/event_log";
import { useQuery } from "@tanstack/react-query";
import BusTable from "../BusTable";
import DebugTable from "../DebugTable";
import StopPicker from "../StopPicker";
import EventLog from "../EventLog";
import { FiWifiOff } from "react-icons/fi";
import {useEffect, useRef, useState} from "react";

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
  const [showLog] = useState(new URLSearchParams(window.location.search).get("log") === "true");

  const query = useQuery({
    queryKey: ["bus-routes", quayId],
    queryFn: async () => {
      const start = performance.now();
      let quay;
      try {
        quay = await getDeparturesForQuay(quayId);
      } catch (error) {
        logEvent({ type: "failure", quayId, ...failureFromError(error) }, Math.round(performance.now() - start));
        throw error;
      }
      if (!quay) {
        logEvent({ type: "failure", quayId, reason: "invalid-response" }, Math.round(performance.now() - start));
        throw new Error(`No departure data for ${quayId}`);
      }
      logEvent({ type: "success", quayId }, Math.round(performance.now() - start));
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
    refetchOnReconnect: true,
    enabled: !showLog,
  });

  const [debug] = useState(new URLSearchParams(window.location.search).get("debug") === "true");

  const selectQuay = (newQuayId: string) => {
    logEvent({ type: "stop-change", from: quayId, to: newQuayId });
    setCookie(QUAY_COOKIE, newQuayId);
    setQuayId(newQuayId);
    setPickerOpen(false);
  };

  const offline = query.isError || (query.data !== undefined && query.isStale);

  useEffect(() => {
    if (!showLog) logEvent({ type: "load", quayId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wasOffline = useRef(false);
  useEffect(() => {
    if (offline !== wasOffline.current) {
      logEvent({ type: offline ? "offline" : "online", quayId });
      wasOffline.current = offline;
    }
  }, [offline, quayId]);

  if (showLog) {
    return <EventLog />;
  }

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
