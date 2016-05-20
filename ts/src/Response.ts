import {Command} from './Command';
export class CommandResponse {
    private static commands: {[commandId:string]: Command} = {};
    private static pendings: {[commandId:string]: { data:any,  created: (response: CommandResponse) => void } } = {};
    
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
            var pending = CommandResponse.pendings[data.commandId];
            
            if( pending ){
                delete CommandResponse.pendings[data.commandId];
                setTimeout(()=> {
                    pending.created(new CommandResponse(pending.data));
                });
            }
        } else{
            this.command = CommandResponse.commands[this.commandId];
        } 
        
        if(!this.command){
            throw `The command name cannot be resolved for the commandId ${this.commandId}`;
        }
    }
    
    static safeCreate(data: any, created: (response: CommandResponse) => void){
        var command = CommandResponse.commands[data.commandId];
        if(command){
            return created(new CommandResponse(data));
        }
        
        CommandResponse.pendings[data.commandId] = {
            data: data,
            created: created
        }; 
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