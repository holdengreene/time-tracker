import { action } from "@solidjs/router";

const addProject = action(async (formData: FormData) => {
    'use server';

    console.log(formData);

    const name = formData.get("name") as string;
    const start = formData.get("start") as string;
    const end = formData.get("end") as string;

    console.log(name, start, end);
});

export default function CreateProject() {
    return (
        <form action={addProject} method="post" novalidate>
            <label>
                Name:
                <input name="name" type="text" />
            </label>
            <label>
                Start:
                <input type="datetime-local" name="start" />
            </label>
            <label>
                End:
                <input type="datetime-local" name="end" />
            </label>
            <button type="submit">Create</button>
        </form>
    );
}
