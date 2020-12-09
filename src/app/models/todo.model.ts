import { ItemMetadata } from './item-models';

export class Todo{
  public id : number;
  public text : string;
  public datetime : Date;
  public complete : boolean;
}

export class TodoContainer {
  todos: Todo[]
  metadata: ItemMetadata
}