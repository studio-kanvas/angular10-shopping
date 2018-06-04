import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {CartCheckoutComponent} from './cart-checkout.component';
import {BaseCartItem, CartService, MemoryCartService} from '../../';
import {HttpClient, HttpClientModule, HttpHeaders, HttpParams} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {By} from '@angular/platform-browser';
import {Component} from '@angular/core';
import {CheckoutSettings, CheckoutType} from '../../types';

// region Test setup
const TEST_CUSTOM_BUTTON_TEMPLATE = '<cart-checkout [custom]="custom"><div class="test"></div></cart-checkout>';

@Component({
  selector: 'cart-test-custom-cart-checkout',
  template: TEST_CUSTOM_BUTTON_TEMPLATE
})
class TestCustomButtonComponent {
  custom = true;
}

const TEST_SERVICE_TEMPLATE = '<cart-checkout [service]="service" [settings]="settings"></cart-checkout>';

@Component({
  selector: 'cart-test-service-checkout',
  template: TEST_SERVICE_TEMPLATE
})
class TestServiceComponent {
  service: CheckoutType;
  settings: CheckoutSettings;
}

// endregion

describe('CartCheckoutComponent', () => {
  let subscriptions = [];
  let service: CartService<BaseCartItem>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [CartCheckoutComponent, TestCustomButtonComponent, TestServiceComponent],
        imports: [HttpClientModule, HttpClientTestingModule],
        providers: [
          {provide: CartService, useClass: MemoryCartService},
        ]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.get(CartService);
    service.clear();
  });

  describe('Default component', () => {
    let component: CartCheckoutComponent;
    let fixture: ComponentFixture<CartCheckoutComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(CartCheckoutComponent);
      component = fixture.componentInstance;
    });

    it('should create with default values', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
      const button = fixture.debugElement.query(By.css('button'));
      expect(button).toBeTruthy();
      const buttonEl = button.nativeElement;
      expect(buttonEl.classList.contains('cart-checkout-button')).toEqual(true);
      expect(buttonEl.attributes['disabled']).toBeTruthy();
      expect(buttonEl.innerText).toEqual('Checkout');
    });

    it('should change the button text', () => {
      component.buttonText = 'Test add';
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.innerHTML.trim()).toEqual('Test add');
      expect(fixture.nativeElement.innerText).toEqual('Test add');
    });

    it('should change the button class', () => {
      component.buttonClass = 'test';
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.className).toEqual('test');
    });

    it('should enable the button when the cart has items', () => {
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.attributes['disabled']).toBeTruthy();
      service.addItem(new BaseCartItem({id: 1, name: 'Test item', quantity: 1, price: 1}));
      fixture.detectChanges();
      expect(button.nativeElement.attributes['disabled']).toBeFalsy();
    });
  });

  describe('Custom component', () => {
    let component: TestCustomButtonComponent;
    let fixture: ComponentFixture<TestCustomButtonComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(TestCustomButtonComponent);
      component = fixture.componentInstance;
    });

    it('should render custom content', () => {
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('span'));
      expect(container).toBeTruthy();
      expect(container.query(By.css('.test'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.test'))).toBeTruthy();
      component.custom = false;
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.test'))).toBeFalsy();
    });

    it('should invoke the checkout when the projected content is clicked', () => {
      service.addItem(new BaseCartItem({id: 1, name: 'Test item', quantity: 1, price: 1}));
      fixture.detectChanges();
      const comp = fixture.debugElement.query(By.css('cart-checkout'));
      expect(comp.componentInstance instanceof CartCheckoutComponent).toEqual(true);
      const spy = spyOn(comp.componentInstance, 'doCheckout').and.callThrough();
      const checkoutSpy = jasmine.createSpy('checkout');
      const consoleSpy = spyOn(console, 'log');
      subscriptions.push(comp.componentInstance.checkout.subscribe(checkoutSpy));
      const content = fixture.debugElement.query(By.css('.test'));
      content.nativeElement.click();
      expect(spy).toHaveBeenCalled();
      expect(checkoutSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Http service', () => {
    let component: TestServiceComponent;
    let fixture: ComponentFixture<TestServiceComponent>;
    let httpClient: HttpClient;
    let controller: HttpTestingController;
    const response = {fake: 1};

    beforeEach(() => {
      fixture = TestBed.createComponent(TestServiceComponent);
      component = fixture.componentInstance;
      httpClient = TestBed.get(HttpClient);
      controller = TestBed.get(HttpTestingController);
    });

    it('should throw an error of there is no configuration', fakeAsync(() => {
      service.addItem(new BaseCartItem({id: 1, name: 'Test item', quantity: 1, price: 1}));
      component.service = 'http';
      fixture.detectChanges();
      const comp = fixture.debugElement.query(By.css('cart-checkout'));
      expect(comp.componentInstance instanceof CartCheckoutComponent).toEqual(true);
      const compInstance: CartCheckoutComponent = comp.componentInstance;
      expect(compInstance.doCheckout.bind(compInstance)).toThrowError('Missing settings configuration');
    }));

    it('should perform an http request with the contents of the cart', fakeAsync(() => {
      service.addItem(new BaseCartItem({id: 1, name: 'Test item', quantity: 1, price: 1}));
      service.setShipping(20);
      service.setTaxRate(10);
      component.service = 'http';
      component.settings = {method: 'POST', url: 'http://fakeserver.com'};
      fixture.detectChanges();
      const comp = fixture.debugElement.query(By.css('cart-checkout'));
      expect(comp.componentInstance instanceof CartCheckoutComponent).toEqual(true);
      const compInstance: CartCheckoutComponent = comp.componentInstance;
      const checkoutSpy = jasmine.createSpy('httpCheckout');
      subscriptions.push(compInstance.checkout.subscribe(checkoutSpy));
      const consoleSpy = spyOn(console, 'log');
      const button = fixture.debugElement.query(By.css('button'));
      button.nativeElement.click();
      tick();
      const req = controller.expectOne('http://fakeserver.com');
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toBeTruthy();
      expect(req.request.body.items).toEqual(service.getItems());
      expect(req.request.body.taxRate).toEqual(10);
      expect(req.request.body.shipping).toEqual(20);
      req.flush(response);
      tick();
      expect(checkoutSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).not.toHaveBeenCalled();
    }));

    it('should change the body format if a content-type header with form-urlencoded value is found', fakeAsync(() => {
      service.addItem(new BaseCartItem({id: 1, name: 'Test item', quantity: 1, price: 1}));
      service.addItem(new BaseCartItem({id: 2, name: 'Test item 2', quantity: 1, price: 10}));
      service.setShipping(20);
      service.setTaxRate(10);
      component.service = 'http';
      const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'});
      component.settings = {method: 'POST', url: 'http://fakeserver.com', options: {headers}};
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('button'));
      button.nativeElement.click();
      tick();
      const req = controller.expectOne('http://fakeserver.com');
      expect(req.request.method).toEqual('POST');
      expect(req.request.headers.get('Content-Type')).toEqual('application/x-www-form-urlencoded;charset=UTF-8');
      expect(req.request.body instanceof HttpParams).toEqual(true);
      expect(req.request.body.getAll('items').length).toEqual(2);
      expect(req.request.body.get('taxRate')).toEqual(10);
      expect(req.request.body.get('shipping')).toEqual(20);
      req.flush(response);
    }));

    it('should preserve the body if a content-type different from form-urlencoded is found', fakeAsync(() => {
      service.addItem(new BaseCartItem({id: 1, name: 'Test item', quantity: 1, price: 1}));
      component.service = 'http';
      const headers = new HttpHeaders({'Content-Type': 'application/json'});
      component.settings = {method: 'POST', url: 'http://fakeserver.com', options: {headers}};
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('button'));
      button.nativeElement.click();
      tick();
      const req = controller.expectOne('http://fakeserver.com');
      expect(req.request.method).toEqual('POST');
      expect(req.request.headers.get('Content-Type')).toEqual('application/json');
      expect(req.request.body instanceof HttpParams).toEqual(false);
      expect(req.request.body).toBeTruthy();
      expect(req.request.body.items).toEqual(service.getItems());
      req.flush(response);
    }));

    it('should send a POST request if no method is provided', fakeAsync(() => {
      service.addItem(new BaseCartItem({id: 1, name: 'Test item', quantity: 1, price: 1}));
      service.addItem(new BaseCartItem({id: 2, name: 'Test item 2', quantity: 1, price: 10}));
      service.setShipping(20);
      service.setTaxRate(10);
      component.service = 'http';
      component.settings = {url: 'http://fakeserver.com'};
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('button'));
      button.nativeElement.click();
      tick();
      const req = controller.expectOne('http://fakeserver.com');
      expect(req.request.method).toEqual('POST');
      req.flush(response);
    }));

    it('should throw an error if an unsupported verb is provided', () => {
      service.addItem(new BaseCartItem({id: 1, name: 'Test item', quantity: 1, price: 1}));
      component.service = 'http';
      component.settings = {url: 'http://fakeserver.com', method: 'GET'};
      fixture.detectChanges();
      const comp = fixture.debugElement.query(By.css('cart-checkout'));
      expect(comp.componentInstance instanceof CartCheckoutComponent).toEqual(true);
      const compInstance: CartCheckoutComponent = comp.componentInstance;
      expect(compInstance.doCheckout.bind(compInstance))
        .toThrowError('Invalid http verb found in method setting. Expected one of POST PUT PATCH and got GET');
    });

    it('should emit an error if the call fails', fakeAsync(() => {
      const err = 'Response error';
      service.addItem(new BaseCartItem({id: 1, name: 'Test item', quantity: 1, price: 1}));
      component.service = 'http';
      component.settings = {method: 'POST', url: 'http://fakeserver.com'};
      fixture.detectChanges();
      const comp = fixture.debugElement.query(By.css('cart-checkout'));
      const errorSpy = jasmine.createSpy('httpCheckout');
      subscriptions.push(comp.componentInstance.error.subscribe(errorSpy));
      const button = fixture.debugElement.query(By.css('button'));
      button.nativeElement.click();
      tick();
      const req = controller.expectOne('http://fakeserver.com');
      expect(req.request.method).toEqual('POST');
      req.flush(err, {status: 400, statusText: 'Bad request'});
      tick();
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const httpError = errorSpy.calls.first();
      expect(httpError.args[0].error).toEqual(err);
    }));

    afterEach(() => controller.verify());
  });

  describe('Paypal service', () => {
    let component: TestServiceComponent;
    let fixture: ComponentFixture<TestServiceComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(TestServiceComponent);
      component = fixture.componentInstance;
    });

    it('should render a paypal form', () => {
      component.service = 'paypal';
      const setting = {business: 'Test business', currencyCode: 'USD', itemName: 'Test item', itemNumber: '1', noNote: '0'};
      component.settings = setting;
      fixture.detectChanges();
      const paypalEl = fixture.debugElement.query(By.css('cart-checkout'));
      expect(paypalEl).toBeTruthy();
      const paypalForm = paypalEl.query(By.css('form'));
      expect(paypalForm).toBeTruthy();
      const attrs = paypalForm.attributes;
      expect(attrs['action']).toEqual('https://www.paypal.com/cgi-bin/webscr');
      const inputs = paypalForm.children.filter(ch => ch.name === 'input');
      const business = inputs.find(i => i.attributes.name === 'business');
      expect(business.properties.value).toEqual(setting.business);
      const itemName = inputs.find(i => i.attributes.name === 'item_name');
      expect(itemName.properties.value).toEqual(setting.itemName);
      const itemNumber = inputs.find(i => i.attributes.name === 'item_number');
      expect(itemNumber.properties.value).toEqual(setting.itemNumber);
      const cost = inputs.find(i => i.attributes.name === 'amount');
      expect(cost.properties.value).toEqual(service.totalCost().toString());
      const currencyCode = inputs.find(i => i.attributes.name === 'currency_code');
      expect(currencyCode.properties.value).toEqual(setting.currencyCode);
      const noNote = inputs.find(i => i.attributes.name === 'no_note');
      expect(noNote.properties.value).toEqual(setting.noNote);
      const taxRate = inputs.find(i => i.attributes.name === 'tax_rate');
      expect(taxRate.properties.value).toEqual(service.getTaxRate().toString());
      const shipping = inputs.find(i => i.attributes.name === 'shipping');
      expect(shipping.properties.value).toEqual(service.getShipping().toString());
    });
  });

  afterEach(() => {
    subscriptions.forEach(s => s.unsubscribe());
    subscriptions = [];
  });
});
