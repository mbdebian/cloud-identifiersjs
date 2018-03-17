/**
 * Project: cloud-identifiersjs
 * Timestamp: 2018-03-17 3:13
 * @author Manuel Bernal Llinares <mbdebian@gmail.com>
 * ---
 *
 * This Javascript library implements services wrappers to access identifiers.org cloud API
 */
var IdentifiersJS = (function () {
    "use strict";

    // API version compatibility
    var apiVersion = "1.0";

    // Scheme
    var scheme = 'http';

    // Resolver Service
    var wsResolverHost = 'resolver';
    var wsResolverPort = '8080';

    // Helpers
    function getAjax(url, success, error) {
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.open('GET', url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState > 3 && xhr.status == 200) {
                success(xhr);
            } else if (xhr.readyState > 3 && xhr.status != 200) {
                error(xhr);
            }
        };
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send();
        return xhr;
    }

    // Server Request
    function ServerRequest() {
        this.apiVersion = apiVersion;
        this.payload = {};
    }

    // Server Response
    function ServerResponse() {
        this.apiVersion = "";
        this.errorMessage = "";
        this.httpStatus = 0;
        this.payload = {};
    }

    ServerResponse.prototype.fromResponse = function (serverResponse) {
        // TODO - Missing checks...
        console.log("Building Server Response from Object...");
        this.apiVersion = serverResponse.apiVersion;
        this.errorMessage = serverResponse.errorMessage;
        this.payload.fromResponsePayload(serverResponse.payload);
    }

    // --- (Resolver) Compact ID Resolution Services ---
    // Models
    function Recommendation(object) {
        if (object) {
            this.recommendationIndex = object.recommendationIndex;
            this.recommendationExplanation = object.recommendationExplanation;
        } else {
            this.recommendationIndex = 0;
            this.recommendationExplanation = "";
        }
    }

    function ResolvedResource(object) {
        if (object) {
            //console.log("[RESOLVED_RESOURCE] Building from object --> " + JSON.stringify(object));
            this.accessUrl = object.accessUrl;
            this.info = object.info;
            this.institution = object.institution;
            this.location = object.location;
            this.official = object.official;
            this.recommendation = new Recommendation(object.recommendation);
        } else {
            this.accessUrl = "";
            this.info = "";
            this.institution = "";
            this.location = "";
            this.official = false;
            this.recommendation = new Recommendation();
        }
    }

    function ResponseResolvePayload() {
        this.resolvedResources = [];
    }

    ResponseResolvePayload.prototype.fromResponsePayload = function(responsePayload) {
        for (var index in responsePayload.resolvedResources) {
            //console.log("[PROCESSING] Resolved Resource " + JSON.stringify(responsePayload.resolvedResources[index]));
            this.resolvedResources[this.resolvedResources.length] = new ResolvedResource(responsePayload.resolvedResources[index]);
        }
    };

    function ServerResponseResolve() {
        ServerResponse.call(this);
        this.payload = new ResponseResolvePayload();
    }

    ServerResponseResolve.prototype = Object.create(ServerResponse.prototype);
    ServerResponseResolve.prototype.constructor = ServerResponseResolve;

    // Service Wrapper
    function ResolverService(host, port) {
        this.host = host;
        this.port = port;
        console.log("Instance of Resolver Service at host ", host, ", port ", port);
    }

    ResolverService.prototype.resolve = function (callback, compactId, selector) {
        // TODO
        var endpoint = scheme + "://" + this.host + ":" + this.port;
        if (typeof selector !== "undefined") {
            endpoint = endpoint + "/" + selector;
        }
        endpoint = endpoint + "/" + compactId;
        // Prepare default response
        var response = new ServerResponseResolve();
        var processResponse = function (xhr) {
            console.log("Resolve Response, HTTP Status " + xhr.status + " - Response text: " + xhr.responseText);
            response.httpStatus = xhr.status;
            response.errorMessage = xhr.statusText;
            if (xhr.responseText) {
                response.fromResponse(JSON.parse(xhr.responseText));
            }
            callback(response);
        };
        getAjax(endpoint, processResponse, processResponse);
    };

    function printResolveResponse(compactId, selector) {
        return function(response) {
            console.log("==================================================================");
            console.log("---> Resolution of Compact ID '" + compactId + "'");
            if (typeof selector !== "undefined")
                console.log("\tSelector '" + selector + "'");
            console.log("\tResponse API Version " + response.apiVersion);
            console.log("\tHTTP Status " + response.httpStatus);
            console.log("\tError Message " + response.errorMessage);
            if (response.payload) {
                console.log("\tPayload contains " + response.payload.resolvedResources.length + " resolved resources");
                if (response.payload.resolvedResources) {
                    response.payload.resolvedResources.forEach(function(resolvedResource) {
                        console.log("\t- Resolved Resource Location '" + resolvedResource.location + "'");
                        console.log("\t\tInformation: " + resolvedResource.info);
                        console.log("\t\tAccess URL: " + resolvedResource.accessUrl);
                        console.log("\t\tRecommendation Score: " + resolvedResource.recommendation.recommendationIndex);
                    });
                }
            }
            console.log("==================================================================");
        };
    }

    function testResolve() {
        var resolver = IdentifiersJS.getResolver('localhost', 8080);
        var compactId = "CHEBI:36927";
        var selector = "ols";
        resolver.resolve(printResolveResponse(compactId), compactId);
        resolver.resolve(printResolveResponse(compactId, selector), compactId, selector);
    }

    // [___ (Resolver) Compact ID Resolution Services ___]

    // --- API Services Factory ---
    function factoryGetResolver(host, port) {
        var dstHost = wsResolverHost;
        var dstPort = wsResolverPort;
        if (typeof host !== "undefined") {
            dstHost = host;
            if (typeof port !== "undefined") {
                dstPort = port;
            }
        }
        return new ResolverService(dstHost, dstPort);
    }

    return {
        getResolver: factoryGetResolver,
        unitTestResolver: testResolve
    };

})();
