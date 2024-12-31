import {IPaginatedItems} from "../../interfaces/paginated-items.interface.ts";
import {FarmService} from "../../services/farm/farm.service.ts";
import {IPaginationParams} from "../../interfaces/pagination-params.interface.ts";
import {IFarm} from "../../interfaces/farm.interface.ts";
import {ICropProduction} from "../../interfaces/crop-production.interface.ts";
import {ICropType} from "../../interfaces/crop-type.interface.ts";

type PrevNext = number | null;

export class TableComponent extends HTMLElement {
  // pagination
  currentPage: number = 1;
  prev: PrevNext = null;
  pages: number = 1;
  next: PrevNext =  null;
  last: number = 0;
  pageSize: number = 10;
  // services
  farmService: FarmService;

  constructor(farmService = new FarmService()) {
    super();
    this.farmService = farmService;
  }

  async connectedCallback(): Promise<void> {
    const data = await this.getFarms();
    this.updateComponent(data);
    this.initSearchListener();
    this.initToastListener();
  }

  render(): void {
    this.innerHTML = `<div class="card p-3 table-responsive-sm mb-3">
      <table class="table table-hover table-striped" aria-label="List of farms with information about address, area, unit of measurement, and their productions.">
        <thead>
          <tr>
            <th scope="col">Farm</th>
            <th scope="col">Address</th>
            <th scope="col">Land area</th>
            <th scope="col">Unit of measure</th>
            <th scope="col">Crop production</th>
          </tr>
        </thead>
        <tbody class="table-group-divider"></tbody>
        </table>            
      </div>
      
      ${this.showPagination(this.pages, this.currentPage, this.prev, this.next)}
    `;

    this.initPaginationClickListener();
    this.initPageSelectorListener();
  }

  getPageSizeTemplate(): string {
    return `<div class="col-sm-auto">
        <div id="page-size-selector" class="d-flex align-items-center gap-3">        
          <span>Results per page</span>
          <select class="form-select w-auto" aria-label="Select the number of items to display per page">
            <option value="10" ${this.pageSize == 10 ? 'selected' : ''}>10</option>
            <option value="25" ${this.pageSize == 25 ? 'selected' : ''}>25</option>
            <option value="50" ${this.pageSize == 50 ? 'selected' : ''}>50</option>
          </select>
        </div>
      </div>
    `;
  }

  showPagination(pages: number, currentPage: number = 1, prev: PrevNext = null, next: PrevNext = null): string {
    if (pages < 2) return this.getPageSizeTemplate();
    return `<div class="pagination-container row gap-3">
      <div class="col-sm-auto">
        <nav aria-label="Table page navigation">
          <ul class="pagination mb-0">
            <li class="page-item ${prev ? '' : 'disabled'}"><a class="page-link" href="#" data-page="prev" aria-label="Go to previous page">Previous</a></li>
            ${Array.from({ length: pages }, (_, i) => `<li class='page-item ${currentPage == (i + 1) ? "active" : ""}'><a class="page-link" href="#" data-page="${i+1}">${i+1}</a></li>`).join('')}
            <li class="page-item ${next ? '' : 'disabled'}"><a class="page-link" href="#" data-page="next" aria-label="Go to next page">Next</a></li>
          </ul>
        </nav>
      </div>
      ${this.getPageSizeTemplate()}
    </div>`;
  }

  getFarms(filters?: any, pagination: IPaginationParams = {_page: this.currentPage, _per_page: this.pageSize}): Promise<IPaginatedItems> {
    return this.farmService.getAllFarms(filters, pagination);
  }

  getPaginationParams(page: string, pageSize: number = this.pageSize, currentPage = this.currentPage): IPaginationParams | undefined {
    const isInvalidOrSamePage = !page || page == String(currentPage);
    if (isInvalidOrSamePage) return;
    let selectedPage: number;
    switch (page) {
      case 'next':
        selectedPage = currentPage + 1;
        break;
      case 'prev':
        selectedPage = currentPage - 1;
        break;
      default:
        selectedPage = Number(page);
        break;
    }
    // Get data from page
    const pagination: IPaginationParams = {_page: selectedPage, _per_page: pageSize}
    return pagination;
  }

