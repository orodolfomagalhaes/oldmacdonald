import { expect, it, afterEach, beforeEach, describe, vi } from 'vitest';
import {ModalComponent} from "./modal.component.ts";

class MockModal {
  show = vi.fn();
  hide = vi.fn();
}

const mockBootstrap = {
  Modal: MockModal
};
const getCropTypesMock = [
  {
    "id": "ct001",
    "name": "Soja"
  },
  {
    "id": "ct002",
    "name": "Milho"
  },
  {
    "id": "ct003",
    "name": "Algodão"
  },
  {
    "id": "ct004",
    "name": "Feijão"
  },
  {
    "id": "ct005",
    "name": "Café"
  },
  {
    "id": "ct006",
    "name": "Arroz"
  },
  {
    "id": "ct007",
    "name": "Trigo"
  },
  {
    "id": "ct008",
    "name": "Cana-de-açúcar"
  },
  {
    "id": "ct009",
    "name": "Cevada"
  },
  {
    "id": "ct010",
    "name": "Aveia"
  }
];

const qs = (value: string) => document.querySelector(value);
const qsa = (value: string) => document.querySelectorAll(value);

// @ts-ignore
globalThis.bootstrap = mockBootstrap;

describe('ModalComponent', () => {
  let component: ModalComponent;

  const mockedFarmDataUpdate: any = {
    id: '789',
    farmName: 'Fazenda Esperança',
    landArea: 200,
    unitOfMeasure: 'hectare',
    address: 'Rua do Campo, 123, Interior - SP',
    cropProductions: [
      {
        id: 'cp001',
        cropTypeId: "ct001",
        isIrrigated: true,
        isInsured: false,
        farmId: '789'
      },
      {
        id: 'cp002',
        cropTypeId: "ct002",
        isIrrigated: true,
        isInsured: false,
        farmId: '789'
      }
    ]
  };

  globalThis.fetch = vi.fn();

  beforeEach(() => {
    component = new ModalComponent();
    document.body.appendChild(component);
  })

  afterEach(() => {
    document.body.removeChild(component);

    vi.clearAllMocks();
    vi.resetAllMocks();
  })

  it('should create component', () => {
    document.body.removeChild(component);
    const initFarmModalGeneralListenersSpy = vi.spyOn(component, 'initFarmModalGeneralListeners');
    document.body.appendChild(component);

    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
    expect(initFarmModalGeneralListenersSpy).toHaveBeenCalledTimes(1)
  });

  it('should render modal with farm details when show-farm-detail event is called', () => {
    component.getCropTypes = vi.fn().mockReturnValue(getCropTypesMock);
    const spyUpdateTemplate = vi.spyOn(component, 'updateTemplate');
    const spyShowModal = vi.spyOn(component, 'showModal');
    const event = new CustomEvent('show-farm-detail', {detail: mockedFarmDataUpdate, bubbles: true});
    document.dispatchEvent(event);

    const farmName: any = qs('input[name="farmName"]');
    const landArea: any = qs('input[name="landArea"]');
    const unitOfMeasure: any = qs('select[name="unitOfMeasure"]');
    const address: any = qs('textarea[name="address"]');
    // @ts-ignore
    const formCropProductionOne = qsa('#production-list form')[0].elements;
    // @ts-ignore
    const formCropProductionTwo = qsa('#production-list form')[1].elements;

    // Farm details
    expect(farmName.value).toBe(mockedFarmDataUpdate.farmName);
    expect(Number(landArea.value)).toBe(mockedFarmDataUpdate.landArea);
    expect(unitOfMeasure.value).toBe(mockedFarmDataUpdate.unitOfMeasure);
    expect(address.value).toBe(mockedFarmDataUpdate.address);
    // Crop item one
    expect(formCropProductionOne.cropTypeId.value).toBe(mockedFarmDataUpdate.cropProductions[0].cropTypeId);
    expect(formCropProductionOne.isInsured.checked).toBe(mockedFarmDataUpdate.cropProductions[0].isInsured);
    expect(formCropProductionOne.isIrrigated.checked).toBe(mockedFarmDataUpdate.cropProductions[0].isIrrigated);
    // Crop item two
    expect(formCropProductionTwo.cropTypeId.value).toBe(mockedFarmDataUpdate.cropProductions[1].cropTypeId);
    expect(formCropProductionTwo.isInsured.checked).toBe(mockedFarmDataUpdate.cropProductions[1].isInsured);
    expect(formCropProductionTwo.isIrrigated.checked).toBe(mockedFarmDataUpdate.cropProductions[1].isIrrigated);

    expect(component.farm).toEqual(mockedFarmDataUpdate);
    expect(spyUpdateTemplate).toHaveBeenCalledWith(mockedFarmDataUpdate);
    expect(spyShowModal).toHaveBeenCalled();
    expect(component).toMatchSnapshot();
  });

  it('should open delete confirmation modal', () => {
    const event = new CustomEvent('show-farm-detail', {detail: mockedFarmDataUpdate, bubbles: true});
    document.dispatchEvent(event);

    const closeModalSpy = vi.spyOn(component, 'closeModal');
    const showModalSpy = vi.spyOn(component, 'showModal');
    const initDeleteConfirmationModalListenersSpy = vi.spyOn(component, 'initDeleteConfirmationModalListeners');
    const removeFarmModalListenersSpy = vi.spyOn(component, 'removeFarmModalListeners');

    const deleteButton: any = qs('button.delete');
    deleteButton?.click();

    expect(closeModalSpy).toHaveBeenCalledTimes(1);
    expect(closeModalSpy).toHaveBeenCalledWith('#farmModal');
    expect(showModalSpy).toHaveBeenCalledTimes(1);
    expect(showModalSpy).toHaveBeenCalledWith('#deleteConfirmationModal');
    expect(initDeleteConfirmationModalListenersSpy).toHaveBeenCalled();
    expect(removeFarmModalListenersSpy).toHaveBeenCalled();
  });

  it('should delete a farm when confirmed', async () => {
    // open modal
    const event = new CustomEvent('show-farm-detail', {detail: mockedFarmDataUpdate, bubbles: true});
    document.dispatchEvent(event);
    // open confirmation modal
    const deleteButton: any = qs('button.delete');
    deleteButton?.click();

    component.farmService.destroy = vi.fn().mockResolvedValue({deleted: true});

    const deleteSpy = vi.spyOn(component, 'delete');
    const handleResponseSpy = vi.spyOn(component, 'handleResponse');

    const confirmDeletionButton: any = qs('button.confirm');
    confirmDeletionButton?.click();

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(mockedFarmDataUpdate.id);

    await Promise.resolve()
    expect(handleResponseSpy).toHaveBeenCalled();

  });

  it('should go back to farm detail modal when back button is cliked', () => {
    const event = new CustomEvent('show-farm-detail', {detail: mockedFarmDataUpdate, bubbles: true});
    document.dispatchEvent(event);
    // open confirmation modal
    const deleteButton: any = qs('button.delete');
    deleteButton?.click();

    const closeModalSpy = vi.spyOn(component, 'closeModal');
    const showModalSpy = vi.spyOn(component, 'showModal');
    const removeDeleteConfirmationModalListenersSpy = vi.spyOn(component, 'removeDeleteConfirmationModalListeners');
    const initFarmModalListenersSpy = vi.spyOn(component, 'initFarmModalListeners');

    const back: any = qs('button.back');
    back?.click();

    expect(closeModalSpy).toHaveBeenCalledTimes(1);
    expect(closeModalSpy).toHaveBeenCalledWith('#deleteConfirmationModal');
    expect(showModalSpy).toHaveBeenCalledTimes(1);
    expect(showModalSpy).toHaveBeenCalledWith('#farmModal');
    expect(removeDeleteConfirmationModalListenersSpy).toHaveBeenCalled();
    expect(initFarmModalListenersSpy).toHaveBeenCalled();
  });

  it('should reset farm object', () => {
    const resetedFarm = {id: '',farmName: '',landArea: 0,unitOfMeasure: 'hectare',address: '',cropProductions: []}
    const event = new CustomEvent('show-farm-detail', {detail: mockedFarmDataUpdate, bubbles: true});
    document.dispatchEvent(event);
    expect(component.farm).toEqual(mockedFarmDataUpdate);

    component.farm = component.resetFarm();
    expect(component.farm).toEqual(resetedFarm);
  });

  it('should add new crop item to list', () => {
    const spyInitFarmModalListeners = vi.spyOn(component, 'initFarmModalListeners');
    const spyAddCropProductionCard = vi.spyOn(component, 'addCropProductionCard');

    component.showModal('#farmModal');
    const button: any = qs('.add-production');
    button?.click();
    let productionList: any = qsa('#production-list .card');

    expect(spyInitFarmModalListeners).toHaveBeenCalled();
    expect(spyAddCropProductionCard).toHaveBeenCalled();
    expect(productionList.length).toBe(1);

    button?.click();
    productionList = qsa('#production-list .card');
    expect(productionList.length).toBe(2);
  });

  it('should remove crop item from list', () => {
    const event = new CustomEvent('show-farm-detail', {detail: mockedFarmDataUpdate, bubbles: true});
    document.dispatchEvent(event);

    let productionList: any = qsa('#production-list .card');
    expect(productionList.length).toBe(2);

    const removeButton: any = qs('#production-list .card .remove');
    removeButton?.click();
    productionList = qsa('#production-list .card');
    expect(productionList.length).toBe(1);

    // @ts-ignore
    expect(component.farm.cropProductions[0]).toHaveProperty('deletedAt');
  });

  it('should save an updated farm', async () => {
    const event = new CustomEvent('show-farm-detail', {detail: mockedFarmDataUpdate, bubbles: true});
    document.dispatchEvent(event);
    const farmName: any = qs('input[name="farmName"]');
    farmName.value = 'Fazenda Bom Sucesso';
    const farmNameEvent = new Event('input', { bubbles: true });
    farmName.dispatchEvent(farmNameEvent);
    const submitButton: any = qs('button.submit');
    submitButton?.click();
    component.farmService.save = vi.fn().mockResolvedValue({success: true});

    const validateFormSpy = vi.spyOn(component, 'validateForm');
    component.save();

    const farmForm: any = qs('.modal-body form');
    expect(validateFormSpy).toHaveBeenCalledTimes(1);
    expect(validateFormSpy).toHaveBeenNthCalledWith(1, farmForm);

    const handleResponseSpy = vi.spyOn(component, 'handleResponse');
    await Promise.resolve();
    expect(handleResponseSpy).toHaveBeenCalled();
  });

  it('should validate an invalid field and mark it with is-invalid class', () => {
    const event = new CustomEvent('add-new-farm', {bubbles: true});
    document.dispatchEvent(event);

    const farmName: any = qs('input[name="farmName"]');
    const landArea: any = qs('input[name="landArea"]');
    const productionsElement: any = qs('#productions');

    const validateFormSpy = vi.spyOn(component, 'validateForm');
    const farmForm: any = qs('.modal-body form');
    component.save();

    expect(validateFormSpy).toHaveBeenCalledTimes(1);
    expect(validateFormSpy).toHaveBeenNthCalledWith(1, farmForm);
    expect(validateFormSpy).toReturnWith(false);
    expect(farmName.classList.contains('is-invalid')).toBeTruthy();
    expect(landArea.classList.contains('is-invalid')).toBeTruthy();
    expect(productionsElement.classList.contains('is-invalid')).toBeTruthy();
  });

  it('should fill the invalid fields and remove is-invalid class', async () => {
    const event = new CustomEvent('add-new-farm', {bubbles: true});
    component.farmService.create = vi.fn().mockResolvedValue({success: true});
    document.dispatchEvent(event);
    component.showModal('#farmModal');
    const form: any = qs('.modal-body form');
    form.elements.landArea.value = '';
    component.save(); // to make it invalid
    const productionsElement: any = qs('#productions');
    // update values
    form.elements.farmName.value = 'Fazenda Bom Sucesso';
    form.elements.farmName.dispatchEvent(new Event('input', { bubbles: true }));
    form.elements.landArea.value = '1200';
    form.elements.landArea.dispatchEvent(new Event('input', { bubbles: true }));
    const addProductionButton: any = qs('.add-production');
    addProductionButton?.click();

    const validateFormSpy = vi.spyOn(component, 'validateForm');
    component.save();

    expect(validateFormSpy).toHaveBeenCalledTimes(1);
    expect(validateFormSpy).toHaveBeenNthCalledWith(1, form);
    expect(validateFormSpy).toReturnWith(true);
    expect(form.elements.farmName.classList.contains('is-invalid')).toBeFalsy();
    expect(form.elements.landArea.classList.contains('is-invalid')).toBeFalsy();
    expect(productionsElement.classList.contains('is-invalid')).toBeFalsy();

    const handleResponseSpy = vi.spyOn(component, 'handleResponse');
    await Promise.resolve();
    expect(handleResponseSpy).toHaveBeenCalled();
  });

  it('should get CropTypes list', () => {
    const getCropTypes = vi.spyOn(component, 'getCropTypes');
    component.getCropTypes();
    expect(getCropTypes).toHaveBeenCalled();
    expect(getCropTypes).toReturnWith([]);
  });

  it('should close modal when event is fired', () => {
    const closeModalEvent = new Event('hidden.bs.modal', { bubbles: true });
    const closeButton: any = qs('.btn-close')
    closeButton.dispatchEvent(closeModalEvent);
  });

  it('should handle the response of farmService requests', () => {
    const successResponse = { success: true, message: 'Success!' };
    const errorResponse = { success: false, message: 'Error!' };
    const handleResponseSpy = vi.spyOn(component, 'handleResponse');
    const showToastEventSpy = vi.spyOn(component, 'showToastEvent');

    const showToastEvent = vi.fn();
    document.addEventListener('show-toast', showToastEvent);

    component.handleResponse(successResponse);
    expect(handleResponseSpy).toHaveBeenCalledWith(successResponse);
    component.handleResponse(errorResponse);
    expect(handleResponseSpy).toHaveBeenCalledWith(errorResponse);
    expect(showToastEventSpy).toHaveBeenCalledTimes(2);
    expect(showToastEvent).toHaveBeenCalledTimes(2);
  });

});