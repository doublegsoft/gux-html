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