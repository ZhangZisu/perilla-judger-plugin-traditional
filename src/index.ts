import { closeSync, copyFileSync, emptyDirSync, ensureDirSync, openSync, readSync } from "fs-extra";
import { join } from "path";
import { Static } from "runtypes";
import { SandboxResult, SandboxStatus } from "simple-sandbox/lib/interfaces";
import { compile } from "./compile";
import { tmpDir } from "./constants";
import { IRunCaseResult, ISolution, ISubtaskResult, JudgeFunction, Problem, Solution, SolutionResult, Subtask } from "./interface";
import { run } from "./run";
import { convertStatus, shortRead } from "./utils";

const mainDir = join(tmpDir, "main");
ensureDirSync(mainDir);

type IWrappedRun = (stdin: string, extraFiles: Array<{ src: string, dst: string }>, timeLimit: number, memoryLimit: number) => Promise<{ stdout: string, result: SandboxResult }>;

const MAX_SPJ_OUTPUT_SIZE = 256;

const main: JudgeFunction = async (problem, solution, resolveFile, cb) => {
    if (Problem.guard(problem)) {
        if (Solution.guard(solution)) {
            emptyDirSync(mainDir);
            let runSolution: IWrappedRun = null;
            let runJudger: IWrappedRun = null;
            let solutionFile: string = null;
            // Compile solution
            try {
                const solutionSource = await resolveFile(solution.file);
                solutionFile = solutionSource.path;
                const solutionExecTmpFile = await compile(solutionSource.path, solution.language);
                const solutionExecFile = join(mainDir, "solution");
                copyFileSync(solutionExecTmpFile, solutionExecFile);
                runSolution = async (stdin, extraFiles, timeLimit, memoryLimit) => {
                    return run(solutionExecFile, solution.language, stdin, extraFiles, timeLimit, memoryLimit);
                };
            } catch (e) {
                // Compile Error
                return await cb({ status: SolutionResult.CompileError, score: 0, details: { error: e.message } });
            }
            // Compile Judger
            try {
                if (problem.spj) {
                    const judgerSource = await resolveFile(problem.spj.file);
                    const judgerExecTmpFile = await compile(judgerSource.path, problem.spj.language);
                    const judgerExecFile = join(mainDir, "judger");
                    copyFileSync(judgerExecTmpFile, judgerExecFile);
                    runJudger = async (stdin, extraFiles, timeLimit, memoryLimit) => {
                        return run(judgerExecFile, problem.spj.language, stdin, extraFiles, timeLimit, memoryLimit);
                    };
                } else {
                    const judgerExecTmpFile = await compile(join(__dirname, "..", "resources", "compare.cpp"), "cpp11");
                    const judgerExecFile = join(mainDir, "judger");
                    copyFileSync(judgerExecTmpFile, judgerExecFile);
                    runJudger = async (stdin, extraFiles, timeLimit, memoryLimit) => {
                        return run(judgerExecFile, "cpp11", stdin, extraFiles, timeLimit, memoryLimit);
                    };
                }
            } catch (e) {
                // Judgement Failed
                return await cb({ status: SolutionResult.JudgementFailed, score: 0, details: { error: e.message } });
            }
            // Main
            try {
                const subtasks = new Map<string, Static<typeof Subtask>>();
                const degree = new Map<string, number>();
                const queue = [];
                const order = [];
                let sum = 0;
                // Topsort
                for (const subtask of problem.subtasks) {
                    subtasks.set(subtask.name, subtask);
                    sum += subtask.score;
                    for (const dep of subtask.dependency) {
                        if (!degree.has(dep)) {
                            degree.set(dep, 1);
                        } else {
                            degree.set(dep, degree.get(dep) + 1);
                        }
                    }
                }
                if (sum !== 100) {
                    // Bad config
                    return await cb({ status: SolutionResult.JudgementFailed, score: 0, details: { error: "Sum of subtask scores is not 100!" } });
                }
                for (const [name] of subtasks) {
                    if (!degree.has(name) || !degree.get(name)) {
                        queue.push(name);
                    }
                }
                while (queue.length) {
                    const top = queue.shift();
                    order.unshift(top);
                    for (const dep of subtasks.get(top).dependency) {
                        let x = degree.get(dep);
                        if (--x <= 0) {
                            queue.push(dep);
                            degree.delete(dep);
                        } else {
                            degree.set(dep, x);
                        }
                    }
                }
                if (order.length !== problem.subtasks.length) {
                    // Topsort failed
                    return await cb({ status: SolutionResult.JudgementFailed, score: 0, details: { error: "Topological sorting failed" } });
                }
                const results = new Map<string, ISubtaskResult>();
                const judgeResult: ISolution = {
                    status: SolutionResult.WaitingJudge,
                    score: 0,
                    details: {
                        subtasks: [],
                        time: 0,
                        memory: 0,
                    },
                };
                for (const name of order) {
                    let skip = false;
                    const subtask = subtasks.get(name);
                    for (const dep of subtask.dependency) {
                        const depres = results.get(dep);
                        if (depres.status !== SolutionResult.Accepted || depres.score !== 100) {
                            skip = true;
                            break;
                        }
                    }
                    const result: ISubtaskResult = {
                        name,
                        status: SolutionResult.WaitingJudge,
                        score: 100,
                        runcases: [],
                        time: 0,
                        memory: 0,
                    };
                    if (skip) {
                        result.status = SolutionResult.Skipped;
                        result.score = 0;
                    } else {
                        for (const runcase of subtask.runcases) {
                            if (result.score === 0) { break; }
                            const input = await resolveFile(runcase.input);
                            const output = await resolveFile(runcase.output);
                            const userrun = await runSolution(input.path, [], subtask.timeLimit, subtask.memoryLimit);
                            const caseResult = {
                                status: SolutionResult.WaitingJudge,
                                score: 0,
                                input: shortRead(input.path),
                                output: "",
                                answer: shortRead(output.path),
                                time: userrun.result.time,
                                memory: userrun.result.memory,
                                log: "",
                            };
                            if (userrun.result.code !== 0 || userrun.result.status !== SandboxStatus.OK) {
                                caseResult.status = convertStatus(userrun.result.status);
                            } else {
                                const userout = join(mainDir, "userout");
                                copyFileSync(userrun.stdout, userout);
                                caseResult.output = shortRead(userout);
                                const judgerrun = await runJudger(userout, [
                                    { src: input.path, dst: "input" },
                                    { src: output.path, dst: "output" },
                                    { src: solutionFile, dst: "usercode" },
                                ], subtask.timeLimit, subtask.memoryLimit);
                                if (judgerrun.result.code !== 0 || judgerrun.result.status !== SandboxStatus.OK) {
                                    caseResult.status = SolutionResult.JudgementFailed;
                                } else {
                                    const fd = openSync(judgerrun.stdout, "r");
                                    const buf = Buffer.alloc(MAX_SPJ_OUTPUT_SIZE);
                                    readSync(fd, buf, 0, MAX_SPJ_OUTPUT_SIZE, 0);
                                    const tokens = buf.toString().split("\n");
                                    if (tokens.length < 2) {
                                        throw new Error("Invalid spj");
                                    }
                                    const status = parseInt(tokens[0], 10);
                                    if (!SolutionResult[status]) {
                                        throw new Error("Invalid spj");
                                    }
                                    const score = parseInt(tokens[1], 10);
                                    if (score < 0 || score > 100) {
                                        throw new Error("Invalid spj");
                                    }
                                    caseResult.log = tokens[2] || "SPJ didn't provide any message";
                                    caseResult.status = status;
                                    caseResult.score = score;
                                    closeSync(fd);
                                }
                            }
                            if (result.status === SolutionResult.WaitingJudge || result.status === SolutionResult.Accepted) {
                                result.status = caseResult.status;
                            }
                            result.score = Math.min(result.score, caseResult.score);
                            result.runcases.push(caseResult);
                            result.time = Math.max(result.time, caseResult.time);
                            result.memory = Math.max(result.memory, caseResult.memory);
                        }
                    }
                    if (judgeResult.status === SolutionResult.WaitingJudge || judgeResult.status === SolutionResult.Accepted) {
                        judgeResult.status = result.status;
                    }
                    judgeResult.score += result.score / 100 * subtask.score;
                    judgeResult.details.subtasks.push(result);
                    judgeResult.details.time = Math.max(judgeResult.details.time, result.time);
                    judgeResult.details.memory = Math.max(judgeResult.details.memory, result.memory);
                    results.set(result.name, result);
                    await cb(judgeResult);
                }
                return await cb(judgeResult);
            } catch (e) {
                return await cb({ status: SolutionResult.JudgementFailed, score: 0, details: { error: e.message } });
            }
        } else {
            return await cb({ status: SolutionResult.JudgementFailed, score: 0, details: { error: "Invalid solution data" } });
        }
    } else {
        return await cb({ status: SolutionResult.JudgementFailed, score: 0, details: { error: "Invalid problem data" } });
    }
};

module.exports = main;
