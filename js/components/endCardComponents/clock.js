/********************************************************************
 CLOCK
 *********************************************************************/
/**
 *
 *
 * @class Clock
 * @constructor
 */
var React = require('react'),
    ReactDOM = require('react-dom'),
    ClassNames = require('classnames');

var Clock = React.createClass({
    getInitialState: function() {
        this.canvas = null;
        this.context = null;
        this.interval = false;
        var tmpFraction = 2 / this.props.timeToShow;
        var tmpRemainSeconds = this.props.timeToShow;

        return {
            counterInterval: 0.05,
            fraction: tmpFraction,
            remainSeconds: tmpRemainSeconds,
            hideClock: false
        };
    },

    handleClick: function(event) {
        if (event.type == 'touchend' || !this.isMobile){
            this.setState({hideClock: true});
            clearInterval(this.interval);
        }
    },

    componentDidMount: function() {
        this.setupCountDownTimer();
    },

    componentWillUnmount: function() {
        clearInterval(this.interval);
    },

    setupCountDownTimer: function() {
        this.setupCanvas();
        this.drawBackground();
        this.drawTimer();
        this.startTimer();
    },

    setupCanvas: function() {
        this.canvas = ReactDOM.findDOMNode(this);
        this.context = this.canvas.getContext("2d");
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
    },

    drawBackground: function() {
        this.context.beginPath();
        this.context.globalAlpha = 1;
        this.context.fillStyle = 'gray';
        this.context.arc(this.props.clockContainerWidth / 2, this.props.clockRadius, this.props.clockRadius, 0, Math.PI * 2, false);
        this.context.arc(this.props.clockContainerWidth / 2, this.props.clockRadius, this.props.clockRadius / 1.2, Math.PI * 2, 0, true);
        this.context.fill();
    },

    drawTimer: function() {
        var percent = this.state.fraction * this.state.remainSeconds + 1.5;
        this.context.fillStyle = 'white';
        this.context.beginPath();
        this.context.arc(this.props.clockContainerWidth / 2, this.props.clockRadius, this.props.clockRadius, Math.PI * 1.5, Math.PI * percent, false);
        this.context.arc(this.props.clockContainerWidth / 2, this.props.clockRadius, this.props.clockRadius / 1.2, Math.PI * percent, Math.PI * 1.5, true);
        this.context.fill();
    },

    startTimer: function() {
        this.interval = setInterval(this.tick, this.state.counterInterval * 1000);
    },

    tick: function() {
        if(this.state.remainSeconds < 1) {
            this.setState({remainSeconds: 0});
            clearInterval(this.interval);
            this.startDiscoveryVideo();
        }
        else {
            this.setState({remainSeconds: this.state.remainSeconds-(this.state.counterInterval)});
            this.updateCanvas();
        }
    },

    updateCanvas: function() {
        this.clearCanvas();
        this.drawTimer();
    },

    clearCanvas: function() {
        this.context = this.canvas.getContext("2d");
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
    },

    startDiscoveryVideo: function() {
        var eventData = {
            "clickedVideo" : this.props.discoveryData.relatedVideos[0],
            "custom" : this.props.discoveryData.custom
        };
        this.props.controller.sendDiscoveryClickEvent(eventData, false);
    },

    render: function() {
        var canvasClassName = ClassNames({
            'oo-countdown-clock': true,
            'oo-discovery-count-down': true,
            'oo-hidden': this.state.hideClock
        });

        return (
            <canvas className={canvasClassName}
                    width={this.props.clockContainerWidth}
                    height={this.props.clockContainerWidth}
                    onClick={this.handleClick}
                    onTouchEnd={this.handleClick}>
            </canvas>
        );
    }
});

Clock.propTypes = {
    timeToShow: React.PropTypes.number,
    clockContainerWidth: React.PropTypes.number,
    clockRadius: React.PropTypes.number
};

Clock.defaultProps = {
    timeToShow: 10,
    clockContainerWidth: 36,
    clockRadius: 18,
    controller: {
        state: {
            screenToShow: '',
            upNextInfo: {
                timeToShow: 10
            }
        }
    },
    skinConfig: {
        responsive: {
            breakpoints: {
                xs: {
                    id: 'xs'
                }
            }
        }
    },
};

module.exports = Clock;