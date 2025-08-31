export class ValueSetEvent<T> extends CustomEvent<T>
{
  public static readonly type = "valueSet";

  public constructor(eventInitDict?: CustomEventInit<T>)
  {
    super(ValueSetEvent.type, eventInitDict);
  }
}
