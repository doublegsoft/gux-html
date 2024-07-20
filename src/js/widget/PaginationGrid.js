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