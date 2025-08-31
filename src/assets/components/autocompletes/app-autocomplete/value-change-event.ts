export class ValueChangeEvent<T> extends CustomEvent<T>
{
  public static readonly type = "valueChange";

  public constructor(eventInitDict?: CustomEventInit<T>)
  {
    super(ValueChangeEvent.type, eventInitDict);
  }
}
