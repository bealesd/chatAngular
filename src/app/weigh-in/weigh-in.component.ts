import { Component, OnInit } from '@angular/core';
import { WeighIn } from '../weigh-in/weigh-in.model'

@Component({
  selector: 'app-weigh-in',
  templateUrl: './weigh-in.component.html',
  styleUrls: ['./weigh-in.component.css']
})
export class WeighInComponent implements OnInit {
  weightInCsv: string;
  weightIns: WeighIn[] = [];
  highlightedRow: number = -1;

  constructor() {
    // will need a database id
    this.weightInCsv = `Date,David,Esther
20/11/20,9.11,9.9
04/12/20,9.12,9.8
11/12/20,9.12,9.8
25/12/20,9.9,9.7
01/01/21,9.9,9.6
09/01/21,9.13,9.6
15/01/21,9.10,9.5
22/01/21,9.8,9.3
29/01/21,9.7,9.2
05/02/21,9.7,9.1
12/02/21,9.5,9.1
19/02/21,9.7,9.2
26/02/21,9.7,9.0
05/03/21,9.6,8.13
19/03/21,9.7,8.11
26/03/21,9.8,8.13
02/04/21,9.6,8.11
09/04/21,9.8,8.11
16/04/21,9.8,8.9
23/04/21,9.6,8.9
30/04/21,9.9,8.9
07/05/21,9.10,8.8
14/05/21,9.11,8.10
21/05/21,9.12,8.9
04/06/21,9.11,8.8
11/06/21,9.13,8.9
18/06/21,9.11,8.7
25/06/21,9.11,8.6
02/07/21,9.11,8.6
30/07/21,10.1,8.8
06/08/21,10.1,8.7
20/08/21,9.13,8.7
27/08/21,10.2,8.8
09/10/21,10.0,8.6
29/10/21,10.2,8.8
12/10/21,10.1,8.7
03/12/21,10.1,8.8
18/12/21,10.3,8.6
24/12/21,10.1,8.7
01/01/22,10.7,8.11
07/01/22,10.6,8.9
14/01/22,10.6,8.9
21/01/22,10.5,8.8
28/01/22,10.3,8.8
11/02/22,10.6,8.9
18/02/22,10.4,8.8
04/03/22,10.8,8.7
11/03/22,10.4,8.11
18/03/22,10.6,8.9
25/03/22,10.6,8.7
01/04/22,10.6,8.7
08/04/22,10.9,8.8
16/04/22,10.10,8.7
29/04/22,10.8,8.7
06/05/22,10.9,8.9
20/05/22,10.6,8.6
27/05/22,10.7,8.8
15/07/22,10.7,8.7
29/0722,10.6,8.7
10/08/22,10.6,8.9
02/09/22,10.4,8.8
22/10/22,10.8,8.8
05/11/22,10.4,8.10
11/11/22,10.2,8.8
20/11/22,10.2,8.8
27/11/22,10.4,8.8`;
  }

  ngOnInit(): void {
    this.weightIns = this.csvStringToArray(this.weightInCsv);
  }

  addRow(): void {
    const weightDate = (<HTMLInputElement>document.querySelector('#weight-date')).value;
    const weightDave = (<HTMLInputElement>document.querySelector('#weight-dave')).value;
    const weightEsther = (<HTMLInputElement>document.querySelector('#weight-esther')).value;

    for (const inputElement of [...document.querySelectorAll('.weight-date')]) {
      (<HTMLInputElement>inputElement).value = '';
    }

    if (!this.isValidDate(weightDate)) return alert(`Date is invalid: ${weightDate}`);
    if (!this.isValidWeight(weightDave)) return alert(`Dave weight is invalid: ${weightDave}`);
    if (!this.isValidWeight(weightEsther)) return alert(`Dave weight is invalid: ${weightEsther}`);

    // save row to database
  }

  deleteRow(): void {
    // check a row is highlighted
    if (this.highlightedRow === -1) return alert('No row selected!');

    else if (window.confirm(`Do you want to delete row: ${this.highlightedRow}?`)) {
      // delete row to database
    }

    this.highlightedRow = -1;
  }

  editRow(): void {
    // check a row is highlighted

    // delete row to database
  }

  highlightRow(id: number): void {
    this.highlightedRow = id;
  }

  isValidDate(weightDate: string): boolean {
    try {
      const dateObject = new Date(weightDate);
      return dateObject.toISOString().split('T')[0] === weightDate;
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

  csvStringToArray(strData: string, header: boolean = true) {
    const objPattern = new RegExp(("(\\,|\\r?\\n|\\r|^)(?:\"((?:\\\\.|\"\"|[^\\\\\"])*)\"|([^\\,\"\\r\\n]*))"), "gi");
    let arrMatches = null, arrData = [[]];
    while (arrMatches = objPattern.exec(strData)) {
      if (arrMatches[1].length && arrMatches[1] !== ",") arrData.push([]);
      arrData[arrData.length - 1].push(arrMatches[2] ?
        arrMatches[2].replace(new RegExp("[\\\\\"](.)", "g"), '$1') :
        arrMatches[3]);
    }
    if (header) {
      const hData = arrData.shift();
      const hashData = arrData.map(row => {
        let i = 0;
        return hData.reduce(
          (acc, key) => {
            acc[key] = row[i++];
            return acc;
          },
          {}
        );
      });
      return hashData;
    } else {
      return arrData;
    }
  }
}
