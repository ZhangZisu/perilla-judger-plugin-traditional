import { ILanguage } from "../interface";

const node: ILanguage = {
    compile: {
        executable: "/usr/bin/env",
        memoryLimit: 512 * 1024,
        timeLimit: 3,
        processLimit: 1,
        arguments: ["echo", "Node.js does not need to be compiled"],
        sourceFileName: "main.js",
        distFileName: "main.js",
    },
    run: {
        executable: "/usr/bin/env",
        filename: "main.js",
        arguments: ["node", "main.js"],
        processLimit: 64,
    },
};

module.exports = node;
