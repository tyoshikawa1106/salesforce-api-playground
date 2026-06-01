import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const textExtensions = new Set([
    ".cjs",
    ".css",
    ".html",
    ".js",
    ".json",
    ".jsx",
    ".md",
    ".mjs",
    ".ts",
    ".tsx",
    ".txt",
    ".yml",
    ".yaml",
]);

const ignoredPaths = [
    ".github/scripts/scan-sensitive-values.mjs",
    "package-lock.json",
    "tsconfig.tsbuildinfo",
    "tsconfig.typecheck.tsbuildinfo",
];

const placeholderWords = [
    "changeme",
    "dummy",
    "example",
    "fake",
    "fixture",
    "integration",
    "local",
    "mock",
    "placeholder",
    "replace",
    "sample",
    "test",
    "todo",
    "your",
];

const checks = [
    {
        name: "private key block",
        pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
    },
    {
        name: "Salesforce access token",
        pattern: /\b00D[A-Za-z0-9]{12,15}![A-Za-z0-9._-]{20,}\b/g,
    },
    {
        name: "Heroku Git URL",
        pattern: /\bhttps:\/\/git\.heroku\.com\/[a-z0-9][a-z0-9-]*\.git\b/gi,
        allow: isPlaceholderValue,
    },
    {
        name: "Heroku app URL",
        pattern: /\bhttps:\/\/[a-z0-9][a-z0-9-]*\.herokuapp\.com(?:\/[^\s"'`)]*)?/gi,
        allow: isPlaceholderValue,
    },
    {
        name: "Salesforce My Domain URL",
        pattern: /\bhttps:\/\/[a-z0-9][a-z0-9-]*\.my\.salesforce\.com(?:\/[^\s"'`)]*)?/gi,
        allow: isPlaceholderValue,
    },
];

const assignmentPattern =
    /(?:^|[ \t"'`])([A-Z0-9_]*(?:CLIENT_ID|SECRET|TOKEN|API_KEY|PRIVATE_KEY|PASSWORD)[A-Z0-9_]*)[ \t]*[:=][ \t]*["']?([^"'\s#`,;]+)/g;

const files = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    encoding: "utf8",
})
    .split("\0")
    .filter(Boolean)
    .filter((file) => !ignoredPaths.includes(file))
    .filter((file) => textExtensions.has(getExtension(file)));

const findings = [];

for (const file of files) {
    const content = readFileSync(file, "utf8");

    scanPattern(file, content, assignmentPattern, "sensitive variable assignment", (match) =>
        isPlaceholderValue(match[2]),
    );

    for (const check of checks) {
        scanPattern(file, content, check.pattern, check.name, (match) =>
            check.allow ? check.allow(match[0]) : false,
        );
    }
}

if (findings.length > 0) {
    console.error("Sensitive value scan failed. Replace real values with placeholders before committing.");
    console.error("Matched values are intentionally omitted from this output.");
    for (const finding of findings) {
        console.error(`- ${finding.file}:${finding.line} ${finding.name}`);
    }
    process.exit(1);
}

console.log(`Sensitive value scan passed (${files.length} tracked text files checked).`);

function scanPattern(file, content, pattern, name, allow) {
    pattern.lastIndex = 0;

    for (const match of content.matchAll(pattern)) {
        if (allow(match)) {
            continue;
        }

        findings.push({
            file,
            line: getLineNumber(content, match.index ?? 0),
            name,
        });
    }
}

function isPlaceholderValue(value) {
    const normalized = value.trim().toLowerCase();

    if (
        normalized === "" ||
        normalized.length < 16 ||
        normalized.startsWith("$") ||
        normalized.includes("${{") ||
        normalized.includes(".repeat(") ||
        normalized.includes("<") ||
        normalized.includes(">") ||
        normalized.includes("localhost") ||
        normalized.includes("127.0.0.1")
    ) {
        return true;
    }

    return placeholderWords.some((word) => normalized.includes(word));
}

function getExtension(file) {
    const lastDotIndex = file.lastIndexOf(".");
    return lastDotIndex === -1 ? "" : file.slice(lastDotIndex);
}

function getLineNumber(content, index) {
    let line = 1;
    for (let position = 0; position < index; position += 1) {
        if (content.charCodeAt(position) === 10) {
            line += 1;
        }
    }
    return line;
}
