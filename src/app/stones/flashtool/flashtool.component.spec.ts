import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashtoolComponent } from './flashtool.component';

describe('FlashtoolComponent', () => {
  let component: FlashtoolComponent;
  let fixture: ComponentFixture<FlashtoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlashtoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashtoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
