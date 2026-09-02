import { describe, expect, it } from "vitest";
import { Mutex } from "../../src/mutex";

describe("Mutex", () => {
    it("runs critical sections exclusively", async () => {
        const mutex = new Mutex();
        const order: number[] = [];
        const t1 = (async () => {
            await mutex.acquire();
            order.push(1);
            await new Promise((r) => setTimeout(r, 30));
            order.push(2);
            mutex.release();
        })();
        const t2 = (async () => {
            await new Promise((r) => setTimeout(r, 5));
            await mutex.acquire();
            order.push(3);
            mutex.release();
        })();
        await Promise.all([t1, t2]);
        expect(order).toEqual([1, 2, 3]);
    });
});
