import { action, query, useAction, useSubmission } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { createEffect, createSignal, Match, onCleanup, Switch } from "solid-js";
import { db } from "~/db";
import { projectTable } from "~/db/schema";
import { activeProjectId, setActiveProjectId } from "~/lib/global";
import { friendlyTime } from "~/lib/util";


let interval: NodeJS.Timeout;
const [running, setRunning] = createSignal<boolean>(false);
const [timer, setTimer] = createSignal<number | null>(null);

const addProject = action(async (formData: FormData) => {
    'use server';

    const name = formData.get("name") as string;
    const start = new Date().getTime();

    const [project] = await db.insert(projectTable).values({ name, start: start.toString() }).returning({ id: projectTable.id });

    return { success: true, start, id: project.id };
});

const stopProject = action(async (projectId: number, start: number) => {
    'use server';

    const end = new Date().getTime();
    let totalTime = end - start;

    const existingTotalTime = await getProjectTotalTime(projectId);

    totalTime = existingTotalTime + totalTime;

    await db.update(projectTable).set({ start: start.toString(), end: end.toString(), totalTime }).where(eq(projectTable.id, projectId));
});

const getProjectTotalTime = query(async (projectId: number) => {
    'use server';

    const project = await db.query.projectTable.findFirst({ where: eq(projectTable.id, projectId) });

    return project?.totalTime ?? 0;
}, "projectStart");

export default function CreateProject() {
    let form: HTMLFormElement | undefined;
    let start: number | undefined;

    const submission = useSubmission(addProject);

    createEffect(() => {
        if (!submission.pending && submission.result?.success) {
            if (!submission.result?.start) {
                throw new Error("Submission time is null");
            }

            if (!submission.result?.id) {
                throw new Error("Project id is null");
            }

            start = submission.result?.start;
            setActiveProjectId(submission.result?.id);

            form?.reset();
            submission.clear();
        }
    });

    createEffect(async () => {
        if (activeProjectId()) {
            let totalTime = 0;
            if (!start) {
                start = new Date().getTime();
                totalTime = await getProjectTotalTime(activeProjectId()!)
            }

            startTimer(start, totalTime);
        }
    });

    const stopProjectAction = useAction(stopProject)

    function startTimer(startTime: number, totalTime: number = 0) {
        setRunning(true);

        interval = setInterval(() => {
            setTimer(t => t = new Date().getTime() - startTime + totalTime!);
        }, 1000 / 60);
    }

    function stopTimer() {
        clearInterval(interval);
        setRunning(false);
        setTimer(null);

        stopProjectAction(activeProjectId() ?? 0, start ?? 0);
        setActiveProjectId(undefined);
        start = undefined;
    }

    onCleanup(() => stopTimer());

    return (
        <Switch>
            <Match when={running()}>
                <p>Project created!</p>
                <p>Time: {friendlyTime(timer() ?? 0)}</p>

                <button onClick={stopTimer}>Stop</button>
            </Match>
            <Match when={!running()}>
                <form action={addProject} method="post" ref={form}>
                    <label for="name">
                        Name:
                    </label>
                    <input id="name" name="name" type="text" required />
                    <button type="submit">Start</button>
                </form>
            </Match>
        </Switch>
    );
}
