import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplatesEdit } from './templates-edit';

describe('TemplatesEdit', () => {
  let component: TemplatesEdit;
  let fixture: ComponentFixture<TemplatesEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplatesEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplatesEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
