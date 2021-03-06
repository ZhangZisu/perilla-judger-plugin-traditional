import { ILanguage } from "../interface";

const cpp14: ILanguage = {
    compile: {
        executable: "/usr/bin/env",
        memoryLimit: 512 * 1024,
        timeLimit: 3,
        processLimit: 5,
        arguments: ["g++", "main.cpp", "-o", "main", "-Wall", "-O2", "-std=c++14"],
        sourceFileName: "main.cpp",
        distFileName: "main",
    },
    run: {
        executable: "main",
        filename: "main",
        arguments: [],
        processLimit: 1,
    },
};

module.exports = cpp14;
