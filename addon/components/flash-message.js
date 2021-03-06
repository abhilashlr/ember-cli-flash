import { htmlSafe, classify } from '@ember/string';
import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import { run } from '@ember/runloop';
import { computed, set, get, getWithDefault } from '@ember/object';
import layout from '../templates/components/flash-message';

const {
  and,
  bool,
  readOnly,
  not
} = computed;
const {
  next,
  cancel
} = run;

export default Component.extend({
  layout,
  active: false,
  messageStyle: 'bootstrap',
  classNames: ['flash-message'],
  classNameBindings: ['alertType', 'active', 'exiting'],
  attributeBindings: ['aria-label', 'aria-describedby', 'role'],

  showProgress: readOnly('flash.showProgress'),
  notExiting: not('exiting'),
  showProgressBar: and('showProgress', 'notExiting'),
  exiting: readOnly('flash.exiting'),
  hasBlock: bool('template').readOnly(),

  alertType: computed('flash.type', {
    get() {
      const flashType = getWithDefault(this, 'flash.type', '');
      const messageStyle = getWithDefault(this, 'messageStyle', '');
      let prefix = 'alert alert-';

      if (messageStyle === 'foundation') {
        prefix = 'alert-box ';
      }

      return `${prefix}${flashType}`;
    }
  }),

  flashType: computed('flash.type', {
    get() {
      const flashType = getWithDefault(this, 'flash.type', '');

      return classify(flashType);
    }
  }),

  didInsertElement() {
    this._super(...arguments);
    const pendingSet = next(this, () => {
      set(this, 'active', true);
    });
    set(this, 'pendingSet', pendingSet);
    this.element.addEventListener('mouseenter', this._mouseEnter);
    this.element.addEventListener('mouseleave', this._mouseLeave);
  },

  willDestroyElement() {
    this._super(...arguments);
    this.element.removeEventListener('mouseenter', this._mouseEnter);
    this.element.removeEventListener('mouseleave', this._mouseLeave);
  },

  progressDuration: computed('flash.showProgress', {
    get() {
      if (!get(this, 'flash.showProgress')) {
        return false;
      }

      const duration = getWithDefault(this, 'flash.timeout', 0);

      return htmlSafe(`transition-duration: ${duration}ms`);
    }
  }),

  click() {
    const destroyOnClick = getWithDefault(this, 'flash.destroyOnClick', true);

    if (destroyOnClick) {
      this._destroyFlashMessage();
    }
  },

  _mouseEnter() {
    const flash = get(this, 'flash');
    if (isPresent(flash)) {
      flash.preventExit();
    }
  },

  _mouseLeave() {
    const flash = get(this, 'flash');
    if (isPresent(flash) && !get(flash, 'exiting')) {
      flash.allowExit();
    }
  },

  willDestroy() {
    this._super(...arguments);
    this._destroyFlashMessage();
    cancel(get(this, 'pendingSet'));
  },

  // private
  _destroyFlashMessage() {
    const flash = getWithDefault(this, 'flash', false);

    if (flash) {
      flash.destroyMessage();
    }
  },

  actions: {
    close() {
      this._destroyFlashMessage();
    }
  }
});
