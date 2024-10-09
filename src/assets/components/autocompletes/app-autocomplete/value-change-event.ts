export class ValueChangeEvent<T> extends CustomEvent<T>
{
  static type: string = "valueChange";

  constructor(eventInitDict?: CustomEventInit<T>)
  {
    super(ValueChangeEvent.type, eventInitDict);
  }
}
