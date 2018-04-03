var DiscoveryMixin = {
    getRelatedVideosByUrl: function (discoveryParams, discoveryUrl, videoId, setDiscoveryVideos) {
        var xhr = new XMLHttpRequest();
        var relatedUrl = '//api.ooyala.com/v2/discover/similar/assets/';
        var url = relatedUrl + videoId + '?' + DiscoveryMixin._generateParamString(discoveryParams);
        xhr.open('GET', url, true);
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status != 200) {
                console.log(xhr.status + ': ' + xhr.statusText);
            } else {
                var relatedVideos = JSON.parse(xhr.response);
                var results = relatedVideos.results.sort(function (a, b) {
                    return a.embed_code > b.embed_code ? -1 : 1;
                }).slice(0, 10);
                DiscoveryMixin.getFullVideoData(discoveryUrl, results, setDiscoveryVideos);
            }
        }
    },

    getFullVideoData: function (discoveryUrl, results, setDiscoveryVideos) {
        var xhr = new XMLHttpRequest();
        var path = '/content/pgatour';
        var ids = results.map(function (res) {
            return res.embed_code;
        });
        discoveryUrl = discoveryUrl.replace('{videoIds}', ids.join(','));
        discoveryUrl = discoveryUrl.replace('{path}', path);
        xhr.open('GET', discoveryUrl, true);
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status != 200) {
                console.log(xhr.status + ': ' + xhr.statusText);
            } else {
                var fullVideosData = JSON.parse(xhr.response);
                for (var i = 0; i < 10; i++) {
                    results[i]['franchise'] = fullVideosData[i]['franchise'];
                }
                setDiscoveryVideos(results);
            }
        }
    },

    _generateParamString: function (params) {
        var defaultParams = {
            sign_version: 'player',
            pcode:'FsaTIxOjRh-XoYreyerA2QjhxTMb',
            discovery_profile_id: 'fc53804780f1456da1e7d5666406ea2c',
            video_pcode: 'FsaTIxOjRh-XoYreyerA2QjhxTMb',
            limit: 10,
            device_id: 'muTiWJPuWEm3CVc6rLNXZXfGH4Qu3JrcbDwir%2BnwSR0',
            expected_bucket_info_version: 2,
            expires: Math.floor((new Date().getTime() / 1000) + 3600)
        };
        var mergedParams = Object.assign({}, defaultParams, params || {});
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

    hashToString: function (hash, delimiter, keys) {
        var myKeys = keys || Object.keys(hash);
        return myKeys
            .sort()
            .map(function(key) {
                 return delimiter + key + '=' + hash[key]
             })
            .join('');
    }
};

module.exports = DiscoveryMixin;