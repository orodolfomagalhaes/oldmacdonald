import { expect, it, afterEach, beforeEach, describe, vi } from 'vitest';
import {HeaderComponent} from "./header.component.ts";

describe("HeaderComponent", () => {
  let component: HTMLElement;

  beforeEach(() => {
    component = new HeaderComponent();
    document.body.appendChild(component);
  })

  afterEach(() => {
    document.body.innerHTML = ``;
  })

  it('should create the search component', () => {
    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it('should dispatch add-new-farm event when button is clicked', () => {
    const button: any = document.querySelector('#add-farm');
    const eventListener = vi.fn();
    document.addEventListener('add-new-farm', eventListener);
    button?.click();
    expect(eventListener).toHaveBeenCalled();
    document.removeEventListener('add-new-farm', eventListener);
  });
})