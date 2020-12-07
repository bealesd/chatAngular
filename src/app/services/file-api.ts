import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';

import { RestHelper } from '../helpers/rest-helper';
import { MessageService } from './message.service';
import { NotepadMetadata } from '../models/notepad-models';

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

export class FileApi {
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
    const noCache = `?cachebust=${Math.floor(Math.random() * (9999999999999 - 1000000000000 + 1) + 1000000000000)}`;
    const parts = this.dir.split('/');
    parts.splice(1, 0, 'contents');
    return `https://api.github.com/repos/bealesd/${parts.join('/')}${noCache}`;
  }

  dirPostUrl(fileName):string {
    const noCache = `?cachebust=${Math.floor(Math.random() * (9999999999999 - 1000000000000 + 1) + 1000000000000)}`;
    const parts = this.dir.split('/');
    parts.splice(1, 0, 'contents');
    return `https://api.github.com/repos/bealesd/${parts.join('/')}/${fileName}${noCache}`;
  }

  constructor(private http: HttpClient,
    private restHelper: RestHelper,
    private messageService: MessageService) {
    this.http = http;
  }

  private fileType(name): string {
    return !name.includes('.') ? '' : name.split('.').slice(-1)[0];
  }

  parseDirectory(dir: string): string {
    const cleanDirectory = dir.split('/').filter(part => part.trim() !== "");

    if (cleanDirectory.length === 0) return '';
    else if (!this.rootFolders.includes(cleanDirectory[0])) return null;
    else return cleanDirectory.join('/');
  }

  doesDirectoryExistAsync(dir: string): Promise<boolean> {
    this.messageService.add(`FileApi: Check dir exists: ${dir}.`, 'info');
    return new Promise((res, rej) => {
      const oldDir = this.dir;
      dir = this.parseDirectory(dir);
      if (dir === null) res(false);
      else this.dir = dir;

      this.http.get<NotepadMetadata[]>(this.dirUrl, this.restHelper.options()).subscribe(
        {
          next: (notepads: NotepadMetadata[]) => {
            this.messageService.add(`FileApi: Checked dir exists: ${dir}.`, 'info');
            res(true);
          },
          error: (err: any) => {
            this.dir = oldDir;
            this.restHelper.errorMessageHandler(err, `checking path at: ${this.dirUrl}`, 'FileApi');
            res(false);
          }
        }
      );
    });
  }

  changeDirectoryAsync(dir: string): Promise<boolean> {
    return new Promise(async (res, rej) => {
      const dirExists = await this.doesDirectoryExistAsync(dir);
      if (dirExists) this.dir = dir;
      res(dirExists);
    });
  }

  listFilesAndFoldersAsync(): Promise<NotepadMetadata[]> {
    this.messageService.add(`FileApi: Listing files in: ${this.dir}.`, 'info');
    return new Promise((res, rej) => {
      const files: NotepadMetadata[] = [];
      this.http.get<NotepadMetadata[]>(this.dirUrl, this.restHelper.options()).subscribe(
        {
          next: (notepads: NotepadMetadata[]) => {
            notepads.forEach((notepadMetadata: NotepadMetadata) => {
              if (notepadMetadata.type === 'file' || notepadMetadata.type === 'dir') {
                const metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
                files.push(metadata);
              }
            });
            this.messageService.add(`FileApi: Listed files in: ${this.dir}.`, 'info');
            res(files);
          },
          error: (err: any) => {
            this.restHelper.errorMessageHandler(err, `listing files at: ${this.dirUrl}`, 'FileApi');
            res(null);
          }
        }
      );
    });
  }

  getFileAsync(name: string): Promise<string> {
    this.messageService.add(`FileApi: Getting file ${name}.`, 'info');
    return new Promise(async (res, rej) => {
      let files = await this.listFilesAndFoldersAsync();
      if (!files || files.length == 0) res(null);

      let file = files.find((f) => f.name === name);
      if (!file) res(null);

      this.http.get<any>(file.git_url, this.restHelper.options()).subscribe(
        {
          next: (value: any) => {
            const content = atob(value.content);
            this.messageService.add(`FileApi: Got file ${name}.`, 'info');
            res(content);
          },
          error: (err: any) => {
            this.restHelper.errorMessageHandler(err, `getting file: ${file.git_url}`, 'FileApi');
            res(null);
          }
        });
    });
  }

  newFileAsync(name: string, text: string): Promise<NotepadMetadata> {
    this.messageService.add(`FileApi: Creating new file ${name}.`, 'info');
    return new Promise((res, rej) => {   
      const postUrl = this.dirPostUrl(name);
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
            this.messageService.add(`FileApi: Created new file ${name}.`, 'info');
            res(metadata);
          },
          error: (err: any) => {
            this.restHelper.errorMessageHandler(err, `creating file: ${name}`, 'FileApi');
            res(null);
          }
        }
      );
    });
  }

  newFolderAsync(folderName: string): Promise<NotepadMetadata> {
    this.messageService.add(`FileApi: Creating new folder ${folderName}.`, 'info');
    const postUrl = this.dirPostUrl(`${folderName}/dummy.txt`);

    const rawCommitBody = JSON.stringify({
      'message': `Api commit by notepad repo at ${new Date().toLocaleString()}`,
      'content': btoa('dummy file to allow folder creation')
    });
    return new Promise((res, rej) => {
      this.http.put(postUrl, rawCommitBody, this.restHelper.options()).subscribe(
        {
          next: (contentAndCommit: any) => {
            const notepadMetadata = contentAndCommit.content as NotepadMetadata;
            const metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
            this.messageService.add(`FileApi: Created new folder ${name}.`, 'info');
            res(metadata);
          },
          error: (err: any) => {
            this.restHelper.errorMessageHandler(err, `creating folder: ${folderName}`, 'FileApi');
            res(null);
          }
        }
      );
    });
  }

  editFileAsync(name: string, text: string): Promise<NotepadMetadata> {
    this.messageService.add(`FileApi: Editing file: ${name}.`, 'info');
    return new Promise(async (res, rej) => {
      let files = await this.listFilesAndFoldersAsync();
      if (!files) res(null);

      let file = files.find((f) => f.name === name);
      if (!file) res(null);

      const rawCommitBody = JSON.stringify({
        'message': `Api commit by notepad repo at ${new Date().toLocaleString()}`,
        'content': btoa(text),
        'sha': file.sha
      });

      this.http.put(file.url, rawCommitBody, this.restHelper.options()).subscribe(
        {
          next: (contentAndCommit: any) => {
            const notepadMetadata = contentAndCommit.content as NotepadMetadata;
            const metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
            this.messageService.add(`FileApi: Edited file.`, 'info');
            res(metadata);
          },
          error: (err: any) => {
            this.restHelper.errorMessageHandler(err, `editing file: ${name}`, 'FileApi');
            res(null);
          }
        }
      );
    });
  }

  deleteFileAsync(name: string): Promise<boolean> {
    this.messageService.add(`FileApi: Deleting file: ${name}.`, 'info');
    return new Promise(async (res, rej) => {
      let files = await this.listFilesAndFoldersAsync();
      if (!files) res(false);

      let file = files.find((f) => f.name === name);
      if (!file) res(null);

      const commit = JSON.stringify({
        "message": `Api delete commit by notepad repo at ${new Date().toLocaleString()}`,
        "sha": `${file.sha}`
      });

      this.http.request('delete', file.url, { body: commit, headers: this.restHelper.options().headers }).subscribe(
        {
          next: (result: any) => {
            this.messageService.add(`FileApi: Deleted file.`, 'info');
            res(true);
          },
          error: (err: any) => {
            this.restHelper.errorMessageHandler(err, `deleting file: ${name}`, 'FileApi');
            res(false);
          }
        }
      );
    });
  }

  async deleteFolderAsync(folder: string): Promise<boolean> {
    this.messageService.add(`FileApi: Deleting folder ${folder}.`, 'info');
    const currentPath = this.dir;
    return new Promise(async (res, rej) => {
      try {
        this.dir = this.dirPostUrl(`${folder}`);
        const files = await this.listFilesAndFoldersAsync();
        await this.deleteFilesAsync(files);
        this.dir = currentPath;
        this.messageService.add(`FileApi: • Deleted folder.`, 'info');
        res(true);
      } catch (error) {
        this.dir = currentPath;
        res(false);
      }
    })
  }

  async deleteFilesAsync(files: NotepadMetadata[]) {
    this.messageService.add(`FileApi: Deleting files.`, 'info');
    const promises = files.map((file) => {
      this.deleteFileAsync(file.name);
      this.messageService.add(`FileApi: • Deleted files.`, 'info');
    });
    await Promise.all(promises);
  }

  renameFileAsync(oldName: string, newName:string): Promise<NotepadMetadata> {
    this.messageService.add(`FileApi: Renaming file: ${oldName} to ${newName}.`, 'info');
    return new Promise(async (res, rej) => {
      let fileContent = await this.getFileAsync(oldName);
      if (!fileContent) res(null);

      let newFile = await this.newFileAsync(newName, fileContent);
      if (!newFile) res(null);

      let deleted = await this.deleteFileAsync(oldName);
      if (!deleted) res(null);

      this.messageService.add(`FileApi: • Renamed file.`, 'info');

      res(newFile)
    });
  }

  renameFolderAsync(oldName: string, newName:string): Promise<NotepadMetadata> {
    this.messageService.add(`FileApi: Renaming folder: ${oldName} to ${newName}.`, 'info');
    return new Promise(async (res, rej) => {
      let newFile = await this.newFolderAsync(newName);
      if (!newFile) res(null);

      let deleted = await this.deleteFolderAsync(oldName);
      if (!deleted) res(null);

      this.messageService.add(`FileApi: • Renamed folder.`, 'info');

      res(newFile)
    });
  }

}
