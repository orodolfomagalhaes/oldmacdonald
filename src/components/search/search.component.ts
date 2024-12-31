import './search.component.css';
import {SanitizerService} from "../../services/sanitizer/sanitizer.service.ts";
export class SearchComponent extends HTMLElement {
  inputValue: string = '';
  timeout: undefined | number;
  private sanitizer: SanitizerService;

  constructor(sanitizerService: SanitizerService = SanitizerService.getInstance()) {
    super();
    this.sanitizer = sanitizerService;
  }

  connectedCallback():void {
    this.render();
    this.initInputListener();
    this.initClearButtonListener();
  }

  render(): void {
    this.innerHTML = `
    <div class="search-container mb-3" >
      <div class="d-flex align-items-center gap-2 search-input-group">
        <div class="input-group">
          <i class="fa fa-search input-group-text" id="basic-addon1" aria-hidden="true"></i>
          <input 
            type="text" 
            id="search-input" 
            class="form-control" 
            placeholder="Farm name" 
            aria-label="Search farm by full name" 
            aria-describedby="basic-addon1">
        </div>
        <button type="button" class="btn btn-link btn-clear d-none">clear</button>
      </div>
      <i class="fa fa-info-circle fa-1" 
         aria-hidden="true"
         data-bs-toggle="tooltip" 
         aria-label="Please search using the full farm name, as the current version of json-server does not support filtering with regular expressions." 
         data-bs-title="Please search using the full farm name, as the current version of json-server does not support filtering with regular expressions." 
         data-bs-placement="right"></i>     
    </div>`;

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    // @ts-ignore
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  }

  initInputListener(): void {
    const input: HTMLInputElement | null = this.querySelector('#search-input');
    input?.addEventListener('input', (event: Event) => {
      const { value } = event.target as HTMLInputElement;
      const sanitizedValue = this.sanitizer.sanitize(value);
      if (this.inputValue !== sanitizedValue) {
        this.inputValue = sanitizedValue;
        if (this.inputValue) {
          this.showClearButton();
        } else {
          this.hideClearButton();
        }
        this.debounce(() => this.dispatchSearchEvent(this.inputValue));
      }
    });
  }

  debounce(fn: Function, delay: number = 700): void {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(fn , delay);
  }

  initClearButtonListener(): void {
    const button = this.querySelector('.btn-clear');
    button?.addEventListener('click', () => {
      const input: any = this.querySelector('#search-input');
      input.value = '';
      this.inputValue = '';
      this.hideClearButton();
      this.debounce(() => this.dispatchSearchEvent(this.inputValue));
    })
  }

  showClearButton(): void {
    const clearButton: Element | null = this.querySelector('.btn-clear');
    clearButton?.classList.remove('d-none');
  }

  hideClearButton(): void {
    const clearButton: Element | null = this.querySelector('.btn-clear');
    clearButton?.classList.add('d-none');
  }

  dispatchSearchEvent(value: string): void {
    const event = new CustomEvent('search-event', {detail: value, bubbles: true});
    document.dispatchEvent(event);
  }

}
customElements.define('search-component', SearchComponent);