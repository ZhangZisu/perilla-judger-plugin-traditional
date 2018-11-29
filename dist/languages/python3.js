"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const python3 = {
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
//# sourceMappingURL=python3.js.map