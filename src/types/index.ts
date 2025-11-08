import { TIMER_STATUS } from "./constants";

export type Project = {
    id: number;
    name: string;
    start: number;
    end: number | null;
    totalTime: number;
    status: TimerStatus;
};

export type TimerStatus = (typeof TIMER_STATUS)[keyof typeof TIMER_STATUS];
