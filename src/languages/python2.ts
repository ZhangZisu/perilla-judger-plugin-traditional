import { ILanguage } from "../interface";

const python2: ILanguage = {
    compile: {
        executable: "/bin/echo",
        memoryLimit: 512 * 1024 * 1024,
        timeLimit: 10000,
        processLimit: -1,
        parameters: ["/bin/echo", "Python2 does not need to be compiled"],
        sourceFileName: "main.py",
        distFileName: "main.py",
    },
    run: {
        executable: "/usr/bin/python2",
        filename: "main.py",
        parameters: [],
        processLimit: 5,
    },
};

module.exports = python2;
