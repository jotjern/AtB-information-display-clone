import { z } from "zod";

const DestinationDisplay = z.object({
    frontText: z.string().nullable(),
});

const Line = z.object({
    publicCode: z.string().nullable(),
});

const JourneyPattern = z.object({
    line: Line.nullable(),
});

const EstimatedCall = z.object({
    expectedArrivalTime: z.string().nullable(),
    aimedArrivalTime: z.string().nullable(),
    destinationDisplay: DestinationDisplay.nullable(),
    serviceJourney: z.object({
        journeyPattern: JourneyPattern.nullable(),
    }).nullable(),
});

const Quay = z.object({
    estimatedCalls: z.array(EstimatedCall).nullable(),
});

const Data = z.object({
    quay: Quay.nullable(),
});

export const EnturQuayDeparturesResponse = z.object({
    data: Data.nullable(),
});

export type EstimatedCallType = z.infer<typeof EstimatedCall>;
