import { ILanguage } from "../interface";

const c: ILanguage = {
    compile: {
        executable: "/usr/bin/gcc",
        memoryLimit: 512 * 1024,
        timeLimit: 3,
        processLimit: 5,
        arguments: ["main.c", "-o", "main", "-Wall", "-O2"],
        sourceFileName: "main.c",
        distFileName: "main",
    },
    run: {
        executable: "main",
        filename: "main",
        arguments: [],
        processLimit: 1,
    },
};

module.exports = c;
