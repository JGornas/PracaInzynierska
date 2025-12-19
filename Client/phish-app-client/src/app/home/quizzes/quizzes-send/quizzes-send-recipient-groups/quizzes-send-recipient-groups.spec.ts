import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizzesSendRecipientGroups } from './quizzes-send-recipient-groups';

describe('QuizzesSendRecipientGroups', () => {
  let component: QuizzesSendRecipientGroups;
  let fixture: ComponentFixture<QuizzesSendRecipientGroups>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizzesSendRecipientGroups]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizzesSendRecipientGroups);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
