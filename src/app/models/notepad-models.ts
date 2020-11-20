export class NotepadMetadata {
  name: string
  path: string
  sha: string
  size: number
  git_url: string
  type: string

  get fileName() {
    if (this.type === 'file')
      return this.name.split(`.${this.fileType}`)[0];
    else return null;
  }

  get fileType() {
    if (this.type === 'file')
      return this.name.split('.')[this.name.split('.').length - 1];
    else return null;
  }

  get key() {
    return `${this.name}-${this.sha}-${this.git_url}`;
  }
}

export class Notepad {
  content: string
  metadata: NotepadMetadata
}
