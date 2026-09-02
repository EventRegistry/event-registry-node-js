export class Mutex {
    private locked = false;
    private readonly waiters: (() => void)[] = [];

    public async acquire(): Promise<void> {
        if (!this.locked) {
            this.locked = true;
            return;
        }
        await new Promise<void>((resolve) => this.waiters.push(resolve));
        this.locked = true;
    }

    public release(): void {
        const next = this.waiters.shift();
        if (next) {
            next();
            return;
        }
        this.locked = false;
    }
}
