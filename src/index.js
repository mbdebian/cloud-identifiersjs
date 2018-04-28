/**
 * Project: cloud-identifiersjs
 * Timestamp: 2018-03-17 3:13
 * @author Manuel Bernal Llinares <mbdebian@gmail.com>
 * ---
 *
 * This Javascript library implements services wrappers to access identifiers.org cloud API
 *
 * DISCLAIMER ==========================================================================================================
 * I know, I suck at Javascript, it's been many years since the last time I had to do anything with it, and I think I
 * never properly setup any development environment / workflow for Javascript.
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN
 * AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 * =====================================================================================================================
 */
var IdentifiersJS = (function () {
    "use strict";

    // API version compatibility
    var apiVersion = "1.0";

    // Scheme
    var scheme = 'http';

    // Resolver Service (Defaults)
    var wsResolverHost = 'localhost';
    var wsResolverPort = '8080';

    // Registry service (Defaults)
    var wsRegistryHost = 'localhost';
    var wsRegistryPort = '8081';

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

    function postAjax(url, body, success, error) {
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.open('POST', url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState > 3 && xhr.status == 200) {
                success(xhr);
            } else if (xhr.readyState > 3 && xhr.status != 200) {
                error(xhr);
            }
        };
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(body));
        return xhr;
    }
    // --- END - Helpers

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
        //console.debug("Building Server Response from Object...");
        this.apiVersion = (serverResponse.apiVersion !== undefined) ? serverResponse.apiVersion : this.apiVersion;
        this.errorMessage = (serverResponse.errorMessage !== undefined) ?
            serverResponse.errorMessage : this.errorMessage;
        if (serverResponse.payload) {
            this.payload.fromResponsePayload(serverResponse.payload);
        }
    };

    // --- (RESOLVER) Compact ID Resolution Services ---
    // Models
    function Recommendation(object) {
        // Defaults
        this.recommendationIndex = 0;
        this.recommendationExplanation = "";
        if (object) {
            this.recommendationIndex =
                (object.recommendationIndex !== undefined) ?
                    object.recommendationIndex : this.recommendationIndex;
            this.recommendationExplanation =
                (object.recommendationExplanation !== undefined) ?
                    object.recommendationExplanation : this.recommendationExplanation;
        }
    }

    function ResolvedResource(object) {
        // Defaults
        this.id = "";
        this.resourcePrefix = "";
        this.accessUrl = "";
        this.info = "";
        this.institution = "";
        this.location = "";
        this.official = false;
        this.recommendation = new Recommendation();
        if (object) {
            //console.log("[RESOLVED_RESOURCE] Building from object --> " + JSON.stringify(object));
            this.id = (object.id !== undefined) ? object.id : this.id;
            this.resourcePrefix = (object.resourcePrefix !== undefined) ? object.resourcePrefix : this.resourcePrefix;
            this.accessUrl = (object.accessUrl !== undefined) ? object.accessUrl : this.accessUrl;
            this.info = (object.info !== undefined) ? object.info : this.info;
            this.institution = (object.institution !== undefined) ? object.institution : this.institution;
            this.location = (object.location !== undefined) ? object.location : this.location;
            this.official = (object.official !== undefined) ? object.official : this.official;
            if (object.recommendation) {
                this.recommendation = new Recommendation(object.recommendation);
            }
        }
    }

    function ResponseResolvePayload() {
        this.resolvedResources = [];
    }

    ResponseResolvePayload.prototype.fromResponsePayload = function (responsePayload) {
        if (responsePayload.resolvedResources) {
            for (var index in responsePayload.resolvedResources) {
                //console.log("[PROCESSING] Resolved Resource " + JSON.stringify(responsePayload.resolvedResources[index]));
                this.resolvedResources[this.resolvedResources.length] = new ResolvedResource(responsePayload.resolvedResources[index]);
            }
        }
    };

    function ServerResponseResolve() {
        ServerResponse.call(this);
        this.payload = new ResponseResolvePayload();
    }
    ServerResponseResolve.prototype = Object.create(ServerResponse.prototype);
    ServerResponseResolve.prototype.constructor = ServerResponseResolve;
    // --- END - (RESOLVER) Compact ID Resolution Services ---


    // --- (REGISTRY) Compact ID Resolution Services ---
    // Models
    function ServiceRequestValidate() {
        ServerRequest.call(this);
        // Default payload
        this.payload = new ServiceRequestRegisterPrefixPayload();
    }
    ServiceRequestValidate.prototype = Object.create(ServerRequest.prototype);
    ServiceRequestValidate.prototype.constructor = ServiceRequestValidate;


    function ServiceRequestRegisterPrefix() {
        ServerRequest.call(this);
        // Default payload
        this.payload = new ServiceRequestRegisterPrefixPayload();
    }
    ServiceRequestRegisterPrefix.prototype = Object.create(ServerRequest.prototype);
    ServiceRequestRegisterPrefix.prototype.constructor = ServiceRequestRegisterPrefix;


    function ServiceResponseRegisterPrefix() {
        ServerResponse.call(this);
        this.payload = new ServiceResponseRegisterPrefixPayload();
    }
    ServiceResponseRegisterPrefix.prototype = Object.create(ServerResponse.prototype);
    ServiceResponseRegisterPrefix.prototype.constructor = ServiceResponseRegisterPrefix;


    function ServiceResponseValidateRequest() {
        ServerResponse.call(this);
        this.payload = new ServiceResponseRegisterPrefixPayload();
    }
    ServiceResponseValidateRequest.prototype = Object.create(ServerResponse.prototype);
    ServiceResponseValidateRequest.prototype.constructor = ServiceResponseValidateRequest;


    function ServiceResponseRegisterPrefixPayload() {
        this.comment = "";
    }

    ServiceResponseRegisterPrefixPayload.prototype.fromResponsePayload = function (object) {
        this.comment = (object.comment !== undefined) ? object.comment : this.comment;
    };

    function PrefixRequester(object) {
        this.name = "";
        this.email = "";
        if (object) {
            this.name = (object.name !== undefined) ? object.name : this.name;
            this.email = (object.email !== undefined) ? object.email : this.email;
        }
    }

    function ServiceRequestRegisterPrefixPayload() {
        this.name = "";
        this.description = "";
        this.homePage = "";
        this.organization = "";
        this.preferredPrefix = "";
        this.resourceAccessRule = "";
        this.exampleIdentifier = "";
        this.regexPattern = "";
        this.references = [];
        this.additionalInformation = "";
        this.requester = new PrefixRequester();
    }

    // I didn't need this, ok, it's Monday, fair enough... :P
    ServiceRequestRegisterPrefixPayload.prototype.fromResponsePayload = function (object) {
        this.name = (object.name !== undefined) ? object.name : this.name;
        this.description = (object.description !== undefined) ? object.description : this.description;
        this.homePage = (object.homePage !== undefined) ? object.homePage : this.homePage;
        this.organization = (object.organization) !== undefined ? object.organization : this.organization;
        this.preferredPrefix = (object.preferredPrefix !== undefined) ? object.preferredPrefix : this.preferredPrefix;
        this.resourceAccessRule = (object.resourceAccessRule !== undefined) ? object.resourceAccessRule : this.resourceAccessRule;
        this.exampleIdentifier = (object.exampleIdentifier !== undefined) ? object.exampleIdentifier : this.exampleIdentifier;
        this.regexPattern = (object.regexPattern !== undefined) ? object.regexPattern : this.regexPattern;
        this.references = (object.references !== undefined) ? object.references : this.references;
        this.additionalInformation = (object.additionalInformation !== undefined) ? object.additionalInformation : this.additionalInformation;
        this.requester = (object.requester !== undefined) ? new PrefixRequester(object.requester) : this.requester;

    };
    // --- END - (REGISTRY) Compact ID Resolution Services ---


    // --- Service Wrappers --- RESOLVER
    function ResolverService(host, port) {
        this.host = host;
        this.port = port;
        console.info("Instance of Resolver Service at host ", host, ", port ", port);
    }

    ResolverService.prototype.resolve = function (callback, compactId, selector) {
        var endpoint = scheme + "://" + this.host + ":" + this.port;
        if (typeof selector !== "undefined") {
            endpoint = endpoint + "/" + selector;
        }
        endpoint = endpoint + "/" + compactId;
        // Prepare default response
        var response = new ServerResponseResolve();
        var processResponse = function (xhr) {
            console.debug("Resolve Response, HTTP Status " + xhr.status + " - Response text: " + xhr.responseText);
            response.httpStatus = xhr.status;
            response.errorMessage = xhr.statusText;
            if (xhr.responseText) {
                response.fromResponse(JSON.parse(xhr.responseText));
            }
            callback(response);
        };
        getAjax(endpoint, processResponse, processResponse);
    };

    ResolverService.prototype.getHighestRecommendedResolvedResource = function (resolvedResources) {
        return this.sortResolvedResourcesByRecommendationIndexAscending(resolvedResources)[resolvedResources.length - 1];
    };

    ResolverService.prototype.sortResolvedResourcesByRecommendationIndexAscending = function (resolvedResources) {
        if (resolvedResources) {
            return resolvedResources.sort(function (a, b) {
                return a.recommendation.recommendationIndex - b.recommendation.recommendationIndex; });
        }
        return resolvedResources;
    };

    function printResolveResponse(compactId, selector) {
        return function (response) {
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
                    response.payload.resolvedResources.forEach(function (resolvedResource) {
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

    function printResolvedResource(resolvedResource) {
        console.log("============= Resolved Resource ID " + resolvedResource.id + " =======================");
        console.log("\tResolved Resource Location '" + resolvedResource.location + "'");
        console.log("\tResolved Resource Prefix '" + resolvedResource.resourcePrefix + "'");
        console.log("\tInformation: " + resolvedResource.info);
        console.log("\tAccess URL: " + resolvedResource.accessUrl);
        console.log("\tRecommendation Score: " + resolvedResource.recommendation.recommendationIndex);
        console.log("=======================================================");
    }

    function testResolve() {
        var resolver = IdentifiersJS.getResolver('localhost', 8080);
        var compactId = "CHEBI:36927";
        var selector = "ols";
        resolver.resolve(printResolveResponse(compactId), compactId);
        resolver.resolve(printResolveResponse(compactId, selector), compactId, selector);
        console.debug("Highest recommended Resolved Resource:");
        resolver.resolve(function (response) {
            printResolvedResource(resolver.getHighestRecommendedResolvedResource(response.payload.resolvedResources));
        }, compactId);
    }
    // [___ (RESOLVER) Compact ID Resolution Services ___]


    // --- Service Wrappers --- REGISTRY
    function RegistryService(host, port) {
        this.host = host;
        this.port = port;
        console.info("Instance of Registry Service at host ", host, ", port ", port);
    }

    RegistryService.prototype.getServiceApiBaseline = function () {
        return scheme + "://" + this.host + ":" + this.port;
    };

    RegistryService.prototype.makePostRequest = function(callback, endpoint, requestBody, defaultResponse) {
        var processResponse = function (xhr) {
            console.debug("Registry Service Response, HTTP Status " + xhr.status + " - Response text: " + xhr.responseText);
            defaultResponse.httpStatus = xhr.status;
            defaultResponse.errorMessage = xhr.statusText;
            if (xhr.responseText) {
                defaultResponse.fromResponse(JSON.parse(xhr.responseText));
            }
            callback(defaultResponse);
        };
        // POST the request
        postAjax(endpoint, requestBody, processResponse, processResponse);
    };

    RegistryService.prototype.makeValidationRequest = function (callback, endpoint, payload) {
        var requestBody = new ServiceRequestValidate();
        requestBody.payload = payload;
        // Default Response
        var validationResponse = new ServiceResponseValidateRequest();
        this.makePostRequest(callback, endpoint, requestBody, validationResponse);
    };

    RegistryService.prototype.requestPrefixRegistration = function (callback, payload) {
        var endpoint = this.getServiceApiBaseline();
        var requestBody = new ServiceRequestRegisterPrefix();
        requestBody.payload = payload;
        // Default response
        var registrationResponse = new ServiceResponseRegisterPrefix();
        this.makePostRequest(callback, endpoint, requestBody, registrationResponse);
    };

    RegistryService.prototype.requestValidationName = function (callback, payload) {
        var endpoint = this.getServiceApiBaseline() + "/validateRegisterPrefixName";
        this.makeValidationRequest(callback, endpoint, payload);
    };

    RegistryService.prototype.requestValidationDescription = function (callback, payload) {
        var endpoint = this.getServiceApiBaseline() + "/validateRegisterPrefixDescription";
        this.makeValidationRequest(callback, endpoint, payload);
    };

    RegistryService.prototype.requestValidationHomePage = function (callback, payload) {
        var endpoint = this.getServiceApiBaseline() + "/validateRegisterPrefixHomePage";
        this.makeValidationRequest(callback, endpoint, payload);
    };

    RegistryService.prototype.requestValidationOrganization = function (callback, payload) {
        var endpoint = this.getServiceApiBaseline() + "/validateRegisterPrefixOrganization";
        this.makeValidationRequest(callback, endpoint, payload);
    };

    RegistryService.prototype.requestValidationPreferredPrefix = function (callback, payload) {
        var endpoint = this.getServiceApiBaseline() + "/validateRegisterPrefixPreferredPrefix";
        this.makeValidationRequest(callback, endpoint, payload);
    };

    RegistryService.prototype.requestValidationResourceAccessRule = function (callback, payload) {
        var endpoint = this.getServiceApiBaseline() + "/validateRegisterPrefixResourceAccessRule";
        this.makeValidationRequest(callback, endpoint, payload);
    };

    RegistryService.prototype.requestValidationExampleIdentifier = function (callback, payload) {
        var endpoint = this.getServiceApiBaseline() + "/validateRegisterPrefixExampleIdentifier";
        this.makeValidationRequest(callback, endpoint, payload);
    };

    RegistryService.prototype.requestValidationRegexPattern = function (callback, payload) {
        var endpoint = this.getServiceApiBaseline() + "/validateRegisterPrefixRegexPattern";
        this.makeValidationRequest(callback, endpoint, payload);
    };

    RegistryService.prototype.requestValidationReferences = function (callback, payload) {
        var endpoint = this.getServiceApiBaseline() + "/validateRegisterPrefixReferences";
        this.makeValidationRequest(callback, endpoint, payload);
    };

    RegistryService.prototype.requestValidationAdditionalInformation = function (callback, payload) {
        var endpoint = this.getServiceApiBaseline() + "/validateRegisterPrefixAdditionalInformation";
        this.makeValidationRequest(callback, endpoint, payload);
    };

    RegistryService.prototype.requestValidationRequester = function (callback, payload) {
        var endpoint = this.getServiceApiBaseline() + "/validateRegisterPrefixRequester";
        this.makeValidationRequest(callback, endpoint, payload);
    };

    // --- Unit Testing ---
    function printRegistryServiceResponse(requestType, payload) {
        return function (response) {
            console.log("==================================================================");
            console.log("---> " + requestType + " to Registry Service, with payload --- " + JSON.stringify(payload));
            console.log("\tResponse API Version " + response.apiVersion);
            console.log("\tHTTP Status " + response.httpStatus);
            console.log("\tError Message " + response.errorMessage);
            if (response.payload) {
                console.log("\tResponse Payload contains comment '" + response.payload.comment + "'");
            }
            console.log("==================================================================");
        };
    }

    function testValidRegistration() {
        console.log("==================================================================");
        console.log("      ---> UNIT TEST --- Valid Registration Request --- <---");
        console.log("==================================================================");
        var payload = new ServiceRequestRegisterPrefixPayload();
        payload.name = "Unit Test name";
        payload.description = "This is a sample prefix registration request from a unit test of libapi, we need enough characters for the description";
        payload.homePage = "http://identifiers.org";
        payload.organization = "EMBL-EBI";
        payload.preferredPrefix = "myprefix";
        payload.resourceAccessRule = "http://httpstat.us/{$id}";
        payload.exampleIdentifier = "200";
        payload.regexPattern = "\\d+";
        payload.references = ["ref1", "ref2"];
        payload.additionalInformation = "Additional information about this unit test";
        payload.requester = new PrefixRequester();
        payload.requester.name = "Manuel Bernal Llinares";
        payload.requester.email = "mbernal@ebi.ac.uk";
        var service = factoryGetRegistry();
        service.requestPrefixRegistration(printRegistryServiceResponse('Prefix Registration', payload), payload);
    }

    function testInvalidRegistration() {
        console.log("==================================================================");
        console.log("     ---> UNIT TEST --- Invalid Registration Request --- <---");
        console.log("==================================================================");
        var payload = new ServiceRequestRegisterPrefixPayload();
        payload.name = "Unit Test name";
        payload.description = "This is a sample prefix registration request from a unit test of libapi, we need enough characters for the description";
        payload.homePage = "http://identifiers.org";
        //payload.organization = "EMBL-EBI";
        payload.preferredPrefix = "myprefix";
        payload.resourceAccessRule = "http://httpstat.us/{$id}";
        payload.exampleIdentifier = "404";
        payload.regexPattern = "\\d+";
        payload.references = ["ref1", "ref2"];
        payload.additionalInformation = "Additional information about this unit test";
        payload.requester = new PrefixRequester();
        payload.requester.name = "Manuel Bernal Llinares";
        payload.requester.email = "mbernal@ebi.ac.uk";
        var service = factoryGetRegistry();
        service.requestPrefixRegistration(printRegistryServiceResponse('Prefix Registration', payload), payload);
    }

    function testValidValidation() {
        console.log("==================================================================");
        console.log("      ---> UNIT TEST --- Valid Validation Request --- <---");
        console.log("==================================================================");
        var service = factoryGetRegistry();
        var payload = new ServiceRequestRegisterPrefixPayload();
        payload.name = "Unit Test name";
        service.requestValidationName(printRegistryServiceResponse('[Validation Request] - Name --- ', payload), payload);
        payload.description = "This is a sample prefix registration request from a unit test of libapi, we need enough characters for the description";
        service.requestValidationDescription(printRegistryServiceResponse('[Validation Request] - Description --- ', payload), payload);
        payload.homePage = "http://identifiers.org";
        service.requestValidationHomePage(printRegistryServiceResponse('[Validation Request] - Home Page --- ', payload), payload);
        payload.organization = "EMBL-EBI";
        service.requestValidationOrganization(printRegistryServiceResponse('[Validation Request] - Organization --- ', payload), payload);
        payload.preferredPrefix = "myprefix";
        service.requestValidationPreferredPrefix(printRegistryServiceResponse('[Validation Request] - Preferred Prefix --- ', payload), payload);
        payload.resourceAccessRule = "http://httpstat.us/{$id}";
        service.requestValidationResourceAccessRule(printRegistryServiceResponse('[Validation Request] - Access Rule --- ', payload), payload);
        payload.exampleIdentifier = "200";
        service.requestValidationExampleIdentifier(printRegistryServiceResponse('[Validation Request] - Example Identifier --- ', payload), payload);
        payload.regexPattern = "\\d+";
        service.requestValidationRegexPattern(printRegistryServiceResponse('[Validation Request] - Regex Pattern --- ', payload), payload);
        payload.references = ["ref1", "ref2"];
        service.requestValidationReferences(printRegistryServiceResponse('[Validation Request] - References --- ', payload), payload);
        payload.additionalInformation = "Additional information about this unit test";
        service.requestValidationAdditionalInformation(printRegistryServiceResponse('[Validation Request] - Additional Information --- ', payload), payload);
        payload.requester = new PrefixRequester();
        payload.requester.name = "Manuel Bernal Llinares";
        payload.requester.email = "mbernal@ebi.ac.uk";
        service.requestValidationRequester(printRegistryServiceResponse('[Validation Request] - Requester --- ', payload), payload);
    }

    function testInvalidValidation() {
        console.log("==================================================================");
        console.log("     ---> UNIT TEST --- Invalid Validation Request --- <---");
        console.log("==================================================================");
        var service = factoryGetRegistry();
        var payload = new ServiceRequestRegisterPrefixPayload();
        // It doesn't need to be exhaustive
        payload.description = "we need enough characters for the description";
        service.requestValidationDescription(printRegistryServiceResponse('[Validation Request] - Description --- ', payload), payload);
        payload.preferredPrefix = "chebi";
        service.requestValidationPreferredPrefix(printRegistryServiceResponse('[Validation Request] - Preferred Prefix --- ', payload), payload);
        payload.resourceAccessRule = "http://httpstat.us/{$this_is_not_valid}";
        service.requestValidationResourceAccessRule(printRegistryServiceResponse('[Validation Request] - Access Rule --- ', payload), payload);
        payload.requester = new PrefixRequester();
        payload.requester.name = "Manuel Bernal Llinares";
        service.requestValidationRequester(printRegistryServiceResponse('[Validation Request] - Requester --- ', payload), payload);
    }

    function unitTestRegistry() {
        // NOTE - I know it is not testing everything...
        testValidRegistration();
        testInvalidRegistration();
        testValidValidation();
        testInvalidValidation();
    }
    // [___ (REGISTRY) Compact ID Resolution Services ___]


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

    function factoryGetRegistry(host, port) {
        var dstHost = wsRegistryHost;
        var dstPort = wsRegistryPort;
        if (typeof host !== "undefined") {
            dstHost = host;
            if (typeof port !== "undefined") {
                dstPort = port;
            }
        }
        return new RegistryService(dstHost, dstPort);
    }
    // --- END - API Services Factory ---

    return {
        PrefixRegistrationPayload: ServiceRequestRegisterPrefixPayload,
        getResolver: factoryGetResolver,
        getRegistry: factoryGetRegistry,
        unitTestResolver: testResolve,
        unitTestRegistry: unitTestRegistry
    };
})();
