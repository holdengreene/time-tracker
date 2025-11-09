import { Title } from "@solidjs/meta";
import { createAsync, query } from "@solidjs/router";
import { desc, eq, isNotNull } from "drizzle-orm";
import CreateProject from "~/components/CreateProject";
import ProjectTable from "~/components/ProjectTable";
import { db } from "~/db";
import { projectTable } from "~/db/schema";
import { TIMER_STATUS } from "~/types/constants";

const getProjects = query(async () => {
    'use server';

    const projectsPromise = db.select().from(projectTable).orderBy(desc(projectTable.end)).where(isNotNull(projectTable.end));
    const runningProjectPromise = db.query.projectTable.findFirst({ where: eq(projectTable.status, TIMER_STATUS.RUNNING) });

    const [allProjects, runningProject] = await Promise.all([projectsPromise, runningProjectPromise]);

    return { allProjects, runningProject };
}, "projects");

export const route = {
    preload: () => getProjects(),
};

export default function Home() {
    const projects = createAsync(() => getProjects());
    return (
        <main class="container">
            <Title>Time Tracker</Title>
            <h1 class="center-text site-title">Time Tracker</h1>

            <div class="overview-grid">

                <CreateProject runningProject={projects()?.runningProject} />

                <ProjectTable projects={projects()?.allProjects} />
            </div>
        </main>
    );
}
