import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuService } from '../services/menu.service';
import { NotepadRepo } from '../services/notepad.repo'

@Component({
  selector: 'app-notepad',
  templateUrl: './notepad.component.html',
  styleUrls: ['./notepad.component.css']
})
export class NotepadComponent implements OnInit, OnDestroy {
  notepadIsOpen = false;
  notepad = {
    name: '',
    text: {
      original: '',
      current: ''
    }
  };

  get notepadTextHasChanged() { return this.notepad.text.current !== this.notepad.text.original; }

  constructor(
    public notepadRepo: NotepadRepo,
    public menuService: MenuService
  ) {
    this.notepadRepo.currentNotepad.subscribe((np) => {
      this.notepad.text.original = np.content;
      this.notepad.text.current = np.content;
      this.notepad.name = np.name;

      if (np.name === '' || np.name === null || np.name === undefined) {
        this.notepadIsOpen = false;
        this.disableNotebookMenus();
      }
      else {
        this.notepadIsOpen = true;
        this.menuService.enableMenuItem('save-click', () => { this.saveNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('close-click', () => { this.exitNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('delete-click', () => { this.deleteNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('undo-click', () => { this.undoNotepadChanges(); this.menuService.hideMenu(); });
      }
    });
  }

  ngOnInit(): void {
    this.notepadRepo.getAllNotepads();
    this.menuService.activateRoute('notepad-click');
  }

  ngOnDestroy() {
    this.disableNotebookMenus();
  }

  disableNotebookMenus(){
    this.menuService.disableMenuItem('close-click');
    this.menuService.disableMenuItem('save-click');
    this.menuService.disableMenuItem('delete-click');
    this.menuService.disableMenuItem('undo-click');
  }

  undoNotepadChanges() {
    this.notepad.text.current = this.notepad.text.original;
    (document.querySelector('.notepad-text-input ') as HTMLDivElement).innerText = this.notepad.text.original;
  }

  updateText(evt) {
    this.notepad.text.current = (evt.target as HTMLDivElement).innerText;
  }

  newNotepad(name) {
    this.notepadRepo.postNotepad('', name);
  }

  openNotepad(notepad) {
    this.notepadRepo.getNotepad(notepad)
  }

  saveNotepad() {
    this.notepadRepo.postNotepad(this.notepad.text.current, this.notepad.name);
  }

  exitNotepad() {
    if (this.notepadTextHasChanged)
      if (!window.confirm('Discard unsaved changes?')) return;

    this.notepadRepo.currentNotepad.next({'name': '', 'content': ''})
  }

  deleteNotepad() {
    if (window.confirm('Delete notepad?')) 
      this.notepadRepo.deleteNotepad(this.notepad.name); 
  }
}
