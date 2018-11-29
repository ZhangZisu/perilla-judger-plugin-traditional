"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const python2 = {
    compile: {
        executable: "/usr/bin/env",
        memoryLimit: 512 * 1024,
        timeLimit: 3,
        processLimit: 1,
        arguments: ["echo", "Python2 does not need to be compiled"],
        sourceFileName: "main.py",
        distFileName: "main.py",
    },
    run: {
        executable: "/usr/bin/env",
        filename: "main.py",
        arguments: ["python2", "main.py"],
        processLimit: 5,
    },
};
module.exports = python2;
//# sourceMappingURL=python2.js.map