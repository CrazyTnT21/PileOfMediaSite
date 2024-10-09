export type UploadDetail = { file: File, url: string }[];

export class UploadEvent extends CustomEvent<UploadDetail>
{
  static type: string = "upload";

  constructor(eventInitDict?: CustomEventInit<UploadDetail>)
  {
    super(UploadEvent.type, eventInitDict);
  }
}
