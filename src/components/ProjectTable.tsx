import { AccessorWithLatest } from "@solidjs/router";
import { For } from "solid-js";
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
                    <th>Start</th>
                    <th>End</th>
                </tr>
            </thead>
            <tbody>
                <For each={props.projects()}>
                    {project => (
                        <tr>
                            <td>{project.name}</td>
                            <td>{project.start}</td>
                            <td>{project.end}</td>
                        </tr>
                    )}
                </For>
            </tbody>
        </table>
    );
}
