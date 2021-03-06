/** ******************************************************************
  ERROR SCREEN
*********************************************************************/
var React = require('react');
var ClassNames = require('classnames');
var CONSTANTS = require('../constants/constants');
var Utils = require('../components/utils');
var AccessibilityMixin = require('../mixins/accessibilityMixin');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');

var ErrorScreen = createReactClass({
  mixins: [AccessibilityMixin],

  render: function() {
    var errorTitle;
    var errorDescription;
    var errorAction;
    if (CONSTANTS.ERROR_MESSAGE.hasOwnProperty(this.props.errorCode.code)) {
      var errorAction = CONSTANTS.SKIN_TEXT.ERROR_ACTION;
      if (CONSTANTS.ERROR_MESSAGE[this.props.errorCode.code].action) {
        errorAction = CONSTANTS.ERROR_MESSAGE[this.props.errorCode.code].action;
      }

      errorTitle = Utils.getLocalizedString(
        this.props.language,
        CONSTANTS.ERROR_MESSAGE[this.props.errorCode.code].title,
        this.props.localizableStrings
      );

      errorDescription = Utils.getLocalizedString(
        this.props.language,
        CONSTANTS.ERROR_MESSAGE[this.props.errorCode.code].description,
        this.props.localizableStrings
      );

      // / TODO - need to make countdown functionality display for all languages
      var startTime = this.props.errorCode.flight_start_time;
      if (
        this.props.errorCode.code === CONSTANTS.ERROR_CODE.FUTURE &&
        this.props.language === CONSTANTS.LANGUAGE.ENGLISH &&
        startTime !== null &&
        !isNaN(startTime)
      ) {
        errorDescription =
          'This video will be available in ' + Utils.getStartCountdown(startTime * 1000 - Date.now());
      }
      errorAction = Utils.getLocalizedString(this.props.language, errorAction, this.props.localizableStrings);
    } else {
      errorDescription = Utils.getLocalizedString(
        this.props.language,
        CONSTANTS.SKIN_TEXT.UNKNOWN_ERROR,
        this.props.localizableStrings
      );
      errorTitle = null;
      errorAction = null;
    }

    var errorContentClass = ClassNames({
      'oo-error-content': true,
      'oo-center-block': true
    });

    return (
      <div className="oo-state-screen oo-error-screen">
        <div className={errorContentClass}>
          <div className="oo-error-title oo-text-uppercase">{errorTitle}</div>
          <div className="oo-error-description">{errorDescription}</div>
          <div className="oo-error-action oo-text-uppercase">{errorAction}</div>
        </div>
      </div>
    );
  }
});

ErrorScreen.propTypes = {
  controller: PropTypes.shape({
    state: PropTypes.shape({
      accessibilityControlsEnabled: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  errorCode: PropTypes.shape({
    code: PropTypes.string
  }).isRequired,
  language: PropTypes.string,
  localizableStrings: PropTypes.object
};

ErrorScreen.defaultProps = {
  controller: {
    state: {
      accessibilityControlsEnabled: true
    }
  }
};

module.exports = ErrorScreen;
