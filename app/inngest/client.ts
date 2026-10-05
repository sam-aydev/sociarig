import { Inngest } from "inngest";

type ContentGenerationEvent = {
  data: {
    generationId: string;
    inputMode: "url" | "idea";
    inputValue: string;
    voiceId: string;
    platforms: string[]; 
  };
};

type VoiceProcessEvent = {
  data: {
    documentId: string;
    rawContent: string;
  };
};

export const inngest = new Inngest({
  id: "sociarig",
  schemas: {
    events: {
      "app/generate.content": {} as ContentGenerationEvent,
      "app/voice.process": {} as VoiceProcessEvent,
    },
  },
});