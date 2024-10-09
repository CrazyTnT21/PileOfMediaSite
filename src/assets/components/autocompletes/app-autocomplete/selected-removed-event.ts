export class SelectedRemovedEvent<T> extends CustomEvent<T>
{
  static type: string = "selectedRemoved";

  constructor(eventInitDict?: CustomEventInit<T>)
  {
    super(SelectedRemovedEvent.type, eventInitDict);
  }
}
