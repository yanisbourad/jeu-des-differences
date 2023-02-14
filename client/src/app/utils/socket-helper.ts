// This class only for testing purpose

// from Angular socket.io exemple on gitLab
// https://gitlab.com/loicortola/angular-socket-io-examples/-/blob/master/src/app/utils/socket-helper.ts

// eslint-disable-next-line @typescript-eslint/ban-types
type CallbackSignature = (params: unknown) => {};

export class SocketTestHelper {
    private callbacks = new Map<string, CallbackSignature[]>();

    on(event: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        // this.callbacks.get(event)!.push(callback);
        this.callbacks.get(event)?.push(callback);
    }
    getCallbacks(): Map<string, CallbackSignature[]> {
        return this.callbacks;
    }

    emit(): void {
        return;
    }

    disconnect(): void {
        return;
    }

    peerSideEmit(event: string, params?: unknown) {
        if (!this.callbacks.has(event)) {
            return;
        }

        const callbacks = this.callbacks.get(event);
        if (!callbacks) return;

        for (const callback of callbacks) {
            callback(params);
        }
    }
}
