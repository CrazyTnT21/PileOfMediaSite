export class SearchEvent extends CustomEvent<string>
{
  static type: string = "valueSearch";

  constructor(eventInitDict?: CustomEventInit<string>)
  {
    super(SearchEvent.type, eventInitDict);
  }
}
