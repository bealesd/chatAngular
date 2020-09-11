export class EventService {
  private static _instance: EventService;
  events: {};

  constructor() {
    this.events = {};
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  public addEvent(id: string, element: HTMLElement, eventType: string, callback) {
    this.events[id] = {
      'eventType': eventType,
      'callback': () => { callback(); }
    };
    element.addEventListener(eventType, this.events[id]['callback']);
  }

  public removeEvents(id: string, element: HTMLElement) {
    if (Object.keys(this.events).includes(id)) {
      const eventType = this.events[id]['eventType'];
      const callback = this.events[id]['callback'];
      element.removeEventListener(eventType, callback);
    }
  }
}
