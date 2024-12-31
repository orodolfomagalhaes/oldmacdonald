import {describe, it, expect, vi, beforeEach} from 'vitest';
import {AppComponent} from "./app.ts";
import {CropTypesService} from "./services/crop-types/crop-types.service.ts";

class MockedCropTypeService extends CropTypesService {
  getAll = vi.fn().mockResolvedValue([]);
}

const mockedService = new MockedCropTypeService();

class MockToast {
  // @ts-ignore
  constructor(element: Element) {
    return this;
  }
  show = vi.fn();
  static getOrCreateInstance = vi.fn(() => new MockToast(document.createElement('div')));
}

describe(AppComponent, () => {
  let component: AppComponent;
  globalThis.fetch = vi.fn();
  // @ts-ignore
  globalThis.bootstrap = {
    Toast: MockToast
  };

  beforeEach(() => {
    component = new AppComponent(mockedService);
  })

  it('should create app component', async () => {
    const renderSpy = vi.spyOn(component, 'render');
    const initShowToastListenerSpy = vi.spyOn(component, 'initShowToastListener');
    await component.connectedCallback();
    expect(component).toBeTruthy();
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(initShowToastListenerSpy).toHaveBeenCalledTimes(1);
  });

  it('should get crop type list', () => {
    expect(component.getCropTypeList()).toEqual([]);
  });

  it('should display a toast when event is fired', async () => {
    await component.connectedCallback();

    const getToastTemplateSpy = vi.spyOn(component, 'getToastTemplate');
    const showToastSpy = vi.spyOn(component, 'showToast');
    const initCloseToastListenerSpy = vi.spyOn(component, 'initCloseToastListener');

    const eventDetail = { style: 'success', message: 'Deu bom pessoal!'}
    const event = new CustomEvent('show-toast', {
      detail: eventDetail,
      bubbles: true }
    );

    document.dispatchEvent(event);
    expect(getToastTemplateSpy).toHaveBeenCalledTimes(1);
    expect(showToastSpy).toHaveBeenCalledTimes(1);
    expect(showToastSpy).toHaveBeenCalledWith(document.createElement('template').content);
    expect(initCloseToastListenerSpy).toHaveBeenCalledTimes(1);
  });

  it('should remove the toast when event is fired', async () => {
    await component.connectedCallback();

    // Show toast
    const toastEl = document.createElement('div');
    toastEl.classList.add('toast');
    document.body.appendChild(toastEl);

    const mockedEvent = vi.fn();
    const toast: any = document.querySelector('.toast')!;

    toast.addEventListener('hidden.bs.toast', mockedEvent);

    const event = new Event('hidden.bs.toast', {bubbles: true});
    toast.dispatchEvent(event);

    expect(mockedEvent).toHaveBeenCalledTimes(1)

  });
})