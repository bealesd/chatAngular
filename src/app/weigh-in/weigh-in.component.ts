import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { WeighIn } from '../models/weigh-in.model';
import { WeighInRepo } from '../services/weighIns.repo';

@Component({
  selector: 'app-weigh-in',
  templateUrl: './weigh-in.component.html',
  styleUrls: ['./weigh-in.component.css']
})
export class WeighInComponent implements OnInit {
  // weightInCsv: string;
  // weightIns: WeighIn[] = [];
  highlightedRow: number = -1;

  get todaysDateAsISO8060String(): string {
    return this.getISO8060DateStringFromDateObject(new Date());
  }

  get sortedWeightIns(): WeighIn[] {
    return this.weighInRepo.weighIns;
  }

  constructor(public weighInRepo: WeighInRepo) {
    // will need a database id
//     this.weightInCsv = `Date,David,Esther
// 20/11/20,9.11,9.9
// 04/12/20,9.12,9.8
// 11/12/20,9.12,9.8
// 25/12/20,9.9,9.7
// 01/01/21,9.9,9.6
// 09/01/21,9.13,9.6
// 15/01/21,9.10,9.5
// 22/01/21,9.8,9.3
// 29/01/21,9.7,9.2
// 05/02/21,9.7,9.1
// 12/02/21,9.5,9.1
// 19/02/21,9.7,9.2
// 26/02/21,9.7,9.0
// 05/03/21,9.6,8.13
// 19/03/21,9.7,8.11
// 26/03/21,9.8,8.13
// 02/04/21,9.6,8.11
// 09/04/21,9.8,8.11
// 16/04/21,9.8,8.9
// 23/04/21,9.6,8.9
// 30/04/21,9.9,8.9
// 07/05/21,9.10,8.8
// 14/05/21,9.11,8.10
// 21/05/21,9.12,8.9
// 04/06/21,9.11,8.8
// 11/06/21,9.13,8.9
// 18/06/21,9.11,8.7
// 25/06/21,9.11,8.6
// 02/07/21,9.11,8.6
// 30/07/21,10.1,8.8
// 06/08/21,10.1,8.7
// 20/08/21,9.13,8.7
// 27/08/21,10.2,8.8
// 09/10/21,10.0,8.6
// 29/10/21,10.2,8.8
// 12/10/21,10.1,8.7
// 03/12/21,10.1,8.8
// 18/12/21,10.3,8.6
// 24/12/21,10.1,8.7
// 01/01/22,10.7,8.11
// 07/01/22,10.6,8.9
// 14/01/22,10.6,8.9
// 21/01/22,10.5,8.8
// 28/01/22,10.3,8.8
// 11/02/22,10.6,8.9
// 18/02/22,10.4,8.8
// 04/03/22,10.8,8.7
// 11/03/22,10.4,8.11
// 18/03/22,10.6,8.9
// 25/03/22,10.6,8.7
// 01/04/22,10.6,8.7
// 08/04/22,10.9,8.8
// 16/04/22,10.10,8.7
// 29/04/22,10.8,8.7
// 06/05/22,10.9,8.9
// 20/05/22,10.6,8.6
// 27/05/22,10.7,8.8
// 15/07/22,10.7,8.7
// 29/0722,10.6,8.7
// 10/08/22,10.6,8.9
// 02/09/22,10.4,8.8
// 22/10/22,10.8,8.8
// 05/11/22,10.4,8.10
// 11/11/22,10.2,8.8
// 20/11/22,10.2,8.8
// 27/11/22,10.4,8.8`;
  }

  async ngOnInit(): Promise<void> {
    // const weighIns = this.csvStringToArray(this.weightInCsv);
    // weighIns.sort(this.sortByDate);
    // this.weightIns = weighIns;

    await this.weighInRepo.getTodoList();
  }

  sortByDate(a: WeighIn, b: WeighIn) {
    if (a.Date < b.Date) return -1;
    else if (a.Date > b.Date) return 1;
    else return 0;
  }

  addRow(): void {
    const weightDaveValue = (<HTMLInputElement>document.querySelector('#weight-dave')).value;
    const weightEstherValue = (<HTMLInputElement>document.querySelector('#weight-esther')).value;
    const weightDateValue = (<HTMLInputElement>document.querySelector('#weight-date')).value;

    //reset values
    for (const inputElement of [...document.querySelectorAll('.weight-date')]) {
      (<HTMLInputElement>inputElement).value = '';
    }

    if (!this.isValidWeight(weightDaveValue)) return alert(`Dave weight is invalid: ${weightDaveValue}`);
    if (!this.isValidWeight(weightEstherValue)) return alert(`Dave weight is invalid: ${weightEstherValue}`);
    if (!this.isValidDate(weightDateValue)) return alert(`Date is invalid: ${weightDateValue}`);

    const weightDave = parseFloat(weightDaveValue);
    const weightEsther = parseFloat(weightEstherValue);
    const dateObject = new Date(weightDateValue);

    const weighIn: WeighIn = {Id: null, David: weightDave, Esther: weightEsther, Date: dateObject };
    this.weighInRepo.postWeighIn(weighIn);
  }

  deleteRow(): void {
    // check a row is highlighted
    if (this.highlightedRow === -1) return alert('No row selected!');
    if (this.weighInRepo.weighIns.length === 0) return alert('Error, there are no rows to be deleted!');

    const weighIn = this.weighInRepo.weighIns.filter(w => w.Id ===this.highlightedRow);
    if(weighIn.length === 0 ) return alert('Error, highlighted row could not be found!');
    
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
