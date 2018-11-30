import { ILanguage } from "../interface";

const java: ILanguage = {
    compile: {
        executable: "/usr/bin/env",
        memoryLimit: 1024 * 1024,
        timeLimit: 3,
        processLimit: 32,
        arguments: ["javac", "Main.java"],
        sourceFileName: "Main.java",
        distFileName: "Main.class",
    },
    run: {
        executable: "/usr/bin/env",
        filename: "Main.class",
        arguments: ["java", "Main"],
        processLimit: 32,
    },
};

module.exports = java;
