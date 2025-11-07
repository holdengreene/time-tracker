import { Title } from "@solidjs/meta";
import { createAsync, query } from "@solidjs/router";
import CreateProject from "~/components/CreateProject";
import ProjectTable from "~/components/ProjectTable";
import type { Project } from "~/types";

const getProjects = query(async () => {
    'use server';

    const res = await fetch("http://localhost:3000/projects.json");
    return (await res.json()) as Project[];
}, "projects");

export const route = {
    preoload: () => getProjects(),
};

export default function Home() {
    const projects = createAsync(() => getProjects());

    return (
        <main>
            <Title>Time Tracker</Title>
            <h1>Time Tracker</h1>

            <CreateProject />

            <ProjectTable projects={projects} />
        </main>
    );
}
