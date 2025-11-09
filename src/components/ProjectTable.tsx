import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
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
    const projects = () => props.projects;
    let modal: HTMLDialogElement | undefined;
    let deleteProjectId: number | undefined;
    const perPageOptions = [5, 10, 20, 50];

    const [totalProjects, setTotalProjects] = createSignal<number>(projects()?.length ?? 0);
    const [filter, setFilter] = createSignal<string>("");
    const [projectsPerPage, setProjectsPerPage] = createSignal<number>(10);
    const [currentPage, setCurrentPage] = createSignal<number>(1);

    createEffect(() => setTotalProjects(projects()?.length ?? 0));

    const totalPages = createMemo<number>(() => Math.ceil(totalProjects() / projectsPerPage()));

    const pageNumbers = createMemo<number[]>(() => {
        const pages: number[] = [];
        const maxVisiblePages = 5;

        let startPage: number;
        let endPage: number;

        if (!totalPages()) {
            return pages;
        }

        if (totalPages() <= maxVisiblePages) {
            startPage = 1;
            endPage = totalProjects();
        } else if (currentPage() <= Math.ceil(maxVisiblePages / 2)) {
            startPage = 1;
            endPage = maxVisiblePages;
        } else if (
            currentPage() + Math.floor(maxVisiblePages / 2) >=
            totalPages()!
        ) {
            startPage = totalPages() - maxVisiblePages + 1;
            endPage = totalPages();
        } else {
            startPage = currentPage() - Math.floor(maxVisiblePages / 2);
            endPage = currentPage() + Math.floor(maxVisiblePages / 2);
        }

        startPage = Math.max(1, startPage);
        endPage = Math.min(totalPages(), endPage);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    });

    const filteredProjects = createMemo<Project[] | undefined>(() => {
        const filtered = projects()?.filter(project => project.name.toLowerCase().includes(filter()));

        return filtered?.slice((currentPage() - 1) * projectsPerPage(), currentPage() * projectsPerPage());
    });

    function showModal(projectId: number) {
        modal?.showModal();
        deleteProjectId = projectId;
    }

    function deleteProj() {
        deleteProjectAction(deleteProjectId ?? 0);
        modal?.close();
    }

    const Pagination = () => <div class="pagination">
        <div class="pagination-meta">
            <p>Total Projects: {totalProjects()}</p>
            <p>Page {currentPage()} of {totalPages()}</p>

            <label for="per-page">Projects Per Page:</label>
            <select id="per-page" value={projectsPerPage()} onChange={e => setProjectsPerPage(Number(e.target.value))}>
                <For each={perPageOptions}>
                    {option => (
                        <option value={option} selected={option === projectsPerPage()}>{option}</option>
                    )}
                </For>
            </select>

            <label for="search">Search:</label>
            <input id="search" type="search" value={filter()} onInput={e => setFilter(e.target.value)} />
        </div>

        <div class="pagination-controls">
            <button classList={{ secondary: true, disabled: currentPage() === 1, pageLink: true }} onClick={() => currentPage() > 1 && setCurrentPage(currentPage() - 1)}>Prev</button>
            <ul class="page-links-list">
                <Show when={currentPage() - 2 > 1}>
                    <li class="page-link"><button class="secondary" onClick={() => setCurrentPage(1)}>First</button></li>
                </Show>
                <For each={pageNumbers()}>
                    {page => (
                        <li class="page-link">
                            <button classList={{ secondary: true, active: currentPage() === page }} onClick={() => setCurrentPage(page)}>{page}</button>
                        </li>
                    )}
                </For>
                <Show when={currentPage() + 2 < totalPages()}>
                    <li class="page-link"><button class="secondary" onClick={() => setCurrentPage(totalPages())}>Last</button></li>
                </Show>
            </ul>
            <button classList={{ secondary: true, disabled: currentPage() === totalPages(), pageLink: true }} onClick={() => currentPage() < totalPages() && setCurrentPage(currentPage() + 1)}>Next</button>
        </div>
    </div>;

    return (
        <div class="card">
            <h2>Projects</h2>

            <Pagination />
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
                    <For each={filteredProjects()}>
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
                <h2>Delete Project</h2>
                <p>Are you sure you want to delete this project?</p>

                <div class="delete-flex">
                    <button class="danger" onClick={() => deleteProj()}>Yes Delete</button>
                    <button class="secondary" onClick={() => modal?.close()}>No I'm a coward</button>
                </div>
            </dialog>
        </div>

    );
}
