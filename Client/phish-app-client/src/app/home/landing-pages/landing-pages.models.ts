export class LandingPage {
  id: number = 0;
  name: string = '';
  content: string = '';

  constructor(init?: Partial<LandingPage>) {
    Object.assign(this, init);
  }
}
