import { ILanguage } from "../interface";

const python3: ILanguage = {
    compile: {
        executable: "/usr/bin/env",
        memoryLimit: 512 * 1024,
        timeLimit: 3,
        processLimit: 1,
        arguments: ["echo", "Python3 does not need to be compiled"],
        sourceFileName: "main.py",
        distFileName: "main.py",
    },
    run: {
        executable: "/usr/bin/env",
        filename: "main.py",
        arguments: ["python3", "main.py"],
        processLimit: 5,
    },
};

module.exports = python3;
