/********************************************************************
 SHARE PANEL
 *********************************************************************/
/**
 * Panel component for Share Screen.
 *
 * @class SharePanel
 * @constructor
 */
var React = require('react'),
    Utils = require('./utils'),
    Clipboard = require('clipboard'),
    CONSTANTS = require('../constants/constants');

var SharePanel = React.createClass({
  tabs: {SHARE: "share", EMBED: "embed"},

  getInitialState: function() {
    return {
      activeTab: this.tabs.SHARE,
      hasError: false,
      startValue: '00:00',
      embedValue: '00:00',
      startLink: '',
      embedLink: '',
      startTime: '00:00',
      embedTime: '00:00'
    };
  },

  getTimeInSeconds: function (x) {
    var time = x.match(/(\d{1,2}):(\d{1,2})/);
    if (time) {
      return parseInt(time[1], 10) * 60 + parseInt(time[2], 10);
    }
    return 0;
  },

  getTimeString: function (x) {
    var seconds = parseInt(x, 10);
    var minutes = parseInt(seconds / 60, 10);
    seconds -= minutes * 60;
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
  },

  getPgatourPanel: function (titleString, iframeURL) {
    var shareLink = location.href.replace(location.hash, '').replace(location.search, '') + this.state.startLink;
    if (Utils.isIframe()) {
      shareLink = this.props.contentTree.hostedAtURL + this.state.startLink;
    }
    if (this.state.embedLink) {
      iframeURL = iframeURL.replace(/'>(\s)*<\/iframe>/, this.state.embedLink + "'></iframe>");
      iframeURL = iframeURL.replace(/">(\s)*<\/iframe>/, this.state.embedLink + '"></iframe>');
    }

    return (
      <div className="oo-share-tab-panel pgatour">
        <div className="oo-social-action-text oo-text-uppercase" >{titleString}</div>
        <div className="oo-share-url">
          <div className="oo-start-at-line">
            <label><input className="oo-share-checkbox" ref="startTime" id="startTime" type="checkbox"
                          onChange={this.handleTimeCheckbox} /> Start at</label>
            <input className="oo-share-input-time" rel="startTime" type="text" value={this.state.startValue}
                   maxLength="5" onChange={this.handleInputChange} onBlur={this.handleTimeChange} />
          </div>
          <div className="oo-share-url-line">
            <input className="oo-share-link-copy" type="button" value="Copy" />
            <input className="oo-share-link-input" type="text" readOnly value={shareLink} />
          </div>
        </div>
        <a className="oo-pgatour-facebook" onClick={this.handleFacebookClick}> </a>
        <a className="oo-pgatour-twitter" onClick={this.handleTwitterClick}> </a>
        <div className="oo-share-url">
          <div className="oo-start-at-line">
            <span>Embed Code</span>
            <label><input className="oo-share-checkbox" ref="embedTime" id="embedTime" type="checkbox"
                          onChange={this.handleTimeCheckbox} /> Start at</label>
            <input className="oo-share-input-time" rel="embedTime" type="text" value={this.state.embedValue}
                   maxLength="5" onChange={this.handleInputChange} onBlur={this.handleTimeChange} />
          </div>
          <div className="oo-share-url-line">
            <input className="oo-share-link-copy" type="button" value="Copy" />
            <input className="oo-share-link-input" type="text" readOnly value={iframeURL} />
          </div>
        </div>
      </div>
    );
  },

  getActivePanel: function() {
    var titleString = Utils.getLocalizedString(this.props.language, CONSTANTS.SKIN_TEXT.SHARE_CALL_TO_ACTION, this.props.localizableStrings);

    try {
      var iframeURL = this.props.skinConfig.shareScreen.embed.source
          .replace("<ASSET_ID>", this.props.assetId)
          .replace("<PLAYER_ID>", this.props.playerParam.playerBrandingId)
          .replace("<PUBLISHER_ID>", this.props.playerParam.pcode);
    } catch(err) {
      iframeURL = "";
    }

    if (this.props.pgatourShare) {
      return this.getPgatourPanel(titleString, iframeURL);
    }

    return (
        <div className="oo-share-tab-panel">
          <div className="oo-social-action-text oo-text-uppercase">{titleString}</div>
          <a className="oo-twitter" onClick={this.handleTwitterClick}> </a>
          <a className="oo-facebook" onClick={this.handleFacebookClick}> </a>
          <a className="oo-google-plus" onClick={this.handleGPlusClick}> </a>
          <a className="oo-email-share" onClick={this.handleEmailClick}> </a>
          <textarea className="oo-form-control oo-embed-form" rows="3" value={iframeURL} readOnly />
        </div>
    );
  },

  setNewTime: function (event, timeString) {
    if (event.target.getAttribute('rel') === 'startTime') {
      if (!timeString) {
        this.setState( { startValue: this.state.startTime } );
        return;
      }
      timeString = this.getTimeString(this.getTimeInSeconds(timeString));
      this.setState( {
        startTime: timeString,
        startValue: timeString
      } );
      if (this.refs.startTime.checked) {
        this.setState( { startLink: '?ootime=' + this.getTimeInSeconds(timeString) } );
      }
    }
    if (event.target.getAttribute('rel') === 'embedTime') {
      if (!timeString) {
        this.setState( { embedValue: this.state.embedTime } );
        return;
      }
      timeString = this.getTimeString(this.getTimeInSeconds(timeString));
      this.setState( {
        embedTime: timeString,
        embedValue: timeString
      } );
      if (this.refs.embedTime.checked) {
        this.setState( { embedLink: '&options[initialTime]=' + this.getTimeInSeconds(timeString) } );
      }
    }
  },

  handleEmailClick: function(event) {
    event.preventDefault();
    var emailBody = Utils.getLocalizedString(this.props.language, CONSTANTS.SKIN_TEXT.EMAIL_BODY, this.props.localizableStrings);
    var mailToUrl = "mailto:";
    mailToUrl += "?subject=" + encodeURIComponent(this.props.contentTree.title);
    mailToUrl += "&body=" + encodeURIComponent(emailBody + location.href);
    //location.href = mailToUrl; //same window
    var emailWindow = window.open(mailToUrl, "email", "height=315,width=780"); //new window
    setTimeout(function(){
      try {
         // If we can't access href, a web client has taken over and this will throw
         // an exception, preventing the window from being closed.
        var test = emailWindow.location.href;
        emailWindow.close()
      } catch(e) {};
      // Generous 2 second timeout to give the window time to redirect if it's going to a web client
    }, 2000);
  },

  handleFacebookClick: function() {
    var facebookUrl = "http://www.facebook.com/sharer.php";
    facebookUrl += "?u=" + encodeURIComponent(location.href);
    window.open(facebookUrl, "facebook window", "height=315,width=780");
  },

  handleGPlusClick: function() {
    var gPlusUrl = "https://plus.google.com/share";
    gPlusUrl += "?url=" + encodeURIComponent(location.href);
    window.open(gPlusUrl, "google+ window", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600");
  },

  handleTwitterClick: function() {
    var twitterUrl = "https://twitter.com/intent/tweet";
    twitterUrl += "?text=" + encodeURIComponent(this.props.contentTree.title+": ");
    twitterUrl += "&url=" + encodeURIComponent(location.href);
    window.open(twitterUrl, "twitter window", "height=300,width=750");
  },

  handleTimeCheckbox: function (event) {
    if (event.target.id === 'startTime') {
      if (event.target.checked) {
        this.setState( { startLink: '?ootime=' + this.getTimeInSeconds(this.state.startTime) } );
      } else {
        this.setState( { startLink: '' } );
      }
    }
    if (event.target.id === 'embedTime') {
      if (event.target.checked) {
        this.setState( { embedLink: '&options[initialTime]=' + this.getTimeInSeconds(this.state.embedTime) } );
      } else {
        this.setState( { embedLink: '' } );
      }
    }
  },

  handleTimeChange: function (event) {
    var timeString = event.target.value;
    var time = timeString.match(/(\d{1,2}):(\d{1,2})/);
    if (time) {
      if (parseInt(time[2], 10) > 60) {
        timeString = time[1] + ':60';
      }
      if (this.getTimeInSeconds(timeString) > this.props.controller.state.duration) {
        timeString = this.getTimeString(this.props.controller.state.duration);
      }
      this.setNewTime(event, timeString);
    } else {
      this.setNewTime(event, '');
    }
  },

  handleInputChange: function (event) {
    if (event.target.getAttribute('rel') === 'startTime') {
      this.setState( { startValue: event.target.value } );
    }
    if (event.target.getAttribute('rel') === 'embedTime') {
      this.setState( { embedValue: event.target.value } );
    }
  },

  render: function() {
    return (
      <div className="oo-content-panel oo-share-panel">
        {this.getActivePanel()}
      </div>
    );
  },

  componentDidMount: function () {
    if (this.clipboard) {
      this.clipboard.destroy();
    }
    this.clipboard = new Clipboard('.oo-share-link-copy', {
      text: function(trigger) {
        return trigger.nextElementSibling.value;
      }
    });
  }

});

SharePanel.defaultProps = {
  contentTree: {
    title: ''
  },
  pgatourShare: true
};

module.exports = SharePanel;