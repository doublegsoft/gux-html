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