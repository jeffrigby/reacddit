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
    if (!this.props.disableHotKeys && this.props.listingsFilter.target !== 'friends') {
      const pressedKey = event.key;
      switch (pressedKey) {
        case 'H': {
          this.props.push(this.genLink('hot'));
          break;
        }
        case 'N': {
          this.props.push(this.genLink('new'));
          break;
        }
        case 'C': {
          this.props.push(this.genLink('controversial'));
          break;
        }
        case 'R': {
          this.props.push(this.genLink('rising'));
          break;
        }
        case 'T': {
          this.props.push(this.genLink('top'));
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
    return `/r/${this.props.listingsFilter.target}/${sort}`;
  }

  render() {
    if (this.props.listingsFilter.target === 'friends') {
      return false;
    }
    const currentSort = this.props.listingsFilter.sort ? this.props.listingsFilter.sort : 'hot';
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
          <li><Link to={this.genLink('hot')}>hot <span className="pull-right">(&#x21E7;S)</span></Link></li>
          <li><Link to={this.genLink('new')}>new <span className="pull-right">(&#x21E7;N)</span></Link></li>
          <li><Link to={this.genLink('top')}>top <span className="pull-right">(&#x21E7;T)</span></Link></li>
          <li><Link to={this.genLink('rising')}>rising <span className="pull-right">(&#x21E7;R)</span></Link></li>
          <li><Link to={this.genLink('controversial')}>controversial <span className="pull-right">(&#x21E7;C)</span></Link></li>
        </ul>
      </div>
    );
  }
}

Sort.propTypes = {
  listingsFilter: PropTypes.object.isRequired,
  disableHotKeys: PropTypes.bool.isRequired,
  push: PropTypes.func.isRequired,
};

Sort.defaultProps = {
};


const mapStateToProps = (state, ownProps) => ({
  listingsFilter: state.listingsFilter,
  disableHotKeys: state.disableHotKeys,
});

const mapDispatchToProps = dispatch => ({
  push: url => dispatch(push(url)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sort);
