import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { D3WidgetComponent } from './d3-widget.component';

describe('D3WidgetComponent', () => {
  let component: D3WidgetComponent;
  let fixture: ComponentFixture<D3WidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3WidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3WidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
