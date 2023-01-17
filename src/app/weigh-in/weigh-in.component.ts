import { Component, OnInit } from '@angular/core';
import { WeighIn } from '../models/weigh-in.model';
import { WeighInRepo } from '../services/weighIns.repo';

@Component({
  selector: 'app-weigh-in',
  templateUrl: './weigh-in.component.html',
  styleUrls: ['./weigh-in.component.css']
})
export class WeighInComponent implements OnInit {
  weightInCsv: string;
  weightIns: WeighIn[] = [];
  highlightedRow: number = -1;

  get todaysDateAsISO8060String(): string {
    return this.getISO8060DateStringFromDateObject(new Date());
  }

  get sortedWeightIns(): WeighIn[] {
    return this.weighInRepo.weighIns;
  }

  constructor(public weighInRepo: WeighInRepo) {
  }

  async ngOnInit(): Promise<void> {
    window['pageTitle'] = 'Weigh Ins';
    window['toolInfo'] = ''

    await this.weighInRepo.getTodoList();
  }

  sortByDate(a: WeighIn, b: WeighIn) {
    if (a.Date < b.Date) return -1;
    else if (a.Date > b.Date) return 1;
    else return 0;
  }

  addRow(): void {
    const weightDaveStoneValue = (<HTMLInputElement>document.querySelector('#weight-dave-stone')).value;
    const weightDavePoundsValue = (<HTMLInputElement>document.querySelector('#weight-dave-pounds')).value;
    const weightEstherStoneValue = (<HTMLInputElement>document.querySelector('#weight-esther-stone')).value;
    const weightEstherPoundsValue = (<HTMLInputElement>document.querySelector('#weight-esther-pounds')).value;
    const weightDateValue = (<HTMLInputElement>document.querySelector('#weight-date')).value;

    // reset values
    for (const inputElement of [...document.querySelectorAll('.weight-date')]) {
      (<HTMLInputElement>inputElement).value = '';
    }

    if (!this.isValidWeight(weightDaveStoneValue)) return alert(`Dave weight stone is invalid: ${weightDaveStoneValue}`);
    if (!this.isValidWeight(weightDavePoundsValue)) return alert(`Dave weight pounds is invalid: ${weightDavePoundsValue}`);
    if (!this.isValidWeight(weightEstherStoneValue)) return alert(`Esther weight stone is invalid: ${weightEstherStoneValue}`);
    if (!this.isValidWeight(weightEstherPoundsValue)) return alert(`Esther weight pounds is invalid: ${weightEstherPoundsValue}`);
    if (!this.isValidDate(weightDateValue)) return alert(`Date is invalid: ${weightDateValue}`);

    const dateObject = new Date(weightDateValue);

    const weighIn: WeighIn = {
      Id: null,
      DavidStone: parseFloat(weightDaveStoneValue),
      DavidPounds: parseFloat(weightDavePoundsValue),
      EstherStone: parseFloat(weightEstherStoneValue),
      EstherPounds: parseFloat(weightEstherPoundsValue),
      Date: dateObject
    };
    this.weighInRepo.postWeighIn(weighIn);
  }

  deleteRow(): void {
    // check a row is highlighted
    if (this.highlightedRow === -1) return alert('No row selected!');
    if (this.weighInRepo.weighIns.length === 0) return alert('Error, there are no rows to be deleted!');

    const weighIn = this.weighInRepo.weighIns.filter(w => w.Id === this.highlightedRow);
    if (weighIn.length === 0) return alert('Error, highlighted row could not be found!');

    if (window.confirm(`Do you want to delete row: ${weighIn[0].toString()}?`))
      this.weighInRepo.deleteWeighIn(this.highlightedRow);

    this.highlightedRow = -1;
  }

  highlightRow(id: number): void {
    this.highlightedRow = id;
  }

  isValidDate(weightDate: string): boolean {
    try {
      const dateObject = new Date(weightDate);
      return this.getISO8060DateStringFromDateObject(dateObject) === weightDate;
    } catch (_) {
      return false;
    }
  }

  isValidWeight(rawWeight: string): boolean {
    try {
      const weight = parseFloat(rawWeight);
      return weight < 20 && weight > 5;
    } catch (_) {
      return false;
    }
  }

  getISO8060DateStringFromDateObject(dateObject: Date): string {
    return dateObject.toISOString().split('T')[0];
  }

}
