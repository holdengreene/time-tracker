import { action, useAction, useSubmission } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { createEffect, createSignal, Match, Switch } from "solid-js";
import { db } from "~/db";
import { projectTable } from "~/db/schema";
import { friendlyTime } from "~/lib/util";

const addProject = action(async (formData: FormData) => {
    'use server';

    const name = formData.get("name") as string;
    const start = new Date();

    const [project] = await db.insert(projectTable).values({ name, start: start.getTime().toString() }).returning({ id: projectTable.id });

    return { success: true, start, id: project.id };
});

const stopProject = action(async (projectId: number) => {
    'use server';

    await db.update(projectTable).set({ end: new Date().getTime().toString() }).where(eq(projectTable.id, projectId));
});

export default function CreateProject() {
    let form: HTMLFormElement | undefined;
    let interval: NodeJS.Timeout;
    let projectId: number | undefined;
    const submission = useSubmission(addProject);

    const [running, setRunning] = createSignal<boolean>(false);
    const [timer, setTimer] = createSignal<number | null>(null);

    createEffect(() => {
        if (!submission.pending && submission.result?.success) {
            form?.reset();
            setRunning(true);
            const submissionTime = submission.result?.start.getTime();

            if (!submissionTime) {
                throw new Error("Submission time is null");
            }

            projectId = submission.result?.id;

            interval = setInterval(() => {
                setTimer(t => t = new Date().getTime() - submissionTime);
            }, 1000 / 60);

            submission.clear();
        }
    });

    const stopProjectAction = useAction(stopProject)

    function stopTimer() {
        clearInterval(interval);
        setRunning(false);
        setTimer(null);

        stopProjectAction(projectId ?? 0);
        projectId = undefined;
    }

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
