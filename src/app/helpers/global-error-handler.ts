import { ErrorHandler, Injectable, Injector } from "@angular/core";
import { MessageService } from "../services/message.service";

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private messageService: MessageService) {
  }

  handleError(error: Error) {
    if (![null, undefined].includes(error)) {
      const message = [
        'Message: ' + error.message,
        'Name: ' + error.name,
        'Stack: ' + error.stack
      ].join('\n');

      this.messageService.add(message, 'error');
      console.error(error);
    }

  }
}