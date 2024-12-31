import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TableComponent } from './table.component';
import {IPaginatedItems} from "../../interfaces/paginated-items.interface.ts";
import {FarmService} from "../../services/farm/farm.service.ts";

const mockFarmData: IPaginatedItems = {
  data: [
    { id: '789', farmName: 'Fazenda Boa Vista', address: 'Test Address', landArea: 100, unitOfMeasure: 'hectares',
      cropProductions: [
        {id: 'cp001',cropTypeId: "ct001",isIrrigated: true,isInsured: false,farmId: '789'},
        {id: 'cp002',cropTypeId: "ct002",isIrrigated: true,isInsured: false,farmId: '789'}
      ]
    },
    { id: '123', farmName: 'Fazenda Nova Esperança', address: 'Test Address', landArea: 100, unitOfMeasure: 'hectares',
      cropProductions: [
        {id: 'cp001',cropTypeId: "ct001",isIrrigated: true,isInsured: false,farmId: '123'},
        {id: 'cp002',cropTypeId: "ct002",isIrrigated: true,isInsured: false,farmId: '123'}
      ]
    }
  ],
  first: 1,
  items: 2,
  last: 1,
  next: null,
  pages: 1,
  prev: null
};
describe('TableComponent', () => {
  let component: TableComponent;
  globalThis.fetch = vi.fn();

  beforeEach(() => {
    component = new TableComponent();
    component.getFarms = vi.fn().mockResolvedValue(mockFarmData);
    document.body.appendChild(component);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();

    // disable events for tests to enable when needed
    document.removeEventListener('show-toast', component.updateComponentToastEvent);
    document.removeEventListener('search-event', component.searchListenerEvent);
  });

  it('should create component', async () => {
    // disable show events for all tests to enable when needed
    document.removeEventListener('show-toast', component.updateComponentToastEvent);

    const noFarmDataMock = {data: [],first: 1,items: 0,last: 1,next: null,pages: 1,prev: null}
    component.getFarms = vi.fn().mockResolvedValue(noFarmDataMock);
    const updateComponentSpy = vi.spyOn(component, 'updateComponent');
    const getFarmsSpy = vi.spyOn(component, 'getFarms');
    await component.connectedCallback();
    const tbody = component.querySelector('table tbody');

    expect(component).toBeTruthy();
    expect(getFarmsSpy).toHaveBeenCalledOnce();
    expect(updateComponentSpy).toHaveBeenNthCalledWith(1, noFarmDataMock);
    expect(tbody!.innerHTML).toContain('<td colspan="5" class="text-center">No records found</td>');
    expect(component).toMatchSnapshot();

  });

  it('should render table with correct structure', () => {
    // disable events for tests to enable when needed
    document.removeEventListener('show-toast', component.updateComponentToastEvent);

    const paginationMock = document.createElement('nav');
    vi.spyOn(component, 'querySelector').mockReturnValue(paginationMock);
    vi.spyOn(component, 'showPagination').mockReturnValue('<div>Pagination Mock</div>');
    component.render();

    expect(component.innerHTML).toContain('table-responsive-sm');
    expect(component.innerHTML).toContain('aria-label="List of farms');
    expect(component.innerHTML).toContain('<thead>');
    expect(component.innerHTML).toContain('<tbody class="table-group-divider">');
  });

  it('should add data to the table when available', async () => {
    // disable events for tests to enable when needed
    document.removeEventListener('search-event', component.searchListenerEvent);
    document.removeEventListener('show-toast', component.updateComponentToastEvent);

    await component.connectedCallback();
    const rows = component.querySelectorAll('table tbody tr');

    expect(rows.length).toBe(2);
    expect(rows[0].querySelectorAll('td')[0].innerText).toEqual('Fazenda Boa Vista');
    expect(rows[1].querySelectorAll('td')[0].innerText).toBe('Fazenda Nova Esperança');

  });

  it('should dispatch an event when a table row is clicked', async () => {
    // disable events for tests to enable when needed
    document.removeEventListener('search-event', component.searchListenerEvent);
    document.removeEventListener('show-toast', component.updateComponentToastEvent);

    const eventListener = vi.fn();
    document.addEventListener('show-farm-detail', eventListener);
    await component.connectedCallback();
    const row: any = component.querySelector('table tbody tr')!;
    row.click();

    const capturedEvent = eventListener.mock.calls[0][0];

    expect(eventListener).toHaveBeenCalledTimes(1);
    expect(capturedEvent.type).toBe('show-farm-detail');
    expect(capturedEvent.detail).toEqual(mockFarmData.data[0]);

  });

  it('should update table when show-toast event is captured', async () => {
    const updateComponentSpy = vi.spyOn(component, 'updateComponent');
    const customEvent = new CustomEvent('show-toast', {
      detail: { message: 'Data updated', type: 'success' },
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(customEvent);
    await Promise.resolve();

    expect(component.currentPage).toBe(1);
    expect(component.pages).toBe(1);
    expect(updateComponentSpy).toHaveBeenCalledTimes(1);
  });

  it('should correctly map crop productions to names', () => {
    const cropProductions = [
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
    ];
    component.getCropTypesMap = vi.fn().mockReturnValue({
      "ct001": "Soja",
      "ct002": "Milho"
    })
    const result = component.mapCropProductions(cropProductions);

    expect(result).toBe('Soja, Milho');
  });

  it('should init pagination click listener', async () => {
    document.removeEventListener('search-event', component.searchListenerEvent);
    const paginationListenerSpy = vi.spyOn(component, 'initPaginationClickListener');
    await component.connectedCallback();

    expect(paginationListenerSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle "next" page navigation', () => {
    component.currentPage = 1;
    const result = component.getPaginationParams('next');
    expect(result).toEqual({ _page: 2, _per_page: 10 });
  });

  it('should handle "prev" page navigation', () => {
    component.currentPage = 2;
    const result = component.getPaginationParams('prev');
    expect(result).toEqual({ _page: 1, _per_page: 10 });
  });

  it('should handle numeric page navigation', () => {
    const result = component.getPaginationParams('3');
    expect(result).toEqual({ _page: 3, _per_page: 10 });
  });

  it('should return undefined for invalid or same page', () => {
    expect(component.getPaginationParams('')).toBeUndefined();
    expect(component.getPaginationParams('1')).toBeUndefined();
  });

  it('should to next page', async () => {
    document.removeEventListener('search-event', component.searchListenerEvent);
    const mockedPageOne: IPaginatedItems = {
      data: [
        { id: '789', farmName: 'Fazenda Boa Vista', address: 'Test Address', landArea: 100, unitOfMeasure: 'hectares',
          cropProductions: [
            {id: 'cp001',cropTypeId: "ct001",isIrrigated: true,isInsured: false,farmId: '789'},
            {id: 'cp002',cropTypeId: "ct002",isIrrigated: true,isInsured: false,farmId: '789'}
          ]
        }
      ],
      first: 1,
      items: 2,
      last: 2,
      next: 2,
      pages: 2,
      prev: null
    };
    const mockedPageTwo: IPaginatedItems = {
      data: [
        { id: '123', farmName: 'Fazenda Nova Esperança', address: 'Test Address', landArea: 100, unitOfMeasure: 'hectares',
          cropProductions: [
            {id: 'cp001',cropTypeId: "ct001",isIrrigated: true,isInsured: false,farmId: '123'},
            {id: 'cp002',cropTypeId: "ct002",isIrrigated: true,isInsured: false,farmId: '123'}
          ]
        }
      ],
      first: 1,
      items: 2,
      last: 2,
      next: null,
      pages: 2,
      prev: 1
    };
    component.getFarms = vi.fn().mockResolvedValue(mockedPageOne);
    component.pageSize = 1;
    await component.connectedCallback();

    const getPaginationParamsSpy = vi.spyOn(component, 'getPaginationParams');
    const updatePaginationComponentStateSpy = vi.spyOn(component, 'updatePaginationComponentState');
    const updateTableDataSpy = vi.spyOn(component, 'updateTableData');
    component.getFarms = vi.fn().mockResolvedValue(mockedPageTwo);

    const pagination = document.querySelector('.pagination');
    const pageTwo: any = pagination?.querySelector('[data-page="2"]');
    pageTwo?.click();

    expect(getPaginationParamsSpy).toHaveBeenCalledTimes(1);
    expect(getPaginationParamsSpy).toHaveBeenCalledWith('2');
    expect(getPaginationParamsSpy).toReturnWith({_page: 2, _per_page: component.pageSize });
    await expect(component.getFarms).toHaveBeenCalledWith(undefined, {_page: 2, _per_page: component.pageSize });

    expect(updatePaginationComponentStateSpy).toHaveBeenCalledTimes(1);
    expect(updateTableDataSpy).toHaveBeenCalledTimes(1);
    expect(updateTableDataSpy).toHaveBeenCalledWith(mockedPageTwo.data);
    expect(component.currentPage).toBe(2);

    const pageOne: any = pagination?.querySelector('[data-page="1"]');
    pageOne.click();
    expect(getPaginationParamsSpy).toHaveBeenCalledTimes(2);
    expect(getPaginationParamsSpy).toHaveBeenCalledWith('1');
    expect(getPaginationParamsSpy).toReturnWith({_page: 1, _per_page: component.pageSize });
    await Promise.resolve()
    expect(component.currentPage).toBe(1);

    pageOne.click();
    expect(getPaginationParamsSpy).toHaveNthReturnedWith(3, undefined);
  });

  it('should init page selector listener', async () => {
    document.removeEventListener('search-event', component.searchListenerEvent);
    const pageSelectorListenerSpy = vi.spyOn(component, 'initPageSelectorListener');
    await component.connectedCallback();

    expect(pageSelectorListenerSpy).toHaveBeenCalledTimes(1);
  });

  it('should call farmService getAllFarms', () => {
    class MockedFarmService extends FarmService {
      getAllFarms: any = () => {
        vi.fn().mockResolvedValue(mockFarmData)
      }
    }
    const mockedFarmService = new MockedFarmService()
    const component = new TableComponent(mockedFarmService);
    const getAllFarmsSpy = vi.spyOn(mockedFarmService, 'getAllFarms');
    component.getFarms();

    expect(getAllFarmsSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle page size selection', async () => {
    await component.connectedCallback();
    let pageSizeSelector: any = component.querySelector('#page-size-selector select');
    expect(pageSizeSelector.value).toBe('10');

    const updateComponentSpy = vi.spyOn(component, 'updateComponent');
    pageSizeSelector.value = '25';
    let changeEvent = new Event('change');
    pageSizeSelector?.dispatchEvent(changeEvent);
    expect(component.pageSize).toBe(25);

    await Promise.resolve()
    expect(updateComponentSpy).toHaveBeenCalledTimes(1);

    pageSizeSelector.value = '50';
    pageSizeSelector?.dispatchEvent(changeEvent);
    expect(component.pageSize).toBe(50);

    await Promise.resolve()
    expect(updateComponentSpy).toHaveBeenCalledTimes(2);

  });

  it('should handle search listener', async () => {
    const searchEventListener = vi.fn();
    document.addEventListener('search-event', searchEventListener);
    const initSearchListenerSpy = vi.spyOn(component, 'initSearchListener');
    await component.connectedCallback();
    const updateComponentSpy = vi.spyOn(component, 'updateComponent');
    let searchEvent = new CustomEvent('search-event', { detail: 'Farm name', bubbles: true });
    component.dispatchEvent(searchEvent);

    expect(initSearchListenerSpy).toHaveBeenCalledTimes(1);
    expect(searchEventListener).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    expect(updateComponentSpy).toHaveBeenCalled();

    searchEvent = new CustomEvent('search-event', { detail: '', bubbles: true });
    component.dispatchEvent(searchEvent);
    expect(searchEventListener).toHaveBeenCalledTimes(2);
  });

  it('should get app CropTypes list', () => {
    const app: any = document.createElement('app-component');
    app.getCropTypeList = vi.fn().mockReturnValue([]);
    document.body.appendChild(app);
    const getCropTypes = vi.spyOn(component, 'getCropTypes');
    component.getCropTypes();
    expect(getCropTypes).toHaveBeenCalled();
    expect(getCropTypes).toReturnWith([]);
  });

});