export class SelectedAddedEvent<T> extends CustomEvent<T>
{
  public static readonly type = "selectedAdded";

  public constructor(eventInitDict?: CustomEventInit<T>)
  {
    super(SelectedAddedEvent.type, eventInitDict);
  }
}
