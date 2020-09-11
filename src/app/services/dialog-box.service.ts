import { EventService } from './event.service';

export class DialogBoxService {
  eventService: EventService;
  optionOneBtn: HTMLElement;
  optionTwoBtn: HTMLElement;
  cancelBtn: HTMLElement;

  optionOneId = 'optionOneId';
  optionTwoId = 'optionTwoId';
  cancelBtnId = 'cancelBtnId';

  public constructor() {
    this.eventService = EventService.Instance;
  }

  public register(
    message: string,
    optionOne: string,
    optionTwo: string,
    optionOneCallback: any,
    optionTwoCallback: any
  ) {
    const content = <HTMLElement>document.querySelector('[data-type="three"]>[data-type="content"]');
    this.optionOneBtn = <HTMLElement>document.querySelector('[data-type="three"]>[data-type="button1"]');
    this.optionTwoBtn = <HTMLElement>document.querySelector('[data-type="three"]>[data-type="button2"]');
    this.cancelBtn = <HTMLElement>document.querySelector('[data-type="three"]>[data-type="button3"]');

    content.innerHTML = `${message}`;
    this.optionOneBtn.innerHTML = `${optionOne}`;
    this.optionTwoBtn.innerHTML = `${optionTwo}`;
    this.cancelBtn.innerHTML = 'Cancel';

    this.eventService.addEvent(this.optionOneId, this.optionOneBtn, 'click', () => { optionOneCallback(); this.close(); });
    this.eventService.addEvent(this.optionTwoId, this.optionTwoBtn, 'click', () => { optionTwoCallback(); this.close(); });
    this.eventService.addEvent(this.cancelBtnId, this.cancelBtn, 'click', () => { this.close(); });
  }

  public open() {
    (<HTMLElement>document.querySelector('.modal')).style.visibility = 'visible';
  }

  public close() {
    (<HTMLElement>document.querySelector('.modal')).style.visibility = 'hidden';
    this.eventService.removeEvents(this.optionOneId, this.optionOneBtn);
    this.eventService.removeEvents(this.optionTwoId, this.optionTwoBtn);
    this.eventService.removeEvents(this.cancelBtnId, this.cancelBtn);
  }
}
