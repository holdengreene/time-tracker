export function friendlyTime(ms: number): string {
    if (isNaN(ms) || ms < 0) {
        return "Invalid input";
    }

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;
    const remainingHours = hours % 24;

    return `${pad(remainingHours)}:${pad(remainingMinutes)}:${pad(remainingSeconds)}`;
}

function pad(num: number): string {
    return String(num).padStart(2, "0");
}
