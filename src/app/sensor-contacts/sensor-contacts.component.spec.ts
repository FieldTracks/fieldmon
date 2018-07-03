import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorContactsComponent } from './sensor-contacts.component';

describe('SensorContactsComponent', () => {
  let component: SensorContactsComponent;
  let fixture: ComponentFixture<SensorContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
