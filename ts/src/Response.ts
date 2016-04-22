import {Command} from './Command';
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
    responseType: ResponseType;
    
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

export type ResponseType = string; // "V" | 'I' | 'S' | 'A' | 'M';

export class ResponseTypes {
     /**
      * This is a returned when validation failed on a command (Filtering step). 
      */
    static ValidationError: ResponseType = 'V';
     /**
      * This is a returnd when an error has been raised by the execution of the command, in the command handler. (Execution step).
      */
    static InternalError: ResponseType ='I';
    /**
     * This is returned when the command has successfuly been executed in a synchronous-way, and a result is directly accessible by the client.
     */
    static Synchronous: ResponseType = 'S';
    /**
     * This is returned when the execution of the command has been deferred by the pipeline.
     */
    static Asynchronous: ResponseType = 'A';
    /**
     * This is returned for any meta command result.
     */
    static Meta: ResponseType = 'M'
}