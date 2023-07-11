export const DateStyle = Object.freeze({
  iso: 0,
  eu: 1,
  us: 2,
});

export class Config
{
  static dateStyle = this.defaultDateStyle();

  static defaultDateStyle()
  {
    const dateStyle = localStorage.getItem("dateStyle");

    if (dateStyle)
      return Number(dateStyle);
    return DateStyle.iso;
  }
}
