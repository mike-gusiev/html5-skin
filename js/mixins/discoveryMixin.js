var DiscoveryMixin = {
    getRelatedVideosByUrl: function (params, videoId, setDiscoveryVideos) {
        var xhr = new XMLHttpRequest();
        var relatedUrl = '//api.ooyala.com/v2/discover/similar/assets/';
        var url = relatedUrl + videoId + '?' + DiscoveryMixin._generateParamString(params);
        xhr.open('GET', url, true);
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status != 200) {
                console.log(xhr.status + ': ' + xhr.statusText);
            } else {
                var relatedVideos = JSON.parse(xhr.response);
                var results = DiscoveryMixin.getNonPlayedVideos(relatedVideos.results, params);
                DiscoveryMixin.getFullVideoData(params.videoDetailsUrl, results, setDiscoveryVideos);
            }
        }
    },

    getNonPlayedVideos: function (relatedVideos, params) {
        var limit = params.responsiveId === 'xs' || params.responsiveId === 'sm' ? 1 : 3;
        if (relatedVideos.length <= limit) {
            return DiscoveryMixin.shuffleArray(relatedVideos);
        }
        var results = [];
        var deleted = [];
        for (var i = 0; i < relatedVideos.length; i++) {
            if (params.playedVideos.indexOf(relatedVideos[i]['embed_code']) === -1) {
                results.push(relatedVideos[i]);
            } else {
                deleted.push(relatedVideos[i]);
            }
        }
        if (results.length < limit) {
            results = results.concat(deleted);
        }
        return results.slice(0, limit);
    },

    getFullVideoData: function (videoDetailsUrl, videos, setDiscoveryVideos) {
        var xhr = new XMLHttpRequest();
        var ids = videos.map(function (res) {
            return res.embed_code;
        }).sort();
        videoDetailsUrl = videoDetailsUrl.replace('{videoIds}', ids.join(','));
        xhr.open('GET', videoDetailsUrl, true);
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status != 200) {
                console.log(xhr.status + ': ' + xhr.statusText);
            } else {
                var fullVideosData = JSON.parse(xhr.response);
                var results = DiscoveryMixin.mergeRelatedVideos(videos, fullVideosData);
                setDiscoveryVideos(results);
            }
        }
    },

    mergeRelatedVideos: function (videos, fullVideosData) {
        var results = [].concat(videos);
        for (var i = 0; i < fullVideosData.length; i++) {
            for (var j = 0; j < results.length; j++) {
                if (fullVideosData[i]['videoId'] === results[j]['embed_code']) {
                    results[j]['name'] = fullVideosData[i]['title'];
                    results[j]['franchise'] = fullVideosData[i]['franchise'];
                    results[j]['image'] = fullVideosData[i]['image'];
                    break;
                }
            }
        }
        return results;
    },

    _generateParamString: function (params) {
        var defaultParams = {
            sign_version: 'player',
            pcode: params.pcode,
            discovery_profile_id: params.playerBrandingId,
            video_pcode: params.pcode,
            limit: 20,
            device_id: this.getGUID(),
            expected_bucket_info_version: 2,
            expires: Math.floor((new Date().getTime() / 1000) + 3600)
        };
        var mergedParams = Object.assign({}, defaultParams, params.discoveryParams || {});
        var signature = encodeURIComponent(DiscoveryMixin.generateSignature(mergedParams));
        mergedParams.device_id = encodeURIComponent(mergedParams.device_id);
        return DiscoveryMixin.generateParamString(mergedParams, signature);
    },

    generateSignature: function (params) {
        var pcode = params.pcode,
            shaParams = Object.keys(params).filter(function(key) {
                return  key !== 'pcode';
            });
        var sha = new window.jsSHA(pcode + DiscoveryMixin.hashToString(params, '', shaParams), 'ASCII');
        return sha.getHash('SHA-256', 'B64').substring(0, 43);
    },

    generateParamString: function (params, signature) {
        return 'signature='+ signature + DiscoveryMixin.hashToString(params, '&');
    },

    getGUID: function () {
        const randomString = this.generateRandomString();
        return new window.jsSHA(randomString, 'ASCII').getHash('SHA-256', 'B64');
    },

    generateRandomString: function () {
        return new Date().getTime() + window.navigator.userAgent + Math.random().toString(16).split('.')[1];
    },

    hashToString: function (hash, delimiter, keys) {
        var myKeys = keys || Object.keys(hash);
        return myKeys
            .sort()
            .map(function(key) {
                 return delimiter + key + '=' + hash[key]
             })
            .join('');
    },

    shuffleArray: function (array) {
        var counter = array.length;
        while (counter > 0) {
            var index = Math.floor(Math.random() * counter);
            counter--;
            var temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return array;
    }
};

module.exports = DiscoveryMixin;