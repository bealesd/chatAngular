import { Notepad } from './../models/notepad-models';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuService } from '../services/menu.service';
import { NotepadRepo, State } from '../services/notepad.repo'

@Component({
  selector: 'app-notepad',
  templateUrl: './notepad.component.html',
  styleUrls: ['./notepad.component.css']
})
export class NotepadComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  disablePage = false;
  createNotepadFormIsOpen = false;
  renameNotepadFormIsOpen = false;
  notepadIsOpen = false;
  originalNotepadText = '';
  fileType = '';

  preventSimpleClick: boolean;
  highlightedRow: string = null;
  timer: any;

  get notepadTextHasChanged() { return this.currentNotepad?.content !== this.originalNotepadText; }

  get currentNotepad() { return this.notepadRepo.notepads.find(np => np.metadata.key === this.notepadRepo.currentNotepadKey); }

  constructor(
    public notepadRepo: NotepadRepo,
    public menuService: MenuService,
  ) { }

  ngOnInit(): void {
    this.disablePage = false;

    this.subscriptions.push(this.notepadRepo.state.subscribe((state) => {
      const lastState = state.slice(-1)[0];
      this.createNotepadFormIsOpen = false;
      this.renameNotepadFormIsOpen = false;
      this.disablePage = false;
      this.highlightedRow = null;

      //TODO this should only be done on state.get or state.save

      if(lastState === State.GotNotepadListing){
        this.notepadIsOpen = false;
        this.disableNotebookMenus();
        this.notepadRepo.currentNotepadKey = '';
      }
      else if(lastState === State.Error){
        this.notepadIsOpen = false;
        this.disableNotebookMenus();
        this.notepadRepo.currentNotepadKey = '';
      }
      else if(lastState === State.DeletedNotepad){
        this.notepadIsOpen = false;
        this.disableNotebookMenus();
        this.notepadRepo.currentNotepadKey = '';
      }
      else if(lastState === State.RenamedNotepad){
        this.notepadIsOpen = false;
        this.disableNotebookMenus();
        this.notepadRepo.currentNotepadKey = '';
      }
      else if(lastState === State.CreatedNotepad){
        this.notepadIsOpen = false;
        this.disableNotebookMenus();
        this.notepadRepo.currentNotepadKey = '';
      }
      else if(lastState === undefined){
        this.notepadIsOpen = false;
        this.disableNotebookMenus();
        this.notepadRepo.currentNotepadKey = '';
      }
      else if(lastState === State.GotNotepad){
        this.notepadIsOpen = true;
        this.originalNotepadText = this.currentNotepad.content;
        this.resetNotepadInput();
        this.menuService.enableMenuItem('save-click', () => { this.saveNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('close-click', () => { this.exitNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('delete-click', () => { this.deleteNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('undo-click', () => { this.undoNotepadChanges(); this.menuService.hideMenu(); });
      }
      else if(lastState === State.UpdatedNotepad){
        this.notepadIsOpen = true;
        this.originalNotepadText = this.currentNotepad.content;
        this.resetNotepadInput();
        this.menuService.enableMenuItem('save-click', () => { this.saveNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('close-click', () => { this.exitNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('delete-click', () => { this.deleteNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('undo-click', () => { this.undoNotepadChanges(); this.menuService.hideMenu(); });
      }
    }));

    this.notepadRepo.getAllNotepads();
    this.menuService.activateRoute('notepad-click');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.disableNotebookMenus();
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
  }

  cancelNewNotepad() {
    this.createNotepadFormIsOpen = false;
  }

  renameNotepadForm() {
    if (!this.isNotepadItemSelected) return;
    this.renameNotepadFormIsOpen = true;
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

  newNotepad(name) {
    if (!this.isUniqueName(name)) return;
    this.disablePage = true;
    this.notepadRepo.postNotepad('', name);
  }

  openNotepad(): void {
    this.preventSimpleClick = true;
    clearTimeout(this.timer);
    if (!this.isNotepadItemSelected) return;

    this.disablePage = true;
    this.notepadRepo.getNotepad(this.currentNotepad.metadata.key);
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

  renameNotepad(name) {
    if (!this.isUniqueName(name)) return;
    this.disablePage = true;
    this.notepadRepo.renameNotepad2(this.currentNotepad.metadata.key, name);
  }

  saveNotepad() {
    if(!this.notepadTextHasChanged){
       alert('No changes!');
       return;
    }
    this.disablePage = true;
    this.notepadRepo.updateNotepad(this.currentNotepad.metadata.key);
  }

  exitNotepad() {
    if (this.notepadTextHasChanged)
      if (!window.confirm('Discard unsaved changes?')) return;

    this.disablePage = true;
    this.notepadRepo.getAllNotepads();
  }

  stringIsNull(value) { return ['', null, undefined].includes(value); }

  deleteNotepad() {
    if (!this.isNotepadItemSelected) return;

    if (window.confirm('Delete notepad?')) {
      this.notepadRepo.deleteNotepad(this.currentNotepad.metadata.key);
      this.disablePage = true;
    }
  }
}
