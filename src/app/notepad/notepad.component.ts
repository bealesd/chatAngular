import { Component, OnDestroy, OnInit } from '@angular/core';

import { Notepad, NotepadMetadata } from './../models/notepad-models';
import { MenuService } from '../services/menu.service';
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

  constructor(
    public notepadRepo: NotepadRepo,
    public menuService: MenuService,
  ) { }
  //TODO fix highligh still being on issue
  ngOnInit(): void {
    this.disablePage = false;

    this.notepadRepo.getAllNotepads();
    this.menuService.activateRoute('notepad-click');
  }

  ngOnDestroy() {
    this.disableNotebookMenus();
    if (this.notepadIsOpen) this.exitNotepad();
  }

  sortByItemName(a, b) {
    let aName = a.metadata.name.toLowerCase();
    let bName = b.metadata.name.toLowerCase();
    if (aName < bName) {
      return -1;
    }
    if (aName > bName) {
      return 1;
    }
    return 0;
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

  get sortedItems() {
    let items = this.notepadRepo.notepads;

    items.sort(this.sortByItemName);
    items.sort(this.sortByItemType);

    return items;
  }

  getFileType(name) {
    this.fileType = !name.includes('.') ? '' : name.split('.').slice(-1)[0];
  }

  disableNotebookMenus() {
    this.menuService.disableMenuItem('close-click');
    this.menuService.disableMenuItem('save-click');
    this.menuService.disableMenuItem('delete-click');
    this.menuService.disableMenuItem('undo-click');
  }

  undoNotepadChanges() {
    (this.currentNotepad as Notepad).content = this.originalNotepadText;
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
    if (this.notepadRepo.notepads.find(np => np.metadata.name === name) !== undefined) {
      alert('name is not unique');
      return false;
    }
    return true;
  }

  isUnique(notepad: NotepadMetadata): boolean {
    if (this.notepadRepo.notepads.find(np => np.metadata.name === notepad.name && np.metadata.sha !== notepad.sha) !== undefined) {
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
  }

  openFile() {
    this.notepadIsOpen = true;
    this.originalNotepadText = this.currentNotepad.content;
    this.resetNotepadInput();
    this.menuService.enableMenuItem('save-click', () => { this.saveNotepad(); this.menuService.hideMenu(); });
    this.menuService.enableMenuItem('close-click', () => { this.exitNotepad(); this.menuService.hideMenu(); });
    this.menuService.enableMenuItem('delete-click', () => { this.deleteNotepad(); this.menuService.hideMenu(); });
    this.menuService.enableMenuItem('undo-click', () => { this.undoNotepadChanges(); this.menuService.hideMenu(); });
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
      const result = await this.notepadRepo.getNotepad(this.currentNotepad.metadata.name);
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

  highlightRow(item: Notepad): void {
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
      const result = await this.notepadRepo.renameFolder(this.currentNotepad.metadata.name, name);
      this.closeFile();
    }
    else {
      const result = await this.notepadRepo.renameNotepad(this.currentNotepad.metadata.name, name);
      this.closeFile();
    }
  }

  async saveNotepad() {
    if (!this.notepadTextHasChanged) {
      alert('No changes!');
      return;
    }
    this.disablePage = true;
    const result = await this.notepadRepo.updateNotepad(this.currentNotepad.metadata.name);
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
        const result = await this.notepadRepo.deleteFolder(this.currentNotepad.metadata.name);
        this.closeFile();
      }
      else {
        const result = await this.notepadRepo.deleteNotepad(this.currentNotepad.metadata.name);
        this.closeFile();
      }


    }
  }
}
