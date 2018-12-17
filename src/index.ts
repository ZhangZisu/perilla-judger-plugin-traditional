import { closeSync, copyFileSync, emptyDirSync, ensureDirSync, openSync, readFileSync, readSync } from "fs-extra";
import { join } from "path";
import { PerillaSandbox } from "perilla-sandbox";
import { IRunResult, RunStatus } from "perilla-sandbox/dist/interface";
import { Static } from "runtypes";
import { compile } from "./compile";
import { tmpDir } from "./constants";
import { ISolution, ISubtaskResult, JudgeFunction, Problem, Solution, SolutionResult, Subtask } from "./interface";
import { run } from "./run";
import { convertStatus, shortRead } from "./utils";

const mainDir = join(tmpDir, "main");
ensureDirSync(mainDir);

type IWrappedRun = (stdin: string, extraFiles: Array<{ src: string, dst: string }>, timeLimit: number, memoryLimit: number) => { stdout: string, result: IRunResult };

const MAX_SPJ_OUTPUT_SIZE = 256;

let sandbox: PerillaSandbox = null;

const config = JSON.parse(readFileSync(join(__dirname, "..", "config.json")).toString());

const main: JudgeFunction = async (problem, solution, resolveFile, cb) => {
    if (Problem.guard(problem)) {
        if (Solution.guard(solution)) {
            if (!sandbox) {
                sandbox = new PerillaSandbox(config.isolateExecutable, config.boxID, 0, 1.1, 0, 1.1, process.env);
            }
            emptyDirSync(mainDir);
            let runSolution: IWrappedRun = null;
            let runJudger: IWrappedRun = null;
            let solutionFile: string = null;
            // Compile solution
            try {
                const solutionSource = await resolveFile(solution.file);
                solutionFile = solutionSource.path;
                const solutionExecTmpFile = compile(sandbox, solutionSource.path, solution.language);
                const solutionExecFile = join(mainDir, "solution");
                copyFileSync(solutionExecTmpFile, solutionExecFile);
                runSolution = (stdin, extraFiles, timeLimit, memoryLimit) => {
                    return run(sandbox, solutionExecFile, solution.language, stdin, extraFiles, timeLimit, memoryLimit);
                };
            } catch (e) {
                // Compile Error
                return await cb({ status: SolutionResult.CompileError, score: 0, details: { error: e.message } });
            }
            // Compile Judger
            try {
                if (problem.spj) {
                    const judgerSource = await resolveFile(problem.spj.file);
                    const judgerExecTmpFile = compile(sandbox, judgerSource.path, problem.spj.language);
                    const judgerExecFile = join(mainDir, "judger");
                    copyFileSync(judgerExecTmpFile, judgerExecFile);
                    runJudger = (stdin, extraFiles, timeLimit, memoryLimit) => {
                        return run(sandbox, judgerExecFile, problem.spj.language, stdin, extraFiles, timeLimit, memoryLimit);
                    };
                } else {
                    const judgerExecTmpFile = await compile(sandbox, join(__dirname, "..", "resources", "compare.cpp"), "cpp11");
                    const judgerExecFile = join(mainDir, "judger");
                    copyFileSync(judgerExecTmpFile, judgerExecFile);
                    runJudger = (stdin, extraFiles, timeLimit, memoryLimit) => {
                        return run(sandbox, judgerExecFile, "cpp11", stdin, extraFiles, timeLimit, memoryLimit);
                    };
                }
            } catch (e) {
                // Judgement Failed
                return await cb({ status: SolutionResult.JudgementFailed, score: 0, details: { error: e.message } });
            }

            // Main
            await cb({ status: SolutionResult.Judging, score: 0, details: {} });
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

                // It's time to start judge
                const results = new Map<string, ISubtaskResult>();
                const judgeResult: ISolution = {
                    status: SolutionResult.Judging,
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
                        status: SolutionResult.Judging,
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
                            const userrun = runSolution(input.path, [], subtask.timeLimit, subtask.memoryLimit);
                            const caseResult = {
                                status: SolutionResult.Judging,
                                score: 0,
                                input: shortRead(input.path),
                                output: "",
                                answer: shortRead(output.path),
                                time: userrun.result.time,
                                memory: userrun.result.memory,
                                log: "",
                                desc: runcase.desc,
                            };
                            if (userrun.result.status !== RunStatus.Succeeded) {
                                caseResult.status = convertStatus(userrun.result.status);
                            } else {
                                const userout = join(mainDir, "userout");
                                copyFileSync(userrun.stdout, userout);
                                caseResult.output = shortRead(userout);
                                const judgerrun = runJudger(userout, [
                                    { src: input.path, dst: "input" },
                                    { src: output.path, dst: "output" },
                                    { src: solutionFile, dst: "usercode" },
                                ], subtask.timeLimit, subtask.memoryLimit);
                                if (userrun.result.status !== RunStatus.Succeeded) {
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
                            if (result.status === SolutionResult.Judging && caseResult.status !== SolutionResult.Accepted) {
                                result.status = caseResult.status;
                            }
                            result.score = Math.min(result.score, caseResult.score);
                            result.runcases.push(caseResult);
                            result.time = Math.max(result.time, caseResult.time);
                            result.memory = Math.max(result.memory, caseResult.memory);
                        }
                    }
                    if (result.status === SolutionResult.Judging) {
                        result.status = SolutionResult.Accepted;
                    }
                    if (judgeResult.status === SolutionResult.Judging && result.status !== SolutionResult.Accepted) {
                        judgeResult.status = result.status;
                    }
                    judgeResult.score += result.score / 100 * subtask.score;
                    judgeResult.details.subtasks.push(result);
                    judgeResult.details.time = Math.max(judgeResult.details.time, result.time);
                    judgeResult.details.memory = Math.max(judgeResult.details.memory, result.memory);
                    results.set(result.name, result);
                    await cb(judgeResult);
                }
                if (judgeResult.status === SolutionResult.Judging) {
                    judgeResult.status = SolutionResult.Accepted;
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
