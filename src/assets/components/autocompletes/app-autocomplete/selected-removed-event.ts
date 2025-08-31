export class SelectedRemovedEvent<T> extends CustomEvent<T>
{
  public static readonly type = "selectedRemoved";

  public constructor(eventInitDict?: CustomEventInit<T>)
  {
    super(SelectedRemovedEvent.type, eventInitDict);
  }
}
