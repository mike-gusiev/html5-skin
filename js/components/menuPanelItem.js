const React = require('react');
const AccessibleButton = require('./accessibleButton');
const Icon = require('./icon');
const classNames = require('classnames');
const PropTypes = require('prop-types');
const CONSTANTS = require('../constants/constants');

const MenuPanelItem = ({
  itemValue,
  selectedValue,
  itemLabel,
  ariaLabel,
  focusId,
  accentColor,
  showCheckmark,
  skinConfig,
  onClick,
}) => {
  const isSelected = itemValue === selectedValue;
  const showSelectedIcon = !showCheckmark && isSelected;

  const itemClassName = classNames('oo-menu-panel-item', {
    'oo-selected': isSelected
  });
  const buttonClassName = classNames('oo-menu-btn', {
    'oo-selected': isSelected
  });
  const buttonStyle = {
    color: isSelected ? accentColor : null
  };

  return (
    <li
      key={itemValue}
      className={itemClassName}
      role="presentation">
      <AccessibleButton
        className={buttonClassName}
        style={buttonStyle}
        focusId={focusId}
        role={CONSTANTS.ARIA_ROLES.MENU_ITEM_RADIO}
        ariaLabel={ariaLabel}
        ariaChecked={isSelected}
        onClick={() => onClick(itemValue)}>

        {showSelectedIcon &&
          <Icon
            skinConfig={skinConfig}
            icon="selected" />
        }

        <span>{itemLabel}</span>

      </AccessibleButton>
    </li>
  );
};

MenuPanelItem.propTypes = {
  itemValue: PropTypes.string.isRequired,
  selectedValue: PropTypes.string.isRequired,
  itemLabel: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  focusId: PropTypes.string.isRequired,
  accentColor: PropTypes.string,
  showCheckmark: PropTypes.bool,
  skinConfig: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

module.exports = MenuPanelItem;
