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
  private _dir: string = '';

  get dir() {
    return this._dir;
  }

  set dir(value) {
    value = this.parseDirectory(value);
    if (value === null) return;
    else this._dir = value;
  }

  get dirUrl() {
    const parts = this.dir.split('/');
    parts.splice(1, 0, 'contents');
    return `https://api.github.com/repos/bealesd/${parts.join('/')}`;
  }

  private get baseUrl(): string {
    // https://api.github.com/repos/bealesd/repo/contents/path
    return `https://api.github.com/repos/bealesd/${this.dir}`;
  }

  private get url(): string {
    return `${this.baseUrl}/contents`;
  }

  constructor(private http: HttpClient,
    private restHelper: RestHelper,
    private messageService: MessageService) {
    this.http = http;
  }

  parseDirectory(dir: string): string {
    const cleanDirectory = dir.split('/').filter(part => part.trim() !== "");

    if (cleanDirectory.length === 0) return '';
    else if (!this.rootFolders.includes(cleanDirectory[0])) return null;
    else return cleanDirectory.join('/');
  }

  doesDirectoryExist(dir: string): Promise<boolean> {
    return new Promise((res, rej) => {
      const oldDir = this.dir;
      dir = this.parseDirectory(dir);
      if (dir === null) res(false);
      else { this.dir = dir; }

      this.http.get<NotepadMetadata[]>(this.dirUrl, this.restHelper.options()).subscribe(
        {
          next: (notepads: NotepadMetadata[]) => {
            res(true);
          },
          error: (err: any) => {
            this.dir = oldDir;
            res(false);
          }
        }
      );
    });
  }

  changeDirectory(dir: string): Promise<boolean> {
    return new Promise(async (res, rej) => {
      const dirExists = await this.doesDirectoryExist(dir);
      if (dirExists) this.dir = dir;
      res(dirExists);
    });
  }

  listFilesAndFolders(): Promise<NotepadMetadata[]> {
    return new Promise((res, rej) => {
      const files: NotepadMetadata[] = [];
      this.http.get<NotepadMetadata[]>(this.dirUrl, this.restHelper.options()).subscribe(
        {
          next: (notepads: NotepadMetadata[]) => {
            notepads.forEach((notepadMetadata: NotepadMetadata) => {
              if (notepadMetadata.type === 'file' || notepadMetadata.type === 'folder') {
                const metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
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

  fileType(name): string {
    return !name.includes('.') ? '' : name.split('.').slice(-1)[0];
  }

  newFile(filename: string, text: string): Promise<NotepadMetadata> {
    return new Promise((res, rej) => {
      if (this.fileType(filename) === '') res(null);

      const postUrl = `${this.dirUrl}/${filename}`;
      const rawCommitBody = JSON.stringify({
        'message': `Api commit by notepad repo at ${new Date().toLocaleString()}`,
        'content': btoa(text),
        'sha': ''
      });

      this.http.put(postUrl, rawCommitBody, this.restHelper.options()).subscribe(
        {
          next: (contentAndCommit: any) => {
            const notepadMetadata = contentAndCommit.content as NotepadMetadata;
            const metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
            res(metadata);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  newFolder(folderName: string): Promise<boolean> {
    const postUrl = `${this.dirUrl}/${folderName}/dummy.txt`;

    const rawCommitBody = JSON.stringify({
      'message': `Api commit by notepad repo at ${new Date().toLocaleString()}`,
      'content': btoa('dummy file to allow folder creation')
    });
    return new Promise((res, rej) => {
      this.http.put(postUrl, rawCommitBody, this.restHelper.options()).subscribe(
        {
          next: (contentAndCommit: any) => {
            console.log(contentAndCommit);
            res(true);
          },
          error: (err: any) => {
            res(false);
          }
        }
      );
    });
  }

  editFile(file: NotepadMetadata, text: string): Promise<NotepadMetadata> {
    const rawCommitBody = JSON.stringify({
      'message': `Api commit by notepad repo at ${new Date().toLocaleString()}`,
      'content': btoa(text),
      'sha': file.sha
    });

    return new Promise((res, rej) => {
      this.http.put(file.url, rawCommitBody, this.restHelper.options()).subscribe(
        {
          next: (contentAndCommit: any) => {
            const notepadMetadata = contentAndCommit.content as NotepadMetadata;
            const metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
            res(metadata);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  deleteFile(file: NotepadMetadata): Promise<boolean> {
    const commit = JSON.stringify({
      "message": `Api delete commit by notepad repo at ${new Date().toLocaleString()}`,
      "sha": `${file.sha}`
    });

    return new Promise((res, rej) => {
      this.http.request('delete', file.url, { body: commit, headers: this.restHelper.options().headers }).subscribe(
        {
          next: (contentAndCommit: any) => {
            res(true);
          },
          error: (err: any) => {
            res(false);
          }
        }
      );
    });
  }

  async deleteFolder(folder: string): Promise<boolean> {
    const currentPath = this.dir;
    return new Promise(async (res, rej) => {
      try {
        this.dir = `${this.dir}/${folder}`;
        let files = await this.listFilesAndFolders();

        files.forEach(async (file) => {
          await this.deleteFile(file);
        });

        this.dir = currentPath;
        res(true);
      } catch (error) {
        this.dir = currentPath;
        res(false);
      }

    })

    //   const myAsyncLoopFunction = async () => {
    //     const promises = filesAndFolders.map((item) => {
    //       this.deleteFile(item);
    //     });
    //     await Promise.all(promises);
    //   }
    //   await myAsyncLoopFunction();
  }


}
