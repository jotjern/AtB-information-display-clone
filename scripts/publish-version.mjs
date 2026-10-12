import { readFileSync, writeFileSync } from "node:fs";

const revision = process.env.GITHUB_SHA;
if (!revision || !/^[0-9a-f]{40}$/.test(revision)) {
  throw new Error("GITHUB_SHA must identify the deployed commit");
}
const html = readFileSync("dist/index.html", "utf8");
if (!html.includes("</head>")) throw new Error("Built index has no closing head");
writeFileSync("dist/index.html", html.replace("</head>", `<meta name="infoscreen-revision" content="${revision}">\n</head>`));
writeFileSync("dist/version.json", JSON.stringify({ revision }) + "\n");
