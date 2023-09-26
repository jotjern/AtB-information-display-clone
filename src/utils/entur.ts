import axios from "axios";
import {EnturQuayDeparturesResponse, EstimatedCallType} from "./entur_types";

const GRAPHQL_ENDPOINT = "https://api.entur.io/journey-planner/v3/graphql";
const CLIENT_NAME = "entur-info-screen";

export async function getDeparturesForQuay(
    quayId: string,
    limit: number = 10,
): Promise<EstimatedCallType[] | null> {
  const response = await axios.post(GRAPHQL_ENDPOINT, {
    query: `
    {
      quay(id: "${quayId}") {
        estimatedCalls(numberOfDepartures: ${limit}) {
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
    }`
  }, {
    headers: {
      "ET-Client-Name": CLIENT_NAME,
    }
  });

  console.log(response.data);
  const parsed_response = EnturQuayDeparturesResponse.safeParse(response.data);

  if (!parsed_response.success) {
    console.error("Failed to parse response from Entur", parsed_response.error);
    return null;
  }

  return parsed_response.data.data?.quay?.estimatedCalls ?? null;
}