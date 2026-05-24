import fs from "node:fs";
import path from "node:path";

const coverageSummary = JSON.parse(
    fs.readFileSync("coverage/coverage-summary.json", "utf8")
);

const metrics = ["statements", "branches", "functions", "lines"];
const formatMetricRows = (summary) =>
    metrics
        .map((key) => {
            const metric = summary[key];
            return `| ${key} | ${metric.pct}% | ${metric.covered}/${metric.total} |`;
        })
        .join("\n");

const fileRows = Object.entries(coverageSummary)
    .filter(([file]) => file !== "total")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([file, summary]) => {
        const relativeFile = path.relative(process.cwd(), file);
        const cells = metrics.map((key) => `${summary[key].pct}%`);
        return `| \`${relativeFile}\` | ${cells.join(" | ")} |`;
    })
    .join("\n");

const markdown = `## Test coverage

### Overall

| Metric | Coverage | Covered |
| --- | ---: | ---: |
${formatMetricRows(coverageSummary.total)}

### Files

| File | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
${fileRows}
`;

fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
