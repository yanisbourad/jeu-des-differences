import { Injectable } from '@angular/core';
import * as hotkeys from '@app/configuration/const-hotkeys';

export interface Hotkeys {
    isKeyDown: boolean;
    callback: (event: KeyboardEvent) => void;
}
@Injectable({
    providedIn: 'root',
})
export class HotkeysService {
    listCallbacks: Hotkeys[] = [];

    hotkeysEventListener(keys: string[], isKeyDown: boolean, functionToCall: () => void): number {
        const typeEvent = isKeyDown ? hotkeys.KEYDOWN : hotkeys.KEYUP;

        const callback = ((event: KeyboardEvent): void => {
            if (!this.handleCtrl(keys, event)) return;

            if (!this.handleShift(keys, event)) return;

            if (this.handleNormalKeys(keys, event)) functionToCall();
        }).bind(this);

        document.addEventListener(typeEvent, callback);
        this.listCallbacks.push({ isKeyDown, callback });
        return this.listCallbacks.length - 1;
    }

    removeHotkeysEventListener(id: number): void {
        if (id >= this.listCallbacks.length) return;
        const { isKeyDown, callback } = this.listCallbacks[id];
        const typeEvent = isKeyDown ? hotkeys.KEYDOWN : hotkeys.KEYUP;
        document.removeEventListener(typeEvent, callback);
        this.listCallbacks = this.listCallbacks.splice(id, 1);
    }

    handleNormalKeys(keys: string[], event: KeyboardEvent): boolean {
        let isCorrect = true;
        keys.filter((a: string) => a !== hotkeys.SHIFT && a !== hotkeys.CTRL).forEach((key: string) => {
            switch (key) {
                case hotkeys.ENTER:
                    if (event.key !== hotkeys.ENTER) isCorrect = false;
                    break;
                default:
                    if (event.key.toLowerCase() !== key) isCorrect = false;
            }
        });
        return isCorrect;
    }

    handleShift(keys: string[], event: KeyboardEvent): boolean {
        if (keys.includes(hotkeys.SHIFT)) {
            if (!event.shiftKey && event.key !== hotkeys.SHIFT) return false;
        } else if (event.shiftKey) return false;
        return true;
    }

    handleCtrl(keys: string[], event: KeyboardEvent): boolean {
        if (keys.includes(hotkeys.CTRL)) {
            if (!event.ctrlKey && !event.metaKey) return false;
        } else if (event.ctrlKey || event.metaKey) return false;
        return true;
    }
}
