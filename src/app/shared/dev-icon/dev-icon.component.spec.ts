import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevIconComponent } from './dev-icon.component';

describe('DevIconComponent', () => {
  let component: DevIconComponent;
  let fixture: ComponentFixture<DevIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
