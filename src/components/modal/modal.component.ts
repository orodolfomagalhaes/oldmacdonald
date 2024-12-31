import {FarmService} from "../../services/farm/farm.service.ts";
import {IFarm} from "../../interfaces/farm.interface.ts";
import {ICropType} from "../../interfaces/crop-type.interface.ts";
import {ICropProduction} from "../../interfaces/crop-production.interface.ts";
import {SanitizerService} from "../../services/sanitizer/sanitizer.service.ts";

export class ModalComponent extends HTMLElement {
  farm: IFarm = {
    id: '',
    farmName: '',
    landArea: 0,
    unitOfMeasure: 'hectare',
    address: '',
    cropProductions: []
  };

  farmService: FarmService;
  sanitizer: SanitizerService;

  constructor(farmService = new FarmService(), sanitizerService = SanitizerService.getInstance()) {
    super();
    this.farmService = farmService
    this.sanitizer = sanitizerService;
  }

  connectedCallback() {
    this.render();
    this.initFarmModalGeneralListeners();
  }

  render(): void {
    this.innerHTML = `
      <div class="modal" tabindex="-1" id="farmModal" aria-labelledby="farmModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
          
            <div class="modal-header">
              <h5 class="modal-title">Farm Registration</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close modal"></button>
            </div>
            
            <div class="modal-body">
              <form>
                <div class="mb-3">
                  <label class="form-label">Farm Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    name="farmName"
                    value="${this.farm.farmName}"
                    aria-required="true"
                    required
                  />
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label">Land Area *</label>
                    <input
                      type="number"
                      class="form-control"
                      name="landArea"
                      value="${this.farm.landArea}"
                      aria-required="true"
                      required
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Unit of Measure *</label>
                    <select class="form-select" name="unitOfMeasure">
                      <option value="hectare" ${this.farm.unitOfMeasure == 'hectare' ? 'selected' : ''}>Hectare</option>
                      <option value="acre" ${this.farm.unitOfMeasure == 'acre' ? 'selected' : ''}>Acre</option>
                    </select>
                  </div>
                </div>
                <div class="mb-5">
                  <label class="form-label">Address</label>
                  <textarea
                    class="form-control"
                    name="address"
                  >${this.farm.address}</textarea>
                </div>            
              </form>

              <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2" id="productions">
                    <h6>Crop Productions *</h6>
                    <button
                      type="button"
                      class="btn btn-sm btn-primary add-production"
                    >
                      Add Production
                    </button>
                  </div>

                  <div id="production-list"></div>
                </div>                
            </div>
            
            <div class="modal-footer ${this.farm.id ? 'justify-content-between' : ''}">
              ${
                  this.farm.id 
                    ? `<button type="button" class="btn btn-danger delete">
                        Delete Farm
                      </button>` 
                    : ``
              }            
              <div class="main-buttons">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary submit">
                  Save
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      <div class="modal" tabindex="-1" id="deleteConfirmationModal" aria-labelledby="deleteConfirmationModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="deleteConfirmationModalLabel">Confirm deletion</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close modal"></button>
            </div>
            <div class="modal-body">
              Are you sure you want to delete this farm?
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary back" aria-label="Cancel deletion and return to the farm details modal">Back</button>
              <button class="btn btn-danger confirm" aria-label="Confirm deletion of the farm">Do it!</button>
            </div>
          </div>
        </div>
      </div>`;

    // Update crop items cards
    const productionList = this.querySelector('#production-list');
    this.farm.cropProductions?.forEach((production: any) => productionList!.appendChild(this.cropItemCardTemplate(production)));
  }

  getCropTypes(): ICropType[] {
    const app: any = document.querySelector('app-component');
    return app ? app.getCropTypeList() : [];
  }

  updateTemplate(farm: IFarm): void {
    this.farm = farm;
    this.render();
  }

  closeModal(elementIdentifier: string): void {
    const modal = this.querySelector(elementIdentifier);
    modal!.classList.value = 'modal';
    modal!.removeAttribute('style');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    modalBackdrop?.remove();
    document.body.removeAttribute('class');
    document.body.removeAttribute('style');
    // Remove Listeners
    if (elementIdentifier == '#farmModal') {
      this.removeFarmModalListeners();
    }
    if (elementIdentifier == '#deleteConfirmationModal') {
      this.removeDeleteConfirmationModalListeners();
    }
  }

  showModal(elementIdentifier: string): void {
    // @ts-ignore
    const modal = new bootstrap.Modal(this.querySelector(elementIdentifier));
    this.querySelector(elementIdentifier)!.removeAttribute('style');
    modal.show();
    // Add Listeners
    if (elementIdentifier == '#farmModal') {
      this.initFarmModalListeners();
    }
    if (elementIdentifier == '#deleteConfirmationModal') {
      this.initDeleteConfirmationModalListeners();
    }
  }

