declare module 'node-nlp' {
    export class NlpManager {
        constructor(options: any);
        addDocument(language: string, utterance: string, intent: string): void;
        train(): Promise<void>;
        process(language: string, utterance: string): Promise<any>;
        // Add other methods and properties as needed
    }
}
