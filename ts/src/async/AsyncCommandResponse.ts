import { CommandResponse } from "../command";

export interface AsynchronousCommandReponse<T> extends CommandResponse<Promise<T>> {
}