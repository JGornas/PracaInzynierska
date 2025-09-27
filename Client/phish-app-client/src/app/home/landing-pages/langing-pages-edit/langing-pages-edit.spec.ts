import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangingPagesEdit } from './langing-pages-edit';

describe('LangingPagesEdit', () => {
  let component: LangingPagesEdit;
  let fixture: ComponentFixture<LangingPagesEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LangingPagesEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LangingPagesEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
