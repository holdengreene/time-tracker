import { Title } from "@solidjs/meta";
import { createAsync, query } from "@solidjs/router";
import { For } from "solid-js";
import Counter from "~/components/Counter";

const getProjects = query(async () => {
    'use server';

    const res = await fetch("http://localhost:3000/projects.json");
    return await res.json();
}, "projects");

export const route = {
    preoload: () => getProjects(),
};

export default function Home() {
    const projects = createAsync(() => getProjects());

    return (
        <main>
            <Title>Hello World</Title>
            <h1>Hello world!</h1>
            <Counter />
            <For each={projects()}>
                {project => (
                    <div>
                        <h2>{project.name}</h2>
                        <p>{project.start} - {project.end}</p>
                    </div>
                )}
            </For>
            <p>
                Visit{" "}
                <a href="https://start.solidjs.com" target="_blank">
                    start.solidjs.com
                </a>{" "}
                to learn how to build SolidStart apps.
            </p>
        </main>
    );
}
