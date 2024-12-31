export * from "./components/header";
export * from "./components/search";
export * from "./components/modal";
export * from "./components/table";

import {ICropType} from "./interfaces/crop-type.interface.ts";
import {CropTypesService} from "./services/crop-types/crop-types.service.ts";

export class AppComponent extends HTMLElement {

  private cropTypeList: ICropType[] = [];
  private cropTypeService: CropTypesService;

  constructor(cropTypeService = new CropTypesService()) {
    super();
    this.cropTypeService = cropTypeService;
  }

  async connectedCallback(): Promise<void> {
    this.cropTypeList = await this.cropTypeService.getAll();

    this.render();
    this.initShowToastListener();
  }

  render(): void {
    this.innerHTML = `<div class="container my-5">
      <header-component></header-component>
      <div class="content pt-4">
        <search-component></search-component>
        <table-component></table-component>
      </div>
    </div>
    <!-- Modal -->
    <modal-component></modal-component>
`;
  }

  getCropTypeList(): ICropType[] {
    return this.cropTypeList;
  }

  showToastEvent: any;
  initShowToastListener(): void {
    this.showToastEvent = (event: Event) => {
      const { detail } = event as CustomEvent;
      const toastTemplate = this.getToastTemplate(detail.style, detail.message);
      this.showToast(toastTemplate);
      this.initCloseToastListener();
    }
    document.addEventListener('show-toast', this.showToastEvent);
  }

  initCloseToastListener(): void {
    const toast = document.querySelector('.toast');
    toast!.addEventListener('hidden.bs.toast', () => {
      this.removeToast();
    }, {once: true});
  }

  appendToast(toast: DocumentFragment): void {
    document.body.appendChild(toast);
  }

  removeToast(): void {
    const toast = document.querySelector('.toast-container')!;
    toast.remove();
  }

  getToastTemplate(style: string, message: string): DocumentFragment {
    const toast = document.createElement('template');
    toast.innerHTML = `<div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div class="toast text-bg-${style}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>`;

    return toast.content;
  }

  showToast(template: DocumentFragment): void {
    this.appendToast(template);
    // @ts-ignore
    let toast = bootstrap.Toast.getOrCreateInstance(document.querySelector('.toast'), {delay: 2000});
    toast.show();
  }

}

customElements.define('app-component', AppComponent);