import { action, query, useAction, useSubmission } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { batch, createEffect, createSignal, Match, onCleanup, onMount, Switch } from "solid-js";
import { db } from "~/db";
import { projectTable } from "~/db/schema";
import { activeProjectId, activeProjectName, setActiveProjectId, setActiveProjectName } from "~/lib/global";
import { friendlyTime } from "~/lib/util";
import { Project } from "~/types";
import { TIMER_STATUS } from "~/types/constants";
import "./CreateProject.css";

const addProject = action(async (formData: FormData) => {
    'use server';

    const name = formData.get("name") as string;
    const start = new Date().getTime();

    const [project] = await db.insert(projectTable).values({ name, start, status: TIMER_STATUS.RUNNING }).returning({ id: projectTable.id, name: projectTable.name });

    return { success: true, start, id: project.id, name: project.name };
});

const startProject = action(async (projectId: number) => {
    'use server';

    const start = new Date().getTime();

    await db.update(projectTable).set({ start, status: TIMER_STATUS.RUNNING }).where(eq(projectTable.id, projectId));
});

const stopProject = action(async (projectId: number, start: number) => {
    'use server';

    const end = new Date().getTime();
    let totalTime = end - start;

    const existingTotalTime = await getProjectTotalTime(projectId);

    totalTime = existingTotalTime + totalTime;

    await db.update(projectTable).set({ start, end, totalTime, status: TIMER_STATUS.STOPPED }).where(eq(projectTable.id, projectId));
});

const getProjectTotalTime = query(async (projectId: number) => {
    'use server';

    const project = await db.query.projectTable.findFirst({ where: eq(projectTable.id, projectId) });

    return project?.totalTime ?? 0;
}, "projectStart");

type Props = {
    runningProject: Project | undefined;
};
export default function CreateProject(props: Props) {
    let interval: NodeJS.Timeout;
    let form: HTMLFormElement | undefined;
    let start: number | undefined;
    let totalTime: number = 0;
    const [running, setRunning] = createSignal<boolean>(false);
    const [timer, setTimer] = createSignal<number | null>(null);


    onMount(() => {
        const runningProject = () => props.runningProject;

        if (runningProject()) {
            start = runningProject()?.start ?? 0;
            totalTime = runningProject()?.totalTime ?? 0;
            setActiveProjectId(runningProject()?.id);
            setActiveProjectName(runningProject()?.name);
        }

        document.addEventListener("visibilitychange", tabState);
    });

    const submission = useSubmission(addProject);
    createEffect(() => {
        if (!submission.pending && submission.result?.success) {
            if (!submission.result?.start) {
                throw new Error("Submission time is null");
            }

            if (!submission.result?.id) {
                throw new Error("Project id is null");
            }


            if (!submission.result?.name) {
                throw new Error("Project name is null");
            }

            start = submission.result?.start;
            setActiveProjectId(submission.result?.id);
            setActiveProjectName(submission.result?.name);

            form?.reset();
            submission.clear();
        }
    });

    createEffect(async () => {
        if (activeProjectId() && !running()) {
            if (!start) {
                start = new Date().getTime();
                totalTime = await getProjectTotalTime(activeProjectId()!)
            }

            startTimer(start, totalTime);
        }
    });

    const startProjectAction = useAction(startProject)

    function startTimer(startTime: number, totalTime: number = 0) {
        setRunning(true);
        startProjectAction(activeProjectId() ?? 0);

        interval = setInterval(() => {
            setTimer(t => t = new Date().getTime() - startTime + totalTime!);
        }, 1000 / 60);
    }

    const stopProjectAction = useAction(stopProject)

    function stopTimer() {
        clearInterval(interval);

        stopProjectAction(activeProjectId() ?? 0, start ?? 0);

        batch(() => {
            setActiveProjectId(undefined);
            start = undefined;
            setRunning(false);
            setTimer(null);
            totalTime = 0;
        });
    }

    function tabState() {
        if (document.visibilityState === "hidden" && interval) {
            clearInterval(interval);
        } else if (running() && !interval) {
            startTimer(start ?? 0, totalTime);
        }
    }

    onCleanup(() => stopTimer());

    return (
        <Switch>
            <Match when={running()}>
                <div class="card timer">
                    <h2><span class="tracking-text">Tracking:</span> <br /> {activeProjectName()}</h2>
                    <p class="running-timer">{friendlyTime(timer() ?? 0)}</p>

                    <button class="active" onClick={stopTimer}>Stop</button>
                </div>
            </Match>
            <Match when={!running()}>
                <div class="card">
                    <h2>Start a new project</h2>
                    <form class="project-form" action={addProject} method="post" ref={form}>
                        <div class="input-wrap">
                            <label for="name">
                                Name
                            </label>
                            <input id="name" name="name" type="text" required />
                        </div>

                        <button type="submit">Start</button>
                    </form>
                </div>
            </Match>
        </Switch>
    );
}
