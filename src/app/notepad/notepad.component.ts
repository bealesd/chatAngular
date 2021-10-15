import { Component, OnDestroy, OnInit } from '@angular/core';

import { Notepad } from '../models/notepad.model';
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
  highlightedRow: number = null;
  timer: any;
  createNotepadItemTypeIsFolder: boolean = false;

  currentNotepadId: number = null;

  get notepadTextHasChanged() { return this.currentNotepad?.Text !== this.originalNotepadText; }

  get currentNotepad() { return this.notepadRepo.currentNotepad }

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
    if (this.notepadIsOpen) this.exitNotepad();
  }

  sortByItemName(a:Notepad, b: Notepad) {
    let aName = a.Name.toLowerCase();
    let bName = b.Name.toLowerCase();
    if (aName < bName) return -1;
    else if (aName > bName) return 1;
    else return 0;
  }

  sortByItemType(a:Notepad, b: Notepad) {
    if (a.Type === 'dir' || b.Type === 'dir') {
      if (a.Type === 'dir' && b.Type !== 'dir')
        return -1;
      else if (a.Type !== 'dir' && b.Type === 'dir')
        return 1;
    }
    return 0;
  }

  getFileType(name) {
    this.fileType = !name.includes('.') ? '' : name.split('.').slice(-1)[0];
  }

  undoNotepadChanges() {
    (this.currentNotepad as Notepad).Text = this.originalNotepadText;
    this.resetNotepadInput();
  }

  resetNotepadInput() {
    (document.querySelector('.notepad-text-input') as HTMLTextAreaElement).value = this.originalNotepadText;
  }

  updateText(value) {
    this.currentNotepad.Text = value;
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

    if (this.currentNotepad.Type === 'dir')
      this.createNotepadItemTypeIsFolder = true;
    else {
      this.createNotepadItemTypeIsFolder = false;
      this.fileType = this.currentNotepad.Type;
    }
  }

  cancelRenameNotepad() {
    this.renameNotepadFormIsOpen = false;
  }

  isUniqueName(name) {
    if (this.notepadRepo.notepads.find(np => np.Name === name) !== undefined) {
      alert('name is not unique');
      return false;
    }
    return true;
  }

  closeFile() {
    this.notepadIsOpen = false;
    this.createNotepadFormIsOpen = false;
    this.disablePage = false;
    this.highlightedRow = null;
  }

  openFile() {
    this.notepadIsOpen = true;
    this.originalNotepadText = this.currentNotepad.Text;
    this.resetNotepadInput();
    this.disablePage = false;
  }

  async newItem(name) {
    if (!this.isUniqueName(name)) return;
    this.disablePage = true;

    if (this.createNotepadItemTypeIsFolder) {
      const result = await this.notepadRepo.postNotepad(name, this.notepadRepo.currentPath, 'dir');
      this.closeFile();
    }
    else {
      const result = await this.notepadRepo.postNotepad(name, this.notepadRepo.currentPath, this.fileType);
      this.closeFile();
    }
  }

  async openNotepad(): Promise<void> {
    this.preventSimpleClick = true;
    clearTimeout(this.timer);
    if (!this.isNotepadItemSelected) return;

    this.disablePage = true;

    if (this.currentNotepad.Type !== 'dir') {
      const result = await this.notepadRepo.getNotepad(this.currentNotepad.Id);
      if (result) this.openFile();
      else this.closeFile();
    }
    else if (this.currentNotepad.Type === 'dir') {
      const result = await this.notepadRepo.getAllNotepads(this.currentNotepad.Path + '/' + this.currentNotepad.Name);
      this.notepadRepo.currentPath = this.currentNotepad.Path + '/' + this.currentNotepad.Name;
      this.closeFile();
    }
  }

  async upLevel() {
    this.disablePage = true;
    const path = this.notepadRepo.currentPath.split('/');
    if (path.length > 1) {
      path.pop();
      const result = await this.notepadRepo.getAllNotepads(path.join('/'));
      this.notepadRepo.currentPath = path.join('/');
    }
    else 
      alert('Cant go up');
      
    this.closeFile();
  }

  highlightRow(item: Notepad): void {
    this.timer = null;
    this.preventSimpleClick = false;
    let delay = 200;

    this.timer = setTimeout(() => {
      if (!this.preventSimpleClick) {
        this.highlightedRow = item.Id;
        this.notepadRepo.currentNotepad = item;
      }
    }, delay);
  }

  get isNotepadItemSelected() {
    if (this.stringIsNull(this.notepadRepo.currentNotepad.Name)) {
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

    this.currentNotepad.Name = name;
    const result = await this.notepadRepo.updateNotepad(this.currentNotepad);
    this.closeFile();

  }

  async saveNotepad() {
    if (!this.notepadTextHasChanged) {
      alert('No changes!');
      return;
    }
    this.disablePage = true;
    const result = await this.notepadRepo.updateNotepad(this.currentNotepad);
    if (result) this.openFile();
    else this.closeFile();
  }

  async exitNotepad() {
    if (this.notepadTextHasChanged)
      if (!window.confirm('Discard unsaved changes?')) return;

    this.disablePage = true;
    const result = await this.notepadRepo.getAllNotepads(this.notepadRepo.currentPath);
    this.closeFile();
  }

  stringIsNull(value) { return ['', null, undefined].includes(value); }

  async deleteNotepad() {
    if (!this.isNotepadItemSelected) return;

    if (window.confirm('Delete notepad?')) {
      this.disablePage = true;

      const result = await this.notepadRepo.deleteNotepad(this.currentNotepad.Id);
      this.closeFile();
    }
  }
}
