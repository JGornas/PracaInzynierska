import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignsEditAddReciepientGroup } from './campaigns-edit-add-reciepient-group';

describe('CampaignsEditAddReciepientGroup', () => {
  let component: CampaignsEditAddReciepientGroup;
  let fixture: ComponentFixture<CampaignsEditAddReciepientGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignsEditAddReciepientGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignsEditAddReciepientGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
