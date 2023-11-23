export class Todo {
  public Id: number;
  public Text: string;
  public Complete: number;
  public DateTime: number;
}

export class TodoContainer {
  todos: Todo[]
}