import { ILanguage } from "../interface";

const cpp11: ILanguage = {
    compile: {
        executable: "/bin/g++",
        memoryLimit: 512 * 1024 * 1024,
        timeLimit: 5 * 1000,
        processLimit: 2,
        parameters: ["main.cpp", "-o", "main", "-Wall", "-O2", "-std=c++11"],
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

export default cpp11;
