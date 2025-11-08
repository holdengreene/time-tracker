import { AccessorWithLatest } from "@solidjs/router";
import { For, Show } from "solid-js";
import { friendlyTime } from "~/lib/util";
import type { Project } from "~/types";

type Props = {
    projects: AccessorWithLatest<Project[] | undefined>;
};

export default function ProjectTable(props: Props) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Total Time</th>
                </tr>
            </thead>
            <tbody>
                <For each={props.projects()}>
                    {project => (
                        <tr>
                            <td>{project.name}</td>
                            <Show when={project.end}>
                                <td>{friendlyTime(+project.end! - +project.start)}</td>
                            </Show>
                        </tr>
                    )}
                </For>
            </tbody>
        </table>
    );
}
