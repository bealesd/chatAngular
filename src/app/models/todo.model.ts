export class Todo {
  public id: number;
  public text: string;
  public complete: number;
  public dateTime: number;
}

export class TodoContainer {
  todos: Todo[]
}