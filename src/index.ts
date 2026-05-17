#!/usr/bin/env bun
import { program } from "commander";
import { modifyCommand } from "./commands/modify.js";
import { inspectCommand } from "./commands/inspect.js";

program
  .name("rt4k-mod")
  .description("Batch modify RetroTINK-4K .rt4 profiles")
  .version("0.1.0");

program.addCommand(modifyCommand);
program.addCommand(inspectCommand);

program.parse(process.argv);
