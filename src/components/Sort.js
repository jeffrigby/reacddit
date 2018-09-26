import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';

/**
 * Import all actions as an object.
 */

class Sort extends React.Component {
  constructor(props) {
    super(props);
    this.handleSortHotkey = this.handleSortHotkey.bind(this);
    this.genLink = this.genLink.bind(this);
    this.lastKeyPressed = null;
  }

  componentDidMount() {
    jQuery(document).keypress(this.handleSortHotkey);
  }

  handleSortHotkey(event) {
    const { disableHotKeys, listingsFilter, ...props } = this.props;
    if (!disableHotKeys && listingsFilter.target !== 'friends') {
      const pressedKey = event.key;
      switch (pressedKey) {
        case 'H': {
          props.push(this.genLink('hot'));
          break;
        }
        case 'B': {
          props.push(this.genLink('best'));
          break;
        }
        case 'N': {
          props.push(this.genLink('new'));
          break;
        }
        case 'C': {
          props.push(this.genLink('controversial'));
          break;
        }
        case 'R': {
          props.push(this.genLink('rising'));
          break;
        }
        case 'T': {
          props.push(this.genLink('top'));
          break;
        }
        default:
          break;
      }
      this.lastKeyPressed = pressedKey;
    } else {
      this.lastKeyPressed = '';
    }
  }

  genLink(sort) {
    const { listingsFilter } = this.props;
    let link;
    if (listingsFilter.listType === 'r') {
      link = `/r/${listingsFilter.target}/${sort}`;
    } else if (listingsFilter.listType === 'm') {
      link = `/user/${listingsFilter.target}/m/${
        listingsFilter.userType
      }/${sort}`;
    }
    return link;
  }

  render() {
    const { listingsFilter, subreddits } = this.props;
    if (
      listingsFilter.target === 'friends' ||
      listingsFilter.listType === 'u' ||
      subreddits.status !== 'loaded'
    ) {
      return false;
    }
    const currentSort = listingsFilter.sort ? listingsFilter.sort : 'hot';
    return (
      <div style={{ display: 'inline-block' }}>
        <button
          type="button"
          className="btn btn-default btn-xs dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <span className="glyphicon glyphicon-time" />
          <span className="dropdownActive"> {currentSort} </span>
          <span className="caret" />
        </button>
        <ul className="dropdown-menu" aria-labelledby="sortDropdownMenu">
          <li>
            <Link to={this.genLink('hot')}>hot</Link>
            <span className="menu-shortcut">&#x21E7;H</span>
          </li>
          <li>
            <Link to={this.genLink('best')}>best</Link>
            <span className="menu-shortcut">&#x21E7;B</span>
          </li>
          <li>
            <Link to={this.genLink('new')}>new</Link>
            <span className="menu-shortcut">&#x21E7;N</span>
          </li>
          <li>
            <Link to={this.genLink('top')}>top</Link>
            <span className="menu-shortcut">&#x21E7;T</span>
          </li>
          <li>
            <Link to={this.genLink('rising')}>rising</Link>
            <span className="menu-shortcut">&#x21E7;R</span>
          </li>
          <li>
            <Link to={this.genLink('controversial')}>controversial</Link>
            <span className="menu-shortcut">&#x21E7;C</span>
          </li>
        </ul>
      </div>
    );
  }
}

Sort.propTypes = {
  listingsFilter: PropTypes.object.isRequired,
  subreddits: PropTypes.object.isRequired,
  disableHotKeys: PropTypes.bool.isRequired,
  push: PropTypes.func.isRequired,
};

Sort.defaultProps = {};

const mapStateToProps = (state, ownProps) => ({
  listingsFilter: state.listingsFilter,
  subreddits: state.subreddits,
  disableHotKeys: state.disableHotKeys,
});

const mapDispatchToProps = dispatch => ({
  push: url => dispatch(push(url)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sort);
