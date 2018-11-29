"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const python2 = {
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
        executable: "/usr/bin/python2",
        filename: "main.py",
        arguments: ["main.py"],
        processLimit: 5,
    },
};
module.exports = python2;
//# sourceMappingURL=python2.js.map