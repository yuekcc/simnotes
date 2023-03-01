import { VNode, h, defineComponent, ref, getCurrentInstance } from 'vue';

interface IComponent {
  build(): VNode;
}

class BaseComponent {
  private _style: Record<string, string>;

  get style(): Record<string, string> {
    return this._style;
  }

  withStyle(style: Record<string, string>): BaseComponent {
    this._style = style;
    return this;
  }
}

class Text extends BaseComponent implements IComponent {
  private _content: string;

  constructor(content: string) {
    super();
    this._content = content;
  }

  build(): VNode {
    return h('div', { style: this.style || {} }, this._content);
  }
}

class Button extends BaseComponent implements IComponent {
  private _label: string;
  private _onClick: () => void;

  constructor(label) {
    super();
    this._label = label;
  }

  addClickListener(listener: () => void): Button {
    this._onClick = listener;
    return this;
  }

  build(): VNode {
    return h('button', { style: this.style || {}, onClick: this._onClick }, this._label);
  }
}

class Panel extends BaseComponent implements IComponent {
  private _comps: Array<IComponent> = [];

  constructor() {
    super();
  }

  add(comp: IComponent): Panel {
    this._comps.push(comp);
    return this;
  }

  build(): VNode {
    const children = this._comps.map(it => it.build());
    return h('div', { style: this.style || {} }, children);
  }
}

function text(content: string): Text {
  return new Text(content);
}

function panel(): Panel {
  return new Panel();
}

type EventHandler = () => void;

function button(label: string, onClick: EventHandler) {
  return new Button(label).addClickListener(onClick);
}

let VM = null;
function defineListener(func: () => void): EventHandler {
  const vm = VM;
  const result: EventHandler = () => {
    func();
    vm?.$forceUpdate();
  };
  VM = null;
  return result;
}

export class App implements IComponent {
  private _buttonName: string;
  private _textName: string;

  private _onClick: EventHandler;

  constructor() {
    this._buttonName = 'a button';
    this._textName = 'a text';

    this._onClick = defineListener(() => {
      this._buttonName = 'updated';
      this._textName = 'updated text';
    });
  }

  build() {
    const app = panel().add(text(this._textName)).add(button(this._buttonName, this._onClick));
    return app.build();
  }
}

export function renderApp(AppClass: { new (): IComponent }) {
  return defineComponent({
    setup() {
      VM = getCurrentInstance().proxy;

      const app = new App();

      return () => {
        console.log('render');
        return app.build();
      };
    },
  });
}
