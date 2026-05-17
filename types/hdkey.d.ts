declare module 'hdkey' {
    interface HDNode {
        privateKey: Buffer;
        publicKey: Buffer;
    }
    function fromMasterSeed(seed: Buffer): HDNode;
    function derive(path: string): HDNode;
}
