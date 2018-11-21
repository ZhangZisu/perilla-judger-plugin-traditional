"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cpp11 = {
    compile: {
        executable: "/usr/bin/g++",
        memoryLimit: 512 * 1024,
        timeLimit: 3,
        processLimit: 5,
        arguments: ["main.cpp", "-o", "main", "-Wall", "-O2", "-std=c++11"],
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
module.exports = cpp11;
//# sourceMappingURL=cpp11.js.map