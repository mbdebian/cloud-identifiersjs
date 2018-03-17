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

    // Resolver Service
    var wsResolverHost = 'resolver';
    var wsResolverPort = '80';

    // Server Request
    var ServerRequest = {
        apiVersion: apiVersion,
        payload: {}
    };

    // Server Response
    var ServerResponse = {
        apiVersion: "",
        errorMessage: "",
        httpStatus: 200
    };

    // --- (Resolver) Compact ID Resolution Services ---
    // Models
    var Recommendation = {
        recommendationIndex: 0,
        recommendationExplanation: ""
    };

    var ResolvedResource = {
        accessUrl: "",
        info: "",
        institution: "",
        location: "",
        official: false,
        recommendation: Object.create(Recommendation)
    };

    var ServerResponseResolve = Object.create(ServerResponse);

    // Service Wrapper
    function ResolverService(host, port) {
        this.host = host;
        this.port = port;
    }
    // [___ (Resolver) Compact ID Resolution Services ___]

})();
