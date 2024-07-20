/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/
ajax = {};

ajax.view = async function(opt) {
  let url = opt.url;
  let empty = false;
  if (typeof opt.empty === 'undefined')
    empty = true;
  else
    empty = opt.empty;
  let page = opt.page;

  let title = opt.title || '';
  let containerId = opt.containerId;
  let params = opt.params || {};
  let callback = opt.success;

  let container = null;
  if (typeof containerId === 'string') {
    container = document.getElementById(containerId.trim());
    if (container == null) {
      container = document.querySelector(containerId.trim());
    }
  } else {
    container = containerId;
  }

  if (typeof data === 'undefined')
    data = {};
  if (window.parameters) {
    for (let k in data) {
      window.parameters[k] = data[k];
    }
  }

  if (window._current_view) {
    if (window._current_view.destroy) {
      window._current_view.destroy();
    }
    delete window._current_view;
  }
  let html = await xhr.get({
    url: url,
  });
  let fragment = null;
  if (container) {
    fragment = dom.append(container, html, empty);
  }
  if (fragment && fragment.id && window[fragment.id] && window[fragment.id].show && !callback) {
    window[fragment.id].show(params);
    window._current_view = window[fragment.id];
  }
  if (callback)
    callback(title, fragment, params);
};

ajax.sidebar = async function(opt) {
  let container = dom.find(opt.containerId);
  if (!container) container = document.body;
  let success = opt.success || function(title, fragment) {};
  // only one instance
  let sidebar = dom.find('[widget-id=widgetSidebar]'/*, container */);
  let allowClose = opt.allowClose || false;
  if (sidebar != null) sidebar.remove();
  sidebar = dom.element(`
    <div widget-id="widgetSidebar" style="position: absolute; top: 0; left: 0; height: 100%; width: 100%; background: rgba(0,0,0,0.15); z-index: 9999;">
      <div class="gx-sidebar fade show">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="page-header pl-3">
              <h5 class="modal-title"></h5>
              <button type="button" class="close text-danger position-relative" style="display:none;">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body" style="overflow-y: auto;"></div>
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 48px; border-top: 1px solid lightgrey; background: white; z-index: 9999; display: none;">
              <div widget-id="widgetSidebarActions" class="mh-10 mt-2" style="float: right;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
  if (opt.actions && opt.actions.length > 0) {
    dom.find('.modal-body', sidebar).style.marginBottom = '48px';
    let widgetSidebarActions = dom.find('[widget-id=widgetSidebarActions]', sidebar);
    widgetSidebarActions.parentElement.style.display = '';
    for (let action of opt.actions) {
      let btn = dom.create('button');
      btn.innerHTML = action.title;
      btn.setAttribute('class', action.classes);
      btn.style.marginRight = '12px';
      dom.bind(btn, 'click', action.onClick);
      widgetSidebarActions.appendChild(btn);
    }
  }
  // dom.height(sidebar, 0, document.body);
  sidebar.addEventListener('click', (evt) => {
    let widgetId = evt.target.getAttribute('widget-id');
    if (widgetId !== 'widgetSidebar') return;
    sidebar.children[0].classList.remove('in');
    sidebar.children[0].classList.add('out');
    setTimeout(function () {
      sidebar.remove();
    }, 300);
  });
  container.appendChild(sidebar);
  // get page id and reset url to null
  if (opt.url && opt.url.indexOf(':') == 0) {
    opt.page = opt.url.substring(1);
    opt.url = null;
  }
  let html = '';
  if (opt.url) {
    html = await xhr.get({
      url: opt.url,
    });
  } else if (opt.html) {
    html = opt.html;
  }
  dom.find('.modal-title', sidebar).innerHTML = opt.title || '';
  dom.find('.modal-body', sidebar).innerHTML = '';
  if (!allowClose && !opt.close) {
    dom.find('button.close', sidebar).classList.add('hidden');
  }
  if (allowClose === true) {
    // 自动调整关闭按钮为居中显示
    let button = dom.find('button.close', sidebar);
    let header = dom.find('.card-header', sidebar);
    let rectButton = button.getBoundingClientRect();
    let rectHeader = header.getBoundingClientRect();
    let gap = (rectHeader.height - rectButton.height) / 2;
    button.style.top = gap + 'px';
    button.style.right = gap + 'px';
  }
  dom.find('button.close', sidebar).addEventListener('click', function () {
    //关闭弹窗
    sidebar.children[0].classList.add('out');
    sidebar.remove();
    if (opt.close)
      opt.close();
  });
  let fragment = dom.append(dom.find('.modal-body', sidebar), html);
  if (success) success(opt.title || '', fragment);
  setTimeout(function () {
    sidebar.children[0].classList.remove('out');
    sidebar.children[0].classList.add('in');
  }, 300);
};

/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/
dialog = {};

dialog.confirm = function (message, callback) {
  layer.confirm(message, {
    title: '确认',
    btn: ['确定', '取消'] //按钮
  }, function (index, content) {
    let data = dom.formdata(content[0]);
    layer.close(index);
    callback(data);
  }, function () {

  });
};
/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/
dom = {};

/**
 * Creates a dom element.
 *
 * @param tag
 *        the tag name, and css classes
 *
 * @returns {any}
 *        the html element
 */
dom.create = function (tag) {
  let classes = Array.prototype.slice.call(arguments, 1);
  let ret = document.createElement(tag);
  for (let i = 0; i < classes.length; i++) {
    ret.classList.add(classes[i]);
  }
  return ret;
};

dom.append = function (container, html, empty) {
  let fragmentContainer = dom.create('div');
  fragmentContainer.style.height = '100%';
  fragmentContainer.style.width = '100%';
  empty = empty || false;
  let range = document.createRange();
  let fragment = range.createContextualFragment(html);
  if (empty !== false)
    container.innerHTML = '';
  container.appendChild(fragmentContainer);
  fragmentContainer.appendChild(fragment);
  let page = dom.find('[id^=page]', fragmentContainer);
  if (page) fragmentContainer.setAttribute('page-id', page.id);
  else fragmentContainer.setAttribute('page-id', 'page.not.in.database');
  return {
    id: page ?  page.id : '',
    container: fragmentContainer,
  };
};

/**
 * Finds all elements which are matching selector under parent or html document.
 *
 * @param selector
 *        the css selector
 *
 * @param parent
 *        the parent element or nothing
 *
 * @returns {any}
 *        the found single element or many elements as an array
 */
dom.find = function(selector, parent) {
  parent = parent || document;
  if (typeof selector !== 'string') return selector;
  let found = parent.querySelectorAll(selector);
  if (found.length == 0) return null;
  if (found.length == 1)  return found[0];
  return found;
};

/**
 * Finds the ancestor matching tag name for the given element.
 *
 * @param selector
 *        the element selector
 *
 * @param tag
 *        the element tag name
 */
dom.ancestor = function(selector, tag, clazz) {
  let element = null;
  clazz = clazz || '';
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  if (element == null) return null;
  tag = tag.toUpperCase();
  let found = element;
  if (clazz == '') {
    while (found != null && found.tagName != tag) {
      found = found.parentElement;
    }
  } else {
    while (found != null && !(found.tagName == tag && found.classList.contains(clazz))) {
      found = found.parentElement;
    }
  }

  return found;
};

/**
 *
 * @param html
 * @returns {null|Element}
 */
dom.element = function (html) {
  let div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild;
};

// dom.clickIn = function (selector, x, y) {
//   let element = null;
//   if (typeof selector === 'string') {
//     element = document.querySelector(selector);
//   } else {
//     element = selector;
//   }
//   let clicked = document.elementFromPoint(x, y);
// };

dom.bind = function (selector, event, handler) {
  let element = null;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  if (element == null)  return;
  if (element)
    // element['on' + event] = handler;
    element.addEventListener(event, handler);
};

/**
 * Gets or sets element data attribute values which element is matching to the selector.
 *
 * @param {Element} selector
 *        the element selector
 *
 * @param {object} data
 *        the data to set to html element, and if is undefined would get data from html element
 */
dom.model = function(selector, data) {
  let elm = null;
  if (typeof selector === 'string')
    elm = document.querySelector(selector);
  else
    elm = selector;
  if (typeof data !== 'undefined') {
    // set
    let attrs = Array.prototype.slice.call(arguments, 2);
    if (attrs.length == 0) {
      for (const key in data) {
        if (key.indexOf('||') == 0 || key.indexOf('//') == 0 || key.indexOf('>>') == 0) continue;
        if (typeof data[key] === 'object') {
          elm.setAttribute(utils.nameAttr(key), JSON.stringify(data[key]));
        } else {
          elm.setAttribute(utils.nameAttr(key), data[key]);
        }
      }
    } else {
      for (let i = 0; i < attrs.length; i++) {
        let key = attrs[i];
        if (key.indexOf('||') == 0 || key.indexOf('//') == 0 || key.indexOf('>>') == 0) continue;
        if (typeof data[key] === 'object') {
          elm.setAttribute(utils.nameAttr(key), JSON.stringify(data[key]));
        } else {
          elm.setAttribute(utils.nameAttr(key), data[key]);
        }
      }
    }
  } else {
    let ret = {};
    Array.prototype.slice.call(elm.attributes).forEach(function(attr) {
      if (attr.name.indexOf('data-model-') == 0) {
        if (attr.value.indexOf('{') == 0) {
          try {
            ret[utils.nameVar(attr.name.slice('data-model-'.length))] = JSON.parse(attr.value);
          } catch (err) {
            ret[utils.nameVar(attr.name.slice('data-model-'.length))] = attr.value;
          }
        } else {
          ret[utils.nameVar(attr.name.slice('data-model-'.length))] = attr.value;
        }
      }
    });
    return ret;
  }
};

/**
 * Collects html attribute values which elements are matching to the given selector.
 *
 * @param {string} selector
 *        the element selector
 *
 * @param {string} {array} name
 *        the attribute name or names
 *
 * @returns {array}
 *        the attribute values
 */
dom.collect = function (selector, name) {
  let ret = [];
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    let item = {};
    if (Array.isArray(name)) {
      for (let j = 0; j < name.length; j++) {
        item[name[j]] = elements[i].getAttribute(utils.nameAttr(name[j]));
      }
    } else {
      item[name] = elements.getAttribute(utils.nameAttr(name[j]));
    }
    ret.push(item);
  }
  return ret;
};

/**
 * Creates a child element and appends to container element.
 *
 * @param {element} container
 *        the container element
 *
 * @param {object} data
 *        the data for child element
 *
 * @param {string} {array} name
 *        the data names to set to element
 *
 * @param {function} creator
 *        the creator function to create element
 */
dom.propagate = function (container, data, name, creator) {
  let element = creator(data);
  if (Array.isArray(name)) {
    for (let i = 0; i < name.length; i++) {
      element.setAttribute(utils.nameAttr(name[i]), data[name[i]]);
    }
  } else {
    element.setAttribute(utils.nameAttr(name), data[name]);
  }
  container.appendChild(element);
};

dom.toggle = function (selector, resolve) {
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    element.addEventListener('click',  function() {
      let toggle = this.getAttribute('data-toggle');
      let strs = toggle.split('>>');
      let sources = strs[0].split('+');
      let targets = strs[1].split('+');

      let sourceMatched = false;
      let targetMatched = false;
      for (let i = 0; i < sources.length; i++) {
        let source = sources[i].trim();
        if (source.indexOf('.') == 0) {
          sourceMatched = this.classList.contains(source.substring(1));
        } else {
          let child = this.querySelector(source);
          sourceMatched = child != null;
        }
      }
      if (sourceMatched) {
        for (let i = 0; i < targets.length; i++) {
          let target = targets[i].trim();
          if (target.indexOf('.') === 0) {
            this.classList.add(target.substring(1));
          } else {
            let child = this.querySelector(target.substring(0, target.indexOf('.')));
            child.classList.add(target.substring(target.indexOf('.') + 1));
          }
        }
        for (let i = 0; i < sources.length; i++) {
          let source = sources[i].trim();
          if (source.indexOf('.') == 0) {
            this.classList.remove(source.substring(1));
          } else {
            let child = this.querySelector(source);
            child.classList.remove(source.substring(source.indexOf('.') + 1));
          }
        }
        return;
      }
      for (let i = 0; i < sources.length; i++) {
        let source = sources[i].trim();
        if (source.indexOf('.') == 0) {
          this.classList.add(source.substring(1));
        } else {
          let child = this.querySelector(source.substring(0, source.indexOf('.')));
          child.classList.add(source.substring(source.indexOf('.') + 1));
        }
      }
      for (let i = 0; i < targets.length; i++) {
        let target = targets[i].trim();
        if (target.indexOf('.') == 0) {
          this.classList.remove(target.substring(1));
        } else {
          let child = this.querySelector(target);
          child.classList.remove(target.substring(target.indexOf('.') + 1));
        }
      }
      if (resolve) resovle(this);
    });
  }
};

/**
 *
 * @param selector
 * @param resolve
 */
dom.switch = function (selector, resolve) {
  let container = dom.find(selector);
  let accordion = container.getAttribute('data-switch');
  let sources = accordion.split('+');
  let elements = container.querySelectorAll(sources[0]);
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    element.onclick = ev => {
      // clear all
      let siblings = container.querySelectorAll(sources[0]);
      for (let i = 0; i < siblings.length; i++) {
        siblings[i].classList.remove(sources[1].substring(1));
      }
      element.classList.add(sources[1].substring(1));
      if (resolve) resolve(element);
    };
  }
};

dom.tabs = function(tabsSelector) {
  let tabs = dom.find(tabsSelector);
  if (tabs == null) return;
  let activeClass = tabs.getAttribute('data-tab-active-class');
  for (let i = 0; i < tabs.children.length; i++) {
    let el = tabs.children[i];
    el.addEventListener('click', (ev) => {
      for (let i = 0; i < tabs.children.length; i++) {
        let el = tabs.children[i];
        el.classList.remove(activeClass);
      }
      el.classList.add(activeClass);
    })
  }
};

/**
 * Gets the top location Y of the given element in client area.
 *
 * @param selector
 *        the css selector
 *
 * @returns {number} the element Y value.
 */
dom.top = function (selector) {
  let element = null;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  // let ret = 0;
  // do {
  //   if ( !isNaN( element.offsetTop ) )
  //   {
  //     ret += element.offsetTop;
  //   }
  // } while (element = element.offsetParent);
  // return ret;
  if (element == null) return 0;
  let ret = element.offsetTop;
  if (typeof element.offsetParent !== 'undefined') {
    ret += dom.top(element.offsetParent);
  }
  return ret;
};

/**
 * Gets data from container element matching selector or
 * Sets data to it.
 *
 * @param selector
 *        the container selector
 *
 * @param data
 *        the data or undefined
 */
dom.formdata = function(selector, data) {
  let container = null;
  if (typeof selector === 'string') {
    container = document.querySelector(selector);
  } else {
    container = selector;
  }
  if (typeof data === 'undefined') {
    // get form data
    let values = {};

    // INPUT
    let checkboxCount = {};
    let inputs = container.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      let name = input.name;
      let type = input.type;
      let value = input.value;
      if (type == 'text' || type == 'number' || type == 'password' || type == 'hidden') {
        values[name] = null;
        if (value != '') {
          if (name.indexOf('[]') != -1) {
            values[name] = [value];
          } else {
            values[name] = value;
          }
        } else {
          values[name] = '';
        }
      } else if (type == 'radio') {
        // values[name] = null;
        if (input.checked) {
          values[name] = value;
        }
      } else if (type == 'checkbox') {
        // values[name] = [];
        if (typeof checkboxCount[name] === 'undefined') {
          checkboxCount[name] = 0;
        }
        if (input.checked) {
          if (typeof values[name] === 'undefined') {
            checkboxCount[name] = 0;
            values[name] = [];
          }
          values[name].push(value);
        }
        checkboxCount[name] += 1;
      }
    }
    // SELECT
    let selects = container.querySelectorAll('select');
    for (let i = 0; i < selects.length; i++) {
      let select = selects[i];
      let name = select.name;
      values[name] = null;
      if (select.selectedIndex != -1) {
        if (name.indexOf('[]') != -1) {
          values[name] = [select.value];
        } else {
          values[name] = select.value;
        }
      } else {
        values[name] = '';
      }
    }
    // TEXTAREA
    let textareas = container.querySelectorAll('textarea');
    for (let i = 0; i < textareas.length; i++) {
      let textarea = textareas[i];
      let name = textarea.name;
      values[name] = null;
      // if (textarea.innerHTML.trim() != '') {
      //   values[name] = textarea.innerHTML.replaceAll('<br>', '\n');
      // } else {
      //   values[name] = textarea.value;
      // }
      values[name] = textarea.value;
    }
    // 名称下只存在一个checkbox，就不用变成数组了
    for (let name in checkboxCount) {
      if (name.indexOf('[]') != -1) continue;
      if (checkboxCount[name] == 1 && values[name]) {
        values[name] = values[name][0];
      }
    }
    // 处理模板赋值
    for (let name in values) {
      if (typeof values[name] === 'string' && values[name].indexOf('${') == 0) {
        values[name] = values[values[name].substring(2, values[name].length - 1)];
      }
    }
    return values;
  } else {

    function getValue(obj, name) {
      if (name.indexOf('.') == 0) {
        let parentName = name.substring(0, name.indexOf('.'));
        let childName = name.substring(name.indexOf('.') + 1);
        return getValue(obj[parentName], childName);
      }
      if (typeof obj[name] === 'undefined') return '';
      return obj[name];
    }

    function setValue(container, name, val) {
      let el = dom.find('[name=\'' + name + '\']', container);
      if (el == null) return;
      if (el.length > 1) {
        if (el[0].type == 'radio') {
          let radios = el;
          radios.forEach((el, idx) => {
            if (el.value === val) {
              el.checked = true;
            } else {
              el.checked = false;
            }
          });
        }
      }
      if (el.tagName == 'INPUT') {
        if (el.type == 'check') {
          // TODO
        } else {
          el.value = val || '';
        }
      } else if (el.tagName == 'SELECT') {
        $('select[name=\'' + name + '\']').val(val).trigger('change');
      } else if (el.tagName == 'TEXTAREA') {
        el.innerHTML = val;
      }
    }

    for (let key in data) {
      if (typeof data[key] === 'object') {
        for (let innerKey in data[key]) {
          setValue(container, key + '.' + innerKey, data[key][innerKey]);
        }
      } else {
        setValue(container, key, data[key]);
      }
    }
  }
};

dom.enable = function(selector) {
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    elements[i].disabled = false;
  }
};

dom.disable = function(selector) {
  let elements;
  if (typeof selector === 'string') {
    elements = document.querySelectorAll(selector);
  } else {
    elements = selector;
  }
  for (let i = 0; i < elements.length; i++) {
    elements[i].disabled = true;
  }
};

/**
 * Gets the index of selector element under its parent element.
 *
 * @param selector
 *        the selector string or dom element
 *
 * @param fieldId
 *        the model id field name
 *
 * @param id (optional)
 *        the model id value
 */
dom.index = function(selector, fieldId, id) {
  let element;
  if (typeof selector === 'string')
    element = dom.find(selector);
  else
    element = selector;
  if (id) {

  } else {
    let elementModelId = element.getAttribute(fieldId);
    let children = element.parentElement.querySelectorAll(element.tagName);
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      let childModelId = child.getAttribute(fieldId);
      if (elementModelId == childModelId) {
        return i;
      }
    }
  }
  return -1;
};

dom.elementAt = function (selector, fieldId, id) {
  let children = document.querySelectorAll(selector);
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let childModelId = child.getAttribute(fieldId);
    if (id == childModelId) {
      return {index: i, element: child};
    }
  }
  return null;
};

dom.elementAtTree = function (selector, fieldId, fieldParentId, id, parentId) {
  let children = document.querySelectorAll(selector);
  let index = 0;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let childModelId = child.getAttribute(fieldId);
    let childModelParentId = child.getAttribute(fieldParentId);
    if (parentId == childModelParentId) {
      index++;
      if (id == childModelId) {
        return {index: index, element: child};
      }
    }
  }
};

/*
* 根据父元素和偏移量重新制定元素的高度
*  @param element
* */

dom.autoheight = function (selector, ancestor, customOffset) {
  customOffset = customOffset || 0;
  let el = dom.find(selector);
  if (el == null) return;
  ancestor = ancestor || document.body;
  let rectAncestor = ancestor.getBoundingClientRect();

  let height = rectAncestor.height;
  if (ancestor === document.body) {
    height = window.innerHeight;
  }

  let parent = el.parentElement;
  let rectParent = parent.getBoundingClientRect();
  let rect = el.getBoundingClientRect();
  let parentOffsetTop = parseInt(parent.offsetTop);

  let top = rect.top - rectAncestor.top;
  // 计算底部的高度
  let bottom = 0;
  while (parent !== ancestor) {
    let style = getComputedStyle(parent);
    bottom += parseInt(style.paddingBottom);
    bottom += parseInt(style.marginBottom);
    bottom += parseInt(style.borderBottomWidth);
    parent = parent.parentElement;
  }
  let style = getComputedStyle(el);
  bottom += parseInt(style.borderBottomWidth);

  el.style.height = (height - bottom - customOffset - top) + 'px';
  el.style.overflowY = 'auto';
};

dom.templatize = function(template, model) {
  let tpl = Handlebars.compile(template);
  let html = tpl(model);
  return dom.element(html);
};

dom.popup = function(container, element) {
  let mask = dom.create('div', 'full-width', 'full-height', 'position-absolute');
  mask.style.background = 'transparent';
  dom.bind(mask, 'click', ev => {
    mask.remove();
    element.remove();
  });
  document.body.appendChild(mask);
  container.appendChild(element);
  return mask;
};

dom.init = function (owner, element) {
  if (!element) return;
  let name = element.getAttribute('name');
  if (!name || name == '') {
    name = element.getAttribute('widget-id');
  }
  if (name && name != '') {
    owner[name] = element;
  }
  // 提示
  let tooltip = element.getAttribute('widget-model-tooltip');
  if (tooltip && tooltip != '') {
    tippy(element, {
      content: tooltip,
    });
  }
  for (let i = 0; i < element.children.length; i++) {
    let child = element.children[i];
    dom.init(owner, child);
  }
};

dom.close = function (which) {
  if (which == 'sidebar') {
    let widgetSidebar = dom.find('[widget-id=widgetSidebar]');
    if (widgetSidebar == null) return;
    widgetSidebar.children[0].classList.remove('in');
    widgetSidebar.children[0].classList.add('out');
    setTimeout(function () {
      widgetSidebar.remove();
    }, 300);
  }
};

/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/
utils = {};

utils.message = function (errors) {
  if (!errors && errors.length == 0) {
    return;
  }
  let ret = '';
  for (let i = 0; i < errors.length; i++) {
    ret += errors[i].message + '<br>';
  }
  return ret;
};

utils.prompt = function (errors) {
  if (!errors && errors.length == 0) {
    return;
  }
  for (let i = 0; i < errors.length; i++) {
    $(errors[i].element).addClass('is-invalid');
  }
};

utils.assemble = function (obj, objname) {
  if (typeof obj !== 'object')
    return;
  for (let key in obj) {
    let val = obj[key];
    if (typeof val === 'object') {
      obj[key + 'Id'] = val['id'];
    }
    if (key == 'id') {
      obj[objname + 'Id'] = val;
    } else if (key == 'name') {
      obj[objname + 'Name'] = val;
    }
  }
};

/**
 * Converts the javascript variable name to html data attribute name.
 *
 * @param {string} javascript variable name
 *
 * @return {string} html data attribute name
 */
utils.nameAttr = function(name) {
  const names = [];
  let item = '';
  for (let i = 0; i < name.length; i++) {
    let ch = name.charAt(i);
    if (ch == ch.toUpperCase()) {
      names.push(item);
      item = '';
      item += ch.toLowerCase();
    } else {
      item += ch;
    }
  }
  if (item != '') {
    names.push(item);
  }
  return 'data-model-' + names.join('-');
};

/**
 * Converts html data attribute name to javascript variable name.
 *
 * @param {string} html data attribute name
 *
 * @return {string} javascript variable name
 */
utils.nameVar = function(name, sep) {
  sep = sep || '-';
  if (name.indexOf(sep) == -1) return name;
  const names = name.split(sep);
  let ret = '';
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (i == 0) {
      ret += name;
    } else {
      ret += name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  return ret;
};

utils.camelcase = function(name, sep) {
  if (name.indexOf(sep) == -1) return name;
  const names = name.split(sep);
  let ret = '';
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (i == 0) {
      ret += name;
    } else {
      ret += name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  return ret;
};

utils.pascalcase = function(name, sep) {
  if (name.indexOf(sep) == -1) return name.charAt(0).toUpperCase() + name.slice(1);
  const names = name.split(sep);
  let ret = '';
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    ret += name.charAt(0).toUpperCase() + name.slice(1);
  }
  return ret;
};

utils.clone = function(source, target) {
  source = source || {};
  for (let k in source) {
    target[k] = source[k];
  }
};

utils.get = function(model) {
  let attrs = Array.prototype.slice.call(arguments, 1);
  let ret = {};
  for (let i = 0; i < attrs.length; i++) {
    ret[attrs[i]] = model[attrs[i]];
  }
  return ret;
};

utils.isEmpty = function(obj) {
  let ret = 0;
  for (let key in obj) {
    ret++;
  }
  return ret == 0;
};

utils.isBlank = function(obj) {
  let ret = 0;
  for (let key in obj) {
    if (obj[key] != null && obj[key] !== '') {
      ret++;
    }
  }
  return ret == 0;
};

utils.getParameter = function(url, name) {
  name = name.replace(/[\[\]]/g, '\\$&');
  let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

utils.getParameters = function(url) {
  if (url.indexOf('?') == -1) return {};
  let ret = {};
  url = url.substring(url.indexOf('?') + 1);
  let strs = url.split('&');
  for (let i = 0; i < strs.length; i++) {
    let pair = strs[i].split('=');
    if (pair.length == 1) return {};
    ret[pair[0].trim()] = decodeURIComponent(pair[1].trim());
  }
  return ret;
};

utils.isExisting = (array, obj, idField) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i][idField] === obj[idField])
      return true;
  }
  return false;
};

utils.textSize = (text, font) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  canvas.remove();
  return {width: metrics.width, height: metrics.height};
};

utils.base64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});

utils.randomId = () => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  const length = 6;
  let counter = 0;
  for (let i = 0; i < 2; i++) {
    counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    result += '_';
  }
  return result.substring(0, result.length - 1);
};

utils.camelcaseAttribute = (objname, attrname) => {
  objname = objname.toLowerCase();
  attrname = attrname.toLowerCase();
  if (attrname == 'id' || attrname == 'name' || attrname == 'type') {
    attrname = objname + '_' + attrname;
  }
  return utils.camelcase(attrname, '_');
};

utils.nameAttribute = (objname, attrname, domainType) => {
  domainType = domainType || '';
  let domainObjectType = '';
  let domainObjectId = '';
  if (domainType.startsWith('&')) {
    domainObjectType = domainType.substring(1, domainType.indexOf('('));
    domainObjectId = domainType.substring(domainType.indexOf('(') + 1, domainType.indexOf(')'))
  }
  objname = objname.toLowerCase();
  attrname = attrname.toLowerCase();
  if (domainObjectType !== '') {
    if (attrname === domainObjectType) {
      attrname = domainObjectType + '_' + domainObjectId;
    } else {
      attrname = attrname + '_' + domainObjectType + '_' + domainObjectId;
    }
  }
  if (attrname == 'id' || attrname == 'name' || attrname == 'type') {
    attrname = objname + '_' + attrname;
  }
  return attrname;
};

utils.safeValue = (obj, name) => {
  if (!obj) return '';
  let names = name.split('.');
  let ret = obj;
  for (let i = 0; i < names.length; i++) {
    ret = ret[names[i]];
    if (!ret) {
      return '';
    }
  }
  return ret || '';
};

utils.safeSet = (obj, name, value) => {
  if (!value) return;
  let names = name.split('.');
  let ret = obj;
  for (let i = 0; i < names.length; i++) {
    if (i == names.length - 1) {
      ret[names[i]] = value;
    } else {
      if (typeof obj[names[i]] === 'undefined') {
        obj[names[i]] = {};
      }
      ret = obj[names[i]];
    }
  }
  return obj;
};

utils.merge = (older, newer) => {
  let ret = {...older};
  for (let key in newer) {
    let val = newer[key];
    let type = typeof val;
    if (type === 'string' || type === 'number' || type === 'boolean') {
      ret[key] = val;
    } else if (type === 'object') {
      ret[key] = utils.merge(ret[key], val);
    }
  }
  return ret;
};

/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/

var NO_ERRORS = 0;
var REQUIRED_ERROR = 1;
var FORMAT_ERROR = 2;
var INVALID_ERROR = 3;

// add string trim method if not existing
if (!String.prototype.trim) {
  (function () {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function () {
      return this.replace(rtrim, '');
    };
  })();
}

Validation = {
  /**
   * 
   */
  validate: function (container, callback) {
    var ret = [];
    if (typeof container === 'undefined') {
      container = $(document);
    }
    if (typeof container === 'string') {
      container = $(container);
    } else {
      container = $(container);
    }
    // 输入框
    container.find('input[type!=checkbox][type!=radio][type!=button]').each(function (idx, el) {
      var val = $(el).val().trim();
      var label = Validation.getLabel(el);
      // 必填项校验
      var msg = $(el).attr('data-required-message') ? $(el).attr('data-required-message') : label + '必须填写！';
      if (Validation.isRequired(el) && val === '') {
        ret.push({
          element: el,
          message: msg
        });
      }
      // 专用类型校验
      var expr = $(el).attr('data-domain-type');
      if (!expr) {
        return;
      }
      var msg = label + '填写不合要求。';
      var dt = Validation.getDomainValidator(new ValidationModel(expr));
      if (dt != null && val !== '') {
        var res = dt.test(val);
        switch (res) {
          case REQUIRED_ERROR:
            break;
          case FORMAT_ERROR:
            msg = $(el).attr('data-format-message') ? $(el).attr('data-format-message') : msg;
            break;
          case INVALID_ERROR:
            msg = $(el).attr('data-invalid-message') ? $(el).attr('data-invalid-message') : msg;
            break;
          default:
            break;
        }
        if (res != NO_ERRORS) {
          ret.push({
            element: $(el),
            message: msg
          });
        }
      }
    });
    container.find('textarea').each(function (idx, el) {
      var val = $(el).val().trim();
      var label = Validation.getLabel(el);
      // 必填项校验
      var msg = $(el).attr('data-required-message') ? $(el).attr('data-required-message') : label + '必须填写！';
      if (Validation.isRequired(el) && val === '') {
        ret.push({
          element: el,
          message: msg
        });
      }
      // 专用类型校验
      var expr = $(el).attr('data-domain-type');
      if (!expr) {
        return;
      }
      var msg = label + '填写不合要求。';
      var dt = Validation.getDomainValidator(new ValidationModel(expr));
      if (dt != null && val !== '') {
        var res = dt.test(val);
        switch (res) {
          case REQUIRED_ERROR:
            break;
          case FORMAT_ERROR:
            msg = $(el).attr('data-format-message') ? $(el).attr('data-format-message') : msg;
            break;
          case INVALID_ERROR:
            msg = $(el).attr('data-invalid-message') ? $(el).attr('data-invalid-message') : msg;
            break;
          default:
            break;
        }
        if (res != NO_ERRORS) {
          ret.push({
            element: $(el),
            message: msg
          });
        }
      }
    });
    // 下拉框
    container.find('select').each(function (idx, el) {
      if (Validation.isRequired(el) && ($(el).val() == '-1' || $(el).val() == '' || $(el).val() == null)) {
        var label = Validation.getLabel(el);
        var msg = label + '必须选择！';
        msg = $(el).attr('data-required-message') ? $(el).attr('data-required-message') : msg;
        ret.push({
          element: $(el),
          message: msg
        });
      }
    });
    // 复选框
    var names = {};
    container.find('input[type=checkbox]').each(function (idx, el) {
      // 名称必须要有
      var name = $(el).attr('name');
      names[name] = name;
    });
    for (var name in names) {
      var checked = false;
      var label = null;
      var elm = null;
      container.find('input[name="' + name + '"]').each(function (idx, el) {
        if (idx == 0) {
          label = Validation.getLabel(el);
          elm = el;
        }
        if (!checked && $(el).prop('checked')) {
          checked = true;
        }
      });
      if (!checked && Validation.isRequired(elm)) {
        var msg = label + '必须选择！';
        msg = $(elm).attr('data-required-message') ? $(elm).attr('data-required-message') : msg;
        ret.push({
          element: $(elm),
          message: msg
        });
      }
    }
    // 单选框
    var names = {};
    container.find('input[type=radio]').each(function (idx, el) {
      // 名称必须要有
      var name = $(el).attr('name');
      names[name] = name;
    });
    for (var name in names) {
      var checked = false;
      var label = null;
      var elm = null;
      container.find('input[name="' + name + '"]').each(function (idx, el) {
        if (idx == 0) {
          label = Validation.getLabel(el);
          elm = el;
        }
        if (!checked && $(el).prop('checked')) {
          checked = true;
        }
      });
      if (checked === false && $(elm).prop('required')) {
        var msg = label + '必须选择！';
        // console.log(msg);
        msg = $(elm).attr('data-required-message') ? $(elm).attr('data-required-message') : msg;
        ret.push({
          element: $(elm),
          message: msg
        });
      }
    }
    // ajax验证
    container.find('input[remote]').each(function (idx, el) {
      var uri = $(el).attr('remote');
      var val = $(el).val().trim();
      if (uri && uri != '' && val != '') {
        $.ajax({
          url: uri,
          method: 'POST',
          data: "check=" + val,
          success: function (resp) {
            var obj = $.parseJSON(resp);
            if (obj.err) {
              ret.push({
                element: $(el),
                message: obj.msg
              });
            }
          }
        });
      }
    });
    if (callback) {
      callback(ret);
    }

    return ret;
  },

  getLabel: function (_el) {
    var el = $(_el);
    return el.attr('label') || $(el).attr("data-required") || (el.attr("name") || el.attr("id"));
  },

  isRequired: function(_el) {
    let el = $(_el);
    if (el.prop('required')) return true;
    if (el.attr('required') == 'required') return true;
    if (typeof el.attr('data-required') === 'undefined') return false;
    return el.attr('data-required') != '';
  },

  getDomainValidator: function (model) {
    var domain = model.keyword.toLowerCase();
    var vm = model;
    var ret = null;
    if (domain === 'mail' || domain === 'email') {
      ret = new Validation.Mail();
    } else if (domain === 'number') {
      ret = new Validation.Number(vm.symbol, vm.args);
    } else if (domain === 'string') {
      ret = new Validation.String(vm.args);
    } else if (domain === 'mobile') {
      ret = new Validation.Mobile();
    } else if (domain === 'range') {
      ret = new Validation.Range(vm.opts, vm.args);
    } else if (domain === 'phone') {
      ret = new Validation.Phone();
    } else if (domain === 'cmpexp') {
      ret = new Validation.CmpExp(vm.args[0], vm.args[1]);
    } else if (domain === 'regexp') {
      ret = new Validation.RegExp(vm.args[0]);
    } else if (domain === 'remote') {
      ret = new Validation.Remote(vm.args[0]);
    } else if (domain === 'date') {
      ret = new Validation.Date();
    } else if (domain === 'time') {
      ret = new Validation.Time();
    } else if (domain === 'datetime') {
      ret = new Validation.DateTime();
    } else {
      throw new Error('not support for the domain("' + domain + '")');
    }
    return ret;
  },

  String: function (args) {
    this.min = 0;
    this.max = parseInt(args[0]);
    if (args.length > 1) {
      this.min = parseInt(args[0]);
      this.max = parseInt(args[1]);
    }
    this.test = function (str) {
      if (str.length < this.min) {
        return FORMAT_ERROR;
      }
      if (this.max && str.length > this.max) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Number: function (sym, args) {
    var start = 7;
    this.plus = -1;
    this.minus = -1;
    if (sym === '-') {
      this.minus = 0;
    } else if (sym === '+') {
      this.plus = 0;
    }

    if (this.minus == 0 || this.plus == 0) {
      start += 1;
    }
    this.precision = parseInt(args[0]);
    if (args.length > 1) {
      this.scale = parseInt(args[1]);
    }

    this.test = function (str) {
      if (this.plus == 0) {
        var re = /^\s*(\+)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
        if (!re.test(str)) {
          return FORMAT_ERROR;
        }
      } else if (this.minus == 0) {
        var re = /^\s*(-)((\d+(\.\d+)?)|(\.\d+))\s*$/;
        if (!re.test(str)) {
          return FORMAT_ERROR;
        }
      } else {
        var re = /^\s*(\+)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
        if (!re.test(str)) {
          return FORMAT_ERROR;
        }
      }

      var idx = str.indexOf('.');
      var maxlen = idx == -1 ? this.precision : this.precision + 1;
      maxlen = this.plus == 0 || this.minus == 0 ? maxlen + 1 : maxlen;
      if (str.length > maxlen) {
        return FORMAT_ERROR;
      }

      if (idx != -1 && this.scale) {
        var s = str.substring(idx + 1);
        if (s.length > this.scale) {
          return FORMAT_ERROR;
        }
      }
      return NO_ERRORS;
    }
  },

  Mail: function () {
    this.test = function (str) {
      var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Phone: function () {
    this.test = function (str) {
      var re = /^\d{11}$/i;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Mobile: function () {
    this.test = function (str) {
      var re = /^\d{11}$/i;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Date: function () {
    this.test = function (str) {
      var re = /^\d{4}-\d{1,2}-\d{1,2}$/;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      if (isNaN(Date.parse(str))) {
        return INVALID_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Time: function () {
    this.test = function (str) {
      var re = /^\d{1,2}:\d{1,2}(:\d{1,2})?$/;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      str = "1970-01-01 " + str;
      if (isNaN(Date.parse(str))) {
        return INVALID_ERROR;
      }
      return NO_ERRORS;
    }
  },

  DateTime: function () {
    this.test = function (str) {
      var re = /^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}(:\d{1,2})?$/;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      if (isNaN(Date.parse(str))) {
        return INVALID_ERROR;
      }
      return NO_ERRORS;
    }
  },

  RegExp: function (expr) {
    this.re = new RegExp(expr);
    this.test = function (str) {
      if (!this.re.test(str)) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  CmpExp: function (type, expr) {
    this.model = new ValidationModel(type);
    this.expr = expr;
    this.ignore = false;
    var self = this;
    this.test = function (str) {
      var expr = this.expr;
      var dt = Validation.getDomainValidator(this.model);
      if (dt.test(str) != NO_ERRORS) {
        return FORMAT_ERROR;
      }
      $('input[type!=checkbox][type!=radio][type!=button]').each(function (idx, el) {
        var name = $(el).attr('name');
        var val = $(el).val();
        if (expr.indexOf(name) != -1) {
          if (val == '') {
            self.ignore = true;
          }
          expr = expr.replace(new RegExp(name, 'g'), val);
        }
      });
      if (!this.ignore) {
        try {
          if (!eval(expr)) {
            return INVALID_ERROR;
          }
        } catch (e) {
          return INVALID_ERROR;
        }
      }
      return NO_ERRORS;
    }
  },

  Remote: function (uri) {
    this.test = function (str) {
      $.ajax({
        url: uri + str,
        dataType: "json",
        success: function (resp) {
          if (resp.error != 0) {

          }
        }
      });
    }
  },

  Range: function (opts, args) {
    this.min = parseFloat(args[0]);
    this.max = parseFloat(args[1]);
    this.test = function (str) {
      var check = parseFloat(str.trim());
      if (isNaN(check)) {
        return INVALID_ERROR;
      }
      var ret = false;
      if (opts[0] == ">") {
        ret = (check > this.min);
      } else if (opts[0] === ">=") {
        ret = (check >= this.min);
      }
      if (!ret) {
        return INVALID_ERROR;
      }
      if (opts[1] == "<") {
        ret = (check < this.max);
      } else if (opts[1] === "<=") {
        ret = (check <= this.max);
      }
      if (!ret) {
        return INVALID_ERROR;
      }
      return NO_ERRORS;
    }
  }
};

ValidationModel = function (expr) {
  this.symbol = '';
  this.keyword = '';
  this.opts = [];
  this.args = [];

  this.unary_ops = {
    '+': true,
    '-': true
  };

  this.keywords = {
    'string': true,
    'number': true,
    'range': true,
    'regexp': true,
    'mobile': true,
    'email': true,
    'phone': true,
    'cmpexp': true
  };
  var index = 0;
  var length = expr.length;
  var word = '';
  while (index < length) {
    var ch = expr.charAt(index);
    if (this.isUnaryOp(ch) && index == 0) {
      this.symbol = ch;
    } else if (ch == '[') {
      if (this.keyword != '') {
        word += ch;
      } else {
        if (!this.stringEqual('range', word)) {
          throw new Error('"[" is just available for range.');
        }
        this.keyword = word;
        this.opts.push('>=');
        word = '';
      }
    } else if (ch == '(') {
      if (this.keyword != '') {
        this.opts.push('(');
        word += ch;
      } else {
        this.keyword = word;
        this.opts.push(">");
        word = '';
      }
    } else if (ch == ']') {
      this.opts.push("<=")
      this.args.push(word);
      word = '';
    } else if (ch == ')' && index == length - 1) {
      this.args.push(word);
      this.opts.push('<');
      word = '';
    } else if (ch == ')') {
      this.opts.pop('<');
      if (this.opts.length == 1) {
        word += ch;
      }
    } else if (ch == ',') {
      if (this.opts.length == 1) {
        this.args.push(word);
        word = '';
      } else {
        word += ch;
      }
    } else {
      word += ch;
    }
    index++;
  }
  if (this.keyword == '') {
    this.keyword = word;
  }
};

ValidationModel.prototype = {

  isKeyword: function (str) {
    return this.keywords[str.toLowerCase()];
  },

  isUnaryOp: function (ch) {
    return this.unary_ops[ch];
  },

  isDecimalDigit: function (ch) {
    return (ch >= 48 && ch <= 57); // 0...9
  },

  isIdentifierStart: function (ch) {
    return (ch === 36) || (ch === 95) || // `$` and `_`
      (ch >= 65 && ch <= 90) || // A...Z
      (ch >= 97 && ch <= 122); // a...z
  },

  isIdentifierPart: function (ch) {
    return (ch === 36) || (ch === 95) || // `$` and `_`
      (ch >= 65 && ch <= 90) || // A...Z
      (ch >= 97 && ch <= 122) || // a...z
      (ch >= 48 && ch <= 57); // 0...9
  },

  stringEqual: function (str0, str1) {
    return str0.toLowerCase() === str1.toLowerCase();
  }
};

/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/
xhr = {};

/**
 * @private
 */
xhr.url = function (url) {
  if (typeof HOST !== 'undefined' && url.indexOf('http') == -1) {
    url = HOST + url; 
  }
  return url;
};

xhr.params = function(url) {
  if (url.indexOf('?') == -1) return {};
  let ret = {};
  url = url.substring(url.indexOf('?') + 1);
  let strs = url.split('&');
  for (let i = 0; i < strs.length; i++) {
    let pair = strs[i].split('=');
    if (pair.length == 1) return {};
    ret[pair[0].trim()] = decodeURIComponent(pair[1].trim());
  }
  return ret;
};

/**
 * @private
 */
xhr.request = function (opts, method) {
  let url = xhr.url(opts.url);
  let params = xhr.params(url);
  let data = opts.data || opts.params || {};
  let type = opts.type || 'json';
  let success = opts.success;
  let error = opts.error;

  data = {...params, ...data};

  return new Promise((resolve,reject) => {
    let request  = new XMLHttpRequest();
    // request.timeout = 10 * 1000;
    request.onload = function () {
      let resp = request.responseText;
      if (type == 'json')
        try {
          resp = JSON.parse(resp);
        } catch (err) {
          console.log(err)
          reject(err)
          return;
        }
      if (request.readyState == 4 && request.status == "200") {
        resolve(resp)
      } else {
        reject(resp)
      }
    };
    request.onerror = function () {
      reject({error: {code: -500, message: '网络访问错误！'}})
    };
    request.ontimeout = function () {
      reject({error: {code: -501, message: '网络请求超时！'}})
    };
    request.open(method, url, true);
    request.setRequestHeader("Content-Type", "application/json");
    if (opts.headers) {
      for (let key in opts.headers) {
        request.setRequestHeader(key, opts.headers[key]);
      }
    }      
    if (data)
      request.send(JSON.stringify(data));
    else
      request.send(null);
  });
};

xhr.get = function (opts) {
  let url = opts.url;
  let data = opts.data;
  let success = opts.success;
  let error = opts.error;
  return new Promise((resolve,reject) => {
    let req  = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function () {
      resolve(req.responseText);
    };
    req.send(null);
  });
};

xhr.post = function (opts) {
  return xhr.request(opts, 'POST');
};

xhr.put = function (opts) {
  return xhr.request(opts, 'PUT');
};

xhr.patch = function (opts) {
  return xhr.request(opts, 'PATCH');
};

xhr.delete = function (opts) {
  return xhr.request(opts, 'DELETE');
};

xhr.connect = function (opts) {
  return xhr.request(opts, 'CONNECT');
};

xhr.upload = function(opts) {
  let url = opts.url;
  let params = opts.data || opts.params;
  let type = opts.type || 'json';
  let success = opts.success;
  let error = opts.error;

  let formdata = new FormData();
  for (let k in params) {
    formdata.append(k, params[k]);
  }
  formdata.append('file', opts.file);

  let req  = new XMLHttpRequest();
  // req.timeout = 10 * 1000;
  req.onload = function () {
    let resp = req.responseText;
    if (type == 'json')
      try {
        resp = JSON.parse(resp);
      } catch (err) {
        if (error) error(resp);
        return;
      }
    if (req.readyState == 4 && req.status == "200") {
      if (success) success(resp);
    } else {
      if (error) error(resp);
    }
  };
  if (opts.progress) {
    req.onprogress = function(ev) {
      opts.progress(ev.loaded, ev.total);
    };
  }
  req.onerror = function () {
    if (error) error({error: {code: -500, message: '网络访问错误！'}});
  };
  req.ontimeout = function () {
    if (error) error({error: {code: -501, message: '网络请求超时！'}});
  };
  req.open('POST', url, true);
  if (typeof APPTOKEN !== 'undefined') {
    req.setRequestHeader("apptoken", APPTOKEN);
  }
  req.send(formdata);
};

if (typeof module !== 'undefined') {
  module.exports = { xhr };
}
/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/
function CascadeSelect(opts) {
  let levels = opts.levels;
  let values = opts.values;
  let readonly = opts.readonly;
  let container = opts.container;
  let rectContainer = container.getBoundingClientRect();
  let widthContainer = rectContainer.width;
  let levelCount = opts.levels.length;
  let validate = opts.validate;

  async function displayPopup(link, params, values) {
    // 【选中下划线】渲染
    document.querySelectorAll('.cascadeselect-link').forEach(function(elm, idx) {
      elm.style.borderBottom = 'none';
    });
    link.style.borderBottom = '2px solid #1976D2';
    dom.model(link, params);
    let url = link.getAttribute('data-url');
    params = params || {};
    params.cascadeIndex = link.getAttribute('data-cascade-index');
    let container = link.parentElement.parentElement;
    let popup = dom.find('.cascadeselect-popup');
    if (popup == null) {
      popup = dom.create('div', 'row', 'b-a-1', 'mt-0', 'cascadeselect-popup');
      popup.style.overflowY = 'auto';
      popup.style.width = widthContainer + 'px';
      popup.style.maxHeight = '200px';
      popup.style.position = 'fixed';
      popup.style.zIndex = 99999;
      popup.style.backgroundColor = 'white';
    }
    popup.style.display = '';
    popup.innerHTML = '';
    let requestParams = {};
    if (params['_and_condition']) {
      requestParams['_and_condition'] = params['_and_condition'];
      requestParams['_other_select'] = params['_other_select'];
    } else {
      requestParams = params;
    }
    requestParams[link.getAttribute('data-cascade-field-value')] = '';

    let resp;
    if (url && url !== 'undefined') {
      resp = await xhr.post({
        url: url,
        params: requestParams,
      });
    } else {
      let cascadeIndex = parseInt(link.getAttribute('data-cascade-index'));
      if (cascadeIndex === 0) {
        data = values;
      } else {
        let selectOptions = link.getAttribute('data-cascade-options');
        if (selectOptions) {
          data = JSON.parse(selectOptions);
        } else {
          data = values;
          link.setAttribute('data-cascade-options', JSON.stringify(values));
        }
      }
    }
    let data = resp.data;
    for (let i = 0; i < data.length; i++) {
      let dataItem = data[i];
      let linkPopup = dom.create('a', 'btn', 'btn-link');
      if (dataItem[link.getAttribute('data-cascade-field-text')]) {
        linkPopup.innerText = dataItem[link.getAttribute('data-cascade-field-text')];
      }
      // set data-model-*
      dom.model(linkPopup, dataItem);
      // 选中点击事件
      linkPopup.addEventListener('click', function(event) {
        let cascadeIndex = parseInt(link.getAttribute('data-cascade-index'));
        let cascadeName = link.getAttribute('data-cascade-name');
        // let cascadeFieldValue = link.getAttribute('data-cascade-field-value');
        let cascadeFieldValue = link.getAttribute('data-cascade-field-value');
        let cascadeFieldText = link.getAttribute('data-cascade-field-text');
        let model = dom.model(this);
        link.setAttribute('data-cascade-value', model[cascadeFieldValue]);
        if (model[cascadeFieldText]) {
          link.innerText = model[cascadeFieldText];
        }
        dom.find('input', link.parentElement).value = model[cascadeFieldValue];
        dom.model(link, model);
        if (cascadeIndex < levelCount - 1) {
          let next = dom.find('a[data-cascade-index="' + (cascadeIndex + 1) + '"]', container);
          //清空下一级的数据
          next.setAttribute('data-cascade-value', '');
          next.innerText='请选择';
          dom.find('input', next.parentElement).value = '';

          let data = {};
          data[cascadeName] = model[cascadeFieldValue];
          let params = {};
          for (let key in levels[cascadeIndex + 1].params) {
            let tpl = Handlebars.compile(levels[cascadeIndex + 1].params[key]);
            params[key] = tpl(data);
          }
          next.removeAttribute('data-cascade-options');
          if (model.children) {
            displayPopup(next, params, JSON.parse(model.children), cascadeIndex);
          } else {
            displayPopup(next, params, cascadeIndex);
          }
          // 阻止繁殖的click事件
          event.stopImmediatePropagation();
          event.stopPropagation();
          event.preventDefault();
        }
        if (validate)
          validate(link.parentElement.parentElement);
      });
      popup.appendChild(linkPopup);
    }

    container.appendChild(popup);
  }

  for (let i = 0; i < levels.length; i++) {
    let level = levels[i];
    let div = dom.create('div');
    div.style.width = level.width;
    div.style.height = '18px';
    div.style.display = 'inline-block';
    div.style.textAlign = 'center';
    div.style.textOverflow = 'ellipsis';
    div.style.overflow = 'hidden';
    div.style.whiteSpace = 'nowrap';

    let link = dom.create('a', 'btn', 'pb-1', 'cascadeselect-link');
    link.style.paddingTop = '0';
    link.style.border = 'none';
    link.style.position = 'relative';
    link.style.top = '-2px';
    if (level.url) {
      link.setAttribute('data-url', level.url);
    }
    // link.setAttribute('data-usecase', level.usecase);
    link.setAttribute('data-cascade-index', i);
    link.setAttribute('data-cascade-name', level.name);
    link.setAttribute('data-cascade-field-value', level.fields.value);
    link.setAttribute('data-cascade-field-text', level.fields.text);
    link.style.borderRadius = 'unset';
    dom.model(link, level.params || {});

    if (level.value && level.value[level.fields.text]) {
      link.innerText = level.value[level.fields.text];
      link.setAttribute('data-cascade-value', level.value[level.fields.value] || level.value[level.name]);
    } else {
      link.innerText = level.text;
    }

    link.addEventListener('click', function() {
      if (opts.readonly) return;
      let params = dom.model(this);
      if (i - 1 >= 0) {
        let prev = dom.find('a', link.parentElement.previousElementSibling.previousElementSibling);
        let selected = prev.getAttribute('data-cascade-value');
        if (selected == null || selected == '') return;
        params[prev.getAttribute('data-cascade-name')] = selected;
        // for (let key in levels[i].params) {
        //   let tpl = Handlebars.compile(levels[i].params[key]);
        //   // params[key] = tpl(data);
        // }
      }
      // 去掉多余的参数
      for (let key in params) {
        if (key.indexOf('_') == 0) continue;
        if (key != levels[i].fields.value) {
          delete params[key];
        }
      }
      displayPopup(this, params, values);
    });

    if (i != levels.length - 1) {
      div.style.marginRight = '5px';
    }
    if (i > 0) {
      div.style.marginLeft = '3px';
    }

    let hidden = dom.create('input');
    hidden.setAttribute('type', 'hidden');
    if (opts.required)
      hidden.setAttribute('data-required', level.text);
    hidden.setAttribute('name', level.name);
    if (level.value && level.value[level.fields.value]) {
      hidden.value = level.value[level.fields.value];
    }
    div.appendChild(link);
    div.appendChild(hidden);
    container.appendChild(div);
    if (i != levels.length - 1) {
      let separator = dom.create('span');
      separator.textContent = '/';
      separator.style.position = 'absolute';
      separator.style.top = '4px';
      container.append(separator);
    }

    // validate them if having default value
    if (validate)
      validate(link.parentElement.parentElement);
  }

  function hidePopup(event) {
    let clickedElement = document.elementFromPoint(event.clientX, event.clientY);
    if (clickedElement.className.indexOf('cascadeselect') == -1) {
      let popup = dom.find('.cascadeselect-popup');
      if (popup != null) {
        document.querySelectorAll('.cascadeselect-link').forEach(function(elm, idx) {
          elm.style.borderBottom = 'none';
        });
        popup.remove();
      }
    }
  }

  document.removeEventListener('click', hidePopup);
  document.addEventListener('click', hidePopup);
};
/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/
let ICON_REQUIRED = '<i class="fas fa-asterisk icon-required gx-fs-12"></i>'//*
let ICON_GENERAL = '<i class="fas fa-question icon-general gx-fs-12"></i>';//?
let ICON_CORRECT = '<i class="fas fa-check text-success gx-fs-12" style="width: 10px;"></i>';//√
let ICON_ERROR = '<i class="fas fa-exclamation text-warning gx-fs-12"style="width: 10px;"></i>';//!

function EditableForm(opts) {
  let self = this;
  this.fields = opts.fields;
  /*!
  ** 保存时调用的方法。
  */
  this.doSave = opts.doSave || function (data) {};
  this.doLoad = opts.doLoad || function (data) {};
  
  this.readonly = opts.readonly || false;
  // 判断是否保存前提示，此处是提示语
  this.confirmText = opts.confirmText || '';
  this.confirm = opts.confirm;
  this.actions = opts.actions || [];
  this.actionable = (typeof opts.actionable === 'undefined') ? true : false;
  this.columnCount = opts.columnCount || 1;
  this.saveText = opts.saveText || '保存';
  this.savePromptText = opts.savePromptText;
  this.saveOpt = opts.save;
  this.readOpt = opts.read;
	this.mode = opts.mode || 'sidebar';
	this.onInit = opts.onInit || function() {};
  this.toast = dom.element(`
    <div class="toast fade b-a-1 text-white" data-autohide="false" 
         style="position: absolute; left: 20%; top: 10px; width: 60%; z-index: -1;">
      <div class="toast-header pt-1">
        <strong class="mr-auto p-2"></strong>
        <button type="button" class="ml-2 mb-1 mr-2 close text-white" data-dismiss="toast">&times;</button>
      </div>
      <div class="toast-body p-2"></div>
    </div>
  `);
  this.controls = {};

  dom.find('button', this.toast).addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    self.toast.classList.remove('show', 'in');
    self.toast.style.zIndex = -1;
  });

  this.variableListeners = {};
}

/**
 * Renders the form in page.
 *
 * @param containerId
 *        the container selector or itself
 *
 * @param params
 *        the request parameters
 */
EditableForm.prototype.render = async function (containerId, params) {
  this.containerId = containerId;
  if (typeof containerId === 'string') {
    this.container = document.querySelector(containerId);
  } else {
    this.container = containerId;
  }
  this.container.innerHTML = '';

  await this.fetch(params);
};

/**
 * Builds the form.
 *
 * @param persisted
 *        the persisted data which is fetching from remote data
 *
 * @private
 */
EditableForm.prototype.build = async function(persisted) {
  let self = this;
  persisted = persisted || {};
  let form = dom.create('div', 'col-md-12', 'form-horizontal');
  let columnCount = this.columnCount;
  let hiddenFields = [];
  let shownFields = [];
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    let defaultValue = field.value;
    // make default value working
    if (field.name) {
      if (field.name.indexOf("[]") != -1) {
        let name = field.name.substring(0, field.name.indexOf('[]'));
        field.value = (typeof persisted[name] === 'undefined' || persisted[name] == 'null') ? null : persisted[name];
      } else if (field.name.indexOf('.') != -1) {
        let parentName = field.name.substring(0, field.name.indexOf('.'));
        let childName = field.name.substring(field.name.indexOf('.') + 1);
        field.value = (typeof persisted[parentName] === 'undefined' || persisted[parentName] == 'null') ? null :
            (typeof persisted[parentName][childName] === 'undefined' || persisted[childName] == 'null') ? null : persisted[parentName][childName];
      } else {
        field.value = (typeof persisted[field.name] === 'undefined' || persisted[field.name] == 'null') ? null : persisted[field.name];
      }
    }
    // 默认值设置
    if (!field.value && defaultValue) {
      field.value = defaultValue;
    }
    if (field.input == 'hidden') {
      hiddenFields.push(field);
    } else {
      shownFields.push(field);
    }
  }

  let rows = [];
  let len = shownFields.length;

  let groups = [];
  let group = {
    title: '',
    fields: []
  };
  for (let i = 0; i < shownFields.length; i++) {
    let field = shownFields[i];

    // 重新分组
    if (field.input === 'title') {
      groups.push(group);
      group = {
        title: field.title,
        fields: []
      };
    } else {
      group.fields.push(field);
    }
  }

  if (group.fields.length !== 0) groups.push(group);

  // hidden fields
  for (let i = 0; i < hiddenFields.length; i++) {
    let field = hiddenFields[i];
    let hidden = dom.create('input');
    hidden.type = 'hidden';
    hidden.name = field.name;
    hidden.value = field.value;
    hidden.setAttribute('data-identifiable', field.identifiable || false);
    form.appendChild(hidden);
  }

  for (let i = 0; i < groups.length; i++) {
    let group = groups[i];
    if (group.title) {
      let el = dom.element('<div class="title-bordered" style="margin: 10px -10px;"><strong>' + group.title + '</strong></div>')
      form.appendChild(el);
    }
    let cols = 24 / columnCount;
    let row = dom.create('div', 'row', 'mx-0');
    for (let j = 0; j < group.fields.length; j++) {
      let field = group.fields[j];
      let pair = this.createInput(field, columnCount);

      let labelAndInput = dom.create('div', 'd-flex', 'gx-24-' + cols, 'mx-0', 'mb-2');
      if (pair.label != null) {
        pair.label.classList.add('pl-3');
        pair.input.classList.add('pr-3');
        labelAndInput.appendChild(pair.label);
      }
      labelAndInput.appendChild(pair.input);
      // 指定字段的容器，以备不时只需。
      field.container = labelAndInput;
      row.appendChild(labelAndInput);
      if (field.note) {
        let el = pair.input.children[1];
        el.innerHTML = field.note;
      }
    }
    form.appendChild(row);
  }
  // 必须放在这里，否者后续容器会找不到
  this.container.appendChild(form);
  this.container.appendChild(this.toast);

  // ###################### //
  // 引用的第三方插件，重新渲染 //
  // ###################### //
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    if (field.input == 'date') {
      const elem = dom.find('input[name="' + field.name + '"]', this.container);
      const datepicker = new Datepicker(elem, {
        format: 'yyyy-mm-dd',
        language: 'zh-CN',
        autohide: true,
      }); 
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '\']', this.container).value = moment(field.value).format('YYYY-MM-DD');
      }
    } else if (field.input == 'datetime') {
      $(this.container).find('input[name=\'' + field.name + '_date\']').datetimepicker({
        format: 'YYYY-MM-DD',
        language: 'zh-CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '_date\']', this.container).value = moment(field.value).format('YYYY-MM-DD');
      }

      $(this.container).find('input[name=\'' + field.name + '_time\']').datetimepicker({
        format: 'HH:mm:00',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '_time\']', this.container).value = moment(field.value).format('HH:mm:00');
      }
    } else if (field.input == 'time') {
      $(this.container).find('input[name=\'' + field.name + '\']').datetimepicker({
        format: 'hh:mm:00',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '\']', this.container).value = moment(field.value).format('hh:mm:00');
      }
    } else if (field.input == 'select') {
      let opts = field.options;
      opts.validate = EditableForm.validate;
      // 加载值或者默认值
      // 允许数组值
      if (Array.isArray(field.value)) {
        opts.selection = field.value[0][opts.fields.value];
      } else {
        opts.selection = field.value;
      }
      let select = dom.find('select[name="' + field.name + '"]', this.container);
      select.append(dom.element('<option data-placeholder="true"></option>'));
      if (opts.values) {
        for (let i = 0; i < opts.values.length; i++) {
          select.append(dom.element('<option value="' + opts.values[i].value + '">' + opts.values[i].text + '</option>'));
        }
      }
      new SlimSelect({
        select: select,
        // data: opts.values,
        placeholder: true,
        settings: {
          allowDeselect: true,
          showSearch: false,
          placeholderText: '请选择…',
          contentPosition: 'absolute',
        },  
        events: {
          afterChange: (newVal) => {
            // TODO
          }
        },   
      });
    } else if (field.input == 'cascade') {
      let opts = field.options;
      opts.validate = EditableForm.validate;
      // 加载值或者默认值
      for (let j = 0; j < opts.levels.length; j++) {
        let level = opts.levels[j];
        if (typeof persisted[level.name] !== "undefined") {
          level.value = persisted[level.name];
        }
      }
      opts.required = field.required || false;
      if (this.readonly == true) {
        opts.readonly = true;
      }
      if (field.readonly == true) {
        opts.readonly = true;
      }
      // $(this.container).find('div[data-cascade-name=\'' + field.name + '\']').cascadeselect(opts);
      opts.container = dom.find('div[data-cascade-name="' + field.name + '"]', this.container);
      new CascadeSelect(opts);
    } else if (field.input == 'checklist') {
      if (this.readonly == true) {
        field.options.readonly = true;
      }
      if (field.readonly == true) {
        field.options.readonly = true;
      }
      field.options.name = field.name;
      this.params = this.params || {};
      field.options.data = field.options.data || {};
      for (let key in this.params) {
        field.options.data[key] = this.params[key];
      }
      let container = dom.find('div[data-checklist-name=\'' + field.name + '\']', this.container);
      new Checklist(field.options).render(container, {
        selections: persisted[field.name] || []
      });
      field.container = container.parentElement.parentElement;
    } else if (field.input == 'checktree') {
      field.options.name = field.name;
      field.options.readonly = this.readonly;
      this.params = this.params || {};
      field.options.data = field.options.data || {};
      for (let key in this.params) {
        field.options.data[key] = this.params[key];
      }
      let container = dom.find('div[data-checktree-name=\'' + field.name + '\']', this.container);
      this[field.name] = new TreelikeList(field.options);
      this[field.name].render(container, field.value);
      field.container = container.parentElement.parentElement;
    } else if (field.input == 'fileupload' || field.input == 'files') {
      let container = dom.find('div[data-fileupload-name=\'' + field.name + '\']', this.container);
      await new FileUpload({
        ...field.options,
        local: persisted[field.name] || [],
        name: field.name,
      }).render(container);
      field.container = container.parentElement.parentElement;
    } else if (field.input == 'imageupload') {
      // DEPRECATED
      new ImageUpload(field.options).render(dom.find('div[data-imageupload-name=\'' + field.name + '\']', this.container));
    } else if (field.input == 'image') {
      new Medias({
        ...field.options,
        mediaType: 'image',
        multiple: false,
      }).render(dom.find('div[data-medias-name=\'' + field.name + '\']', this.container), field.value);
    } else if (field.input == 'images') {
      new Medias({
        ...field.options,
        mediaType: 'image',
      }).render(dom.find('div[data-medias-name=\'' + field.name + '\']', this.container), field.value);
    } else if (field.input == 'video') {
      new Medias({
        ...field.options,
        mediaType: 'video',
        multiple: false,
      }).render(dom.find('div[data-medias-name=\'' + field.name + '\']', this.container), field.value);
    } else if (field.input == 'videos') {
      new Medias({
        ...field.options,
        mediaType: 'video',
      }).render(dom.find('div[data-medias-name=\'' + field.name + '\']', this.container), field.value);
    } else if (field.input == 'longtext') {
      if (field.language === 'javascript') {
        let textarea = dom.find(containerId + ' textarea[name=\'' + field.name + '\']');
        let cm = CodeMirror.fromTextArea(textarea, {
          mode: 'javascript',
          lineNumbers: true,
          height: 420,
          background: '#565656'
        });
        cm.on('keyup', function(cm, what) {
          dom.find(' textarea[name=\'' + field.name + '\']', this.container).innerText = cm.getDoc().getValue();
        });
      }
    } else if (field.input == 'avatar') {
      new Avatar({
        readonly: this.readonly,
        name: field.name
      }).render(dom.find('div[data-avatar-name=\'' + field.name + '\']', this.container), field.value);
    } else if (field.input == 'logo') {
      new Logo({
        readonly: this.readonly,
        name: field.name
      }).render(dom.find('div[data-logo-name=\'' + field.name + '\']', this.container), field.value);
    }
  }

  let containerButtons = dom.create('div');
  containerButtons.classList.add('buttons');
  let buttons = dom.create('div');
	if(this.mode != 'page'){
		buttons.classList.add('float-right');
	}else{
		buttons.classList.add('row-button');
	}

  // custom buttons
  for (let i = 0; i < this.actions.length; i++) {
    buttons.appendChild(this.createButton(this.actions[i]));
    buttons.append(' ');
  }

  let buttonClose = dom.create('button', 'btn', 'btn-sm', 'btn-close');
  buttonClose.textContent = '关闭';
  dom.bind(buttonClose, 'click', function() {
    event.preventDefault();
    event.stopPropagation();
    let rightbar = dom.find('div[widget-id=right-bar]')
    // let rightbar = dom.ancestor(self.container, 'div', 'right-bar');
    if (rightbar != null) {
      rightbar.children[0].classList.add('out');
      setTimeout(function () {
        rightbar.remove();
      }, 300);
    }
  });
  if (this.actionable === false) return;
  if (this.actionable && this.mode!='page') {
    buttons.appendChild(buttonClose);
  }
  let buttonSave = dom.create('button', 'btn', 'btn-sm', 'btn-save');
  buttonSave.innerHTML = this.saveText;

  dom.bind(buttonSave, 'click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    if (self.confirm) {
      self.confirm();
    } else if (self.confirmText !== '') {
      let ct = self.confirmText;
      if (typeof self.confirmText === 'function') {
        ct = self.confirmText();
      }
      dialog.confirm(ct, () => {
        self.save();
      });
    } else {
      self.save();
    }
  });

  let rightBarBottom = dom.find('div[widget-id=right-bar-bottom]');
  if (rightBarBottom != null) {
    rightBarBottom.innerHTML = '';
    if (!this.readonly) {
      buttons.appendChild(buttonSave);
      buttons.append(' ');
    }
    // if (this.actions.length > 0) {
    let row = dom.create('div', 'full-width', 'b-a-0');
    let rightbar = dom.find('.right-bar');
    if (rightbar != null) {
      if (rightBarBottom.parentElement.style.display !== 'none') {
        rightBarBottom.appendChild(buttonSave);
        for (let action of self.actions) {
          rightBarBottom.appendChild(dom.element('<span style="display: inline-block;width: 12px;"></span>'));
          rightBarBottom.appendChild(self.createButton(action));
        }
        rightBarBottom.appendChild(dom.element('<span style="display: inline-block;width: 12px;"></span>'));
        rightBarBottom.appendChild(buttonClose);
      } else {
        containerButtons.appendChild(buttons);
        row.appendChild(containerButtons);
        this.container.appendChild(row);
      }
    } else {
      // FIXME: WHY DO THIS?
      // this.container.appendChild(buttons);
    }
  }

  this.originalPosition = this.container.getBoundingClientRect();
  this.originalPositionTop = this.originalPosition.top;

  // 根据字段不同值，显示或者隐藏其他字段
  for (let f of self.fields) {
    self.hideOrShowField(f);
  }
  // 初始化显示
  this.onInit();
};

/**
 * Fetches form data from remote data source and renders form
 * under container.
 *
 * @param read
 *        the remote options
 */
EditableForm.prototype.fetch = async function (params) {
  let self = this;
  params = params || {};
  if (!this.readOpt) {
    this.build(params);
    return;
  }
  if (this.readOpt.params) {
    for (let k in this.readOpt.params) {
      params[k] = this.readOpt.params[k];
    }
  }
  // if not need to fetch data
  if (!this.readOpt.url && this.readOpt.url == '') {
    this.build({});
    return;
  }
  let data = await xhr.promise({
    url: this.readOpt.url,
    data: params,
  });
  if (!data) data = {};
  if (self.readOpt.asyncConvert) {
    data = await self.readOpt.asyncConvert(data);
  }
  if (self.readOpt.convert) {
    data = self.readOpt.convert(data);
  }
  // 保存表单旧值的变量。
  self.oldValues = data;
  if (utils.isEmpty(data)) {
    self.build(params);
    if (self.readOpt.callback) {
      self.readOpt.callback(params);
    }
  } else {
    for (let keyParam in params) {
      if (typeof data[keyParam] === 'undefined') {
        data[keyParam] = params[keyParam];
      }
    }
    self.build(data);
    if (self.readOpt.callback) {
      self.readOpt.callback(data);
    }
  }
};

EditableForm.prototype.read = function (params) {
  let self = this;
  params = params || {};

  if (this.readOpt.params) {
    for (let k in this.readOpt.params) {
      params[k] = this.readOpt.params[k];
    }
  }
  xhr.post({
    url: this.readOpt.url,
    data: params,
    success: function(resp) {
      if (resp.error) {
        dialog.error(resp.error.message);
        return;
      }
      dom.formdata(self.container, resp.data);
    }
  });
};

/**
 * Saves form data to remote data source.
 */
EditableForm.prototype.save = async function (toasting) {
  let self = this;
  let awaitConvert = this.saveOpt.awaitConvert || false;
  let errors = Validation.validate($(this.containerId));
  if (errors.length > 0) {
    self.error(utils.message(errors));
    return;
  }
  // disable all buttons
  let buttonSave = dom.find('button.btn-save', this.container);
  if (buttonSave != null)
    buttonSave.innerHTML = "<i class='fa fa-spinner fa-spin'></i>数据保存中……";
  dom.disable(dom.find('button', this.container), 'disabled', true);
  let formdata = dom.formdata(this.containerId);
  let data = this.saveOpt.params || {};
  for (let key in formdata) {
    data[key] = formdata[key];
  }
  if (this.saveOpt.convert) {
    if (awaitConvert) {
      data = await this.saveOpt.convert(data)
    } else {
      data = this.saveOpt.convert(data);
    }
  } else if (this.saveOpt.asyncConvert) {
    data = await this.saveOpt.asyncConvert(data);
  }
  xhr.post({
    url: this.saveOpt.url,
    usecase: this.saveOpt.usecase,
    data: data,
    success: function (resp) {
      // enable all buttons
      if (buttonSave != null)
        buttonSave.innerHTML = self.saveText;
      dom.enable('button', self.container);
      if (resp.error) {
        self.error(resp.error.message);
        return;
      }
      let identifiables = document.querySelectorAll(' input[data-identifiable=true]', self.container);
      for (let i = 0; i < identifiables.length; i++) {
        identifiables[i].value = resp.data[identifiables[i].name];
      }
      if (self.saveOpt.callback) self.saveOpt.callback(resp.data);
      if (self.saveOpt.success) self.saveOpt.success(resp.data);
      if (toasting === false) return;
      self.success(self.savePromptText || '数据保存成功！', () => {
        // 默认自动关闭
        if (self.saveOpt.autoClose !== false) {
          let rightbar = dom.find('div[widget-id=right-bar]');
          if (rightbar != null) {
            rightbar.children[0].classList.add('out');
            setTimeout(function () {
              rightbar.remove();
            }, 300);
          }
        }
      });
    }
  });
};

/**
 * Creates input element in form.
 *
 * @param field
 *        field option
 *
 * @param EditableForm.js
 *        column count in a row
 *
 * @returns {object} label and input with add-ons dom elements
 *
 * @private
 */
EditableForm.prototype.createInput = function (field, columnCount) {
  let self = this;
  field.columnCount = field.columnCount || 1;
  columnCount = columnCount || 2;
  let _required = field.required || false;

  let averageSpace = 24 / columnCount;
  let labelGridCount = 0;
  let inputGridCount = 0;
  if (averageSpace === 24) {
    labelGridCount = 6;
    inputGridCount = 18;
  } else if (averageSpace === 12) {
    labelGridCount = 6;
    inputGridCount = 18;
  } else if (averageSpace === 8) {
    labelGridCount = 3;
    inputGridCount = 5;
  } else if (averageSpace === 6) {
    labelGridCount = 2;
    inputGridCount = 4;
  }
  let label = dom.create('div', 'gx-24-' + this.formatGridCount(labelGridCount),'col-form-label', (_required?'required':'norequired'));
  label.innerText = field.title + '：';
  inputGridCount += (labelGridCount + inputGridCount) * (field.columnCount - 1);

  let groupContainer = dom.create('div', 'gx-24-' + this.formatGridCount(inputGridCount));
  let group = dom.create('div', 'full-width', 'input-group');
  let feedback = dom.create('div', 'small', 'text-muted', 'pt-1');
  feedback.setAttribute('role', 'feedback');
  groupContainer.appendChild(group);
  groupContainer.appendChild(feedback);

  let input = null;
  if (field.input == 'code') {
    let fixed = field.fixed || [];
    for (let i = 0; i < fixed.length; i++) {
      let prepend = dom.element(`
        <div class="input-group-prepend">
          <span class="input-group-text">
          </span>
        </div>
      `);
      prepend.querySelector('span').innerText = fixed[i];
      group.appendChild(prepend);
    }
    input = dom.create('input', 'form-control');
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('name', field.name);
    input.setAttribute('label', field.title);
  } else if (field.input == 'select') {
    input = dom.create('select', 'form-control');
    input.style = '-moz-appearance:none';
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请选择...');
    input.setAttribute('label', field.title);
  } else if (field.input == 'bool') {
    input = dom.element(`
      <div class="d-flex full-width">
        <label class="c-switch c-switch-label c-switch-pill c-switch-info mt-1" style="min-width: 48px;">
          <input class="c-switch-input" value="T" name="" type="checkbox">
          <span class="c-switch-slider" data-checked="是" data-unchecked="否"></span>
        </label>
        <select class="form-control ml-4">
          <option value="-1">请选择</option>
        </select>
      </div>
    `);
    let elInput = dom.find('input', input);
    // default is checked
    // dom.find('input', input).setAttribute('checked', true);
    if (field.value === 'T' || field.value === true) {
      dom.find('input', input).setAttribute('checked', false);
    }
    if (field.disabled === true) {
      elInput.disabled = true;
    }
    elInput.setAttribute('label', field.title);
    let select = dom.find('select', input);

    if (!field.options) {
      select.remove();
    } else {
      select.name = field.name + '$';
      for (let j = 0; j < field.options.values.length; j++) {
        let value = field.options.values[j];
        select.appendChild(dom.element('<option value="' + value.value + '" ' + (field.value === value.value ? 'selected' : '') + '>' + value.text + '</option>'));
      }
      if (!field.value || field.value === 'F') {
        elInput.checked = false;
        select.disabled = true;
      } else {
        elInput.checked = true;
      }
      elInput.addEventListener('change', ev => {
        let select = dom.find('select', ev.target.parentElement.parentElement);
        if (ev.target.checked)
          select.disabled = false;
        else
          select.disabled = true;
      });
    }
    dom.find('input', input).setAttribute('name', field.name);
  } else if (field.input == 'radiotext' || field.input == 'booltext') {
    let radios = [];
    let defaultValue = '';
    field.values = field.values || [{value: '+', text: '正'},{value:'-', text: '负'}];
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      if (!val.input) {
        defaultValue = val.value;
        break;
      }
    }
    let checked = false;
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      let radio = dom.element(`
        <div class="form-check form-check-inline">
          <input name="" value="" type="radio"
                 class="form-check-input radio color-primary is-outline">
          <label class="form-check-label" for=""></label>
        </div>
      `);
      dom.find('input', radio).name = field.name;
      if (!field.value) {
        if (val.checked) {
          dom.find('input', radio).checked = true;
        }
      } else {
        if (field.value != val.value && val.value != defaultValue && !checked) {
          // 自定义的输入框的值
          dom.find('input', radio).checked = true;
        } else if (field.value == val.value) {
          // 初始的默认值
          dom.find('input', radio).checked = true;
          checked = true;
        }
      }
      if (field.required === true) {
        dom.find('input', radio).setAttribute('required', true);
        dom.find('input', radio).setAttribute('data-required', field.title);
      }
      dom.find('input', radio).value = val.value;
      dom.find('input', radio).disabled = this.readonly || field.readonly || false;
      // dom.find('label', radio).setAttribute('for', 'radio_' + val.value);
      dom.find('label', radio).textContent = val.text;
      group.append(radio);
      radios.push(radio);
    }
    for (let j = 0; j < field.values.length; j++) {
      let val = field.values[j];
      // 有输入框
      if (val.input) {
        dom.bind(radios[j], 'click', (ev) => {
          let textInput = dom.find('input[type=text]', group);
          textInput.style.display = '';
        });
        let input = dom.element('<input type="text" class="form-control">');
        input.name = val.input.name;
        input.placeholder = val.input.placeholder || '';
        input.style.display = field.value && field.value != defaultValue ? '' : 'none';
        if (val.value != field.value) {
          input.value = field.value;
          if (input.value == defaultValue) {
            input.value = '';
          }
        }
        group.appendChild(input);
      } else {
        dom.bind(radios[j], 'click', (ev) => {
          let textInput = dom.find('input[type=text]', group);
          textInput.style.display = 'none';
        });
      }
    }
  } else if (field.input == 'radio') {
    group.classList.add('col-form-label');
    field.values = field.values || [{value: '+', text: '正'},{value:'-', text: '负'}];
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      let radio = dom.element(`
        <div class="form-check form-check-inline">
          <input name="" value="" type="radio"
                 class="form-check-input radio color-primary is-outline">
          <label class="form-check-label" for=""></label>
        </div>
      `);
      // dom.find('input', radio).id = 'radio_' + val.value;
      dom.find('input', radio).name = field.name;
      if (field.value == val.value) {
        dom.find('input', radio).checked = true;
      } else if (val.checked && !field.value) {
        dom.find('input', radio).checked = true;
      }
      dom.find('input', radio).value = val.value;
      dom.find('input', radio).disabled = this.readonly || field.readonly || false;
      // dom.find('label', radio).setAttribute('for', 'radio_' + val.value);
      dom.find('label', radio).textContent = val.text;
      if (field.required === true) {
        dom.find('input', radio).setAttribute('required', true);
        dom.find('input', radio).setAttribute('data-required', field.title);
      }
      group.append(radio);
      radio.onchange = ev => {
        if (field.onInput) {
          field.onInput(field.values[i].value);
        }
        for (let f of self.fields) {
          self.hideOrShowField(f);
        }
      };
    }
  } else if (field.input == 'longtext') {
    input = dom.create('textarea', 'form-control');
    field.style = field.style || '';
    input.style = field.style;
    // if (this.readonly)
    //   input.style.backgroundColor = 'rgb(240, 243, 245)';
    if (field.style === '')
      input.rows = 4;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请输入');
    input.innerHTML = field.value || '';
    if (this.readonly === true || field.readonly === true) {
      input.setAttribute('disabled', true);
    }
  } else if (field.input == 'selecttext') {
    let div = dom.create('div', 'full-width', 'position-relative');
    div.style.height = '120px';
    div.style.overflow = 'hidden';
    input = dom.create('textarea', 'form-control', 'full-width');
    field.style = field.style || '';
    input.style = field.style;
    input.style.height = '120px';
    input.style.resize = 'none';

    let corner = dom.create('div');
    corner.style.position = 'absolute';
    corner.style.bottom = '0';
    corner.style.right = '0';
    corner.style.background = 'transparent';
    corner.style.borderWidth = '0px 0px 48px 48px';
    corner.style.borderStyle = 'solid';
    corner.style.borderColor = 'transparent transparent rgba(0, 0, 0, 0.3)';
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请输入');
    input.innerHTML = field.value || '';

    div.appendChild(input);
    div.appendChild(corner);

    let select = dom.create('a', 'btn-link', 'font-11', 'text-light');
    select.innerText = '选择';
    select.style.position = 'absolute';
    select.style.bottom = '-2px';
    select.style.right = '-2px';
    dom.bind(select, 'click', ev => {
      if (field.onSelect) {
        field.onSelect(input);
      }
    });
    if (this.readonly === true || field.readonly === true)
      input.setAttribute('disabled', true);
    else
      div.appendChild(select);

    group.appendChild(div);
    return {label: label, input: group};
  } else if (field.input == 'cascade') {
    group.style.overflow = 'hidden';
    input = dom.create('div', 'form-control');
    if (this.readonly)
      input.style.backgroundColor = 'rgb(240, 243, 245)';
    input.setAttribute('data-cascade-name', field.name);
  } else if (field.input == 'checktree') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-checktree-name', field.name);
    input.setAttribute('id', 'checktree_' + field.name);
  } else if (field.input == 'checklist') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-checklist-name', field.name);
  } else if (field.input == 'fileupload') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-fileupload-name', field.name);
  } else if (field.input == 'imageupload') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-imageupload-name', field.name);
  } else if (field.input == 'image') {
    input = dom.create('div', 'full-width', 'row', 'mx-0');
    input.setAttribute('data-medias-name', field.name);
  } else if (field.input == 'images') {
    input = dom.create('div', 'full-width', 'row', 'mx-0');
    input.setAttribute('data-medias-name', field.name);
  } else if (field.input == 'video') {
    input = dom.create('div', 'full-width', 'row', 'mx-0');
    input.setAttribute('data-medias-name', field.name);
  } else if (field.input == 'videos') {
    input = dom.create('div', 'full-width', 'row', 'mx-0');
    input.setAttribute('data-medias-name', field.name);
  } else if (field.input == 'avatar') {
    input = dom.create('div', 'full-width','avatar-img');
    input.setAttribute('data-avatar-name', field.name);
    // group.classList.remove('col-md-4', 'col-md-9');
    group.classList.add('gx-24-24');
    group.appendChild(input);
    return {label: null, input: group};
  } else if (field.input == 'logo') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-logo-name', field.name);
    // sgroup.classList.remove('col-md-4', 'col-md-9');
    group.classList.add('gx-24-24');
    group.appendChild(input);
    return {label: null, input: group};
  } else if (field.input == 'datetime') {
    let dateIcon = dom.element(`
      <div class="input-group-prepend">
        <span class="input-group-text">
          <i class="far fa-calendar-alt"></i>
        </span>
      </div>
    `);
    let dateInput = dom.create('input', 'form-control');
    dateInput.disabled = this.readonly || field.readonly || false;
    dateInput.setAttribute('name', field.name + '_date');
    dateInput.setAttribute('placeholder', '请选择...');
    dateInput.setAttribute('autocomplete', 'off');
    let timeIcon = dom.element(`
      <div class="input-group-prepend">
        <span class="input-group-text">
          <i class="far fa-clock"></i>
        </span>
      </div>
    `);
    let timeInput = dom.create('input', 'form-control');
    timeInput.disabled = this.readonly || field.readonly || false;
    timeInput.setAttribute('name', field.name + '_time');
    timeInput.setAttribute('autocomplete', 'off');
    group.appendChild(dateIcon);
    group.appendChild(dateInput);
    group.appendChild(timeIcon);
    group.appendChild(timeInput);
    return {label: label, input: group};
  } else if (field.input == 'tags') {
    input = dom.create('input', 'full-width');
    input.name = field.name;
    input.value = field.value;
    input.disabled = this.readonly || field.readonly || false;
  } else if (field.input == 'custom') {
    input = dom.create('input', 'form-control');
    input.name = field.name;
    input.disabled = true;
  } else {
    input = dom.create('input', 'form-control');
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请输入');
    input.setAttribute('autocomplete', 'off');
    if (field.value) {
      input.value = field.value;
    }
  }
  if (input != null) {
    group.appendChild(input);
  }

  // 有了父节点以后的后续处理
  if (field.domain) {
    input.setAttribute('data-domain-type', field.domain);
  }
  if (field.input == 'tags') {
    input.setAttribute('placeholder', '请输入');
    new Tagify(input);
  } else if (field.input == 'date') {
    input.setAttribute('data-domain-type', 'date');
    input.setAttribute('placeholder', '请选择...');
  } else if (field.input.indexOf('number') == 0) {
    input.setAttribute('data-domain-type', field.input);
    input.setAttribute('placeholder', '请输入');
  } else if (field.input == 'file') {
    input.setAttribute('readonly', true);
    let fileinput = dom.create('input');
    fileinput.setAttribute('type', 'file');
    fileinput.style.display = 'none';
    let upload = dom.element('<span class="input-group-text pointer"><i class="fas fa-upload text-primary"></i></span>');
    upload.addEventListener('click', function() {
      fileinput.click();
    });
    fileinput.addEventListener('change', function(event) {
      event.preventDefault();
      event.stopPropagation();
      input.value = fileinput.files[0].name;
      let idx = input.value.lastIndexOf('.');
      let ext = '';
      if (idx != -1) {
        ext = input.value.substring(input.value.lastIndexOf('.') + 1);
      }
      xhr.upload({
        url: '/api/v3/common/upload',
        params: field.params,
        file: fileinput.files[0],
        success: function(resp) {
          let item = resp.data;
          if (!item) return;
          input.setAttribute('data-file-type', fileinput.files[0].type);
          input.setAttribute('data-file-size', fileinput.files[0].size);
          input.setAttribute('data-file-path', item.filepath);
          input.setAttribute('data-file-ext', ext);
          input.setAttribute('data-file-name', item.filename);
          input.setAttribute('data-web-path', item.webpath);
        }
      });
      EditableForm.validate(input);
    });
    group.appendChild(fileinput);
    if (!this.readonly) {
      group.appendChild(upload);
    }
  }

  if (field.create) {
    let addnew = dom.element(`
      <span class="input-group-text">
        <i class="fas fa-plus-square pointer text-success"></i>
      </span>
    `);

    if (field.input == 'custom' || field.input == 'select') {
      let name = field.name;
      field.widgetCustom = dom.element(`
        <div widget-id="widgetCustom_${name}" class="full-width"></div>
      `);
      field.create(addnew, field.widgetCustom, field);
      if (field.readonly !== true && this.readonly !== true) {
        group.appendChild(addnew);
      }
    } else {
      group.appendChild(addnew);
    }
  }

  let unit = dom.element(`
    <span class="input-group-text"></span>
  `);
  if (field.unit) {
    dom.find('span', unit).innerHTML = field.unit;
    group.appendChild(unit);
  }

  /*!
  ** 字段提示
  */
  let tooltip = dom.element(`
    <span class="input-group-text width-36 icon-error"></span>
  `);
  if (field.required && input != null /* radio, check cause input is null*/) {
    input.setAttribute('data-required', field.title);
    tooltip.innerHTML = ICON_REQUIRED;
  } else {
    tooltip.innerHTML = ICON_GENERAL;
  }
  if (field.tooltip) {
    tooltip.classList.add('pointer');
    let popup = dom.element(
      '<div class="popup hidden">' +
      '  <div class="popup-arrow"></div>' +
      '  <div class="popup-body">' + field.tooltip + '</div>' +
      '</div>');
    tooltip.appendChild(popup);
    dom.bind(tooltip, 'click', function() {
      let ox = this.offsetLeft;
      let oy = this.offsetTop;
      let height = parseInt(this.clientHeight);
      let popup = dom.find('div.popup', this);

      popup.style.right = '0';
      popup.style.top = oy - (height / 2) + 'px';

      popup.classList.remove('hidden');
      popup.classList.add('show');

      setTimeout(function(event) {
        popup.classList.remove('show');
        popup.classList.add('hidden');
      }, 2000);
    });
  }

  if (!this.readonly &&
    field.input !== 'bool' &&
    field.input !== 'radio' &&
    field.input !== 'checklist' &&
    field.input !== 'longtext' &&
    field.input !== 'checktree' &&
    field.input !== 'fileupload' &&
    field.input !== 'imageupload' &&
    field.input !== 'image' &&
    field.input !== 'images' &&
    field.input !== 'video' &&
    field.input !== 'videos' &&
    field.input !== 'files' &&
    field.input !== 'tags')
    group.append(tooltip);

  // user input
  if (input != null) {
    dom.bind(input, 'input', function (event) {
      if (field.onInput) {
        field.onInput(event);
      }
      EditableForm.validate(this);
    });
  }

  // set value programmatically
  if (field.input == 'date' || field.input == 'text' || field.input.indexOf('number') == 0 || field.input == 'file') {
    const {get, set} = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    Object.defineProperty(input, 'value', {
      get() {
        return get.call(this);
      },
      set(newVal) {
        set.call(this, newVal);
        EditableForm.validate(this);
        return newVal;
      }
    });
    input.value = field.value;
  }
  if (field.input == 'select') {
    const {get, set} = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
    Object.defineProperty(input, 'selectedIndex', {
      get() {
        return get.call(this);
      },
      set(newVal) {
        set.call(this, newVal);
        EditableForm.validate(this);
        return newVal;
      }
    });
    input.value = field.value;
  }

  if (field.input.indexOf('number') == 0) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
      input.addEventListener(event, function (event) {
        let domainType = this.getAttribute('data-domain-type');
        let validation = Validation.getDomainValidator(new ValidationModel(domainType));
        // /^-?\d*$/.test(this.value)
        if (validation.test(this.value) != REQUIRED_ERROR) {
          this.oldValue = this.value;
          this.oldSelectionStart = this.selectionStart;
          this.oldSelectionEnd = this.selectionEnd;
        } else if (this.hasOwnProperty("oldValue")) {
          this.value = this.oldValue;
          this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
        } else {
          this.value = "";
        }
        EditableForm.validate(this);
      });
    });
  }

  if (field.widgetCustom) {
    group.appendChild(field.widgetCustom);
  }

  return {label: label, input: groupContainer};
};

/**
 * Creates button element.
 *
 * @param action
 *        action option
 *
 * @returns {button} the button dom element
 *
 * @private
 */
EditableForm.prototype.createButton = function(action) {
  let button = dom.create('button', 'btn', 'btn-sm');
  if (action.classes) {
    for (let i = 0; i < action.classes.length; i++) {
      button.classList.add(action.classes[i]);
    }
  }
  if (action.style) {
    button.style = action.style;
  }
  button.innerHTML = action.text;
  if (action.onClicked) {
    button.onclick = (ev) => {
      if (action.confirmText) {
        dialog.confirm(action.confirmText, () => {
          action.onClicked(dom.formdata(this.container));
        });
      } else {
        action.onClicked(dom.formdata(this.container));
      }
    };
  }
  return button;
};

EditableForm.prototype.error = function (message) {
  message = message || '出现系统错误！';
  message = message.replaceAll('\n', '<br>');
  this.toast.style.zIndex = 11000;
  this.toast.classList.remove('bg-success', 'hidden');
  this.toast.classList.add('bg-danger');
  let posInScreen = this.container.getBoundingClientRect();
  let offsetTop = posInScreen.top - this.originalPositionTop;

  this.toast.style.top = (-offsetTop + 10) + 'px';
  dom.find('.toast-body', this.toast).innerHTML = message;
  dom.find('strong', this.toast).innerText = '错误';
  this.toast.classList.add('show', 'in');
};

EditableForm.prototype.success = function (message, callback) {
  let self = this;
  this.toast.style.zIndex = 11000;
  this.toast.classList.remove('bg-danger', 'hidden');
  // this.toast.classList.add('bg-success');
  this.toast.style.backgroundColor = 'var(--color-success)'

  let posInScreen = this.container.getBoundingClientRect();
  let offsetTop = posInScreen.top - this.originalPositionTop;

  this.toast.style.top = (-offsetTop + 10) + 'px';
  dom.find('.toast-body', this.toast).innerHTML = message;
  dom.find('strong', this.toast).innerText = '成功';
  this.toast.classList.add('show', 'in');
  setTimeout(function() {
    dom.find('button', self.toast).click();
    if (callback) callback();
  }, 1000);
};

EditableForm.prototype.hideSidebar = function (message, callback) {
  let rightbar = dom.find('div[widget-id=right-bar]')
  // let rightbar = dom.ancestor(self.container, 'div', 'right-bar');
  if (rightbar != null) {
    rightbar.children[0].classList.add('out');
    setTimeout(function () {
      rightbar.remove();
    }, 300);
  }
};

/**
 * Validates an input in a form.
 *
 * @param input
 *        the dom element for user input
 */
EditableForm.validate = function(input) {
  if (input.tagName == 'OPTION')
    input = input.parentElement;
  if (input == null) return;

  let span = dom.find('div span.icon-error', input.parentElement);
  if (span == null) return; // readonly
  let dataRequired = input.getAttribute('data-required');
  let required =  dataRequired != null && dataRequired !== '';
  if (input.tagName == 'SELECT') {
    if (input.selectedIndex == -1) {
      if (required)
        span.innerHTML = ICON_REQUIRED;
      else
        span.innerHTML = ICON_GENERAL;
    } else {
      span.innerHTML = ICON_CORRECT;
    }
    return;
  } else if (input.tagName == 'DIV') {
    // cascade
    let links = input.querySelectorAll('a[data-cascade-name]');
    let values = [];
    for (let i = 0; i < links.length; i++) {
      let link = links[i];
      let value = link.getAttribute('data-cascade-value');
      if (value != null && value != '-1' && value != '') {
        values.push(value);
      }
    }
    if (values.length == links.length) {
      span.innerHTML = ICON_CORRECT;
    } else if (values.length == 0) {
      if (required)
        span.innerHTML = ICON_REQUIRED;
      else
        span.innerHTML = ICON_GENERAL;
    } else {
      span.innerHTML = ICON_ERROR;
    }
    return;
  }

  if (input.value.trim() == '') {
    if (required)
      span.innerHTML = ICON_REQUIRED;
    else
      span.innerHTML = ICON_GENERAL;
    return;
  }

  let domainType = input.getAttribute('data-domain-type');
  if (domainType != null && domainType != '') {
    let validation = Validation.getDomainValidator(new ValidationModel(domainType));
    let res = validation.test(input.value);
    if (res == NO_ERRORS) {
      span.innerHTML = ICON_CORRECT;
    } else if (res == FORMAT_ERROR) {
      span.innerHTML = ICON_ERROR;
    }
  } else {
    span.innerHTML = ICON_CORRECT;
  }
};

EditableForm.prototype.setInputValue = function (name, value) {
  let foundField = null;
  for (let field of this.fields) {
    if (field.name === name) {
      foundField = field;
      break;
    }
  }
  if (foundField == null) return;
  if (foundField.input === 'bool') {
    let elInput = dom.find(`input[name="${name}"]`, this.container);
    if (value === 'T' && !elInput.checked) {
      elInput.click();
      return;
    }
    if (value === 'F' && elInput.checked) {
      elInput.click();
      return;
    }
  }
};

EditableForm.prototype.getInputValue = function (name) {
  let foundField = null;
  for (let field of this.fields) {
    if (field.name === name) {
      foundField = field;
      break;
    }
  }
  if (foundField == null) return null;
  if (foundField.input === 'bool') {
    let elInput = dom.find(`input[name="${name}"]`, this.container);
    return elInput.checked ? 'T' : 'F';
  }
  return null;
};

EditableForm.prototype.input = function(nameAndValue) {
  let name = nameAndValue.name;
  let value = nameAndValue.value;
  let text = nameAndValue.text;
  let control = this.controls[name];
  if (!control) return;
  let newOption = new Option(text, value, false, true);
  control.append(newOption).trigger('change');
};

EditableForm.prototype.formatGridCount = function(count) {
  if (count < 10) {
    return '0' + count;
  }
  return '' + count;
};

EditableForm.prototype.setVariables = function(vars){
  for (let key in vars) {
    if (this.variableListeners[key]) {
      this.variableListeners[key](vars[key]);
    }
  }
};

EditableForm.prototype.getField = function(name) {
  for (let field of this.fields) {
    if (field.name === name)
      return field;
  }
  return {};
};

/**
 * 通过字段值判断其他字段显示与否。
 *
 * 添加：2023-04-19
 */
EditableForm.prototype.hideOrShowField = function(field) {
  let data = dom.formdata(this.container);
  if (typeof field.visible === 'function') {
    if (field.visible(data) === true) {
      if (field.required === true) {
        let el = this.container.querySelector('[name="' + field.name + '"]');
        el.setAttribute('data-required', field.title);
      }
      field.container.style.display = '';
    } else {
      if (field.required === true) {
        let el = this.container.querySelector('[name="' + field.name + '"]');
        el.setAttribute('data-required', '');
      }
      field.container.style.setProperty('display', 'none', 'important');
    }
  }
};

EditableForm.prototype.hideFields = function (names) {
  let hide = (name) => {
    let input = dom.find('[name="' + name + '"]', this.container);
    input.style.display = 'none';
    input.parentElement.parentElement.style.setProperty('display', 'none', 'important');
  };
  if (Array.isArray(names)) {
    for (let name of names) {
      hide(name);
    }
  } else {
    hide(names);
  }
};

EditableForm.prototype.showFields = function (names) {
  let show = (name) => {
    let input = dom.find('[name="' + name + '"]', this.container);
    input.style.display = '';
    input.parentElement.parentElement.style.display = '';
  };
  if (Array.isArray(names)) {
    for (let name of names) {
      show(name);
    }
  } else {
    show(names);
  }
};

/**
 * 新的输入值和旧的值比较形成结果。
 */
EditableForm.prototype.compare = function (data) {
  let oldValues = data || this.oldValues || {};
  let newValues = dom.formdata(this.containerId);
  // if (this.saveOpt.convert) {
  //   newValues = this.saveOpt.convert(newValues);
  // }
  let ret = [];
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    let oldValue = oldValues[field.name];
    let oldText = oldValues[field.name];
    let newValue = newValues[field.name];
    let newText = newValues[field.name];
    if (field.input == 'date') {
      oldText = moment(oldValue).format('YYYY-MM-DD');
    } else if (field.input == 'select') {
      if (field.options.values) {
        for (let val of field.options.values) {
          if (val.value === oldValue) {
            oldText = val.text;
          }
          if (val.value === newValue) {
            newText = val.text;
          }
        }
      }
    }
    newValue = newValue ? newValue.toString() : '';
    oldValue = oldValue ? oldValue.toString() : '';
    newText = newText ? newText.toString() : '';
    oldText = oldText ? oldText.toString() : '';
    if (newValue !== oldValue) {
      ret.push({
        name: field.name,
        oldValue: oldValue,
        oldText: oldText,
        newValue: newValue,
        newText: newText,
      });
    }
  }
  return ret;
};

EditableForm.prototype.getData = function () {
  let ret = dom.formdata(this.container);
  for (let key in ret) {
    this.assignValue2Name(ret, key, ret[key]);
  }
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    if (field.input === 'images') {
      let values = [];
      let container = dom.find('div[data-medias-name="' + field.name + '"]', this.container);
      let imgs = container.querySelectorAll('img');
      imgs.forEach(img => {
        let pel = img.parentElement;
        let model = dom.model(pel);
        values.push({
          ...model,
        });
      });
      this.assignValue2Name(ret, field.name, values);
    } else if (field.input === 'image') {
      let container = dom.find('div[data-medias-name="' + field.name + '"]', this.container);
      let img = container.querySelector('img');
      if (img == null) continue;
      let model = dom.model(img.parentElement);
      this.assignValue2Name(ret, field.name, model);
    } else if (field.input === 'video') {
      let container = dom.find('div[data-medias-name="' + field.name + '"]', this.container);
      let img = container.querySelector('img');
      if (img == null) continue;
      let model = dom.model(img.parentElement);
      this.assignValue2Name(ret, field.name, model);
    } else if (field.input === 'videos') {

    } else if (field.input === 'tags') {
      let container = dom.find('input[name="' + field.name + '"]', this.container).parentElement;
      let tags = container.querySelectorAll('tag');
      let value = '';
      for (let i = 0; i < tags.length; i++) {
        if (value != '') {
          value += ','
        }
        value += tags[i].innerText;
      }
      ret[field.name] = value;
    }
  }
  return ret;
};

EditableForm.prototype.setData = function (data) {

};

/**
 * @private
 */
EditableForm.prototype.assignValue2Name = function (owner, name, value) {
  let dotIndex = name.indexOf('.');
  if (dotIndex == -1) {
    owner[name] = value;
    return;
  }
  let hierarchy = name.substring(0, dotIndex);
  if (!owner[hierarchy]) {
    owner[hierarchy] = {};
  }
  this.assignValue2Name(owner[hierarchy], name.substring(dotIndex + 1), value);
  delete owner[name];
};


/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/
const FILE_TYPE_EXCEL = '<i class="far fa-file-excel"></i>';
const FILE_TYPE_WORD = '<i class="far fa-file-word"></i>';
const FILE_TYPE_POWERPOINT = '<i class="far fa-file-powerpoint"></i>';
const FILE_TYPE_PDF = '<i class="far fa-file-pdf"></i>';
const FILE_TYPE_VIDEO = '<i class="far fa-file-video"></i>';
const FILE_TYPE_AUDIO = '<i class="far fa-file-audio"></i>';
const FILE_TYPE_IMAGE = '<i class="far fa-file-image"></i>';
const FILE_TYPE_ARCHIVE = '<i class="far fa-file-archive"></i>';
const FILE_TYPE_FILE = '<i class="far fa-file-alt"></i>';

function FileUpload(opts) {
  // upload url
  this.name = opts.name;
  this.fetchUrl = opts.url.fetch;
  this.usecase = opts.usecase;
  this.uploadUrl = opts.url.upload || '/api/v3/common/upload';
  this.local = opts.local;
  this.params = opts.params;
  this.onRemove = opts.onRemove || function (model) {};
}

FileUpload.prototype.fetch = async function (containerId) {
  if (!this.fetchUrl) {
    this.local = [];
    this.render(containerId);
    return;
  }
  let self = this;
  self.local = await xhr.promise({
    url: this.fetchUrl,
    params: self.params,
  });
  self.render(containerId);
};

FileUpload.prototype.append = function (item) {
  if (!item) return;
  let url = '';
  if (item.filepath) {
    item.filepath = item.filepath.replace('/www/', '');
  }
  url = item.filepath;
  let ul = dom.find('ul', this.container);
  let li = dom.create('li', 'list-group-item', 'list-group-item-input');
  li.style.lineHeight = '32px';

  let div = dom.templatize(`
    <div class="full-width d-flex">
      <a class="btn-link">
        <i class="far fa-file-alt mr-2"></i>
      </a>
      <span class="text-info" style="padding-bottom: 8px;">{{filename}}</span>
      <a class="btn-link ml-auto pointer">
        <i class="fas fa-trash-alt text-danger"></i>
      </a>
    </div>
  `, item);
  let link = div.children[1];
  let remove = div.children[2];
  // let link = dom.create('span', 'text-info');
  // link.style.paddingBottom = '8px';
  // link.innerText = item.filename;
  // let icon = null;
  // if (item.extension === 'xls' || item.extension === 'xlsx') {
  //   icon = dom.element(FILE_TYPE_EXCEL);
  // } else if (item.extension === 'doc' || item.extension === 'docx') {
  //   icon = dom.element(FILE_TYPE_WORD);
  // } else if (item.extension === 'ppt' || item.extension === 'pptx') {
  //   icon = dom.element(FILE_TYPE_POWERPOINT);
  // } else if (item.extension === 'pdf') {
  //   icon = dom.element(FILE_TYPE_PDF);
  // } else if (item.extension === 'png' || item.extension === 'jpg') {
  //   icon = dom.element(FILE_TYPE_IMAGE);
  // } else {
  //   icon = dom.element(FILE_TYPE_FILE);
  // }
  // icon.classList.add('mr-2');

  // li.appendChild(icon);
  // li.appendChild(link);
  li.appendChild(div);
  link.setAttribute('data-img-url', item.filepath);
  link.setAttribute('data-file-path', item.filepath);
  link.setAttribute('data-file-name', item.filename);
  link.setAttribute('data-file-type', item.type);
  link.setAttribute('data-file-size', item.size);
  link.setAttribute('data-file-ext', item.extension);
  if (item.storedFileId) {
    link.setAttribute('data-file-id', item.storedFileId);
  }

  li.setAttribute('data-file-path', item.filepath);
  li.setAttribute('data-file-name', item.filename);
  li.setAttribute('data-file-type', item.type);
  li.setAttribute('data-file-size', item.size);
  li.setAttribute('data-file-ext', item.extension);
  if (item.storedFileId) {
    li.setAttribute('data-file-id', item.storedFileId);
  }
  ul.appendChild(li);

  dom.bind(remove, 'click', ev => {
    let li = dom.ancestor(ev.target, 'li');
    let fileId = li.getAttribute('data-file-id');
    dialog.confirm('确定删除此附件？', () => {
      li.remove();
      if (this.onRemove) {
        this.onRemove(fileId);
      }
    });
  });
};

FileUpload.prototype.render = async function(containerId) {
  let self = this;
  if (typeof this.local === 'undefined') {
    await this.fetch(containerId);
    return;
  }
  if (typeof containerId === 'string')
    this.container = document.querySelector(containerId);
  else
    this.container = containerId;
  this.container.innerHTML = '';

  let div = dom.create('div', 'input-group', 'full-width');

  let input = dom.create('input', 'form-control');
  input.setAttribute('name', this.name);
  input.setAttribute('readonly', true);
  
  let fileinput = dom.create('input');
  fileinput.setAttribute('type', 'file');
  fileinput.style.display = 'none';
  let upload = dom.element(`
    <div class="input-group-append">
      <span class="input-group-text pointer">
        <i class="fas fa-upload text-primary"></i>
      </span>
    </div>`
  );
  upload.addEventListener('click', function() {
    fileinput.click();
  });
  fileinput.addEventListener('change', function(event) {
    event.preventDefault();
    event.stopPropagation();
    input.value = fileinput.files[0].name;
    xhr.upload({
      url: self.uploadUrl,
      params: self.params,
      file: this.files[0],
      success: resp => {
        let item = resp.data;
        item.filename = this.files[0].name;
        let idx = item.filename.lastIndexOf('.');
        let ext = '';
        if (idx != -1) {
          ext = input.value.substring(input.value.lastIndexOf('.') + 1);
        }
        item.filename = item.filename.replaceAll('/www', '');
        item.type = this.files[0].type;
        item.size = this.files[0].size;
        item.extension = ext;
        self.append(item);
      }
    });
  });
  div.appendChild(fileinput);
  div.appendChild(input);
  div.appendChild(upload);
  this.container.append(div);

  let ul = dom.create('ul', 'list-group', 'full-width', 'overflow-hidden');
  this.container.appendChild(ul);
  for (let i = 0; i < this.local.length; i++) {
    let item = this.local[i];
    this.append(item);
  }
};
/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/
function ImageUpload(opts) {
  // upload url
  this.fetchUrl = opts.url.fetch;
  this.usecase = opts.usecase;
  this.uploadUrl = opts.url.upload;
  this.local = opts.local;
  this.params = opts.params;
  // 第三方拍照预留接口
  this.capture = opts.capture;
}

ImageUpload.prototype.fetch = function (containerId) {
  let self = this;
  xhr.post({
    url: this.fetchUrl,
    data: this.params || {},
    success: function (resp) {
      if (resp.error) {
        self.local = [];
      } else {
        self.local = resp.data;
      }
      self.render(containerId);
    },
    error: function () {
      self.local = [];
      self.render(containerId);
    }
  });
};

ImageUpload.prototype.append = function (item) {
  let ul = dom.find('ul', this.container);
  let li = dom.create('li', 'list-group-item', 'p-0');
  li.style.height = '100px';
  li.style.width = 'calc(98%/ 3)';
  li.style.flexGrow = '0';
  let link = dom.create('a', 'btn', 'btn-link', 'text-info', 'p-0');

  li.appendChild(link);
  ul.appendChild(li);

  let rect = li.getBoundingClientRect();

  let img = null;
  if (item.filepath) {
    let url = item.filepath.replace('/www/', '');
    link.setAttribute('data-img-url', url);
    img = dom.element('<img widget-id="widget-' + url + '" src="' + url + '">');
  } else {
    img = dom.element('<img src="' + item.imgdata + '">');
  }
  img.setAttribute('width', rect.width + 'px');
  img.setAttribute('height', rect.height + 'px');
  link.appendChild(img);

  dom.bind(link, 'click', function() {
    let url = link.getAttribute('data-img-url');
    let viewerContainer = dom.find('.viewer-container');
    if (viewerContainer != null) {
      viewerContainer.remove();
    }

    let img = dom.find('img[widget-id="widget-' + url + '"]');
    let viewer = new Viewer(img);
    viewer.show();
  });
};

ImageUpload.prototype.render = function(containerId) {
  let self = this;
  if (typeof this.local === 'undefined') {
    this.fetch(containerId);
    return;
  }
  if (typeof containerId === 'string')
    this.container = document.querySelector(containerId);
  else
    this.container = containerId;
  this.container.innerHTML = '';

  let div = dom.create('div', 'input-group', 'full-width');

  let input = dom.create('input', 'form-control');
  input.setAttribute('name', this.name);
  input.setAttribute('readonly', true);

  let fileinput = dom.create('input');
  fileinput.setAttribute('type', 'file');
  fileinput.style.display = 'none';
  let upload = dom.element(`
    <div class="input-group-append">
      <span class="input-group-text pointer">
        <i class="fas fa-upload text-primary"></i>
      </span>
      <span class="input-group-text pointer">
        <i class="fas fa-camera text-primary"></i>
      </span>
    </div>`
  );
  // 有拍照功能
  if (!this.capture) {
    upload.children[1].remove();
  } else {
    upload.children[1].addEventListener('click', function() {
      self.capture(function(path, imgdata) {
        let params = {};
        utils.clone(self.params, params);
        params.filedata = imgdata;
        params.fileext = path.substring(path.lastIndexOf('.') + 1);
        xhr.post({
          url: '/api/v3/common/image',
          params: params,
          success: function(resp) {
            let item = resp.data;
            item.filename = item.filepath.substring(item.filepath.lastIndexOf('/') + 1);
            self.append(item);
          }
        })
      });
    });
  }
  upload.children[0].addEventListener('click', function() {
    fileinput.click();
  });
  fileinput.addEventListener('change', function(event) {
    event.preventDefault();
    event.stopPropagation();
    input.value = fileinput.files[0].name;
    xhr.upload({
      url: self.uploadUrl,
      params: self.params,
      file: this.files[0],
      success: function(resp) {
        let item = resp.data;
        item.filename = item.filepath.substring(item.filepath.lastIndexOf('/') + 1);
        self.append(item);
      }
    });
  });
  div.appendChild(fileinput);
  div.appendChild(input);
  div.appendChild(upload);
  this.container.append(div);

  let ul = dom.create('ul', 'list-group', 'full-width', 'overflow-hidden');
  ul.style.display = 'flex';
  ul.style.flexWrap = 'wrap';
  ul.style.flexDirection = 'row';
  this.container.appendChild(ul);
  for (let i = 0; i < this.local.length; i++) {
    let item = this.local[i];
    this.append(item);
  }
};
/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/
function Medias(opts) {
  this.params = opts.params || {};
  // 只读
  this.readonly = opts.readonly === true;
  this.width = opts.width || '80';
  this.height = this.width;
  // 多个还是单个
  this.multiple = opts.multiple !== false;
  // 上传的链接路径
  this.url = opts.url || '/api/v3/common/upload';
  // 读取已上传的图片的配置项
  this.fetch = opts.fetch;
  // 单个删除已上传的图片的配置项
  this.onRemove = opts.onRemove;
  // 媒体类型
  this.mediaType = opts.mediaType || 'image';
}

Medias.prototype.render = function (containerId, value) {
  this.value = value;
  this.container = dom.find(containerId);
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      let row = value[i];
      // row is object
      this.appendMedia(row);
    }
  } else if (value) {
    this.appendMedia(value);
    if (this.multiple === false)
      return;
  }
  if (this.readonly === false) {
    let plus = this.createPlusElement();
    this.container.appendChild(plus);
  }
};

Medias.prototype.createPlusElement = function () {
  if (this.mediaType == 'image') {
    this.plus = dom.templatize(`
      <div class="d-flex align-items-center justify-content-center pointer" 
                  style="height: {{width}}px; width: {{width}}px; border: 1px solid #eee;">
        <i class="fas fa-plus" style="color: #bbb;"></i>
        <input type="file" accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
               style="display: none">
      </div>
    `, this);
  } else {
    this.plus = dom.templatize(`
      <div class="d-flex align-items-center justify-content-center pointer" 
                  style="height: {{width}}px; width: {{width}}px; border: 1px solid #eee;">
        <i class="fas fa-plus" style="color: #bbb;"></i>
        <input type="file" accept="video/mp4,video/x-m4v,video/*" style="display: none">
      </div>
    `, this);
  }
  let input = dom.find('input', this.plus);
  input.onchange = ev => {
    if (!input.files || input.files.length == 0) return;
    if (!this.url) {
      this.readImageAsLocal(input.files[0]);
    } else {
      this.readImageAsRemote(input.files[0]);
    }
  };
  dom.bind(this.plus, 'click', ev => {
    input.click();
  });
  return this.plus;
};

Medias.prototype.readImageAsLocal = function (file) {
  let img = file;
  let reader = new FileReader();
  reader.onload = () => {
    if (this.mediaType === 'image') {
      this.appendImage({
        url: reader.result,
      })
    } else {
      this.appendVideoImage(file, 2);
    }
  };
  reader.readAsDataURL(img);
};

Medias.prototype.readImageAsRemote = function (file) {
  xhr.upload({
    url: this.url,
    params: {
      ...this.params,
      file: file,
    },
    success: res => {
      if (res.data) {
        res = res.data;
      }
      if (this.mediaType === 'image') {
        this.appendImage({
          imagePath: res.webpath,
        });
      } else {
        this.appendVideoImage({
          videoPath: res.webpath,
        }, 2);
      }
    },
  })
};

Medias.prototype.appendMedia = function (media) {
  if (this.mediaType === 'image') {
    if (typeof media === 'string') {
      media = {
        imagePath: media,
      }
    }
    this.appendImage(media);
  } else {
    if (typeof media === 'string') {
      media = {
        videoPath: media,
      }
    }
    this.appendVideoImage(media, 2);
  }
};

Medias.prototype.appendImage = function (img) {
  let el = dom.templatize(`
    <div class="d-flex align-items-center justify-content-center pointer position-relative" 
         style="height: {{width}}px; width: {{width}}px; border: 1px solid #eee;">
      <img src="{{imagePath}}" style="width: 100%; height: 100%;">
      <a widget-media-id="{{id}}" class="btn-link position-absolute" style="bottom: 0; right: 4px;">
        <i class="fas fa-trash-alt text-danger"></i>
      </a>
    </div>
  `, {...img, width: this.width});
  dom.model(el, img);

  let image = dom.find('img', el);
  dom.bind(image, 'click', ev => {
    ev.stopPropagation();
    ev.preventDefault();
    if (this.mediaType == 'image') {
      let viewer = new Viewer(image, {
        toolbar: false,
        navbar: false,
        tooltip: false,
        title: false,
      });
      viewer.show();
    } else if (this.mediaType == 'video') {
      this.play(img.videoPath);
    }
  });
  let buttonDelete = dom.find('a', el);
  if (this.readonly === false) {
    this.container.insertBefore(el, this.plus);
    dom.bind(buttonDelete, 'click', ev => {
      let model = dom.model(buttonDelete.parentElement);
      ev.preventDefault();
      ev.stopPropagation();
      buttonDelete.parentElement.remove();
      if (this.multiple === false) {
        let plus = this.createPlusElement();
        this.container.appendChild(plus);
      }
      if (this.onRemove) {
        this.onRemove(model);
      }
    });
  } else {
    buttonDelete.remove();
    this.container.appendChild(el);
  }
  if (this.multiple === false && this.plus) {
    this.plus.remove();
  }
};

Medias.prototype.appendVideoImage = function (file, secs) {
  let canvas = document.createElement('canvas');
  canvas.style.width = this.width + 'px';
  canvas.style.height = this.width + 'px';
  canvas.width = this.width * window.devicePixelRatio;
  canvas.height = this.width * window.devicePixelRatio;
  canvas.getContext("2d").scale(window.devicePixelRatio, window.devicePixelRatio);
  let me = this, video = document.createElement('video');
  video.onloadedmetadata = () => {
    if ('function' === typeof secs) {
      secs = secs(video.duration);
    }
    video.currentTime = Math.min(Math.max(0, (secs < 0 ? video.duration : 0) + secs), video.duration);
  };
  video.onseeked = ev => {
    let height = video.videoHeight;
    let width = video.videoWidth;
    let ratio = height / width;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (ratio < 1) {
      ctx.drawImage(video, 0, (this.height - this.width * ratio) / 2, this.width, this.width * ratio);
    } else {
      ratio = width / height;
      ctx.drawImage(video, (this.height - this.width * ratio) / 2, 0, this.width * ratio, this.height);
    }
    this.appendImage({
      imagePath: canvas.toDataURL('image/png'),
      videoPath: file.videoPath,
    });
    canvas.remove();
    video.remove();
  };
  video.onerror = function(e) {

  };
  // let url = URL.createObjectURL(file);
  // video.src = url;
  video.src = file.videoPath;
};

Medias.prototype.play = function (path) {
  ajax.shade({
    url: 'html/misc/video/player.html?path=' + path,
    containerId: document.body,
    success: () => {
      pagePlayer.show({
        path: path,
      });
    }
  });
};
/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/

/**
 *
 * @param opt
 *
 * @constructor
 */
function PaginationGrid(opt) {
  let self = this;
  // 数据来源链接
  if (typeof opt.url === 'object') {
    this.url = opt.url.root;
    this.urlChild = opt.url.child;
  } else {
    this.url = opt.url;
  }
  if (typeof opt.usecase === 'object') {
    this.usecase = opt.usecase.root;
    this.usecaseChild = opt.usecase.child;
  } else {
    this.usecase = opt.usecase;
  }

  // 渲染行数据为Box的函数
  this.onRender = opt.onRender;

  // 固定或者初始化查询参数
  this.filters = opt.params || opt.filters || {};

  // 显示喜好过滤按钮
  this.favourite = opt.favourite || false;

  this.start = opt.start || 0;

  // the default is no pagination
  this.limit = opt.limit || 5;
  this.colspan = opt.colspan || 8;
  this.borderless = opt.borderless || false;

  if (opt.filter) {
    opt.filter.query = {callback: function(params) {
        self.go(1, params);
      }
    };
    // this.widgetFilter = new QueryLayout(opt.filter);
    opt.filter.table = this;
    this.queryFilter = new QueryFilter(opt.filter);
  }
  
  /*
  ** 改版后的功能按钮（传统模式，FIXME: 暂时兼容）
  **
  ** 重新升级 20240714
  */
  if (opt.query) {
    this.widgetQuery = new QueryLayout(opt.query);
  }
}

/**
 * Gets table element as root.
 *
 * @returns {HTMLTableElement}
 */
PaginationGrid.prototype.root = function () {
  let ret = dom.element(`
    <div class="card">
      <div class="card-body">
        <div class="row" style="margin-left: -5px; margin-right: -5px;"></div>
      </div>
    </div>
  `);
  this.rootBody = ret.children[0].children[0];
  if (this.borderless == true) {
    ret.classList.add('b-a-0', 'mb-0');
    ret.children[0].classList.add('p-0');
  }

  return ret;
};

/**
 * Requests and fetches remote data.
 *
 * @param params
 *        the http parameters
 */
PaginationGrid.prototype.request = function (params) {
  let self = this;
  params = params || {};
  if (this.favourite) {
    let icon = dom.find('a[widget-id=toggleFavourite] i', this.container);
    if (icon.classList.contains('fas')) {
      params._favourite = 'true';
    } else {
      params._favourite = 'false';
    }
  }
  if (this.widgetFilter) {
    let queryParams = this.widgetFilter.getQuery();
    for (let k in queryParams) {
      params[k] = queryParams[k];
    }
  }
  if (this.queryFilter) {
    let queryParams = this.queryFilter.getValues();
    for (let k in queryParams) {
      params[k] = queryParams[k];
    }
  }
  // static parameters
  for (let k in this.filters) {
    params[k] = this.filters[k];
  }

  params['start'] = this.start;
  params['limit'] = this.limit;

  if (typeof this.url !== "undefined") {
    xhr.post({
      url: this.url,
      usecase: this.usecase,
      data: params,
    }).then(resp => {
      self.total = resp.total;
  
      let rows = resp.data;
      if (!rows) return;
      self.rootBody.innerHTML = '';
  
      self.showPageNumber();
      if (rows.length == 0) {
        let tbody = self.rootBody;
        tbody.innerHTML = ('' +
          '<div class="text-center pt-4 full-width">' +
          '  <img width="48" height="48" src="/img/widget/nodata.png" class="mb-2" style="opacity: 25%;">' +
          '  <p style="opacity: 40%; color: black;">没有匹配的数据</p>' +
          '</div>');
        return;
      }
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        self.addRow(row, i);
      }
      self.addMore();
    });
  }
};

/**
 * Adds a row into table.
 *
 * @param trParent
 *        the parent <b>tr</b> dom element
 *
 * @param row
 *        the row object in data array from server side
 *
 * @param show
 *        show or hide
 *
 * @param level
 *        the tree node level
 *
 * @private
 */
PaginationGrid.prototype.addRow = function (row, index) {
  let loading = '' +
      '<div class="sk-circle">\n' +
      '  <div class="sk-circle1 sk-child"></div>\n' +
      '  <div class="sk-circle2 sk-child"></div>\n' +
      '  <div class="sk-circle3 sk-child"></div>\n' +
      '  <div class="sk-circle4 sk-child"></div>\n' +
      '  <div class="sk-circle5 sk-child"></div>\n' +
      '  <div class="sk-circle6 sk-child"></div>\n' +
      '  <div class="sk-circle7 sk-child"></div>\n' +
      '  <div class="sk-circle8 sk-child"></div>\n' +
      '  <div class="sk-circle9 sk-child"></div>\n' +
      '  <div class="sk-circle10 sk-child"></div>\n' +
      '  <div class="sk-circle11 sk-child"></div>\n' +
      '  <div class="sk-circle12 sk-child"></div>\n' +
      '</div>';
  let div = dom.create('div', 'gx-24-' + ((this.colspan > 10) ? this.colspan : ('0' + this.colspan)));
  this.rootBody.appendChild(div);
  this.onRender(div, row, index);
};

PaginationGrid.prototype.replaceRow = function (row, index) {
  if (this.rootBody.children[index]) {
    let curr = this.rootBody.children[index];
    curr.innerHTML = '';
    this.onRender(curr, row, index);
  }
};

PaginationGrid.prototype.addMore = function () {
  let pagenum = this.start / this.limit + 1;
  if (pagenum == this.lastPageNumber()) return;
  let last = this.rootBody.children[this.rootBody.children.length - 1];
  if (!last) return;
  let card = dom.element(`
    <div class="gx-d-flex gx-w-full" style="align-items:center;justify-content:center;">
      <a class="btn text-secondary gx-fs-56">
        <i class="fas fa-ellipsis-h"></i>
      </a>
    </div>
  `);
  dom.bind(dom.find('a', card), 'click', event => {
    this.next();
  });
  let height = last.getBoundingClientRect().height;
  card.classList.add(last.classList);
  card.style.height = (height - 15/*padding bottom*/) + 'px';
  this.rootBody.appendChild(card);
};

/**
 * 在指定页面元素下渲染树表。
 *
 * @param containerId
 *        页面元素标识
 *
 * @param params
 *        数据链接请求参数
 */
PaginationGrid.prototype.render = function (containerId, params) {
  if (typeof containerId === 'string') {
    this.container = document.querySelector(containerId);
  } else {
    this.container = containerId;
  }
  this.container.innerHTML = '';

  let table = this.root();
   this.container.appendChild(this.actionbar());
  this.container.appendChild(table);
  this.container.appendChild(this.pagination());
  let top = dom.top(this.container);
  table.style.height = 'calc(100% - 20px - ' + top + 'px)';

  params = params || {};
  this.request(params);
};

PaginationGrid.prototype.actionbar = function() {
  let self = this;
  let top = dom.element('<div class="full-width d-flex overflow-hidden" style="height: 26px;"></div>');
  let actions = top; // dom.create('div', 'card-header-actions', 'pt-0', 'pr-2');
  
  if (this.widgetQuery) {
    let containerQuery = dom.create('div', 'widget-query');
    this.widgetQuery.render(containerQuery);
    this.container.appendChild(containerQuery);
  }

  return top;
};

/**
 * Displays pagination bar on the bottom of table.
 */
PaginationGrid.prototype.pagination = function () {
  let self = this;
  let div = dom.element('<div class="table-pagination d-flex"></div>');
  let ul = dom.element('<ul class="pagination ms-auto mb-0 mt-2"></ul>');
  // ul.addClass('pagination mb-0');
  this.firstPage = dom.element('<li class="page-item"></li>');
  let a = dom.element('<a class="page-link b-a-0 font-14"></a>');
  a.setAttribute('href', 'javascript:void(0)');
  a.innerHTML = '首页';
  dom.bind(a, 'click', function () {
    self.go(1);
  });
  this.firstPage.appendChild(a);
  ul.appendChild(this.firstPage);

  this.prevPage = dom.element('<li class="page-item"></li>');
  a = dom.element('<a class="page-link b-a-0 font-14"></a>');
  a.setAttribute('href', 'javascript:void(0)');
  a.innerHTML = '上一页';

  dom.bind(a, 'click', function () {
    self.prev();
  });
  this.prevPage.appendChild(a);
  ul.appendChild(this.prevPage);

  li = dom.element('<li class="page-item disabled"></li>');
  this.pagebar = dom.element('<a class="page-link b-a-0 font-14"></a>');
  this.pagebar.setAttribute('href', 'javascript:void(0)');
  this.pagebar.setAttribute('style', 'cursor: default');
  this.pagebar.innerText = '0/0';
  li.appendChild(this.pagebar);
  ul.appendChild(li);

  this.nextPage = dom.element('<li class="page-item"></li>');
  a = dom.element('<a class="page-link b-a-0 font-14"></a>');
  a.setAttribute('href', 'javascript:void(0)');
  a.innerHTML = '下一页';
//  a.innerHTML = '<i class="material-icons">chevron_right</i>';
  dom.bind(a, 'click', function () {
    self.next();
  });
  this.nextPage.appendChild(a);
  ul.appendChild(this.nextPage);

  this.lastPage = dom.element('<li class="page-item"></li>');
  a = dom.element('<a class="page-link b-a-0font-14"></a>');
  a.setAttribute('href', 'javascript:void(0)');
  a.innerHTML = '末页';
//  a.innerHTML = '<i class="material-icons">last_page</i>';
  dom.bind(a, 'click', function () {
    self.go(self.lastPageNumber());
  });
  this.lastPage.appendChild(a);
  ul.appendChild(this.lastPage);

  li = dom.element('<li class="page-item disabled"></li>');
  a = dom.element('<a class="page-link b-a-0 pt-0"></a>');
  a.setAttribute('style', 'cursor: default');
  if (this.limit < 0) {
    ul.innerHTML = '';
  }else{
    ul.style.height = '34.75px';
  }
  div.appendChild(ul);
  return div;
};

/**
 * Gets last page number of result.
 *
 * @returns {number} the last page number
 */
PaginationGrid.prototype.lastPageNumber = function () {
  if (this.total == 0 || this.limit == -1) {
    return 1;
  }
  let remain = this.total % this.limit;
  if (remain == 0) {
    return parseInt(this.total / this.limit);
  } else {
    return parseInt(this.total / this.limit + 1);
  }
};

/**
 * Turns to the previous page.
 */
PaginationGrid.prototype.prev = function () {
  if (this.start <= 0)
    return;
  this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
PaginationGrid.prototype.next = function () {
  if (this.start + this.limit >= this.total)
    return;
  this.go((this.start + this.limit) / this.limit + 1);
};

/**
 * Goes to the specific number.
 *
 * @param {number} page
 *        the page number
 */
PaginationGrid.prototype.go = function (page, params) {
  if (page <= 0 || page > this.lastPageNumber())
    return;
  this.start = this.limit * (page - 1);
  this.request(params);
};

/**
 * Shows the page number in the page bar and controls each link status.
 *
 * @private
 */
PaginationGrid.prototype.showPageNumber = function () {
  let pagenum = this.start / this.limit + 1;
  let lastpagenum = this.lastPageNumber();
  let total = this.total;
  lastpagenum = lastpagenum ? lastpagenum : 0, total = total ? total : 0;
  if (this.limit <= 0) {
    return;
  }
  this.pagebar.innerHTML = pagenum + "/" + lastpagenum + "&nbsp;&nbsp;共" + total + "条记录";
  this.firstPage.classList.remove('disabled');
  this.prevPage.classList.remove('disabled');
  this.nextPage.classList.remove('disabled');
  this.lastPage.classList.remove('disabled');
  if (pagenum == 1) {
    this.firstPage.classList.add('disabled');
    this.prevPage.classList.add('disabled');
  }
  if (pagenum == this.lastPageNumber()) {
    this.nextPage.classList.add('disabled');
    this.lastPage.classList.add('disabled');
  }
};
/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/

/**
 * 分页表格显示组件。
 * <p>
 * 配置项包括:
 * <ul>
 *   <li>url: 数据源的提供链接</li>
 *   <li>local: 本地数据源，类型为对象数组</li>
 *   <li>limit: 单页显示数量，默认为15</li>
 *   <li>params: 固定的请求参数，类型为对象</li>
 *   <li>usecase: 用例名称，appbase框架的特殊参数</li>
 * </ul>
 *
 * @param {object} opts
 *        配置型
 */
function PaginationTable(opts) {
  let self = this;
  // 远程数据源
  this.url = opts.url;
  // 用例
  this.usecase = opts.usecase;
  this.refreshable = opts.refreshable !== false;
  if (typeof opts.resultFilters !== "undefined") {
    this.resultFilters=opts.resultFilters;
  }
  // 本地数据源，未封装的数据源
  this.local = opts.local;
  if (typeof opts.local !== "undefined") {
    this.local = {};
    this.local.total = opts.local.length;
    this.local.data = opts.local;
  }

  this.limit = opts.limit || 15;

  this.cache = opts.cache || "server";
  this.style = opts.style || "full";

  this.headless = opts.headless || false;
  if (typeof opts.hoverable !== 'undefined') {
    this.hoverable = opts.hoverable;
  } else {
    this.hoverable = true;
  }

  // 固定或者初始化查询条件
  this.filters = {};
  if (opts.filters) {
    for (let k in opts.filters) {
      this.filters[k] = opts.filters[k];
    }
  }
  if (opts.params) {
    for (let k in opts.params) {
      this.filters[k] = opts.params[k];
    }
  }

  this.showLoading = opts.showLoading || false;

  // 高度和宽度，用来固定表头和列的参数
  this.width = opts.width;
  this.height = opts.height;
  this.tbodyHeight = opts.tbodyHeight;

  this.queryId = opts.queryId || null;
  this.boundedQuery = opts.boundedQuery || null;
  
  /*!
  ** 报表需要小计、合计功能
  */
  this.groupField = opts.groupField;
  this.totalFields = opts.totalFields || [];

  //是否只显示获取的数据长度对应的表格行数
  this.showDataRowLength = opts.showDataRowLength || false;
  this.containerId = opts.containerId;

  if (typeof opts.useCookie === "undefined") {
    this.useCookie = false;
  } else {
    this.useCookie = opts.useCookie;
  }
  this.afterLoad = opts.afterLoad || function (obj) {};
  /**
   * [{ title: "", children: [], template: "<a href='${where}'>${displayName}</a>", params: {where: "", displayName:
   * "default"} rowspan: 1 }]
   */
  this.columns = opts.columns || []; //所有一级列数量
  this.allcolumns = 0; //所有的列数量（包含了嵌套列)）
  this.columnMatrix = [];
  let max = 0;
  for (let i = 0; i < this.columns.length; ++i) {
    let col = this.columns[i];
    max = Math.max(max, (col.rowspan || 1));
    if (typeof col.colspan != "undefined") {
      this.allcolumns += col.colspan;
    } else {
      this.allcolumns++;
    }
  }
  this.mappingColumns = [];
  this.headRowCount = max;
  this.start = 0;
  this.rollbackStart = 0;
  this.total = 0;
  this.table = null;
  this.result = null;
  // 是否显示顶端的查询
  this.showTop = opts.showTop !== false;
  for (let i = 0; i < max; ++i) {
    this.columnMatrix.push([]);
  }
  this.buildMatrix(this.columns, 0);
  this.buildMappingColumns(this.columns);

  /*
  ** 改版后的功能按钮（传统模式，FIXME: 暂时兼容）
  **
  ** 重新升级 20240201
  */
  if (opts.filter) {
    opts.filter.query = {
      callback: function(params) {
        self.go(1, params);
      }
    };
    this.widgetQuery = new QueryLayout(opts.filter);
    this.optsFilter = opts.filter;
  }
  if (opts.query) {
    this.widgetQuery = new QueryLayout(opts.query);
  }
  //
  // 最新的查询条件输入
  //
  if (opts.filter2) {
    this.optsFilter2 = opts.filter2;
  }
  //新增额外的excess
  if(opts.excess){
    this.widgetExcess=opts.excess;
  }
  if (opts.sort) {
    opts.sort.local = opts.sort.fields;
    opts.sort.create = function(idx, row) {
      let ret = dom.element(`
        <div class="full-width" style="margin-top: -8px; margin-bottom: -8px">
          <span class="position-relative" style="top: 8px;">${row.title}</span>
          <a data-role="desc" class="btn text-gray float-right" data-model-name="${row.name}">
            <i class="fas fa-sort-amount-up"></i>
          </a>
          <a data-role="asc" class="btn text-gray float-right" data-model-name="${row.name}">
            <i class="fas fa-sort-amount-down-alt"></i>
          </a>
        </div>
      `);
      dom.bind(dom.find('a[data-role=asc]', ret), 'click', function() {
        let model = dom.model(this);
        self.request({
          _order_by: model.name + ' asc'
        });
      });
      dom.bind(dom.find('a[data-role=desc]', ret), 'click', function() {
        let model = dom.model(this);
        self.request({
          _order_by: model.name + ' desc'
        });
      });
      return ret;
    };
    this.widgetSort = new ListView(opts.sort);
  }
  this.group = opts.group;
};

/**
 * Turns to the previous page.
 */
PaginationTable.prototype.prev = function () {
  if (this.start <= 0)
    return;
  this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
PaginationTable.prototype.next = function () {
  if (this.start + this.limit >= this.total)
    return;
  this.go((this.start + this.limit) / this.limit + 1);
};

/**
 * Goes to the given page.
 * 
 * @param {integer}
 *            page - the page number
 */
PaginationTable.prototype.go = function (page, criteria) {
  if (page <= 0 || page > this.lastPageNumber())
    return;
  this.rollbackStart = this.start;
  this.start = this.limit * (page - 1);
  // this.disablePaging();
  this.request(criteria);
};

/**
 * Renders the table in the web brower.
 * 
 * @param {string}
 *            containerId - the container id in the dom.
 */
PaginationTable.prototype.render = function (containerId, params) {
  if (typeof this.containerId === 'undefined') this.containerId = containerId;
  if (this.queryId != null) {
    this.boundedQuery = $('#' + this.queryId);
  }

  if (typeof this.containerId === 'string') {
    if (this.containerId.indexOf('#') == 0) {
      this.container = document.querySelector(this.containerId);
    } else {
      this.container = document.getElementById(this.containerId);
    }
  } else {
    this.container = containerId;
  }
  this.container.innerHTML = '';
  
  if (this.refreshable !== false) {
    this.container.appendChild(this.tableTopActions(params));
  }
  if(this.widgetExcess){
    this.container.appendChild(this.widgetExcess.template);
  }
  this.container.appendChild(this.root(params));
  if (this.limit != -1) {
    this.container.appendChild(this.pagination());
  }
  if (typeof params === "undefined" || params == '' || params == '{}') {
    this.go(1);
    this.afterRequest();
  } else if (typeof params === 'object') {
    for (let k in params) {
      this.addFilter(k, params[k]);
    }
    this.request({});
  } else {
    let ps = parseJSON(params);
    this.request(ps);
    this.afterRequest();
  }
};

/**
 * 请求之前的加载动画显示。
 */
PaginationTable.prototype.beforeRequest = function () {
  let loading = '' +
      '<div class="sk-circle">\n' +
      '  <div class="sk-circle1 sk-child"></div>\n' +
      '  <div class="sk-circle2 sk-child"></div>\n' +
      '  <div class="sk-circle3 sk-child"></div>\n' +
      '  <div class="sk-circle4 sk-child"></div>\n' +
      '  <div class="sk-circle5 sk-child"></div>\n' +
      '  <div class="sk-circle6 sk-child"></div>\n' +
      '  <div class="sk-circle7 sk-child"></div>\n' +
      '  <div class="sk-circle8 sk-child"></div>\n' +
      '  <div class="sk-circle9 sk-child"></div>\n' +
      '  <div class="sk-circle10 sk-child"></div>\n' +
      '  <div class="sk-circle11 sk-child"></div>\n' +
      '  <div class="sk-circle12 sk-child"></div>\n' +
      '</div>'

  if (this.showLoading) {
    $(this.table.find('tbody')).empty();
    $(this.table.find('tbody')).append($("<tr></tr>").append($("<td style='text-align:center'></td>").attr("colspan", this.allcolumns).html(loading)));
  }
};

PaginationTable.prototype.afterRequest = function () {

};

PaginationTable.prototype.requestError = function () {
  this.table.find("div.loaddingct").html('<h6 style="color:#dc3545">数据加载出错，请联系管理员解决...</h6>');
};

/**
 * Gets the html source for this pagination table object.
 *
 * @return {object} the jquery table
 */
PaginationTable.prototype.root = function (initParams) {
  if (typeof initParams === "undefined") {
    initParams = {};
  }
  let ret = dom.element('<div class="full-width"></div>');
  ret.style.overflowY = 'auto';
  this.table = dom.element('<table></table>');
  if (typeof this.width !== 'undefined') 
    this.table.style.width = this.width;
  if (typeof this.height !== 'undefined') 
    ret.style.height = this.height;

  this.table.classList.add('table', 'table-responsive-sm', 'table-outline', 'mb-0');
  if (this.hoverable) {
    this.table.classList.add('table-hover');
  }
  this.table.style.overflow = 'hidden';

  let self = this;
  let thead = dom.create('thead');
  thead.style = 'height: 43px;';
  thead.classList.add('thead-light');
  for (let i = 0; i < this.columnMatrix.length; ++i) {
    let tr = dom.create('tr');
    for (let j = 0; j < this.columnMatrix[i].length; ++j) {
      let col = this.columnMatrix[i][j];
      let th = dom.create('th');
      th.style = 'vertical-align:middle;z-index:900;';
      // 冻结列
      if (j < this.frozenColumnCount) th.classList.add('headcol');
      let span = dom.element("<span class='pull-right fa fa-arrows-v'></span>");
      span.style.opacity = '0.3';
      span.style.marginTop = '2px';
      span.classList.add('fa');
      dom.bind(span, 'click', function (evt) {
        let sorting = "asc";
        let span = evt.target;
        if (span.classList.contains("fa-arrows-v")) {
          span.classList.add("fa-arrows-v");
          span.classList.remove("fa-sort-amount-asc");
          span.style.opacity = '0.6';
          sorting = "asc";
        } else if (span.classList.contains("fa-sort-amount-asc")) {
          span.classList.remove("fa-sort-amount-asc");
          span.classList.add("fa-sort-amount-desc");
          sorting = "desc";
        } else if (span.classList.contains("fa-sort-amount-desc")) {
          span.classList.remove("fa-sort-amount-desc");
          span.classList.add("fa-sort-amount-asc");
          sorting = "asc";
        }
        // 其余的重置
        if (!span.classList.contains("fa-arrows-v")) {
          self.table.querySelectorAll('th span').forEach(function(elm, idx) {
            if (span.getAttribute("data-order") == elm.getAttribute("data-order")) return;
            elm.classList.remove("fa-sort-amount-asc");
            elm.classList.remove("fa-sort-amount-desc");
            elm.classList.addEventListener("fa-arrows-v");
            elm.style.opacity = '0.3';
          });
        }
        // 请求数据
        self.filters["orderBy"] = span.attr("data-order");
        self.filters["sorting"] = sorting;
        self.request();
      });
      th.setAttribute('rowspan', col.rowspan || 1);
      th.setAttribute('colspan', col.colspan || 1);
      // style
      // th.attr('style', col.style || "");
      // 如果设置了列宽
      if (typeof col.width !== 'undefined') th.style.width = col.width;
      // 当需要冻结表头
      if (this.frozenHeader == true) {
        thead.style.float = 'left';
        th.style.float = 'left';
      }
      // 默认居中
      if (col.style) {
        th.style = th.style || '';
        th.setAttribute('style', th.style + '; vertical-align:middle;' + col.style);
      } else {
        th.style.textAlign = 'center';
        th.style.verticalAlign = 'middle';
      }
      if (typeof col.headerClick === "undefined") {
        th.innerText = col.title;
      } else {
        let a = dom.element('<a></a>');
        dom.bind(a, 'click', col.headerClick);
        th.appendChild(a);
        a.style.cursor = 'default';
        a.innerText = col.title;
      }
      // 如果定义了data-order属性，则添加
      if (typeof col.order !== "undefined") {
        span.setAttribute("data-order", col.order);
        // 根据初始化的过滤条件中，显示图标
        if (col.order === initParams["orderBy"]) {
          span.classList.remove("fa sort");
          if (initParams["sorting"] === "asc") {
            // span.addClass("glyphicon-sort-by-attributes");
            span.classList.add('fa fa-sort-amount-asc')
          } else {
            // span.addClass("glyphicon-sort-by-attributes-alt");
            span.classList.add('fa fa-sort-amount-desc')
          }
        }
        th.appendChild(span);
      }
      tr.appendChild(th);
    }
    thead.appendChild(tr);
  }
  if (!this.headless)
    this.table.appendChild(thead);
  // 添加个空的表体
  this.table.appendChild(dom.create('tbody'));
  ret.appendChild(this.table);
  return ret;
};


/**
 * Builds pagination bar for table.
 * 
 * @return {object} a pagination bar, the jquery div.
 */
PaginationTable.prototype.pagination = function () {
  let self = this;
  let div = dom.element('<div class="table-pagination d-flex"></div>');
  let ul = dom.element('<ul class="pagination ms-auto mb-0 mt-2"></ul>');
  // ul.addClass('pagination mb-0');
  this.firstPage = dom.element('<li class="page-item"></li>');
  let a = dom.element('<a class="page-link b-a-0 font-14"></a>');
  a.setAttribute('href', 'javascript:void(0)');
  a.innerHTML = '首页';
//  a.innerHTML = '<i class="material-icons">first_page</i>';
  dom.bind(a, 'click', function () {
    self.go(1);
  });
  this.firstPage.appendChild(a);

  if (this.style === 'full') {
    ul.appendChild(this.firstPage);
  }

  this.prevPage = dom.element('<li class="page-item"></li>');
  a = dom.element('<a class="page-link b-a-0 font-14"></a>');
  a.setAttribute('href', 'javascript:void(0)');
  a.innerHTML = '上一页';
//  a.innerHTML = '<i class="material-icons">chevron_left</i>';
  dom.bind(a, 'click', function () {
    self.prev();
  });
  this.prevPage.appendChild(a);
  ul.appendChild(this.prevPage);

  li = dom.element('<li class="page-item disabled"></li>');
  this.pagebar = dom.element('<a class="page-link b-a-0 font-14"></a>');
  this.pagebar.setAttribute('href', 'javascript:void(0)');
  this.pagebar.setAttribute('style', 'cursor: default');
  this.pagebar.innerText = '0/0';
  li.appendChild(this.pagebar);
  ul.appendChild(li);

  this.nextPage = dom.element('<li class="page-item"></li>');
  a = dom.element('<a class="page-link b-a-0 font-14"></a>');
  a.setAttribute('href', 'javascript:void(0)');
  a.innerHTML = '下一页';
//  a.innerHTML = '<i class="material-icons">chevron_right</i>';
  dom.bind(a, 'click', function () {
    self.next();
  });
  this.nextPage.appendChild(a);
  ul.appendChild(this.nextPage);

  this.lastPage = dom.element('<li class="page-item"></li>');
  a = dom.element('<a class="page-link b-a-0font-14"></a>');
  a.setAttribute('href', 'javascript:void(0)');
  a.innerHTML = '末页';
//  a.innerHTML = '<i class="material-icons">last_page</i>';
  dom.bind(a, 'click', function () {
    self.go(self.lastPageNumber());
  });
  this.lastPage.appendChild(a);
  if (this.style === 'full') {
    ul.appendChild(this.lastPage);
  }

  li = dom.element('<li class="page-item disabled"></li>');
  a = dom.element('<a class="page-link b-a-0 pt-0"></a>');
  a.setAttribute('style', 'cursor: default');
  if (this.limit < 0) {
    ul.innerHTML = '';
  }else{
    ul.style.height = '34.75px';
  }
  div.appendChild(ul);
  return div;
};

//表格过滤搜索
PaginationTable.prototype.tableTopActions = function () {
  if (this.showTop === false) return;
  let self = this;
  let div = dom.element('<div class="full-width d-flex overflow-hidden" style="height: 26px;display:none!important;"></div>');

  // 测试
  if (this.optsFilter2) {
    let optQueryFilter = {};
    utils.clone(this.optsFilter2, optQueryFilter);
    optQueryFilter.table = this;
    this.queryFilter = new QueryFilter(optQueryFilter);
    div.appendChild(this.queryFilter.getRoot());
  } else {
    div.appendChild(dom.element('<div class="full-width"></div>'));
    // div.removeClass('d-flex');
  }

  let actions = div; // dom.create('div', 'card-header-actions', 'pt-0', 'pr-2');

  if (this.group) {
    let action = dom.element('' +
        '<a widget-id="toggleGroup" class="card-header-action text-primary ml-2">\n' +
        '  <i class="fas fa-bars"></i>\n' +
        '</a>');
    actions.appendChild(action);
  }

  if (this.widgetSort) {
    let containerSort = dom.create('div', 'card', 'widget-sort', 'fade', 'fadeIn');
    containerSort.zIndex = 9999;
    this.widgetSort.render(containerSort);
    this.container.appendChild(containerSort);

    let action = dom.element('' +
        '<a widget-id="toggleSort" class="card-header-action text-primary ml-2">\n' +
        '  <i class="fas fa-sort-amount-down-alt position-relative" style="top: 4px; font-size: 17px;"></i>\n' +
        '</a>');
    dom.bind(action, 'click', function() {
      if (containerSort.classList.contains('show')) {
        containerSort.classList.remove('show');
      } else {
        containerSort.classList.add('show');
      }
    });
    actions.appendChild(action);
  }

  if (this.widgetQuery) {
    // let containerQuery = dom.create('div', 'card', 'widget-query', 'fade', 'fadeIn');
    let containerQuery = dom.create('div', 'widget-query');
    this.widgetQuery.render(containerQuery);
    this.container.appendChild(containerQuery);

    let action = dom.element('' +
        '<a widget-id="toggleFilter" class="card-header-action text-primary">\n' +
        '  <i class="fas fa-filter position-relative" style="top: 4px;"></i>\n' +
        '</a>');
    dom.bind(action, 'click', function() {
      let query = containerQuery;
      if (query.classList.contains('show')) {
        query.classList.remove('show');
      } else {
        query.classList.add('show');
      }
    });
    actions.appendChild(action);
  }
  if (this.refreshable) {
    let action = dom.element('' +
        '<a widget-id="toggleFilter" class="card-header-action text-primary ml-2">\n' +
        '  <i class="fas fa-sync-alt position-relative" style="top: 4px;"></i>\n' +
        '</a>');
    dom.bind(action, 'click', function () {
      self.request();
    });
    actions.appendChild(action);
  }
  // div.get(0).appendChild(actions);

  // if (this.limit < 0) {
  //   ul.empty();
  //   if (this.widgetQuery)
  //     ul.css('height', '34.75px');
  // }
  // div.get(0).appendChild(ul.get(0));
  return div;
}
/**
 * Shows the page number in the page bar and controls each link status.
 * 
 * @private
 */
PaginationTable.prototype.showPageNumber = function () {
  let pagenum = this.start / this.limit + 1;
  let lastpagenum = this.lastPageNumber(),
    total = this.total;
  lastpagenum = lastpagenum ? lastpagenum : 0, total = total ? total : 0;
  if (this.limit <= 0) {
    return;
  }
  this.pagebar.innerHTML = (pagenum + "/" + lastpagenum + "&nbsp;&nbsp;共" + total + "条记录");
  if (total == 0 || this.lastPageNumber() == 1) {
    this.firstPage.classList.add('disabled');
    this.prevPage.classList.add('disabled');
    this.nextPage.classList.add('disabled');
    this.lastPage.classList.add('disabled');
    return;
  }
  if (pagenum == 1) {
    this.firstPage.classList.add('disabled');
    this.prevPage.classList.add('disabled');
    this.nextPage.classList.remove('disabled');
    this.lastPage.classList.remove('disabled');
  } else if (pagenum == this.lastPageNumber()) {
    this.nextPage.classList.add('disabled');
    this.lastPage.classList.add('disabled');
    this.firstPage.classList.remove('disabled');
    this.prevPage.classList.remove('disabled');
  } else {
    this.firstPage.classList.remove('disabled');
    this.prevPage.classList.remove('disabled');
    this.nextPage.classList.remove('disabled');
    this.lastPage.classList.remove('disabled');
  }
};

/**
 * 禁用逐个分页按钮。
 *
 * @private
 */
PaginationTable.prototype.disablePaging = function () {
  if (this.limit <= 0) {
    return;
  }
  this.firstPage.removeClass();
  this.prevPage.removeClass();
  this.nextPage.removeClass();
  this.lastPage.removeClass();
  this.firstPage.addClass('disabled');
  this.prevPage.addClass('disabled');
  this.nextPage.addClass('disabled');
  this.lastPage.addClass('disabled');
};

/**
 * Gets the last page number.
 * 
 * @return the last page number
 */
PaginationTable.prototype.lastPageNumber = function () {
  if (this.total == 0 || this.limit == -1) {
    return 1;
  }
  let residue = this.total % this.limit;
  if (residue == 0) {
    return parseInt(this.total / this.limit);
  } else {
    return parseInt(this.total / this.limit + 1);
  }
};

/**
 * Gets the max col span for the given column.
 * 
 * @param {object}
 *            column - the column object
 * 
 * @private
 */
PaginationTable.prototype.maxColSpan = function (column) {
  let ret = 1;
  let max = 0;
  for (let i = 0; column.children && i < column.children.length; ++i) {
    max = Math.max(max, this.maxColSpan(column.children[i]));
  }
  ret += max;
  return ret;
};

/**
 * Clears all data rows.
 * 
 * @private
 */
PaginationTable.prototype.clear = function () {
  // this.table.find("thead").remove(); // 如果手动添加了表格头部
  dom.find('tbody', this.table).innerHTML = '';
};

/**
 * Builds the direct columns which are used to map values with result.
 * 
 * @param {array}
 *            columns - the columns
 * 
 * @private
 */
PaginationTable.prototype.buildMappingColumns = function (columns) {
  for (let i = 0; i < columns.length; i++) {
    let col = columns[i];
    if (!col.children || col.children.length == 0) {
      this.mappingColumns.push(col);
    } else {
      this.buildMappingColumns(col.children);
    }
  }
};

/**
 * Builds column matrix.
 * 
 * @param {object}
 *            parent - the parent column
 * 
 * @param {integer}
 *            index - the matrix row index
 * 
 * @private
 */
PaginationTable.prototype.buildMatrix = function (columns, index) {
  if (!columns)
    return;
  let currentIndex = index;

  // add column children
  for (let i = 0; i < columns.length; ++i) {
    let col = columns[i];
    if (col.children && col.children.length > 0) {
      col.colspan = col.colspan || 1;
      this.buildMatrix(col.children, index + 1);
    }
    this.columnMatrix[currentIndex].push(col);
  }
};

/**
 * 向服务器发起请求获取数据。
 *
 * @public
 */
PaginationTable.prototype.request = function (others) {
  let self = this;
  let params = {};
  if (self.boundedQuery != null) {
    let ft = self.boundedQuery.formdata();
    for (let k in ft) {
      this.filters[k] = ft[k];
    }
  }
  params = params || {};

  // the parameters from query for this table
  if (this.widgetQuery) {
    let queryParams = this.widgetQuery.getQuery();
    for (let k in queryParams) {
      if (params[k] && params) {
        if (k.indexOf('_') == 0) {
          params[k] += ' ' + queryParams[k];
        } else {
          params[k] = queryParams[k];
        }
      } else {
        params[k] = queryParams[k];
      }
    }
  }
  if (this.queryFilter) {
    let queryParams = this.queryFilter.getValues();
    for (let k in queryParams) {
      if (params[k]) {
        if (k.indexOf('_') == 0) {
          params[k] += ' ' + queryParams[k];
        } else {
          params[k] = queryParams[k];
        }
      } else {
        params[k] = queryParams[k];
      }
    }
  }
  // the parameters defined in table options
  for (let k in this.filters) {
    if (params[k]) {
      if (k.indexOf('_') == 0) {
        params[k] += ' ' + this.filters[k];
      } else {
        params[k] = this.filters[k];
      }
    } else {
      params[k] = this.filters[k];
    }
  }

  // the parameters of method arguemnts
  if (typeof others !== "undefined") {
    for (let k in others) {
      if (k == "start") {
        this.start = parseInt(others[k])
      } else if (k == "limit") {
        this.limit = parseInt(others[k]);
      } else {
        if (params[k]) {
          // params[k] += ' ' + others[k];
          params[k] = others[k];
        } else {
          params[k] = others[k];
        }
      }
    }
  }
  params['start'] = this.start;
  params['limit'] = this.limit;

  // params['criteria'] = JSON.stringify(this.filters);
  // this.setCookie();
  if (typeof this.url !== "undefined") {
    this.beforeRequest();
    xhr.post({
      url: this.url,
      usecase: this.usecase,
      data: params,
      error: function (resp) {
        self.start = self.rollbackStart;
        self.showPageNumber();
        self.requestError();
      }
    }).then(data => {
      let result = data;
      if (!result.total) {
        result.total = 0;
        result.data = [];
      }
      if(self.resultFilters){
        result=self.resultFilters(result);
      }
      self.total = result.total;
      self.fill(result);
      self.showPageNumber();
      self.afterLoad(result);
    });
    return;
  }
  this.loadLocal();
};

/**
 * 加载本地数据分页显示。
 */
PaginationTable.prototype.loadLocal = function () {
  if (!this.local) {
    this.local = {
      total: 0,
      data: [],
    }
  }
  this.total = this.local.total;
  let result = {};
  result.total = this.local.total;
  result.data = [];
  if (this.limit != -1) {
    for (let i = this.start; i < (this.start + this.limit) && i < this.local.total; i++) {
      result.data.push(this.local.data[i] == null ? "&nbsp;" : this.local.data[i]);
    }
  } else {
    result = this.local;
  }
  this.fill(result);
  this.showPageNumber();
  this.afterLoad(result);
};

PaginationTable.prototype.addFilter = function (name, value) {
  this.filters[name] = value;
};

PaginationTable.prototype.clearFilters = function () {
  this.filters = {};
};

PaginationTable.prototype.replace = function (str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
};

/**
 * Fills the table with the result.
 * 
 * @param the result from the server side
 * 
 * @version 3.0.0 - 增加表格的小计合计功能
 */
PaginationTable.prototype.fill = function (result) {
  this.clear();
  let self = this;
  function incrementTotalOrSubtotalColumns(totalRow, subtotalRow, rawRow) {
    for (let i = 0; i < self.totalFields.length; i++) {
      let rc = self.totalFields[i];
      let value = parseFloat(rawRow[rc]);
      if (isNaN(value)) {
        value = 0;
      }
      
      let totalValue = parseFloat(totalRow[rc]);
      if (isNaN(totalValue)) {
        totalValue = 0;
      }
      totalValue += value;
      totalRow[rc] = totalValue;
      
      if (subtotalRow) {
        let subtotalValue = parseFloat(subtotalRow[rc]);
        if (isNaN(subtotalValue)) {
          subtotalValue = 0;
        }
        subtotalValue += value;
        subtotalRow[rc] = subtotalValue;
      }
    }
  }
  
  //
  // 如果需要统计功能，则需要出现小计、合计列
  //
  let resultNew = {
    total: result.total,
    data: []
  };
  let previousGroupValue = null;
  let totalRow = {};
  let subtotalRow = {};
  for (let i = 0; i < result.data.length; i++) {
    if (this.totalFields.length == 0) {
      resultNew.data.push(result.data[i]);
      continue;
    }
    // 计算小计、合计
    let row = result.data[i];
    let groupValue = row[this.groupField];
    if (previousGroupValue == null) {
      previousGroupValue = groupValue;
    }
    if (groupValue != previousGroupValue) {
      previousGroupValue = groupValue;
      subtotalRow[this.mappingColumns[0].title] = '小计';
      
      resultNew.data.push(subtotalRow);
      resultNew.data.push(result.data[i]);
      
      subtotalRow = {};
      subtotalRow[this.mappingColumns[0].title] = '小计';
    } else {
      resultNew.data.push(result.data[i]);
    }
    incrementTotalOrSubtotalColumns(totalRow, subtotalRow, row);
  }
  // 判断小计行是否有值
  if (this.totalFields.length > 0) {
    subtotalRow[this.mappingColumns[0].title] = "小计";
    resultNew.data.push(subtotalRow);
  }
  if (this.totalFields.length > 0) {
    totalRow[this.mappingColumns[0].title] = "合计";
    resultNew.data.push(totalRow);
  }
  
  let mappingColumns = this.mappingColumns;
  if (resultNew.data && resultNew.data[0]) {
    let limit = this.limit;
    limit = limit < 0 ? resultNew.data.length : limit;
    let tbody = dom.find('tbody', this.table);
    if (typeof this.tbodyHeight !== 'undefined') {
      tbody.style.height = this.tbodyHeight;
      tbody.style.overflowY = 'auto';
    }
    for (let i = 0; i < limit; ++i) {
      if (i < resultNew.data.length) {
        let row = resultNew.data[i];
        this.appendRow(row, i);
      } 
    }
  } else {
    let tbody = dom.find('tbody', this.table);
    tbody.innerHTML = `
      <tr class="no-hover">
        <td colspan="100" class="text-center pt-4">
          <img width="48" height="48" src="/img/widget/nodata.png" class="mb-2" style="opacity: 25%;">
          <p style="opacity: 40%; color: black;">没有匹配的数据</p>
        </td>
      </tr>
    `;
  }
};

PaginationTable.prototype.appendRow = function (row, rowIndex) {
  let tbody = dom.find('tbody', this.table);
  let nodata = dom.find('tr.no-hover', tbody);
  if (nodata != null) {
    nodata.remove();
  }
  let tr = dom.create("tr");
  dom.model(tr, row);
  tr.style.height = this.columnHeight;
  for (let j = 0; j < this.mappingColumns.length; ++j) {
    let col = this.mappingColumns[j];
    let td = dom.create('td');
    // 冻结列
    if (j < this.frozenColumnCount) td.classList.add('headcol');
    if (col.style) {
      td.setAttribute("style", col.style);
    } else {
      td.setAttribute("style", "text-align: center; vertical-align:middle;");
    }
    if (typeof col.width !== 'undefined') td.style.width = col.width;
    if (this.frozenHeader === true) {
      tbody.style.float = 'left';
      td.style.float = 'left';
    }
    if (col.template) {
      let html = col.template.toString();
      for (let k in row) {
        row[k] = row[k] == null ? "-" : row[k];
        html = this.replace(html, "\\{" + k + "\\}", row[k]);
      }
      if (html.indexOf('{') == 0 && html.indexOf('}') != -1) {
        html = '-';
      }
      td.html(html);
    }
    if (col.display) {
      col.display(row, td.get(0), j, (typeof(rowIndex) === 'undefined' ? -1 : rowIndex), this.start);
    }
    tr.appendChild(td);
  }
  tbody.appendChild(tr);
};

PaginationTable.prototype.appendOrReplaceRow = function (row, rowIndex) {
  let tbody = dom.find('tbody', this.container);
  let nodata = dom.find('tr.no-hover', tbody);
  if (nodata != null) {
    nodata.remove();
  }
  let tr = dom.create('tr');
  dom.model(tr, row);
  tr.style.height = this.columnHeight;
  for (let j = 0; j < this.mappingColumns.length; ++j) {
    let col = this.mappingColumns[j];
    let td = dom.create('td');
    // 冻结列
    if (j < this.frozenColumnCount) td.classList.add('headcol');
    if (col.style) {
      td.style = col.style;
    } else {
      td.style = "text-align: center; vertical-align:middle;";
    }
    if (typeof col.width !== 'undefined') td.css('width', col.width);
    if (col.template) {
      let html = col.template.toString();
      for (let k in row) {
        row[k] = row[k] == null ? "-" : row[k];
        html = this.replace(html, "\\{" + k + "\\}", row[k]);
      }
      if (html.indexOf('{') == 0 && html.indexOf('}') != -1) {
        html = '-';
      }
      td.html(html);
    }
    if (col.display) {
      col.display(row, td, j, (typeof(rowIndex) === 'undefined' ? -1 : rowIndex), this.start);
    }
    tr.appendChild(td);
  }
  if (typeof rowIndex !== 'undefined') {
    let oldTr = tbody.rows[rowIndex];
    tbody.replaceChild(tr, oldTr);
  } else {
    tbody.appendChild(tr);
  }

};

PaginationTable.prototype.getData = function () {
  let ret = [];
  let tbody = dom.find('tbody', this.table);
  let trs = tbody.querySelectorAll('tr');
  for (let i = 0; i < trs.length; i++) {
    let tr = trs[i];
    if (tr.classList.contains('no-hover')) {
      continue;
    }
    let model = dom.model(tr);
    ret.push(model);
  }
  return ret;
};

/**
 * 通过stack方式显示单行额外信息。
 *
 * @param {integer} rowIndex
 *        扩展的行的索引号
 *
 * @param {string} url
 *        在stack区域显示的内容
 *
 * @param {function} render
 *        用于渲染stack区域的回调函数
 */
PaginationTable.prototype.stack = function(rowIndex, url, params, render) {
  params = params || {};
  let tbody = dom.find('tbody', this.container);
  let rowStack = tbody.children[rowIndex + 1];
  if (rowStack != null && rowStack.getAttribute('role') == 'stack') {
    return;
  }
  rowStack = dom.find('tr[role=stack]', tbody);

  if (rowStack != null) {
    if (rowStack.rowIndex <= rowIndex) rowIndex--;
    rowStack.remove();
  }
  let row = tbody.children[rowIndex];
  rowStack = dom.create('tr', 'fade', 'fadeInDown');
  rowStack.setAttribute('role', 'stack');
  // rowStack.setAttribute('style', 'background-color: white;')

  let cellStack = dom.create('td');
  rowStack.style.backgoundColor = 'white';
  cellStack.setAttribute('colspan', this.columns.length);
  rowStack.appendChild(cellStack);

  if (row == null || row.nextSibling == null) {
    tbody.appendChild(rowStack);
  } else {
    tbody.insertBefore(rowStack, row.nextSibling);
  }

  xhr.get({
    url: url,
    success: function(resp) {
      utils.append(cellStack, resp);
      if (render)
        render(cellStack, params);
      setTimeout(function () {
        rowStack.classList.add('show');
      }, 300);
    }
  })
};

PaginationTable.prototype.unstack = function() {
  let tbody = dom.find('tbody', this.container);
  let rowStack = dom.find('tr[role=stack]', tbody);
  if (rowStack != null) rowStack.remove();
};
/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/

let ICON_CLEAR = '<i class="fas fa-backspace text-danger position-relative" style="left: -4px;"></i>';

function QueryLayout(opts) {
  let self = this;
  this.fields = opts.fields;
  this.actions = opts.actions || [];
  this.queryOpt = opts.query || {};
  this.columnCount = opts.columnCount || 3;
  // 查询值转换函数，用于复杂查询
  this.convert = opts.convert;
}

QueryLayout.prototype.render = function (containerId, read, data) {
  function formatCols(cols) {
    if (cols < 10)
      return '0' + cols;
    return cols;
  }
  let self = this;
  if (typeof containerId === 'string') {
    this.container = document.querySelector(containerId);
  } else {
    this.container = containerId;
  }

  if (read) {
    this.fetch(read);
    return;
  }

  data = data || {};

  let form = dom.create('div', 'row', 'mx-0');
  let columnCount = this.columnCount;
  let hiddenFields = [];
  let shownFields = [];

  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    field.value = (typeof data[field.name] === 'undefined') ? null : data[field.name];
    if (field.input == 'hidden') {
      hiddenFields.push(field);
    } else {
      shownFields.push(field);
    }
  }

  for (let i = 0; i < shownFields.length; i++) {
    let field = shownFields[i];
    let formGroup = dom.create('div', (field && field.input == 'check'? 'form-group' : 'form-group'), 'gx-24-' + formatCols(24 / this.columnCount), 'row', 'mx-0');
    let group = this.createInput(field, columnCount);

    formGroup.appendChild(group.label);
    formGroup.appendChild(group.input);

    form.appendChild(formGroup);
  }
  // 必须放在这里，否者后续容器会找不到
  this.container.appendChild(form);

  // ###################### //
  // 引用的第三方插件，重新渲染 //
  // ###################### //
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    if (field.input == 'date') {
      const elem = dom.find('input[name="' + field.name + '"]', this.container);
      const datepicker = new Datepicker(elem, {
        format: 'yyyy-mm-dd',
        language: 'zh-CN',
        autohide: true,
      }); 
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '\']', this.container).value = moment(field.value).format('YYYY-MM-DD');
      }
    } else if (field.input == 'select') {
      let opts = field.options;
      opts.validate = EditableForm.validate;
      // 加载值或者默认值
      // 允许数组值
      if (Array.isArray(field.value)) {
        opts.selection = field.value[0][opts.fields.value];
      } else {
        opts.selection = field.value;
      }
      let select = dom.find('select[name="' + field.name + '"]', this.container);
      select.append(dom.element('<option data-placeholder="true"></option>'));
      if (opts.values) {
        for (let i = 0; i < opts.values.length; i++) {
          select.append(dom.element('<option value="' + opts.values[i].value + '">' + opts.values[i].text + '</option>'));
        }
      }
      new SlimSelect({
        select: select,
        // data: opts.values,
        placeholder: true,
        settings: {
          allowDeselect: true,
          showSearch: false,
          placeholderText: '请选择…',
          contentPosition: 'absolute',
        },    
      });
    } else if (field.input == 'cascade') {
      let opts = field.options;
      // 加载值或者默认值
      for (let j = 0; j < opts.levels.length; j++) {
        let level = opts.levels[j];
//        if (persisted && typeof persisted[level.name] !== "undefined") {
//          level.value = persisted[level.name];
//        }
      }
      opts.container = dom.find('div[data-cascade-name="' + field.name + '"]', this.container);
      new CascadeSelect(opts);
    } 
  }

  let buttonRow = dom.element('<div class="row ml-0 mr-0 full-width mt-3"><div class="full-width d-flex"></div></div>');
  let buttons = dom.create('div', 'ms-auto');
  let buttonQuery = dom.create('button', 'btn', 'btn-primary', 'btn-sm', 'gx-mr-12');
  buttonQuery.textContent = '搜索';
  dom.bind(buttonQuery, 'click', function() {
    if (self.queryOpt.callback) {
      // 查询条件转换函数
      if (self.queryOpt.convert) {
        self.queryOpt.callback(self.queryOpt.convert(dom.formdata(self.container)));
      } else {
        self.queryOpt.callback(dom.formdata(self.container));
      }
    }
  });
  buttons.appendChild(buttonQuery);
  buttons.append(' ');
  let buttonReset = dom.create('button', 'btn', 'btn-sm', 'btn-warning');
  buttonReset.textContent = '清除';
  dom.bind(buttonReset, 'click', function() {
    dom.formdata(self.container, {});
  });
  buttons.appendChild(buttonReset);
  buttons.append(' ');
  // let buttonClose = dom.create('button', 'btn', 'btn-sm', 'btn-close');
  // buttonClose.textContent = '关闭';
  // dom.bind(buttonClose, 'click', function() {
  //   self.container.classList.remove('show');
  // });
  // buttons.appendChild(buttonClose);
  buttonRow.firstElementChild.appendChild(buttons);
  form.appendChild(buttonRow);

  this.container.addEventListener('keypress', function(ev) {
    if (ev.keyCode === 13) {
      buttonQuery.click();
    }
  });
};

QueryLayout.prototype.getQuery = function() {
  if (this.convert) {
    return this.convert(dom.formdata(this.container));
  }
  return dom.formdata(this.container);
};

/**
 * Creates input element in form.
 *
 * @param field
 *        field option
 *
 * @param columnCount
 *        column count in a row
 *
 * @returns {object} label and input with add-ons dom elements
 *
 * @private
 */
QueryLayout.prototype.createInput = function (field, columnCount) {
  let self = this;
  columnCount = columnCount || 1;
  let minCols = 24 / (columnCount * 3);
  // let label = dom.create('div', columnCount == 2 ? 'col-md-2' : 'col-md-4', 'col-form-label');
  let label = dom.create('div', 'col-form-label', 'gx-24-08', 'pl-3');
  label.innerText = field.title + '：';
  let group = dom.create('div', 'gx-24-16', 'input-group');

  let input = null;
  if (field.input == 'select') {
    input = dom.create('select', 'form-control');
    input.style.width = '100%';
    input.disabled = this.readonly;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请选择...');
  } else if (field.input == 'cascade') {
    input = dom.create('div', 'form-control','sm30');
    if (this.readonly)
      input.style.backgroundColor = 'rgb(240, 243, 245)';
    input.setAttribute('data-cascade-name', field.name);
    input.setAttribute('placeholder', '请选择...');
  } else if (field.input == 'check') {
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      let check = dom.element(`
        <div class="form-check form-check-inline">
          <input id="" name="" value="" type="checkbox"
                 class="form-check-input checkbox color-primary is-outline">
          <label class="form-check-label" for=""></label>
        </div>
      `);
      dom.find('input', check).id = 'check_' + val.value;
      dom.find('input', check).name = field.name;
      if (field.value) {
        dom.find('input', check).checked = field.value == val.value;
      } else {
        dom.find('input', check).checked = val.checked == true;
      }
      dom.find('input', check).value = val.value;
      dom.find('label', check).setAttribute('for', 'check_' + val.value);
      dom.find('label', check).textContent = val.text;
      group.append(check);
    }
  } else {
    input = dom.create('input', 'form-control');
    input.disabled = this.readonly;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请输入...');
  }
  if (input != null)
    group.appendChild(input);

  if (field.input == 'date') {
    input.setAttribute('data-domain-type', 'date');
    input.setAttribute('placeholder', '请选择...');
  } else if (field.input.indexOf('number') == 0) {
    input.setAttribute('data-domain-type', field.input);
  }

  // let clear = dom.element('<div class="input-group-append pointer"><span class="input-group-text width-36 icon-error"></span></div>');
  // dom.find('span', clear).innerHTML = ICON_CLEAR;
  // dom.bind(clear, 'click', function() {
  //   dom.find('input', clear.parentElement).value = '';
  // });

  // if (field.input !== 'checklist' &&
  //   field.input !== 'longtext' &&
  //   field.input !== 'select' &&
  //   field.input !== 'check' &&
  //   field.input !== 'radio' &&
  //   field.input !== 'checktree' &&
  //   field.input !== 'fileupload')
  //   group.append(clear);

  return {label: label, input: group};
};

/**
 * Creates button element.
 *
 * @param action
 *        action option
 *
 * @returns {button} the button dom element
 *
 * @private
 */
QueryLayout.prototype.createButton = function(action) {
  let self = this;
  let button = dom.create('button', 'btn', 'btn-sm', 'btn-' + action.role);
  button.innerText = action.text;
  button.addEventListener('click', action.click);
  return button;
};