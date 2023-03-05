import { VNode, h, reactive, defineComponent, ref, getCurrentInstance, effect, createApp } from 'vue';

interface IComponent {
  build(): VNode;
}

let VM_REF = null;
let VUE_APP_REF = null;
let STATE_REF = null

class BaseComponent {
  private _style: Record<string, string>;
  private _events: Record<string, EventHandler> = {};

  get style(): Record<string, string> {
    return this._style;
  }

  withStyle(style: Record<string, string>): BaseComponent {
    this._style = style;
    return this;
  }

  addEventListener(eventName: string, handler: EventHandler) {
    this._events[eventName] = handler;
  }

  emitEvent(eventName: string, data: unknown) {
    const handle = this._events[eventName];
    if (handle && typeof handle === 'function') {
      handle(data);
    }

    if (VM_REF) {
      VM_REF.$forceUpdate();
    }
  }

  beforeMount() {}
  mounted() {}
  beforeUnmount() {}
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

  constructor(label) {
    super();
    this._label = label;
  }

  addClickListener(listener: () => void): Button {
    super.addEventListener('click', listener);
    return this;
  }

  build(): VNode {
    return h('button', { style: this.style || {}, onClick: event => super.emitEvent('click', event) }, this._label);
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

type EventHandler = (data?: unknown) => void;

function button(label: string, onClick?: EventHandler) {
  const btn = new Button(label);
  if (onClick) {
    btn.addClickListener(onClick);
  }

  return btn;
}

function createListener(func: () => void): EventHandler {
  const vm = VM_REF;
  const result: EventHandler = () => {
    func();
    vm?.$forceUpdate();
  };
  VM_REF = null;
  return result;
}

export class App implements IComponent {
  private _buttonName: string;
  private _textName: string;

  private _onClick: EventHandler;

  constructor() {
    this._buttonName = 'a button';
    this._textName = 'a text';

    this._onClick = createListener(() => {
      this._buttonName = 'updated';
      this._textName = 'updated text';
    });
  }

  build() {
    const app = panel().add(text(this._textName)).add(button(this._buttonName, this._onClick));
    return app.build();
  }
}

export function renderApp(AppClass: { new (): IComponent }, state: object, mountPoint: string | Element) {
  const RootComponent = defineComponent({
    setup() {
      VM_REF = getCurrentInstance().proxy;

      const entryObject = new AppClass();
      STATE_REF = reactive(state || {});
      effect(() => {
        const vm = VM_REF;
        if (vm) {
          vm.$forceUpdate();
        }
      });

      return () => {
        console.log('render');
        return entryObject.build();
      };
    },
  });

  VUE_APP_REF = createApp(RootComponent);
  let el = mountPoint;
  if (typeof mountPoint === 'string') {
    el = document.querySelector(mountPoint);
  }
  VUE_APP_REF.mount(el);
}
