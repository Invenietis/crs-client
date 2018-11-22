import { assert, expect } from 'chai';
import { Command, readCommandName } from '../src/command/Command';

// class FakeRequestSender implements CommandRequestSender {
//     send(url: string, body: any, connectionId?: string) : Promise<CommandResponse<any>> {
//         throw new Error("Method not implemented.");
//     }
//     setConnectionIdPropertyName(queryString: string) {
//         throw new Error("Method not implemented.");
//     }
// }

describe("Test commands", () => {
    it("Command instance should have metadata", () => {
        const definedCommandName = 'TestCommand';
        @Command(definedCommandName)
        class TestCommand { }
        const cmd = new TestCommand();

        const resolvedCOmmandName = readCommandName(cmd);
        expect(resolvedCOmmandName).to.be.equal(definedCommandName);
    });
});
