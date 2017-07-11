const CommandMetadataSym = Symbol('CommandMetadata');
interface CommandMetadata {
    name: string;
    events: string[];
}

export function Command(name: string, ...events: string[]) {
    return function(target: any) {
        target[CommandMetadataSym] = {name, events};
        return target;
    }
}

function readMetadata(command: Object): CommandMetadata {
    const meta = command.constructor[CommandMetadataSym];
    if (!meta) {
        throw new Error('Could not read the command metadata. The decorator is probably missing');
    }

    return meta;
}

export function readCommandName(command: Object): string {
    const meta = readMetadata(command);
    return meta.name;
}

export function readCommandEvents<T extends Object>(command: Object): string[] {
    const meta = readMetadata(command);
    return meta.events;
}
