import { ProductDeal, CampaignOutput, Persona } from "../types";
import { generateGirlMathCampaign } from "./geminiServiceGirlMath";
import { generateLeisureKingCampaign } from "./geminiServiceLeisureKing";

export const generateCampaign = async (
  deals: ProductDeal[],
  persona: Persona
): Promise<CampaignOutput> => {
  if (persona === 'leisureking') {
    return await generateLeisureKingCampaign(deals);
  } else {
    return await generateGirlMathCampaign(deals);
  }
};
