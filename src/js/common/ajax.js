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
    if (opt.headless === true) {
      let pageHeader = dom.find('.page-header', container);
      pageHeader.remove();
      fragment.container.children[0].classList.remove('page');
    }
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
