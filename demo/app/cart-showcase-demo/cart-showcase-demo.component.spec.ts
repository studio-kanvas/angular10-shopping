import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartShowcaseDemoComponent } from './cart-showcase-demo.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartModule } from '../../../src';

describe('CartShowcaseDemoComponent', () => {
  let component: CartShowcaseDemoComponent;
  let fixture: ComponentFixture<CartShowcaseDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartShowcaseDemoComponent ],
      imports: [
        CommonModule,
        FormsModule,
        CartModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartShowcaseDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
