import { ILanguage } from "../interface";

const python3: ILanguage = {
    compile: {
        executable: "/usr/bin/echo",
        memoryLimit: 512 * 1024,
        timeLimit: 3,
        processLimit: 1,
        arguments: ["Python2 does not need to be compiled"],
        sourceFileName: "main.py",
        distFileName: "main.py",
    },
    run: {
        executable: "/usr/bin/python3",
        filename: "main.py",
        arguments: ["main.py"],
        processLimit: 5,
    },
};

module.exports = python3;
