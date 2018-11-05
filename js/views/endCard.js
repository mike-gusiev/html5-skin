/********************************************************************
 END CARD
 *********************************************************************/
var React = require('react'),
    ClassNames = require('classnames'),
    CONSTANTS = require('../constants/constants'),
    ControlBar = require('../components/controlBar'),
    Watermark = require('../components/watermark'),
    Icon = require('../components/icon');

var createReactClass = require('create-react-class');

var EndCard = createReactClass({

    getInitialState: function() {
        return {
            controlBarVisible: true,
        };

    },

    handleClick: function(event) {
        event.preventDefault();
        this.props.controller.togglePlayPause();
    },

    render: function() {
        var actionIconStyle = {
            color: this.props.skinConfig.endScreen.replayIconStyle.color,
            opacity: this.props.skinConfig.endScreen.replayIconStyle.opacity
        };

        var posterImage = this.props.contentTree.promo_image;
        posterImage = posterImage.replace(CONSTANTS.IMAGE_URLS.NATIVE, CONSTANTS.IMAGE_URLS.POSTER_CLOUDINARY);
        var posterStyle = {
            backgroundImage: "url('" + posterImage + "')"
        };
        var actionIconClass = ClassNames({
            'oo-action-icon': true,
            'oo-hidden': !this.props.skinConfig.endScreen.showReplayButton
        });
        return (
            <div className="oo-state-screen oo-end-card" style={posterStyle}>
                <div className="oo-underlay-gradient"/>

                <a className="oo-state-screen-selectable" onClick={this.handleClick}/>

                <Watermark {...this.props} controlBarVisible={this.state.controlBarVisible}/>

                <button
                    type="button"
                    className={actionIconClass}
                    onClick={this.handleClick}
                    aria-label={CONSTANTS.ARIA_LABELS.REPLAY}>
                    <Icon {...this.props} icon="replay" style={actionIconStyle}/>
                </button>

                <div className="oo-interactive-container">
                  <ControlBar
                      {...this.props}
                      height={this.props.skinConfig.controlBar.height}
                      animatingControlBar={true}
                      controlBarVisible={this.state.controlBarVisible}
                      playerState={this.props.playerState}
                      isLiveStream={this.props.isLiveStream}
                  />
                </div>

                {this.props.children}
            </div>
        );
    }
});

module.exports = EndCard;