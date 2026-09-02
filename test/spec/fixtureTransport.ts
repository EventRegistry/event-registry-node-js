import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

/**
 * Jasmine helper (loaded before every spec file) that lets the integration suite
 * run against recorded HTTP fixtures instead of the live Event Registry API.
 *
 * Modes (ER_TEST_MODE env var, default "replay"):
 *  - "replay": intercept fetch, serve recorded fixtures, never touch the network.
 *              Fails loudly if a fixture is missing instead of silently going live.
 *  - "record": intercept fetch, call the real API, persist the response as a fixture,
 *              then return it. Requires a valid apiKey in settings.json.
 *  - "live":   no interception at all — identical to pre-fixture behavior.
 *
 * The apiKey is stripped from both the cache key and the persisted request body,
 * so committed fixtures never contain a real credential and replay works with or
 * without a settings.json in place.
 */

type TestMode = "live" | "replay" | "record";

function getMode(): TestMode {
    const raw = (process.env.ER_TEST_MODE || "replay").toLowerCase();
    if (raw === "live" || raw === "replay" || raw === "record") {
        return raw;
    }
    throw new Error(`Unknown ER_TEST_MODE "${raw}". Use "live", "replay", or "record".`);
}

const mode = getMode();
const FIXTURES_DIR = path.join(process.cwd(), "test", "fixtures");

function stableStringify(value: unknown): string {
    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(",")}]`;
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
        return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
    }
    return JSON.stringify(value);
}

function redactBody(body: unknown): unknown {
    if (body && typeof body === "object" && !Array.isArray(body)) {
        const clone: Record<string, unknown> = { ...(body as Record<string, unknown>) };
        if ("apiKey" in clone) {
            clone.apiKey = "***redacted***";
        }
        return clone;
    }
    return body;
}

function slugify(pathname: string): string {
    return pathname.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "root";
}

function fixturePathFor(url: string, method: string, redactedBody: unknown): string {
    const pathname = new URL(url).pathname;
    const hash = crypto.createHash("sha1").update(`${method}\n${pathname}\n${stableStringify(redactedBody)}`).digest("hex");
    return path.join(FIXTURES_DIR, `${slugify(pathname)}--${hash}.json`);
}

function parseRequestBody(init: RequestInit | undefined): unknown {
    if (typeof init?.body !== "string") {
        return undefined;
    }
    try {
        return JSON.parse(init.body);
    } catch {
        return init.body;
    }
}

function bodyToText(body: unknown): string {
    return typeof body === "string" ? body : JSON.stringify(body);
}

if (mode !== "live") {
    const realFetch = globalThis.fetch.bind(globalThis);
    console.log(`[fixtures] integration tests running in "${mode}" mode (ER_TEST_MODE=${mode}). Fixtures dir: ${FIXTURES_DIR}`);

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        const method = (init?.method ?? "GET").toUpperCase();
        const redactedBody = redactBody(parseRequestBody(init));
        const file = fixturePathFor(url, method, redactedBody);

        if (mode === "replay") {
            if (!fs.existsSync(file)) {
                throw new Error(
                    `[fixtures] No recorded fixture for ${method} ${url}\n` +
                    `body: ${JSON.stringify(redactedBody)}\n` +
                    `Record it with: ER_TEST_MODE=record npm test (needs a valid apiKey in settings.json)`
                );
            }
            const fixture = JSON.parse(fs.readFileSync(file, "utf8"));
            return new Response(bodyToText(fixture.response.body), {
                status: fixture.response.status,
                statusText: fixture.response.statusText,
                headers: { "content-type": fixture.response.contentType ?? "application/json" }
            });
        }

        // record mode
        const realResponse = await realFetch(input, init);
        const text = await realResponse.text();
        let parsedBody: unknown = text;
        try {
            parsedBody = JSON.parse(text);
        } catch {
            // not JSON (e.g. checkVersion's plain-text response) — keep the raw string
        }
        fs.mkdirSync(FIXTURES_DIR, { recursive: true });
        fs.writeFileSync(file, JSON.stringify({
            // Path only, never the full URL — the configured host may be a private/dev endpoint
            // (settings.json's `host` override) that shouldn't end up in a committed fixture.
            request: { method, path: new URL(url).pathname, body: redactedBody },
            response: {
                status: realResponse.status,
                statusText: realResponse.statusText,
                contentType: realResponse.headers.get("content-type") ?? "application/json",
                body: parsedBody
            }
        }, null, 2) + "\n");
        return new Response(text, {
            status: realResponse.status,
            statusText: realResponse.statusText,
            headers: { "content-type": realResponse.headers.get("content-type") ?? "application/json" }
        });
    }) as typeof fetch;
}
