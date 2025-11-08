import { action } from "@solidjs/router";
import { db } from "~/db";
import { projectTable } from "~/db/schema";

const addProject = action(async (formData: FormData) => {
    'use server';

    console.log(formData);

    const name = formData.get("name") as string;

    console.log(name);
    const test = await db.insert(projectTable).values({ name });
    console.log(test);
});

export default function CreateProject() {
    let form: HTMLFormElement | undefined;

    return (
        <form action={addProject} method="post" ref={form}>
            <label for="name">
                Name:
            </label>
            <input id="name" name="name" type="text" required />
            <button type="submit">Start</button>
        </form>
    );
}
