import chalk from "chalk";

export default function log(message, type = "info") {
  const color = {
    info: "blue",
    warn: "yellow",
    error: "red",
    win: "#47C7F2",
    lost: "#FF58FB",
  }[type];

  const hex = {
    win: "#47C7F2",
    lost: "#FF58FB",
    draw: "#BEBBC7",
  };

  if (type === "win" || type === "lost" || type === "draw") {
    return console.log(
      chalk.hex(hex[type])(`[${type.toUpperCase()}] ${message}`)
    );
  }

  console.log(chalk[color](`[${type.toUpperCase()}] ${message}`));
}
