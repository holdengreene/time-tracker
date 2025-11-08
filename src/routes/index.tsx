import { Title } from "@solidjs/meta";
import { createAsync, query } from "@solidjs/router";
import { isNotNull } from "drizzle-orm";
import CreateProject from "~/components/CreateProject";
import ProjectTable from "~/components/ProjectTable";
import { db } from "~/db";
import { projectTable } from "~/db/schema";

const getProjects = query(async () => {
    'use server';

    return await db.select().from(projectTable).where(isNotNull(projectTable.end));
}, "projects");

export const route = {
    preload: () => getProjects(),
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
