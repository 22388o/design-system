/*
Copyright (c) 2015, salesforce.com, inc. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

const React = require('react');
const ReactDOM = require('react-dom');
const PT = React.PropTypes;

const ButtonIcon = require('ui/components/buttons/flavors/icon/index.react');
const AccessibleDialogContainer = require('ui/components/lib/accessible-dialog-container.react');
const globals = require('app_modules/global');
const cssPrefix = globals.cssPrefix;

const classNames = require('classnames');
const componentUtil = require('app_modules/ui/util/component');
const pf = componentUtil.prefix;
import ClassNameTransitionGroup from 'ui/components/lib/classname-transition-group.react';

class ModalFooter extends React.Component {
  static propTypes = {
    flavor: componentUtil.PropTypes.flavor('directional')
  };

  constructor(props) {
    super(props);
    componentUtil.install(this);
  }

  render() {
    const className = this.$getClassNameWithFlavor(pf('modal__footer x-small-buttons--horizontal'));
    const props = this.$propsWithoutKeys('className', 'flavor');
    return (
      <div { ...props } className={className}>
        { this.props.children }
      </div>
    );
  }
}

class ModalBody extends React.Component {
  constructor(props) {
    super(props);
    componentUtil.install(this);
  }

  render() {
    return (
      <div { ...this.props } className={this.$getClassName(pf('modal__content'))}>
        { this.props.children }
      </div>
    );
  }
}

class ModalHeader extends React.Component {
  static propTypes = { closeButton: PT.bool };
  static defaultProps = { closeButton: true };
  static contextTypes = { onRequestClose: PT.func };

  constructor(props) {
    super(props);
    componentUtil.install(this);
  }

  render() {
    return (
      <div { ...this.props } className={this.$getClassName(pf('modal__header'))}>
        { this.props.children }
        { this.props.closeButton ?
            <ButtonIcon
              onClick={this.context.onRequestClose}
              flavor="icon-inverse"
              iconFlavor="large"
              className={pf('modal__close')}
              sprite="action"
              symbol="close"
              assistiveText="Close" />
            : null
        }
      </div>
    );
  }
}

class Modal extends React.Component {
  static childContextTypes = { onRequestClose: PT.func };
  constructor(props) {
    super(props);
    componentUtil.install(this);
  }

  getChildContext() {
    return { onRequestClose: this.onClick.bind(this) };
  }

  onClick() {
    if (this.props.onRequestClose) {
      this.props.onRequestClose();
    }
  }
  onContentClick(e) {
    e.stopPropagation();
  }
  isModalChild(t) {
    let container = ReactDOM.findDOMNode(this);
    let node = t.parentNode;
    while (node !== null) {
      if (node === container) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }
  render() {
    const flavorName = this.$getClassNameWithFlavor(pf('modal'));
    const className = classNames(flavorName, {
      [`${cssPrefix}fade-in-open`]: this.props.isOpen && !this.props.edit,
      [`${cssPrefix}slide-up-open`]: this.props.isOpen && this.props.edit
    });
    const classNameModalContainer = this.$getClassName(pf('modal__container'), {
      [`${cssPrefix}slide-up-saving`]: this.props.saving,
      [`${cssPrefix}slide-down-cancel`]: this.props.edit && !(this.props.isOpen && this.props.edit) && !(this.props.isOpen && !this.props.edit) && !this.props.saving
    });
    const classNameModalBackdrop = classNames(pf('backdrop'), {
      [`${cssPrefix}backdrop--open`]: this.props.isOpen
    });
    return (
      <AccessibleDialogContainer onEsc={this.onClick.bind(this)}>
        <div aria-hidden={!this.props.isOpen} role="dialog" className={className} onClick={ this.onClick.bind(this) }>
          <ClassNameTransitionGroup transitionName={pf('modal__container')} timeout={100}>
            <div className={classNameModalContainer} onClick={ this.onContentClick.bind(this) } key="content">
              { this.props.children }
            </div>
          </ClassNameTransitionGroup>
        </div>
        <div className={classNameModalBackdrop} />
      </AccessibleDialogContainer>
    );
  }
}

class ModalWrapper extends React.Component {
  static propTypes = {
    isOpen: React.PropTypes.bool.isRequired,
    onRequestClose: React.PropTypes.func,
    renderInline: React.PropTypes.bool
  };
  static defaultProps = { renderInline: false }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {renderInline} = this.props;
    const hasDOM = document && document.createElement;
    if (!renderInline && hasDOM) {
      this.__node = document.createElement('div');
      document.body.appendChild(this.__node);
      this.renderModal(this.props);
    }
  }
  componentWillUnmount() {
    if (this.__node) {
      ReactDOM.unmountComponentAtNode(this.__node);
      document.body.removeChild(this.__node);
    }
  }
  componentWillReceiveProps(nextProps) {
    this.renderModal(nextProps);
  }
  render() {
    const {renderInline} = this.props;
    return renderInline
      ? <Modal {...this.props} tabindex="-1" />
      : null;
  }
  renderModal(props) {
    if (this.__node) {
      this.__modal = ReactDOM.render(
        React.createElement(Modal, props),
        this.__node
      );
    }
  }
}

ModalWrapper.displayName = 'Modal';

ModalWrapper.Header = ModalHeader;
ModalWrapper.Body = ModalBody;
ModalWrapper.Footer = ModalFooter;

module.exports = ModalWrapper;
