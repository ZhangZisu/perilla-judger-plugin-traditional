import { ILanguage } from "../interface";

const cpp98: ILanguage = {
    compile: {
        executable: "/usr/bin/g++",
        memoryLimit: 512 * 1024,
        timeLimit: 3,
        processLimit: 5,
        arguments: ["main.cpp", "-o", "main", "-Wall", "-O2", "-std=c++98"],
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

module.exports = cpp98;
