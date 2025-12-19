import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizzesSend } from './quizzes-send';

describe('QuizzesSend', () => {
  let component: QuizzesSend;
  let fixture: ComponentFixture<QuizzesSend>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizzesSend]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizzesSend);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
