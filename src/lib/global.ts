import { createSignal } from "solid-js";

export const [activeProjectId, setActiveProjectId] = createSignal<
    number | undefined
>(undefined);

export const [activeProjectName, setActiveProjectName] = createSignal<
    string | undefined
>(undefined);
