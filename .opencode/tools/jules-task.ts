import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Delegate a task to Jules (Google's AI coding agent)",
  args: {
    task: tool.schema.string().describe("The task description for Jules to execute"),
    repo: tool.schema.string().optional().describe("GitHub repo in format owner/repo (defaults to current repo)"),
    parallel: tool.schema.number().optional().describe("Number of parallel sessions"),
  },
  async execute(args, context) {
    let cmd = ["jules", "remote", "new"]

    if (args.repo) {
      cmd.push("--repo", args.repo)
    } else {
      cmd.push("--repo", ".")
    }

    if (args.parallel) {
      cmd.push("--parallel", String(args.parallel))
    }

    cmd.push(args.task)

    const result = await Bun.$`${cmd}`.text()
    return result.trim()
  },
})
