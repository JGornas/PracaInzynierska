export class Template {
  id: number = 0;
  name: string = '';
  subject: string = '';
  content: string = '';
  designObject: any;

  constructor(init?: Partial<Template>) {
    Object.assign(this, init);
  }
}
