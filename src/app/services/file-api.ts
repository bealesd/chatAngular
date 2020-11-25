import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Observable } from 'rxjs';

import { RestHelper } from '../helpers/rest-helper';
import { MessageService } from './message.service';
import { Notepad, NotepadMetadata } from '../models/notepad-models';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FileApiFactory {
  constructor(
    private http: HttpClient,
    private restHelper: RestHelper,
    private messageService: MessageService
  ) { }

  create() {
    return new FileApi(this.http, this.restHelper, this.messageService);
  }
}

class FileApi {
  private rootFolders = ['calendarStore', 'chatStore', 'notepadStore', 'todoStore']
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/${repoName}/contents';
  dir: string;

  constructor(private http: HttpClient,
    private restHelper: RestHelper,
    private messageService: MessageService) {
    this.http = http;
  }

  getBaseUrl(dir: string): string {
    const relPath = dir.split('/').filter(part => part.trim() !== "").join('/')
    return `https://api.github.com/repos/bealesd/${relPath}`;
  }

  getUrl(dir: string): string {
    this.getBaseUrl(dir);
    return `${this.getBaseUrl(dir)}/contents`;
  }

  changeDirectory(dir: string): Promise<boolean> {
    return new Promise((res, rej) => {
      if (dir === 'root') {
        this.dir = 'root';
        res(true);
      }
      else {
        const parts = dir.split('/');

        if (!this.rootFolders.includes(parts[0])) {
          res(false);
        }
        else {
          const url = this.getUrl(dir);
          this.http.get<NotepadMetadata[]>(url, this.restHelper.options()).subscribe(
            {
              next: (notepads: NotepadMetadata[]) => {
                this.dir = dir;
                res(true);
              },
              error: (err: any) => {
                res(false);
              }
            }
          );
        }
      }
    });
  }

  listFiles(): Promise<NotepadMetadata[]> {
    // return each filename, url as well for get and sha for post?
    return new Promise((res, rej) => {
      const url = this.getUrl(this.dir);
      const files: NotepadMetadata[] = [];
      this.http.get<NotepadMetadata[]>(url, this.restHelper.options()).subscribe(
        {
          next: (notepads: NotepadMetadata[]) => {
            notepads.forEach((notepadMetadata: NotepadMetadata) => {
              if (notepadMetadata.type === 'file') {
                const metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type);
                files.push(metadata);
              }
            });
            res(files);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  getFile(file: NotepadMetadata): Promise<string> {
    return new Promise((res, rej) => {
      this.http.get<any>(file.git_url, this.restHelper.options()).subscribe(
        {
          next: (value: any) => {
            const content = atob(value.content);
            res(content);
          },
          error: (err: any) => {
            res(null);
          }
        });
    });
  }

  newFile(filename, text): Promise<NotepadMetadata> {
    // filename: work.txt
    const postUrl = `${this.getBaseUrl(this.dir)}/${filename}`;
    const rawCommitBody = JSON.stringify({
      'message': `Api commit by notepad repo at ${new Date().toLocaleString()}`,
      'content': btoa(text)
    });

    return new Promise((res, rej) => {
      this.http.put(postUrl, rawCommitBody, this.restHelper.options()).subscribe(
        {
          next: (contentAndCommit: any) => {
            const notepadMetadata = contentAndCommit.content as NotepadMetadata;
            const metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type);
            res(metadata);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  editFile(file: NotepadMetadata, text): Promise<NotepadMetadata> {
    // filename: work.txt
    const rawCommitBody = JSON.stringify({
      'message': `Api commit by notepad repo at ${new Date().toLocaleString()}`,
      'content': btoa(text),
      'sha': file.sha
    });

    return new Promise((res, rej) => {
      this.http.put(file.git_url, rawCommitBody, this.restHelper.options()).subscribe(
        {
          next: (contentAndCommit: any) => {
            const notepadMetadata = contentAndCommit.content as NotepadMetadata;
            const metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type);
            res(metadata);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

}
