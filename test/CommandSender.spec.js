/// <reference path="../../typings/main.d.ts" />
var Response_1 = require('../src/Response');
var CommandEmitter_1 = require('../src/CommandEmitter');
var Command_1 = require('../src/Command');
var HubListener_1 = require('../src/listeners/HubListener');
var SignalRListener_1 = require('../src/listeners/SignalRListener');
var HttpListener_1 = require('../src/listeners/HttpListener');
var FakeHubConnection = (function () {
    function FakeHubConnection() {
        //(url?: string, queryString?: any, logging?: boolean): HubConnection;
        this.proxies = { 'default': {
                client: {
                    ReceiveCommandResponse: function (data) { }
                }
            } };
    }
    FakeHubConnection.prototype.result = function (data) {
        this.proxies.default.client.ReceiveCommandResponse(data);
    };
    return FakeHubConnection;
})();
describe("Command Emitter Send Tests", function () {
    var date = new Date();
    var httpListener = new HttpListener_1.HttpListener();
    var hub = new FakeHubConnection();
    var rTYpe = Response_1.ResponseTypes.Asynchronous;
    var metaProvider = {
        load: function () {
            return new Promise(function (resolve, reject) {
                resolve({
                    payload: {}
                });
            });
        }
    };
    var commandSender = new CommandEmitter_1.CommandEmitter('/c', {
        send: function (url, command) {
            return new Promise(function (resolve, reject) {
                // Simulate async request
                var data = {
                    commandName: command.name,
                    commandId: '1234',
                    payload: '3712',
                    responseType: rTYpe // Deferred 
                };
                var resp = new Response_1.CommandResponse(data, command);
                setTimeout(function () {
                    resolve(resp);
                    if (rTYpe == Response_1.ResponseTypes.Synchronous) {
                        setTimeout(function () {
                            httpListener.notify(resp);
                        }, 0);
                    }
                }, 1000);
            });
        }
    }, new HubListener_1.HubListener(httpListener, new SignalRListener_1.SignalRListener(hub, 'default')), metaProvider);
    it("Send a command should trigger an Xhr request to the server", function (done) {
        var command = new Command_1.Command('TransferAmount', {
            sourceAccountId: '7A8125D3-2BF9-45DE-A258-CE0D3C17892D',
            destinationAccountId: '37EC9EA1-2A13-4A4D-B55E-6C844D822DAC',
            amount: '500'
        });
        var promise = commandSender.emit(command);
        promise.then(function (response) {
            expect(response).toBeDefined();
            expect(response.payload).toBeDefined();
            expect(response.payload.effectiveDate).toBe(date);
            expect(response.commandId).toBe('1234');
            expect(response.responseType).toBe(Response_1.ResponseTypes.Synchronous);
            done();
        });
        setTimeout(function () {
            hub.result({
                payload: {
                    effectiveDate: date
                },
                commandId: '1234',
                responseType: Response_1.ResponseTypes.Synchronous
            });
        }, 1100);
    });
});

//# sourceMappingURL=CommandSender.spec.js.map
