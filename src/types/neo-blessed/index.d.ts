import * as blessed from 'blessed';

declare module 'blessed' {
  namespace Widgets {
    interface ListElement {
      selected: number;
      setItem(index: number, content: string): void;
    }
  }
}

export = blessed;
