import { ILanguage } from "../interface";

const node: ILanguage = {
    compile: {
        executable: "/bin/echo",
        memoryLimit: 512 * 1024 * 1024,
        timeLimit: 10000,
        processLimit: -1,
        parameters: ["/bin/echo", "Node.js does not need to be compiled"],
        sourceFileName: "main.js",
        distFileName: "main.js",
    },
    run: {
        executable: "/usr/bin/node",
        filename: "main.js",
        parameters: [],
        processLimit: 5,
    },
};

module.exports = node;
