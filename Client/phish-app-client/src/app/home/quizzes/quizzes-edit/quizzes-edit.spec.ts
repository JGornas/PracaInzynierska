import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizzesEdit } from './quizzes-edit';

describe('QuizzesEdit', () => {
  let component: QuizzesEdit;
  let fixture: ComponentFixture<QuizzesEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizzesEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizzesEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
