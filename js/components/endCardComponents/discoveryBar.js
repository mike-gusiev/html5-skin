/**
 * Bar component for endCard Screen
 *
 * @module DiscoverBar
 */
var React = require('react'),
    ReactDOM = require('react-dom'),
    ClassNames = require('classnames'),
    CONSTANTS = require('../../constants/constants'),
    Clock = require('./clock'),
    DiscoverItem = require('./discoverItem'),
    ResizeMixin = require('../../mixins/resizeMixin'),
    Icon = require('../../components/icon');

var DiscoverBar = React.createClass({
    mixins: [ResizeMixin],

    getInitialState: function() {
        return {
            showDiscoveryCountDown: this.props.skinConfig.discoveryScreen.showCountDownTimerOnEndScreen || this.props.forceCountDownTimer,
            componentHeight: null
        };
    },

    componentDidMount: function () {
        this.detectHeight();
    },

    handleResize: function(nextProps) {
        this.detectHeight();
    },

    handleDiscoveryContentClick: function(index) {
        var eventData = {
            "clickedVideo": this.props.discoveryData.relatedVideos[index],
            "custom": this.props.discoveryData.custom
        };
        this.props.controller.sendDiscoveryClickEvent(eventData, false);
    },

    shouldShowCountdownTimer: function() {
        return this.state.showDiscoveryCountDown && this.props.playerState === CONSTANTS.STATE.END;
    },

    handleDiscoveryCountDownClick: function(event) {
        event.preventDefault();
        this.setState({
            showDiscoveryCountDown: false
        });
        this.refs.Clock.handleClick(event);
    },

    detectHeight: function() {
        var discoverBar = ReactDOM.findDOMNode(this.refs.discoverBar);
        this.setState({
            componentHeight: discoverBar.getBoundingClientRect().height
        });
    },

    render: function() {
        var clockWidth = 65;
        var relatedVideos = this.props.discoveryData.relatedVideos;

        if (relatedVideos.length < 1) {
            // TODO: get msg if no discovery related videos
        }

        if (this.props.responsiveView === 'sm' || this.props.responsiveView === 'xs') {
            clockWidth = 36;
        }

        var currentViewSize = this.props.responsiveView;
        var videosPerPage = this.props.videosPerPage[currentViewSize];
        var relatedVideoPage = relatedVideos.slice(0, videosPerPage);

        var discoveryContentName = ClassNames({
            'oo-discovery-content-name': true,
            'oo-hidden': !this.props.skinConfig.discoveryScreen.contentTitle.show
        });
        var discoveryCountDownWrapperStyle = ClassNames({
            'oo-discovery-count-down-wrapper-style': true,
            'oo-hidden': !this.state.showDiscoveryCountDown
        });
        var discoveryToaster = ClassNames({
            'oo-discovery-toaster-container-style': false,
            'oo-flexcontainer': true,
            'oo-scale-size': (this.props.responsiveView == this.props.skinConfig.responsive.breakpoints.xs.id && (this.props.componentWidth <= 420 || this.state.componentHeight <= 175)) || (this.props.responsiveView == this.props.skinConfig.responsive.breakpoints.sm.id && (this.props.componentWidth <= 420 || this.state.componentHeight <= 320))
        });
        var countDownClock = this.shouldShowCountdownTimer() ? (
            <div className={discoveryCountDownWrapperStyle}>
                <a className="oo-discovery-count-down-icon-style" onClick={this.handleDiscoveryCountDownClick}>
                    <Clock {...this.props} timeToShow={this.props.skinConfig.discoveryScreen.countDownTime}
                        clockContainerWidth={clockWidth} clockRadius={clockWidth/2} ref="Clock"/>
                    <Icon {...this.props} icon="pause"/>
                </a>
            </div>
        ) : null;

        var discoveryContentBlocks = [];
        for (var i = 0; i < Math.min(relatedVideoPage.length, videosPerPage); i++) {
            discoveryContentBlocks.push(
                <DiscoverItem {...this.props}
                              key={i}
                              src={relatedVideoPage[i].preview_image_url}
                              image={relatedVideoPage[i].image}
                              contentTitle={relatedVideoPage[i].name}
                              franchise={relatedVideoPage[i].franchise}
                              duration={relatedVideoPage[i].duration}
                              contentTitleClassName={discoveryContentName}
                              onClickAction={this.handleDiscoveryContentClick.bind(this, videosPerPage + i)}>
                    {(countDownClock && i === 0) ? countDownClock : null}
                </DiscoverItem>
            );
        }

        return (
            <div className="oo-content-panel oo-discovery-panel" ref="discoverBar">
                <div className="oo-first-elem">
                    {discoveryContentBlocks[0]}
                </div>
                <div className={discoveryToaster} id="DiscoveryToasterContainer" ref="DiscoveryToasterContainer">
                    {discoveryContentBlocks.slice(1,3)}
                </div>
            </div>
        );
    }
});

DiscoverBar.propTypes = {
    responsiveView: React.PropTypes.string,
    videosPerPage: React.PropTypes.objectOf(React.PropTypes.number),
    discoveryData: React.PropTypes.shape({
        relatedVideos: React.PropTypes.arrayOf(React.PropTypes.shape({
            preview_image_url: React.PropTypes.string,
            name: React.PropTypes.string
        }))
    }),
    skinConfig: React.PropTypes.shape({
        discoveryScreen: React.PropTypes.shape({
            showCountDownTimerOnEndScreen: React.PropTypes.bool,
            countDownTime: React.PropTypes.number,
            contentTitle: React.PropTypes.shape({
                show: React.PropTypes.bool
            })
        }),
        icons: React.PropTypes.objectOf(React.PropTypes.object)
    }),
    controller: React.PropTypes.shape({
        sendDiscoveryClickEvent: React.PropTypes.func
    })
};

DiscoverBar.defaultProps = {
    videosPerPage: {
        xs: 1,
        sm: 1,
        md: 3,
        lg: 3
    },
    skinConfig: {
        discoveryScreen: {
            showCountDownTimerOnEndScreen: true,
            countDownTime: 10,
            contentTitle: {
                show: true
            }
        },
        icons: {
            pause:{fontStyleClass:'oo-icon oo-icon-pause'},
            discovery:{fontStyleClass:'oo-icon oo-icon-topmenu-discovery'},
            left:{fontStyleClass:'oo-icon oo-icon-left'},
            right:{fontStyleClass:'oo-icon oo-icon-right'}
        },
        responsive: {
            breakpoints: {
                xs: {id: 'xs'},
                sm: {id: 'sm'},
                md: {id: 'md'},
                lg: {id: 'lg'}
            }
        }
    },
    discoveryData: {
        relatedVideos: []
    },
    controller: {
        sendDiscoveryClickEvent: function(a,b){}
    },
    responsiveView: 'md'
};

module.exports = DiscoverBar;
