import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '../services/logger.service';
import { MenuService } from '../services/menu.service';
import { NotepadRepo } from '../services/notepad.repo'

@Component({
  selector: 'app-notepad',
  templateUrl: './notepad.component.html',
  styleUrls: ['./notepad.component.css']
})
export class NotepadComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  disablePage = false;
  notepadIsOpen = false;
  notepad = {
    sha: '',
    name: '',
    text: {
      original: '',
      current: ''
    }
  };

  get notepadTextHasChanged() { return this.notepad.text.current !== this.notepad.text.original; }

  constructor(
    public notepadRepo: NotepadRepo,
    public menuService: MenuService,
    private loggerService: LoggerService
  ) { }

  ngOnInit(): void {
    this.disablePage = false;
    this.notepadRepo.resetCurrentNotepad();

    this.subscriptions.push(this.notepadRepo.currentNotepad.subscribe((np) => {
      this.disablePage = false;
      this.notepad.text.original = np.content;
      this.notepad.text.current = np.content;
      this.notepad.name = np.name;
      this.notepad.sha = np.sha;

      if (np.sha === '') {
        this.notepadIsOpen = false;
        this.disableNotebookMenus();
        this.loggerService.log('notepad is closed', ' info')
      }
      else {
        this.notepadIsOpen = true;
        this.loggerService.log('notepad is open', ' info')
        this.updateNotepadInput(this.notepad.text.original);
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
    this.notepadRepo.resetCurrentNotepad();
    this.disableNotebookMenus();
  }

  disableNotebookMenus() {
    this.menuService.disableMenuItem('close-click');
    this.menuService.disableMenuItem('save-click');
    this.menuService.disableMenuItem('delete-click');
    this.menuService.disableMenuItem('undo-click');
  }

  undoNotepadChanges() {
    this.notepad.text.current = this.notepad.text.original;
    this.updateNotepadInput(this.notepad.text.original);
  }

  updateNotepadInput(value) {
    (document.querySelector('.notepad-text-input ') as HTMLTextAreaElement).value = value;
  }

  updateText(value) {
    this.notepad.text.current = value;
  }

  newNotepad(name) {
    this.disablePage = true;
    this.notepadRepo.postNotepad('', name, '');
  }

  openNotepad(notepad) {
    this.disablePage = true;
    this.notepadRepo.getNotepad(notepad)
  }

  saveNotepad() {
    this.disablePage = true;
    this.notepadRepo.postNotepad(this.notepad.text.current, this.notepad.name, this.notepad.sha);
  }

  exitNotepad() {
    if (this.notepadTextHasChanged)
      if (!window.confirm('Discard unsaved changes?')) return;

    this.disablePage = true;
    this.notepadRepo.currentNotepad.next({ name: '', content: '', sha: '' })
  }

  deleteNotepad() {
    if (window.confirm('Delete notepad?')) {
      this.notepadRepo.deleteNotepad(this.notepad.name);
      this.disablePage = true;
    }
  }
}