  updatePaginationComponentState(page: number, first: number, last: number): void {
    const navPagination = this.querySelector('.pagination');
    // Update currentPage value
    this.currentPage = page;
    // Remove active class
    const currentActiveItem = navPagination?.querySelector('.active');
    currentActiveItem?.classList.remove('active');
    // Add active class
    const nextActiveItem = navPagination?.querySelector(`.pagination [data-page="${page}"]`);
    nextActiveItem?.parentElement?.classList.add('active');
    // Clear prev and next disabled status
    const prevButton = navPagination?.querySelector('[data-page="prev"]');
    const nextButton = navPagination?.querySelector('[data-page="next"]');
    prevButton?.parentElement?.classList.remove('disabled');
    nextButton?.parentElement?.classList.remove('disabled');
    // Update prev status
    if (this.currentPage == first) {
      navPagination?.querySelector('[data-page="prev"]');
      prevButton?.parentElement!.classList.add('disabled');
    }
    // Update next status
    if (this.currentPage == last) {
      navPagination?.querySelector('[data-page="next"]');
      nextButton?.parentElement!.classList.add('disabled');
    }
  }

  updateTableData(data: IFarm[]): any {
    const tbody = this.querySelector('table tbody');
    tbody!.innerHTML = '';

    if (!data.length) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="5" class="text-center">No records found</td>`;
      tbody!.appendChild(tr);
      return;
    }

    data.forEach((item: any) => {
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';

      tr.addEventListener('click', (() => {
        const event = new CustomEvent('show-farm-detail', {detail: item, bubbles: true});
        document.dispatchEvent(event);
      }));

      const tdName = document.createElement('td');
      tdName.innerText = item.farmName;
      tr.appendChild(tdName);

      const tdAddress = document.createElement('td');
      tdAddress.innerText = item.address;
      tr.appendChild(tdAddress);

      const tdArea = document.createElement('td');
      tdArea.innerText = item.landArea;
      tr.appendChild(tdArea);

      const tdMeasure = document.createElement('td');
      tdMeasure.innerText = item.unitOfMeasure;
      tr.appendChild(tdMeasure);

      const tdCrops = document.createElement('td');
      tdCrops.innerText = this.mapCropProductions(item.cropProductions);
      tr.appendChild(tdCrops);

      tbody!.appendChild(tr);
    });
  }

  mapCropProductions(items: ICropProduction[]) {
    return items.map((item: ICropProduction) => this.getCropTypesMap()[item.cropTypeId]).join(', ');
  }

  getCropTypes(): ICropType[] {
    const app: any = document.querySelector('app-component');
    return app ? app.getCropTypeList() : [];
  }

  getCropTypesMap() {
    return Object.fromEntries(this.getCropTypes().map((item: any) => [item.id, item.name]));
  }

  searchListenerEvent: any;
  initSearchListener(): void {
    this.searchListenerEvent = async (event: Event) => {
      const { detail } = event as CustomEvent;
      const filter = detail ? { farmName: detail } : null;
      const data = await this.getFarms(filter);
      this.updateComponent(data);
    }
    document.addEventListener('search-event', this.searchListenerEvent);
  }

  initPageSelectorListener(): void {
    const select: any = this.querySelector('#page-size-selector select');
    select?.addEventListener('change', async () => {
      // Update currentPage and pageSize
      this.pageSize = Number(select.value);

      // Clear search filter
      const searchElement: any = document.querySelector('#search-input');
      const filter = searchElement?.value ? { farmName: searchElement.value } : null;

      this.currentPage = 1; // reset pagination
      const data = await this.getFarms(filter);
      this.updateComponent(data);
    });
  }

  initPaginationClickListener(): void {
    // Create a listener to pagination
    const pagination = this.querySelector('.pagination');
    if (!pagination) return;
    pagination.addEventListener('click', async (event: any) => {
      // Get pagination params
      const paginationParams = this.getPaginationParams(event.target.dataset.page);
      if (!paginationParams) return;
      // Make a new request with params
      const filters = undefined;
      const {first, last, data} = await this.getFarms(filters, paginationParams);
      this.updatePaginationComponentState(paginationParams._page!, first, last);
      this.updateTableData(data);
    });
  }

  updateComponentToastEvent: any;
  initToastListener(): void {
    this.updateComponentToastEvent = async () => {
      this.currentPage = 1 // reset
      const data = await this.getFarms();
      this.updateComponent(data);
    }
    document.addEventListener('show-toast', this.updateComponentToastEvent);
  }

  async updateComponent(getFarmsResponse: IPaginatedItems): Promise<void> {
    this.prev = getFarmsResponse.prev;
    this.next = getFarmsResponse.next;
    this.pages = getFarmsResponse.pages;
    this.last = getFarmsResponse.last;

    this.render();
    this.updateTableData(getFarmsResponse.data);
  }
}

customElements.define('table-component', TableComponent);