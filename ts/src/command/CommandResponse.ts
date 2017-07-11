export interface CommandResponse {
    requestId: string;
    responseType: ResponseType;
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