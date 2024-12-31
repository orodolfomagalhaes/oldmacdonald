export class HeaderComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    this.render();
    this.initButtonAddFarmListener();
  }

  render(): void {
    this.innerHTML = `<div class="header d-flex justify-content-between align-items-end">      
      <div class="company-logo">
        <h1>Farms</h1>
        <span class="text-body-secondary">Manage your farms.</span>
      </div>
      <div class="actions">
        <button 
          type="button" 
          class="btn btn-primary" 
          id="add-farm"
          aria-label="Add a new farm"
          >
            <i class="fa fa-plus me-1" aria-hidden="true"></i>
            Add Farm
        </button>
      </div>              
    </div>   
    <hr>`;
  }

  initButtonAddFarmListener(): void {
    const btnAddFarm = this.querySelector('#add-farm');
    btnAddFarm?.addEventListener('click', () => {
      const event = new CustomEvent('add-new-farm', {bubbles: true});
      document.dispatchEvent(event);
    });
  }
}
customElements.define('header-component', HeaderComponent);