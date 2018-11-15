const judge = require("../dist");
const { join } = require("path");

console.log("Start test...");

judge(
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