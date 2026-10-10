import axios from "axios";
import {
  EnturQuayDeparturesResponse,
  EnturStopPlaceQuaysResponse,
  GeocoderResponse,
  EstimatedCallType,
} from "./entur_types";

const GRAPHQL_ENDPOINT = "https://api.entur.io/journey-planner/v3/graphql";
const GEOCODER_ENDPOINT = "https://api.entur.io/geocoder/v1/autocomplete";
const CLIENT_NAME = "entur-info-screen";

export type QuayDepartures = {
  name: string;
  publicCode: string | null;
  departures: EstimatedCallType[];
};

export type StopSearchResult = {
  id: string;
  name: string;
  locality: string | null;
};

export type QuayOption = {
  id: string;
  publicCode: string | null;
  description: string | null;
  lines: string[];
};

async function graphql(query: string, variables: Record<string, unknown>) {
  const response = await axios.post(GRAPHQL_ENDPOINT, { query, variables }, {
    headers: {
      "ET-Client-Name": CLIENT_NAME,
    }
  });
  return response.data;
}

export async function getDeparturesForQuay(
    quayId: string,
    limit: number = 10,
): Promise<QuayDepartures | null> {
  const data = await graphql(`
    query($quayId: String!, $limit: Int!) {
      quay(id: $quayId) {
        name
        publicCode
        estimatedCalls(numberOfDepartures: $limit) {
          expectedArrivalTime
          aimedArrivalTime
          destinationDisplay {
            frontText
          }
          serviceJourney {
            journeyPattern {
              line {
                publicCode
              }
            }
          }
        }
      }
    }`, { quayId, limit });

  const parsed_response = EnturQuayDeparturesResponse.safeParse(data);

  if (!parsed_response.success) {
    console.error("Failed to parse response from Entur", parsed_response.error);
    return null;
  }

  const quay = parsed_response.data.data?.quay;
  if (!quay?.estimatedCalls) {
    return null;
  }

  return {
    name: quay.name,
    publicCode: quay.publicCode || null,
    departures: quay.estimatedCalls,
  };
}

export async function searchStops(text: string): Promise<StopSearchResult[]> {
  const response = await axios.get(GEOCODER_ENDPOINT, {
    params: { text, layers: "venue", size: 10 },
    headers: {
      "ET-Client-Name": CLIENT_NAME,
    }
  });

  const parsed_response = GeocoderResponse.safeParse(response.data);

  if (!parsed_response.success) {
    console.error("Failed to parse response from Entur geocoder", parsed_response.error);
    return [];
  }

  return parsed_response.data.features.map(feature => ({
    id: feature.properties.id,
    name: feature.properties.name,
    locality: feature.properties.locality ?? null,
  }));
}

export async function getQuaysForStopPlace(stopPlaceId: string): Promise<QuayOption[]> {
  const data = await graphql(`
    query($stopPlaceId: String!) {
      stopPlace(id: $stopPlaceId) {
        quays {
          id
          publicCode
          description
          estimatedCalls(numberOfDepartures: 20) {
            serviceJourney {
              journeyPattern {
                line {
                  publicCode
                }
              }
            }
          }
        }
      }
    }`, { stopPlaceId });

  const parsed_response = EnturStopPlaceQuaysResponse.safeParse(data);

  if (!parsed_response.success) {
    console.error("Failed to parse response from Entur", parsed_response.error);
    return [];
  }

  return (parsed_response.data.data?.stopPlace?.quays ?? [])
    .map(quay => ({
      id: quay.id,
      publicCode: quay.publicCode || null,
      description: quay.description || null,
      lines: [...new Set(quay.estimatedCalls
        .map(call => call.serviceJourney?.journeyPattern?.line?.publicCode)
        .filter((code): code is string => !!code))],
    }))
    .sort((a, b) => (a.publicCode ?? "").localeCompare(b.publicCode ?? "", "nb", { numeric: true }));
}
