import {EstimatedCallType} from "./entur_types.ts";

export function format_string(date: Date): string {
  return date.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function departure_sorter(departure_a: EstimatedCallType, departure_b: EstimatedCallType): number {
  const departure_time_a_string = (
    departure_a.expectedArrivalTime ||
    departure_a.aimedArrivalTime
  );
    const departure_time_b_string = (
    departure_b.expectedArrivalTime ||
    departure_b.aimedArrivalTime
    );
    const departure_time_a = departure_time_a_string !== null ? new Date(departure_time_a_string) : new Date(0);
    const departure_time_b = departure_time_b_string !== null ? new Date(departure_time_b_string) : new Date(0);

    return departure_time_a.getTime() - departure_time_b.getTime();
}

export function departure_time_to_string(departure: EstimatedCallType): string {
  const exact_departure_time = departure.expectedArrivalTime;
    const aimed_departure_time = departure.aimedArrivalTime;
  if (exact_departure_time === null && aimed_departure_time === null)
    return "N/A";

  const departure_time =
    exact_departure_time !== null
      ? new Date(exact_departure_time)
      : new Date(aimed_departure_time!);
  const minutes_until_departure = Math.ceil(
    (new Date(departure_time).getTime() - Date.now()) / 60000,
  );

  if (minutes_until_departure <= 0) {
    return "Nå";
  } else if (minutes_until_departure < 10) {
    return exact_departure_time === null
      ? `ca ${minutes_until_departure} min`
      : `${minutes_until_departure} min`;
  } else {
    return exact_departure_time === null
      ? `ca ${format_string(departure_time)}`
      : format_string(departure_time);
  }
}
