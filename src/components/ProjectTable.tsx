import { For, Show } from "solid-js";
import { activeProjectId, setActiveProjectId, setActiveProjectName } from "~/lib/global";
import { friendlyTime } from "~/lib/util";
import type { Project } from "~/types";
import "./ProjectTable.css";

type Props = {
    projects: Project[] | undefined;
};

export default function ProjectTable(props: Props) {
    return (
        <div class="card">
            <h2>Projects</h2>
            <table class="projects-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Total Time</th>
                        <th></th>
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
                                <td>
                                    <Show when={project.end && !activeProjectId()}>
                                        <button class="small" onClick={() => setActiveProjectId(project.id) && setActiveProjectName(project.name)}>Start</button>
                                    </Show>
                                </td>
                            </tr>
                        )}
                    </For>
                </tbody>
            </table>
        </div>
    );
}
