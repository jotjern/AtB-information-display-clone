export function format_string(date: Date): string {
  return date.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function departure_time_to_string(
  exact_departure_time: string | null,
  aimed_departure_time: string | null,
): string {
  if (exact_departure_time === null && aimed_departure_time === null)
    return "N/A";

  const departure_time =
    exact_departure_time !== null
      ? new Date(exact_departure_time)
      : new Date(aimed_departure_time!);
  const minutes_until_departure = Math.floor(
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
