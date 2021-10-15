import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from './message.service';
import { Notepad } from '../models/notepad.model';

@Injectable({
  providedIn: 'root'
})
export class NotepadRepo {
  public notepads: Notepad[] = [];
  public currentNotepad: Notepad = new Notepad();
  public currentPath = 'home';

  private baseUrl = 'https://corechatapi.azurewebsites.net/Notepad';

  constructor(
    private messageService: MessageService,
    private httpClient: HttpClient
  ) { }

  GetNotepadsInPath(path: string): Promise<Notepad[]> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/GetNotepadDirectChildren?path=${path}`;
      this.httpClient.get<any[]>(url).subscribe(
        {
          next: (notepadsDto: any[]) => {
            const notepads: Notepad[] = [];
            if (notepadsDto && notepadsDto.length > 0) {
              for (let i = 0; i < notepadsDto.length; i++) {
                const notepadObject = notepadsDto[i];
                const notepad = new Notepad();
                notepad.Created = notepadObject.created;
                notepad.Path = notepadObject.path;
                notepad.Type = notepadObject.type;
                notepad.Id = notepadObject.id;
                notepad.Name = notepadObject.name;
                notepad.Text = null;

                notepads.push(notepad);
              }
            }
            res(notepads);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  GetNotepad(id: number): Promise<Notepad> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/GetNotepad?id=${id}`;
      this.httpClient.get<any[]>(url).subscribe(
        {
          next: (notepadDto: any) => {
            const notepad = new Notepad();
            notepad.Created = notepadDto.created;
            notepad.Path = notepadDto.path;
            notepad.Type = notepadDto.type;
            notepad.Id = notepadDto.id;
            notepad.Name = notepadDto.name;
            notepad.Text = atob(notepadDto.text);
            res(notepad);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  async getAllNotepads(path = 'home'): Promise<boolean> {
    this.messageService.add(`NotepadRepo: Getting all notepads.`);
    const notepads = await this.GetNotepadsInPath(path);
    if (!notepads) {
      this.messageService.add('NotepadRepo: Getting notepads.', 'error');
      return false;
    }
    else {
      this.notepads = notepads;

      this.messageService.add(`NotepadRepo: Got all notepads.`);
      return true
    }
  }

  async getNotepad(id): Promise<boolean> {
    const notepad = await this.GetNotepad(id);
    if (notepad === null) {
      this.messageService.add('NotepadRepo: Getting notepad.', 'error');
      return false;
    }
    else {
      this.currentNotepad = notepad;
      this.messageService.add(`NotepadRepo: Got notepad.`);
      return true;
    }
  }

  PostNotepad(notepad: Notepad): Promise<Notepad> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/AddNotepad`;
      this.httpClient.post<any>(url, notepad).subscribe(
        {
          next: (notepadDto: any) => {
            const notepad = new Notepad();
            notepad.Name = notepadDto.name;
            notepad.Path = notepadDto.path;
            notepad.Text = atob(notepadDto.text);
            notepad.Type = notepadDto.type;
            notepad.Id = notepadDto.id;
            notepad.Created = notepadDto.created;

            res(notepad);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  async postNotepad(name: string, path: string, type: string): Promise<boolean> {
    var np = new Notepad();
    np.Type = type;
    np.Text = btoa('');
    np.Name = name;
    np.Path = path;

    const notepad = await this.PostNotepad(np);

    if (!notepad) {
      this.messageService.add(`NotepadRepo: Posting notepad name: ${name}.`, 'error');;
      return false;
    }
    else {
      this.notepads.push(notepad);
      this.messageService.add(`NotepadRepo: Posted notepad name: ${notepad.Name}.`);
      return true;
    }
  }

  async updateNotepad(np: Notepad): Promise<boolean> {
    if (np.Text !== null)
      np.Text = btoa(np.Text);
    const notepad = await this.UpdateNotepad(np);

    if (!notepad) {
      this.messageService.add(`NotepadRepo: Updating notepad name: ${np.Name}.`, 'error');;
      return false;
    }
    else {
      if (np.Type !== 'dir' && np.Text !== null)
        np.Text = atob(np.Text);

      this.messageService.add(`NotepadRepo: Updated notepad name: ${np.Name}.`);
      return true;
    }
  }

  UpdateNotepad(notepad: Notepad): Promise<boolean> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/UpdateNotepad`;
      this.httpClient.put<any>(url, notepad).subscribe(
        {
          next: (notepadDto: any) => {
            res(true);
          },
          error: (err: any) => {
            res(false);
          }
        }
      );
    });
  }

  async deleteNotepad(id: number): Promise<void> {
    this.messageService.add(`NotepadRepo: Deleting notepad id: ${id}.`, 'info');

    const result = await this.DeleteNotepad(id);
    if (result) {
      const recordsToKeep = this.notepads.filter(r => r.Id !== id);
      this.notepads = recordsToKeep;
      this.messageService.add(`NotepadRepo: Deleted notepad id: ${id}.`, 'info');
    }
    else {
      this.messageService.add(`NotepadRepo: Deleting notepad failed: ${id}.`, 'error');
    }
  }

  DeleteNotepad(id): Promise<any> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/DeleteNotepad?id=${id}`;
      this.httpClient.delete(url).subscribe(
        {
          next: (recordObject: any) => {
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
