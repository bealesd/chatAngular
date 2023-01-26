import { Component, OnInit } from '@angular/core';

import { WeighInRepo } from '../services/weighIns.repo';

import 'date-fns';
import 'chartjs-adapter-date-fns';
import { Chart, ChartConfiguration, ChartOptions, ChartType } from "chart.js";
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin);


@Component({
  selector: 'app-weigh-in-graph',
  templateUrl: './weigh-in-graph.component.html',
  styleUrls: ['./weigh-in-graph.component.css']
})
export class WeighInGraphComponent implements OnInit {
  
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: this.weighInRepo.weighIns.map((x) => { return x.Date; }),
    datasets: [
      {
        data: this.weighInRepo.weighIns.map(x => x.DavidStone + x.DavidPounds / 14),
        label: 'Dave Weight',
        fill: true,
        tension: 0.5,
        borderColor: 'rgba(20,20,255,1)',
        backgroundColor: 'rgba(20,20,255,0.3)',
        borderWidth: 0.5,
        pointBackgroundColor: 'rgba(29,20,255,0.7)',
        pointBorderColor: 'rgba(29,20,255,0.9)',
      },
      {
        data: this.weighInRepo.weighIns.map(x => x.EstherStone + x.EstherPounds / 14),
        label: 'Esther Weight',
        fill: true,
        tension: 0.5,
        borderColor: 'rgba(255,20,147,1)',
        backgroundColor: 'rgba(255,20,147,0.3)',
        borderWidth: 0.5,
        pointBackgroundColor: 'rgba(255,20,147,0.7)',
        pointBorderColor: 'rgba(255,20,147,0.9)'
      },
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
        }
      }
    },
    responsive: true,
    scales: {
      x: {
        // min: '2022-11-07 00:00:00',
        type: 'time',
        time: {
          unit: 'month',
          tooltipFormat:'MMM yyyy'
            
          // displayFormats: {
          //   quarter: 'MMM YYYY'
          // }
        }
      }
    }

  };

  public lineChartLegend = true;

  constructor(public weighInRepo: WeighInRepo) {

  }

  ngOnInit(): void {

  }
}
