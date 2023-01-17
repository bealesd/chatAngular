import { Component, OnInit } from '@angular/core';

import { WeighIn } from '../models/weigh-in.model';
import { WeighInRepo } from '../services/weighIns.repo';

import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from "chart.js";

@Component({
  selector: 'app-weigh-in-graph',
  templateUrl: './weigh-in-graph.component.html',
  styleUrls: ['./weigh-in-graph.component.css']
})
export class WeighInGraphComponent implements OnInit {
  weightInsDavid(): Number[] {
    let weighIns = this.weighInRepo.weighIns;
    let daveWeights = weighIns.map(x => x.DavidStone + x.DavidPounds / 14);

    return daveWeights;
  }

  weightInsDavidDates(): Number[] {
    let weighIns = this.weighInRepo.weighIns;

    var date = new Date();
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var shortDate = year + month + day;
    console.log(shortDate);

    let daveWeights = weighIns.map((x) => {
      var date = x.Date;
      var year = date.getFullYear();
      var month = ("0" + (date.getMonth() + 1)).slice(-2);
      var day = ("0" + date.getDate()).slice(-2);
      var shortDate = year + month + day;
      // return parseInt(shortDate);
      return Math.floor(Math.random() * 20) + 1;
    });

    return daveWeights;
  }

  title = 'ng2-charts-demo';

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    // get labels for x-axis, which will be Dates


    // labels: this.weightInsDavidDates(),
    labels: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July'
    ],
    datasets: [
      {
        // get data for y-axis, which will be weights
        // data: this.weighInRepo.weighIns.map(x => x.David),
        data: [65, 59, 80, 81, 56, 55, 40],
        // data: <any>this.weightInsDavid(),
        label: 'Series A',
        fill: true,
        tension: 0.5,
        borderColor: 'black',
        backgroundColor: 'rgba(255,0,0,0.3)'
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: false
  };

  public lineChartLegend = true;

  constructor(public weighInRepo: WeighInRepo) {

  }

  ngOnInit(): void {

  }
}
