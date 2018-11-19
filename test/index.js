const judge = require("../dist");
const { join } = require("path");

(async () => {
    console.log("Start test 1");

    await judge(
        {
            subtasks: [
                {
                    name: "default",
                    timeLimit: 1000,
                    memoryLimit: 512 * 1024 * 1024,
                    score: 100,
                    runcases: [{ input: 1, output: 2 }],
                    dependency: []
                }
            ]
        },
        {
            file: 3,
            language: "cpp11"
        },
        (id) => ({
            path: join(__dirname, "" + id),
            info: {}
        }),
        (solution) => console.log(solution)
    );

    console.log("Start test 2");

    await judge(
        {
            subtasks: [
                {
                    name: "default",
                    timeLimit: 1000,
                    memoryLimit: 512 * 1024 * 1024,
                    score: 100,
                    runcases: [{ input: 1, output: 2 }],
                    dependency: []
                }
            ]
        },
        {
            file: 4,
            language: "cpp98"
        },
        (id) => ({
            path: join(__dirname, "" + id),
            info: {}
        }),
        (solution) => console.log(solution)
    );

    console.log("Start test 3");

    await judge(
        {
            subtasks: [
                {
                    name: "default",
                    timeLimit: 1000,
                    memoryLimit: 512 * 1024 * 1024,
                    score: 100,
                    runcases: [{ input: 1, output: 2 }],
                    dependency: []
                }
            ]
        },
        {
            file: 5,
            language: "node"
        },
        (id) => ({
            path: join(__dirname, "" + id),
            info: {}
        }),
        (solution) => console.log(solution)
    );
})();
