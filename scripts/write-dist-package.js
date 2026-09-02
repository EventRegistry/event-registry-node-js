const fs = require("fs");
const path = require("path");

const kind = process.argv[2];
if (kind !== "cjs" && kind !== "esm") {
    throw new Error("Expected build kind to be either cjs or esm");
}

function addJsExtension(_match, prefix, specifier, suffix) {
    return path.extname(specifier)
        ? `${prefix}${specifier}${suffix}`
        : `${prefix}${specifier}.js${suffix}`;
}

function rewriteEsmSpecifiers(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            rewriteEsmSpecifiers(entryPath);
        } else if (entry.name.endsWith(".js")) {
            const source = fs.readFileSync(entryPath, "utf8")
                .replace(/(\bfrom\s+["'])(\.[^"']+)(["'])/g, addJsExtension)
                .replace(/(\bimport\s*["'])(\.[^"']+)(["'])/g, addJsExtension)
                .replace(/(\bimport\(\s*["'])(\.[^"']+)(["']\s*\))/g, addJsExtension);
            fs.writeFileSync(entryPath, source);
        }
    }
}

if (kind === "esm") {
    rewriteEsmSpecifiers(path.join("dist", "esm"));
}

const pkg = kind === "esm" ? { type: "module" } : { type: "commonjs" };
fs.writeFileSync(
    path.join("dist", kind, "package.json"),
    `${JSON.stringify(pkg, null, 2)}\n`
);
