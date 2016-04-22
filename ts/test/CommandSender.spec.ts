/// <reference path="../../typings/main.d.ts" />

import {CommandEmitter} from '../src/CommandEmitter';
import {Command} from '../src/Command';
import {CommandResponse} from '../src/Abstraction';
import {HubListener} from '../src/listeners/HubListener';
import {SignalRListener} from '../src/listeners/SignalRListener';
import {HttpListener} from '../src/listeners/HttpListener';

class FakeHubConnection  {
      //(url?: string, queryString?: any, logging?: boolean): HubConnection;
    proxies = {'default':{
        client: {
            ReceiveCommandResponse: function(data: any){}
        }
    }};
    
    result(data){
        this.proxies.default.client.ReceiveCommandResponse(data);
    }
}

describe("Command Emitter Send Tests", function() {
    var date = new Date();
    var httpListener = new HttpListener();
    var hub = new FakeHubConnection();
    var rTYpe = 1;
    var commandSender = new CommandEmitter('/c', {
        send(url: string, command: Command) {
            return new Promise<any>(function(resolve, reject){
                // Simulate async request
                var data = {
                        commandName: command.name,
                        commandId: '1234',
                        payload: '3712', 
                        responseType: rTYpe // Deferred 
                    };
                    
                var resp = new CommandResponse(data, command);
                setTimeout(() => { 
                    resolve(resp);
                   if(rTYpe == 0){
                       setTimeout(()=>{
                            httpListener.notify(resp);
                       },0);
                   }
                }, 1000);
            });
        }
    }, new HubListener(httpListener, new SignalRListener(<any>hub  , 'default')));
    
    it("Send a command should trigger an Xhr request to the server", function(done){
         var command = new Command ('TransferAmount', {
            sourceAccountId: '7A8125D3-2BF9-45DE-A258-CE0D3C17892D',
            destinationAccountId: '37EC9EA1-2A13-4A4D-B55E-6C844D822DAC',
            amount: '500'
        });
        
        var promise = commandSender.emit(command);
        promise.then(response => {
            expect(response).toBeDefined(); 
            expect(response.payload).toBeDefined();
            expect(response.payload.effectiveDate).toBe(date);
            expect(response.commandId).toBe('1234');
            expect(response.responseType).toBe(0);
            done();
        });
        setTimeout(() =>{
            hub.result({
                payload: {
                    effectiveDate: date
                },
                commandId: '1234',
                responseType: 0
            });
        }, 1100);
    });
});