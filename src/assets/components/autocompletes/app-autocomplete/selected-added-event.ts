export class SelectedAddedEvent<T> extends CustomEvent<T>
{
  static type: string = "selectedAdded";

  constructor(eventInitDict?: CustomEventInit<T>)
  {
    super(SelectedAddedEvent.type, eventInitDict);
  }
}
