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