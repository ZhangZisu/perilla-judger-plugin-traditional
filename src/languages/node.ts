import { ILanguage } from "../interface";

const node: ILanguage = {
    compile: {
        executable: "/usr/bin/echo",
        memoryLimit: 512 * 1024,
        timeLimit: 3,
        processLimit: 1,
        arguments: ["Node.js does not need to be compiled"],
        sourceFileName: "main.js",
        distFileName: "main.js",
    },
    run: {
        executable: "/usr/bin/node",
        filename: "main.js",
        arguments: ["main.js"],
        processLimit: 64,
    },
};

module.exports = node;
