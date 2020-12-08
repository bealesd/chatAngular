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
  rootDir: string;

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

  appendPathToDir(folder: string) {
    const dirPaths = this.dir.split('/');
    dirPaths.push(folder);
    return dirPaths.join('/');
  }

  changeDir(isUp: boolean, relPath: string): boolean {
    //TODO, SHOULD BE 2 FUNCITONS
    const dirPaths = this.dir.split('/');
    if (isUp) {
      if (dirPaths.length === 1)
        return false;
      else {
        dirPaths.pop();
        this.dir = dirPaths.join('/');
      }
    }
    else {
      dirPaths.push(relPath);
      this.dir = dirPaths.join('/');
    }
    return true;
  }

  dirPostUrl(fileName): string {
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

  // private fileType(name): string {
  //   return !name.includes('.') ? '' : name.split('.').slice(-1)[0];
  // }

  async findItem(key: string): Promise<NotepadMetadata> {
    return new Promise(async (res, rej) => {
      let files = await this.listFilesAndFoldersAsync();
      if (!files) res(null);

      let file = files.find((f) => f.key === key);
      if (file === undefined || file == null) res(null);

      res(file);
    });
  }

  parseDirectory(dir: string): string {
    const cleanDirectory = dir.split('/').filter(part => part.trim() !== "");

    if (cleanDirectory.length === 0)
      return '';
    else if (!this.rootFolders.includes(cleanDirectory[0])) {
      if (this.rootDir) {
        cleanDirectory.unshift(this.rootDir);
        return cleanDirectory.join('/');
      }
      else
        return null;
    }
    else {
      this.rootDir = cleanDirectory[0];
      return cleanDirectory.join('/');
    }
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

  getFileAsync(key: string): Promise<string> {
    this.messageService.add(`FileApi: Getting file ${name}.`, 'info');
    return new Promise(async (res, rej) => {
      let file = await this.findItem(key);
      if (file === undefined || file === null) res(null);

      this.http.get<any>(file.git_url, this.restHelper.options()).subscribe(
        {
          next: (value: any) => {
            const content = atob(value.content);
            this.messageService.add(`FileApi: Got file ${file.name}.`, 'info');
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

  editFileAsync(key: string, text: string): Promise<NotepadMetadata> {
    // file content update
    this.messageService.add(`FileApi: Editing file: ${key}.`, 'info');
    return new Promise(async (res, rej) => {
      let file = await this.findItem(key);

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
            this.restHelper.errorMessageHandler(err, `editing file: ${key}`, 'FileApi');
            res(null);
          }
        }
      );
    });
  }

  deleteFileAsync(key: string): Promise<boolean> {
    this.messageService.add(`FileApi: Deleting file: ${key}.`, 'info');
    return new Promise(async (res, rej) => {
      const file = await this.findItem(key);
      console.log(file);
      if (file === null || file.type !== 'file') res(false);

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
            this.restHelper.errorMessageHandler(err, `deleting file: ${file.key}`, 'FileApi');
            res(false);
          }
        }
      );
    });
  }

  async deleteFolderRecursivelyAsync(folder: string) {
    // Dir will need to be changed before each operation, else you could delete a file of folder and be in wrong directory.
    return
  }

  async deleteFolderAsync(key: string): Promise<boolean> {
    this.messageService.add(`FileApi: Deleting folder ${key}.`, 'info');
    const currentPath = this.dir;

    return new Promise(async (res, rej) => {
      try {
        let folder = await this.findItem(key);

        this.changeDir(false, folder.name);

        const items = await this.listFilesAndFoldersAsync();

        const subFiles = [];
        const subFolders = [];
        items.forEach((item) => {
          if (item.type === 'file') subFiles.push(item);
          if (item.type === 'dir') subFolders.push(item);
        });

        if (subFolders.length > 0) {
          alert('Failed to delete folder. It has sub folders.');
          this.dir = currentPath;
          res(false);
        }
        else {
          await this.deleteFilesAsync(subFiles);
          this.dir = currentPath;
          this.messageService.add(`FileApi: • Deleted folder.`, 'info');
          res(true);
        }
      } catch (error) {
        this.dir = currentPath;
        res(false);
      }
    })
  }

  async deleteFilesAsync(files: NotepadMetadata[]) {
    this.messageService.add(`FileApi: Deleting files.`, 'info');

    // never change this to Promise.all(), each request must be done one at a time for the github api to work
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await this.deleteFileAsync(file.key);
      this.messageService.add(`FileApi: • Deleted files.`, 'info');

    }
  }

  renameFileAsync(key: string, newName: string): Promise<NotepadMetadata> {
    this.messageService.add(`FileApi: Renaming file: ${key} to ${newName}.`, 'info');
    return new Promise(async (res, rej) => {
      let fileContent = await this.getFileAsync(key);
      if (fileContent === null) res(null);

      let newFile = await this.newFileAsync(newName, fileContent);
      if (!newFile) res(null);

      let deleted = await this.deleteFileAsync(key);
      if (!deleted) res(null);

      this.messageService.add(`FileApi: • Renamed file.`, 'info');

      res(newFile)
    });
  }

  renameFolderAsync(key: string, newName: string): Promise<NotepadMetadata> {
    this.messageService.add(`FileApi: Renaming folder: ${key} to ${newName}.`, 'info');
    return new Promise(async (res, rej) => {
      let newFile = await this.newFolderAsync(newName);
      if (!newFile) res(null);

      let deleted = await this.deleteFolderAsync(key);
      if (!deleted) res(null);

      this.messageService.add(`FileApi: • Renamed folder.`, 'info');

      res(newFile)
    });
  }

}

// key: sha, name, url
// get files with key
// delete file by key
// --get files, match on key, delete
// delete folder
// --get files, match on key, delete
