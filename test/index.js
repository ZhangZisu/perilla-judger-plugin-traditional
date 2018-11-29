const judge = require("../dist");
const { join } = require("path");

const commonTest = async () => {
    const problem = {
        subtasks: [
            {
                name: "default",
                timeLimit: 1000,
                memoryLimit: 512 * 1024,
                score: 100,
                runcases: [{ input: 1, output: 2 }],
                dependency: []
            }
        ]
    };

    const getFile = (id) => ({ path: join(__dirname, "" + id), info: {} });

    console.log("Start test cpp11 AC");
    await judge(problem, { file: 3, language: "cpp11" }, getFile, (solution) => console.log(solution));

    console.log("Start test cpp98 CE");
    await judge(problem, { file: 4, language: "cpp98" }, getFile, (solution) => console.log(solution));

    console.log("Start test nodejs AC");
    await judge(problem, { file: 5, language: "node" }, getFile, (solution) => console.log(solution));

    console.log("Start test python2 AC");
    await judge(problem, { file: 6, language: "python2" }, getFile, (solution) => console.log(solution));

    console.log("Start test python3 RE");
    await judge(problem, { file: 6, language: "python3" }, getFile, (solution) => console.log(solution));
    process.exit(0);
};

commonTest();