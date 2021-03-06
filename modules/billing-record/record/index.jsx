require('./style/index.less');

const React = require('react');
const {Pagination, Table} = require('client/uskin/index');
const SelectList = require('./select_list');
const Detail = require('./detail');
const __ = require('locale/client/bill.lang.json');
const converter = require('./converter');
const moment = require('client/libs/moment');

class Main extends React.Component {
  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.stores = {
      selected: null
    };

    ['onClickPagination', 'onAction', 'onDetailAction'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentWillMount() {
    let config = this.props.config;
    converter.convertLang(__, config);
    this.tableColRender(config.table.column);
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.type) {
        case 'captain':
          column.render = (col, item, i) => {
            let formatData = column.formatter && column.formatter(col, item, i);
            if (!formatData) {
              formatData = (item[col.dataIndex] ? item[col.dataIndex] : '(' + item.order_id.substr(0, 8) + ')');
            }
            return (
              <a className="captain" onClick={this.onClickCaptain.bind(this, item)}>
                {formatData}
              </a>
            );
          };
          break;
        case 'status':
          column.render = (col, item, i) => {
            return this.props.getStatusIcon(item[col.dataIndex]);
          };
          break;
        case 'time':
          column.render = (col, item, i) => {
            return moment(item[col.dataIndex]).format('YYYY-MM-DD HH:mm:ss');
          };
          break;
        default:
          break;
      }
    });
  }

  shouldComponentUpdate(nextProps) {
    if (!this.props.visible && !nextProps.visible) {
      return false;
    }
    return true;
  }

  onClickCaptain(item, e) {
    let detail = this.refs.detail;
    let table = this.refs.table;
    let checked = table.state.checkedKey[item.order_id];

    if (checked) {
      table.setState({ checkedKey: {} });
      detail.close();
      this.stores.selected = null;
    } else {
      let checkedKey = {};
      checkedKey[item.order_id] = true;
      table.setState({
        checkedKey: checkedKey
      });

      // detail.open();
      this.stores.selected = item;
      this.onAction('detail', 'open', { data: item });
    }
  }

  onClickPagination(page, e) {
    this.onAction('pagination', 'jump', page);
  }

  onDetailAction(type, data) {
    if (type === 'close') {
      let table = this.refs.table;
      table.setState({ checkedKey: {} });
    } else if (type === 'pagination') {
      if (data) {
        data.item = this.stores.selected;
      }
      this.onAction('detail', type, data);
    }
  }

  onAction(field, actionType, data) {
    let func = this.props.onAction;
    func && func(field, actionType, this.refs, data);
  }

  render() {
    let config = this.props.config,
      table = config.table,
      pagi = table.pagination,
      detail = config.table.detail,
      detailContent = {
        table: detail.table,
        pagination: null
      };

    return (
      <div className="bill-record-main">
        <SelectList ref="select_list" __={__} onAction={this.onAction} />
        <div className="table-box">
          {
            !table.loading && !table.data.length ?
              <div className="table-with-no-data">
                <Table ref="table" column={table.column} data={[]} />
                <p>
                  {__.no_order_data}
                </p>
              </div>
            : <Table ref="table" {...table}/>
          }
          {
            !table.loading && pagi ?
              <div className="pagination-box">
                <span className="page-guide">{__.pages + ': ' + pagi.current + '/' + pagi.total + ' '
                  + __.total + ': ' + pagi.total_num}</span>
                <Pagination onClick={this.onClickPagination} current={pagi.current} total={pagi.total}/>
              </div>
              : null
          }
          {
            detail ?
              <Detail
                ref="detail"
                tabs={detail.tabs}
                content={detailContent}
                onDetailAction={this.onDetailAction} />
              : null
          }
        </div>
      </div>
    );
  }
}

module.exports = Main;
