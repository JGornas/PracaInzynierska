import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recipients } from './recipients';

describe('Recipients', () => {
  let component: Recipients;
  let fixture: ComponentFixture<Recipients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recipients]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recipients);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
