import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingSkeletonComponent } from './saving-skeleton.component';

describe('SavingSkeletonComponent', () => {
  let component: SavingSkeletonComponent;
  let fixture: ComponentFixture<SavingSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