  resetFarm(): IFarm {
    return {
      id: '',
      farmName: '',
      landArea: 0,
      unitOfMeasure: 'hectare',
      address: '',
      cropProductions: []
    }
  }

  addCropProductionCard(): void {
    const newItem = this.cropItemCardTemplate();
    newItem.classList.add('new-crop');

    const productionList = this.querySelector('#production-list');
    productionList!.appendChild(newItem);
  }

  cropItemCardTemplate(cropProduction: any = null): HTMLElement {
    const isIrrigated = cropProduction && cropProduction.isIrrigated ? 'checked' : '';
    const isInsured = cropProduction && cropProduction.isInsured ? 'checked' : '';
    const card = document.createElement('div');
    card.classList.add('card');
    card.classList.add('mb-2');
    card.innerHTML = `<div class="card-body">
        <form id="${cropProduction?.id ? cropProduction.id : ''}">
          <div class="row">
            <div class="col-md-6">
              <label class="form-label">Crop Type</label>
              <select
                class="form-select"
                name="cropTypeId"
              >
                ${this.getCropTypes().map((item: any) => `
                  <option value="${item.id}" ${cropProduction?.cropTypeId === item.id ? 'selected' : ''}>
                    ${item.name}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="col-md-6">
              <div class="form-check mt-4">
                <input
                  type="checkbox"
                  name="isIrrigated"
                  class="form-check-input"
                  ${isIrrigated}
                />
                <label class="form-check-label">Irrigated</label>
              </div>
              <div class="form-check">
                <input
                  type="checkbox"
                  name="isInsured"
                  class="form-check-input"
                  ${isInsured}
                />
                <label class="form-check-label">Insured</label>
              </div>
            </div>
        </div>
        </form>
        <button
          type="button"
          class="btn btn-sm btn-danger mt-2 remove"
        >
          Remove
        </button>
      </div>`;

    // Remove crop item
    const btnRemove = card.querySelector('.btn.remove');
    btnRemove?.addEventListener('click', () => {
      // remove from DOM
      btnRemove?.closest('.card')?.remove();

      // mark as deleted
      if (!cropProduction) return;
      cropProduction.deletedAt = new Date().toISOString();
    });

    return card;
  }

  validateForm(form: any): boolean {
    const showSmallErrorMessage = (element: Element, message: string) => {
      const smallElement = element.parentElement?.querySelector('small');
      if (smallElement) return smallElement;

      const small = document.createElement('small');
      small.classList.add('invalid-feedback');
      small.textContent = message;
      element.parentElement?.appendChild(small);
      return small;
    }
    const setInvalid = (element: Element, message: string) => {
      element.classList.add('is-invalid');
      const small = showSmallErrorMessage(element, message);
      element.addEventListener('input', () => {
        element.classList.remove('is-invalid');
        small.remove();
      }, {once: true});
    }
    // farmName
    let isFormValid = true;
    const farmNameElement: any = form.elements['farmName'];
    if (!farmNameElement.checkValidity()) {
      setInvalid(farmNameElement, 'Farm Name is required.');
      isFormValid = false;
    }
    // landArea
    const landAreaElement: any = form.elements['landArea'];
    if (!landAreaElement.checkValidity()) {
      setInvalid(landAreaElement, 'Land Area is required.');
      isFormValid = false;
    }
    if (landAreaElement.checkValidity() && landAreaElement.valueAsNumber < 1) {
      setInvalid(landAreaElement, 'Land Area must be greater than 0.');
      isFormValid = false;
    }
    // cropProductions
    const cropProductionsList = this.querySelectorAll('#production-list form');
    if (!cropProductionsList.length) {
      const productionsElement = this.querySelector('#productions');
      productionsElement!.classList.add('is-invalid');
      const smallElement = showSmallErrorMessage(productionsElement!, 'Include at least one item in the List of Crop Productions for this farm.');
      const addCropProductionButton = this.querySelector('.add-production');
      addCropProductionButton!.addEventListener('click', () => {
        productionsElement!.classList.remove('is-invalid');
        smallElement.remove();
      }, {once: true});
      isFormValid = false;
    }
    return isFormValid;
  }

  async save(): Promise<any> {
    const farmForm: any = this.querySelector('.modal-body form');
    if (!this.validateForm(farmForm)) return;
    // Retrieve farm values from form
    const farm: IFarm = {
      farmName: this.sanitizer.sanitize(farmForm.elements.farmName.value),
      landArea: farmForm.elements.landArea.value,
      unitOfMeasure: this.sanitizer.sanitize(farmForm.elements.unitOfMeasure.value),
      address: this.sanitizer.sanitize(farmForm.elements.address.value)
    }
    // Get crop items from cards
    const cropProductions: ICropProduction[] = [];
    const productionList = this.querySelectorAll('#production-list .card');
    productionList.forEach(item => {
      const form: any = item.querySelector('form');
      // Check if it's an existing crop
      const cropItem: ICropProduction = {
        id: this.sanitizer.sanitize(form.id),
        cropTypeId: this.sanitizer.sanitize(form.elements.cropTypeId.value),
        isIrrigated: form.elements.isIrrigated.checked,
        isInsured: form.elements.isInsured.checked
      }
      if (!form.id) delete cropItem.id;
      cropProductions.push(cropItem);
    });
    // Merge cropProductions
    this.farm.cropProductions!.forEach(i => {
      const isDuplicated = cropProductions!.find(c => c.id == i.id);
      if (!isDuplicated) {
        cropProductions!.push(i);
      }
    });

    // Add new crop values to farm object
    farm.cropProductions = cropProductions;

    // Save or create
    if (this.farm.id) {
      farm.id = this.farm.id;
      const response: any = await this.farmService.save(farm);
      this.handleResponse(response);
    }
    else {
      const response: any = await this.farmService.create(farm);
      this.handleResponse(response);
    }
  }

  async delete(farmId: string): Promise<void> {
    const response: any = await this.farmService.destroy(farmId);
    this.handleResponse(response);
  }

  handleResponse(response: any) {
    if (response.success) {
      this.closeModal('#farmModal');
      this.farm = this.resetFarm();
      this.render();
      this.showToastEvent({style: 'success', message: response.message});
      return;
    }
    this.showToastEvent({style: 'danger', message: response.message});
  }

  showToastEvent(params: {style: string, message: string | unknown}): void {
    const event = new CustomEvent('show-toast', {detail: params, bubbles: true});
    document.dispatchEvent(event);
  }

  // LISTENERS
  initFarmModalGeneralListeners(): void {
    // Edit farm event
    document.addEventListener('show-farm-detail', (event: Event) => {
      const { detail } = event as CustomEvent;
      const farm = detail as IFarm;
      this.updateTemplate(farm);
      this.showModal('#farmModal');
    });
    // Add new farm event
    document.addEventListener('add-new-farm', () => {
      this.showModal('#farmModal');
    });
    // Close modal event
    this.addEventListener('hidden.bs.modal', () => {
      // Reverts the deletedAt mark
      this.farm.cropProductions = this.farm.cropProductions!.map((item: any) => { delete item.deletedAt; return item; });
      this.farm = this.resetFarm();
      this.render();
    });
  }

  private addProductionEvent: any;
  private btnSubmitEvent: any;
  private btnDeleteEvent: any;
  initFarmModalListeners(): void {
    const addCropProductionButton = this.querySelector('.add-production');
    this.addProductionEvent = () => this.addCropProductionCard();
    addCropProductionButton!.addEventListener('click', this.addProductionEvent);

    const btnSubmit = this.querySelector('.modal-footer .submit');
    this.btnSubmitEvent = () => this.save();
    btnSubmit?.addEventListener('click', this.btnSubmitEvent);

    if (this.farm) {
      const btnDelete = this.querySelector('.modal-footer .delete');
      this.btnDeleteEvent = () => {
        this.closeModal('#farmModal');
        this.showModal('#deleteConfirmationModal');
      }
      btnDelete?.addEventListener('click', this.btnDeleteEvent);
    }
  }

  removeFarmModalListeners(): void {
    this.querySelector('.add-production')!.removeEventListener("click", this.addProductionEvent);
    this.querySelector('.modal-footer .submit')!.removeEventListener("click", this.btnSubmitEvent);
    this.querySelector('.modal-footer .delete')?.removeEventListener("click", this.btnDeleteEvent);
  }

  private btnBackEvent: any;
  private btnConfirmEvent: any;
  initDeleteConfirmationModalListeners(): void {
    const deleteConfirmationModal = this.querySelector('#deleteConfirmationModal');
    const btnBack = deleteConfirmationModal?.querySelector('.modal-footer .back');
    this.btnBackEvent = () => {
      this.closeModal('#deleteConfirmationModal');
      this.showModal('#farmModal');
    }
    btnBack?.addEventListener('click', this.btnBackEvent);
    const btnConfirm = deleteConfirmationModal?.querySelector('.modal-footer .confirm');
    this.btnConfirmEvent = () => {
      this.delete(this.farm.id!);
    }
    btnConfirm?.addEventListener('click', this.btnConfirmEvent);
  }

  removeDeleteConfirmationModalListeners(): void {
    const deleteConfirmationModal = this.querySelector('#deleteConfirmationModal');
    deleteConfirmationModal?.querySelector('.modal-footer .back')!.removeEventListener('click', this.btnBackEvent);
    deleteConfirmationModal?.querySelector('.modal-footer .confirm')!.removeEventListener('click', this.btnConfirmEvent);
  }

}

customElements.define('modal-component', ModalComponent);