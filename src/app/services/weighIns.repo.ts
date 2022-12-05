import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../services/message.service';
import { Todo, TodoContainer } from '../models/todo.model';
import { environment } from 'src/environments/environment';
import { WeighIn } from '../models/weigh-in.model';

@Injectable({
  providedIn: 'root'
})
export class WeighInRepo {
  public weighIns: WeighIn[] = [];
  private baseUrl = `${environment.chatCoreUrl}/weighIns`;

  constructor(
    private messageService: MessageService,
    private httpClient: HttpClient) {
  }

  private GetWeighIns(): Promise<WeighIn[]> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/GetWeighIns`;
      this.httpClient.get<any[]>(url).subscribe(
        {
          next: (weighInsDto: any[]) => {
            const weightIns: WeighIn[] = [];
            if (weighInsDto && weighInsDto.length > 0) {
              for (let i = 0; i < weighInsDto.length; i++) {
                const weighInDto = weighInsDto[i];
                const weighIn = new WeighIn();
                weighIn.Id = weighInDto.id;
                weighIn.David = weighInDto.david;
                weighIn.Esther = weighInDto.esther;
                // weighInDto.date is in ISO 8601 format
                weighIn.Date = new Date(weighInDto.date);
                weightIns.push(weighIn);
              }
            }

            res(weightIns);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  async getTodoList(): Promise<boolean> {
    this.messageService.add(`WeighInRepo: Getting all weighins.`);
    const weighIns = await this.GetWeighIns();
    if (!weighIns) {
      this.messageService.add('WeighInRepo: Getting weighins.', 'error');
      return false;
    }
    else {
      this.weighIns = weighIns;

      this.messageService.add(`WeighInRepo: Got all weighins.`);
      return true
    }
  }

  async postWeighIn(weighIn: WeighIn): Promise<boolean> {
    const weighInResponse = await this.PostWeighIn(weighIn);

    if (!weighInResponse) {
      this.messageService.add(`WeighInRepo: Posting weigh in text: ${weighIn.toString()}.`, 'error');;
      return false;
    }
    else {
      this.weighIns.push(weighInResponse);
      this.messageService.add(`WeighInRepo: Posted weigh in: ${weighIn.toString()}.`);
      return true;
    }
  }

  private PostWeighIn(weighIn: WeighIn): Promise<WeighIn> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/AddWeighIn`;
      this.httpClient.post<any>(url, weighIn).subscribe(
        {
          next: (weighInDto: any) => {
            const weighIn = new WeighIn();
            weighIn.Id = weighInDto.id;
            weighIn.Esther = weighInDto.esther;
            weighIn.David = weighInDto.david;
            weighIn.Date = weighInDto.date;
            res(weighIn);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  async deleteWeighIn(id: number): Promise<void> {
    this.messageService.add(`WeighInRepo: Deleting weigh in id: ${id}.`, 'info');

    const result = await this.DeleteWeighIn(id);
    if (result) {
      const recordsToKeep = this.weighIns.filter(r => r.Id !== id);
      this.weighIns = recordsToKeep;
      this.messageService.add(`WeighInRepo: Deleted weigh in id: ${id}.`, 'info');
    }
    else {
      this.messageService.add(`WeighInRepo: Deleting weigh in failed: ${id}.`, 'error');
    }
  }

  private DeleteWeighIn(id): Promise<any> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/DeleteWeighIn?id=${id}`;
      this.httpClient.delete(url).subscribe(
        {
          next: (todoObject: any) => {
            res(true);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }
}
