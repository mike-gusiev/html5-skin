/********************************************************************
  CONTROL BAR
*********************************************************************/
var React = require('react'),
  ReactDOM = require('react-dom'),
  CONSTANTS = require('../constants/constants'),
  ClassNames = require('classnames'),
  ScrubberBar = require('./scrubberBar'),
  Slider = require('./slider'),
  Utils = require('./utils'),
  Popover = require('../views/popover'),
  AccessibleButton = require('./accessibleButton'),
  VolumeControls = require('./volumeControls'),
  VideoQualityPanel = require('./videoQualityPanel'),
  ClosedCaptionPopover = require('./closed-caption/closedCaptionPopover'),
  Logo = require('./logo'),
  Icon = require('./icon'),
  Tooltip = require('./tooltip');


var ControlBar = React.createClass({
  getInitialState: function () {
    this.isMobile = this.props.controller.state.isMobile;
    this.domNode = null;
    this.toggleButtons = {};
    this.responsiveUIMultiple = this.getResponsiveUIMultiple(this.props.responsiveView);
    this.moreOptionsItems = null;
    this.vr = null;
    if (this.props.controller && this.props.controller.videoVrSource && this.props.controller.videoVrSource.vr) {
      this.vr = this.props.controller.videoVrSource.vr;
    }
    return {};
  },

  componentDidMount: function () {
    window.addEventListener('orientationchange', this.closePopovers);
    window.addEventListener("orientationchange", this.setLandscapeScreenOrientation, false);
    document.addEventListener('keydown', this.handleControlBarKeyDown);
    this.restoreFocusedControl();
  },

  componentWillReceiveProps: function (nextProps) {
    // if responsive breakpoint changes
    if (nextProps.responsiveView != this.props.responsiveView) {
      this.responsiveUIMultiple = this.getResponsiveUIMultiple(nextProps.responsiveView);
    }
  },

  componentWillUnmount: function () {
    this.props.controller.cancelTimer();
    this.closePopovers();
    if (Utils.isAndroid()) {
      this.props.controller.hideVolumeSliderBar();
    }
    window.removeEventListener('orientationchange', this.closePopovers);
    window.removeEventListener("orientationchange", this.setLandscapeScreenOrientation);
    document.removeEventListener('keydown', this.handleControlBarKeyDown);
  },

  /**
   * Restores the focus of a previously selected control bar item.
   * This is needed as a workaround because switching between play and pause states
   * currently causes the control bar to re-render.
   * @private
   */
  restoreFocusedControl: function() {
    if (!this.props.controller.state.focusedControl || !this.domNode) {
      return;
    }
    var selector = '[' + CONSTANTS.KEYBD_FOCUS_ID_ATTR + '="' + this.props.controller.state.focusedControl + '"]';
    var control = this.domNode.querySelector(selector);

    if (control && typeof control.focus === 'function') {
      control.focus();
      // If we got to this point it means that play was triggered using the spacebar
      // (since a click would've cleared the focused element) and we need to
      // trigger control bar auto hide
      if (this.props.playerState === CONSTANTS.STATE.PLAYING) {
        this.props.controller.startHideControlBarTimer();
      }
    }
  },

  getResponsiveUIMultiple: function (responsiveView) {
    var multiplier = this.props.skinConfig.responsive.breakpoints[responsiveView].multiplier;
    return multiplier;
  },

  handleControlBarMouseUp: function (evt) {
    if (evt.type == 'touchend' || !this.isMobile) {
      evt.stopPropagation(); // W3C
      evt.cancelBubble = true; // IE
      this.props.controller.state.accessibilityControlsEnabled = true;
      this.props.controller.startHideControlBarTimer();
    }
  },

  handleFullscreenClick: function (evt) {
    // On mobile, we get a following click event that fires after the Video
    // has gone full screen, clicking on a different UI element. So we prevent
    // the following click.
    evt.stopPropagation();
    evt.cancelBubble = true;
    evt.preventDefault();
    if (this.props.controller) {
      this.props.controller.toggleFullscreen();
      if (this.vr && this.isMobile && this.props.controller.isVrStereo) {
        this.toggleStereoVr();
      }
    }
  },

  handleTheaterModeClick: function (evt) {
    evt.stopPropagation();
    evt.cancelBubble = true;
    evt.preventDefault();
    if (this.props.controller) {
      this.props.controller.toggleTheaterMode();
      if (this.vr && this.isMobile && this.props.controller.isVrStereo) {
        this.toggleStereoVr();
      }
    }
  },

  handleStereoVrClick: function (evt) {
    if (this.vr) {
      evt.stopPropagation();
      evt.cancelBubble = true;
      evt.preventDefault();

      this.toggleStereoVr();

      if (this.props.controller) {
        var fullscreen = false;
        //depends on the switching type

        if (this.props.controller.state.isFullScreenSupported ||
          this.props.controller.state.isVideoFullScreenSupported) {
          fullscreen = this.props.controller.state.fullscreen;
        } else {
          fullscreen = this.props.controller.state.isFullWindow;
        }

        if (!fullscreen && typeof this.props.controller.toggleFullscreen === "function") {
          this.props.controller.toggleFullscreen();
        }

        if (this.props.controller.isVrStereo) {
          this.props.controller.checkDeviceOrientation = true;
          this.setLandscapeScreenOrientation();
        } else {
          this.unlockScreenOrientation();
        }
      }
    }
  },

  /**
   * @description set landscape orientation if it is possible
   * @private
   */
  setLandscapeScreenOrientation: function() {
    if (this.props.controller && this.props.controller.checkDeviceOrientation) {
      if (Utils.setLandscapeScreenOrientation) {
        Utils.setLandscapeScreenOrientation();
      }
    }
  },

  /**
   * @description set possibility to use all orientations
   * @private
   */
  unlockScreenOrientation: function() {
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    } else if (screen.unlockOrientation) {
      screen.unlockOrientation();
    } else if (screen.mozUnlockOrientation) {
      screen.mozUnlockOrientation();
    } else if (screen.msUnlockOrientation) {
      screen.msUnlockOrientation();
    }
  },

  toggleStereoVr: function() {
    if (this.props.controller && typeof this.props.controller.toggleStereoVr === "function") {
      this.props.controller.toggleStereoVr();
    }
  },

  handleLiveClick: function (evt) {
    evt.stopPropagation();
    evt.cancelBubble = true;
    evt.preventDefault();
    this.props.controller.onLiveClick();
    this.props.controller.seek(this.props.duration);
  },

  handleVolumeIconClick: function (evt) {
    if (this.isMobile) {
      this.props.controller.startHideControlBarTimer();
      evt.stopPropagation(); // W3C
      evt.cancelBubble = true; // IE
      if (!this.props.controller.state.volumeState.volumeSliderVisible) {
        this.props.controller.showVolumeSliderBar();
      }
      else {
        this.props.controller.handleMuteClick();
      }
    }
    else {
      this.props.controller.handleMuteClick();
    }
  },

  handlePlayClick: function () {
    this.props.controller.togglePlayPause();
  },

  handleShareClick: function () {
    this.props.controller.toggleShareScreen();
  },

  handleQualityClick: function () {
    this.configureMenuAutofocus(CONSTANTS.MENU_OPTIONS.VIDEO_QUALITY);

    if (this.props.responsiveView == this.props.skinConfig.responsive.breakpoints.xs.id) {
      this.props.controller.toggleScreen(CONSTANTS.SCREEN.VIDEO_QUALITY_SCREEN);
    } else {
      this.togglePopover(CONSTANTS.MENU_OPTIONS.VIDEO_QUALITY);
      this.closeCaptionPopover();
    }
  },

  handleClosedCaptionClick: function () {
    this.configureMenuAutofocus(CONSTANTS.MENU_OPTIONS.CLOSED_CAPTIONS);

    if (this.props.responsiveView == this.props.skinConfig.responsive.breakpoints.xs.id) {
      this.props.controller.toggleScreen(CONSTANTS.SCREEN.CLOSEDCAPTION_SCREEN);
    } else {
      this.togglePopover(CONSTANTS.MENU_OPTIONS.CLOSED_CAPTIONS);
      this.closeQualityPopover();
    }
  },

  changeVolumeSlider: function(event) {
    var newVolume = parseFloat(event.target.value);
    this.props.controller.setVolume(newVolume);
    this.setState({
      volumeSliderValue: event.target.value
    });
  },

  configureMenuAutofocus: function(menu) {
    var menuOptions = this.props.controller.state[menu] || {};
    var menuToggleButton = this.toggleButtons[menu];

    if (menuOptions.showPopover) {
      // Reset autoFocus property when closing the menu
      menuOptions.autoFocus = false;
    } else if (menuToggleButton) {
      // If the menu was activated via keyboard we should
      // autofocus on the first element
      menuOptions.autoFocus = menuToggleButton.wasTriggeredWithKeyboard();
    }
  },

  closeQualityPopover: function (params) {
    this.closePopover(CONSTANTS.MENU_OPTIONS.VIDEO_QUALITY, params);
  },

  closeCaptionPopover: function (params) {
    this.closePopover(CONSTANTS.MENU_OPTIONS.CLOSED_CAPTIONS, params);
  },

  closePopover: function(menu, params) {
    params = params || {};
    var menuOptions = this.props.controller.state[menu];
    var menuToggleButton = this.toggleButtons[menu];

    if (menuOptions && menuOptions.showPopover) {
      // Re-focus on toggle button when closing the menu popover if the latter
      // was originally opened with a key press.
      if (
        params.restoreToggleButtonFocus &&
        menuToggleButton &&
        menuToggleButton.wasTriggeredWithKeyboard()
      ) {
        menuToggleButton.focus();
      }
      this.togglePopover(menu);
    }
  },

  togglePopover: function (menu) {
    var menuOptions = this.props.controller.state[menu];
    var menuToggleButton = this.toggleButtons[menu];
    // Reset button flag that tracks keyboard interaction
    if (
      menuToggleButton &&
      menuOptions &&
      menuOptions.showPopover
    ) {
      menuToggleButton.wasTriggeredWithKeyboard(false);
    }
    this.props.controller.togglePopover(menu);
  },

  closePopovers: function () {
    this.closeCaptionPopover();
    this.closeQualityPopover();
  },

  handleDiscoveryClick: function () {
    this.props.controller.toggleDiscoveryScreen();
  },

  handleMoreOptionsClick: function () {
    this.props.controller.toggleMoreOptionsScreen(this.moreOptionsItems);
  },

  //TODO(dustin) revisit this, doesn't feel like the "react" way to do this.
  highlight: function (evt) {
    if (!this.isMobile) {
      var iconElement = Utils.getEventIconElement(evt);
      if (iconElement) {
        var color = this.props.skinConfig.controlBar.iconStyle.active.color ? this.props.skinConfig.controlBar.iconStyle.active.color : this.props.skinConfig.general.accentColor;
        var opacity = this.props.skinConfig.controlBar.iconStyle.active.opacity;
        Utils.highlight(iconElement, opacity, color);
      }
    }
  },

  removeHighlight: function (evt) {
    var iconElement = Utils.getEventIconElement(evt);
    if (iconElement) {
      var color = this.props.skinConfig.controlBar.iconStyle.inactive.color;
      var opacity = this.props.skinConfig.controlBar.iconStyle.inactive.opacity;
      Utils.removeHighlight(iconElement, opacity, color);
    }
  },

  /**
   * Fires whenever an item is focused inside the control bar. Stores the id of
   * the focused control.
   * @private
   * @param {type} evt Focus event.
   */
  handleControlBarFocus: function(evt) {
    var focusId = evt.target ? evt.target.getAttribute(CONSTANTS.KEYBD_FOCUS_ID_ATTR) : null;
    if (focusId) {
      this.props.controller.state.focusedControl = focusId;
    }
  },

  /**
   * Clears the currently focused control.
   * @private
   */
  handleControlBarBlur: function(evt) {
    this.props.controller.state.focusedControl = null;
  },

  /**
   * Will handle the keydown event when the controlBar is active and it will restrict
   * tab navigation to elements that are within it when the player is in fullscreen mode.
   * Note that this only handles the edge cases that are needed in order to loop the tab
   * focus. Tabbing in between the elements is handled by the browser.
   * @private
   * @param {Object} evt Keydown event object.
   */
  handleControlBarKeyDown: function(evt) {
    if (
      evt.key !== CONSTANTS.KEY_VALUES.TAB ||
      !this.props.controller.state.fullscreen ||
      !this.domNode ||
      !evt.target
    ) {
      return;
    }
    // Focusable elements on the control bar (this.domNode) are expected to have the
    // data-focus-id attribute
    var focusableElements = this.domNode.querySelectorAll('[' + CONSTANTS.KEYBD_FOCUS_ID_ATTR + ']');

    if (focusableElements.length) {
      var firstFocusableElement = focusableElements[0];
      var lastFocusableElement = focusableElements[focusableElements.length - 1];
      // This indicates we're tabbing over the focusable control bar elements
      if (evt.target.hasAttribute(CONSTANTS.KEYBD_FOCUS_ID_ATTR)) {
        if (evt.shiftKey) {
          // Shift + tabbing on first element, focus on last
          if (evt.target === firstFocusableElement) {
            evt.preventDefault();
            lastFocusableElement.focus();
          }
        } else {
          // Tabbing on last element, focus on first
          if (evt.target === lastFocusableElement) {
            evt.preventDefault();
            firstFocusableElement.focus();
          }
        }
      // Keydown happened on a non-controlbar element
      } else {
        evt.preventDefault();

        if (evt.shiftKey) {
          lastFocusableElement.focus();
        } else {
          firstFocusableElement.focus();
        }
      }
    } else {
      OO.log('ControlBar: No focusable elements found');
    }
  },

  updateVolume: function (x, vol) {
    var volume = ReactDOM.findDOMNode(this.refs.volumeBar);
    var screenOffset = ReactDOM.findDOMNode(this).getBoundingClientRect() || { left: 0 };
    var percentage, volume_level;
    if (vol) {
      percentage = parseInt(vol * 100, 10);
      volume_level = parseFloat(vol);
    } else {
      var position = x - volume.offsetLeft - screenOffset.left;
      percentage = parseInt(100 * position / volume.clientWidth, 10);
      volume_level = parseFloat(position / volume.clientWidth);
    }
    if (percentage > 100) {
      volume_level = 1;
    }
    if (percentage < 10) {
      volume_level = 0;
    }

    this.props.controller.setVolume(volume_level);
  },

  onMouseDown: function (e) {
    this.props.controller.state.volumeState.volumeDrag = true;
    this.updateVolume(e.pageX);
  },

  onMouseUp: function (e) {
    if (this.props.controller.state.volumeState.volumeDrag) {
      this.props.controller.state.volumeState.volumeDrag = false;
      this.updateVolume(e.pageX);
    }
  },

  onMouseMove: function (e) {
    if (this.props.controller.state.volumeState.volumeDrag) {
      this.updateVolume(e.pageX);
    }
  },

  populateControlBar: function() {
    var dynamicStyles = this.setupItemStyle();
    var playIcon = "";
    if (this.props.playerState == CONSTANTS.STATE.PLAYING) {
      playIcon = "pause";
    } else if (this.props.playerState == CONSTANTS.STATE.END) {
      playIcon = "replay";
    } else {
      playIcon = "play";
    }

    var volumeIcon = (this.props.controller.state.volumeState.muted ? "volumeOff" : "volume");
    var theaterModeIcon = (this.props.controller.state.theatermode ? "theaterOff" : "theaterOn");

    var fullscreenIcon = "";
    if (this.props.controller.state.fullscreen) {
      fullscreenIcon = "compress"
    }
    else {
      fullscreenIcon = "expand";
      fullscreenAriaLabel = CONSTANTS.ARIA_LABELS.FULLSCREEN;
    }

    var stereoIcon, stereoAriaLabel;
    if (this.vr) {
      stereoIcon = "stereoOff";
      stereoAriaLabel = CONSTANTS.ARIA_LABELS.STEREO_OFF;
      if (this.props.controller && this.props.controller.isVrStereo) {
        stereoIcon = "stereoOn";
        stereoAriaLabel = CONSTANTS.ARIA_LABELS.STEREO_ON;
      }
    }

    var totalTime = 0;
    if (this.props.duration == null || typeof this.props.duration == 'undefined' || this.props.duration == ""){
      totalTime = Utils.formatSeconds(0);
    }
    else {
      totalTime = Utils.formatSeconds(this.props.duration);
    }

    var volumeBars = [];
    this.volumeDrag = false;
    var turnedOn = this.props.controller.state.volumeState.volume >= 1 / 10;
    var volumeClass = ClassNames({
      "volume": true
    });
    var barStyle = turnedOn ? {backgroundColor: this.props.skinConfig.controlBar.volumeControl.color} : null;
    var spanStyle = {width: this.props.controller.state.volumeState.volume * 100 + '%'};
    volumeBars.push(<div className={volumeClass}
                         style={barStyle}
                         key="0"
                         ref="volumeBar"
                         onMouseDown={this.onMouseDown}
                         onMouseUp={this.onMouseUp}
                         onMouseMove={this.onMouseMove}
    ><span style={spanStyle}/></div>);
    var volumeSlider = (
      <div className="oo-volume-slider">
        <Slider value={parseFloat(this.props.controller.state.volumeState.volume)}
          onChange={this.changeVolumeSlider}
          className={"oo-slider oo-slider-volume"}
          itemRef={"volumeSlider"}
          minValue={0}
          maxValue={1}
          step={0.1}/>
      </div>
    );

    var volumeControls;
    if (!this.isMobile){
      volumeControls = volumeBars;
    }
    else {
      volumeControls = this.props.controller.state.volumeState.volumeSliderVisible ? volumeSlider : null;
    }

    var playheadTime = isFinite(parseInt(this.props.currentPlayhead)) ? Utils.formatSeconds(parseInt(this.props.currentPlayhead)) : null;
    var isLiveStream = this.props.isLiveStream;
    var durationSetting = {color: this.props.skinConfig.controlBar.iconStyle.inactive.color ?
                          this.props.skinConfig.controlBar.iconStyle.inactive.color : this.props.skinConfig.general.accentColor};
    var timeShift = this.props.currentPlayhead - this.props.duration;
    // checking timeShift < 1 seconds (not == 0) as processing of the click after we rewinded and then went live may take some time
    var isLiveNow = Math.abs(timeShift) < 1;
    var liveClick = isLiveNow ? null : this.handleLiveClick;
    var playheadTimeContent = isLiveStream ? (isLiveNow ? null : Utils.formatSeconds(timeShift)) : playheadTime;
    var totalTimeContent = isLiveStream ? null : <span className="oo-total-time" style = {durationSetting}>{totalTime}</span>;

    // TODO: Update when implementing localization
    var liveText = Utils.getLocalizedString(this.props.language, CONSTANTS.SKIN_TEXT.LIVE, this.props.localizableStrings);

    var liveClass = ClassNames({
      "oo-control-bar-item oo-live oo-live-indicator": true,
      "oo-live-nonclickable": isLiveNow
    });

    var videoQualityPopover = this.props.controller.state.videoQualityOptions.showVideoQualityPopover ? <Popover><VideoQualityPanel{...this.props} togglePopoverAction={this.toggleQualityPopover} popover={true}/></Popover> : null;
    var closedCaptionPopover = this.props.controller.state.closedCaptionOptions.showClosedCaptionPopover ? <Popover popoverClassName="oo-popover oo-popover-pull-right"><ClosedCaptionPopover {...this.props} togglePopoverAction={this.toggleCaptionPopover}/></Popover> : null;

    var qualityClass = ClassNames({
      "oo-quality": true,
      "oo-control-bar-item": true,
      "oo-selected": this.props.controller.state.videoQualityOptions.showVideoQualityPopover
    });

    var captionClass = ClassNames({
      "oo-closed-caption": true,
      "oo-control-bar-item": true,
      "oo-selected": this.props.controller.state.closedCaptionOptions.showClosedCaptionPopover
    });

    var selectedStyle = {};
    selectedStyle["color"] = this.props.skinConfig.general.accentColor ? this.props.skinConfig.general.accentColor : null;

    var controlItemTemplates = {
      "playPause": <a className="oo-play-pause oo-control-bar-item" onClick={this.handlePlayClick} key="playPause">
        <Icon {...this.props} icon={playIcon}
          style={dynamicStyles.iconCharacter}
          onMouseOver={this.highlight} onMouseOut={this.removeHighlight}/>
      </a>,

      "live": <a className={liveClass}
        ref="LiveButton"
        onClick={liveClick} key="live">
        <div className="oo-live-circle"></div>
        <span className="oo-live-text">{liveText}</span>
      </a>,

      "volume": <div className="oo-volume oo-control-bar-item" key="volume">
        <Icon {...this.props} icon={volumeIcon} ref="volumeIcon"
          style={this.props.skinConfig.controlBar.iconStyle.inactive}
          onClick={this.handleVolumeIconClick}
          onMouseOver={this.volumeHighlight} onMouseOut={this.volumeRemoveHighlight}/>
        {volumeControls}
      </div>,

      "timeDuration": <a className="oo-time-duration oo-control-bar-duration" style={durationSetting} key="timeDuration">
        <span>{playheadTimeContent}</span>{totalTimeContent}
      </a>,

      "flexibleSpace": <div className="oo-flexible-space oo-control-bar-flex-space" key="flexibleSpace"></div>,

      "moreOptions": <a className="oo-more-options oo-control-bar-item"
        onClick={this.handleMoreOptionsClick} key="moreOptions">
        <Icon {...this.props} icon="ellipsis" style={dynamicStyles.iconCharacter}
          onMouseOver={this.highlight} onMouseOut={this.removeHighlight}/>
      </a>,

      "quality": (
        <div className="oo-popover-button-container" key="quality">
          {videoQualityPopover}
          <a className={qualityClass} onClick={this.handleQualityClick} style={selectedStyle}>
            <Icon {...this.props} icon="quality" style={dynamicStyles.iconCharacter}
              onMouseOver={this.highlight} onMouseOut={this.removeHighlight}/>
          </a>
        </div>
      ),

      "discovery": <a className="oo-discovery oo-control-bar-item"
        onClick={this.handleDiscoveryClick} key="discovery">
        <Icon {...this.props} icon="discovery" style={dynamicStyles.iconCharacter}
          onMouseOver={this.highlight} onMouseOut={this.removeHighlight}/>
      </a>,

      "closedCaption": (
        <div className="oo-popover-button-container" key="closedCaption">
          <AccessibleButton
            ref={function(e) { this.toggleButtons[CONSTANTS.MENU_OPTIONS.CLOSED_CAPTIONS] = e }.bind(this)}
            style={selectedStyle}
            className={captionClass}
            focusId={CONSTANTS.FOCUS_IDS.CLOSED_CAPTIONS}
            ariaLabel={CONSTANTS.ARIA_LABELS.CLOSED_CAPTIONS}
            ariaHasPopup={true}
            ariaExpanded={this.props.controller.state.closedCaptionOptions.showPopover ? true : null}
            onClick={this.handleClosedCaptionClick}>
            <Icon {...this.props} icon="cc" style={dynamicStyles.iconCharacter}
                  onMouseOver={this.highlight} onMouseOut={this.removeHighlight}/>
          </AccessibleButton>
          {this.props.controller.state.closedCaptionOptions.showPopover &&
            <Popover
              popoverClassName="oo-popover oo-popover-pull-right"
              autoFocus={this.props.controller.state.closedCaptionOptions.autoFocus}
              closeActionEnabled={this.props.controller.state.accessibilityControlsEnabled}
              closeAction={this.closeCaptionPopover}>
              <ClosedCaptionPopover {...this.props} togglePopoverAction={this.closeCaptionPopover} />
            </Popover>
          }
        </div>
      ),

      "share": <a className="oo-share oo-control-bar-item"
        onClick={this.handleShareClick} key="share">
        <Icon {...this.props} icon="share" style={dynamicStyles.iconCharacter}
          onMouseOver={this.highlight} onMouseOut={this.removeHighlight}/>
      </a>,

      "theater": <a className="oo-theater oo-control-bar-item"
    onClick={this.handleTheaterModeClick} key="theater">
      <Icon {...this.props} icon={theaterModeIcon} style={dynamicStyles.iconCharacter}
    onMouseOver={this.highlight} onMouseOut={this.removeHighlight}/>
    </a>,

      "fullscreen": <a className="oo-fullscreen oo-control-bar-item"
        onClick={this.handleFullscreenClick} key="fullscreen">
        <Icon {...this.props} icon={fullscreenIcon} style={dynamicStyles.iconCharacter}
          onMouseOver={this.highlight} onMouseOut={this.removeHighlight}/>
      </a>,

      "logo": <Logo key="logo" imageUrl={this.props.skinConfig.controlBar.logo.imageResource.url}
        clickUrl={this.props.skinConfig.controlBar.logo.clickUrl}
        target={this.props.skinConfig.controlBar.logo.target}
        width={this.props.responsiveView != this.props.skinConfig.responsive.breakpoints.xs.id ? this.props.skinConfig.controlBar.logo.width : null}
        height={this.props.skinConfig.controlBar.logo.height}/>
    };

    var controlBarItems = [];

    var defaultItems = this.props.controller.state.isPlayingAd ? this.props.skinConfig.buttons.desktopAd : this.props.skinConfig.buttons.desktopContent;

    //if mobile and not showing the slider or the icon, extra space can be added to control bar width. If volume bar is shown instead of slider, add some space as well:
    var volumeItem = null;
    var extraSpaceVolume = 0;

    for (var j = 0; j < defaultItems.length; j++) {
      if (defaultItems[j].name == "volume") {
        volumeItem = defaultItems[j];

        var extraSpaceVolumeSlider = (((volumeItem && this.isMobile && !this.props.controller.state.volumeState.volumeSliderVisible) || volumeItem && Utils.isIos()) ? parseInt(volumeItem.minWidth) : 0);
        var extraSpaceVolumeBar = this.isMobile ? 0 : parseInt(volumeItem.minWidth)/2;
        extraSpaceVolume = extraSpaceVolumeSlider + extraSpaceVolumeBar;

        break;
      }
    }


    //if no hours, add extra space to control bar width:
    var hours = parseInt(this.props.duration / 3600, 10);
    var extraSpaceDuration = (hours > 0) ? 0 : 45;

    var controlBarLeftRightPadding = CONSTANTS.UI.DEFAULT_SCRUBBERBAR_LEFT_RIGHT_PADDING * 2;

    for (var k = 0; k < defaultItems.length; k++) {

      //filter out unrecognized button names
      if (typeof controlItemTemplates[defaultItems[k].name] === "undefined") {
        continue;
      }

      //filter out disabled buttons
      if (defaultItems[k].location === "none") {
        continue;
      }

      //do not show share button if not share options are available
      if (defaultItems[k].name === "share") {
        var shareContent = Utils.getPropertyValue(this.props.skinConfig, 'shareScreen.shareContent', []);
        var socialContent = Utils.getPropertyValue(this.props.skinConfig, 'shareScreen.socialContent', []);
        var onlySocialTab = shareContent.length === 1 && shareContent[0] === 'social';
        //skip if no tabs were specified or if only the social tab is present but no social buttons are specified
        if (this.props.controller.state.isOoyalaAds || !shareContent.length || (onlySocialTab && !socialContent.length)) {
          continue;
        }
      }

      //do not show CC button if no CC available
      if (!this.props.controller.state.closedCaptionOptions.availableLanguages && (defaultItems[k].name === "closedCaption")){
        continue;
      }

      //do not show quality button if no bitrates available
      if (defaultItems[k].name === "quality"){
        continue;
      }

      //do not show discovery button if no related videos available
      if (!this.props.controller.state.discoveryData && (defaultItems[k].name === "discovery")){
        continue;
      }

      //do not show logo if no image url available
      if (!this.props.skinConfig.controlBar.logo.imageResource.url && (defaultItems[k].name === "logo")){
        continue;
      }

      if (Utils.isIos() && (defaultItems[k].name === "volume") && !this.vr) {
        continue;
      }

      //not sure what to do when there are multi streams
      if (defaultItems[k].name === "live" &&
        (typeof this.props.isLiveStream === 'undefined' ||
          !(this.props.isLiveStream))) {
        continue;
      }

      controlBarItems.push(defaultItems[k]);
    }

    var collapsedResult = Utils.collapse(this.props.componentWidth, controlBarItems, this.responsiveUIMultiple);
    var collapsedControlBarItems = collapsedResult.fit;
    var collapsedMoreOptionsItems = collapsedResult.overflow;
    this.moreOptionsItems = collapsedMoreOptionsItems;

    finalControlBarItems = [];

    for (var k = 0; k < collapsedControlBarItems.length; k++) {
      if (collapsedControlBarItems[k].name === "moreOptions" && collapsedMoreOptionsItems.length === 0) {
        continue;
      }

      finalControlBarItems.push(controlItemTemplates[collapsedControlBarItems[k].name]);
    }

    return finalControlBarItems;
  },

  setupItemStyle: function() {
    var returnStyles = {};

    returnStyles.iconCharacter = {
      color: this.props.skinConfig.controlBar.iconStyle.inactive.color,
      opacity: this.props.skinConfig.controlBar.iconStyle.inactive.opacity

    };
    return returnStyles;
  },

  render: function () {
    var controlBarClass = ClassNames({
      "oo-control-bar": true,
      "oo-control-bar-hidden": !this.props.controlBarVisible
    });

    var controlBarItems = this.populateControlBar();
    var controlBarStyle = {
      height: this.props.skinConfig.controlBar.height
    };

    return (
      <div className={controlBarClass} style={controlBarStyle} onMouseUp={this.handleControlBarMouseUp} onTouchEnd={this.handleControlBarMouseUp}>
        <ScrubberBar {...this.props} />

        <div className="oo-control-bar-items-wrapper">
          {controlBarItems}
        </div>
      </div>
    );
  }
});

ControlBar.defaultProps = {
  isLiveStream: false,
  skinConfig: {
    responsive: {
      breakpoints: {
        xs: { id: 'xs' },
        sm: { id: 'sm' },
        md: { id: 'md' },
        lg: { id: 'lg' }
      }
    }
  },
  responsiveView: 'md'
};

module.exports = ControlBar;
