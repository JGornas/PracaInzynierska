import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Recipients } from './recipients';
import { RecipientsService } from './recipients.service';
import { RecipientGroupDto, RecipientDto } from './recipients.models';

class MockRecipientsService {
  getRecipients() {
    return of<RecipientDto[]>([]);
  }
  getGroups() {
    return of<RecipientGroupDto[]>([]);
  }
  createRecipient() {
    return of();
  }
  updateRecipient() {
    return of();
  }
  deleteRecipient() {
    return of();
  }
  createGroup() {
    return of();
  }
  updateGroup() {
    return of();
  }
  deleteGroup() {
    return of();
  }
}

describe('Recipients', () => {
  let component: Recipients;
  let fixture: ComponentFixture<Recipients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recipients],
      providers: [
        { provide: RecipientsService, useClass: MockRecipientsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Recipients);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
