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

        var cloudinaryUrl = 'http://pga-tour-res.cloudinary.com/image/fetch/f_auto,q_50,w_710/' + this.props.src;
        if (this.props.image) {
            cloudinaryUrl = 'http://pga-tour-res.cloudinary.com/image/upload/f_auto,q_50,w_710/' + this.props.image;
        }

        var thumbnailStyle = {
            backgroundImage: "url('" + cloudinaryUrl + "')"
        };

        var duration = this.getVideoDuration();

        return (
            <div className="oo-discovery-image-wrapper-style">
                <span className="elem-length">{duration}</span>
                <div className="oo-discovery-wrapper">
                    <a onClick={this.props.onClickAction}>
                        <div className="oo-image-style" style={thumbnailStyle}/>
                    </a>
                    {this.props.children}
                </div>
                <div className={this.props.contentTitleClassName}>
                    {this.props.franchise && (
                        <div className="end-card-franchise">{this.props.franchise.toUpperCase()}</div>
                    )}
                    <div className="end-card-title" dangerouslySetInnerHTML={Utils.createMarkup(this.props.contentTitle)}/>
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
    }),
    src: React.PropTypes.string,
    image: React.PropTypes.string,
    contentTitle: React.PropTypes.string,
    franchise: React.PropTypes.string,
    duration: React.PropTypes.number,
    contentTitleClassName: React.PropTypes.string,
    onClickAction: React.PropTypes.func
};

module.exports = DiscoverItem;
