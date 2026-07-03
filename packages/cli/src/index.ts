#!/usr/bin/env bun
import { program } from "commander";
import { diffCommand } from "./commands/diff.js";
import { generateCommand } from "./commands/generate.js";
import { inspectCommand } from "./commands/inspect.js";
import { modifyCommand } from "./commands/modify.js";

program
  .name("rt4k-mod")
  .description("Batch modify RetroTINK-4K .rt4 profiles")
  .version("0.1.0");

program.addCommand(generateCommand);
program.addCommand(inspectCommand);
program.addCommand(modifyCommand);
program.addCommand(diffCommand);

program.parse(process.argv);
