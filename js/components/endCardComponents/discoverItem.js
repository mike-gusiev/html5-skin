var React = require('react'),
    Utils = require('../utils');

var DiscoverItem = React.createClass({
    getInitialState: function() {
        return {
            imgError: false
        };
    },

    getVideoDuration: function() {
        var seconds = this.props.duration;
        var date = new Date(null);
        for (var i = 0; i < 3; i++) {
            seconds = Math.round(seconds / 10);
        }
        date.setSeconds(seconds);
        if (seconds >= 3600) {
            var duration = date.toISOString().substr(11, 8);
        } else {
            var duration = date.toISOString().substr(14, 5);
        }
        return duration;
    },

    componentWillMount: function() {
        var img = new Image();
        img.src = this.props.src;

        img.onerror = function() {
            this.setState({
                imgError: true
            });
        }.bind(this);
    },

    render: function() {
        if (this.state.imgError) {
            return null;
        }

        var thumbnailStyle = {
            backgroundImage: "url('" + this.props.src + "')"
        };

        var duration = this.getVideoDuration();

        var itemTitleStyle = {
            color: Utils.getPropertyValue(this.props.skinConfig, 'discoveryScreen.contentTitle.font.color'),
            fontFamily: Utils.getPropertyValue(this.props.skinConfig, 'discoveryScreen.contentTitle.font.fontFamily')
        };
        return (
            <div className="oo-discovery-image-wrapper-style">
                <span className="elem-length">{duration}</span>
                <div className="oo-discovery-wrapper">
                    <a onClick={this.props.onClickAction}>
                        <div className="oo-image-style" style={thumbnailStyle}></div>
                    </a>
                    {this.props.children}
                </div>
                <div className={this.props.contentTitleClassName}>
                    {this.props.franchise && (
                        <div>{this.props.franchise.toUpperCase()}</div>
                    )}
                    <div style={itemTitleStyle} dangerouslySetInnerHTML={Utils.createMarkup(this.props.contentTitle)}></div>
                </div>
            </div>
        );
    }
});

DiscoverItem.propTypes = {
    skinConfig: React.PropTypes.shape({
        discoveryScreen: React.PropTypes.shape({
            contentTitle: React.PropTypes.shape({
                font: React.PropTypes.shape({
                    color: React.PropTypes.string,
                    fontFamily: React.PropTypes.string
                })
            })
        })
    })
};

module.exports = DiscoverItem;
