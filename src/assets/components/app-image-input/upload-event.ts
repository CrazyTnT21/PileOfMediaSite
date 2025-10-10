export type UploadDetail = { file: File, url: string }[];

export class UploadEvent extends CustomEvent<UploadDetail>
{
  public static readonly type = "upload";

  public constructor(eventInitDict?: CustomEventInit<UploadDetail>)
  {
    super(UploadEvent.type, eventInitDict);
  }
}
