/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(function($protobuf) {
    "use strict";

    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    $root.pb = (function() {
    
        /**
         * Namespace pb.
         * @exports pb
         * @namespace
         */
        var pb = {};
    
        pb.H5ShareButtonVisibility = (function() {
    
            /**
             * Properties of a H5ShareButtonVisibility.
             * @memberof pb
             * @interface IH5ShareButtonVisibility
             * @property {number|null} [version] H5ShareButtonVisibility version
             * @property {boolean|null} [showShareButton] H5ShareButtonVisibility showShareButton
             */
    
            /**
             * Constructs a new H5ShareButtonVisibility.
             * @memberof pb
             * @classdesc Represents a H5ShareButtonVisibility.
             * @implements IH5ShareButtonVisibility
             * @constructor
             * @param {pb.IH5ShareButtonVisibility=} [properties] Properties to set
             */
            function H5ShareButtonVisibility(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * H5ShareButtonVisibility version.
             * @member {number} version
             * @memberof pb.H5ShareButtonVisibility
             * @instance
             */
            H5ShareButtonVisibility.prototype.version = 0;
    
            /**
             * H5ShareButtonVisibility showShareButton.
             * @member {boolean} showShareButton
             * @memberof pb.H5ShareButtonVisibility
             * @instance
             */
            H5ShareButtonVisibility.prototype.showShareButton = false;
    
            /**
             * Creates a new H5ShareButtonVisibility instance using the specified properties.
             * @function create
             * @memberof pb.H5ShareButtonVisibility
             * @static
             * @param {pb.IH5ShareButtonVisibility=} [properties] Properties to set
             * @returns {pb.H5ShareButtonVisibility} H5ShareButtonVisibility instance
             */
            H5ShareButtonVisibility.create = function create(properties) {
                return new H5ShareButtonVisibility(properties);
            };
    
            /**
             * Encodes the specified H5ShareButtonVisibility message. Does not implicitly {@link pb.H5ShareButtonVisibility.verify|verify} messages.
             * @function encode
             * @memberof pb.H5ShareButtonVisibility
             * @static
             * @param {pb.IH5ShareButtonVisibility} message H5ShareButtonVisibility message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            H5ShareButtonVisibility.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.version);
                if (message.showShareButton != null && Object.hasOwnProperty.call(message, "showShareButton"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.showShareButton);
                return writer;
            };
    
            /**
             * Encodes the specified H5ShareButtonVisibility message, length delimited. Does not implicitly {@link pb.H5ShareButtonVisibility.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.H5ShareButtonVisibility
             * @static
             * @param {pb.IH5ShareButtonVisibility} message H5ShareButtonVisibility message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            H5ShareButtonVisibility.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a H5ShareButtonVisibility message from the specified reader or buffer.
             * @function decode
             * @memberof pb.H5ShareButtonVisibility
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.H5ShareButtonVisibility} H5ShareButtonVisibility
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            H5ShareButtonVisibility.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.H5ShareButtonVisibility();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.version = reader.uint32();
                            break;
                        }
                    case 2: {
                            message.showShareButton = reader.bool();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a H5ShareButtonVisibility message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.H5ShareButtonVisibility
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.H5ShareButtonVisibility} H5ShareButtonVisibility
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            H5ShareButtonVisibility.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a H5ShareButtonVisibility message.
             * @function verify
             * @memberof pb.H5ShareButtonVisibility
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            H5ShareButtonVisibility.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isInteger(message.version))
                        return "version: integer expected";
                if (message.showShareButton != null && message.hasOwnProperty("showShareButton"))
                    if (typeof message.showShareButton !== "boolean")
                        return "showShareButton: boolean expected";
                return null;
            };
    
            /**
             * Creates a H5ShareButtonVisibility message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.H5ShareButtonVisibility
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.H5ShareButtonVisibility} H5ShareButtonVisibility
             */
            H5ShareButtonVisibility.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.H5ShareButtonVisibility)
                    return object;
                var message = new $root.pb.H5ShareButtonVisibility();
                if (object.version != null)
                    message.version = object.version >>> 0;
                if (object.showShareButton != null)
                    message.showShareButton = Boolean(object.showShareButton);
                return message;
            };
    
            /**
             * Creates a plain object from a H5ShareButtonVisibility message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.H5ShareButtonVisibility
             * @static
             * @param {pb.H5ShareButtonVisibility} message H5ShareButtonVisibility
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            H5ShareButtonVisibility.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.version = 0;
                    object.showShareButton = false;
                }
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.showShareButton != null && message.hasOwnProperty("showShareButton"))
                    object.showShareButton = message.showShareButton;
                return object;
            };
    
            /**
             * Converts this H5ShareButtonVisibility to JSON.
             * @function toJSON
             * @memberof pb.H5ShareButtonVisibility
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            H5ShareButtonVisibility.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for H5ShareButtonVisibility
             * @function getTypeUrl
             * @memberof pb.H5ShareButtonVisibility
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            H5ShareButtonVisibility.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/pb.H5ShareButtonVisibility";
            };
    
            return H5ShareButtonVisibility;
        })();
    
        pb.H5ShareGenerateRequest = (function() {
    
            /**
             * Properties of a H5ShareGenerateRequest.
             * @memberof pb
             * @interface IH5ShareGenerateRequest
             * @property {string|null} [requestId] H5ShareGenerateRequest requestId
             */
    
            /**
             * Constructs a new H5ShareGenerateRequest.
             * @memberof pb
             * @classdesc Represents a H5ShareGenerateRequest.
             * @implements IH5ShareGenerateRequest
             * @constructor
             * @param {pb.IH5ShareGenerateRequest=} [properties] Properties to set
             */
            function H5ShareGenerateRequest(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * H5ShareGenerateRequest requestId.
             * @member {string} requestId
             * @memberof pb.H5ShareGenerateRequest
             * @instance
             */
            H5ShareGenerateRequest.prototype.requestId = "";
    
            /**
             * Creates a new H5ShareGenerateRequest instance using the specified properties.
             * @function create
             * @memberof pb.H5ShareGenerateRequest
             * @static
             * @param {pb.IH5ShareGenerateRequest=} [properties] Properties to set
             * @returns {pb.H5ShareGenerateRequest} H5ShareGenerateRequest instance
             */
            H5ShareGenerateRequest.create = function create(properties) {
                return new H5ShareGenerateRequest(properties);
            };
    
            /**
             * Encodes the specified H5ShareGenerateRequest message. Does not implicitly {@link pb.H5ShareGenerateRequest.verify|verify} messages.
             * @function encode
             * @memberof pb.H5ShareGenerateRequest
             * @static
             * @param {pb.IH5ShareGenerateRequest} message H5ShareGenerateRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            H5ShareGenerateRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.requestId != null && Object.hasOwnProperty.call(message, "requestId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.requestId);
                return writer;
            };
    
            /**
             * Encodes the specified H5ShareGenerateRequest message, length delimited. Does not implicitly {@link pb.H5ShareGenerateRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.H5ShareGenerateRequest
             * @static
             * @param {pb.IH5ShareGenerateRequest} message H5ShareGenerateRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            H5ShareGenerateRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a H5ShareGenerateRequest message from the specified reader or buffer.
             * @function decode
             * @memberof pb.H5ShareGenerateRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.H5ShareGenerateRequest} H5ShareGenerateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            H5ShareGenerateRequest.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.H5ShareGenerateRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.requestId = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a H5ShareGenerateRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.H5ShareGenerateRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.H5ShareGenerateRequest} H5ShareGenerateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            H5ShareGenerateRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a H5ShareGenerateRequest message.
             * @function verify
             * @memberof pb.H5ShareGenerateRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            H5ShareGenerateRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.requestId != null && message.hasOwnProperty("requestId"))
                    if (!$util.isString(message.requestId))
                        return "requestId: string expected";
                return null;
            };
    
            /**
             * Creates a H5ShareGenerateRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.H5ShareGenerateRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.H5ShareGenerateRequest} H5ShareGenerateRequest
             */
            H5ShareGenerateRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.H5ShareGenerateRequest)
                    return object;
                var message = new $root.pb.H5ShareGenerateRequest();
                if (object.requestId != null)
                    message.requestId = String(object.requestId);
                return message;
            };
    
            /**
             * Creates a plain object from a H5ShareGenerateRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.H5ShareGenerateRequest
             * @static
             * @param {pb.H5ShareGenerateRequest} message H5ShareGenerateRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            H5ShareGenerateRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.requestId = "";
                if (message.requestId != null && message.hasOwnProperty("requestId"))
                    object.requestId = message.requestId;
                return object;
            };
    
            /**
             * Converts this H5ShareGenerateRequest to JSON.
             * @function toJSON
             * @memberof pb.H5ShareGenerateRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            H5ShareGenerateRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for H5ShareGenerateRequest
             * @function getTypeUrl
             * @memberof pb.H5ShareGenerateRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            H5ShareGenerateRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/pb.H5ShareGenerateRequest";
            };
    
            return H5ShareGenerateRequest;
        })();
    
        pb.H5ShareGenerateResponse = (function() {
    
            /**
             * Properties of a H5ShareGenerateResponse.
             * @memberof pb
             * @interface IH5ShareGenerateResponse
             * @property {string|null} [requestId] H5ShareGenerateResponse requestId
             * @property {boolean|null} [ok] H5ShareGenerateResponse ok
             * @property {string|null} [imageUrl] H5ShareGenerateResponse imageUrl
             * @property {string|null} [shareUrl] H5ShareGenerateResponse shareUrl
             * @property {number|null} [width] H5ShareGenerateResponse width
             * @property {number|null} [height] H5ShareGenerateResponse height
             * @property {string|null} [errorCode] H5ShareGenerateResponse errorCode
             * @property {string|null} [errorMessage] H5ShareGenerateResponse errorMessage
             */
    
            /**
             * Constructs a new H5ShareGenerateResponse.
             * @memberof pb
             * @classdesc Represents a H5ShareGenerateResponse.
             * @implements IH5ShareGenerateResponse
             * @constructor
             * @param {pb.IH5ShareGenerateResponse=} [properties] Properties to set
             */
            function H5ShareGenerateResponse(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * H5ShareGenerateResponse requestId.
             * @member {string} requestId
             * @memberof pb.H5ShareGenerateResponse
             * @instance
             */
            H5ShareGenerateResponse.prototype.requestId = "";
    
            /**
             * H5ShareGenerateResponse ok.
             * @member {boolean} ok
             * @memberof pb.H5ShareGenerateResponse
             * @instance
             */
            H5ShareGenerateResponse.prototype.ok = false;
    
            /**
             * H5ShareGenerateResponse imageUrl.
             * @member {string} imageUrl
             * @memberof pb.H5ShareGenerateResponse
             * @instance
             */
            H5ShareGenerateResponse.prototype.imageUrl = "";
    
            /**
             * H5ShareGenerateResponse shareUrl.
             * @member {string} shareUrl
             * @memberof pb.H5ShareGenerateResponse
             * @instance
             */
            H5ShareGenerateResponse.prototype.shareUrl = "";
    
            /**
             * H5ShareGenerateResponse width.
             * @member {number} width
             * @memberof pb.H5ShareGenerateResponse
             * @instance
             */
            H5ShareGenerateResponse.prototype.width = 0;
    
            /**
             * H5ShareGenerateResponse height.
             * @member {number} height
             * @memberof pb.H5ShareGenerateResponse
             * @instance
             */
            H5ShareGenerateResponse.prototype.height = 0;
    
            /**
             * H5ShareGenerateResponse errorCode.
             * @member {string} errorCode
             * @memberof pb.H5ShareGenerateResponse
             * @instance
             */
            H5ShareGenerateResponse.prototype.errorCode = "";
    
            /**
             * H5ShareGenerateResponse errorMessage.
             * @member {string} errorMessage
             * @memberof pb.H5ShareGenerateResponse
             * @instance
             */
            H5ShareGenerateResponse.prototype.errorMessage = "";
    
            /**
             * Creates a new H5ShareGenerateResponse instance using the specified properties.
             * @function create
             * @memberof pb.H5ShareGenerateResponse
             * @static
             * @param {pb.IH5ShareGenerateResponse=} [properties] Properties to set
             * @returns {pb.H5ShareGenerateResponse} H5ShareGenerateResponse instance
             */
            H5ShareGenerateResponse.create = function create(properties) {
                return new H5ShareGenerateResponse(properties);
            };
    
            /**
             * Encodes the specified H5ShareGenerateResponse message. Does not implicitly {@link pb.H5ShareGenerateResponse.verify|verify} messages.
             * @function encode
             * @memberof pb.H5ShareGenerateResponse
             * @static
             * @param {pb.IH5ShareGenerateResponse} message H5ShareGenerateResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            H5ShareGenerateResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.requestId != null && Object.hasOwnProperty.call(message, "requestId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.requestId);
                if (message.ok != null && Object.hasOwnProperty.call(message, "ok"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.ok);
                if (message.imageUrl != null && Object.hasOwnProperty.call(message, "imageUrl"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.imageUrl);
                if (message.shareUrl != null && Object.hasOwnProperty.call(message, "shareUrl"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.shareUrl);
                if (message.width != null && Object.hasOwnProperty.call(message, "width"))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.width);
                if (message.height != null && Object.hasOwnProperty.call(message, "height"))
                    writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.height);
                if (message.errorCode != null && Object.hasOwnProperty.call(message, "errorCode"))
                    writer.uint32(/* id 7, wireType 2 =*/58).string(message.errorCode);
                if (message.errorMessage != null && Object.hasOwnProperty.call(message, "errorMessage"))
                    writer.uint32(/* id 8, wireType 2 =*/66).string(message.errorMessage);
                return writer;
            };
    
            /**
             * Encodes the specified H5ShareGenerateResponse message, length delimited. Does not implicitly {@link pb.H5ShareGenerateResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.H5ShareGenerateResponse
             * @static
             * @param {pb.IH5ShareGenerateResponse} message H5ShareGenerateResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            H5ShareGenerateResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a H5ShareGenerateResponse message from the specified reader or buffer.
             * @function decode
             * @memberof pb.H5ShareGenerateResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.H5ShareGenerateResponse} H5ShareGenerateResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            H5ShareGenerateResponse.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.H5ShareGenerateResponse();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.requestId = reader.string();
                            break;
                        }
                    case 2: {
                            message.ok = reader.bool();
                            break;
                        }
                    case 3: {
                            message.imageUrl = reader.string();
                            break;
                        }
                    case 4: {
                            message.shareUrl = reader.string();
                            break;
                        }
                    case 5: {
                            message.width = reader.uint32();
                            break;
                        }
                    case 6: {
                            message.height = reader.uint32();
                            break;
                        }
                    case 7: {
                            message.errorCode = reader.string();
                            break;
                        }
                    case 8: {
                            message.errorMessage = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a H5ShareGenerateResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.H5ShareGenerateResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.H5ShareGenerateResponse} H5ShareGenerateResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            H5ShareGenerateResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a H5ShareGenerateResponse message.
             * @function verify
             * @memberof pb.H5ShareGenerateResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            H5ShareGenerateResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.requestId != null && message.hasOwnProperty("requestId"))
                    if (!$util.isString(message.requestId))
                        return "requestId: string expected";
                if (message.ok != null && message.hasOwnProperty("ok"))
                    if (typeof message.ok !== "boolean")
                        return "ok: boolean expected";
                if (message.imageUrl != null && message.hasOwnProperty("imageUrl"))
                    if (!$util.isString(message.imageUrl))
                        return "imageUrl: string expected";
                if (message.shareUrl != null && message.hasOwnProperty("shareUrl"))
                    if (!$util.isString(message.shareUrl))
                        return "shareUrl: string expected";
                if (message.width != null && message.hasOwnProperty("width"))
                    if (!$util.isInteger(message.width))
                        return "width: integer expected";
                if (message.height != null && message.hasOwnProperty("height"))
                    if (!$util.isInteger(message.height))
                        return "height: integer expected";
                if (message.errorCode != null && message.hasOwnProperty("errorCode"))
                    if (!$util.isString(message.errorCode))
                        return "errorCode: string expected";
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    if (!$util.isString(message.errorMessage))
                        return "errorMessage: string expected";
                return null;
            };
    
            /**
             * Creates a H5ShareGenerateResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.H5ShareGenerateResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.H5ShareGenerateResponse} H5ShareGenerateResponse
             */
            H5ShareGenerateResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.H5ShareGenerateResponse)
                    return object;
                var message = new $root.pb.H5ShareGenerateResponse();
                if (object.requestId != null)
                    message.requestId = String(object.requestId);
                if (object.ok != null)
                    message.ok = Boolean(object.ok);
                if (object.imageUrl != null)
                    message.imageUrl = String(object.imageUrl);
                if (object.shareUrl != null)
                    message.shareUrl = String(object.shareUrl);
                if (object.width != null)
                    message.width = object.width >>> 0;
                if (object.height != null)
                    message.height = object.height >>> 0;
                if (object.errorCode != null)
                    message.errorCode = String(object.errorCode);
                if (object.errorMessage != null)
                    message.errorMessage = String(object.errorMessage);
                return message;
            };
    
            /**
             * Creates a plain object from a H5ShareGenerateResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.H5ShareGenerateResponse
             * @static
             * @param {pb.H5ShareGenerateResponse} message H5ShareGenerateResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            H5ShareGenerateResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.requestId = "";
                    object.ok = false;
                    object.imageUrl = "";
                    object.shareUrl = "";
                    object.width = 0;
                    object.height = 0;
                    object.errorCode = "";
                    object.errorMessage = "";
                }
                if (message.requestId != null && message.hasOwnProperty("requestId"))
                    object.requestId = message.requestId;
                if (message.ok != null && message.hasOwnProperty("ok"))
                    object.ok = message.ok;
                if (message.imageUrl != null && message.hasOwnProperty("imageUrl"))
                    object.imageUrl = message.imageUrl;
                if (message.shareUrl != null && message.hasOwnProperty("shareUrl"))
                    object.shareUrl = message.shareUrl;
                if (message.width != null && message.hasOwnProperty("width"))
                    object.width = message.width;
                if (message.height != null && message.hasOwnProperty("height"))
                    object.height = message.height;
                if (message.errorCode != null && message.hasOwnProperty("errorCode"))
                    object.errorCode = message.errorCode;
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    object.errorMessage = message.errorMessage;
                return object;
            };
    
            /**
             * Converts this H5ShareGenerateResponse to JSON.
             * @function toJSON
             * @memberof pb.H5ShareGenerateResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            H5ShareGenerateResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for H5ShareGenerateResponse
             * @function getTypeUrl
             * @memberof pb.H5ShareGenerateResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            H5ShareGenerateResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/pb.H5ShareGenerateResponse";
            };
    
            return H5ShareGenerateResponse;
        })();
    
        return pb;
    })();

    return $root;
})(protobuf);
