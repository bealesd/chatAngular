export class NotepadMetadata {
  name: string
  path: string
  sha: string
  size: number
  git_url: string
  type: string

  constructor(name, path, sha, size, git_url, type) {
    this.name = name;
    this.path = path;
    this.sha = sha;
    this.size = size;
    this.git_url = git_url;
    this.type = type;
  }

  get fileName() {
    if (this.type === 'file') {
      if (this.fileType === '')
        return this.name;
      else
        return this.name.split(`.${this.fileType}`)[0];
    }

    else return null;
  }

  get fileType() {
    if (this.type === 'file')
      return !this.name.includes('.') ? '' : this.name.split('.').slice(-1)[0]
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
