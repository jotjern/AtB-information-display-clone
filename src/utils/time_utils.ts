export function time_string(date: Date): string {
    return date.toLocaleTimeString('nb-NO', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function departure_time_to_string(departure_time: Date) {
    const minutes_until_departure = Math.floor((departure_time.getTime() - Date.now()) / 60000);

    if (minutes_until_departure <= 0) {
        return "Nå";
    } else if (minutes_until_departure < 10) {
        return `${minutes_until_departure} min`;
    } else {
        return time_string(departure_time);
    }
}