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
    name: z.string(),
    publicCode: z.string().nullable(),
    estimatedCalls: z.array(EstimatedCall).nullable(),
});

const Data = z.object({
    quay: Quay.nullable(),
});

export const EnturQuayDeparturesResponse = z.object({
    data: Data.nullable(),
});

export const EnturStopPlaceQuaysResponse = z.object({
    data: z.object({
        stopPlace: z.object({
            quays: z.array(z.object({
                id: z.string(),
                publicCode: z.string().nullable(),
                description: z.string().nullable(),
                estimatedCalls: z.array(z.object({
                    serviceJourney: z.object({
                        journeyPattern: JourneyPattern.nullable(),
                    }).nullable(),
                })),
            }).nullable()).transform(quays => quays.filter(quay => quay !== null)),
        }).nullable(),
    }).nullable(),
});

export const GeocoderResponse = z.object({
    features: z.array(z.object({
        properties: z.object({
            id: z.string(),
            name: z.string(),
            locality: z.string().nullish(),
        }),
    })),
});

export type EstimatedCallType = z.infer<typeof EstimatedCall>;
