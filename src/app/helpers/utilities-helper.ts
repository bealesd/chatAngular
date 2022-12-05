import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Utilities {

    constructor(){}

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    defaultTheme() {
        this.updateTheme('dark');
    }

    updateTheme(theme) {
        document.body.className = '';
        document.body.classList.add(theme);
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