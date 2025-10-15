import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SendingProfiles } from './sending-profiles';

describe('SendingProfiles', () => {
  let component: SendingProfiles;
  let fixture: ComponentFixture<SendingProfiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendingProfiles]
    }).compileComponents();

    fixture = TestBed.createComponent(SendingProfiles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
