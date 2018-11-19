import { ILanguage } from "../interface";

const cpp98: ILanguage = {
    compile: {
        executable: "/usr/bin/g++",
        memoryLimit: 512 * 1024 * 1024,
        timeLimit: 10000,
        processLimit: -1,
        parameters: ["/usr/bin/g++", "main.cpp", "-o", "main", "-Wall", "-O2", "-std=c++98"],
        sourceFileName: "main.cpp",
        distFileName: "main",
    },
    run: {
        executable: "main",
        filename: "main",
        parameters: [],
        processLimit: 1,
    },
};

module.exports = cpp98;
