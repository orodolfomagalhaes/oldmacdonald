import { expect, it, afterEach, beforeEach, describe, vi } from 'vitest';
import {SearchComponent} from "./search.component.ts";

describe("SearchComponent", () => {
  let component: any;

  const mockTooltip = vi.fn();
  // @ts-ignore
  globalThis.bootstrap = {
    Tooltip: mockTooltip
  }

  beforeEach(() => {
    component = new SearchComponent();
    document.body.appendChild(component);
  });

  afterEach(() => {
    document.body.innerHTML = ``;
  });

  it('should create the search component', () => {
    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it('should listen to the search input event', () => {
    const eventListener = vi.fn();
    const input: any = document.querySelector('#search-input');
    input.addEventListener('input', eventListener);

    input.value = 'qwerty';
    const event = new Event('input');
    input.dispatchEvent(event);

    expect(eventListener).toHaveBeenCalledTimes(1);
    expect(eventListener.mock.calls[0][0].target.value).toBe('qwerty');
    input.removeEventListener('input', eventListener);
  });

  it('should show clear button when input has value', () => {
    const spyShowClearButton = vi.spyOn(component, 'showClearButton');
    const input: any = document.querySelector('#search-input');
    input.value = 'qwerty';
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);

    const clearButton = document.querySelector('.btn-clear');
    expect(spyShowClearButton).toHaveBeenCalledTimes(1);
    expect(clearButton?.classList.contains('d-none')).toBeFalsy();
  });

  it('should hide clear button when input has no value', () => {
    const input: any = document.querySelector('#search-input');
    const clearButton = document.querySelector('.btn-clear');
    // show
    const spyShowClearButton = vi.spyOn(component, 'showClearButton');
    input.value = 'qwerty';
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);

    expect(spyShowClearButton).toHaveBeenCalledTimes(1);
    expect(clearButton?.classList.contains('d-none')).toBeFalsy();

    // hide
    const spyHideClearButton = vi.spyOn(component, 'hideClearButton');
    input.value = '';
    input.dispatchEvent(event);

    expect(spyHideClearButton).toHaveBeenCalledTimes(1);
    expect(clearButton?.classList.contains('d-none')).toBeTruthy();
  });

  it('should listen to the clear button click', () => {
    const eventListener = vi.fn();
    const button: any = document.querySelector('.btn-clear');
    button.addEventListener('click', eventListener);
    button?.click();

    expect(eventListener).toHaveBeenCalledTimes(1);
    button?.removeEventListener('click', eventListener);
  });

  it('should dispatch search-event event when clear button is clicked', () => {
    vi.useFakeTimers();
    const spyDebounce = vi.spyOn(component, 'debounce');
    const spyDispatchSearchEvent = vi.spyOn(component, 'dispatchSearchEvent');

    const input: any = document.querySelector('#search-input');
    input.value = 'qwerty';
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);

    const button: any = document.querySelector('.btn-clear');
    button?.click();

    expect(spyDebounce).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(700);
    expect(spyDispatchSearchEvent).toHaveBeenCalledTimes(1);
  });
});