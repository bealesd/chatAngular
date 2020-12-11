import { Component, OnDestroy, OnInit } from '@angular/core';

import { Item, ItemMetadata } from '../models/item-models';
import { NotepadRepo } from '../services/notepad.repo'

@Component({
  selector: 'app-notepad',
  templateUrl: './notepad.component.html',
  styleUrls: ['./notepad.component.css']
})

export class NotepadComponent implements OnInit, OnDestroy {
  disablePage = false;
  createNotepadFormIsOpen = false;
  renameNotepadFormIsOpen = false;
  notepadIsOpen = false;
  originalNotepadText = '';
  fileType = '';

  preventSimpleClick: boolean;
  highlightedRow: string = null;
  timer: any;
  createNotepadItemTypeIsFolder: boolean = false;

  get notepadTextHasChanged() { return this.currentNotepad?.content !== this.originalNotepadText; }

  get currentNotepad() { return this.notepadRepo.notepads.find(np => np.metadata.key === this.notepadRepo.currentNotepadKey); }
 
  get sortedItems() {
    let items = this.notepadRepo.notepads;
    items.sort(this.sortByItemName);
    items.sort(this.sortByItemType);
    return items;
  }

  constructor(
    public notepadRepo: NotepadRepo,
  ) { }

  ngOnInit(): void {
    this.disablePage = false;

    this.notepadRepo.getAllNotepads();
    }

  ngOnDestroy() {
    this.disableNotebookMenus();
    if (this.notepadIsOpen) this.exitNotepad();
  }

  sortByItemName(a, b) {
    let aName = a.metadata.name.toLowerCase();
    let bName = b.metadata.name.toLowerCase();
    if (aName < bName) return -1;
    else if (aName > bName) return 1;
    else return 0;
  }

  sortByItemType(a, b) {
    if (a.metadata.type === 'dir' || b.metadata.type === 'dir') {
      if (a.metadata.type === 'dir' && b.metadata.type === 'file')
        return -1;
      else if (a.metadata.type === 'file' && b.metadata.type === 'dir')
        return 1;
    }
    return 0;
  }

  getFileType(name) {
    this.fileType = !name.includes('.') ? '' : name.split('.').slice(-1)[0];
  }

  disableNotebookMenus() { }

  undoNotepadChanges() {
    (this.currentNotepad as Item).content = this.originalNotepadText;
    this.resetNotepadInput();
  }

  resetNotepadInput() {
    (document.querySelector('.notepad-text-input') as HTMLTextAreaElement).value = this.originalNotepadText;
  }

  updateText(value) {
    this.currentNotepad.content = value;
  }

  createNotepadForm() {
    this.createNotepadFormIsOpen = true;
    this.createNotepadItemTypeIsFolder = false;
  }

  cancelNewNotepad() {
    this.createNotepadFormIsOpen = false;
    this.createNotepadItemTypeIsFolder = false;
  }

  renameNotepadForm() {
    if (!this.isNotepadItemSelected) return;
    this.renameNotepadFormIsOpen = true;

    if (this.currentNotepad.metadata.type === 'dir')
      this.createNotepadItemTypeIsFolder = true;
    else {
      this.createNotepadItemTypeIsFolder = false;
      this.fileType = this.currentNotepad.metadata.fileType;
    }
  }

  cancelRenameNotepad() {
    this.renameNotepadFormIsOpen = false;
  }

  isUniqueName(name) {
    //todo: do on key
    if (this.notepadRepo.notepads.find(np => np.metadata.name === name) !== undefined) {
      alert('name is not unique');
      return false;
    }
    return true;
  }

  closeFile() {
    this.notepadIsOpen = false;
    this.disableNotebookMenus();
    this.notepadRepo.currentNotepadKey = '';
    this.createNotepadFormIsOpen = false;
    this.disablePage = false;
    this.highlightedRow = '';
  }

  openFile() {
    this.notepadIsOpen = true;
    this.originalNotepadText = this.currentNotepad.content;
    this.resetNotepadInput();
    this.disablePage = false;
  }

  async newItem(name) {
    if (!this.isUniqueName(name)) return;
    this.disablePage = true;

    if (this.createNotepadItemTypeIsFolder) {
      const result = await this.notepadRepo.postFolder(name);
      const result2 = await this.notepadRepo.getAllNotepads();
      this.closeFile();
    }
    else {
      const result = await this.notepadRepo.postNotepad('', name);
      this.closeFile();
    }
  }

  async openNotepad(): Promise<void> {
    this.preventSimpleClick = true;
    clearTimeout(this.timer);
    if (!this.isNotepadItemSelected) return;

    this.disablePage = true;

    if (this.currentNotepad.metadata.type === 'file') {
      const result = await this.notepadRepo.getNotepad(this.currentNotepad.metadata.key, this.currentNotepad.metadata.git_url);
      if (result) this.openFile();
      else this.closeFile();
    }
    else if (this.currentNotepad.metadata.type === 'dir') {
      this.notepadRepo.changeDir(false, this.currentNotepad.metadata.name);
      const result = await this.notepadRepo.getAllNotepads();
      this.closeFile();
    }
  }

  async upLevel() {
    this.disablePage = true;
    const dirChanged = this.notepadRepo.changeDir(true, null);
    if (dirChanged) {
      const result = await this.notepadRepo.getAllNotepads();
    }

    this.closeFile();
  }

  highlightRow(item: Item): void {
    this.timer = null;
    this.preventSimpleClick = false;
    let delay = 200;

    this.timer = setTimeout(() => {
      if (!this.preventSimpleClick) {
        this.highlightedRow = item.metadata.key;
        this.notepadRepo.currentNotepadKey = item.metadata.key;
      }
    }, delay);
  }

  get isNotepadItemSelected() {
    if (this.stringIsNull(this.currentNotepad?.metadata?.key)) {
      alert('No notepad selected!');
      return false;
    }
    return true;
  }

  updateItemType() {
    this.createNotepadItemTypeIsFolder = !this.createNotepadItemTypeIsFolder;
  }

  async renameItem(name: string) {

    if (!this.isUniqueName(name)) return;

    this.disablePage = true;
    this.renameNotepadFormIsOpen = false;
    if (this.createNotepadItemTypeIsFolder) {
      const result = await this.notepadRepo.renameFolder(this.currentNotepad.metadata.key, name);
      this.closeFile();
    }
    else {
      const result = await this.notepadRepo.renameNotepad(this.currentNotepad.metadata.key, name, this.currentNotepad.metadata.git_url);
      this.closeFile();
    }
  }

  async saveNotepad() {
    if (!this.notepadTextHasChanged) {
      alert('No changes!');
      return;
    }
    this.disablePage = true;
    const result = await this.notepadRepo.updateNotepad(this.currentNotepad.metadata.key);
    if (result) this.openFile();
    else this.closeFile();
  }

  async exitNotepad() {
    if (this.notepadTextHasChanged)
      if (!window.confirm('Discard unsaved changes?')) return;

    this.disablePage = true;
    const result = await this.notepadRepo.getAllNotepads();
    this.closeFile();
  }

  stringIsNull(value) { return ['', null, undefined].includes(value); }

  async deleteNotepad() {
    if (!this.isNotepadItemSelected) return;

    if (window.confirm('Delete notepad?')) {
      this.disablePage = true;


      if (this.currentNotepad.metadata.type === 'dir') {
        const result = await this.notepadRepo.deleteFolder(this.currentNotepad.metadata.key);
        this.closeFile();
      }
      else {
        const result = await this.notepadRepo.deleteNotepad(this.currentNotepad.metadata.key);
        this.closeFile();
      }


    }
  }
}
