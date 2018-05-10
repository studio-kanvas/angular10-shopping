import { Component } from '@angular/core';
import { AddToCartType, AddToCartPosition, CartService } from '../../../src';
import { DemoCartItem } from '../demo-cart-item';

@Component({
  selector: 'demo-add-to-cart',
  templateUrl: './demo-add-to-cart.component.html',
  styleUrls: ['./demo-add-to-cart.component.scss']
})
export class DemoAddToCartComponent {
  cartItem: DemoCartItem;
  quantity = 1;
  custom = false;
  label = 'Add to cart';
  editor = 'button';
  editorTypes: AddToCartType[] = ['button', 'text', 'number', 'dropdown'];
  position = 'left';
  positions: AddToCartPosition[] = ['left', 'right', 'top', 'bottom'];
  customTypes = [{ name: 'True', value: true }, { name: 'False', value: false }];
  settingsCollapsed = false;
  resultsCollapsed = false;

  constructor(private cartService: CartService<DemoCartItem>) {
    this.cartItem = new DemoCartItem({
      identifier: Date.now(),
      label: 'Test',
      cost: 14.5,
      description: 'Test description',
      country: 'US',
      photo: '/assets/laptop.jpg'
    });
  }

  addToCart(item) {
    console.log('added', item);
    console.log('cart items', this.cartService.getItems());
  }

  quantityChanged(value) {
    console.log('editor changed', value);
  }
}
