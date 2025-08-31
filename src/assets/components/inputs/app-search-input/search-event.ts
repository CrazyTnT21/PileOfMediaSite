export class SearchEvent extends CustomEvent<string>
{
  public static readonly type = "valueSearch";

  public constructor(eventInitDict?: CustomEventInit<string>)
  {
    super(SearchEvent.type, eventInitDict);
  }
}
