export class ValueSetEvent<T> extends CustomEvent<T>
{
  static type: string = "valueSet";

  constructor(eventInitDict?: CustomEventInit<T>)
  {
    super(ValueSetEvent.type, eventInitDict);
  }
}
