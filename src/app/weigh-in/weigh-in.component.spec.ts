import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeighInComponent } from './weigh-in.component';

describe('WeighInComponent', () => {
  let component: WeighInComponent;
  let fixture: ComponentFixture<WeighInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeighInComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeighInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
