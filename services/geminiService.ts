import { GoogleGenAI } from "@google/genai";
import { Equipment, ServiceProvider, EquipmentStatus } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an intelligent analysis of the current inventory distribution.
 */
export const analyzeInventoryDistribution = async (
  equipment: Equipment[],
  providers: ServiceProvider[]
): Promise<string> => {
  try {
    // 1. Prepare data summary for the AI
    const summary = {
      totalEquipment: equipment.length,
      statusBreakdown: {
        available: equipment.filter((e) => e.status === EquipmentStatus.AVAILABLE).length,
        allocated: equipment.filter((e) => e.status === EquipmentStatus.ALLOCATED).length,
        installed: equipment.filter((e) => e.status === EquipmentStatus.INSTALLED).length,
      },
      providerStats: providers.map((p) => {
        const providerEq = equipment.filter((e) => e.providerId === p.id);
        return {
          name: p.name,
          totalAllocated: providerEq.length,
          installedCount: providerEq.filter((e) => e.status === EquipmentStatus.INSTALLED).length,
          idleCount: providerEq.filter((e) => e.status === EquipmentStatus.ALLOCATED).length,
        };
      }),
    };

    const prompt = `
      你是一个北斗导航设备系统的库存优化助手。
      请分析以下设备在各服务商之间分布的 JSON 摘要数据。
      
      数据:
      ${JSON.stringify(summary, null, 2)}

      请提供简明扼要的战略见解（最多3句话），重点关注：
      1. 哪个服务商的闲置库存过多（已分配但未安装）？
      2. 针对库存平衡或调拨的建议。
      3. 整体安装进度的健康状况。
      
      请保持语气专业、务实。请使用中文回答。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "暂时无法生成分析。";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI 分析服务当前不可用，请检查网络或 API Key。";
  }
};