import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QuizzSendingInfo } from './quizzes.models';

@Injectable({ providedIn: 'root' })
export class SharedQuizzesService {

  private currentSubject = new BehaviorSubject<QuizzSendingInfo | null>(null);

  public current$ = this.currentSubject.asObservable();

  setCurrent(info: QuizzSendingInfo | null): void {
    this.currentSubject.next(info);
  }

  getCurrentValue(): QuizzSendingInfo | null {
    const value = this.currentSubject.getValue();
    return value;
  }

  clear(): void {
    this.currentSubject.next(null);
  }
}
