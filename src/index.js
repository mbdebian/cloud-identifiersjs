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
    var scheme = 'http'

    // Resolver Service
    var wsResolverHost = 'resolver';
    var wsResolverPort = '8080';

    // Server Request
    function ServerRequest() {
        this.apiVersion = apiVersion;
        this.payload = {};
    };

    // Server Response
    var ServerResponse = {
        apiVersion: "",
        errorMessage: "",
        httpStatus: 200
    };

    // --- (Resolver) Compact ID Resolution Services ---
    // Models
    function Recommendation() {
        this.recommendationIndex = 0;
        this.recommendationExplanation = "";
    };

    var ResolvedResource = {
        accessUrl: "",
        info: "",
        institution: "",
        location: "",
        official: false,
        recommendation: Object.create(Recommendation)
    };

    var ResponseResolvePayload = {

    }

    function ServerResponseResolve() {
        ServerResponse.call(this);
        this.payload = new
    }

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
        // Prepare response
        var response = Object.create(ServerResponseResolve);


    };
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
        getResolver: factoryGetResolver
    };

})();
