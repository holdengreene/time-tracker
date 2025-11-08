export function friendlyTime(ms: number): string {
    if (isNaN(ms) || ms < 0) {
        return "Invalid input";
    }

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;
    const remainingHours = hours % 24;

    let friendlyTime = [];

    if (days > 0) {
        friendlyTime.push(`${days} day${days > 1 ? "s" : ""}`);
    }
    if (remainingHours > 0) {
        friendlyTime.push(
            `${remainingHours} hour${remainingHours > 1 ? "s" : ""}`,
        );
    }
    if (remainingMinutes > 0) {
        friendlyTime.push(
            `${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`,
        );
    }
    if (remainingSeconds > 0 || friendlyTime.length === 0) {
        // Include seconds if there's no other unit, or if seconds are present
        friendlyTime.push(
            `${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""}`,
        );
    }

    return friendlyTime.join(", ");
}
