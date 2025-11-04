import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignsEdit } from './campaigns-edit';

describe('CampaignsEdit', () => {
  let component: CampaignsEdit;
  let fixture: ComponentFixture<CampaignsEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignsEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignsEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
