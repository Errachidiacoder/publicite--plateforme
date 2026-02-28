import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UiService {
    private primaryActionSource = new Subject<void>();
    primaryAction$ = this.primaryActionSource.asObservable();

    private buttonConfig = new BehaviorSubject<{ label: string, visible: boolean }>({ label: '✚ Nouveau', visible: false });
    buttonConfig$ = this.buttonConfig.asObservable();

    triggerPrimaryAction() {
        this.primaryActionSource.next();
    }

    setButtonConfig(label: string, visible: boolean) {
        this.buttonConfig.next({ label, visible });
    }
}
