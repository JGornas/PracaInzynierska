import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetPassword } from './set-password';

describe('SetPassword', () => {
  let component: SetPassword;
  let fixture: ComponentFixture<SetPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
