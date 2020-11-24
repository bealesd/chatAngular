import { Inject, Injectable, Injector } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Observable } from 'rxjs';

import { RestHelper } from '../helpers/rest-helper';
import { MessageService } from './message.service';
import { Notepad, NotepadMetadata } from '../models/notepad-models';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class FileApi {
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/${repoName}/contents';

  constructor(
    private http: HttpClient,
    private restHelper: RestHelper,
    private messageService: MessageService
    ) {
      console.log('FileApi constructor');
  }

  a(){
    console.log('FileApi a() called');
  }

  getNotepadListing = (): Observable<NotepadMetadata[]> => {
    return this.http.get<NotepadMetadata[]>(this.baseMessagesUrl, this.restHelper.options());
  }

  getAllNotepads(): void {
    this.messageService.add(`Getting all notepads.`);
    this.getNotepadListing().subscribe(
      {
        next: (notepads: NotepadMetadata[]) => {
          // this.notepads = [];
          notepads.forEach((notepadMetadata: NotepadMetadata) => {
            const notepad = new Notepad();
            notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type);
            notepad.content = '';
            // this.notepads.push(notepad);
          });

          this.messageService.add(` • Got all notepads.`);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, 'getting notepads');

        }
      });
  }

  getNotepad(key: string) {
    this.getNotepadObservable(key).subscribe(
      {
        next: (value: any) => {
          // this.findNotepad(key).content = atob(value.content);

          this.messageService.add(` • Got notepad.`);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, 'getting notepad');
        }
      });
  }

  getNotepadObservable(key: string) {
    return this.http.get<any>('', this.restHelper.options())
  }
}
