import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AddToCartDemoComponent } from './add-to-cart-demo/add-to-cart-demo.component';
import { CartSummaryDemoComponent } from './cart-summary-demo/cart-summary-demo.component';
import { CartCheckoutDemoComponent } from './cart-checkout-demo/cart-checkout-demo.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddToCartComponent, CartCheckoutComponent, CartService, CartSummaryComponent, MemoryCartService } from '../../src';
import { AddToCartEditorComponent } from '../../src/components/add-to-cart-editor/add-to-cart-editor.component';
describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        AddToCartDemoComponent,
        AddToCartComponent,
        AddToCartEditorComponent,
        CartSummaryDemoComponent,
        CartSummaryComponent,
        CartCheckoutDemoComponent,
        CartCheckoutComponent,
      ],
      imports: [
        CommonModule,
        FormsModule,
      ],
      providers: [
        { provide: CartService, useClass: MemoryCartService }
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('NgShoppingCart');
  }));
});
