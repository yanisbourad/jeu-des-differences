import { Injectable } from '@angular/core';
import * as hotkeys from '@app/configuration/const-hotkeys';
@Injectable({
    providedIn: 'root',
})
export class HotkeysService {
    hotkeysEventListener(keys: string[], isKeyDown: boolean, functionToCall: () => void) {
        const typeEvent = isKeyDown ? hotkeys.KEYDOWN : hotkeys.KEYUP;
        document.addEventListener(typeEvent, (event: KeyboardEvent): void => {
            let isCorrect = true;
            if (keys.includes(hotkeys.SHIFT)) {
                if (!event.shiftKey && event.key !== hotkeys.SHIFT) isCorrect = false;
            } else if (event.shiftKey) isCorrect = false;

            if (keys.includes(hotkeys.CTRL)) {
                if (!event.ctrlKey && !event.metaKey) isCorrect = false;
            } else if (event.ctrlKey || event.metaKey) isCorrect = false;

            keys.filter((a) => a !== hotkeys.SHIFT && a !== hotkeys.CTRL).forEach((key) => {
                switch (key) {
                    case hotkeys.ENTER:
                        if (event.key !== hotkeys.ENTER) isCorrect = false;
                        break;
                    default:
                        if (event.key !== key) isCorrect = false;
                }
            });
            if (isCorrect) functionToCall();
        });
    }
}
