import { Command } from "./Command";

export class CommandResponse {
    private static commands: {[commandId:string]: Command} = {};
    
    command: Command;
    
    /**
    * The identifier of the command. 
    */
    commandId: string;
    /**
    * The payload of the result. *
    */
    payload: any;
    
    /**
     * Type of the response
     */
    responseType: Number;
    
    constructor(data: any);
    constructor(data: any, command: Command);
    constructor(data: any, command?: Command){
        this.responseType = data.responseType;
        this.payload = data.payload;
        this.commandId = data.commandId;
        
        if(command){
            CommandResponse.commands[this.commandId] = command;
            this.command = command;
        } else{
            this.command = CommandResponse.commands[this.commandId];
        }
        
        if(!this.command){
            throw `The command name cannot be resolved for the commandId ${this.commandId}`;
        }
    }
}

/**
 * The CommandEmitter is responsible to send command to the remote server
 */
export interface ICommandEmitter {
    /**
     * The base uri for the command requests
     */
    uriBase: string,
    /**
     * Send the command to the server
     * @param The command to send
     */
    emit(command: Command): Promise<CommandResponse>;
}

/**
 * Allow you to register for the command responses
 */
export interface ICommandResponseListener {
    callbackId: string;
    
    /**
     * register a response listener for the specified command execution
     * @param commandId The commandId of the command   
     */
    on(commandName: string, commandId: string, callback: (response: CommandResponse) => void);
    
    /**
     * Register a response listener for all specified command exections
     */
    on(commandName: string, callback: (response: CommandResponse) => void);
    
    /**
     * remove a response listener previously added with on method
     */
    off(commandName: string, callback: (response: CommandResponse) => void);
    off(commandName: string, commandId: string, callback: (response: CommandResponse) => void);
}

export interface ICommandRequestSender {
    send: (endpoint: string, command: Command) => Promise<any>;
}