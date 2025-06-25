import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  private homeUpdateSource = new Subject<void>();

  homeUpdated$ = this.homeUpdateSource.asObservable();

  notifyHomeUpdated() {
    this.homeUpdateSource.next();
  }
}
