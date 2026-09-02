export interface ErHttpResponse<T = unknown> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
}

export interface ErHttpRequest {
    url: string;
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    timeoutMs?: number;
    retry?: number;
    retryDelayMs?: number;
    stopStatusCodes?: number[];
    responseType?: "json" | "text";
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isFetchNetworkError(error: unknown): boolean {
    if (!(error instanceof TypeError)) {
        return false;
    }
    const message = error.message.toLowerCase();
    return message.includes("fetch failed") || message.includes("failed to fetch") || message.includes("network");
}

/** Programmer / parse errors must not spin on retry: -1. Network TypeErrors still retry. */
function isNonRetryableClientError(error: unknown): boolean {
    if (error instanceof SyntaxError) {
        return true;
    }
    return error instanceof TypeError && !isFetchNetworkError(error);
}

export async function erFetch<T = unknown>(req: ErHttpRequest): Promise<ErHttpResponse<T>> {
    const method = req.method ?? "POST";
    const timeoutMs = req.timeoutMs ?? 600_000;
    const retry = req.retry ?? 0;
    const retryDelayMs = req.retryDelayMs ?? 5000;
    const stopStatusCodes = req.stopStatusCodes ?? [204, 400, 401, 403, 530];
    const serializedBody = req.body !== undefined ? JSON.stringify(req.body) : undefined;

    let attempt = 0;
    for (;;) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const init: RequestInit = {
                method,
                headers: {
                    "content-type": "application/json",
                    ...(req.headers ?? {})
                },
                signal: controller.signal
            };
            if (serializedBody !== undefined) {
                init.body = serializedBody;
            }
            const response = await fetch(req.url, init);
            clearTimeout(timer);

            if (response.status === 200) {
                const data = (req.responseType === "text"
                    ? await response.text()
                    : await response.json()) as T;
                return {
                    data,
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                };
            }

            if (stopStatusCodes.includes(response.status)) {
                throw Object.assign(new Error(response.statusText || `HTTP ${response.status}`), {
                    response: { status: response.status, statusText: response.statusText }
                });
            }

            if (retry >= 0 && attempt >= retry) {
                throw Object.assign(new Error(response.statusText || `HTTP ${response.status}`), {
                    response: { status: response.status, statusText: response.statusText },
                    __retryCount: attempt
                });
            }

            attempt += 1;
            await sleep(retryDelayMs);
        } catch (error) {
            clearTimeout(timer);
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status !== undefined && stopStatusCodes.includes(status)) {
                throw error;
            }
            if (isNonRetryableClientError(error)) {
                throw error;
            }
            if (retry >= 0 && attempt >= retry) {
                throw Object.assign(error as object, { __retryCount: attempt });
            }
            attempt += 1;
            await sleep(retryDelayMs);
        }
    }
}
