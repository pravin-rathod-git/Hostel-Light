import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostSaveSkeletonComponent } from './post-save-skeleton.component';

describe('PostSaveSkeletonComponent', () => {
  let component: PostSaveSkeletonComponent;
  let fixture: ComponentFixture<PostSaveSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostSaveSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostSaveSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
