import { For, Show } from "solid-js";
import { activeProjectId, setActiveProjectId, setActiveProjectName } from "~/lib/global";
import { friendlyTime } from "~/lib/util";
import type { Project } from "~/types";
import "./ProjectTable.css";
import { action, useAction } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { projectTable } from "~/db/schema";

const deleteProject = action(async (projectId: number) => {
    'use server';

    await db.delete(projectTable).where(eq(projectTable.id, projectId));
});

type Props = {
    projects: Project[] | undefined;
};

export default function ProjectTable(props: Props) {
    const deleteProjectAction = useAction(deleteProject);
    let modal: HTMLDialogElement | undefined;
    let deleteProjectId: number | undefined;

    function showModal(projectId: number) {
        modal?.showModal();
        deleteProjectId = projectId;
    }

    function deleteProj() {
        deleteProjectAction(deleteProjectId ?? 0);
        modal?.close();
    }

    return (
        <div class="card">
            <h2>Projects</h2>
            <table class="projects-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Total Time</th>
                        <Show when={!activeProjectId()}>
                            <th></th>
                            <th></th>
                        </Show>
                    </tr>
                </thead>
                <tbody>
                    <For each={props.projects}>
                        {project => (
                            <tr>
                                <td>{project.name}</td>
                                <Show when={project.end}>
                                    <td>{friendlyTime(project.totalTime)}</td>
                                </Show>
                                <Show when={project.end && !activeProjectId()}>
                                    <td>
                                        <button class="small" onClick={() => setActiveProjectId(project.id) && setActiveProjectName(project.name)}>Start</button>
                                    </td>
                                    <td>
                                        <button class="small danger" onClick={() => showModal(project.id)}>Delete</button>
                                    </td>
                                </Show>
                            </tr>
                        )}
                    </For>
                </tbody>
            </table>

            <dialog ref={modal} class="delete-project-dialog">
                <p>Are you sure you want to delete this project?</p>

                <div class="delete-flex">
                    <button class="danger" onClick={() => deleteProj()}>Yes Delete</button>
                    <button onClick={() => modal?.close()}>No I'm a coward</button>
                </div>
            </dialog>
        </div>

    );
}
