import { Component, OnInit } from '@angular/core';

import { WeighInRepo } from '../services/weighIns.repo';

import format from 'date-fns/format';
import enGB from 'date-fns/locale/en-GB';

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
  private _averageWeightDavid: number;
  private _averageWeightEsther: number;


  public DecimalStoneToStoneAndPounds(value) {
    const stone = Math.floor(value);
    const pounds = Math.floor((value - stone) * 14);
    return {'stone': stone, 'pounds': pounds};
  }

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: this.weighInRepo.weighIns.map((x) => { return x.Date; }),
    datasets: [
      {
        data: this.weighInRepo.weighIns.map(x => x.DavidStone + x.DavidPounds / 14),
        label: 'Dave',
        fill: true,
        tension: 0.5,
        borderColor: 'rgba(20,20,255,1)',
        backgroundColor: 'rgba(20,20,255,0.3)',
        borderWidth: 0.5,
        pointBackgroundColor: 'rgba(29,20,255,0.7)',
        pointBorderColor: 'rgba(29,20,255,0.9)'
      },
      {
        data: this.weighInRepo.weighIns.map(x => x.EstherStone + x.EstherPounds / 14),
        label: 'Esther',
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
      tooltip: {
        callbacks: {
          label: (context) => {
            const date = format(context.parsed.x, 'dd/MM/yyyy', { locale: enGB });
            const weight = this.DecimalStoneToStoneAndPounds(context.parsed.y)
            let average;
            if (context.dataset.label === 'Dave')
              average = this.DecimalStoneToStoneAndPounds(this._averageWeightDavid);
            else
              average = this.DecimalStoneToStoneAndPounds(this._averageWeightEsther);

            
            return [context.dataset.label, `Date: ${date}`, `Weight: ${weight.stone} stone ${weight.pounds} pounds`, `Average: ${average.stone} stone ${average.pounds} pounds`];
          }
        }
      },
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
    resizeDelay: 200,
    scales: {
      x: {
        // min: '2022-11-07 00:00:00',
        type: 'time',
        time: {
          unit: 'month',
          // toolip is overidden by tooltip callback
          tooltipFormat: 'MMM yyyy'

          // displayFormats: {
          //   quarter: 'MMM YYYY'
          // }
        }
      },
    }

  };

  public lineChartLegend = true;

  constructor(public weighInRepo: WeighInRepo) {
    this._averageWeightDavid = this.weighInRepo.weighIns.reduce((total, next) => total + (next.DavidStone + next.DavidPounds / 14), 0) / this.weighInRepo.weighIns.length;
    this._averageWeightEsther = this.weighInRepo.weighIns.reduce((total, next) => total + (next.EstherStone + next.EstherPounds / 14), 0) / this.weighInRepo.weighIns.length;
  }

  ngOnInit(): void {
    window['toolInfo'] = '';
  }
}
